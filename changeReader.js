const fs = require('fs');
const path = require('path');

const resourcesPath = path.join(__dirname, 'resources');

class ChangeReader {
    constructor() {
        this.filePath = path.join(resourcesPath, 'CHM.csv');
        this.data = [];
        this.headers = [];
        this.filters = {};
    }

    async loadData() {
        try {
            const data = await fs.promises.readFile(this.filePath, 'utf-8');
            this.parseCSV(data);
            this.setupTable();
            this.setupFilters();
        } catch (error) {
            console.error('Error loading data:', error);
            document.body.innerHTML += `<p style="color: red">Error loading data: ${error.message}</p>`;
        }
    }

    parseCSV(data) {
        const rows = data.split('\n');
        this.headers = rows[0].split(',').map(header => header.replace(/"/g, '').trim());
        this.data = rows.slice(1)
            .filter(row => row.trim())
            .map(row => {
                const values = this.parseCSVLine(row);
                return this.headers.reduce((obj, header, index) => {
                    obj[header] = values[index] || '';
                    return obj;
                }, {});
            });
    }

    parseCSVLine(line) {
        const values = [];
        let value = '';
        let insideQuotes = false;
        
        for (let char of line) {
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                values.push(value.replace(/^"|"$/g, ''));
                value = '';
            } else {
                value += char;
            }
        }
        values.push(value.replace(/^"|"$/g, '')); // Push the last value
        return values;
    }

    formatDate(timestamp) {
        if (!timestamp || timestamp === 'null') return '';
        return new Date(parseInt(timestamp)).toLocaleString();
    }

    setupTable() {
        const tableHeader = document.getElementById('tableHeader');
        const tableBody = document.getElementById('tableBody');

        tableHeader.innerHTML = '';
        tableBody.innerHTML = '';

        const requiredHeaders = ['Id', 'DisplayLabel', 'Priority', 'PhaseId', 'AffectsActualService.DisplayLabel', 'OwnedByPerson.Name', 'ScheduledStartTime', 'ScheduledEndTime'];
        
        requiredHeaders.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            tableHeader.appendChild(th);
        });

        this.renderFilteredData();
    }

    setupFilters() {
        const filterContainer = document.getElementById('columnFilters');
        filterContainer.innerHTML = '';

        const filterableColumns = ['Priority', 'PhaseId'];
        
        filterableColumns.forEach(header => {
            const uniqueValues = [...new Set(this.data.map(row => row[header]))];
            
            const filterDiv = document.createElement('div');
            filterDiv.className = 'filter-item';
            
            const select = document.createElement('select');
            select.multiple = true;
            select.setAttribute('data-column', header);
            
            const label = document.createElement('label');
            label.textContent = header;
            
            uniqueValues.forEach(value => {
                if (value) {
                    const option = document.createElement('option');
                    option.value = value;
                    option.textContent = value;
                    select.appendChild(option);
                }
            });

            select.addEventListener('change', () => this.applyFilters());
            
            filterDiv.appendChild(label);
            filterDiv.appendChild(select);
            filterContainer.appendChild(filterDiv);
        });

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

        const requiredHeaders = ['Id', 'DisplayLabel', 'Priority', 'PhaseId', 'AffectsActualService.DisplayLabel', 'OwnedByPerson.Name', 'ScheduledStartTime', 'ScheduledEndTime'];

        const filteredData = this.data.filter(row => {
            const passesFilters = Object.entries(this.filters).every(([column, values]) => {
                return values.includes(row[column]);
            });

            const passesSearch = Object.values(row).some(value => 
                value.toString().toLowerCase().includes(searchText)
            );

            return passesFilters && passesSearch;
        });

        filteredData.forEach(row => {
            const tr = document.createElement('tr');
            requiredHeaders.forEach(header => {
                const td = document.createElement('td');
                if (header === 'ScheduledStartTime' || header === 'ScheduledEndTime') {
                    td.textContent = this.formatDate(row[header]);
                } else {
                    td.textContent = row[header] || '';
                }
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
    }
}

const changeReader = new ChangeReader();
document.addEventListener('DOMContentLoaded', () => changeReader.loadData());