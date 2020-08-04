"use strict";
import * as Constants from "./constants.js"
import { fetchParams } from "./journal-sync.js"

/**
 * The module title
 */
export const title = "Journal Sync settings";

/**
 * Some generic path references that might be useful later in the application's windows
 */
export const path = {
  root: `modules/${Constants.MODULE_NAME}/`
};

/**
 * For each setting, there is are two corresponding entries in the language file to retrieve the translations for
 * - the setting name
 * - the hint displayed beneath the setting's name in the "Configure Game Settings" dialog.
 *
 * Given your Constants.MODULE_NAME is 'my-module' and your setting's name is 'EnableCritsOnly', then you will need to create to language entries:
 * {
 *  "my-module.EnableCritsOnly.Name": "Enable critical hits only",
 *  "my-module.EnableCritsOnly.Hint": "Players will only hit if they crit, and otherwise miss automatically *manic laughter*"
 * }
 *
 * The naming scheme is:
 * {
 *  "[Constants.MODULE_NAME].[SETTING_NAME].Name": "[TEXT]",
 *  "[Constants.MODULE_NAME].[SETTING_NAME].Hint": "[TEXT]"
 * }
 */
const settings = [
  {
    name: "MarkdownSourcePath",
    scope: "world",
    default: "journal-sync/",
    type: String,
    onChange: fetchParams
  },
  {
    name: "JournalEditorLink",
    scope: "world",
    default: "",
    type: String,
    onChange: fetchParams
  },
  {
    name: "EnableTracing",
    scope: "world",
    default: false,
    type: Boolean,
    onChange: fetchParams
  },
  {
    name: "SkipJournalFolders",
    scope: "world",
    default: "",
    type: String,
    onChange: fetchParams
  },
  {
    name: "SkipJournalEntries",
    scope: "world",
    default: "",
    type: String,
    onChange: fetchParams
  },
  {
    name: "ImportWorldPath",
    scope: "world",
    default: "",
    type: String,
    onChange: fetchParams
  },
  {
    name: "ExportWorldPath",
    scope: "world",
    default: "",
    type: String,
    onChange: fetchParams
  },  
]

export async function registerSettings() {
  settings.forEach(setting => {
    let options = {
      name: game.i18n.localize(`${Constants.MODULE_NAME}.${setting.name}.Name`),
      hint: game.i18n.localize(`${Constants.MODULE_NAME}.${setting.name}.Hint`),
      scope: setting.scope,
      config: true,
      default: setting.default,
      type: setting.type,
      onChange: setting.onChange
    };
    if (setting.choices) options.choices = setting.choices;
    game.settings.register(Constants.MODULE_NAME, setting.name, options);
  });
}
