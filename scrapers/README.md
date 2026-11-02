# Infoxem scrapers

Scraper code, local dependencies, collection evidence and exports live here,
separately from the Infoxem application.

```text
scrapers/
  scrapy_enrichment/     Current company discovery and contact collector
  openserp/              Earlier Google/OpenSERP tools and reused parsing helpers
  docs/                  Scraper research and implementation notes
  outputs/
    scrapy/              Current database, progress, raw pages and CSV files
    openserp/            Earlier collection evidence and browser diagnostics
    01a19071-infoxem-restart/  Excel workbooks and export metadata
    relocation/           File hashes and the folder-move verification report
  .venv/                 Isolated Python environment (not committed)
```

## Current status and results

Collection is stopped at the user's request. The saved restart has processed
115 of 8,804 records. The `STOP_RESTART` marker is intentionally retained.
Organizing the folders does not resume searches or enable monitoring.

The latest Excel file is identified by
`outputs/01a19071-infoxem-restart/latest-workbook.json`. Its stored path now points
inside this folder. CSVs and database progress are in `outputs/scrapy/`.
Historical reports and batch history retain their original recorded paths and
dates; they describe where files were saved at that time.

## Running and checking

Run commands from the project root (`F:\Infoxem-project`):

```powershell
scrapers/.venv/Scripts/python.exe -m unittest discover -s scrapers/scrapy_enrichment -p 'test_*.py'
scrapers/.venv/Scripts/python.exe -m unittest discover -s scrapers/openserp -p 'test_*.py'
```

When collection is explicitly resumed, remove the stop/pause markers in
`scrapers/outputs/scrapy/` and use
`scrapers/scrapy_enrichment/Next Batch.cmd` for the next five records.
Do not run concurrent collectors against the same database.
See [the current collector guide](scrapy_enrichment/README.md) for setup,
commands, matching rules and export behavior. Use `python.exe -m pip` to manage
this environment's packages.

## Adding another scraper

Add each new collector in its own folder, for example `google_maps/` or
`linkedin/`, with its own README, configuration and dependency requirements.
Save its generated data in `outputs/<collector-name>/` and research notes in
`docs/`. Add runtime/cache paths to the project's ignore rules. Share parsing
helpers only when they are actually reused; source-specific matching stays with
its collector. Neither of the example future collectors is implemented yet.

Keep existing company data intact, preserve source links and collection dates,
retain every supported contact number, label additional locations separately,
and track unsuccessful searches separately from missing contact fields.
