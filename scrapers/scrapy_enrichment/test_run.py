import unittest
import sqlite3
from unittest.mock import patch
import run
from audit_sample import audit


class MatchingTests(unittest.TestCase):
    def test_time_limit_prevents_new_search_and_page_requests(self):
        from unittest.mock import MagicMock
        with patch.object(run,'STOP_AT',10),patch.object(run.time,'time',return_value=11):
            client=MagicMock()
            self.assertEqual(run.discover('test','query','bing',set(),client),(None,None,None,None))
            client.text.assert_not_called()
            spider=run.Contacts(work={})
            self.assertIsNone(spider.request('test','https://example.com'))

    def test_same_name_medpages_business_in_another_country_is_not_attached(self):
        record={'Facility Name':'AB PHARMACEUTICALS LTD','County':'Nairobi'}
        body='<h1 class="main-name">AB Pharmaceuticals</h1><table class="info-table"><tr><td>Location</td><td>Gauteng, South Africa</td></tr><tr><td>Telephone</td><td>+27 123456789</td></tr></table><footer>Other countries: Kenya</footer>'
        self.assertEqual(run.scoped_contacts(record,body,'https://www.medpages.info/sf/test',run.name_match,run.contacts_from,run.collect.Page),[])

    def test_workbook_keeps_both_numbers_in_combined_legacy_value(self):
        from workbook_data import phone_parts,phone_key
        self.assertEqual([phone_key(v) for v in phone_parts('+254-202585695, +254 20 5210108')],['+254202585695','+254205210108'])
        self.assertEqual(phone_key('0720 606272'),phone_key('+254 720 606272'))

    def test_different_published_location_gets_separate_label(self):
        from workbook_data import location_label
        record={'Street':'Original Street','County':'Kiambu'}
        self.assertIn('Additional',location_label(record,'Ngara Road, Nairobi'))
        self.assertEqual(record['Street'],'Original Street')

    def test_directory_business_area_retains_multiple_numbers_and_address(self):
        record={'Facility Name':'AB PHARMACEUTICALS LTD','County':'Nairobi'}
        body='<div id="company-profile"><h2>AB Pharmaceuticals Ltd</h2><h5>Ngara Road, Nairobi</h5><p>+254 720 606272, 0733 123456</p></div><footer>Publisher 0723 550653</footer>'
        values=run.scoped_contacts(record,body,'https://yellow.co.ke/ab',run.name_match,run.contacts_from,run.collect.Page)
        self.assertIn(('phone','+254 720 606272'),values)
        self.assertIn(('phone','0733 123456'),values)
        self.assertIn(('address','Ngara Road, Nairobi'),values)
        self.assertNotIn(('phone','0723 550653'),values)

    def test_medpages_address_and_location_are_separate(self):
        record={'Facility Name':'AB PHARMACEUTICALS LTD','County':'Nairobi'}
        body='<h1 class="main-name">AB Pharmaceuticals</h1><table class="info-table"><tr><td>Address:</td><td>Ngara Road</td></tr><tr><td>Location</td><td>Nairobi, Kenya</td></tr><tr><td>Telephone</td><td>+254 720 606272 / 0733 123456</td></tr></table>'
        values=run.scoped_contacts(record,body,'https://www.medpages.info/sf/test',run.name_match,run.contacts_from,run.collect.Page)
        self.assertIn(('address','Ngara Road'),values)
        self.assertIn(('location','Nairobi, Kenya'),values)
        self.assertEqual(sum(f=='phone' for f,v in values),2)

    def test_successful_directory_contacts_survive_other_source_failure(self):
        job={'observations':[{'field':'phone','value':'0712345678','reason':'Contact belongs to a name-matched structured directory entity'}],'website_errors':[{'error':'HTTP 403'}]}
        self.assertEqual(run.collection_status(job),'completed_needs_review')
        job['observations'][0]['reason']='Name-matched search snippet; publisher URL https://example.org'
        self.assertEqual(run.collection_status(job),'snippet_candidates_only')

    def test_collapsed_search_cards_are_not_contact_evidence(self):
        self.assertFalse(run.clean_search_result({'title':'Chemist listing '+('other result '*30),'snippet':'Call 0790509684'}))
        self.assertFalse(run.clean_search_result({'title':'Chemist','snippet':'Other page text '*100}))
        self.assertTrue(run.clean_search_result({'title':'AB Pharmaceuticals Ltd | Yellow Pages Kenya Ltd','snippet':'Nairobi, Kenya +254 720 606272'}))

    def test_saved_source_audit_quarantines_short_name_collision(self):
        result={'record':{'Facility Name':'A TO Z PHARMACY LIMITED','County':'Kisumu'},'candidates':[{'url':'https://unrelated.example.org','title':'Welcome to our pharmacy','snippet':'Kenya'}],'observations':[{'field':'email','value':'office@example.org','source_url':'https://www.bing.com/search?q=test','reason':'Name-matched search snippet; publisher URL https://unrelated.example.org'}]}
        rejected=audit(result,'fixture')
        self.assertEqual(len(rejected),1)
        self.assertTrue(result['observations'][0]['excluded_from_discovered_fields'])

    def test_short_company_names_need_full_phrase(self):
        record={'Facility Name':'A TO Z PHARMACY LIMITED (Kisumu)','County':'Kisumu'}
        self.assertFalse(run.name_match(record,'Welcome to our pharmacy in Kenya'))
        self.assertTrue(run.name_match(record,'A to Z Pharmacy Kisumu contacts'))
        self.assertFalse(run.name_match({'Facility Name':'AB PHARMACEUTICALS LTD','County':''},'Other pharmaceuticals contact us'))

    def test_sample_is_bounded_and_covers_business_types_and_counties(self):
        records={str(n):{'Business Type':'WHOLESALE' if n<6 else 'RETAIL','County':str(n%3)} for n in range(30)}
        keys=list(records)
        self.assertEqual(run.select_sample(keys,records,5),keys[:5])
        sample=run.select_sample(keys,records,20,True)
        self.assertEqual(len(sample),20)
        self.assertEqual(len(set(sample)),20)
        self.assertEqual(sum(records[k]['Business Type']=='WHOLESALE' for k in sample),4)
        self.assertEqual(len({records[k]['County'] for k in sample}),3)
        self.assertEqual(run.select_sample(keys,records,0,True),[])

    def test_improved_queries_do_not_use_id_or_street(self):
        record={'Facility Name':'KAMWANGI PHARMACY (Kiambu)','County':'Kiambu','Facility ID':'PRIVATE-ID','Street':'STREET-NOT-REQUIRED'}
        queries=run.query_plan(record)
        self.assertEqual(len(set(queries)),3)
        self.assertIn('Kiambu',queries[0])
        self.assertTrue(all('PRIVATE-ID' not in q and 'STREET-NOT-REQUIRED' not in q for q in queries))

    def test_alias_requires_a_reviewed_domain(self):
        record={'Facility Name':'CENTELLA THERAPY LIMITED','County':''}
        self.assertTrue(run.alias_supported(record,'BÖNNE SKIN CARE','https://bonneskincare.com/contact/'))
        self.assertFalse(run.alias_supported(record,'Bonne','https://unrelated.example.org/'))

    def test_foreign_business_is_not_kenya_evidence(self):
        record={'Facility Name':'MEDORA HEALTH LIMITED - KITUI','County':'Kitui'}
        self.assertEqual(run.geography('Medora Health New York, NY','https://medora.example.org/contact',record),'foreign_or_conflicting')
        self.assertEqual(run.geography('Medora Health Kitui Kenya','https://medora.example.org/contact',record),'kenya_supported')

    def test_directory_contacts_are_scoped_to_named_business(self):
        record={'Facility Name':'KAMWANGI PHARMACY','County':'Kiambu'}
        schemas=[{'@type':'ItemList','itemListElement':[{'name':'Kamwangi Pharmacy','telephone':'0722872435','address':{'addressCountry':'Kenya'}},{'name':'Other Pharmacy','telephone':'0700000000','address':{'addressCountry':'Kenya'}}]}]
        found=run.directory_contacts(record,schemas,'https://www.cybo.com/KE/test')
        self.assertIn(('phone','0722872435'),found)
        self.assertNotIn(('phone','0700000000'),found)

    def test_discovery_fallback_and_cache_do_not_repeat_requests(self):
        previous=run.DB;run.DB=sqlite3.connect(':memory:')
        run.DB.execute('CREATE TABLE attempts(id INTEGER PRIMARY KEY,company_id TEXT,stage TEXT,status TEXT,source_url TEXT,checked_at TEXT,payload TEXT,error TEXT)')
        class Client:
            calls=[]
            def text(self,query,**kwargs):
                self.calls.append(kwargs['backend'])
                if kwargs['backend']=='duckduckgo':raise ValueError('No results found')
                return [{'title':'Example pharmacy','href':'https://example.org','body':''}]
        try:
            client=Client();disabled=set()
            with patch.object(run.time,'sleep'):
                first=run.discover('test','Example pharmacy Kenya','duckduckgo',disabled,client)
                second=run.discover('test','Example pharmacy Kenya','bing',disabled,client)
            self.assertEqual(first,second)
            self.assertEqual(client.calls,['duckduckgo','bing'])
            self.assertEqual(disabled,set())
            self.assertEqual(run.DB.execute('SELECT count(*) FROM attempts WHERE error!=""').fetchone()[0],1)
        finally:
            run.DB.close();run.DB=previous

    def test_pharmacy_name_does_not_match_financial_company(self):
        record={'Facility Name':'ABACUS PHARMA (A) LTD (Nairobi)','County':'Nairobi'}
        self.assertFalse(run.name_match(record,'Abacus investment and financial services'))
        self.assertTrue(run.name_match(record,'Abacus Pharma pharmaceutical contacts Kenya'))

    def test_branch_suffix_is_supporting_evidence(self):
        record={'Facility Name':'CROSWELL PHARMACY LIMITED-KAMAKIS','County':''}
        self.assertTrue(run.name_match(record,'Croswell Pharmacy Ruiru'))
        self.assertFalse(run.name_match(record,'Kam Pharmacy'))

    def test_visible_contacts_exclude_script_email(self):
        page=run.collect.Page('<p>Phone +254722901090</p><p>Email office@example.org</p><script>hidden@example.org</script>')
        result=run.contacts_from(page)
        self.assertIn(('email','office@example.org'),result)
        self.assertIn(('phone','+254722901090'),result)
        self.assertNotIn(('email','hidden@example.org'),result)


if __name__=='__main__':unittest.main()
