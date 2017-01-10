/*******************************************************************************
**
** This file is part of BPM for Discord.
** Copyright (c) 2015-2017 ByzantineFailure.
** 
** Much of this file is copy-pasted with some tweaks from BPM proper.
** IS_BETTER_DISCORD is set inside the betterDiscord header file (/discord/betterDiscord/header.js)
**
** sendSyncSettingsMessage and sendAsyncSettingsMessage are executed and written in 
** in the integration layer (/discord/integration/settings.js)
**
** Copyright (c) 2012-2015 Typhos.
**
** This program is free software: you can redistribute it and/or modify it
** under the terms of the GNU Affero General Public License as published by
** the Free Software Foundation, either version 3 of the License, or (at your
** option) any later version.
**
** This program is distributed in the hope that it will be useful, but WITHOUT
** ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
** FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License
** for more details.
**
** You should have received a copy of the GNU Affero General Public License
** along with this program.  If not, see <http://www.gnu.org/licenses/>.
**
*******************************************************************************/

"use strict";

var manage_prefs = require('./pref-setup').manage_prefs,
    resources = require('./bpm-resources'),
    sr_name2id = resources.sr_name2id;

// Init prefs.  Eventually remove localStorage use
var prefs_start = localStorage.prefs ? localStorage.prefs : {};
var stored_prefs = IS_BETTER_DISCORD ? {} : sendSyncSettingsMessage('read_settings');
var dataCache = {
    prefs: Object.assign(prefs_start, stored_prefs)
};
localStorage.prefs = dataCache.prefs

(function() {

function bpm_read_json(key) {
    return dataCache[key] === undefined ? undefined : JSON.parse(dataCache[key]);
}
function bpm_read_value(key) {
    return dataCache[key];
}
function bpm_write_value(key, data) {
    dataCache[key] = data;
    localStorage[key] = data;
    sendAsyncSettingsMessage('write_settings', dataCache);
}
function bpm_write_json(key, data) {
    var serialized = JSON.stringify(data);
    dataCache[key] = serialized;
    localStorage[key] = serialized;
    sendAsyncSettingsMessage('write_settings', dataCache);
}

//TODO: Implement BD's storage system here
function bd_read_json(key) {
    return dataCache[key] === undefined ? undefined : JSON.parse(dataCache[key]);
}
function bd_read_value(key) {
    return dataCache[key];
}
function bd_write_value(key, data) {
    dataCache[key] = data;
    localStorage[key] = data;
}
function bd_write_json(key, data) {
    var serialized = JSON.stringify(data);
    dataCache[key] = serialized;
    localStorage[key] = serialized;
}

var pref_manager = manage_prefs(sr_name2id, {
    read_value: IS_BETTER_DISCORD ? bd_read_value : bpm_read_value,
    write_value: IS_BETTER_DISCORD ? bd_write_value : bpm_write_value,
    read_json: IS_BETTER_DISCORD ? bd_read_json : bpm_read_json,
    write_json: IS_BETTER_DISCORD ? bd_write_json : bpm_write_json, 

    download_file: function(done, url, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if(request.readyState === 4) {
                done();
                var type = request.getResponseHeader("Content-Type");
                if(request.status === 200 && type == "text/css") {
                    callback(request.responseText);
                } else {
                    console.log("BPM: ERROR: Reddit returned HTTP status " + request.status + " for " + url + " (type: " + type + ")");
                }
            }
        };
        request.open("GET", url, true);
        // Not permitted because Chrome sucks
        //request.setRequestHeader("User-Agent", "BetterPonymotes Client CSS Updater (/u/Typhos)");
        request.send();
    },

    // Chrome's setTimeout() does not appreciate a this parameter
    set_timeout: setTimeout.bind(undefined)
});

function sendBpmMessage(data) {
    var event = new CustomEvent("bpm_message");
    event.data = data;
    window.dispatchEvent(event);
}

// Content script requests
window.addEventListener("bpm_message", function(event) {
    var message = event.data;
    switch(message.method) {
        case "get_initdata":
            var reply = {"method": "initdata"};
            if(message.want["prefs"]) {
                reply.prefs = pref_manager.get();
            }
            if(message.want["customcss"]) {
                reply.emotes = pref_manager.cm.emote_cache;
                reply.css = pref_manager.cm.css_cache;
            }
            sendBpmMessage(reply);
            break;

        case "get_prefs":
            sendBpmMessage({"method": "prefs", "prefs": pref_manager.get()});
            break;

        case "get_custom_css":
            sendBpmMessage({
                "method": "custom_css",
                "css": pref_manager.cm.css_cache,
                "emotes": pref_manager.cm.emote_cache
            });
            break;

        case "set_pref":
            pref_manager.set_pref(message.pref, message.value);
            break;

        case "force_update":
            pref_manager.cm.force_update(message.subreddit);
            break;
        
        case "initdata":
        case "prefs":
        case "custom_css":
            break;

        default:
            console.log("BPM: ERROR: Unknown request from content script: '" + message.request + "'");
            break;
    }
}, false); 
})();
