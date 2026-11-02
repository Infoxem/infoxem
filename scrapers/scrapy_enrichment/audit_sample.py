"""Recheck saved source evidence without making network requests."""
import hashlib
import json
from parsel import Selector
import run


def audit(result,key):
    record=result['record']
    rejected=[]
    for item in result.get('observations',[]):
        if item.get('collection_method')=='web_research':continue
        reason=item.get('reason','')
        if 'publisher URL ' in reason:
            publisher=reason.split('publisher URL ',1)[1]
            supporting=[c for c in result.get('candidates',[]) if c.get('url')==publisher and run.clean_search_result(c) and run.name_match(record,c.get('title','')) and run.geography(c.get('title','')+' '+c.get('snippet',''),publisher,record)=='kenya_supported' and (item['field'],item['value']) in run.contacts_from(run.collect.Page(c.get('snippet','')))]
            valid=bool(supporting)
        else:
            source=item['source_url'];digest=hashlib.sha256(source.encode()).hexdigest()[:20]
            file=run.OUT/'raw'/f'{key}-{digest}.html'
            valid=False
            if file.exists():
                body=file.read_text(encoding='utf-8');page=run.collect.Page(body)
                if run.is_directory(source):
                    values=run.directory_contacts(record,page.schemas,source)
                    values += [('address',v) for f,v in values if f=='location']
                    values += run.scoped_contacts(record,body,source,run.name_match,run.contacts_from,run.collect.Page)
                    valid=(item['field'],item['value']) in values
                else:
                    text=Selector(body).css('title::text').get('')+' '+' '.join(page.text)[:20000]
                    valid=(run.name_match(record,text) or run.alias_supported(record,text,source)) and run.geography(text,source,record)=='kenya_supported'
        if not valid:
            item['excluded_from_discovered_fields']=True
            item['audit_reason']='Source did not support the stricter company/country match; retained only for audit'
            rejected.append({'field':item['field'],'value':item['value'],'source_url':item['source_url']})
    return rejected


if __name__=='__main__':
    run.initialize()
    ids=json.loads((run.OUT/'pilot-ids.json').read_text())
    excluded={}
    for key in ids:
        result=json.loads(run.DB.execute('SELECT result FROM jobs WHERE id=?',(key,)).fetchone()[0])
        rejected=audit(result,key)
        if rejected:excluded[key]=rejected
        # Recover useful contacts from clean, individually attributed search
        # cards. Their source remains the actual query, with publisher URL noted.
        for candidate in result.get('candidates',[]):
            title=candidate.get('title','');snippet=candidate.get('snippet','');url=candidate.get('url','')
            if not run.clean_search_result(candidate) or not run.name_match(result['record'],title) or run.geography(title+' '+snippet,url,result['record'])!='kenya_supported':continue
            for field,value in run.contacts_from(run.collect.Page(snippet)):
                item=run.observation(field,value,candidate['source_url'],candidate['collected_at_utc'],'Name-matched search snippet; publisher URL '+url)
                if not any(o['field']==field and o['value']==value and o['source_url']==item['source_url'] and not o.get('excluded_from_discovered_fields') for o in result['observations']):result['observations'].append(item)
        result['collection_status']=run.collection_status(result)
        if rejected:
            note='Audit excluded contact evidence with insufficient company/source support; see excluded_from_discovered_fields in observations.'
            if note not in result['review_notes']:result['review_notes'].append(note)
        run.DB.execute('UPDATE jobs SET result=? WHERE id=?',(json.dumps(result),key))
    run.DB.commit();run.export_tables(ids)
    (run.OUT/'sample-audit.json').write_text(json.dumps({'companies_checked':len(ids),'excluded':excluded,'network_requests':0},indent=2),encoding='utf-8')
    print(json.dumps({'companies_checked':len(ids),'observations_excluded':sum(len(v) for v in excluded.values())}))
