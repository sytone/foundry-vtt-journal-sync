$moduleManifest = (Get-Content .\module.json -Raw | ConvertFrom-Json -Depth 10)
Write-Host "Current Version: $($moduleManifest.version)"
$newVersion = Read-Host -Prompt "Enter Release Version"

$moduleManifest.version = $newVersion
$moduleManifest.download = "https://github.com/sytone/foundry-vtt-journal-sync/releases/download/v$newVersion/v$newVersion.zip"
$moduleManifest.readme = "https://github.com/sytone/foundry-vtt-journal-sync/releases/download/v$newVersion/README.md"
$moduleManifest.changelog = "https://github.com/sytone/foundry-vtt-journal-sync/releases/download/v$newVersion/CHANGELOG.md"

$moduleManifest | ConvertTo-Json | Set-Content .\module.json
git add .
git commit -m "Updating release version to: $($moduleManifest.version)"
Write-Host "Tagging head with $($moduleManifest.version)"
git tag $moduleManifest.version -m "Release $($moduleManifest.version)" -e
Write-Host "Pushing tag for build"
git push origin $moduleManifest.version
