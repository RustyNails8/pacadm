const fs = require('fs');
const path = require('path');
const { app } = require('@electron/remote');

// Function to read and parse CSV
async function loadCSV() {
    try {
        let csvPath;
        let versionPath;
        
        if (process.env.NODE_ENV === 'development') {
            csvPath = path.join(__dirname, 'resources', 'PACADM.csv');
            versionPath = path.join(__dirname, 'resources', 'version.json');
        } else {
            csvPath = path.join(app.getPath('userData'), 'resources', 'PACADM.csv');
            versionPath = path.join(app.getPath('userData'), 'resources', 'version.json');
        }

        // Get resource paths
        const resourceCsvPath = path.join(process.resourcesPath, 'resources', 'PACADM.csv');
        const resourceVersionPath = path.join(process.resourcesPath, 'resources', 'version.json');

        // Check and update version
        let shouldUpdateFile = true;
        if (fs.existsSync(versionPath)) {
            const currentVersion = JSON.parse(fs.readFileSync(versionPath, 'utf-8')).csvVersion;
            const resourceVersion = JSON.parse(fs.readFileSync(resourceVersionPath, 'utf-8')).csvVersion;
            shouldUpdateFile = currentVersion !== resourceVersion;
        }

        // Copy new version if needed
        if (shouldUpdateFile) {
            fs.copyFileSync(resourceCsvPath, csvPath);
            fs.copyFileSync(resourceVersionPath, versionPath);
        }

        const data = await fs.promises.readFile(csvPath, 'utf-8');
        
        // Split the CSV into rows
        const rows = data.split('\n');
        
        // Get headers from first row and filter only needed columns
        // IMPORTANT: The filtered headers here are used as source of truth
        // dataReader.js must use the same headers in its requiredHeaders array
        const allHeaders = rows[0].split(',').map(header => header.trim());
        const requiredHeaders = ['CWD', 'OS_Patch', 'OS_kernel', 'SERVICE_TYPE'];
        const headerIndices = requiredHeaders.map(header => allHeaders.indexOf(header));
        
        // Create table headers
        const tableHeader = document.getElementById('tableHeader');
        tableHeader.innerHTML = '';
        requiredHeaders.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            tableHeader.appendChild(th);
        });

        // Create table rows
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = '';
        for (let i = 1; i < rows.length; i++) {
            if (rows[i].trim() === '') continue;
            
            const row = document.createElement('tr');
            const cells = rows[i].split(',');
            
            headerIndices.forEach(index => {
                const td = document.createElement('td');
                td.textContent = cells[index]?.trim() || '';
                row.appendChild(td);
            });
            
            tableBody.appendChild(row);
        }

        // Setup search functionality after table is loaded
        setupSearch();

    } catch (error) {
        console.error('Error loading CSV:', error);
        document.body.innerHTML += `<p style="color: red">Error loading CSV: ${error.message}</p>`;
    }
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keyup', function() {
        const searchText = this.value.toLowerCase();
        const rows = document.querySelectorAll('#tableBody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchText) ? '' : 'none';
        });
    });
}

// Load CSV when the window is ready
document.addEventListener('DOMContentLoaded', loadCSV);