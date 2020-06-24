# Foundry VTT Journal Sync


![journal-sync-downloads](https://img.shields.io/github/downloads-pre/sytone/foundry-vtt-journal-sync/latest/journal-sync.zip)

This module will allow you to export and import Journal entries to the server and store them as markdown files.

To export enter `/js export` in the chat. To import enter `/js import`

## Release Process

Create a release zip.

```pwsh
remove-item release.zip -Force; gci . -Exclude .git*, .vscode* |  Compress-Archive -DestinationPath release.zip  
```
