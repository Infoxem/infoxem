import contextlib
import io
import json
import tempfile
import sqlite3
import unittest
from pathlib import Path
from unittest.mock import patch
import supabase_sync as sync


class SyncTests(unittest.TestCase):
    def test_accord_town_supports_county_but_afya_town_conflicts(self):
        item={'field':'phone','value':'0743330600','source_url':'https://search.example/','publisher_url':'https://publisher.example/accord'}
        job={'candidates':[{'url':item['publisher_url'],'title':'Accord Medicare Pharmacy','snippet':'Green Valley Estate, Ruiru 0743330600','name_supported':True,'geography':'kenya_supported'}]}
        self.assertTrue(sync.publishable({'Facility Name':'ACCORD MEDICARE PHARMACY (Kiambu)','County':'Kiambu','Street':'GREEN VALLEY ESTATE'},item,job))
        self.assertFalse(sync.publishable({'Facility Name':'AFYA CHEMIST (Murang\'a)','County':"Murang'a"},{**item,'source_text':'Afya Chemist, Kisumu'},{}))
        # County compatibility alone cannot establish company identity or an explicit branch.
        self.assertFalse(sync.publishable({'Facility Name':'CROSWELL PHARMACY LIMITED-KAMAKIS','County':'Kiambu'},{**item,'source_text':'Croswell Ruiru'},{}))
        job['candidates'][0]['name_supported']=False
        self.assertFalse(sync.publishable({'Facility Name':'Different Pharmacy','County':'Kiambu'},item,job))

    def test_payload_keeps_publishers_url_paths_and_deduplicates_email(self):
        with tempfile.TemporaryDirectory() as folder:
            source=Path(folder)/'original.json'
            source.write_text(json.dumps([{'Business Type':'RETAIL','Facility ID':'1','Facility Name':'Example Pharmacy'}]),encoding='utf-8')
            path=Path(folder)/'jobs.sqlite'
            items=[{'field':'email','value':v,'source_url':'https://search.example/?q=x','publisher_url':u} for v,u in [('HELLO@example.com','https://publisher.example/a'),('hello@example.com','https://publisher.example/b'),(None,'')]]
            items += [{'field':'website','value':u,'source_url':'https://publisher.example/'} for u in ['https://example.com/Kenya','https://example.com/kenya']]
            with contextlib.closing(sqlite3.connect(path)) as db:
                db.execute('CREATE TABLE jobs(id,status,result)')
                db.execute('INSERT INTO jobs VALUES(?,?,?)',('retail-1','completed',json.dumps({'observations':items})))
                db.commit()
            with patch.object(sync,'SOURCE',source),patch.object(sync,'DATABASES',[('test',path,'jobs')]):
                rows=sync.build_payloads()['finding_companies']
            self.assertEqual(rows[0]['email'],['hello@example.com'])
            self.assertEqual(rows[0]['website'],['https://example.com/'])
            self.assertEqual(rows[0]['company_name'],'Example Pharmacy')
            self.assertEqual({e['publisher_url'] for e in rows[0]['evidence'] if e['field']=='website'},{'https://example.com/Kenya','https://example.com/kenya'})
            self.assertEqual({e['publisher_url'] for e in rows[0]['evidence'] if e['field']=='email'},{'https://publisher.example/a','https://publisher.example/b'})

    def test_normalization_preserves_url_path_case_and_rejects_missing_values(self):
        self.assertEqual(sync.normalized_value('website','https://Example.com/Kenya'),'https://example.com/')
        self.assertNotEqual(sync.web_url('https://example.com/Kenya'),sync.web_url('https://example.com/kenya'))
        self.assertEqual(sync.preferred_website_roots(['http://bonneskincare.com/','https://bonneskincare.com/about/','https://bonneskincare.com/contact/?q=x#y','https://bonneskincare.com/shop/']),['https://bonneskincare.com/'])
        self.assertEqual(sync.preferred_website_roots(['http://only-http.example/contact']),['http://only-http.example/'])
        self.assertEqual(sync.normalized_value('email','HELLO@example.com'),'hello@example.com')
        for value in [None,42,'None','null','Not Available','']:
            self.assertIsNone(sync.normalized_value('email',value))
        self.assertEqual(sync.publisher_url({'reason':'Search snippet; publisher URL https://example.com/Contact'}),'https://example.com/Contact')

    def test_branch_evidence_and_other_offices_remain_local(self):
        record={'Facility Name':'CROSWELL PHARMACY LIMITED-KAMAKIS'}
        item={'field':'phone','value':'0720123456','source_url':'https://example.com','publisher_url':'https://example.com/listing'}
        self.assertFalse(sync.publishable(record,item,{}))
        self.assertFalse(sync.publishable(record,{**item,'source_text':'Croswell Nakuru Kenya'},{}))
        self.assertTrue(sync.publishable(record,{**item,'source_text':'Croswell Kamakis Kenya'},{}))
        self.assertFalse(sync.publishable(record,{**item,'source_text':'Croswell Kamakis Kenya','match_status':'other_or_unspecified_office'},{}))

    def test_retractions_survive_failure_and_are_cancelled_if_findings_return(self):
        class Client:
            def request(self,*args): pass
            def delete(self,*args): raise RuntimeError('offline')
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'state.sqlite'
            state=sync.SyncState(path)
            state.stage({'finding_companies':[{'id':'company'}]})
            state.stage({'finding_companies':[]})
            with self.assertRaises(RuntimeError): state.flush(Client())
            state.db.close()
            state=sync.SyncState(path)
            try:
                self.assertEqual(state.status()['pending'],1)
                self.assertEqual(state.db.execute('SELECT id FROM retractions').fetchone()[0],'company')
                state.stage({'finding_companies':[{'id':'company'}]})
                self.assertEqual(state.db.execute('SELECT count(*) FROM retractions').fetchone()[0],0)
                client=type('Client',(),{'request':lambda *args:None,'delete':lambda *args:None,'touch_company':lambda *args:None})()
                state.stage({'finding_companies':[]})
                state.flush(client)
                self.assertEqual(state.status()['pending'],0)
            finally: state.db.close()

    def test_retry_after_is_bounded_and_reports_progress(self):
        from urllib.error import HTTPError
        from unittest.mock import MagicMock
        progress=MagicMock()
        with patch.dict(sync.os.environ,{'SUPABASE_URL':'https://example.supabase.co','SUPABASE_SECRET_KEY':'sb_secret_test'}):
            client=sync.Client(progress)
            error=HTTPError('https://example.com',429,'rate limit',{'Retry-After':'999999'},None)
            response=MagicMock()
            with patch.object(sync,'urlopen',side_effect=[error,response]),patch.object(sync.time,'sleep') as sleep:
                client.request('finding_companies',[])
            self.assertEqual(sum(call.args[0] for call in sleep.call_args_list),30)
            self.assertTrue(any(call.kwargs.get('sync_status')=='retry_wait' for call in progress.call_args_list))

    def test_reset_discards_old_schema_acknowledgements(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'sync.sqlite'
            state = sync.SyncState(path)
            state.stage({'companies': [{'id': 'old'}], 'company_finding_evidence': [{'id': 'old-evidence'}]})
            state.db.close()
            state = sync.SyncState(path)
            try:
                self.assertEqual(state.db.execute('SELECT count(*) FROM uploads').fetchone()[0], 0)
            finally:
                state.db.close()

    def test_import_preserves_all_original_fields_and_known_exclusions(self):
        originals = json.loads(sync.SOURCE.read_text(encoding='utf-8'))
        company_id = originals[0]['Business Type'].lower() + '-' + originals[0]['Facility ID']
        with tempfile.TemporaryDirectory() as folder:
            databases = []
            for collector, table, excluded in [('openserp', 'companies', False), ('scrapy', 'jobs', True)]:
                path = Path(folder) / (collector + '.sqlite')
                db = sqlite3.connect(path)
                try:
                    db.execute('CREATE TABLE '+table+' (id TEXT,status TEXT,result TEXT)')
                    db.execute('INSERT INTO '+table+' VALUES(?,?,?)', (company_id, 'completed', json.dumps({'observations': [{'field': 'phone', 'value': '0720 123456', 'source_url': 'https://example.com/contact', 'excluded_from_discovered_fields': excluded}]})))
                    db.commit()
                finally:
                    db.close()
                databases.append((collector, path, table))
            with patch.object(sync, 'DATABASES', databases):
                payload = sync.build_payloads()
        self.assertEqual(len(payload['imported_companies']), 8804)
        self.assertEqual([row['original_fields'] for row in payload['imported_companies']], originals)
        self.assertEqual(sum(bool(row['original_fields'].get('HTML comment: Superintendent')) for row in payload['imported_companies']), 8790)
        self.assertEqual(payload['finding_companies'], [])

    def test_findings_are_grouped_into_one_company_with_sources(self):
        payload = sync.build_payloads()
        rows = payload['finding_companies']
        self.assertGreater(len(rows), 0)
        self.assertEqual(len(rows), len({row['id'] for row in rows}))
        for row in rows:
            self.assertTrue(row['evidence'])
            for item in row['evidence']:
                self.assertTrue({'scope', 'reason', 'match_status', 'audit_reason', 'excluded'}.isdisjoint(item))
            self.assertTrue(all(item['company_id'] == row['id'] for item in row['evidence']))
            self.assertTrue(any(row[column] for column in ['phone_mobile','email','website','address']))

    def test_phone_format_variants_share_a_key(self):
        self.assertEqual(sync.normalize_phone('0720 123456'), sync.normalize_phone('+254 720 123456'))

    def test_successful_retry_is_idempotent_and_modified_data_becomes_pending(self):
        class Client:
            calls = 0
            def request(self, table, rows):
                self.calls += 1
        with tempfile.TemporaryDirectory() as folder:
            state = sync.SyncState(Path(folder) / 'sync.sqlite')
            try:
                payload = {'imported_companies': [{'id': 'test', 'name': 'Example'}]}
                state.stage(payload)
                client = Client()
                with contextlib.redirect_stdout(io.StringIO()):
                    state.flush(client)
                    state.stage(payload)
                    state.flush(client)
                self.assertEqual(client.calls, 1)
                self.assertEqual(state.status()['pending'], 0)
                state.stage({'imported_companies': [{'id': 'test', 'name': 'Updated'}]})
                self.assertEqual(state.status()['pending'], 1)
            finally:
                state.db.close()

    def test_partial_failure_keeps_only_unconfirmed_chunk_pending(self):
        class Client:
            calls = 0
            def request(self, table, rows):
                self.calls += 1
                if self.calls == 2:
                    raise RuntimeError('Connection failed')
        with tempfile.TemporaryDirectory() as folder:
            state = sync.SyncState(Path(folder) / 'sync.sqlite')
            try:
                state.stage({'imported_companies': [{'id': str(i)} for i in range(501)]})
                with contextlib.redirect_stdout(io.StringIO()), self.assertRaises(RuntimeError):
                    state.flush(Client())
                self.assertEqual(state.status()['pending'], 1)
            finally:
                state.db.close()

    def test_transient_network_error_retries_without_research(self):
        with patch.dict(sync.os.environ, {'SUPABASE_URL': 'https://example.supabase.co', 'SUPABASE_SECRET_KEY': 'sb_secret_test'}):
            client = sync.Client()
            with patch.object(sync, 'urlopen', side_effect=sync.URLError('offline')) as send, patch.object(sync.time, 'sleep'):
                with self.assertRaisesRegex(RuntimeError, 'remains pending'):
                    client.request('companies', [{'id': 'example'}])
                self.assertEqual(send.call_count, 4)


if __name__ == '__main__':
    unittest.main()
