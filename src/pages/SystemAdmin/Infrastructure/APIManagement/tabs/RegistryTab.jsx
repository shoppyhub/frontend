import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import apiManagementService from '../../../../../services/apiManagementService';
import APIConfigModal from '../components/APIConfigModal';

const RegistryTab = ({ themeColor }) => {
  const [apis, setAPIs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', status: '', search: '', page: 1, limit: 20 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAPI, setSelectedAPI] = useState(null);
  const [testingId, setTestingId] = useState(null);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchAPIs();
  }, [filters]);

  const fetchAPIs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiManagementService.getAPIRegistry(filters);
      if (res.data.success) {
        setAPIs(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to fetch APIs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleCreateNew = () => {
    setSelectedAPI(null);
    setIsModalOpen(true);
  };

  const handleEdit = (api) => {
    setSelectedAPI(api);
    setIsModalOpen(true);
  };

  const handleDelete = async (apiId) => {
    if (window.confirm('Are you sure you want to delete this API?')) {
      try {
        await apiManagementService.deleteAPI(apiId);
        toast.success('API deleted successfully');
        fetchAPIs();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const handleToggleStatus = async (apiId, currentStatus) => {
    try {
      await apiManagementService.toggleAPIStatus(apiId);
      toast.success(`API ${currentStatus === 'active' ? 'disabled' : 'enabled'}`);
      fetchAPIs();
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  const handleTestConnection = async (apiId) => {
    try {
      setTestingId(apiId);
      const res = await apiManagementService.testAPIConnection(apiId);
      if (res.data.success) {
        toast.success(`✅ Connection successful (${res.data.data.response_time_ms}ms)`);
      } else {
        toast.warning(`❌ Connection failed: ${res.data.data.error_message}`);
      }
      fetchAPIs();
    } catch (err) {
      toast.error('Test failed');
    } finally {
      setTestingId(null);
    }
  };

  const handleSaveAPI = async (apiData) => {
    try {
      if (selectedAPI) {
        await apiManagementService.updateAPI(selectedAPI._id, apiData);
        toast.success('API updated successfully');
      } else {
        await apiManagementService.createAPI(apiData);
        toast.success('API created successfully');
      }
      setIsModalOpen(false);
      fetchAPIs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const filteredAPIs = useMemo(() => apis, [apis]);

  if (loading && apis.length === 0) {
    return <div style={loaderS}>Loading APIs...</div>;
  }

  return (
    <div>
      {/* Search & Filter */}
      <div style={filterBarS}>
        <input
          type="text"
          placeholder="🔍 Search APIs..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          style={searchInputS}
        />

        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
          style={selectS}
        >
          <option value="">All Categories</option>
          <option value="payment_gateway">💳 Payment Gateway</option>
          <option value="sms_otp">📱 SMS OTP</option>
          <option value="email_otp">📧 Email</option>
          <option value="cloud_storage">☁️ Cloud Storage</option>
          <option value="gps_maps">📍 GPS Maps</option>
          <option value="custom">🔧 Custom</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          style={selectS}
        >
          <option value="">All Status</option>
          <option value="active">✅ Active</option>
          <option value="inactive">⏸️ Inactive</option>
          <option value="maintenance">🔧 Maintenance</option>
        </select>

        <button onClick={handleCreateNew} style={createBtnS(themeColor)}>
          ➕ Create New API
        </button>
      </div>

      {/* APIs Table */}
      <div style={tableContainerS}>
        <table style={tableS}>
          <thead style={theadS(themeColor)}>
            <tr>
              <th style={thS}>Name</th>
              <th style={thS}>Category</th>
              <th style={thS}>Provider</th>
              <th style={thS}>Status</th>
              <th style={thS}>Priority</th>
              <th style={thS}>Mode</th>
              <th style={thS}>Health</th>
              <th style={thS}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAPIs.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#cbd5e1' }}>
                  No APIs found
                </td>
              </tr>
            ) : (
              filteredAPIs.map(api => (
                <tr key={api._id} style={trS}>
                  <td style={tdS}>
                    <strong>{api.name}</strong>
                  </td>
                  <td style={tdS}>{getCategoryLabel(api.category)}</td>
                  <td style={tdS}>{api.provider}</td>
                  <td style={tdS}>
                    <span style={statusBadgeS(api.status)}>{api.status}</span>
                  </td>
                  <td style={tdS}>
                    <span style={prioBadgeS}>P{api.priority}</span>
                  </td>
                  <td style={tdS}>
                    <span style={modeBadgeS(api.mode)}>{api.mode}</span>
                  </td>
                  <td style={tdS}>
                    <span style={healthBadgeS(api.health_status)}>
                      {getHealthIcon(api.health_status)} {api.uptime_percent.toFixed(0)}%
                    </span>
                  </td>
                  <td style={tdS}>
                    <button
                      onClick={() => handleEdit(api)}
                      style={actionBtnS('edit', themeColor)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleToggleStatus(api._id, api.status)}
                      style={actionBtnS('toggle', themeColor)}
                      title={api.status === 'active' ? 'Disable' : 'Enable'}
                    >
                      {api.status === 'active' ? '⏸️' : '▶️'}
                    </button>
                    <button
                      onClick={() => handleTestConnection(api._id)}
                      disabled={testingId === api._id}
                      style={actionBtnS('test', themeColor)}
                      title="Test Connection"
                    >
                      {testingId === api._id ? '⏳' : '⚡'}
                    </button>
                    <button
                      onClick={() => handleDelete(api._id)}
                      style={actionBtnS('delete', themeColor)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
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

      {/* Modal */}
      <APIConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        api={selectedAPI}
        onSave={handleSaveAPI}
        themeColor={themeColor}
      />
    </div>
  );
};

// Helper Functions
const getCategoryLabel = (cat) => {
  const labels = {
    payment_gateway: '💳 Payment',
    sms_otp: '📱 SMS',
    email_otp: '📧 Email',
    cloud_storage: '☁️ Storage',
    gps_maps: '📍 Maps',
    custom: '🔧 Custom'
  };
  return labels[cat] || cat;
};

const getHealthIcon = (status) => {
  const icons = { healthy: '✅', degraded: '⚠️', down: '❌', unknown: '❓' };
  return icons[status] || '❓';
};

// Styles
const filterBarS = { display: 'flex', gap: '12px', marginBottom: '25px', flexWrap: 'wrap', alignItems: 'center' };
const searchInputS = { flex: 1, minWidth: '200px', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none' };
const selectS = { padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: '#fff', cursor: 'pointer', outline: 'none' };
const createBtnS = (c) => ({ padding: '12px 24px', background: c, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', boxShadow: `0 8px 16px ${c}40` });

const tableContainerS = { overflowX: 'auto', marginBottom: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' };
const tableS = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' };
const theadS = (c) => ({ background: c, color: '#fff' });
const thS = { padding: '16px', textAlign: 'left', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const trS = { borderBottom: '1px solid #e2e8f0', transition: '0.2s', cursor: 'pointer' };
const tdS = { padding: '14px 16px', color: '#475569' };

const statusBadgeS = (s) => {
  const colors = { active: '#10b981', inactive: '#94a3b8', maintenance: '#f59e0b' };
  return { display: 'inline-block', padding: '4px 10px', borderRadius: '8px', background: `${colors[s]}20`, color: colors[s], fontWeight: '700', fontSize: '11px' };
};
const prioBadgeS = { display: 'inline-block', padding: '4px 10px', borderRadius: '8px', background: '#f1f5f9', color: '#64748b', fontWeight: '700', fontSize: '11px' };
const modeBadgeS = (m) => {
  const colors = { test: '#c2410c', live: '#10b981' };
  return { display: 'inline-block', padding: '4px 10px', borderRadius: '8px', background: `${colors[m]}20`, color: colors[m], fontWeight: '700', fontSize: '11px' };
};
const healthBadgeS = (s) => {
  const colors = { healthy: '#10b981', degraded: '#f59e0b', down: '#ef4444', unknown: '#94a3b8' };
  return { display: 'inline-block', padding: '4px 10px', borderRadius: '8px', background: `${colors[s]}20`, color: colors[s], fontWeight: '700', fontSize: '11px' };
};

const actionBtnS = (type, c) => {
  const styles = {
    edit: { background: '#3b82f6', boxShadow: '0 4px 10px rgba(59,130,246,0.3)' },
    toggle: { background: '#f59e0b', boxShadow: '0 4px 10px rgba(245,158,11,0.3)' },
    test: { background: '#8b5cf6', boxShadow: '0 4px 10px rgba(139,92,246,0.3)' },
    delete: { background: '#ef4444', boxShadow: '0 4px 10px rgba(239,68,68,0.3)' }
  };
  return { ...styles[type], color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', marginRight: '4px', transition: '0.2s' };
};

const paginationS = { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' };
const pageBtnS = { padding: '10px 20px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#fff', cursor: 'pointer', fontWeight: '700', transition: '0.2s' };
const pageInfoS = { fontSize: '13px', color: '#64748b', fontWeight: '700' };

const loaderS = { textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '14px' };

export default RegistryTab;
