import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import collect
from import_verified_page import validate_page
from batch_processor import validate_capture, identity_tokens, snippet_observations


class CollectionTests(unittest.TestCase):
    def test_county_and_town_levels_are_not_literal_branch_names(self):
        record={'Facility Name':'ACCORD MEDICARE PHARMACY (Kiambu)','County':'Kiambu'}
        self.assertEqual(collect.branch_label(record),'')
        self.assertEqual(collect.county_match(record,'Green Valley Estate, Ruiru'),'supported')
        self.assertTrue(collect.branch_supported(record,'Green Valley Estate, Ruiru'))
        self.assertEqual(collect.county_match(record,'Green Valley Estate'),'unknown')
        self.assertEqual(collect.county_match(record,'Nairobi Road, Ruiru'),'supported')
        self.assertEqual(collect.county_match(record,'Nairobi Road'),'unknown')
        self.assertTrue(collect.branch_supported(record,'Green Valley Estate'))
        self.assertEqual(collect.county_match(record,'Nairobi and Kiambu branches'),'unknown')
        self.assertEqual(collect.county_match({'County':"Murang’a"},'Kisumu'),'conflicting')
        self.assertEqual(collect.county_match({'County':"Murang'a"},'Muranga'),'supported')
        self.assertEqual(collect.county_match({'Facility Name':'Nairobi Pharmacy Limited','County':'Kiambu'},'Nairobi Pharmacy Ltd contacts'),'unknown')
        self.assertEqual(len(collect.COUNTIES),47)

    def test_structured_arrays_and_separate_html_addresses(self):
        schema = {'telephone':['0720123456, 0733123456','0744123456'], 'email':['a@example.com','b@example.com'], 'address':[{'streetAddress':'Road One'},{'streetAddress':'Road Two'}]}
        values = collect.extract_contacts(collect.Page('<script type="application/ld+json">'+json.dumps(schema)+'</script><address>Building <b>One</b></address><address>Building Two</address>'))
        self.assertEqual(sum(field=='phone' for field,value in values),3)
        self.assertEqual(sum(field=='email' for field,value in values),2)
        for value in ['Road One','Road Two','Building One','Building Two']:
            self.assertIn(('location',value),values)

    def test_branch_suffix_does_not_hide_company_contacts(self):
        record={'Facility Name':'CROSWELL PHARMACY LIMITED-KAMAKIS','County':''}
        self.assertEqual(identity_tokens(record),{'croswell'})
        result={'results':[{'type':'organic','title':'Croswell pharmacy | Ruiru','snippet':'+254 748 377116 croswellpharmacy@gmail.com','google_source_url':'https://www.google.com/search?q=Croswell','collected_at_utc':'2026-10-31T09:00:00Z'}]}
        found=snippet_observations(record,result)
        self.assertIn(('email','croswellpharmacy@gmail.com'),[(o['field'],o['value']) for o in found])
        self.assertTrue(all(o['match_status']=='needs_review' for o in found))
        result['results'][0]['title']='Unrelated Pharmacy'
        self.assertEqual(snippet_observations(record,result),[])

    def test_blank_or_challenge_capture_is_not_a_missing_contact_result(self):
        for text in ('', 'Loading...', 'Our systems have detected unusual traffic'):
            with self.assertRaises(ValueError):
                validate_capture({'visible_text': text})
        validate_capture({'visible_text': 'Search Results\nExample Pharmacy'})
        validate_capture({'visible_text': 'Your search did not match any documents'})

    def test_block_and_parser_failures_are_not_empty_results(self):
        self.assertEqual(collect.classify_response(429, {'error': 'blocked'})[0], 'blocked')
        self.assertEqual(collect.classify_response(200, {'unexpected': []})[0], 'parse_failed')
        self.assertEqual(collect.classify_response(200, [])[0], 'parse_failed')
        self.assertEqual(collect.classify_response(200, {'results': [], 'meta': {}})[0], 'not_found')
        self.assertEqual(collect.classify_response(200, {'results': [{'engine': 'bing'}]})[0], 'parse_failed')

    def test_public_contacts_and_locations_from_html(self):
        page = collect.Page('<script type="application/ld+json">{"telephone":"+254 700 123456","address":{"streetAddress":"Latema Road","addressLocality":"Nairobi"}}</script><a href="mailto:office@example.org">Email</a><a href="tel:0700123456">Call</a><address>Latema Road, Nairobi</address><script>var fake="hidden@example.org"</script>')
        contacts = collect.extract_contacts(page)
        self.assertIn(('email', 'office@example.org'), contacts)
        self.assertIn(('phone', '+254 700 123456'), contacts)
        self.assertIn(('location', 'Latema Road, Nairobi'), contacts)
        self.assertNotIn(('email', 'hidden@example.org'), contacts)

    def test_name_location_and_domain_are_required(self):
        record = {'Facility Name': 'Abacus Pharma Ltd (Nairobi)', 'County': 'Nairobi'}
        self.assertEqual(collect.assess(record, 'Abacus Pharma', 'Contact Abacus in Nairobi', 'https://abacus.example.org')[0], 'candidate_company_site')
        self.assertEqual(collect.assess(record, 'Unrelated pharmacy', 'Nairobi pharmacy', 'https://other.example.org')[0], 'needs_review')
        self.assertEqual(collect.assess(record, 'Abacus Pharma', 'Abacus in Mombasa', 'https://abacus.example.org')[0], 'needs_review')

    def test_verified_browser_capture_rejects_challenges_and_wrong_company(self):
        record = {'Facility Name': 'Abacus Pharma (A) Ltd', 'County': 'Nairobi'}
        base = {'url': 'https://www.google.com/search?q=Abacus+Pharma+Kenya', 'html': '<html>Search results</html>', 'captured_at_utc': '2026-10-31T07:00:00Z'}
        self.assertEqual(validate_page(base, record), 'Abacus Pharma Kenya')
        with self.assertRaises(ValueError):
            validate_page({**base, 'url': 'https://www.google.com/sorry/index'}, record)
        with self.assertRaises(ValueError):
            validate_page({**base, 'url': 'https://www.google.com/search?q=Unrelated+Hotel'}, record)
        self.assertEqual(validate_page({**base, 'url': 'https://www.google.com/search?q=Amalgam+Chem+Pharmacy+Kenya'}, {'Facility Name': 'AMALGAMCHEM PHARMACY', 'County': ''}), 'Amalgam Chem Pharmacy Kenya')

    def test_failed_job_preserves_input_and_unsearched_queue(self):
        source = [{'Facility ID': '1', 'Facility Name': 'Test Pharmacy', 'Business Type': 'RETAIL', 'County': 'Nairobi', 'Street': 'Original Road'}, {'Facility ID': '2', 'Facility Name': 'Other', 'Business Type': 'RETAIL', 'County': '', 'Street': ''}]
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory)
            input_file = output / 'input.json'
            input_file.write_text(json.dumps(source), encoding='utf-8')
            with patch.object(collect, 'INPUT', input_file):
                db = collect.connect(output)
                collect.save_job(db, 'retail-1', 'Test Pharmacy Kenya', {'error': 'blocked'}, 'blocked', 'HTTP 429', 'http://127.0.0.1:7071/google/search', output)
                result = collect.export_tables(db, output)
                first, second = result['companies']
                self.assertEqual(first['Street'], 'Original Road')
                self.assertEqual(first['phone'], 'Not Available')
                self.assertEqual(first['phone_status'], 'search_failed')
                self.assertEqual(first['location'], 'Original Road, Nairobi, Kenya')
                self.assertEqual(first['location_status'], 'existing_import')
                self.assertEqual(first['proposed_location'], 'Not Available')
                self.assertEqual(second['search_status'], 'not_searched')
                self.assertEqual(len(result['failures']), 1)
                self.assertTrue(db.execute('SELECT 1 FROM state WHERE key="halt"').fetchone())
                db.close()

    def test_export_excludes_other_country_contacts_and_accepts_branch_listing(self):
        original = {'Facility ID': '1', 'Facility Name': 'Example Pharma', 'Business Type': 'RETAIL', 'County': 'Nairobi', 'Street': 'Original Road'}
        observations = [
            {'field': 'email', 'value': 'other-country@example.org', 'match_status': 'other_or_unspecified_office', 'source_url': 'https://example.org/contact'},
            {'field': 'email', 'value': 'kenya@example.org', 'match_status': 'candidate_company_site', 'source_url': 'https://example.org/contact'},
            {'field': 'phone', 'value': '0700123456', 'match_status': 'candidate_branch_listing', 'source_url': 'https://www.google.com/search?q=Example'},
        ]
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory)
            input_file = output / 'input.json'
            input_file.write_text(json.dumps([original]), encoding='utf-8')
            with patch.object(collect, 'INPUT', input_file):
                db = collect.connect(output)
                collect.save_job(db, 'retail-1', 'Example Pharma Nairobi', {'results': [], 'observations': observations}, 'completed', '', 'https://www.google.com/search?q=Example', output)
                row = collect.export_tables(db, output)['companies'][0]
                self.assertEqual(row['email'], 'kenya@example.org')
                self.assertEqual(row['phone'], '0700123456')
                self.assertEqual(row['Street'], original['Street'])
                self.assertEqual(row['location'], 'Original Road, Nairobi, Kenya')
                self.assertEqual(row['profile_updated'], 'No')
                db.close()


if __name__ == '__main__':
    unittest.main()
