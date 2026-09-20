$ErrorActionPreference = 'Stop'
$trackerUrl = 'http://127.0.0.1:8765/Domino-Night.html'
$trackerReady = $false
try {
    $trackerResponse = Invoke-WebRequest -Uri $trackerUrl -TimeoutSec 2 -UseBasicParsing
    $trackerReady = $trackerResponse.Headers['X-Domino-Night'] -eq 'local-tracker-v1'
    if (-not $trackerReady) { throw 'Port 8765 is occupied by another app. Open Domino-Night.html directly instead.' }
} catch {
    if ($_.Exception.Message -like '*occupied*') { throw }
}
if (-not $trackerReady) {
    $trackerPython = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'
    if (-not (Test-Path -LiteralPath $trackerPython)) {
        $trackerCommand = Get-Command python -ErrorAction SilentlyContinue
        if ($trackerCommand) { $trackerPython = $trackerCommand.Source }
        else { Start-Process (Join-Path $PSScriptRoot 'Domino-Night.html'); exit }
    }
    Start-Process -FilePath $trackerPython -ArgumentList ('"' + (Join-Path $PSScriptRoot 'serve.py') + '"') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
    for ($trackerAttempt = 0; $trackerAttempt -lt 20; $trackerAttempt++) {
        Start-Sleep -Milliseconds 250
        try {
            $trackerResponse = Invoke-WebRequest -Uri $trackerUrl -TimeoutSec 1 -UseBasicParsing
            if ($trackerResponse.Headers['X-Domino-Night'] -eq 'local-tracker-v1') { $trackerReady = $true; break }
        } catch {}
    }
    if (-not $trackerReady) { throw 'Local launcher did not start. Open Domino-Night.html directly instead.' }
}
Start-Process $trackerUrl
