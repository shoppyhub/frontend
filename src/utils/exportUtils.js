export const exportToCSV = (data, filename = 'export.csv') => {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) return '';
                if (typeof value === 'object') return JSON.stringify(value);
                if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
                return value;
            }).join(',')
        )
    ].join('\n');

    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
};

export const exportToJSON = (data, filename = 'export.json') => {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    const json = JSON.stringify(data, null, 2);
    downloadFile(json, filename, 'application/json;charset=utf-8;');
};

export const exportToPDF = async (data, filename = 'export.pdf', title = 'System Report') => {
    try {
        const { jsPDF } = require('jspdf');
        const { autoTable } = require('jspdf-autotable');

        if (!data || data.length === 0) {
            alert('No data to export');
            return;
        }

        const doc = new jsPDF();
        const headers = Object.keys(data[0]);
        const tableData = data.map(row => headers.map(h => row[h]));

        doc.text(title, 14, 15);
        autoTable(doc, {
            head: [headers],
            body: tableData,
            startY: 25,
            margin: { top: 20 },
            styles: { fontSize: 9, cellPadding: 6 },
            headerStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
            bodyStyles: { textColor: 50 },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        });

        doc.save(filename);
    } catch (err) {
        console.error('PDF export failed:', err);
        alert('PDF export requires jsPDF library');
        exportToCSV(data, filename.replace('.pdf', '.csv'));
    }
};

export const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export const exportStats = (stats, title = 'System Stats') => {
    const data = [stats];
    exportToJSON(data, `${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.json`);
};
