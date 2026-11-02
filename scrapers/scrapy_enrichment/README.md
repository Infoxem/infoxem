# DDGS and Scrapy contact collection

Browser-free replacement pilot for Infoxem. DDGS discovers pages through explicitly selected DuckDuckGo/Bing backends; Scrapy fetches public website pages. No browser, Google backend, Google API or paid data API is used. Search engines can still fail or block requests.

The first pilot selects two previously researched companies and three remaining companies. Results are stored separately under `scrapers/outputs/scrapy`; existing OpenSERP results and original Infoxem profiles are preserved. The all-company CSV retains the previous fields and appends `discovered_*` proposals, sources, dates and separate discovery/collection statuses. All new contacts require identity, country and branch review. A successful HTTP request is not a verified company match.

From the repository root:

```powershell
py -3.13 -m venv scrapers/.venv
scrapers/.venv/Scripts/python.exe -m pip install -r scrapers/scrapy_enrichment/requirements.txt
scrapers/.venv/Scripts/python.exe scrapers/scrapy_enrichment/run.py --pilot --limit 5
node scrapers/scrapy_enrichment/export.mjs
```

`--retry-pilot` reruns the saved pilot IDs and reuses successful discovery responses, preserving the previous pilot tables as an audit snapshot. `--export-only` rebuilds tables from the database without making network requests. Running without `--pilot` selects up to `--limit` remaining companies not yet attempted in the new queue. Failed jobs remain recorded and are not silently retried. Run one instance at a time. Ordinary manual commands do not start the separate restart worker.

Discovery now uses three different queries: a shorter quoted business name with optional county/branch context, a name/contact query, and a Kenyan-directory or reviewed-brand query. IDs and streets are not mandatory discovery signals. Generic “No results found” errors fall back to another backend without globally disabling an engine. Explicit CAPTCHA/access-denied/rate-limit responses disable that backend for the batch. Search failures and empty contact fields remain distinct.

`reviewed_sources.json` records source-backed company/brand relationships and research source hints, without hardcoding them as universal name equivalences. Brand matching requires the reviewed domain. Results need Kenyan geographic evidence before their contacts enter the candidate columns. Directory contacts are extracted only from the named business's structured entity; neighbouring business contacts and publisher contacts are excluded. Foreign/unknown-country results remain in the candidate history for audit rather than being treated as Kenyan company contacts.

Research-assisted observations have `collection_method=web_research` and date precision in the observation export. The main CSV lists these in `research_assisted_fields`. They are counted separately from local pipeline observations and do not imply that the local crawler fetched that source. Locally blocked directories remain failures even if web research supplies a candidate.

Scrapy follows robots.txt, uses four requests overall and one per domain, applies AutoThrottle, visits at most five pages per company and disables automatic retries. Redirects and initial requests are checked for public destinations. Candidate websites are selected using company-name support; known source links are reused for the comparison. Website data and social snippets can contain other-office or other-country contacts, so none is automatically approved or written into the application.

`jobs.sqlite` stores progress and attempt evidence. `raw/` stores fetched website HTML. `tables.json` is the export input; `summary.json` stores pilot timings and failures. CSV files are `companies.csv`, `pilot.csv`, `candidates.csv`, `observations.csv` and `failures.csv`. They use UTF-8 with BOM and quoted cells. Import phone numbers as text. Leading formula characters are escaped for spreadsheet display. The exporter uses the bundled Artifact Tool through the existing local runtime junction.

For a bounded wider sample, use `--representative --limit 20`. This selects four wholesale and sixteen retail records where available, spreading records across counties. It is a deliberately varied sample, not a random population estimate. The limit is enforced for both ordinary and varied sampling. `progress.json` records the selected IDs and discovery count. Preserve prior pilot exports before starting another sample.

After a run, `audit_sample.py` rechecks observations against saved HTML or the associated search result without network requests. Rejected observations stay in history with `excluded_from_discovered_fields=true` and an audit reason, while the main candidate columns omit them. Very short company names require their full business phrase rather than a generic word match. Run the exporter again after this audit. In the new workflow, read `scrapy_search_status` and `discovered_*`; older Google fields remain as historical data.

### Restart with all contacts and an Excel review workbook

The restart begins at the first original record, ignoring earlier pilot completion.
`restart_progress` tracks this separate pass. Prior observations and excluded evidence
remain available. The active workflow uses DuckDuckGo/Bing and public websites,
including Medpages and Yellow Pages Kenya; it does not reopen Google or Chrome.

All published phone numbers are retained. Kenyan formatting variants share a normalized
number, while original formats and every source remain in Contacts. Foreign numbers
remain labelled with an unconfirmed office. Addresses and locations appear in Locations
with a separate label instead of replacing the PPB street. A different street is not a
rejection signal. Publisher/footer contacts are excluded from directory business details.

The workbook is `scrapers/outputs/01a19071-infoxem-restart/Infoxem_Enrichment.xlsx`. It includes
Companies, Contacts, Locations, Searches, Failed lookups, Excluded evidence and Original
records, plus an Overview. All 8,804 rows are listed; completion applies only to records
processed in this restart. Missing fields say Not Available, which is not a claim that
no public contact exists. Candidates require review before updating company profiles.

To run five records manually:

```powershell
scrapers/.venv/Scripts/python.exe scrapers/scrapy_enrichment/run.py --restart-batch --limit 5
scrapers/.venv/Scripts/python.exe scrapers/scrapy_enrichment/audit_sample.py
scrapers/.venv/Scripts/python.exe scrapers/scrapy_enrichment/parse_saved_directories.py
scrapers/.venv/Scripts/python.exe scrapers/scrapy_enrichment/run.py --export-only
node scrapers/scrapy_enrichment/export.mjs
scrapers/.venv/Scripts/python.exe scrapers/scrapy_enrichment/workbook_data.py
node scrapers/scrapy_enrichment/export_workbook.mjs
```

`restart_worker.py` defaults to one five-record batch. `--batches N` permits a chosen number of batches, pausing 30 seconds
between batches and stopping if both search engines explicitly block requests. It uses
a single-worker lock and logs its status to `scrapers/outputs/scrapy/restart-worker-status.json`.
Create `scrapers/outputs/scrapy/PAUSE_RESTART` to stop after the current batch. Resume by removing
that marker and starting the worker again. Do not run manual batches alongside it.
The workbook refreshes after each batch; reopen Excel to see the new snapshot. If Excel
locks the file, a timestamped workbook is saved and `latest-workbook.json` identifies it.
The original company dataset is never overwritten. Keep the computer awake while running.

Tests:

```powershell
scrapers/.venv/Scripts/python.exe -m unittest discover -s scrapers/scrapy_enrichment -p test_run.py
```

When no worker is running, double-click `scrapers/scrapy_enrichment/Next Batch.cmd` to collect the next five records and refresh Excel in a visible console. The restart continues where the last saved batch ended. Do not launch a second copy while a collection run is active.

For the entire remaining queue, run `restart_worker.py --batches 1760`. The worker
stops earlier when the queue is complete. It writes a heartbeat every 15 seconds
during each collection/export step and stops if a step exceeds 15 minutes, a
batch makes no progress, the original dataset changes, or a required export fails.
Each published workbook is checked for archive integrity, eight expected sheets,
processed-record totals, company rows and Excel formula errors. Successful batches
are recorded in `scrapers/outputs/scrapy/restart-batch-history.jsonl`, including their search
statuses, workbook snapshot and original dataset hash. Monitoring can be enabled
separately when collection resumes; it is currently disabled following the user's
stop request.

For a time-limited collection run, use this from the project root after explicitly
resuming collection and removing the saved stop/pause markers:

```powershell
scrapers/.venv/Scripts/python.exe scrapers/scrapy_enrichment/restart_worker.py --batches 1760 --minutes 15
```

The deadline prevents new search queries and page requests after the collection
window. A request already in progress can finish within its timeout. Auditing and
CSV/Excel saves may finish afterward. If a batch is interrupted by the deadline,
its findings are retained, but its records remain eligible for the next run.
The worker then records `stopped_at_time_limit` and restores `STOP_RESTART`.
