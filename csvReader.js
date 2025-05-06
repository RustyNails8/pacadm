const fs = require('fs');
const path = require('path');
const { app } = require('@electron/remote');

// Function to read and parse CSV
async function loadCSV() {
    try {
        let csvPath;
        
        // In development
        if (process.env.NODE_ENV === 'development') {
            csvPath = path.join(__dirname, 'pacadm.csv');
        } else {
            // In production
            csvPath = path.join(app.getPath('userData'), 'pacadm.csv');
        }

        // Check if file exists in userData, if not, copy from resources
        if (!fs.existsSync(csvPath)) {
            const resourcePath = path.join(process.resourcesPath, 'pacadm.csv');
            fs.copyFileSync(resourcePath, csvPath);
        }

        const data = await fs.promises.readFile(csvPath, 'utf-8');
        
        // Split the CSV into rows
        const rows = data.split('\n');
        
        // Get headers from first row
        const headers = rows[0].split(',').map(header => header.trim());
        
        // Create table headers
        const tableHeader = document.getElementById('tableHeader');
        tableHeader.innerHTML = ''; // Clear existing headers
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            tableHeader.appendChild(th);
        });

        // Create table rows
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = ''; // Clear existing rows
        for (let i = 1; i < rows.length; i++) {
            if (rows[i].trim() === '') continue;
            
            const row = document.createElement('tr');
            const cells = rows[i].split(',');
            
            cells.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell.trim();
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