"""Build a cumulative review workbook input without altering company profiles."""
import hashlib
import json
import re
import sqlite3
from pathlib import Path
from urllib.parse import urlparse
import run

DEST=run.ROOT/'scrapers/outputs/01a19071-infoxem-restart'


def phone_key(value):
    digits=re.sub(r'\D','',value)
    if len(digits)==10 and digits.startswith('0'):return '+254'+digits[1:]
    if digits.startswith('254') and len(digits)==12:return '+'+digits
    return '+'+digits if value.strip().startswith('+') else digits


def phone_parts(value):
    return [part.strip() for part in re.split(r'[,;/]|\s+(?:or|and)\s+',value,flags=re.I) if part.strip()]


def location_label(record,value):
    if run.normalized(value)==run.normalized(', '.join(filter(None,[record.get('Street'),record.get('County'),'Kenya']))):return 'Same text as imported location'
    if record.get('County') and run.normalized(record['County']) in run.normalized(value):return 'Additional address/location — same county mentioned'
    return 'Additional address/location — review against imported record'


def main():
    run.initialize();DEST.mkdir(parents=True,exist_ok=True)
    originals=json.loads(run.collect.INPUT.read_text(encoding='utf-8'))
    previous=sqlite3.connect(run.ROOT/'scrapers/outputs/openserp/jobs.sqlite')
    old={key:json.loads(body or '{}') for key,body in previous.execute('SELECT id,result FROM companies')};previous.close()
    current={key:(status,json.loads(body or '{}')) for key,status,body in run.DB.execute('SELECT id,status,result FROM jobs')}
    restarted={key:(date,status) for key,date,status in run.DB.execute('SELECT * FROM restart_progress')}
    published={row['id']:row for row in run.supabase_sync.build_payloads()['finding_companies']}
    contacts=[];locations=[];quarantine=[];searches=[];failures=[];companies=[];source_rows=[]
    for index,record in enumerate(originals,1):
        key=run.collect.key_for(record);status,job=current[key]
        row=published.get(key,{'phone_mobile':[],'email':[],'website':[],'address':[],'evidence':[]})
        values={'phone':set(row['phone_mobile']),'email':set(row['email']),'website':set(row['website']),'address':set(row['address'])}
        last=[]
        for item in old.get(key,{}).get('observations',[])+job.get('observations',[]):
            if item.get('excluded_from_discovered_fields'):
                quarantine.append([index,record['Facility Name'],item.get('field',''),item.get('value',''),item.get('source_url',''),item.get('collected_at_utc',''),key])
        for item in row['evidence']:
            field=item['field'];value=item['value'];date=item['collected_at'];source=item['source_url']
            if date:last.append(date)
            if field=='address':
                locations.append([index,record['Facility Name'],value,record.get('Street',''),record.get('County',''),source,item.get('publisher_url',''),date,item['collector'],key])
            else:
                contacts.append([index,record['Facility Name'],field.title(),value,item['normalized_value'] if field=='phone' else '',source,item.get('publisher_url',''),date,item['collector'],key])
        imported=', '.join(filter(None,[record.get('Street'),record.get('County'),'Kenya']))
        restart_status=('Completed' if restarted[key][1]=='discovery_completed' else 'Partial search' if restarted[key][1]=='discovery_partial' else 'Search failed') if key in restarted else 'Not started in restart'
        companies.append([index,record['Facility Name'],record['Business Type'],restart_status,'\n'.join(sorted(values['phone'])) or 'Not Available','\n'.join(sorted(values['email'])) or 'Not Available','\n'.join(sorted(values['website'])) or 'Not Available',imported,'\n'.join(sorted(values['address'])) or 'Not Available',sum(len(values[f]) for f in ['phone','email','website']),max(last) if last else '',key])
        source_rows.append([index,record['Facility ID'],record['Facility Name'],record['Business Type'],record.get('Street',''),record.get('County',''),record.get('Licence Status',''),record.get('Source file',''),key])
    for key,stage,status,url,date,payload,error in run.DB.execute('SELECT company_id,stage,status,source_url,checked_at,payload,error FROM attempts'):
        record=current.get(key)
        info=next((r for r in companies if r[-1]==key),None)
        if not info:continue
        body=json.loads(payload or '{}')
        if stage=='discovery':searches.append([info[0],info[1],body.get('query',''),body.get('backend',''),status,len(body.get('results',[])),url,date,error,key])
        if error:failures.append([info[0],info[1],stage,status,error,url,date,key])
    payload={'companies':companies,'contacts':contacts,'locations':locations,'searches':searches,'failures':failures,'quarantine':quarantine,'originals':source_rows,'restart_completed':len(restarted),'total':len(originals),'updated_at_utc':run.collect.now(),'input_sha256':hashlib.sha256(run.collect.INPUT.read_bytes()).hexdigest()}
    (DEST/'workbook-data.json').write_text(json.dumps(payload,ensure_ascii=False),encoding='utf-8')
    print(json.dumps({'companies':len(companies),'contact_rows':len(contacts),'location_rows':len(locations),'restart_completed':len(restarted)}))


if __name__=='__main__':main()
