# Foundry VTT Journal Sync


![journal-sync-downloads](https://img.shields.io/github/downloads-pre/sytone/foundry-vtt-journal-sync/latest/journal-sync.zip)

This module will allow you to export and import Journal entries to the server and store them as markdown files.

To export enter `/js export` in the chat. To import enter `/js import`

By default all the files wil be stored under a folder called `journal-sync` off the Foundry VTT `Data` directory

## Editing the Journal Entries

You can use anything to do this however I find Visual Studio code good for this as it is a simple UI and works well with markdown. For bonus points you can run Visual Studio Code in a docker container if you are hosting it locally or on a local server. Then the UI for the notes is also web based. 

If you are running Foundry VTT locally just open the `journal-sync` folder under the `Data` directory and go to town. 

### Running VSCode in Docker

I use this on my home server to run a online version of VSCode, the second command gets the default password unless you configured it differently.

```
docker run -d -p 8282:8080 --name foundry-journal-editor --restart always -v "F:/foundry/data/Data/journal-sync:/home/coder/project" codercom/code-server:latest
docker exec -it foundry-journal-editor cat '/home/coder/.config/code-server/config.yaml'
```
