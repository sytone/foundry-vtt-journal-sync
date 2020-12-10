"use strict";
import * as Constants from "./constants.js"
import * as Logger from './logger.js'

let markdownPathOptions, markdownSourcePath, journalEditorLink, importWorldPath, exportWorldPath;
let enableTracing = false;
let newImportedFiles = "";
let skippedJournalFolders, skippedJournalEntries;

// parses the string back to something the FilePicker can understand as an option
export function parse(str) {
  let matches = str.match(/\[(.+)\]\s*(.+)/);
  if (matches) {
    let source = matches[1];
    const current = matches[2].trim();
    const [s3, bucket] = source.split(":");
    if (bucket !== undefined) {
      return {
        activeSource: s3,
        bucket: bucket,
        current: current,
      };
    } else {
      return {
        activeSource: s3,
        bucket: null,
        current: current,
      };
    }
  }
  // failsave, try it at least
  return {
    activeSource: "data",
    bucket: null,
    current: str,
  };
}

export async function fetchParams(silent = false) {
    markdownPathOptions = parse(game.settings.get(Constants.MODULE_NAME, "MarkdownSourcePath"));
    markdownSourcePath = markdownPathOptions.current;

    journalEditorLink = game.settings.get(Constants.MODULE_NAME, "JournalEditorLink");
    enableTracing = game.settings.get(Constants.MODULE_NAME, "EnableTracing");
    
    importWorldPath = game.settings.get(Constants.MODULE_NAME, "ImportWorldPath");
    exportWorldPath = game.settings.get(Constants.MODULE_NAME, "ExportWorldPath");

    skippedJournalFolders = game.settings.get(Constants.MODULE_NAME, "SkipJournalFolders").split(',');
    skippedJournalEntries = game.settings.get(Constants.MODULE_NAME, "SkipJournalEntries").split(',');

    // If the entries are empty it will set the array to one empty string ""
    // This matches the root path where the folder name is also 
    // "" so blocked export/import. If nothing set put a name in that no
    // one in their right mind would use :)
    if(skippedJournalFolders.length == 1 && skippedJournalFolders[0] === "") {
        skippedJournalFolders[0] = "NOTHINGHASBEENSETTOSKIP";
    }
    if(skippedJournalEntries.length == 1 && skippedJournalEntries[0] === "") {
        skippedJournalEntries[0] = "NOTHINGHASBEENSETTOSKIP";
    }
}

/**
 * Runs during the init hook of Foundry
 *
 * During init the settings and trace logging is set.
 *
 */
export async function initModule() {
    Logger.log("Init Module entered")
    await fetchParams(true);
    if (enableTracing) {
        Logger.enableTracing();
    }
}

export async function readyModule() {
    Logger.log("Ready Module entered")
    await fetchParams();

    Logger.log(`markdownSourcePath: ${markdownSourcePath}`)
    Logger.log(`validMarkdownSourcePath(): ${await validMarkdownSourcePath()}`)

    // Create markdownSourcePath if not already there.
    let buildPath = '';
    validMarkdownSourcePath().split('/').forEach((path) => {
        buildPath += path + '/';
        FilePicker.createDirectory(markdownPathOptions.activeSource, buildPath)
            .then((result) => {
                Logger.log(`Creating ${buildPath}`);
            })
            .catch((error) => {
                if (!error.includes("EEXIST")) {
                    Logger.log(error);
                }
            });
    });

    Hooks.on("preCreateChatMessage", async (data, options, userId) => {
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
                FilePicker.browse(markdownPathOptions.activeSource, "/").then((result) => {
                     ChatMessage.create({content: JSON.stringify(result)});
                });

                console.log(game.journal);
                game.journal.forEach((value, key, map) => {
                    Logger.log(`m[${key}] = ${value.data.name} - ${value.data.folder} - ${value.data.content}`);
                });
                return false;
                break;

            case "export": // /js export
                await startExport();
                return false;
                break;

            case "import": // /js import
                await startImport();
                return false;
                break;

            case "nukejournals":
                game.journal.forEach((value, key, map) => { JournalEntry.delete(value.id); });
                break;

            case "nukefolders":
                game.journal.forEach((value, key, map) => { JournalEntry.delete(value.id); });
                break;

            default:
                data.content = "HERE IS HELP!";
                return true;
                break;
        }
    });

    Hooks.on("getSceneControlButtons", (controls) => {
        let group = controls.find(b => b.name == "notes")
        group.tools.push({
            name: "import",
            title: "Import Journals",
            icon: "fas fa-file-import",
            onClick: () => {
                startImport();
            },
            button: true
        });
        group.tools.push({
            name: "export",
            title: "Export Journals",
            icon: "fas fa-file-export",
            onClick: () => {
                startExport();
            },
            button: true,
        });

        if (journalEditorLink != "") {
            group.tools.push({
                name: "edit",
                title: "Edit Journals",
                icon: "fas fa-edit",
                onClick: () => {
                    window.open(journalEditorLink, "_blank");
                },
                button: true,
            });
        }
    });
}

async function startImport() {
    await createJournalFolders(validMarkdownSourcePath()+validImportWorldPath(), null);
    let result = await FilePicker.browse(markdownPathOptions.activeSource, validMarkdownSourcePath()+validImportWorldPath());
    for (let [key, file] of Object.entries(result.files)) {
        if(isValidFile(file)) {
            await importFile(file);
        }
    }
    for (let [key, folder] of Object.entries(result.dirs)) {
        await importFolder(folder);
    }

    ui.notifications.info("Import completed");
    // FilePicker.browse(markdownPathOptions.activeSource, validMarkdownSourcePath()).then((result) => {
    //     console.log(result);
    //     result.files.forEach(file => {
    //         importFile(file);
    //     });
    //     result.dirs.forEach(folder => {
    //         importFolder(folder);
    //     });
    // });
}

async function startExport() {
    let journalFolders = await createFolderTree(game.folders.filter(f => (f.data.type === "JournalEntry") && f.displayed))

    journalFolders.forEach(folderEntity => {
        exportFolder(folderEntity, validMarkdownSourcePath()+validExportWorldPath());
    });

    game.journal.filter(f => (f.data.folder === "")).forEach((value, key, map) => {
        Logger.logTrace(`m[${key}] = ${value.data.name} - ${value.data.folder} - ${value.data.type}`);
        exportJournal(value, validMarkdownSourcePath()+validExportWorldPath());
    });
    ui.notifications.info("Export completed");
}

function validMarkdownSourcePath() {
    let validMarkdownSourcePath = markdownSourcePath.replace("\\", "/");
    validMarkdownSourcePath += validMarkdownSourcePath.endsWith("/") ? "" : "/";
//  validMarkdownSourcePath += game.world.name + "/";
    return validMarkdownSourcePath;
}

function validImportWorldPath() {
    let validImportWorldPath = importWorldPath == "" ? (game.world.name + "/") : importWorldPath;
    validImportWorldPath += validImportWorldPath.endsWith("/") ? "" : "/";
    return validImportWorldPath;
}

function validExportWorldPath() {
    let validExportWorldPath = exportWorldPath == "" ? (game.world.name + "/") : exportWorldPath;
    validExportWorldPath += validExportWorldPath.endsWith("/") ? "" : "/";
    return validExportWorldPath;
}

function isValidFile(filename) {
    return filename.endsWith('.md');
}

function isValidFileName(filename) {
    var re = /^(?!\.)(?!com[0-9]$)(?!con$)(?!lpt[0-9]$)(?!nul$)(?!prn$)[^\|\*\?\\:<>/$"]*[^\.\|\*\?\\:<>/$"]+$/
    return re.test(filename);
}

function generateJournalFileName(journalEntity) {
    return `${journalEntity.name} (${journalEntity.id}).md`
}

function getJournalIdFromFilename(fileName) {
    // 'sdfkjs dflksjd kljf skldjf(IDIDIDIID).md
    return last(fileName.split('(')).replace(').md', '');
}

function getJournalTitleFromFilename(fileName) {
    // 'sdfkjs dflksjd kljf skldjf(IDIDIDIID).md
    // Remove the ID if i is there and any .md remaining so it is just the file name with no extension.
    return fileName.replace(`(${getJournalIdFromFilename(fileName)}).md`, '').replace('.md', '');
}

function last(array) {
    return array[array.length - 1];
}

function hasJsonStructure(str) {
    if (typeof str !== 'string') return false;
    try {
        const result = JSON.parse(str);
        const type = Object.prototype.toString.call(result);
        return type === '[object Object]'
            || type === '[object Array]';
    } catch (err) {
        return false;
    }
}

async function importFolder(importFolderPath) {
    Logger.logTrace(`Importing folder: ${importFolderPath}`);
    let result = await FilePicker.browse(markdownPathOptions.activeSource, importFolderPath);

    for (let [key, file] of Object.entries(result.files)) {
        if(isValidFile(file)) {
            await importFile(file);
        }
    }

    for (let [key, folder] of Object.entries(result.dirs)) {
        await importFolder(folder);
    }
}

// This will create the journal folder in FVTT
async function createJournalFolders(rootPath, parentFolderId) {
    Logger.logTrace(`createJournalFolders | Params(folder = ${rootPath} parent = ${parentFolderId})`)
    let result = await FilePicker.browse(markdownPathOptions.activeSource, rootPath)
    for (let [key, folder] of Object.entries(result.dirs)) {
        let thisFolderName = last(decodeURIComponent(folder).split('/'));
        let folderDetails = game.folders.filter(f => (f.data.type === "JournalEntry") && (f.data.name === thisFolderName) && (f.data.parent === parentFolderId));

        if (folderDetails.length == 0) {
            Logger.logTrace(`createJournalFolders | Creating folder path: ${thisFolderName} parent: ${parentFolderId}`)
            Logger.logTrace(`${JSON.stringify({ name: thisFolderName, type: "JournalEntry", parent: parentFolderId })}`);
            await Folder.create({ name: thisFolderName, type: "JournalEntry", parent: parentFolderId });
        }

        folderDetails = game.folders.filter(f => (f.data.type === "JournalEntry") && (f.data.name === thisFolderName) && (f.data.parent === parentFolderId));
        Logger.logTrace(`createJournalFolders | folder: ${folder} thisFolderName: ${thisFolderName} folderDetails._id: ${folderDetails[0]._id} folderDetails: ${JSON.stringify(folderDetails)}`)

        createJournalFolders(folder, folderDetails[0]._id);
    }
}

async function importFile(file) {
    Logger.logTrace(`importFile | params(file = ${file})`);
    var journalPath = decodeURIComponent(file).replace(validMarkdownSourcePath()+validImportWorldPath(), '').trim();
    var pathUrl = (journalPath.startsWith('https://') ? new URL(journalPath) : '')
    if(pathUrl) {
        var tempPathArray = pathUrl.pathname.split("/");
        journalPath = tempPathArray.slice(2).join("/").replace(/\%20/gi," ");
    }
    var journalId = getJournalIdFromFilename(journalPath).trim();
    var journalName = getJournalTitleFromFilename(last(journalPath.split('/'))).trim();
    var parentPath = journalPath.replace(last(journalPath.split('/')), '').trim();

    if (skippedJournalEntries.includes(journalName) || skippedJournalFolders.includes(last(journalPath.split('/')))) {
        return;
    }

    let currentParent = null;

    if (parentPath != '') {
        let pathArray = parentPath.split('/');
        for (let index = 0; index < pathArray.length; index++) {

            const path = pathArray[index];
            if (path != '') {
                let folder = game.folders.filter(f => (f.data.type === "JournalEntry") && (f.data.name === path) && (f.data.parent === currentParent));
                currentParent = folder[0]._id;
                Logger.logTrace(`currentParent: '${currentParent}' path: '${path}' folder: '${JSON.stringify(folder)}' (${folder[0]._id}) '${typeof folder}' '${folder.length}'`);
            }
        }
    }

    Logger.logTrace(`'${file}','${journalPath}','${journalId}','${journalName}','${parentPath}','${currentParent}'`);

    if(!pathUrl) file = '/' + file;
    fetch(file).then(response => {
        response.text().then(journalContents => {
            let updated = false;
            let md = "";

            // If the contents is pure JSON ignore it as it may be used by 
            // a module as configuration storage.
            if (hasJsonStructure(journalContents)) {
                md = journalContents
            } else {
                var converter = new showdown.Converter({ tables: true, strikethrough: true })
                md = converter.makeHtml(journalContents);
            }

            game.journal.filter(f => (f.id === journalId)).forEach((value, key, map) => {
                Logger.log(`Importing ${journalPath} with ID ${journalId} named ${journalName}`);
                value.update({ content: md });
                updated = true;
            });

            if (!updated) {
                Logger.log(`Creating ${journalPath} named ${journalName}`);
                JournalEntry.create({ name: journalName, content: md, folder: currentParent }).then(journal => { journal.show(); });
                ChatMessage.create({ content: `Added ${journalName}, please run export and delete '${journalName}.md'` });
            }

        });

    });
}

async function exportFolder(folder, parentPath) {
    let folderPath = (parentPath + '/' + folder.data.name).replace("//", "/").trim();

    // Create folder directory on server. 
    // Try and create parent path before child, have to catch error 
    // as no way to check for folder existance that I saw.
    FilePicker.createDirectory(markdownPathOptions.activeSource, parentPath)
        .then((result) => {
            Logger.log(`Creating ${parentPath}`);
        })
        .catch((error) => {
            if (!error.includes("EEXIST")) {
                Logger.log(error);
            } else {
                Logger.log(`${parentPath} exists`);
            }
        });

    FilePicker.createDirectory(markdownPathOptions.activeSource, folderPath)
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

async function exportJournal(journalEntry, parentPath) {
    if (skippedJournalEntries.includes(journalEntry.name) || skippedJournalFolders.includes(last(parentPath.split('/')))) {
        Logger.log(`Skipping ${journalEntry.name} as it matches exclusion rules`)
        return;
    }

    if(!isValidFileName(journalEntry.name)) {
        ChatMessage.create({ content: `Unable to export:<br /> <strong>${parentPath}/${journalEntry.name}</strong><br />It has invalid character(s) in its name that can not be used in file names.<br /><br /> These characters are invalid: <pre>| * ? \ : < > $</pre><br />Please rename the Journal Entry and export again.` });
    }
    

    let md = "";
    let journalFileName = generateJournalFileName(journalEntry);

    // If the contents is pure JSON ignore it as it may be used by 
    // a module as configuration storage.
    if (hasJsonStructure(journalEntry.data.content)) {
        Logger.log(`Detected JSON, skipping markdown conversion for '${journalFileName}' located at '${parentPath}'`);
        md = journalEntry.data.content.split('\r\n');
    } else {
        var converter = new showdown.Converter({ tables: true, strikethrough: true });
        md = converter.makeMarkdown(journalEntry.data.content).split('\r\n');
    }

    let blob = new Blob([md], {type: "text/markdown"});
    let file = new File([blob], journalFileName, {type: "text/markdown"});

    FilePicker.upload(markdownPathOptions.activeSource, parentPath, file, { bucket: null })
        .then((result) => {
            Logger.log(`Uploading ${parentPath}/${journalFileName}`);
        })
        .catch((error) => {
            Logger.log(error);
        });
}

async function createFolderTree(dataset) {
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

