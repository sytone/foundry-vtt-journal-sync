"use strict";
import * as Constants from "./constants.js"
import * as Logger from './logger.js'

/**
 * Browse files for a certain directory location
 * @param {string} source     The source location in which to browse. See FilePicker#sources for details
 * @param {string} target     The target within the source location
 * @param {Object} options              Optional arguments
 * @param {string} options.bucket       A bucket within which to search if using the S3 source
 * @param {Array} options.extensions    An Array of file extensions to filter on
 * @param {boolean} options.wildcard    The requested dir represents a wildcard path
 *
 * @return {Promise}          A Promise which resolves to the directories and files contained in the location
 */
export let browse = async (source, target, options = {}) => {
    const data = { action: "browseFiles", storage: source, target: target };
    return _manageFiles(data, options);
}

/**
 * Create a subdirectory within a given source. The requested subdirectory path must not already exist.
 * @param {string} source     The source location in which to browse. See FilePicker#sources for details
 * @param {string} target     The target within the source location
 * @param {Object} options    Optional arguments which modify the request
 * @return {Promise<Object>}
 */
export let createDirectory = async (source, target, options = {}) => {
    const data = { action: "createDirectory", storage: source, target: target };
    return _manageFiles(data, options);
}

/**
 * General dispatcher method to submit file management commands to the server
 * @private
 */
let _manageFiles = async (data, options) => {
    return new Promise((resolve, reject) => {
        game.socket.emit("manageFiles", data, options, result => {
            if (result.error) return reject(result.error);
            resolve(result);
        });
    });
}


/**
 * Dispatch a POST request to the server containing a directory path and a file to upload
 * @param {string} source   The data source to which the file should be uploaded
 * @param {string} path     The destination path
 * @param {File} file       The File object to upload
 * @param {Object} options  Additional file upload options passed as form data
 * @return {Promise<Object>}  The response object
 */
export let upload = async (source, path, file, options) => {

    // Create the form data to post
    const fd = new FormData();
    fd.set("source", source);
    fd.set("target", path);
    fd.set("upload", file);
    Object.entries(options).forEach(o => fd.set(...o));

    // Dispatch the request
    const response = await fetch("/upload", { method: "POST", body: fd }).then(r => r.json());
    if (response.error) {
        ui.notifications.error(response.error);
        return false;
    } else if (response.message) {
        // ui.notifications.info(response.message);
    }
    return response;
}