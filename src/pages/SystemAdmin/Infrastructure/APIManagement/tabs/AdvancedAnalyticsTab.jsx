import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiManagementService from '../../../../../services/apiManagementService';


const AdvancedAnalyticsTab = ({ themeColor }) => {
  const [apis, setAPIs] = useState([]);
  const [selectedAPI, setSelectedAPI] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [reportType, setReportType] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');

  useEffect(() => {
    fetchAPIs();
  }, []);

  const fetchAPIs = async () => {
    try {
      const res = await apiManagementService.getAPIRegistry({ limit: 100 });
      if (res.data.success) {
        setAPIs(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch APIs');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedAPI) {
      toast.warning('Please select an API');
      return;
    }

    try {
      setLoading(true);
      const res = await apiManagementService.getAPIAnalytics(selectedAPI, { period: reportType });
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!analytics) {
      toast.warning('No analytics to export');
      return;
    }

    const dataStr = exportFormat === 'json'
      ? JSON.stringify(analytics, null, 2)
      : convertToCSV(analytics);

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      exportFormat === 'json'
        ? `data:text/json;charset=utf-8,${encodeURIComponent(dataStr)}`
        : `data:text/csv;charset=utf-8,${encodeURIComponent(dataStr)}`
    );
    element.setAttribute('download', `api-analytics-${selectedAPI}.${exportFormat}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success(`Report exported as ${exportFormat.toUpperCase()}`);
  };

  const convertToCSV = (data) => {
    let csv = 'Metric,Value\n';
    Object.entries(data).forEach(([key, value]) => {
      csv += `${key},${JSON.stringify(value)}\n`;
    });
    return csv;
  };

  return (
    <div>
      {/* Control Panel */}
      <div style={controlPanelS}>
        <div style={selectGroupS}>
          <label style={labelS}>📊 Select API</label>
          <select
            value={selectedAPI}
            onChange={(e) => setSelectedAPI(e.target.value)}
            style={selectS}
          >
            <option value="">Choose an API...</option>
            {apis.map(api => (
              <option key={api._id} value={api._id}>
                {api.name} ({api.provider})
              </option>
            ))}
          </select>
        </div>

        <div style={selectGroupS}>
          <label style={labelS}>📅 Report Period</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={selectS}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div style={selectGroupS}>
          <label style={labelS}>📥 Export Format</label>
          <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} style={selectS}>
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </div>

        <button onClick={handleAnalyze} style={analyzeButtonS(themeColor)} disabled={loading}>
          {loading ? '⏳ Analyzing...' : '🔍 Analyze'}
        </button>

        <button onClick={handleExport} style={exportButtonS(themeColor)}>
          📥 Export Report
        </button>
      </div>

      {/* Analytics Display */}
      {analytics && (
        <div style={analyticsContainerS}>
          <h3 style={analyticsHeaderS}>📈 Advanced Analytics Report</h3>

          <div style={metricsGridS}>
            {/* Response Time Analytics */}
            <div style={metricCardS}>
              <h4 style={cardTitleS}>⏱️ Response Time Analysis</h4>
              <div style={metricItemS}>
                <span>Minimum:</span>
                <strong>{analytics.response_times?.min_ms || 0}ms</strong>
              </div>
              <div style={metricItemS}>
                <span>Maximum:</span>
                <strong>{analytics.response_times?.max_ms || 0}ms</strong>
              </div>
              <div style={metricItemS}>
                <span>Average:</span>
                <strong>{analytics.response_times?.avg_ms || 0}ms</strong>
              </div>
              <div style={metricItemS}>
                <span>P95:</span>
                <strong>{analytics.response_times?.p95_ms || 0}ms</strong>
              </div>
              <div style={metricItemS}>
                <span>P99:</span>
                <strong>{analytics.response_times?.p99_ms || 0}ms</strong>
              </div>
            </div>

            {/* Throughput Metrics */}
            <div style={metricCardS}>
              <h4 style={cardTitleS}>📊 Throughput Metrics</h4>
              <div style={metricItemS}>
                <span>Requests/Second:</span>
                <strong>{analytics.throughput?.requests_per_second || 0}</strong>
              </div>
              <div style={metricItemS}>
                <span>Peak RPS:</span>
                <strong>{analytics.throughput?.peak_requests_per_second || 0}</strong>
              </div>
              <div style={metricItemS}>
                <span>Avg Requests/Hour:</span>
                <strong>{analytics.throughput?.avg_requests_per_hour || 0}</strong>
              </div>
            </div>

            {/* Error Analysis */}
            <div style={metricCardS}>
              <h4 style={cardTitleS}>⚠️ Error Breakdown</h4>
              <div style={metricItemS}>
                <span>Timeout Errors:</span>
                <strong style={{color:'#ef4444'}}>{analytics.error_breakdown?.timeout_errors || 0}</strong>
              </div>
              <div style={metricItemS}>
                <span>Auth Errors:</span>
                <strong style={{color:'#ef4444'}}>{analytics.error_breakdown?.auth_errors || 0}</strong>
              </div>
              <div style={metricItemS}>
                <span>Rate Limit Errors:</span>
                <strong style={{color:'#ef4444'}}>{analytics.error_breakdown?.rate_limit_errors || 0}</strong>
              </div>
              <div style={metricItemS}>
                <span>Server Errors:</span>
                <strong style={{color:'#ef4444'}}>{analytics.error_breakdown?.server_errors || 0}</strong>
              </div>
            </div>

            {/* Availability & Cost */}
            <div style={metricCardS}>
              <h4 style={cardTitleS}>💚 Availability & Cost</h4>
              <div style={metricItemS}>
                <span>Uptime:</span>
                <strong style={{color:'#10b981'}}>{analytics.uptime_percent || 100}%</strong>
              </div>
              <div style={metricItemS}>
                <span>Downtime:</span>
                <strong>{analytics.downtime_minutes || 0} min</strong>
              </div>
              <div style={metricItemS}>
                <span>Cost per Request:</span>
                <strong>${analytics.cost_per_request?.toFixed(4) || '0.00'}</strong>
              </div>
              <div style={metricItemS}>
                <span>Monthly Estimate:</span>
                <strong>${analytics.monthly_estimate?.toFixed(2) || '0.00'}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {!analytics && !loading && (
        <div style={emptyStateS}>
          <p style={{fontSize: '18px', fontWeight: '900', color: '#94a3b8'}}>
            📊 Select an API and click "Analyze" to view advanced analytics
          </p>
        </div>
      )}
    </div>
  );
};

// Styles
const controlPanelS = {
  display: 'flex',
  gap: '15px',
  marginBottom: '30px',
  padding: '20px',
  background: '#fff',
  borderRadius: '18px',
  border: '1px solid #f1f5f9',
  flexWrap: 'wrap',
  alignItems: 'flex-end'
};

const selectGroupS = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelS = { fontSize: '12px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' };
const selectS = { padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', background: '#fff', cursor: 'pointer', outline: 'none' };

const analyzeButtonS = (c) => ({
  padding: '12px 24px',
  background: c,
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  fontWeight: '900',
  fontSize: '13px',
  cursor: 'pointer',
  boxShadow: `0 6px 12px ${c}40`,
  transition: '0.3s'
});

const exportButtonS = (c) => ({
  padding: '12px 24px',
  background: '#f1f5f9',
  color: '#475569',
  border: '1.5px solid #e2e8f0',
  borderRadius: '10px',
  fontWeight: '900',
  fontSize: '13px',
  cursor: 'pointer',
  transition: '0.3s'
});

const analyticsContainerS = { background: '#fff', padding: '30px', borderRadius: '20px', border: '1px solid #f1f5f9' };
const analyticsHeaderS = { margin: '0 0 25px', fontSize: '18px', fontWeight: '900', color: '#0f172a' };

const metricsGridS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' };
const metricCardS = { padding: '20px', background: '#f8fafc', borderRadius: '15px', border: '1px solid #f1f5f9' };
const cardTitleS = { margin: '0 0 15px', fontSize: '14px', fontWeight: '900', color: '#1e293b' };

const metricItemS = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' };

const emptyStateS = { textAlign: 'center', padding: '80px 30px', color: '#cbd5e1', fontSize: '14px' };

export default AdvancedAnalyticsTab;
