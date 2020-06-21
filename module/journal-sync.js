"use strict";
import * as Constants from "./constants.js"
import * as Logger from './logger.js'
import * as FS from './journalFileSystem.js'

let markdownSourcePath;
let newImportedFiles = "";

export let fetchParams = (silent = false) => {
    markdownSourcePath = game.settings.get(Constants.MODULE_NAME, "MarkdownSourcePath");
}

export function initModule() {
    Logger.log("Init Module entered")
    fetchParams(true);

}

function validmarkdownSourcePath() {
    let validMarkdownSourcePath = markdownSourcePath.replace("\\", "/");
    validMarkdownSourcePath += validMarkdownSourcePath.endsWith("/") ? "" : "/";
    validMarkdownSourcePath += game.world.name + "/";
    return validMarkdownSourcePath;
}

export function readyModule() {
    Logger.log("Ready Module entered")
    fetchParams();

    // Create markdownSourcePath if not already there.
    let buildPath = '';
    validmarkdownSourcePath().split('/').forEach((path) => {
        buildPath += path + '/';
        FS.createDirectory("data", buildPath)
            .then((result) => {
                Logger.log(`Creating ${buildPath}`);
            })
            .catch((error) => {
                if (!error.includes("EEXIST")) {
                    Logger.log(error);
                }
            });
    });

    Hooks.on("preCreateChatMessage", (data, options, userId) => {
        if (data.content === undefined || data.content.length == 0) return;
        let content = data.content || "";
        if (!content.trim().startsWith("/js")) return;

        let command = content.replace("/js", "").trim();

        switch (command) {
            case "help":
                data.content = "HERE IS HELP!";
                return true;
                break;

            case "test": // /js test
                FS.browse("data", validmarkdownSourcePath()).then((result) => {
                    // ChatMessage.create({content: JSON.stringify(result)});
                });

                console.log(game.journal);
                game.journal.forEach((value, key, map) => {
                    Logger.log(`m[${key}] = ${value.data.name} - ${value.data.folder} - ${value.data.content}`);
                });
                return false;
                break;


            case "export": // /js export

                let journalFolders = createFolderTree(game.folders.filter(f => (f.data.type === "JournalEntry") && f.displayed))

                journalFolders.forEach(folderEntity => {
                    exportFolder(folderEntity, validmarkdownSourcePath());
                });

                game.journal.filter(f => (f.data.folder === "")).forEach((value, key, map) => {
                    Logger.log(`m[${key}] = ${value.data.name} - ${value.data.folder} - ${value.data.type}`);
                    exportJournal(value, validmarkdownSourcePath());
                });

                return false;
                break;

            case "import": // /js import

                FS.browse("data", validmarkdownSourcePath()).then((result) => {
                    result.files.forEach(file => {
                        importFile(file);
                    });
                    result.dirs.forEach(folder => {
                        importFolder(folder, validmarkdownSourcePath());
                    });
                    // if(newImportedFiles === "") {
                    //     return false;
                    // } else {
                    //     data.content = `WARNING: If you have added new files to be imported please run export and delete the orginal files otherwise they will be duplicated. All files should have the ID in brackets at the end. <br />Newly Imported Files:<br />${newImportedFiles}`;
                    //     return true;
                    // }
                });



                return false;
                break;

            default:
                data.content = "HERE IS HELP!";
                return true;
                break;
        }
    });
}

const generateJournalFileName = (journalEntity) => {
    return `${journalEntity.name} (${journalEntity.id}).md`
}

const getJournalIdFromFilename = (fileName) => {
    // 'sdfkjs dflksjd kljf skldjf(IDIDIDIID).md
    return last(fileName.split('(')).replace(').md','');
}

const getJournalTitleFromFilename = (fileName) => {
    // 'sdfkjs dflksjd kljf skldjf(IDIDIDIID).md
    return fileName.replace(`(${getJournalIdFromFilename(fileName)}).md`, '');
}

const last = (array) => {
    return array[array.length - 1];
}

const importFolder = (folder, parentFolder) => {

    FS.browse("data", folder).then((result) => {
        result.files.forEach(file => {
            importFile(file);
        });
        result.dirs.forEach(folder => {
            importFolder(folder, validmarkdownSourcePath());
        });
    });    

}

const importFile = (file, parentPath) => {

    var journalPath = decodeURIComponent(file).replace(validmarkdownSourcePath(), '')
    var journalId = getJournalIdFromFilename(journalPath);
    var journalName = getJournalTitleFromFilename(last(journalPath.split('/')));

    
    fetch('/' + file).then(response => {
        response.text().then(journalContents => {
            let updated = false;
            var converter = new showdown.Converter()
            let md = converter.makeHtml(journalContents);  

            game.journal.filter(f => (f.id === journalId)).forEach((value, key, map) => {
                Logger.log(`Importing ${journalPath} with ID ${journalId} named ${journalName}`);
                 value.update({content: md});
                 updated = true;
            });
            if(!updated) {
                Logger.log(`Creating ${journalPath} with ID ${journalId} named ${journalName}`);
                journalName = last(journalPath.split('/')).replace('.md','');
                JournalEntry.create({name: journalName, content: md, folder: undefined}).then(journal => {journal.show();});
                ChatMessage.create({content: `Added ${journalName}, please run export and delete '${journalName}.md'`});
            }
            
        });
        
    });
}

const exportFolder = (folder, parentPath) => {
    let folderPath = parentPath + '/' + folder.data.name;

    // Create folder directory on server. 
    FS.createDirectory("data", folderPath)
        .then((result) => {
            Logger.log(`Creating ${folderPath}`);
            folder.content.forEach(journalEntry => {
                exportJournal(journalEntry, folderPath);
            });
        })
        .catch((error) => {
            if (!error.includes("EEXIST")) {
                Logger.log(error);
            } else {
                Logger.log(`${folderPath} exists`);
                folder.content.forEach(journalEntry => {
                    exportJournal(journalEntry, folderPath);
                });
            }
        });


    // Recurse for any sub folders. 
    folder.children.forEach(folderEntity => {
        exportFolder(folderEntity, folderPath);
    });
}

const exportJournal = (journalEntry, parentPath) => {
    // Export any journals in the folder.
    var converter = new showdown.Converter()
    let md = converter.makeMarkdown(journalEntry.data.content).split('\r\n');
    let journalFileName = generateJournalFileName(journalEntry);

    FS.upload("data", parentPath, new File(md, journalFileName), { bucket: null })
        .then((result) => {
            Logger.log(`Uploading ${parentPath}/${journalFileName}`);
        })
        .catch((error) => {
            Logger.log(error);
        });
}

const createFolderTree = dataset => {
    let hashTable = Object.create(null);
    let dataTree = [];
    dataset.forEach(folderEntity => hashTable[folderEntity.id] = { ...folderEntity, childNodes: [] });

    dataset.forEach(folderEntity => {
        if (folderEntity.parent) {
            hashTable[folderEntity.parent.id].childNodes.push(hashTable[folderEntity.id]);
        } else {
            dataTree.push(hashTable[folderEntity.id]);
        }
    })
    return dataTree;
}

