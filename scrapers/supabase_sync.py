"""Upload saved company data; never starts searches or changes source databases."""
import argparse
from contextlib import closing
import email.utils
import hashlib
import json
import os
import re
import shutil
import sqlite3
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse, urlunparse
from openserp.collect import branch_supported
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'scrapers/outputs/supabase'
SOURCE = ROOT / 'src/lib/facilities.json'
DATABASES = [('openserp', ROOT / 'scrapers/outputs/openserp/jobs.sqlite', 'companies'),
             ('scrapy', ROOT / 'scrapers/outputs/scrapy/jobs.sqlite', 'jobs')]
FIELDS = {'phone', 'email', 'website', 'address', 'location'}


def now():
    return datetime.now(timezone.utc).isoformat()


def load_environment():
    for path in [ROOT / '.env.local', ROOT / 'scrapers/.env.local']:
        if path.exists():
            for line in path.read_text(encoding='utf-8-sig').splitlines():
                if '=' in line and not line.lstrip().startswith('#'):
                    key, value = line.split('=', 1)
                    os.environ.setdefault(key.strip(), value.strip().strip('\"').strip("'"))


def read_database(path):
    return sqlite3.connect(path.resolve().as_uri() + '?mode=ro', uri=True)


def normalize_phone(value):
    digits = re.sub(r'\D', '', value)
    if len(digits) == 10 and digits.startswith('0'):
        return '+254' + digits[1:]
    if len(digits) == 12 and digits.startswith('254'):
        return '+' + digits
    return '+' + digits if value.startswith('+') else digits


def timestamp(value):
    if not value:
        return None
    parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
    return parsed.replace(tzinfo=parsed.tzinfo or timezone.utc).astimezone(timezone.utc).isoformat()


def web_url(value):
    if not isinstance(value, str): return ''
    try:
        parsed = urlparse(value.strip())
        if parsed.scheme not in {'http','https'} or not parsed.hostname or parsed.username or parsed.password: return ''
        port = parsed.port
        host = parsed.hostname.lower()
        if ':' in host: host = '[' + host + ']'
        netloc = host + (':' + str(port) if port and (parsed.scheme, port) not in {('https',443),('http',80)} else '')
        return urlunparse((parsed.scheme.lower(),netloc,parsed.path or '/',parsed.params,parsed.query,''))
    except ValueError: return ''


def website_root(value):
    url = web_url(value)
    if not url: return None
    parsed = urlparse(url)
    return urlunparse((parsed.scheme,parsed.netloc,'/','','',''))


def preferred_website_roots(values):
    roots = {}
    for value in values:
        root = website_root(value)
        if not root: continue
        host = urlparse(root).netloc
        if host not in roots or root.startswith('https:'): roots[host] = root
    return sorted(roots.values())


def publisher_url(item):
    direct = web_url(item.get('publisher_url'))
    if direct: return direct
    # Earlier results saved the publisher as a fact embedded in the local reason.
    match = re.search(r'publisher URL\s+(https?://\S+)', str(item.get('reason','')))
    return web_url(match.group(1)) if match else ''


def publishable(record, item, job):
    if item.get('excluded_from_discovered_fields'): return False
    if item.get('match_status') in {'other_or_unspecified_office','rejected','foreign_or_conflicting'}: return False
    scope = str(item.get('scope','')).lower()
    if 'legal-entity link unverified' in scope or 'other office' in scope or 'non-kenyan' in scope: return False
    urls = {item.get('source_url'), publisher_url(item)}
    candidates = [c for c in job.get('candidates',[]) if c.get('url') in urls]
    if candidates and not any(c.get('name_supported',True) and c.get('geography') != 'foreign_or_conflicting' for c in candidates): return False
    text = ' '.join([str(item.get(k,'')) for k in ('source_text','scope')] +
                    [str(item.get('value','')) if item.get('field') in {'address','location'} else ''] +
                    [str(c.get('title',''))+' '+str(c.get('snippet','')) for c in candidates])
    return branch_supported(record, text)


def normalized_value(field, value):
    if not isinstance(value,str) or not value.strip() or value.strip().casefold() in {'not available','not found','none','null'}: return None
    value = value.strip()
    if field == 'phone':
        result = normalize_phone(value)
        return result if 7 <= len(re.sub(r'\D','',result)) <= 15 else None
    if field == 'email':
        return value.casefold() if re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+',value) else None
    if field == 'website': return website_root(value)
    return re.sub(r'\s+',' ',value).casefold()


def build_payloads():
    records = json.loads(SOURCE.read_text(encoding='utf-8'))
    companies = []
    known = set()
    for index, row in enumerate(records):
        if not isinstance(row, dict) or not all(isinstance(v, str) for v in row.values()):
            raise ValueError('Original company fields must be strings')
        key = row['Business Type'].lower() + '-' + row['Facility ID']
        if key in known:
            raise ValueError('Duplicate company ID: ' + key)
        known.add(key)
        companies.append(dict(id=key, source_order=index, name=row['Facility Name'],
                              business_type=row['Business Type'], country='Kenya', county=row.get('County') or None,
                              original_fields=row, collection_status='not_searched', last_collected_at=None))
    by_id = {row['id']: row for row in companies}
    findings = {}
    for collector, path, table in DATABASES:
        if not path.exists():
            raise FileNotFoundError('Saved scraper database missing: ' + str(path))
        with closing(read_database(path)) as db:
            for key, status, body in db.execute('SELECT id,status,result FROM ' + table):
                if key not in known:
                    raise ValueError('Finding refers to unknown company: ' + key)
                if status != 'not_searched':
                    by_id[key]['collection_status'] = status
                job = json.loads(body or '{}')
                for item in job.get('observations', []):
                    field, value = item.get('field'), item.get('value')
                    if field not in FIELDS or not isinstance(value,str) or not value.strip():
                        continue
                    field = 'address' if field == 'location' else field
                    parts = re.split(r'[,;/]|\s+(?:or|and)\s+', value, flags=re.I) if field == 'phone' else [value]
                    for part in parts:
                        part = part.strip()
                        if not part:
                            continue
                        normalized = normalized_value(field, part)
                        if normalized is None: continue
                        source = web_url(item.get('source_url'))
                        if not source: continue
                        publisher = publisher_url(item) or (web_url(part) if field == 'website' else '')
                        token = hashlib.sha256(json.dumps([key, field, normalized, source, publisher], ensure_ascii=False).encode()).hexdigest()
                        date = timestamp(item.get('collected_at_utc'))
                        entry = dict(id=token, company_id=key, field=field, value=normalized if field=='website' else part, normalized_value=normalized,
                                     variants=[value], source_url=source, publisher_url=publisher, collected_at=date,
                                     date_precision=item.get('date_precision', 'timestamp'),
                                     collector=item.get('collection_method', collector), scope=item.get('scope', 'Company contact; branch unconfirmed'),
                                     match_status=item.get('match_status', 'unconfirmed'), reason=item.get('reason', ''),
                                     excluded=not publishable(by_id[key]['original_fields'],item,job), audit_reason=item.get('audit_reason', ''))
                        if token in findings:
                            previous = findings[token]
                            entry['variants'] = sorted(set(previous['variants'] + entry['variants']))
                            entry['excluded'] = previous['excluded'] or entry['excluded']
                            if previous['excluded']:
                                entry['audit_reason'] = previous['audit_reason']
                            entry['collected_at'] = max(filter(None, [previous['collected_at'], date]), default=None)
                        findings[token] = entry
                        if date:
                            by_id[key]['last_collected_at'] = max(by_id[key]['last_collected_at'] or date, date)
    grouped = {}
    columns = {'phone': 'phone_mobile', 'email': 'email', 'website': 'website',
               'address': 'address'}
    for item in findings.values():
        if item['excluded']:
            continue
        row = grouped.setdefault(item['company_id'], dict(
            id=item['company_id'], company_name=by_id[item['company_id']]['name'], phone_mobile=[], email=[], website=[], address=[], evidence=[]))
        value = item['normalized_value'] if item['field'] in {'phone','email','website'} else item['value']
        column = columns[item['field']]
        if not any(normalized_value(item['field'],v) == item['normalized_value'] for v in row[column]):
            row[column].append(value)
        # Upload facts and their sources only; keep scraper commentary in local files.
        row['evidence'].append({key: item[key] for key in (
            'id', 'company_id', 'field', 'value', 'normalized_value',
            'source_url', 'publisher_url', 'collected_at', 'date_precision', 'collector')})
    for row in grouped.values():
        row['website'] = preferred_website_roots(row['website'])
        roots = {urlparse(url).netloc:url for url in row['website']}
        for item in row['evidence']:
            if item['field']=='website':
                item['value'] = item['normalized_value'] = roots[urlparse(item['value']).netloc]
        for column in columns.values():
            row[column].sort()
        row['evidence'].sort(key=lambda item: item['id'])
    return {'imported_companies': companies, 'finding_companies': list(grouped.values())}


def backup():
    dest = OUT / ('backup-' + datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%f'))
    dest.mkdir(parents=True)
    shutil.copy2(SOURCE, dest / 'facilities.json')
    for name, path, _ in DATABASES:
        with closing(read_database(path)) as source, closing(sqlite3.connect(dest / (name + '.sqlite'))) as target:
            source.backup(target)
    return dest


class Client:
    def __init__(self, progress=None):
        self.progress = progress or (lambda **values: None)
        load_environment()
        self.url = os.environ.get('SUPABASE_URL', '').rstrip('/')
        self.key = os.environ.get('SUPABASE_SECRET_KEY', '')
        if not self.url or not self.key:
            raise ValueError('Set SUPABASE_URL and SUPABASE_SECRET_KEY in scrapers/.env.local')
        if self.key.startswith('sb_publishable_'):
            raise ValueError('The scraper requires a private secret key, not a publishable key')
        parsed = urlparse(self.url)
        if parsed.scheme != 'https' or parsed.username or parsed.password or parsed.path:
            raise ValueError('SUPABASE_URL must be an HTTPS project origin')

    def request(self, table, rows=None, delete_id=None, touch_id=None):
        query = urlencode({'id': 'eq.' + (delete_id or touch_id)}) if delete_id is not None or touch_id is not None else urlencode({'on_conflict': 'id'}) if rows is not None else 'select=id&limit=1'
        headers = {'apikey': self.key, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates,return=minimal'}
        if not self.key.startswith('sb_secret_'):
            headers['Authorization'] = 'Bearer ' + self.key
        if touch_id is not None: rows = {'updated_at': now()}
        request = Request(self.url + '/rest/v1/' + table + '?' + query,
                          data=json.dumps(rows, ensure_ascii=False).encode() if rows is not None else None, headers=headers, method='DELETE' if delete_id is not None else 'PATCH' if touch_id is not None else None)
        for attempt in range(4):
            self.progress(sync_status='uploading', sync_table=table, sync_attempt=attempt+1)
            try:
                with urlopen(request, timeout=30) as response:
                    response.read()
                return
            except HTTPError as error:
                retryable = error.code == 429 or error.code >= 500
                if not retryable or attempt == 3:
                    raise RuntimeError(f'Supabase {table} request failed (HTTP {error.code}); data remains pending') from None
                delay = error.headers.get('Retry-After', '')
                try:
                    wait = float(delay)
                except ValueError:
                    try:
                        wait = (email.utils.parsedate_to_datetime(delay) - datetime.now(timezone.utc)).total_seconds()
                    except (ValueError, TypeError):
                        wait = 2 ** attempt
                wait = min(30, max(0, wait))
                while wait > 0:
                    self.progress(sync_status='retry_wait', sync_retry_seconds=wait)
                    pause = min(wait, 5)
                    time.sleep(pause)
                    wait -= pause
            except (URLError, TimeoutError, OSError):
                if attempt == 3:
                    raise RuntimeError('Supabase connection failed; data remains pending') from None
                time.sleep(2 ** attempt)

    def touch_company(self, company_id):
        self.request('imported_companies', touch_id=company_id)

    def delete(self, table, company_id):
        self.request(table, delete_id=company_id)

    def validate(self):
        self.request('imported_companies')
        self.request('finding_companies')


class SyncState:
    def __init__(self, path=None):
        target = path or OUT / 'sync.sqlite'
        target.parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(target)
        self.db.execute('CREATE TABLE IF NOT EXISTS uploads (table_name TEXT, id TEXT, payload TEXT, content_hash TEXT, uploaded_hash TEXT, uploaded_at TEXT, error TEXT, PRIMARY KEY(table_name,id))')
        self.db.execute('CREATE TABLE IF NOT EXISTS retractions (id TEXT PRIMARY KEY, error TEXT)')
        # Old acknowledgements refer to the deleted schema. Rebuild from saved results.
        self.db.execute("DELETE FROM uploads WHERE table_name NOT IN ('imported_companies','finding_companies')")
        self.db.commit()

    def stage(self, payloads):
        if 'finding_companies' in payloads:
            current = {r['id'] for r in payloads['finding_companies']}
            managed = {r[0] for r in self.db.execute("SELECT id FROM uploads WHERE table_name='finding_companies'")}
            for key in managed - current:
                self.db.execute('INSERT OR IGNORE INTO retractions(id) VALUES(?)',(key,))
                self.db.execute("DELETE FROM uploads WHERE table_name='finding_companies' AND id=?",(key,))
            self.db.executemany('DELETE FROM retractions WHERE id=?',[(key,) for key in current])
        for table, rows in payloads.items():
            for row in rows:
                payload = json.dumps(row, sort_keys=True, ensure_ascii=False)
                digest = hashlib.sha256(payload.encode()).hexdigest()
                self.db.execute('INSERT INTO uploads(table_name,id,payload,content_hash) VALUES(?,?,?,?) ON CONFLICT(table_name,id) DO UPDATE SET payload=excluded.payload,content_hash=excluded.content_hash', (table, row['id'], payload, digest))
        self.db.commit()

    def flush(self, client):
        uploaded = 0
        for (key,) in self.db.execute('SELECT id FROM retractions ORDER BY id').fetchall():
            try:
                client.delete('finding_companies',key)
                # A retraction must invalidate catalogue/profile versions even if its last visible row disappeared.
                client.touch_company(key)
            except RuntimeError as error:
                self.db.execute('UPDATE retractions SET error=? WHERE id=?',(str(error),key));self.db.commit()
                raise
            self.db.execute('DELETE FROM retractions WHERE id=?',(key,));self.db.commit()
        for table in ['imported_companies', 'finding_companies']:
            pending = self.db.execute('SELECT id,payload,content_hash FROM uploads WHERE table_name=? AND (uploaded_hash IS NULL OR uploaded_hash!=content_hash) ORDER BY id', (table,)).fetchall()
            for offset in range(0, len(pending), 500):
                batch = pending[offset:offset + 500]
                try:
                    client.request(table, [dict(json.loads(row[1]), updated_at=now()) for row in batch])
                except RuntimeError as error:
                    self.db.executemany('UPDATE uploads SET error=? WHERE table_name=? AND id=?', [(str(error), table, row[0]) for row in batch])
                    self.db.commit()
                    raise
                self.db.executemany('UPDATE uploads SET uploaded_hash=?,uploaded_at=?,error=NULL WHERE table_name=? AND id=?', [(row[2], now(), table, row[0]) for row in batch])
                self.db.commit()
                uploaded += len(batch)
                print(json.dumps({'table': table, 'uploaded': uploaded}), flush=True)
        return uploaded

    def status(self):
        pending = self.db.execute('SELECT count(*) FROM uploads WHERE uploaded_hash IS NULL OR uploaded_hash!=content_hash').fetchone()[0]
        last = self.db.execute('SELECT max(uploaded_at) FROM uploads').fetchone()[0]
        pending += self.db.execute('SELECT count(*) FROM retractions').fetchone()[0]
        return {'pending': pending, 'last_successful_upload': last}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['import', 'sync', 'status', 'validate', 'check'])
    args = parser.parse_args()
    if args.command == 'check':
        Client().validate()
        print('Supabase connection checked; no data changed')
        return
    if args.command == 'status':
        state = SyncState()
        try:
            print(json.dumps(state.status()))
        finally:
            state.db.close()
        return
    payloads = build_payloads()
    print(json.dumps({'imported_companies': len(payloads['imported_companies']), 'finding_companies': len(payloads['finding_companies'])}), flush=True)
    if args.command == 'validate':
        return
    if args.command == 'import':
        print('Backup saved: ' + str(backup()), flush=True)
    state = SyncState()
    try:
        state.stage(payloads)
        client = Client()
        client.validate()
        state.flush(client)
        print(json.dumps(state.status()))
    finally:
        state.db.close()


if __name__ == '__main__':
    try:
        main()
    except (ValueError, RuntimeError, FileNotFoundError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
