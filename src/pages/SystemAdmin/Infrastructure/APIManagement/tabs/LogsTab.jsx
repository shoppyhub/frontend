import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiManagementService from '../../../../../services/apiManagementService';

const LogsTab = ({ themeColor }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, limit: 50, error_only: false });
  const [pagination, setPagination] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiManagementService.getUsageLogs(filters);
      if (res.data.success) {
        setLogs(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await apiManagementService.exportUsageLogs(filters, 'csv');
      toast.success('Logs exported successfully');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return '#10b981';
    if (status >= 400 && status < 500) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusIcon = (status) => {
    if (status >= 200 && status < 300) return '✅';
    if (status >= 400 && status < 500) return '⚠️';
    return '❌';
  };

  if (loading && logs.length === 0) {
    return <div style={loaderS}>Loading logs...</div>;
  }

  return (
    <div>
      {/* Controls */}
      <div style={controlsS}>
        <div style={filterGroupS}>
          <label style={labelS}>Filter:</label>
          <input
            type="checkbox"
            checked={filters.error_only}
            onChange={(e) => setFilters({ ...filters, error_only: e.target.checked, page: 1 })}
            style={{ cursor: 'pointer' }}
          />
          <span style={checkLabelS}>Errors Only</span>
        </div>

        <button
          onClick={() => setFilters({ ...filters, page: 1 })}
          style={refreshBtnS(themeColor)}
        >
          🔄 Refresh
        </button>

        <button onClick={handleExport} style={exportBtnS(themeColor)}>
          📥 Export CSV
        </button>
      </div>

      {/* Logs Table */}
      <div style={tableContainerS}>
        <table style={tableS}>
          <thead style={theadS(themeColor)}>
            <tr>
              <th style={thS}>Timestamp</th>
              <th style={thS}>API</th>
              <th style={thS}>Endpoint</th>
              <th style={thS}>Method</th>
              <th style={thS}>Status</th>
              <th style={thS}>Response Time</th>
              <th style={thS}>Caller</th>
              <th style={thS}>Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#cbd5e1' }}>
                  No logs found
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <React.Fragment key={log._id}>
                  <tr style={trS(expandedId === log._id)}>
                    <td style={tdS}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={tdS}>{log.api_id?.name || 'Unknown'}</td>
                    <td style={tdS}>
                      <code style={codeS}>{log.endpoint.substring(0, 40)}</code>
                    </td>
                    <td style={tdS}>
                      <span style={methodBadgeS(log.method)}>
                        {log.method}
                      </span>
                    </td>
                    <td style={tdS}>
                      <span style={statusBadgeS(getStatusColor(log.response_status))}>
                        {getStatusIcon(log.response_status)} {log.response_status}
                      </span>
                    </td>
                    <td style={tdS}>{log.response_time_ms}ms</td>
                    <td style={tdS}>
                      <small style={smallS}>{log.caller_id || 'System'}</small>
                    </td>
                    <td style={tdS}>
                      <button
                        onClick={() => setExpandedId(expandedId === log._id ? null : log._id)}
                        style={expandBtnS}
                      >
                        {expandedId === log._id ? '🔼' : '🔽'}
                      </button>
                    </td>
                  </tr>

                  {expandedId === log._id && (
                    <tr style={expandRowS}>
                      <td colSpan="8">
                        <div style={detailsBoxS}>
                          <div style={detailSectionS}>
                            <h4 style={detailTitleS}>Request</h4>
                            <pre style={preS}>
                              {log.request_body ? JSON.stringify(JSON.parse(log.request_body), null, 2) : 'No request body'}
                            </pre>
                          </div>
                          <div style={detailSectionS}>
                            <h4 style={detailTitleS}>Response</h4>
                            <pre style={preS}>
                              {log.response_body ? JSON.stringify(JSON.parse(log.response_body), null, 2) : 'No response body'}
                            </pre>
                          </div>
                          {log.error_message && (
                            <div style={detailSectionS}>
                              <h4 style={{ ...detailTitleS, color: '#ef4444' }}>❌ Error</h4>
                              <pre style={{ ...preS, color: '#ef4444', background: '#fee2e2' }}>
                                {log.error_message}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={paginationS}>
          <button
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            disabled={filters.page === 1}
            style={pageBtnS}
          >
            ← Prev
          </button>
          <span style={pageInfoS}>
            Page {filters.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={filters.page === pagination.pages}
            style={pageBtnS}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

// Styles
const loaderS = { textAlign: 'center', padding: '60px 30px', color: '#94a3b8' };

const controlsS = { display: 'flex', gap: '15px', marginBottom: '25px', alignItems: 'center', flexWrap: 'wrap' };
const filterGroupS = { display: 'flex', gap: '8px', alignItems: 'center' };
const labelS = { fontSize: '13px', fontWeight: '700', color: '#475569' };
const checkLabelS = { fontSize: '13px', fontWeight: '700', color: '#475569' };
const refreshBtnS = (c) => ({ padding: '10px 18px', background: c, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', boxShadow: `0 4px 10px ${c}40` });
const exportBtnS = (c) => ({ padding: '10px 18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '12px', cursor: 'pointer' });

const tableContainerS = { overflowX: 'auto', marginBottom: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' };
const tableS = { width: '100%', borderCollapse: 'collapse', fontSize: '12px' };
const theadS = (c) => ({ background: c, color: '#fff' });
const thS = { padding: '14px 12px', textAlign: 'left', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase' };
const trS = (isExpanded) => ({ borderBottom: '1px solid #e2e8f0', background: isExpanded ? '#f8fafc' : 'transparent' });
const tdS = { padding: '12px', color: '#475569' };
const codeS = { background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace', color: '#0f172a' };
const methodBadgeS = (method) => {
  const colors = { GET: '#3b82f6', POST: '#10b981', PUT: '#f59e0b', DELETE: '#ef4444', PATCH: '#8b5cf6' };
  return { background: `${colors[method]}20`, color: colors[method], padding: '4px 10px', borderRadius: '6px', fontWeight: '700', fontSize: '11px' };
};
const statusBadgeS = (color) => ({ background: `${color}20`, color, padding: '4px 10px', borderRadius: '6px', fontWeight: '700', fontSize: '11px' });
const smallS = { color: '#94a3b8', fontSize: '11px' };
const expandBtnS = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px 8px' };

const expandRowS = { background: '#f8fafc' };
const detailsBoxS = { padding: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' };
const detailSectionS = { background: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' };
const detailTitleS = { margin: '0 0 10px', fontSize: '12px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' };
const preS = { margin: 0, background: '#f1f5f9', padding: '10px', borderRadius: '8px', fontSize: '11px', color: '#0f172a', overflow: 'auto', maxHeight: '200px', fontFamily: 'monospace' };

const paginationS = { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' };
const pageBtnS = { padding: '10px 18px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '12px' };
const pageInfoS = { fontSize: '12px', color: '#64748b', fontWeight: '700' };

export default LogsTab;
