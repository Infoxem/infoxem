"""Merge 2–3 captured name-based searches per company, keeping prior evidence.

Uses the verified interactive browser workflow; does not submit Google requests.
The local ID links evidence to Infoxem and is never a discovery/matching signal.
"""
import argparse
import json
import urllib.request
from pathlib import Path
from urllib.parse import urljoin

import collect
from import_verified_page import validate_page


def merge_company(key, captures, evidence):
    if not 2 <= len(captures) <= 3:
        raise ValueError('Provide two or three distinct queries per company')
    db = collect.connect()
    try:
        source, previous = db.execute('SELECT original,result FROM companies WHERE id=?', (key,)).fetchone()
        record, result = json.loads(source), json.loads(previous or '{}')
        reviewed = json.loads(evidence.read_text(encoding='utf-8'))
        if reviewed['infoxem_id'] != key:
            raise ValueError('Evidence belongs to another company')
        pages = [json.loads(p.read_text(encoding='utf-8')) for p in captures]
        queries = [validate_page(p, record) for p in pages]
        if len(set(queries)) != len(queries):
            raise ValueError('Queries must be different')
        result.setdefault('results', [])
        result.setdefault('observations', [])
        result.setdefault('query_history', [])
        for page, query, path in zip(pages, queries, captures):
            if db.execute('SELECT 1 FROM attempts WHERE company_id=? AND stage=? AND checked_at=?', (key, 'name_search_parse', page['captured_at_utc'])).fetchone():
                continue
            request = urllib.request.Request(collect.API+'/google/parse', data=page['html'].encode(), headers={'Content-Type':'text/html'}, method='POST')
            with urllib.request.urlopen(request, timeout=40) as response:
                parsed = json.loads(response.read())
            status, error = collect.classify_response(200, parsed)
            if status not in {'completed', 'not_found'}:
                raise ValueError(f'Cannot import failed parse: {status}: {error}')
            collect.record_attempt(db, key, 'name_search_parse', status, page['url'], parsed, checked=page['captured_at_utc'])
            result['query_history'].append({'query':query,'source_url':page['url'],'collected_at_utc':page['captured_at_utc'],'capture':path.name,'status':status})
            for candidate in parsed['results']:
                candidate.update(url=urljoin('https://www.google.com', candidate.get('url','')), google_source_url=page['url'], query=query, collected_at_utc=page['captured_at_utc'], match_status='needs_review')
                result['results'].append(candidate)
        for observation in reviewed.get('observations', []):
            if observation.get('field') not in {'website','email','phone','location'} or not all(observation.get(k) for k in ('value','source_url','collected_at_utc','reason','match_status')):
                raise ValueError('Incomplete reviewed evidence')
            if observation not in result['observations']:
                result['observations'].append(observation)
        result['collection_mode'] = 'human_verified_browser_multiple_name_queries'
        result['matching_policy'] = 'Company name, country, brand and published contact agreement; PPB ID only links records; street is optional supporting evidence; branch identity reviewed separately'
        result['review_note'] = reviewed['review_note']
        result['website_errors'] = result.get('website_errors', []) + reviewed.get('website_errors', [])
        collect.save_job(db,key,queries[-1],result,'completed','',collect.API+'/google/parse',collect.OUT,stage='name_search_merged')
    finally:
        collect.export_tables(db)
        db.close()


if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--company-id',required=True)
    parser.add_argument('--captures',nargs='+',type=Path,required=True)
    parser.add_argument('--evidence',type=Path,required=True)
    args=parser.parse_args()
    merge_company(args.company_id,args.captures,args.evidence)
