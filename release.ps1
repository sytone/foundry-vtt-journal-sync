$moduleManifest = (Get-Content .\module.json -Raw | ConvertFrom-Json -Depth 10)
Write-Host "Current Version: $($moduleManifest.version)"
$newVersion = Read-Host -Prompt "Enter Release Version"

$moduleManifest.version = $newVersion
$moduleManifest.manifest = "https://github.com/sytone/foundry-vtt-journal-sync/releases/download/v$newVersion/module.json"
$moduleManifest.download = "https://github.com/sytone/foundry-vtt-journal-sync/releases/download/v$newVersion/v$newVersion.zip"
$moduleManifest.readme = "https://github.com/sytone/foundry-vtt-journal-sync/releases/download/v$newVersion/README.md"
$moduleManifest.changelog = "https://github.com/sytone/foundry-vtt-journal-sync/releases/download/v$newVersion/CHANGELOG.md"

$moduleManifest | ConvertTo-Json | Set-Content .\module.json
git add .
git commit -m "Updating release version to: v$($moduleManifest.version)"
Write-Host "Tagging head with v$($moduleManifest.version)"
git tag "v$($moduleManifest.version)" -m "Release v$($moduleManifest.version)" -e
Write-Host "Pushing tag for build"
git push origin "v$($moduleManifest.version)"
git push

$released = $false
while (-not $released) {
    Write-Host "Pulling https://github.com/sytone/foundry-vtt-journal-sync/releases/download/v$($moduleManifest.version)/module.json"
    $bytes = (Invoke-WebRequest "https://github.com/sytone/foundry-vtt-journal-sync/releases/download/v$($moduleManifest.version)/module.json" -SkipHttpErrorCheck).Content

    [System.Text.Encoding]::ASCII.GetString($bytes) | Set-Content "$env:TMP\module.temp.json" -NoNewLine -Force
    if ((Get-Content .\module.json -Raw).Replace("`r`n", "`n") -eq (Get-Content "$env:TMP\module.temp.json" -Raw)) {
        Write-Host "Release completed, validating."
        $released = $true
    } 
    else { 
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 5
    }    
}

$moduleManifest = (Get-Content .\module.json -Raw | ConvertFrom-Json -Depth 10)

if((Invoke-WebRequest "https://github.com/sytone/foundry-vtt-journal-sync/releases/download/v$($moduleManifest.version)/module.json" -SkipHttpErrorCheck).StatusCode -eq 200) {
    Write-Host "Manifest valid."
} else {
    Write-Host "Issue with manifest." -ForegroundColor Red
}

if((Invoke-WebRequest $moduleManifest.download -SkipHttpErrorCheck).StatusCode -eq 200) {
    Write-Host "ZIP Download valid."
} else {
    Write-Host "Issue with ZIP Download." -ForegroundColor Red
}

if((Invoke-WebRequest $moduleManifest.readme -SkipHttpErrorCheck).StatusCode -eq 200) {
    Write-Host "README.md valid."
} else {
    Write-Host "Issue with README.md." -ForegroundColor Red
}

if((Invoke-WebRequest $moduleManifest.changelog -SkipHttpErrorCheck).StatusCode -eq 200) {
    Write-Host "CHANGELOG.md valid."
} else {
    Write-Host "Issue with CHANGELOG.md." -ForegroundColor Red
}
