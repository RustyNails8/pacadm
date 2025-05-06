const fs = require('fs');
const path = require('path');

// Function to read and parse CSV
function loadCSV() {
    const csvPath = path.join(__dirname, 'pacadm.csv');
    
    fs.readFile(csvPath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading CSV file:', err);
            return;
        }

        // Split the CSV into rows
        const rows = data.split('\n');
        
        // Get headers from first row
        const headers = rows[0].split(',').map(header => header.trim());
        
        // Create table headers
        const tableHeader = document.getElementById('tableHeader');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            tableHeader.appendChild(th);
        });

        // Create table rows
        const tableBody = document.getElementById('tableBody');
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
    });
}

// Load CSV when the window is ready
window.addEventListener('DOMContentLoaded', loadCSV);