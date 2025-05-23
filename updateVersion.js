const fs = require('fs');
const path = require('path');

const versionPath = path.join(__dirname, 'version.json');
const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
versionData.csvVersion = Date.now().toString(); // Use timestamp as version
fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));