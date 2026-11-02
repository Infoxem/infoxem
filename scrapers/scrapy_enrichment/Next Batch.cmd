@echo off
title Infoxem - Next Five Companies
cd /d "%~dp0..\.."
echo This searches the next five companies and refreshes the Excel workbook.
echo No Google browser or paid data service is used.
echo Keep this window open until the batch finishes.
echo.
"scrapers\.venv\Scripts\python.exe" "scrapers\scrapy_enrichment\restart_worker.py" --batches 1
echo.
echo Check scrapers\outputs\scrapy\restart-worker-status.json if an error was reported.
pause
