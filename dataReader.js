const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Define resources folder path
const resourcesPath = path.join(__dirname, 'resources');

class DataReader {
    constructor(filePath, fileType) {
        this.filePath = path.join(resourcesPath, filePath);
        this.fileType = fileType;
        this.data = [];
        this.headers = [];
        this.filters = {};
    }

    async loadData() {
        try {
            if (this.fileType === 'csv') {
                const data = await fs.promises.readFile(this.filePath, 'utf-8');
                this.parseCSV(data);
            } else if (this.fileType === 'xlsx') {
                const workbook = xlsx.readFile(this.filePath);
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                this.parseXLSX(firstSheet);
            }
            this.setupTable();
            this.setupFilters();
        } catch (error) {
            console.error('Error loading data:', error);
            document.body.innerHTML += `<p style="color: red">Error loading data: ${error.message}</p>`;
        }
    }

    parseCSV(data) {
        const rows = data.split('\n');
        this.headers = rows[0].split(',').map(header => header.trim());
        this.data = rows.slice(1)
            .filter(row => row.trim())
            .map(row => {
                const values = row.split(',');
                return this.headers.reduce((obj, header, index) => {
                    obj[header] = values[index]?.trim() || '';
                    return obj;
                }, {});
            });
    }

    parseXLSX(sheet) {
        const data = xlsx.utils.sheet_to_json(sheet);
        if (data.length > 0) {
            this.headers = Object.keys(data[0]);
            this.data = data;
        }
    }

    setupTable() {
        const tableHeader = document.getElementById('tableHeader');
        const tableBody = document.getElementById('tableBody');

        // Clear existing content
        tableHeader.innerHTML = '';
        tableBody.innerHTML = '';

        // Create headers
        this.headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            tableHeader.appendChild(th);
        });

        // Create table rows
        this.renderFilteredData();
    }

    setupFilters() {
        const filterContainer = document.getElementById('columnFilters');
        filterContainer.innerHTML = '';

        // Define required headers for PACADM page
        // IMPORTANT: These required headers must match the ones in csvReader.js
        // See csvReader.js -> requiredHeaders array for the source of truth
        const requiredHeaders = ['CWD', 'OS_Patch', 'OS_kernel', 'SERVICE_TYPE'];
        
        // Filter headers based on page
        const pageName = window.location.pathname.split('/').pop();
        const headersToShow = pageName === 'pacadm.html' 
            ? this.headers.filter(header => requiredHeaders.includes(header))
            : this.headers;

        headersToShow.forEach(header => {
            const uniqueValues = [...new Set(this.data.map(row => row[header]))];
            
            const filterDiv = document.createElement('div');
            filterDiv.className = 'filter-item';
            
            const select = document.createElement('select');
            select.multiple = true;
            select.setAttribute('data-column', header);
            
            const label = document.createElement('label');
            label.textContent = header;
            
            uniqueValues.forEach(value => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });

            select.addEventListener('change', () => this.applyFilters());
            
            filterDiv.appendChild(label);
            filterDiv.appendChild(select);
            filterContainer.appendChild(filterDiv);
        });

        // Setup search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('keyup', () => this.applyFilters());
    }

    applyFilters() {
        const searchText = document.getElementById('searchInput').value.toLowerCase();
        const filterSelects = document.querySelectorAll('#columnFilters select');
        
        this.filters = {};
        filterSelects.forEach(select => {
            const column = select.getAttribute('data-column');
            const selectedOptions = Array.from(select.selectedOptions).map(option => option.value);
            if (selectedOptions.length > 0) {
                this.filters[column] = selectedOptions;
            }
        });

        this.renderFilteredData(searchText);
    }

    renderFilteredData(searchText = '') {
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = '';

        const filteredData = this.data.filter(row => {
            // Apply column filters
            const passesFilters = Object.entries(this.filters).every(([column, values]) => {
                return values.includes(row[column]);
            });

            // Apply search filter
            const passesSearch = Object.values(row).some(value => 
                value.toString().toLowerCase().includes(searchText)
            );

            return passesFilters && passesSearch;
        });

        filteredData.forEach(row => {
            const tr = document.createElement('tr');
            this.headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = row[header];
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
    }
}

// Initialize based on page
const pageName = window.location.pathname.split('/').pop();
let dataReader;

switch(pageName) {
    case 'pacadm.html':
        dataReader = new DataReader('pacadm.csv', 'csv');
        break;
    case 'landscape.html':
        dataReader = new DataReader('SID.List.csv', 'csv');
        break;
    case 'documents.html':
        dataReader = new DataReader('ALL.Basis.Docs.xlsx', 'xlsx');
        break;
    case 'incidents.html':
        dataReader = new DataReader('INM.csv', 'csv');
        break;
    case 'change-requests.html':
        dataReader = new DataReader('CHM.csv', 'csv');
        break;
    case 'change-tasks.html':
        dataReader = new DataReader('CHT.csv', 'csv');
        break;
    case 'service-requests.html':
        dataReader = new DataReader('SRV.csv', 'csv');
        break;
    case 'problem-tickets.html':
        dataReader = new DataReader('PRB.csv', 'csv');
        break;
}

if (dataReader) {
    document.addEventListener('DOMContentLoaded', () => dataReader.loadData());
}