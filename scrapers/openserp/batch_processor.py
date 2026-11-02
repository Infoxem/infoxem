"""Prepare the resumable name-search queue and retain unreviewed public evidence."""
import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlparse

import collect
from import_name_searches import merge_company


def validate_capture(page):
    text = page.get('visible_text', '')
    if not text.strip() or not any(marker in text for marker in ('Search Results', 'did not match any documents', 'No results found')):
        raise ValueError('Captured Google page is blank or not fully rendered; do not mark this company searched')


def identity_tokens(record):
    # A branch suffix following the legal company name is supporting context.
    base = re.split(r'\b(?:LIMITED|LTD)\s*[-–]\s*', record['Facility Name'], flags=re.I)[0]
    return collect.distinctive({**record, 'Facility Name':base})


def snippet_observations(record, result):
    found=[]
    tokens=identity_tokens(record)
    for candidate in result.get('results', []):
        if candidate.get('type')!='organic' or not tokens or len(tokens.intersection(collect.words(candidate.get('title',''))))/len(tokens)<.8:
            continue
        snippet=candidate.get('snippet','')
        contacts=collect.extract_contacts(collect.Page(snippet))
        contacts += [('phone', value.strip()) for value in re.findall(r'(?<!\d)(?:\+254|0)[\d ()-]{8,18}\d',snippet) if 10<=len(re.sub(r'\D','',value))<=12]
        for field,value in contacts:
            found.append({'field':field,'value':value,'source_url':candidate.get('google_source_url',result.get('google_url','')),'collected_at_utc':candidate.get('collected_at_utc'), 'match_status':'needs_review','scope':'Published search snippet for a name-matched result; identity and branch unverified','reason':'Company name matches result title; snippet contacts retained for review, excluding AI Overview','publisher_url':candidate.get('url','')})
    return found


def plan():
    db = collect.connect()
    rows = [{'id': key, 'record': json.loads(raw)} for key, raw in db.execute("SELECT id,original FROM companies WHERE status='not_searched' ORDER BY rowid")]
    db.close()
    (collect.OUT/'remaining-plan.json').write_text(json.dumps(rows, ensure_ascii=False), encoding='utf-8')
    print(len(rows))


def process(key, captures):
    db = collect.connect()
    record = json.loads(db.execute('SELECT original FROM companies WHERE id=?', (key,)).fetchone()[0])
    db.close()
    observations, errors = [], []
    for capture in captures:
        page = json.loads(capture.read_text(encoding='utf-8'))
        validate_capture(page)
        for panel in page.get('business_panels', []):
            panel = dict(panel)
            # Google uses multiple DOM layouts. Restrict visible-label fallback
            # to the exact named business panel, after organic/AI content.
            marker = '\n' + panel.get('name', '') + '\n'
            section = page['visible_text'].rsplit(marker, 1)[-1] if marker in page['visible_text'] else ''
            for field, label in [('phone', 'Phone'), ('location', 'Address')]:
                match = re.search(r'(?:^|\n)' + label + r':\s*([^\n]+)', section)
                if not panel.get(field) and match:
                    panel[field] = match.group(1).strip()
            tokens = identity_tokens(record)
            overlap = tokens.intersection(collect.words(panel.get('name', '')))
            if not tokens or len(overlap)/len(tokens) < .8:
                continue
            for field in ('phone', 'location', 'website'):
                value = panel.get(field)
                if value:
                    observations.append({'field':field,'value':value,'source_url':page['url'],'collected_at_utc':page['captured_at_utc'],'match_status':'needs_review','scope':'Automated name-matched business listing; identity and branch unverified','reason':'Name overlap; ID and PPB street not used as match requirements. Human review required.'})
        # Crawl at most one plausible branded website per company. Sources and
        # all offices remain unqualified until identity/country review.
    websites = list(dict.fromkeys(o['value'] for o in observations if o['field']=='website'))
    for website in websites[:1]:
        host = urlparse(website).hostname or ''
        if not any(len(w)>=4 and w in host.lower() for w in collect.distinctive(record)):
            continue
        found, failures, _ = collect.crawl(record, {'url':website,'title':record['Facility Name']}, collect.OUT)
        for item in found:
            item['match_status']='needs_review'
            item['scope']='Website extraction; country, company and exact branch require review'
            observations.append(item)
        errors.extend(failures)
    evidence=collect.OUT/f'batch-evidence-{key}.json'
    evidence.write_text(json.dumps({'infoxem_id':key,'observations':observations,'website_errors':errors,'review_note':'Two distinct name queries collected. Automated findings are candidates; no existing profile changed. Read sources before approving contacts.'},ensure_ascii=False,indent=2),encoding='utf-8')
    merge_company(key,captures,evidence)
    db=collect.connect()
    result=json.loads(db.execute('SELECT result FROM companies WHERE id=?',(key,)).fetchone()[0])
    for observation in snippet_observations(record,result):
        if observation not in result['observations']:
            result['observations'].append(observation)
    db.execute('UPDATE companies SET result=? WHERE id=?',(json.dumps(result),key))
    db.commit()
    for error in errors:
        collect.record_attempt(db,key,'batch_website','failed',error['url'],error,error['error'])
    collect.export_tables(db)
    db.close()


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--plan',action='store_true')
    parser.add_argument('--company-id')
    parser.add_argument('--captures',nargs='+',type=Path)
    args=parser.parse_args()
    if args.plan:
        plan()
    else:
        process(args.company_id,args.captures)
