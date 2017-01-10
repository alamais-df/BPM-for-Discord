const ipc = require('electron').ipcMain,
    fs = require('fs'),
    path = require('path');

module.exports = Settings;

var self;

function settingsFilePath() {
    return path.join(self.bpmDir, 'settings.json');
}

function Settings(bpmDir) {
    self = this;       
    self.bpmDir = bpmDir;
}

Settings.prototype.init = function (window, bpmDir) {
    if(!fs.existsSync(settingsFilePath())) {
        fs.writeFileSync(settingsFilePath(), '{}');
    }
    ipc.on('asynchronous-message', handleAsync);
    ipc.on('synchonous-message', handleSync);

    // Expose IPC to content script
    window.webContents.execJs(`
        var ipc = require('electron').ipcRenderer;
        function sendAsyncSettingsMessage(method, data, callback) {
            // Not that reliable but w/e
            var messageId = Date.now();
            var handler = function(event, arg) {
                if (arg && arg.id) {
                    ipc.removeListener('asynchronous-reply', handler);
                    if (callback) {
                        callback(arg.value);
                    }
                }
            };
            ipc.on('asynchronous-reply', handler);
            ipc.send('asynchronous-message', { id: messageId, method: method, data: data });
        }
        function sendSyncSettingsMessage(method, data) {
            return ipc.send('synchronous-message', data);
        }
    `);
};

function handleSync(event, arg) {
    if(typeof arg === 'object') {
        switch(arg.method) {
            case 'read_settings':
                event.returnValue = {
                    id: arg.id,
                    value: readSettings()
                };
                break;
            case 'write_settings':
                event.returnValue = { 
                    id: arg.id,
                    value: {
                        success: writeSettings(arg.data) 
                    }
                };
                break;
        }
    } 
}

function handleAsync(event, arg) {
    if(typeof arg === 'object') {
        switch(arg.method) {
            case 'read_settings':
                event.sender.send('asynchronous-reply', {
                    id: arg.id,
                    value: readSettings()
                });
                break;
            case 'write_settings':
                event.sender.send('asynchronous-reply', { 
                    id: arg.id,
                    value: {
                        success: writeSettings(arg.data) 
                    }
                });
                break;
        }
    } 
}

function readSettings() {
    try {
        JSON.parse(fs.readFileSync(settingsFilePath()));
    } catch (e) {
        return {};
    }
}

function writeSettings(settings) {
    try {
        fs.writeFileSync(settingsFilePath(), JSON.stringify(settings));
        return true;
    } catch(e) {
        return false;    
    }
}

