window.addEventListener('DOMContentLoaded', () => {
    // Enable Node.js integration
    const { ipcRenderer } = require('electron');
    const fs = require('fs');
    
    // Log any errors
    window.onerror = function(msg, url, lineNo, columnNo, error) {
        console.log('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
        return false;
    };
});
