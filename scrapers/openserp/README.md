# OpenSERP company contact collection

Runs free, local Google searches through OpenSERP and collects published business contacts from candidate company websites. No paid API, proxy, CAPTCHA solver, AI service or Google API is enabled. Original Infoxem records and profiles are never overwritten.

## Installed components

- OpenSERP v0.8.17, MIT: https://github.com/karust/openserp/releases/tag/v0.8.17
- Source commit: `948f0acdef79181314ffc4e7109e9673242f22a9`.
- Windows AMD64 download SHA-256: `5c03543863c00fc16e4285380bb6b066b1d130d8624cd06285fe52f711ddc21d`.
- The executable and reviewed source are under `runtime/`, excluded from Git.
- Uses existing Chrome, not the previous scraper's browser/environment.
- Collector uses Python 3.13's standard library. CSV presentation uses the bundled Codex Artifact Tool through the local `node_modules` junction.

The local service listens only on `127.0.0.1:7071`. It runs one browser, disables paid challenge solving and search-engine fallback, and stops requests after a source block. Ordinary website requests check public destinations, redirects and robots.txt and visit up to three pages per eligible website. Website contacts remain labelled as branch-unverified.

## Run

From `F:\Infoxem-project` in PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scrapers/openserp/run.ps1 -Limit 10
```

Export saved data without making search requests:

```powershell
powershell -ExecutionPolicy Bypass -File scrapers/openserp/run.ps1 -ExportOnly
```

The queue remembers source blocks. Do not repeatedly restart against an unchanged Google CAPTCHA. Once access conditions have changed, use `-RetryBlocked` to retry earlier failures. After reviewing a successful pilot, increase `-Limit` to process the remaining companies. Every search keeps its source, collection time and permanent attempt history.

## Verified browser recovery

The 31 October recovery test found that completing Google's CAPTCHA in an interactive browser restored that browser's searches. OpenSERP's separate browser still received CAPTCHA responses. This is a human-assisted recovery, not a demonstrated unattended bulk fix.

For that workflow, keep the verified browser session open. Capture its actual Google results as a JSON object containing `url`, `html` (rendered document HTML), and `captured_at_utc`. `import_verified_page.py` sends the captured page to OpenSERP's supported local `/google/parse` endpoint without submitting another Google request or copying browser cookies. It rejects CAPTCHA URLs and unrelated queries, saves the result and provenance, and preserves the independent browser's halt state.

```powershell
py -3.13 scrapers/openserp/import_verified_page.py --company-id wholesale-3311 --capture scrapers/outputs/openserp/verified-browser-page.json --evidence scrapers/outputs/openserp/reviewed-abacus-evidence.json
node scrapers/openserp/export.mjs
```

Start the local OpenSERP service first with `scrapers/openserp/runtime/openserp.exe serve --config scrapers/openserp/config.yaml`. Reviewed evidence is optional and must identify the same company, source links and actual collection dates. It is populated only after checking published source content. Other-country contacts and unreviewed website observations remain in the observation export, excluded from the main company's proposals. Google AI Overview text is not treated as contact evidence. Re-importing the same captured page is idempotent.

The recovery pilot parsed two Google result pages and collected official Kenya office contacts for Abacus plus a name/address-matched Mtaliano business listing. Company proposals still require review; no profile was overwritten. See `scrapers/outputs/openserp/recovery-report.md` for measured results and limits.

## Output

### Active name-based search policy

For each company, collect two or three different Google queries in the same verified interactive browser: quoted company name plus Kenya/contact/phone; the name with Limited/Ltd or spacing variations plus website/email; and, when useful, a shorter brand-name query. County is optional supporting context. Never put the Facility ID in a discovery query. Do not reject company contacts solely because a PPB street differs. Keep name collisions, conflicting contacts and exact-branch uncertainty visible.

Use `import_name_searches.py --company-id <local-link-id> --captures <two-or-three-JSON-files> --evidence <reviewed-evidence-JSON>` with the local parser service running. It merges query evidence into the existing result and preserves previous observations and permanent attempts. IDs link the output to Infoxem; they are not evidence that a Google result belongs to the company. The CSV includes query count, every query/source, review notes and matching policy. Existing profile data remains unchanged.

This is the active assisted workflow. The earlier `run.ps1` unattended single-query workflow remains halted and does not implement this new policy.

### Remaining-record local runner

`node scrapers/openserp/run_batches.mjs` starts the durable remaining-record workflow. It takes companies still marked `not_searched`, uses two name queries each, spaces Google queries by 45 seconds, and rests two minutes after every five companies. These limits reduce request volume; they do not guarantee access. It uses its own visible persistent Chrome profile, without copying any other browser's cookies. On a Google check it waits for the user in that same window and submits no further searches. Successful captures survive restarts; completed company jobs are omitted from the next plan.

The worker starts OpenSERP locally for HTML parsing, stores rendered captures, extracts name-matched business-panel contacts, and checks at most one plausible branded website per company. Automated observations stay `needs_review`; they appear in `unreviewed_phone`, `unreviewed_email`, `unreviewed_website` and `unreviewed_location` in the company CSV, with sources. Review is required before accepting identity, country or exact branch. Other office contacts are not automatically approved. The two queries are discovery evidence, not independent verification.

`scrapers/outputs/openserp/batch-progress.json` reports the live status and current company. CSVs are refreshed after each company and after a Google interruption. `remaining-plan.json` lists the saved work plan. Chrome and the computer must remain running. At these deliberate intervals, the full remaining queue would take roughly twelve days of continuous runtime, plus verification and source delays.

Create `scrapers/outputs/openserp/PAUSE` or `scrapers/outputs/openserp/STOP` to stop after the current company, or while waiting for human verification. Remove the marker and rerun the command to resume. Only one worker may run at a time; the process lock prevents duplicate starts. It records and stops on unexpected errors rather than skipping records. No profile is modified. Closing this chat is not a completion signal: check `batch-progress.json` for the actual local process state.

Files are in `scrapers/outputs/openserp`:

- `infoxem_companies.csv`: all original facility fields, stable Infoxem ID, existing imported location, collected website/email/phone/location, per-field status, source URLs, query, collection time and errors.
- `infoxem_candidates.csv`: all search candidates, with complete result JSON.
- `infoxem_observations.csv`: individually sourced website/contact observations.
- `infoxem_failures.csv`: failed source requests, including the actual response.
- `jobs.sqlite`: durable progress and attempt history.
- `raw/`: source evidence.
- `previous-collection/`: earlier data-only evidence; not mixed into new OpenSERP findings.
- `summary.json`, `csv-validation.json` and `verification.json`: counts and validation.

`Not Available` means there is no qualified collected value. Read the adjacent status: `not_searched`, `search_failed`, `collection_failed`, `not_verified`, `not_found`, or `needs_review`. A blocked search does not establish that a business lacks contact details. Imported street/county remain available separately even if no new location was collected.

The main `location` field preserves the imported street/county/country and is labelled `existing_import`, with its source file and precision. A newly collected alternative goes into `proposed_location` for review. No collection date is invented for the original import.

CSV uses UTF-8 with BOM, quoted fields and CRLF. Import IDs and phones as text in Excel. Values beginning with formula characters receive a leading apostrophe for safe spreadsheet display. Original unsanitized evidence stays in JSON/SQLite. Dates use ISO 8601 UTC.

## Checks

```powershell
py -3.13 -m unittest discover -s scrapers/openserp -p test_collect.py
```

OpenSERP's own documentation acknowledges CAPTCHA and rate-limit responses; browser mode does not guarantee access. A successful HTTP response does not guarantee complete business information or correct branch identity.
