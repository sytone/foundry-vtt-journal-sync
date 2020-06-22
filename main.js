// Import TypeScript modules
import * as Constants from './module/constants.js';
import * as Logger from './module/logger.js'
import { registerSettings } from './module/settings.js';
import * as JournalSync from './module/journal-sync.js'

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
    Logger.log(`Initializing ${Constants.MODULE_NAME}`);
    Logger.log("    ___                       _    __,               ");
    Logger.log("   ( /                       //   (                  ");
    Logger.log("    / __ , , _   _ _   __,  //     `.  __  , _ _   _,");
    Logger.log("  _/_(_)(_/_/ (_/ / /_(_/(_(/_---(___)/ (_/_/ / /_(__");
    Logger.log(" //                                      /           ");
    Logger.log("(/                                      '            ");
    
    // Assign custom classes and constants here

    // Register custom module settings
    await registerSettings();

    // // Preload Handlebars templates
    // await preloadTemplates();

    await JournalSync.initModule();
    // Register custom sheets (if any)
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', async function () {
    // Do anything after initialization but before
    // ready
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', async function () {
    // Do anything once the module is ready
    await JournalSync.readyModule();
});

// Add any additional hooks if necessary