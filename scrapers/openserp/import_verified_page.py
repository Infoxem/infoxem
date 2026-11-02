"""Parse a Google page captured in a browser after human verification.

Does not copy cookies, solve challenges, or submit another Google query.
The independent OpenSERP browser's halt state is deliberately preserved.
"""
import argparse
import json
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import parse_qs, urljoin, urlparse

import collect


def validate_page(page, record):
    url = urlparse(page.get('url', ''))
    if url.scheme != 'https' or url.hostname != 'www.google.com' or url.path != '/search':
        raise ValueError('Capture must be an actual Google Search result page, not a CAPTCHA page')
    query = parse_qs(url.query).get('q', [''])[0]
    name_words = collect.distinctive(record)
    compact_query = ''.join(collect.words(query))
    if not name_words.intersection(collect.words(query)) and not any(word in compact_query for word in name_words if len(word) >= 5):
        raise ValueError('The captured query does not identify this company')
    if not page.get('html') or not page.get('captured_at_utc'):
        raise ValueError('Capture needs rendered HTML and an actual collection time')
    if len(page['html'].encode()) > 10_000_000:
        raise ValueError('Captured page exceeds the parser limit')
    return query


def import_page(company_id, capture, evidence=None):
    db = collect.connect()
    try:
        original = db.execute('SELECT original FROM companies WHERE id=?', (company_id,)).fetchone()
        if not original:
            raise ValueError('Unknown Infoxem company ID')
        record = json.loads(original[0])
        page = json.loads(capture.read_text(encoding='utf-8'))
        query = validate_page(page, record)
        # Repeat imports are idempotent; keep the permanent attempt history.
        if db.execute('SELECT 1 FROM attempts WHERE company_id=? AND stage=? AND checked_at=?', (company_id, 'verified_browser_parse', page['captured_at_utc'])).fetchone():
            print('This captured page has already been imported')
            return
        request = urllib.request.Request(collect.API + '/google/parse', data=page['html'].encode(), headers={'Content-Type': 'text/html'}, method='POST')
        try:
            with urllib.request.urlopen(request, timeout=40) as response:
                status_code, result = response.status, json.loads(response.read())
        except urllib.error.HTTPError as exc:
            status_code, result = exc.code, json.loads(exc.read())
        status, error = collect.classify_response(status_code, result)
        if status != 'completed':
            raise ValueError(f'OpenSERP did not parse genuine search results: {status}: {error}')
        result['collection_mode'] = 'human_verified_browser_and_openserp_parser'
        result['browser_capture'] = capture.name
        result['observations'], result['website_errors'] = [], []
        if evidence:
            reviewed = json.loads(evidence.read_text(encoding='utf-8'))
            if reviewed.get('infoxem_id') != company_id:
                raise ValueError('Reviewed evidence belongs to a different company')
            for observation in reviewed.get('observations', []):
                if observation.get('field') not in {'website', 'email', 'phone', 'location'} or not observation.get('source_url') or not observation.get('collected_at_utc') or not observation.get('reason'):
                    raise ValueError('Incomplete reviewed observation')
            result['observations'] = reviewed.get('observations', [])
        for candidate in result['results']:
            # Keep encrypted redirect links as Google links until resolved in
            # the browser. Do not guess the destination from a display label.
            candidate['url'] = urljoin('https://www.google.com', candidate.get('url', ''))
            candidate['match_status'] = 'needs_review'
        collect.save_job(db, company_id, query, result, 'completed', '', collect.API + '/google/parse', collect.OUT, page['captured_at_utc'], stage='verified_browser_parse')
        print(json.dumps({'company': company_id, 'parsed_search_results': len(result['results']), 'contact_observations': len(result['observations']), 'collection_mode': result['collection_mode']}))
    finally:
        collect.export_tables(db)
        db.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--company-id', required=True)
    parser.add_argument('--capture', type=Path, required=True)
    parser.add_argument('--evidence', type=Path)
    args = parser.parse_args()
    import_page(args.company_id, args.capture, args.evidence)
