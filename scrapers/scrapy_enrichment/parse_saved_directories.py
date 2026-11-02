"""Recover newly supported directory fields from already fetched public pages."""
import hashlib
import json
import run


def main():
    run.initialize();added=0
    for key,body in run.DB.execute('SELECT id,result FROM jobs').fetchall():
        job=json.loads(body or '{}')
        if not job.get('record'):continue
        sources=run.DB.execute('SELECT source_url,checked_at FROM attempts WHERE company_id=? AND stage IN ("website","directory") AND status="completed"',(key,)).fetchall()
        for url,date in dict(sources).items():
            file=run.OUT/'raw'/f'{key}-{hashlib.sha256(url.encode()).hexdigest()[:20]}.html'
            if not file.exists() or not run.is_directory(url):continue
            html=file.read_text(encoding='utf-8')
            for field,value in run.scoped_contacts(job['record'],html,url,run.name_match,run.contacts_from,run.collect.Page):
                if any(o['field']==field and o['value']==value and o['source_url']==url for o in job['observations']):continue
                item=run.observation(field,value,url,date,'Published in the named business section; publisher/footer contacts excluded; branch review required')
                item['collection_method']='saved_source_parse';job['observations'].append(item);added+=1
        job['collection_status']=run.collection_status(job)
        run.DB.execute('UPDATE jobs SET result=? WHERE id=?',(json.dumps(job),key))
    run.DB.commit();print(json.dumps({'additional_saved_fields':added,'network_requests':0}))


if __name__=='__main__':main()
