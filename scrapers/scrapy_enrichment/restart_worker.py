"""Continue the authorized restart in five-record batches, with Excel snapshots."""
import json
import os
import sqlite3
import subprocess
import sys
import time
import zipfile
import argparse
import hashlib
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime,timezone

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'scrapers/outputs/scrapy'
BOOK=ROOT/'scrapers/outputs/01a19071-infoxem-restart'
STATE={}
sys.path.insert(0,str(ROOT/'scrapers'))
import supabase_sync


def sync_saved_results():
    state=supabase_sync.SyncState()
    try:
        state.stage(supabase_sync.build_payloads())
        update(sync_status='uploading')
        state.flush(supabase_sync.Client(progress=lambda **values: update(**values)))
        update(sync_status='uploaded',**state.status())
    except (ValueError,RuntimeError) as error:
        update(sync_status='pending',sync_error=str(error),**state.status())
        print('Upload pending: '+str(error),flush=True)
    finally:
        state.db.close()


def update(status=None,**values):
    if status is not None:STATE['status']=status
    STATE.update(values)
    STATE.update(pid=os.getpid(),updated_at_utc=datetime.now(timezone.utc).isoformat())
    temp=OUT/'restart-worker-status.pending.json'
    temp.write_text(json.dumps(STATE,indent=2),encoding='utf-8')
    temp.replace(OUT/'restart-worker-status.json')


def call(*args,allow_export_status=False):
    started=time.monotonic()
    update(step=list(args[1:]),step_started_at_utc=datetime.now(timezone.utc).isoformat(),step_elapsed_seconds=0)
    with subprocess.Popen(args,cwd=ROOT) as child:
        try:
            while True:
                try:
                    code=child.wait(timeout=15);break
                except subprocess.TimeoutExpired:
                    elapsed=round(time.monotonic()-started)
                    update(step_elapsed_seconds=elapsed)
                    if elapsed>=900:raise RuntimeError('Current step exceeded 15 minutes; stopped for investigation')
        except BaseException:
            child.kill();child.wait();raise
    if code and not allow_export_status:raise RuntimeError(f'Worker step failed ({code}): {args[1:]}')
    return code


def export_book():
    code=call('node','scrapers/scrapy_enrichment/export_workbook.mjs',allow_export_status=True)
    expected=json.loads((BOOK/'workbook-data.json').read_text(encoding='utf-8'))
    saved=json.loads((BOOK/'latest-workbook.json').read_text(encoding='utf-8'))
    file=Path(saved['path'].lstrip('/') if saved['path'].startswith('/F:') else saved['path'])
    if saved['updated_at_utc']!=expected['updated_at_utc']:raise RuntimeError('Workbook snapshot did not refresh')
    with zipfile.ZipFile(file) as z:
        if z.testzip():raise RuntimeError('Workbook archive validation failed')
        if 'xl/workbook.xml' not in z.namelist():raise RuntimeError('Workbook content missing')
        ns={'x':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        workbook=ET.fromstring(z.read('xl/workbook.xml'))
        if len(workbook.find('x:sheets',ns))!=8:raise RuntimeError('Workbook sheets missing')
        summary=ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        cells={c.attrib['r']:c for c in summary.findall('.//x:c',ns)}
        if float(cells['B6'].find('x:v',ns).text)!=expected['restart_completed']:raise RuntimeError('Workbook processed count does not match saved results')
        companies=ET.fromstring(z.read('xl/worksheets/sheet2.xml'))
        if len(companies.findall('x:sheetData/x:row',ns))<expected['total']:raise RuntimeError('Workbook company records missing')
        for name in z.namelist():
            if name.startswith('xl/worksheets/sheet') and name.endswith('.xml'):
                sheet=ET.fromstring(z.read(name))
                if any(c.attrib.get('t')=='e' for c in sheet.findall('.//x:c',ns)):raise RuntimeError('Workbook contains an Excel formula error')
    if code:print('Exporter returned nonzero; saved workbook passed independent content/timestamp validation.',flush=True)


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--minutes',type=float,default=0,help='Collection window; zero is unlimited');parser.add_argument('--batches',type=int,default=1,help='Maximum five-record batches; default is one')
    args=parser.parse_args()
    supabase_sync.Client().validate()
    if args.batches<1:parser.error('--batches must be at least 1')
    if args.minutes<0:parser.error('--minutes cannot be negative')
    stop_at=time.time()+args.minutes*60 if args.minutes else 0
    batches=0
    source_file=ROOT/'src/lib/facilities.json'
    source_hash=hashlib.sha256(source_file.read_bytes()).hexdigest()
    OUT.mkdir(exist_ok=True,parents=True)
    lock=OUT/'restart-worker.lock'
    try:
        fd=os.open(lock,os.O_CREAT|os.O_EXCL|os.O_WRONLY);os.write(fd,str(os.getpid()).encode());os.close(fd)
    except FileExistsError:
        raise RuntimeError('A restart worker lock already exists; inspect its process before resuming')
    try:
        while True:
            if stop_at and time.time()>=stop_at:
                (OUT/'STOP_RESTART').touch();update('stopped_at_time_limit',collection_stop_at_utc=datetime.fromtimestamp(stop_at,timezone.utc).isoformat());return
            if (OUT/'PAUSE_RESTART').exists() or (OUT/'STOP_RESTART').exists():update('stopped_by_user');return
            disabled=OUT/'restart-disabled-backends.json'
            if disabled.exists() and {'bing','duckduckgo'}.issubset(json.loads(disabled.read_text())):update('stopped_source_blocks');return
            with sqlite3.connect(OUT/'jobs.sqlite') as db:
                done=db.execute('SELECT count(*) FROM restart_progress').fetchone()[0]
                total=db.execute('SELECT count(*) FROM jobs').fetchone()[0]
            if done>=total:update('complete',processed=done,total=total);return
            if hashlib.sha256(source_file.read_bytes()).hexdigest()!=source_hash:raise RuntimeError('Original dataset changed during collection; stopped for review')
            update('collecting_batch',processed=done,total=total,batch_size=5,collection_stop_at_utc=datetime.fromtimestamp(stop_at,timezone.utc).isoformat() if stop_at else None)
            deadline_args=['--stop-at',str(stop_at)] if stop_at else []
            call(sys.executable,'scrapers/scrapy_enrichment/run.py','--restart-batch','--limit','5',*deadline_args)
            call(sys.executable,'scrapers/scrapy_enrichment/audit_sample.py')
            call(sys.executable,'scrapers/scrapy_enrichment/parse_saved_directories.py')
            sync_saved_results()
            call(sys.executable,'scrapers/scrapy_enrichment/run.py','--export-only')
            call('node','scrapers/scrapy_enrichment/export.mjs')
            call(sys.executable,'scrapers/scrapy_enrichment/workbook_data.py')
            update('saving_excel',processed_before_batch=done,total=total)
            export_book()
            with sqlite3.connect(OUT/'jobs.sqlite') as db:
                after=db.execute('SELECT count(*) FROM restart_progress').fetchone()[0]
                current=json.loads((OUT/'progress.json').read_text(encoding='utf-8'))
                states=[db.execute('SELECT status FROM jobs WHERE id=?',(key,)).fetchone()[0] for key in current['company_ids']]
            if after<=done and not (stop_at and time.time()>=stop_at):raise RuntimeError('No record progress after a batch; stopped for investigation')
            with (OUT/'restart-batch-history.jsonl').open('a',encoding='utf-8') as history:
                history.write(json.dumps({'saved_at_utc':datetime.now(timezone.utc).isoformat(),'processed':after,'batch_size':after-done,'search_statuses':states,'workbook':json.loads((BOOK/'latest-workbook.json').read_text()),'source_hash':source_hash})+'\n')
            batches+=1
            update('batch_saved',processed=after,pending=total-after,total=total,batches_saved=batches,workbook_verified=True)
            if batches>=args.batches:
                update('stopped_at_batch_limit',batches_saved=batches,total=total);return
            for _ in range(30):
                if stop_at and time.time()>=stop_at:break
                if (OUT/'PAUSE_RESTART').exists() or (OUT/'STOP_RESTART').exists():break
                time.sleep(1)
    except Exception as error:
        update('stopped_on_error',error=str(error));raise
    finally:
        lock.unlink(missing_ok=True)


if __name__=='__main__':main()
