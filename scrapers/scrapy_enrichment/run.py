"""Browser-free DDGS discovery and Scrapy website pilot; no Google backend."""
import argparse
import csv
import hashlib
import json
import re
import sqlite3
import sys
import time
from pathlib import Path
from urllib.parse import urlencode, urljoin, urlparse

import scrapy
from scrapy.crawler import CrawlerProcess
from scrapy.exceptions import IgnoreRequest
from ddgs import DDGS
from discovery import query_plan, hints, geography, is_directory, alias_supported, schema_entities, normalized
from directory_parsers import scoped_contacts

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'scrapers/openserp'))
import collect
from batch_processor import identity_tokens

OUT=ROOT/'scrapers/outputs/scrapy'
DB=None
STOP_AT=0


def within_collection_window():
    return not STOP_AT or time.time()<STOP_AT


def initialize():
    global DB
    OUT.mkdir(parents=True,exist_ok=True)
    DB=sqlite3.connect(OUT/'jobs.sqlite')
    DB.executescript('CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,original TEXT,status TEXT,result TEXT); CREATE TABLE IF NOT EXISTS attempts(id INTEGER PRIMARY KEY,company_id TEXT,stage TEXT,status TEXT,source_url TEXT,checked_at TEXT,payload TEXT,error TEXT);')
    DB.execute('CREATE TABLE IF NOT EXISTS restart_progress(company_id TEXT PRIMARY KEY,finished_at TEXT,status TEXT)')
    for record in json.loads(collect.INPUT.read_text(encoding='utf-8')):
        DB.execute('INSERT OR IGNORE INTO jobs VALUES(?,?,?,?)',(collect.key_for(record),json.dumps(record),'not_searched','{}'))
    DB.commit()


def event(key,stage,status,url,payload,error=''):
    DB.execute('INSERT INTO attempts(company_id,stage,status,source_url,checked_at,payload,error) VALUES(?,?,?,?,?,?,?)',(key,stage,status,url,collect.now(),json.dumps(payload),error));DB.commit()


def name_match(record,title):
    tokens=identity_tokens(record)
    target=collect.words(title)
    sector=any(w.startswith('pharm') or w in {'chemist','chemists'} for w in collect.words(record['Facility Name']))
    sector_ok=not sector or any(w.startswith('pharm') or w in {'chemist','chemists'} for w in target)
    if tokens and all(len(word)<4 for word in tokens):
        base=re.sub(r'\([^)]*\)','',record['Facility Name']).replace("\\'", "'")
        base=re.split(r'\b(?:LIMITED|LTD)\b',base,flags=re.I)[0]
        return bool(normalized(base)) and normalized(base) in normalized(title)
    return bool(tokens) and sector_ok and len(tokens.intersection(target))/len(tokens)>=.8


def clean_search_result(candidate):
    # Some upstream HTML parsers collapse several search cards into one. Keep
    # those cards for audit, but do not attach their contact values to a company.
    return len(candidate.get('title',''))<=160 and len(candidate.get('snippet',candidate.get('body','')))<=600


def contacts_from(page):
    contacts=collect.extract_contacts(page)
    for value in re.findall(r'(?<!\d)(?:\+[1-9]|0)[\d ()-]{6,22}\d',' '.join(page.text)):
        digits=len(re.sub(r'\D','',value))
        if (value.startswith('+') and 7<=digits<=15) or (value.startswith('0') and digits in {9,10}):
            contacts.append(('phone',value.strip()))
    return sorted(set(contacts))


def discover(key,query,preferred,disabled,client):
    for backend in dict.fromkeys([preferred,'bing','duckduckgo']):
        if not within_collection_window():break
        if backend in disabled:continue
        source=('https://duckduckgo.com/?' if backend=='duckduckgo' else 'https://www.bing.com/search?')+urlencode({'q':query})
        for raw,checked in DB.execute('SELECT payload,checked_at FROM attempts WHERE company_id=? AND stage="discovery" AND status="completed" ORDER BY id DESC',(key,)):
            cached=json.loads(raw)
            if cached.get('query')==query and cached.get('backend')==backend:
                return cached['results'],backend,source,checked
        try:
            results=list(client.text(query,region='ke-en',backend=backend,max_results=5))
            checked=collect.now();event(key,'discovery','completed',source,{'backend':backend,'query':query,'results':results})
            return results,backend,source,checked
        except Exception as exc:
            if re.search(r'captcha|rate.?limit|too many requests|\b(?:429|403)\b',str(exc),re.I):
                disabled.add(backend)
            event(key,'discovery','failed',source,{'backend':backend,'query':query},f'{type(exc).__name__}: {str(exc)[:500]}')
        finally:
            time.sleep(3)
    return None,None,None,None


def observation(field,value,url,checked,reason):
    return dict(field=field,value=value,source_url=url,collected_at_utc=checked,match_status='needs_review',scope='Company candidate; country and branch unverified',reason=reason,collection_method='local_pipeline')


def directory_contacts(record,schemas,url):
    contacts=[]
    for entity in schema_entities(schemas):
        if name_match(record,str(entity['name'])) and geography(json.dumps(entity),url,record)=='kenya_supported':
            contacts.extend(collect.schema_contacts([entity]))
    return contacts


def collection_status(job):
    usable=[o for o in job.get('observations',[]) if not o.get('excluded_from_discovered_fields') and o.get('collection_method')!='web_research']
    if any('publisher URL ' not in o.get('reason','') for o in usable):return 'completed_needs_review'
    if usable:return 'snippet_candidates_only'
    if job.get('website_errors'):return 'collection_failed'
    return 'no_matched_contacts' if job.get('crawl_urls') else 'no_candidate_website'


def select_sample(remaining,records,limit,representative=False):
    limit=max(0,limit)
    if not representative:return remaining[:limit]
    selected=[]
    def take(pool,count):
        buckets={}
        for key in pool:
            buckets.setdefault(records[key].get('County','').strip() or 'Unknown',[]).append(key)
        while count and any(buckets.values()):
            for bucket in buckets.values():
                if bucket and count:
                    selected.append(bucket.pop(0));count-=1
    wholesale=[k for k in remaining if records[k]['Business Type'].lower()=='wholesale']
    retail=[k for k in remaining if k not in set(wholesale)]
    take(wholesale,min(len(wholesale),max(1,limit//5)) if limit else 0)
    take(retail,limit-len(selected))
    if len(selected)<limit:take([k for k in remaining if k not in set(selected)],limit-len(selected))
    return selected


class PublicOnly:
    def process_request(self,request):
        if not collect.public_url(request.url):
            raise IgnoreRequest('Invalid or non-public destination')


class Contacts(scrapy.Spider):
    name='infoxem_contacts'
    custom_settings={'ROBOTSTXT_OBEY':True,'USER_AGENT':'InfoxemResearch/1.0','CONCURRENT_REQUESTS':4,'CONCURRENT_REQUESTS_PER_DOMAIN':1,'DOWNLOAD_DELAY':1,'AUTOTHROTTLE_ENABLED':True,'AUTOTHROTTLE_START_DELAY':1,'AUTOTHROTTLE_MAX_DELAY':30,'AUTOTHROTTLE_TARGET_CONCURRENCY':1,'DOWNLOAD_TIMEOUT':20,'DOWNLOAD_MAXSIZE':2_000_000,'RETRY_ENABLED':False,'LOG_LEVEL':'WARNING','TELNETCONSOLE_ENABLED':False,'DOWNLOADER_MIDDLEWARES':{'__main__.PublicOnly':50}}

    def __init__(self,work,**kwargs):
        super().__init__(**kwargs);self.work=work;self.visited={};self.pages={}

    def request(self,key,url):
        if not within_collection_window():return None
        seen=self.visited.setdefault(key,set())
        if len(seen)>=5 or url in seen:return None
        seen.add(url)
        return scrapy.Request(url,callback=self.parse_page,errback=self.failed,meta={'company_id':key},dont_filter=True)

    async def start(self):
        for key,job in self.work.items():
            for url in job['crawl_urls'][:3]:
                request=self.request(key,url)
                if request:yield request

    def failed(self,failure):
        key=failure.request.meta.get('company_id')
        event(key,'website','failed',failure.request.url,{},str(failure.value)[:500])
        self.work[key]['website_errors'].append({'url':failure.request.url,'error':str(failure.value)[:300]})

    def parse_page(self,response):
        key=response.meta['company_id'];job=self.work[key]
        self.pages[key]=self.pages.get(key,0)+1
        checked=collect.now();body=response.text
        raw=OUT/'raw';raw.mkdir(exist_ok=True)
        digest=hashlib.sha256(response.url.encode()).hexdigest()[:20]
        (raw/f'{key}-{digest}.html').write_text(body,encoding='utf-8')
        page=collect.Page(body)
        title=response.css('title::text').get('')
        text=title+' '+' '.join(page.text)[:20000]
        matched=name_match(job['record'],text) or alias_supported(job['record'],text,response.url)
        geo=geography(text,response.url,job['record'])
        if is_directory(response.url):
            entities=[e for e in schema_entities(page.schemas) if name_match(job['record'],str(e['name']))]
            event(key,'directory','completed',response.url,{'named_entities':len(entities)})
            for field,value in directory_contacts(job['record'],page.schemas,response.url):
                job['observations'].append(observation('address' if field=='location' else field,value,response.url,checked,'Contact belongs to a name-matched structured directory entity in Kenya; branch review required'))
            for field,value in scoped_contacts(job['record'],body,response.url,name_match,contacts_from,collect.Page):
                job['observations'].append(observation(field,value,response.url,checked,'Published in the named business section; publisher/footer contacts excluded; branch review required'))
            if not entities:job['review_notes'].append('Directory returned no safely scoped business entity: '+response.url)
            return
        event(key,'website','completed',response.url,{'name_supported':matched,'bytes':len(response.body)})
        if matched and geo=='kenya_supported':
            job['observations'].append(observation('website',response.url,response.url,checked,'Published website mentions company name; identity and branch need review'))
            for field,value in contacts_from(page):
                job['observations'].append(observation(field,value,response.url,checked,'Visible website contact; other-country and other-office contacts remain unapproved'))
        else:
            job['review_notes'].append('Company/country evidence insufficient ('+geo+'): '+response.url)
        for href in page.links:
            linked=urljoin(response.url,href).split('#')[0]
            if urlparse(linked).hostname==urlparse(response.url).hostname and re.search(r'contact|about|branch|location',linked,re.I):
                request=self.request(key,linked)
                if request:yield request


def export_tables(pilot_ids):
    prior_path=ROOT/'scrapers/outputs/openserp/infoxem_companies.csv'
    prior={r['infoxem_id']:r for r in csv.DictReader(prior_path.open(encoding='utf-8-sig',newline=''))} if prior_path.exists() else {}
    tables={'companies':[],'pilot':[],'candidates':[],'observations':[],'failures':[]}
    for key,raw,status,body in DB.execute('SELECT * FROM jobs ORDER BY rowid'):
        original=json.loads(raw);result=json.loads(body);obs=result.get('observations',[])
        row={**prior.get(key,{}),**original,'infoxem_id':key,'scrapy_search_status':status,'scrapy_query_count':len(result.get('queries',[])),'scrapy_queries':'; '.join(result.get('queries',[])),'scrapy_collection_status':result.get('collection_status','not_attempted'),'profile_updated':'No'}
        for field in ['website','email','phone','location','address']:
            found=[o for o in obs if o['field']==field and not o.get('excluded_from_discovered_fields')]
            row['discovered_'+field]='; '.join(sorted({o['value'] for o in found})) or 'Not Available'
            row['discovered_'+field+'_sources']='; '.join(sorted({o['source_url'] for o in found}))
            row['discovered_'+field+'_dates']='; '.join(sorted({o['collected_at_utc'] for o in found}))
        row['scrapy_review_notes']='; '.join(result.get('review_notes',[]))
        row['research_assisted_fields']='; '.join(sorted({o['field'] for o in obs if o.get('collection_method')=='web_research'}))
        tables['companies'].append(row)
        if key in pilot_ids:tables['pilot'].append(row)
        tables['candidates'].extend({'infoxem_id':key,**r} for r in result.get('candidates',[]))
        tables['observations'].extend({'infoxem_id':key,**o} for o in obs)
    for key,stage,status,url,date,payload,error in DB.execute('SELECT company_id,stage,status,source_url,checked_at,payload,error FROM attempts WHERE error!=""'):
        tables['failures'].append(dict(infoxem_id=key,stage=stage,status=status,source_url=url,collected_at_utc=date,error=error,raw_payload=payload))
    (OUT/'tables.json').write_text(json.dumps(tables,ensure_ascii=False,indent=2),encoding='utf-8')


def main():
    global STOP_AT
    initialize()
    parser=argparse.ArgumentParser();parser.add_argument('--stop-at',type=float,default=0);parser.add_argument('--limit',type=int,default=5);parser.add_argument('--representative',action='store_true');parser.add_argument('--restart-batch',action='store_true');parser.add_argument('--pilot',action='store_true');parser.add_argument('--retry-pilot',action='store_true');parser.add_argument('--export-only',action='store_true');args=parser.parse_args()
    STOP_AT=args.stop_at
    if args.export_only:
        ids=json.loads((OUT/'pilot-ids.json').read_text()) if (OUT/'pilot-ids.json').exists() else []
        export_tables(ids);return
    started=time.monotonic()
    old=sqlite3.connect(ROOT/'scrapers/outputs/openserp/jobs.sqlite')
    remaining=[r[0] for r in old.execute("SELECT id FROM companies WHERE status='not_searched' ORDER BY rowid") if DB.execute('SELECT status FROM jobs WHERE id=?',(r[0],)).fetchone()[0]=='not_searched'];old.close()
    records={key:json.loads(raw) for key,raw in DB.execute('SELECT id,original FROM jobs')}
    ids=(['wholesale-3311','retail-33481']+remaining)[:max(0,args.limit)] if args.pilot else select_sample(remaining,records,args.limit,args.representative)
    ids=[key for key in ids if DB.execute('SELECT status FROM jobs WHERE id=?',(key,)).fetchone()[0]=='not_searched']
    if args.restart_batch:
        ids=[key for key in records if not DB.execute('SELECT 1 FROM restart_progress WHERE company_id=?',(key,)).fetchone()][:max(0,args.limit)]
    if args.retry_pilot:
        ids=json.loads((OUT/'pilot-ids.json').read_text(encoding='utf-8'))
        previous=OUT/'tables.json'
        if previous.exists():
            (OUT/('previous-pilot-'+str(time.time_ns())+'.json')).write_bytes(previous.read_bytes())
    (OUT/'pilot-ids.json').write_text(json.dumps(ids),encoding='utf-8')
    disabled_file=OUT/'restart-disabled-backends.json'
    blocked=set(json.loads(disabled_file.read_text()) if args.restart_batch and disabled_file.exists() else []);work={};client=DDGS(timeout=15)
    progress={'status':'discovering','selected':len(ids),'completed_discovery':0,'company_ids':ids,'started_at_utc':collect.now()}
    (OUT/'progress.json').write_text(json.dumps(progress,indent=2),encoding='utf-8')
    prior={r['infoxem_id']:r for r in csv.DictReader((ROOT/'scrapers/outputs/openserp/infoxem_companies.csv').open(encoding='utf-8-sig',newline=''))}
    try:
        for key in ids:
            if not within_collection_window():break
            if {'bing','duckduckgo'}.issubset(blocked):break
            progress.update(current_company=key,updated_at_utc=collect.now())
            (OUT/'progress.json').write_text(json.dumps(progress,indent=2),encoding='utf-8')
            record=json.loads(DB.execute('SELECT original FROM jobs WHERE id=?',(key,)).fetchone()[0]);base=re.split(r'\b(?:LIMITED|LTD)\s*[-–]',re.sub(r'\([^)]*\)','',record['Facility Name']),flags=re.I)[0].strip()
            queries=query_plan(record)
            previous=json.loads(DB.execute('SELECT result FROM jobs WHERE id=?',(key,)).fetchone()[0] or '{}')
            job=work[key]=dict(record=record,queries=queries,candidates=previous.get('candidates',[]),observations=previous.get('observations',[]),website_errors=[],review_notes=previous.get('review_notes',[]),crawl_urls=[],successful_queries=0)
            for index,query in enumerate(queries):
                if not within_collection_window():break
                backend='duckduckgo' if index==0 else 'bing'
                source=('https://duckduckgo.com/?' if backend=='duckduckgo' else 'https://www.bing.com/search?')+urlencode({'q':query})
                print(json.dumps({'company':key,'query':query,'backend':backend}),flush=True)
                try:
                    results,backend,source,checked=discover(key,query,backend,blocked,client)
                    if results is None:continue
                    job['successful_queries']+=1
                    for item in results:
                        url=item.get('href','');title=item.get('title','');snippet=item.get('body','')
                        matched=name_match(record,title+' '+snippet) or alias_supported(record,title+' '+snippet,url)
                        geo=geography(title+' '+snippet,url,record)
                        job['candidates'].append(dict(query=query,backend=backend,source_url=source,collected_at_utc=checked,url=url,title=title,snippet=snippet,name_supported=matched,geography=geo))
                        if matched and geo=='kenya_supported':
                            if name_match(record,title) and clean_search_result({'title':title,'snippet':snippet}):
                                for field,value in contacts_from(collect.Page(snippet)):
                                    job['observations'].append(observation(field,value,source,checked,'Name-matched search snippet; publisher URL '+url))
                            host=urlparse(url).hostname or ''
                            if host and (is_directory(url) or alias_supported(record,title+' '+snippet,url) or (not any(host==d or host.endswith('.'+d) for d in collect.EXCLUDED) and any(len(w)>=4 and w in host for w in identity_tokens(record)))):
                                job['crawl_urls'].append(url)
                except Exception as exc:
                    blocked.add(backend)
                    event(key,'discovery','failed',source,{'backend':backend,'query':query},f'{type(exc).__name__}: {str(exc)[:500]}')
                time.sleep(3)
            # Reuse known source links for the comparison, even if discovery fails.
            prior_row=prior.get(key,{})
            job['crawl_urls']=hints(record).get('urls',[])+job['crawl_urls']
            for field in ['website','unreviewed_website']:
                for url in prior_row.get(field,'').split('; '):
                    if url.startswith(('http://','https://')):job['crawl_urls'].append(url)
            # Give the official candidate and different directory publishers room
            # in the bounded crawl, instead of using two URLs from one website.
            urls=list(dict.fromkeys(job['crawl_urls']))
            official=[u for u in urls if not is_directory(u)]
            preferred=[u for u in urls if any((urlparse(u).hostname or '').endswith(d) for d in ['yellow.co.ke','medpages.info'])]
            selected=[];hosts=set()
            for url in official[:1]+preferred+urls:
                host=urlparse(url).hostname
                if host not in hosts:selected.append(url);hosts.add(host)
                if len(selected)==3:break
            job['crawl_urls']=selected
            DB.execute('UPDATE jobs SET status=?,result=? WHERE id=?',('discovery_completed' if job['successful_queries']==len(queries) else 'discovery_partial' if job['successful_queries'] else 'search_failed',json.dumps(job),key));DB.commit()
            progress['completed_discovery']+=1
            (OUT/'progress.json').write_text(json.dumps(progress,indent=2),encoding='utf-8')
        if within_collection_window() and any(j['crawl_urls'] for j in work.values()):
            progress.update(status='crawling_sources',updated_at_utc=collect.now())
            (OUT/'progress.json').write_text(json.dumps(progress,indent=2),encoding='utf-8')
            settings={'CLOSESPIDER_TIMEOUT':max(1,STOP_AT-time.time())} if STOP_AT else {}
            process=CrawlerProcess(settings);crawler=process.create_crawler(Contacts);process.crawl(crawler,work=work);process.start()
        for key,job in work.items():
            if hints(job['record']).get('reviewed_observations'):
                job['review_notes'].append('Includes research-assisted directory candidates; local retrieval was not successful. See research_assisted_fields and observation collection_method.')
            for reviewed in hints(job['record']).get('reviewed_observations',[]):
                item=observation(reviewed['field'],reviewed['value'],reviewed['source_url'],reviewed['collected_on'],'Research-assisted directory entry; local retrieval failed; exact facility requires review')
                item.update(collection_method='web_research',date_precision='day')
                job['observations'].append(item)
            completed=DB.execute('SELECT count(*) FROM attempts WHERE company_id=? AND stage="website" AND status="completed"',(key,)).fetchone()[0]
            job['collection_status']=collection_status(job)
            if not within_collection_window():
                job['review_notes'].append('Timed collection window ended; this record remains eligible for the next restart batch.')
            if args.restart_batch and within_collection_window():
                status=DB.execute('SELECT status FROM jobs WHERE id=?',(key,)).fetchone()[0]
                DB.execute('INSERT OR REPLACE INTO restart_progress VALUES(?,?,?)',(key,collect.now(),status))
            DB.execute('UPDATE jobs SET result=? WHERE id=?',(json.dumps(job),key));DB.commit()
    finally:
        export_tables(ids)
        summary=dict(companies=len(ids),elapsed_seconds=round(time.monotonic()-started,2),disabled_backends=sorted(blocked),browser_used=False,google_backend_used=False,profiles_updated=0,statuses=dict(DB.execute('SELECT status,count(*) FROM jobs GROUP BY status')),observations=sum(len(j['observations']) for j in work.values()),research_assisted_observations=sum(o.get('collection_method')=='web_research' for j in work.values() for o in j['observations']))
        (OUT/'summary.json').write_text(json.dumps(summary,indent=2),encoding='utf-8');print(json.dumps(summary),flush=True)
        if args.restart_batch:disabled_file.write_text(json.dumps(sorted(blocked)),encoding='utf-8')
        progress.update(status='finished' if len(work)==len(ids) and all('collection_status' in j for j in work.values()) else 'interrupted',updated_at_utc=collect.now())
        (OUT/'progress.json').write_text(json.dumps(progress,indent=2),encoding='utf-8')


if __name__=='__main__':main()
