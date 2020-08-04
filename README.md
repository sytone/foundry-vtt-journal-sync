# Foundry VTT Journal Sync

![journal-sync-downloads](https://img.shields.io/github/downloads/sytone/foundry-vtt-journal-sync/latest/total)

This module will allow you to export and import Journal entries to the server and store them as markdown files.

## Import and Export

There are two ways to import and export journal entries described below. If you are importing a new markdown file you will need to export it again so the ID of the Journal entry is added to the file. This allows the entry to be updated on the next import. Make sure you delete the old entry and only edit entries with the ID in the filename.

### Using Chat

To export enter `/js export` in the chat. To import enter `/js import`

### Using UI Buttons

By selecting the notes section on the left of the UI you will see two new buttons, one for import and one for export. 

By default all the files wil be stored under a folder called `journal-sync` off the Foundry VTT `Data` directory

## Editing the Journal Entries

You can use anything to do this however I find Visual Studio code good for this as it is a simple UI and works well with markdown. For bonus points you can run Visual Studio Code in a docker container if you are hosting it locally or on a local server. Then the UI for the notes is also web based. See Running VSCode in Docker below.

If you are running Foundry VTT locally just open the `journal-sync` folder under the `Data` directory and go to town. 

### Running VSCode in Docker

I use this on my home server to run a online version of VSCode, the second command gets the default password unless you configured it differently. This allows me to simply edit the Journals in a full screen from anywhere if I choose to expose the endpoint over the internet. 

```
docker run -d -p 8282:8080 --name foundry-journal-editor --restart always -v "F:/foundry/data/Data/journal-sync:/home/coder/project" codercom/code-server:latest
docker exec -it foundry-journal-editor cat '/home/coder/.config/code-server/config.yaml'
```

In settings you can add a link to the code-server instance and it will add a button below the import and export buttons. If you have the standard setup and used the commands above adding `http://<address or IP of machine running code-server>:8282/?folder=/home/coder/project` as the Journal Editor Link value will allow you to edit the Journal entries in the browser by clicking on the link.

## Release Process

Once all commits are created do the following.

1. Update module.json to change the version.
2. Tag the head `git tag v0.6.0 -m "Release v0.6.0" -e`
3. push the tag `git push origin v0.6.0`
