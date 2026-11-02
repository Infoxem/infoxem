# Company database

The imported records and saved scraper findings have been uploaded. Original source files remain local.

- `imported_companies` (Imported Companies): one original record per company ID, including source order, original fields, collection status and timestamps.
- `finding_companies` (Finding Companies): one row per company with collected data. The company ID is both the primary key and a foreign key to Imported Companies. Separate phone/mobile, email, website and address columns hold multiple values. Address combines collected addresses and locations, displayed as Address / Location. Evidence stays in the same row, with source URLs and collection dates. Companies without collected data are not inserted.

Missing fields use empty arrays in the database and display “Not Available” on the website. Rejected evidence and scraper commentary remain local and are not uploaded. Contact fields display values only, without commentary or collection-date labels. Sources appear as category buttons under Record Details → Data Sources.

Both tables have read-only public access through row-level security. Only the private scraper credential can upload. There are no application database functions, triggers or views. The baseline migration creates the two tables and access rules; a following migration merges collected locations into address without removing their sources. The uploader sets update timestamps.

The website uses `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. The scraper uses `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in `scrapers/.env.local`. Never commit private settings.

From the project root, run `scrapers/.venv/Scripts/python.exe scrapers/supabase_sync.py` with one command:

- `validate`: check saved records without uploading.
- `check`: verify the database connection without uploading.
- `import`: back up local source files and upload companies and findings.
- `sync`: upload saved changes and retry pending work without new searches.
- `status`: show pending uploads.

The stopped scraper stays stopped. When deliberately restarted, the worker uploads after each audited batch, before Excel export. The website checks for changes every 60 seconds while visible. Lint, type checking, tests and build run through `pnpm check`.

## Collection and upload corrections

Structured contact lists and separate address blocks are parsed separately. Explicit branch names need matching source evidence; other or unspecified offices and unsupported brand variants stay local. The website and workbook use the same publication rules. Publisher URLs are retained alongside search URLs. Website path case is preserved, email variants are grouped, and invalid or missing values are skipped.

When a previously managed company loses its last accepted finding, a durable local retraction removes its Finding Companies row and refreshes its imported record timestamp. Failed retractions stay pending and can be retried with sync. Original imported records are retained. Upload retry delays are capped at 30 seconds, with heartbeat updates during waits.

## Town and county matching

Imported County values and collected address wording remain unchanged. The matching code uses the official county names and a small verified locality reference in `scrapers/openserp/kenya_places.json`; each locality includes its government source. Ruiru can support Kiambu County without the word Kiambu appearing in the source. Missing or unfamiliar places remain unknown. A clearly different known county is a conflict. County compatibility does not establish company identity or a named branch. Parenthetical names are no longer mandatory branch identifiers; explicit branch suffixes still require matching evidence. No additional database columns or tables are used.

## Website roots and company names

Finding Companies includes `company_name`, populated from Imported Companies by the uploader. Existing rows are backfilled by the migration. Website values contain only the origin plus `/`; subpages, query parameters and fragments are removed from the Website field. If both HTTP and HTTPS were collected for the same host, HTTPS is displayed once. HTTP-only sites remain HTTP. Source and publisher links keep their exact page paths as evidence. Raw local observations remain unchanged.

## Location display

Profile headers and sidebars display collected addresses when present, falling back to the imported street, county and country. Missing parts are omitted rather than combined with Not Available. Locations keeps the imported address separate from Collected Address / Location and labels the original county as County. These are display changes only; source records are not overwritten.
