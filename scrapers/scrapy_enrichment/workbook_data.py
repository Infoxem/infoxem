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
    contacts=[];locations=[];quarantine=[];searches=[];failures=[];companies=[];source_rows=[]
    for index,record in enumerate(originals,1):
        key=run.collect.key_for(record);status,job=current[key]
        combined=old.get(key,{}).get('observations',[])+job.get('observations',[])
        unique={};values={f:set() for f in ['phone','email','website','address','location']};last=[]
        for item in combined:
            field=item.get('field');value=str(item.get('value','')).strip();source=item.get('source_url','');date=item.get('collected_at_utc','')
            if not value or field not in values:continue
            if item.get('excluded_from_discovered_fields'):
                quarantine.append([index,record['Facility Name'],field,value,item.get('audit_reason','Excluded from contact summary'),source,date,key]);continue
            for part in phone_parts(value) if field=='phone' else [value]:
                canonical=phone_key(part) if field=='phone' else part.casefold().rstrip('/')
                token=(field,canonical,source)
                if token in unique:
                    existing=unique[token];existing['variants'].add(value)
                    if date>existing['date']:existing['date']=date
                    continue
                unique[token]={'field':field,'value':part,'normalized':canonical,'source':source,'date':date,'variants':{value},'item':item}
        for entry in unique.values():
            field=entry['field'];value=entry['value'];item=entry['item'];date=entry['date'];source=entry['source']
            if date:last.append(date)
            if field in ['address','location']:
                label=location_label(record,value)
                locations.append([index,record['Facility Name'],'Published address' if field=='address' else 'Published location',value,label,record.get('Street',''),record.get('County',''),source,date,item.get('collection_method','Earlier collection'),key])
                values[field].add(value)
            else:
                channel='WhatsApp link' if field=='website' and (urlparse(value).hostname or '') in {'wa.me','api.whatsapp.com'} else field.title()
                if channel!='WhatsApp link':values[field].add(entry['normalized'] if field=='phone' else value)
                office=item.get('scope','Company contact; branch unverified')
                if field=='phone' and entry['normalized'].startswith('+') and not entry['normalized'].startswith('+254'):office='Non-Kenyan prefix; office not confirmed'
                contacts.append([index,record['Facility Name'],channel,value,entry['normalized'] if field=='phone' else '',office,'Published candidate — review',source,date,item.get('collection_method','Earlier collection'),' | '.join(sorted(entry['variants'])),key])
        imported=', '.join(filter(None,[record.get('Street'),record.get('County'),'Kenya']))
        restart_status=('Completed' if restarted[key][1]=='discovery_completed' else 'Partial search' if restarted[key][1]=='discovery_partial' else 'Search failed') if key in restarted else 'Not started in restart'
        note='All published numbers retained; exact branch requires review' if values['phone'] else 'No phone established; read search status'
        if values['address'] or values['location']:note+='; additional locations kept separately'
        companies.append([index,record['Facility Name'],record['Business Type'],restart_status,'\n'.join(sorted(values['phone'])) or 'Not Available','\n'.join(sorted(values['email'])) or 'Not Available','\n'.join(sorted(values['website'])) or 'Not Available',imported,'\n'.join(sorted(values['address'])) or 'Not Available','\n'.join(sorted(values['location'])) or 'Not Available',note,sum(len(values[f]) for f in ['phone','email','website']),max(last) if last else '',key])
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
