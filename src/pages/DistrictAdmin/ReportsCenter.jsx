import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import api from '../../services/api';

const ReportsCenter = () => {
    const { user } = useAuth();
    const { settings } = useBranding();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState('sales');
    const [timeRange, setTimeRange] = useState('30days');
    const [exportFormat, setExportFormat] = useState('json');

    const themeColor = settings?.themeColor || '#0d9488';

    const reportTypes = {
        'sales': { name: '📈 बिक्री रिपोर्ट', description: 'आदेश और राजस्व डेटा' },
        'complaints': { name: '📞 शिकायत रिपोर्ट', description: 'ग्राहक शिकायतें और समाधान' },
        'shops': { name: '🏬 दुकान रिपोर्ट', description: 'दुकान स्थिति और प्रदर्शन' }
    };

    const generateReport = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/enhanced/reports/generate', {
                params: { reportType, timeRange, format: exportFormat }
            });
            if (response.data.success) {
                setReportData(response.data.data);
            }
        } catch (error) {
            alert('त्रुटि: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const exportReport = () => {
        if (!reportData) {
            alert('पहले रिपोर्ट जेनरेट करें');
            return;
        }

        let dataStr = '';
        let filename = `${reportType}_${new Date().toISOString().split('T')[0]}`;

        if (exportFormat === 'json') {
            dataStr = JSON.stringify(reportData, null, 2);
            filename += '.json';
        } else if (exportFormat === 'csv') {
            // Convert to CSV
            const headers = Object.keys(reportData.reportData[0] || {});
            const rows = reportData.reportData.map(item =>
                headers.map(header => item[header]).join(',')
            );
            dataStr = [headers.join(','), ...rows].join('\n');
            filename += '.csv';
        }

        const blob = new Blob([dataStr], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle(themeColor)}>
                <h1 style={{ margin: 0, fontSize: '24px' }}>📊 रिपोर्ट केंद्र</h1>
            </div>

            {/* Report Configuration */}
            <div style={configurationStyle}>
                <h2 style={{ marginTop: 0, color: themeColor }}>रिपोर्ट कॉन्फ़िगरेशन</h2>

                <div style={configGridStyle}>
                    <div style={configItemStyle}>
                        <label>रिपोर्ट प्रकार *</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            style={selectStyle}
                        >
                            {Object.entries(reportTypes).map(([key, val]) => (
                                <option key={key} value={key}>
                                    {val.name}
                                </option>
                            ))}
                        </select>
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                            {reportTypes[reportType]?.description}
                        </p>
                    </div>

                    <div style={configItemStyle}>
                        <label>समय अवधि *</label>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="7days">पिछले 7 दिन</option>
                            <option value="30days">पिछले 30 दिन</option>
                            <option value="90days">पिछले 90 दिन</option>
                        </select>
                    </div>

                    <div style={configItemStyle}>
                        <label>निर्यात प्रारूप</label>
                        <select
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="json">JSON</option>
                            <option value="csv">CSV</option>
                        </select>
                    </div>
                </div>

                <div style={actionButtonsStyle}>
                    <button
                        onClick={generateReport}
                        disabled={loading}
                        style={{ ...btnStyle(themeColor), opacity: loading ? 0.6 : 1 }}
                    >
                        {loading ? '⏳ जेनरेट हो रहा है...' : '🔍 रिपोर्ट जेनरेट करें'}
                    </button>
                    <button
                        onClick={exportReport}
                        disabled={!reportData}
                        style={{ ...btnStyle('#4CAF50'), opacity: !reportData ? 0.6 : 1 }}
                    >
                        📥 निर्यात करें
                    </button>
                </div>
            </div>

            {/* Report Results */}
            {reportData && (
                <div style={resultsStyle}>
                    <h2 style={{ marginTop: 0, color: themeColor }}>📋 रिपोर्ट परिणाम</h2>

                    <div style={metaInfoStyle}>
                        <div>
                            <span style={metaLabelStyle}>रिपोर्ट प्रकार:</span>
                            <span>{reportData.reportType}</span>
                        </div>
                        <div>
                            <span style={metaLabelStyle}>समय अवधि:</span>
                            <span>{reportData.timeRange}</span>
                        </div>
                        <div>
                            <span style={metaLabelStyle}>जेनरेट किया गया:</span>
                            <span>{new Date(reportData.generatedAt).toLocaleString('hi-IN')}</span>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div style={tableContainerStyle}>
                        <table style={tableStyle}>
                            <thead style={tableHeadStyle(themeColor)}>
                                <tr>
                                    {reportData.reportData && reportData.reportData.length > 0
                                        ? Object.keys(reportData.reportData[0]).map(key => (
                                            <th key={key} style={tableHeadCellStyle}>
                                                {key}
                                            </th>
                                        ))
                                        : null}
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.reportData && reportData.reportData.length > 0 ? (
                                    reportData.reportData.map((row, idx) => (
                                        <tr key={idx} style={tableRowStyle(idx)}>
                                            {Object.values(row).map((val, cellIdx) => (
                                                <td key={cellIdx} style={tableCellStyle}>
                                                    {typeof val === 'number'
                                                        ? val.toLocaleString()
                                                        : String(val)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="100%" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                            कोई डेटा उपलब्ध नहीं
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Statistics */}
                    <div style={statsStyle}>
                        <h3 style={{ marginTop: 0, color: themeColor }}>📊 सांख्यिकी</h3>
                        <div style={statsGridStyle}>
                            <StatItem
                                label="कुल रिकॉर्ड"
                                value={reportData.reportData?.length || 0}
                                icon="📈"
                            />
                            <StatItem
                                label="जेनरेशन समय"
                                value={new Date(reportData.generatedAt).toLocaleTimeString('hi-IN')}
                                icon="⏱️"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Report Templates */}
            <div style={templatesStyle}>
                <h2 style={{ marginTop: 0, color: themeColor }}>📑 उपलब्ध रिपोर्ट</h2>
                <div style={templateGridStyle}>
                    {Object.entries(reportTypes).map(([key, val]) => (
                        <div key={key} style={templateCardStyle(reportType === key ? themeColor : '#ccc')}>
                            <span style={{ fontSize: '32px', marginBottom: '10px' }}>
                                {val.name.split(' ')[0]}
                            </span>
                            <h3 style={{ margin: '10px 0', fontSize: '16px' }}>
                                {val.name}
                            </h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                                {val.description}
                            </p>
                            <button
                                onClick={() => {
                                    setReportType(key);
                                    generateReport();
                                }}
                                style={{
                                    ...templateBtnStyle(themeColor),
                                    marginTop: '10px'
                                }}
                            >
                                अभी जेनरेट करें
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StatItem = ({ label, value, icon }) => (
    <div style={statItemStyle}>
        <span style={{ fontSize: '24px' }}>{icon}</span>
        <div style={{ marginLeft: '10px' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>{label}</p>
            <h3 style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '700' }}>
                {value}
            </h3>
        </div>
    </div>
);

// ==================== STYLES ====================

const containerStyle = {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto'
};

const headerStyle = (themeColor) => ({
    backgroundColor: themeColor,
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px'
});

const configurationStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const configGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
    marginBottom: '15px'
};

const configItemStyle = {
    display: 'flex',
    flexDirection: 'column'
};

const selectStyle = {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    fontFamily: 'inherit'
};

const actionButtonsStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
};

const btnStyle = (color) => ({
    padding: '12px 20px',
    backgroundColor: color,
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s'
});

const resultsStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const metaInfoStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderRadius: '5px',
    marginBottom: '15px'
};

const metaLabelStyle = {
    fontWeight: '600',
    color: '#666',
    marginRight: '10px'
};

const tableContainerStyle = {
    overflowX: 'auto',
    marginBottom: '20px'
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
};

const tableHeadStyle = (themeColor) => ({
    backgroundColor: themeColor,
    color: 'white',
    fontWeight: '600'
});

const tableHeadCellStyle = {
    padding: '12px',
    textAlign: 'left',
    fontSize: '13px'
};

const tableRowStyle = (idx) => ({
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9f9f9'
});

const tableCellStyle = {
    padding: '10px 12px',
    fontSize: '13px'
};

const statsStyle = {
    backgroundColor: '#f5f5f5',
    padding: '15px',
    borderRadius: '5px'
};

const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
};

const statItemStyle = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '5px'
};

const templatesStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const templateGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
};

const templateCardStyle = (borderColor) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '20px',
    border: `2px solid ${borderColor}`,
    borderRadius: '8px',
    backgroundColor: '#f9f9f9'
});

const templateBtnStyle = (themeColor) => ({
    padding: '8px 16px',
    backgroundColor: themeColor,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
});

export default ReportsCenter;
