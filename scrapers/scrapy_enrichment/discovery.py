"""Name queries, source ranking and scoped directory extraction."""
import json
import re
import unicodedata
from pathlib import Path
from urllib.parse import urlparse

DIRECTORIES=('cybo.com','goafricaonline.com','kenyabizlist.com','businesslist.co.ke','yellow.co.ke','yellowpageskenya.com','medpages.info','africabizinfo.com')
SOURCES=json.loads(Path(__file__).with_name('reviewed_sources.json').read_text(encoding='utf-8'))


def normalized(text):
    return re.sub(r'\s+',' ',re.sub(r'[^a-z0-9]+',' ',unicodedata.normalize('NFKD',text).encode('ascii','ignore').decode().lower())).strip()


def hints(record):
    name=normalized(record['Facility Name'])
    return next((item for item in SOURCES if normalized(item['company_name']) in name),{})


def query_plan(record):
    short=re.sub(r'\([^)]*\)','',record['Facility Name']).replace("\\'", "'")
    short=re.split(r'\b(?:LIMITED|LTD)\b',short,flags=re.I)[0]
    short=' '.join(short.split()).strip(' -')
    county=record.get('County','').strip()
    if not county:
        parts=re.split(r'\b(?:LIMITED|LTD)\s*[-–]\s*',record['Facility Name'],flags=re.I)
        if len(parts)>1:county=parts[-1].strip()
    first=' '.join(filter(None,[f'"{short}"',county,'Kenya']))
    second=f'"{short}" Kenya phone email contact'
    brand=hints(record).get('aliases',[])
    third=(f'"{brand[0]}" Kenya contact email' if brand else f'"{short}" (site:medpages.info OR site:yellow.co.ke OR site:kenyabizlist.com)')
    return [first,second,third]


def is_directory(url):
    host=urlparse(url).hostname or ''
    return any(host==d or host.endswith('.'+d) for d in DIRECTORIES)


def geography(text,url,record):
    low=normalized(text);host=(urlparse(url).hostname or '').lower();path=urlparse(url).path.lower()
    kenya=bool(re.search(r'\b(kenya|nairobi|kiambu|kitui|ruiru|mombasa|nakuru|kisumu)\b',low)) or host.endswith('.co.ke') or path.startswith(('/ke/','/ke-biz/')) or '+254' in text
    if kenya:
        import collect
        if collect.county_match(record,text)=='conflicting':return 'foreign_or_conflicting'
        return 'kenya_supported'
    if host.endswith(('.in','.ca','.com.au','.de','.vn')) or re.search(r'\b(india|pakistan|new york|vancouver|indonesia|kuwait|rwanda)\b',low):return 'foreign_or_conflicting'
    return 'country_unverified'


def alias_supported(record,text,url):
    item=hints(record);host=(urlparse(url).hostname or '').removeprefix('www.')
    return host in item.get('domains',[]) and any(normalized(a) in normalized(text) for a in item.get('aliases',[]))


def schema_entities(schemas):
    for node in schemas:
        if isinstance(node,list):yield from schema_entities(node)
        elif isinstance(node,dict):
            if node.get('name') and any(k in node for k in ('telephone','email','address')):yield node
            for value in node.values():
                if isinstance(value,(dict,list)):yield from schema_entities([value])
