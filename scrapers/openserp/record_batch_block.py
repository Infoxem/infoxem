"""Record a human-verification interruption without erasing earlier data."""
import argparse
import collect

parser=argparse.ArgumentParser()
parser.add_argument('--company-id',required=True)
parser.add_argument('--query',required=True)
args=parser.parse_args()
db=collect.connect()
collect.record_attempt(db,args.company_id,'gradual_browser_search','blocked','https://www.google.com/search',{'query':args.query},'Google requested human verification; browser is waiting without submitting further queries')
collect.export_tables(db)
db.close()
