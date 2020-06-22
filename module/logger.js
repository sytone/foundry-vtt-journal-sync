"use strict";
import * as Constants from "./constants.js"

let trace = false;

export let enableTracing = () => {
    trace = true;
}

export let log = (...args) => {
    console.log(`${Constants.MODULE_NAME} | INFO | `, ...args);
}

export let logError = (...args) => {
    console.log(`${Constants.MODULE_NAME} | ERROR | `, ...args);
}

export let logTrace = (...args) => {
    if(trace) {
        console.log(`${Constants.MODULE_NAME} | TRACE | `, ...args);
    }
}

export let logRawTrace = (...args) => {
    if(trace) {
        console.log(...args);
    }
}
