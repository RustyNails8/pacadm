window.addEventListener('DOMContentLoaded', () => {
    // Enable Node.js integration
    const { ipcRenderer } = require('electron');
    
    // Log any errors
    window.onerror = function(msg, url, lineNo, columnNo, error) {
        console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
        return false;
    };

    // Log when DOM is ready
    console.log('DOM Content Loaded');
});
