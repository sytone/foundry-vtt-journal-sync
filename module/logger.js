"use strict";
import * as Constants from "./constants.js"

export let log = (...args) => {
    console.log(`${Constants.MODULE_NAME} | INFO | `, ...args);
}

export let logError = (...args) => {
    console.log(`${Constants.MODULE_NAME} | ERROR | `, ...args);
}
