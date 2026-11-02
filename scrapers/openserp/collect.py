"""Local OpenSERP search, conservative contact collection, and durable evidence.

Uses Python's standard library only. CSV presentation is handled by export.mjs.
No imported company data or application profile is modified.
"""
import argparse
import hashlib
import html
import ipaddress
import json
import re
import socket
import sqlite3
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlencode, urljoin, urlparse
from urllib.robotparser import RobotFileParser

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'scrapers/outputs/openserp'
INPUT = ROOT / 'src/lib/facilities.json'
MISSING = 'Not Available'
API = 'http://127.0.0.1:7071'
GENERIC = {'pharmacy', 'pharmacies', 'chemist', 'chemists', 'pharmaceuticals', 'pharmaceutical', 'pharma', 'limited', 'ltd', 'company', 'kenya'}
EXCLUDED = ('google.com', 'facebook.com', 'instagram.com', 'linkedin.com', 'youtube.com', 'twitter.com', 'x.com', 'businesslist.co.ke', 'yellowpageskenya.com')


def now():
    return datetime.now(timezone.utc).isoformat(timespec='seconds')


def words(text):
    return re.findall(r'[a-z0-9]+', str(text).lower())


def distinctive(record):
    return {word for word in set(words(record['Facility Name'])) - GENERIC - set(words(record.get('County', ''))) if len(word) > 1}


def query_for(record):
    return ' '.join(filter(None, [record['Facility Name'], record.get('County'), 'Kenya', 'contact']))


def key_for(record):
    return f'{record["Business Type"].lower()}-{record["Facility ID"]}'


def connect(output=OUT):
    output.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(output / 'jobs.sqlite')
    db.execute('CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, original TEXT NOT NULL, status TEXT NOT NULL, result TEXT, checked_at TEXT, query TEXT, error TEXT)')
    db.execute('CREATE TABLE IF NOT EXISTS attempts (id INTEGER PRIMARY KEY, company_id TEXT NOT NULL, stage TEXT NOT NULL, status TEXT NOT NULL, checked_at TEXT NOT NULL, source_url TEXT, payload TEXT, error TEXT)')
    db.execute('CREATE TABLE IF NOT EXISTS state (key TEXT PRIMARY KEY, value TEXT)')
    records = json.loads(INPUT.read_text(encoding='utf-8'))
    for record in records:
        db.execute('INSERT OR IGNORE INTO companies(id,original,status) VALUES(?,?,?)', (key_for(record), json.dumps(record), 'not_searched'))
    db.commit()
    return db


def record_attempt(db, company_id, stage, status, source_url, payload, error='', checked=None):
    checked = checked or now()
    db.execute('INSERT INTO attempts(company_id,stage,status,checked_at,source_url,payload,error) VALUES(?,?,?,?,?,?,?)', (company_id, stage, status, checked, source_url, json.dumps(payload), error))
    db.commit()
    return checked


def classify_response(status, payload):
    if not isinstance(payload, dict):
        return 'parse_failed', 'OpenSERP response is not a JSON object'
    if status == 429 or str(payload.get('error', '')).lower() in {'blocked', 'captcha', 'rate_limited'}:
        return 'blocked', payload.get('message') or 'Google blocked the search'
    if status >= 400:
        return 'failed', payload.get('message') or f'OpenSERP HTTP {status}'
    if not isinstance(payload.get('results'), list):
        return 'parse_failed', 'OpenSERP response has no results array'
    if payload.get('meta', {}).get('engines_failed'):
        return 'failed', json.dumps(payload['meta'].get('engine_errors', []))
    if any(r.get('engine') != 'google' for r in payload['results']):
        return 'parse_failed', 'A result came from an unexpected search engine'
    return ('completed' if payload['results'] else 'not_found'), ''


def search(query):
    params = {'text': query, 'region': 'KE', 'lang': 'EN', 'limit': 5, 'features': 'true', 'resolve_urls': 'true'}
    url = API + '/google/search?' + urlencode(params)
    try:
        with urllib.request.urlopen(url, timeout=65) as response:
            return response.status, json.loads(response.read(5_000_000)), url
    except urllib.error.HTTPError as exc:
        body = exc.read(1_000_000)
        try:
            payload = json.loads(body)
        except (ValueError, UnicodeDecodeError):
            payload = {'error': 'invalid_response', 'message': body.decode(errors='replace')[:300]}
        return exc.code, payload, url


def public_url(url):
    parsed = urlparse(url)
    if parsed.scheme not in {'http', 'https'} or not parsed.hostname or parsed.username or parsed.password:
        return False
    try:
        return all(ipaddress.ip_address(address[4][0]).is_global for address in socket.getaddrinfo(parsed.hostname, parsed.port or (443 if parsed.scheme == 'https' else 80)))
    except (OSError, ValueError):
        return False


class PublicRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, headers, target):
        if not public_url(target):
            raise ValueError('Redirect to a non-public URL was refused')
        return super().redirect_request(request, fp, code, message, headers, target)


def get_page(url):
    if not public_url(url):
        raise ValueError('Invalid or non-public website URL')
    request = urllib.request.Request(url, headers={'User-Agent': 'InfoxemResearch/1.0', 'Accept': 'text/html,text/plain'})
    with urllib.request.build_opener(PublicRedirect()).open(request, timeout=20) as response:
        body = response.read(2_000_001)
        if len(body) > 2_000_000:
            raise ValueError('Website response exceeded 2 MB')
        return response.url, body.decode(response.headers.get_content_charset() or 'utf-8', errors='replace')


class Page(HTMLParser):
    def __init__(self, body):
        super().__init__(convert_charrefs=True)
        self.text, self.links, self.schemas, self.addresses = [], [], [], []
        self.skip = 0
        self.in_schema = False
        self.schema = []
        self.in_address = False
        self.feed(body)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag in {'script', 'style'}:
            self.skip += 1
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.in_schema = True
            self.schema = []
        if tag == 'address':
            self.in_address = True
        if tag == 'a' and attrs.get('href'):
            self.links.append(attrs['href'])

    def handle_endtag(self, tag):
        if tag == 'script' and self.in_schema:
            try:
                self.schemas.append(json.loads(''.join(self.schema)))
            except ValueError:
                pass
            self.in_schema = False
        if tag in {'script', 'style'}:
            self.skip = max(0, self.skip - 1)
        if tag == 'address':
            self.in_address = False

    def handle_data(self, value):
        if self.in_schema:
            self.schema.append(value)
        if not self.skip:
            self.text.append(value)
            if self.in_address:
                self.addresses.append(value)


def schema_contacts(item):
    output = []
    if isinstance(item, list):
        for child in item:
            output.extend(schema_contacts(child))
    elif isinstance(item, dict):
        for field in ('email', 'telephone', 'address'):
            value = item.get(field)
            if isinstance(value, str) and value.strip():
                output.append(({'telephone': 'phone', 'address': 'location'}.get(field, field), value.strip()))
            elif field == 'address' and isinstance(value, dict):
                parts = [value.get(k) for k in ('streetAddress', 'addressLocality', 'addressRegion', 'postalCode', 'addressCountry')]
                address = ', '.join(str(v) for v in parts if isinstance(v, (str, int)))
                if address:
                    output.append(('location', address))
        for key, value in item.items():
            if key != 'address' and isinstance(value, (dict, list)):
                output.extend(schema_contacts(value))
    return output


def extract_contacts(page):
    contacts = set(schema_contacts(page.schemas))
    text = ' '.join(page.text)
    for value in re.findall(r'[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}', text, re.I):
        contacts.add(('email', value))
    for link in page.links:
        if link.lower().startswith('mailto:'):
            contacts.add(('email', link[7:].split('?')[0]))
        elif link.lower().startswith('tel:'):
            contacts.add(('phone', link[4:]))
    if page.addresses:
        contacts.add(('location', re.sub(r'\s+', ' ', ' '.join(page.addresses)).strip()))
    return sorted((field, value) for field, value in contacts if value and (field != 'phone' or 7 <= len(re.sub(r'\D', '', value)) <= 15) and (field != 'email' or re.fullmatch(r'[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}', value, re.I)))


def assess(record, title, text, url):
    name_words = distinctive(record)
    content_words = set(words(title + ' ' + text))
    matched = name_words & content_words
    name_ok = bool(name_words) and len(matched) / len(name_words) >= 0.8
    host = (urlparse(url).hostname or '').lower()
    directory = any(host == domain or host.endswith('.' + domain) for domain in EXCLUDED)
    domain_ok = any(len(word) >= 4 and word in host for word in name_words)
    county = ' '.join(words(record.get('County', '')))
    county_ok = bool(county) and county in ' '.join(words(text))
    if name_ok and domain_ok and county_ok and not directory:
        return 'candidate_company_site', 'Business name, domain and county agree; exact branch still requires review'
    return 'needs_review', 'Official website or branch identity is not sufficiently supported'


def crawl(record, result, output):
    url = result.get('url', '')
    host = (urlparse(url).hostname or '').lower()
    name_words = distinctive(record)
    if not any(len(word) >= 4 and word in host for word in name_words) or any(host == d or host.endswith('.' + d) for d in EXCLUDED):
        return [], [], 'needs_review'
    observations, errors = [], []
    robots = RobotFileParser()
    try:
        _, body = get_page(urljoin(url, '/robots.txt'))
        robots.parse(body.splitlines())
    except urllib.error.HTTPError as exc:
        if exc.code != 404:
            return [], [{'url': url, 'error': f'robots_http_{exc.code}'}], 'needs_review'
        robots.parse([])
    except Exception as exc:
        return [], [{'url': url, 'error': f'robots_unavailable: {type(exc).__name__}'}], 'needs_review'
    queue, visited, site_status = [url], set(), 'needs_review'
    while queue and len(visited) < 3:
        target = queue.pop(0)
        if target in visited:
            continue
        visited.add(target)
        if not robots.can_fetch('InfoxemResearch', target):
            errors.append({'url': target, 'error': 'robots_disallowed'})
            continue
        try:
            delay = robots.crawl_delay('InfoxemResearch') or 2
            if delay > 60:
                raise ValueError('Declared crawl delay exceeds this bounded collection job')
            time.sleep(max(2, delay))
            final, body = get_page(target)
            if (urlparse(final).hostname or '').removeprefix('www.') != host.removeprefix('www.'):
                raise ValueError('Cross-domain redirect requires review')
            page = Page(body)
            text = ' '.join(page.text)
            status, reason = assess(record, result.get('title', ''), text, final)
            if status == 'candidate_company_site':
                site_status = status
            checked = now()
            digest = hashlib.sha256(final.encode()).hexdigest()[:20]
            (output / 'raw').mkdir(exist_ok=True)
            (output / 'raw' / f'website-{digest}.html').write_text(body, encoding='utf-8')
            observations.append({'field': 'website', 'value': final, 'source_url': final, 'collected_at_utc': checked, 'match_status': status, 'scope': 'company_website_branch_unverified', 'reason': reason})
            for field, value in extract_contacts(page):
                observations.append({'field': field, 'value': value, 'source_url': final, 'collected_at_utc': checked, 'match_status': status, 'scope': 'website_contact_branch_unverified', 'reason': reason})
            for link in page.links:
                linked = urljoin(final, html.unescape(link)).split('#')[0]
                if (urlparse(linked).hostname or '').removeprefix('www.') == host.removeprefix('www.') and re.search(r'contact|about|branch|location', linked, re.I):
                    queue.append(linked)
        except Exception as exc:
            errors.append({'url': target, 'error': f'{type(exc).__name__}: {str(exc)[:250]}'})
    return observations, errors, site_status


def export_tables(db, output=OUT):
    companies, candidates, observations, failures = [], [], [], []
    counts = {}
    for key, source, status, body, checked, query, error in db.execute('SELECT * FROM companies ORDER BY rowid'):
        record, result = json.loads(source), json.loads(body or '{}')
        counts[status] = counts.get(status, 0) + 1
        existing_location = ', '.join(filter(None, [record.get('Street'), record.get('County'), 'Kenya']))
        row = {'infoxem_id': key, **record, 'country': 'Kenya', 'existing_location': existing_location, 'search_status': status, 'collection_mode': result.get('collection_mode', ''), 'search_query': query or '', 'search_source_url': result.get('google_url', ''), 'collected_at_utc': checked or '', 'error': error or '', 'profile_updated': 'No'}
        history = result.get('query_history', [])
        row.update(query_count=len(history) if history else (1 if query else 0), search_queries='; '.join(h['query'] for h in history) or query or '', search_source_urls='; '.join(h['source_url'] for h in history) or result.get('google_url', ''), matching_policy=result.get('matching_policy', ''), review_note=result.get('review_note', ''))
        eligible = [o for o in result.get('observations', []) if o['match_status'] in {'candidate_company_site', 'candidate_branch_listing'}]
        for field in ('website', 'email', 'phone', 'location'):
            pending = [o for o in result.get('observations', []) if o['field'] == field and o['match_status'] == 'needs_review']
            row['unreviewed_' + field] = '; '.join(sorted({o['value'] for o in pending})) or MISSING
            row['unreviewed_' + field + '_source_urls'] = '; '.join(sorted({o['source_url'] for o in pending}))
        for field in ('website', 'email', 'phone', 'location'):
            found = [o for o in eligible if o['field'] == field]
            row[field] = '; '.join(sorted({o['value'] for o in found})) or MISSING
            row[field + '_source_urls'] = '; '.join(sorted({o['source_url'] for o in found}))
            row[field + '_status'] = 'needs_review' if found else 'not_searched' if status == 'not_searched' else 'search_failed' if status in {'blocked', 'failed', 'parse_failed'} else 'collection_failed' if result.get('website_errors') else 'not_found' if result.get('observations') or status == 'not_found' else 'not_verified'
        # Keep usable imported locations rather than replacing them with missing
        # enrichment. Newly collected alternatives remain separate suggestions.
        row['proposed_location'] = row['location']
        row['proposed_location_status'] = row['location_status']
        row['proposed_location_source_urls'] = row['location_source_urls']
        row['location'] = existing_location
        row['location_status'] = 'existing_import'
        row['location_source_urls'] = ''
        row['location_source'] = record.get('Source file') or 'Infoxem imported facility record'
        row['location_precision'] = 'street_and_county' if record.get('Street') and record.get('County') else 'street' if record.get('Street') else 'county' if record.get('County') else 'country_only'
        row['contact_scope'] = ('Matched branch listing; phone not called' if all(o['match_status'] == 'candidate_branch_listing' for o in eligible) else 'Company contacts; exact branch unverified') if eligible else 'Not Available'
        companies.append(row)
        for candidate in result.get('results', []):
            candidates.append({'infoxem_id': key, 'collected_at_utc': checked, 'google_source_url': result.get('google_url', ''), **candidate, 'raw_result_json': json.dumps(candidate, ensure_ascii=False)})
        for feature in result.get('serp_features', []):
            candidates.append({'infoxem_id': key, 'collected_at_utc': checked, 'google_source_url': result.get('google_url', ''), 'result_kind': 'serp_feature', **feature, 'match_status': 'needs_review', 'raw_result_json': json.dumps(feature, ensure_ascii=False)})
        for observation in result.get('observations', []):
            observations.append({'infoxem_id': key, **observation})
    for attempt_id, key, stage, status, checked, source_url, body, error in db.execute('SELECT * FROM attempts WHERE error != "" ORDER BY id'):
        failures.append({'attempt_id': attempt_id, 'infoxem_id': key, 'stage': stage, 'status': status, 'collected_at_utc': checked, 'source_url': source_url, 'error': error, 'raw_response_json': body})
    tables = {'companies': companies, 'candidates': candidates, 'observations': observations, 'failures': failures}
    (output / 'tables.json').write_text(json.dumps(tables, ensure_ascii=False, indent=2), encoding='utf-8')
    summary = {'exported_at_utc': now(), 'engine': 'OpenSERP / Google', 'total_companies': len(companies), 'statuses': counts, 'candidate_rows': len(candidates), 'contact_observations': len(observations), 'failure_rows': len(failures), 'input_sha256': hashlib.sha256(INPUT.read_bytes()).hexdigest(), 'halt_reason': (db.execute('SELECT value FROM state WHERE key="halt"').fetchone() or [''])[0]}
    (output / 'summary.json').write_text(json.dumps(summary, indent=2), encoding='utf-8')
    print(json.dumps(summary), flush=True)
    return tables


def save_job(db, key, query, result, status, error, source_url, output, checked=None, stage='google_search'):
    checked = record_attempt(db, key, stage, status, source_url, result, error, checked)
    result['google_url'] = 'https://www.google.com/search?' + urlencode({'q': query, 'gl': 'ke', 'hl': 'en'})
    db.execute('UPDATE companies SET status=?,result=?,checked_at=?,query=?,error=? WHERE id=?', (status, json.dumps(result), checked, query, error, key))
    if status in {'blocked', 'failed', 'parse_failed'}:
        db.execute('INSERT OR REPLACE INTO state VALUES(?,?)', ('halt', f'{status}: {error}'))
    db.commit()
    (output / 'raw').mkdir(exist_ok=True)
    stamp = checked.replace(':', '').replace('+', '_')
    (output / 'raw' / f'{key}-{stamp}.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--limit', type=int, default=10)
    parser.add_argument('--interval', type=int, default=25)
    parser.add_argument('--export-only', action='store_true')
    parser.add_argument('--retry-blocked', action='store_true', help='Only use after source access has changed')
    parser.add_argument('--import-probe', type=Path)
    args = parser.parse_args()
    db = connect()
    try:
        if args.import_probe:
            probe = json.loads(args.import_probe.read_text(encoding='utf-8'))
            # The live preflight deliberately used this imported facility.
            key = 'wholesale-3311'
            if not db.execute('SELECT 1 FROM attempts WHERE company_id=? AND checked_at=?', (key, probe['collected_at'])).fetchone():
                status, error = classify_response(probe['http_status'], probe['body'])
                save_job(db, key, probe['query'], probe['body'], status, error, API + '/google/search', OUT, probe['collected_at'])
        if args.export_only:
            return
        if args.retry_blocked:
            db.execute('DELETE FROM state WHERE key="halt"')
            db.execute('UPDATE companies SET status="not_searched" WHERE status IN ("blocked","failed","parse_failed")')
            db.commit()
        if db.execute('SELECT 1 FROM state WHERE key="halt"').fetchone():
            print('Source remains halted. Exporting saved evidence without repeating blocked requests.', flush=True)
            return
        pending = db.execute('SELECT id,original FROM companies WHERE status="not_searched" ORDER BY CASE WHEN id="wholesale-3311" THEN 0 ELSE 1 END,rowid LIMIT ?', (max(0, args.limit),)).fetchall()
        for index, (key, original) in enumerate(pending):
            record = json.loads(original)
            query = query_for(record)
            print(f'{index+1}/{len(pending)} {key}: {query}', flush=True)
            result, url = {}, API + '/google/search'
            try:
                http_status, result, url = search(query)
                if not isinstance(result, dict):
                    result = {'malformed_payload': result}
                status, error = classify_response(http_status, result)
                result['observations'], result['website_errors'] = [], []
                if status == 'completed':
                    for candidate in result['results']:
                        if candidate.get('type') != 'organic':
                            continue
                        found, errors, match_status = crawl(record, candidate, OUT)
                        candidate['match_status'] = match_status
                        result['observations'].extend(found)
                        result['website_errors'].extend(errors)
                        for failure in errors:
                            record_attempt(db, key, 'company_website', 'failed', failure['url'], failure, failure['error'])
            except Exception as exc:
                status, error = 'failed', f'{type(exc).__name__}: {str(exc)[:400]}'
            save_job(db, key, query, result, status, error, url, OUT)
            print(f'{status}: {len(result.get("results", []))} search results, {len(result.get("observations", []))} website observations', flush=True)
            if status in {'blocked', 'failed', 'parse_failed'}:
                break
            if index + 1 < len(pending):
                time.sleep(max(20, args.interval))
    finally:
        export_tables(db)
        db.close()


if __name__ == '__main__':
    main()
