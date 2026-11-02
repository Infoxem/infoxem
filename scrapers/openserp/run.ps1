param(
    [ValidateRange(1, 8804)][int]$Limit = 10,
    [switch]$ExportOnly,
    [switch]$RetryBlocked
)
$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$service = $null
Push-Location -LiteralPath $projectRoot
try {
    if (-not $ExportOnly) {
        try { $health = Invoke-RestMethod 'http://127.0.0.1:7071/health' -TimeoutSec 3 } catch { $health = $null }
        if (-not $health) {
            $service = Start-Process -FilePath (Join-Path $PSScriptRoot 'runtime/openserp.exe') -ArgumentList @('serve', '--config', 'scrapers/openserp/config.yaml') -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru
            $ready = $false
            for ($attempt = 0; $attempt -lt 10; $attempt++) {
                try { Invoke-RestMethod 'http://127.0.0.1:7071/health' -TimeoutSec 2 | Out-Null; $ready = $true; break } catch { Start-Sleep -Seconds 1 }
            }
            if (-not $ready) { throw 'The local OpenSERP service did not start.' }
        }
    }
    $collectorArgs = @('-3.13', 'scrapers/openserp/collect.py', '--limit', $Limit)
    if ($ExportOnly) { $collectorArgs += '--export-only' }
    if ($RetryBlocked) { $collectorArgs += '--retry-blocked' }
    & py @collectorArgs
    $collectorExit = $LASTEXITCODE
    if ($collectorExit -ne 0) { throw "Collection stopped with exit code $collectorExit" }
} finally {
    if (Test-Path -LiteralPath 'scrapers/outputs/openserp/tables.json') {
        & node scrapers/openserp/export.mjs
        if ($LASTEXITCODE -ne 0) { Write-Error 'CSV export failed; SQLite and JSON evidence are preserved.' }
    }
    if ($service -and -not $service.HasExited) { Stop-Process -Id $service.Id }
    Pop-Location
}
