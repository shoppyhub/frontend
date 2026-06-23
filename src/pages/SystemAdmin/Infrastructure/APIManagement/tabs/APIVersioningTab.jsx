import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../../../../services/api';

const APIVersioningTab = ({ themeColor }) => {
  const [apis, setAPIs] = useState([]);
  const [selectedAPI, setSelectedAPI] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showVersionForm, setShowVersionForm] = useState(false);
  const [formData, setFormData] = useState({
    version_number: '',
    status: 'stable',
    description: '',
    breaking_changes: ''
  });

  useEffect(() => {
    fetchAPIs();
  }, []);

  useEffect(() => {
    if (selectedAPI) {
      fetchVersions();
    }
  }, [selectedAPI]);

  const fetchAPIs = async () => {
    try {
      const res = await api.get('/admin/apis/all?limit=100');
      if (res.data.success) {
        setAPIs(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load APIs');
    }
  };

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/apis/${selectedAPI}/versions`);
      if (res.data.success) {
        setVersions(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load versions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!formData.version_number) {
      toast.warning('Version number is required');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/admin/apis/${selectedAPI}/versions`, {
        ...formData,
        breaking_changes: formData.breaking_changes.split(',').map(s => s.trim()).filter(s => s)
      });

      if (res.data.success) {
        toast.success(`Version ${formData.version_number} created`);
        setFormData({ version_number: '', status: 'stable', description: '', breaking_changes: '' });
        setShowVersionForm(false);
        fetchVersions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create version');
    } finally {
      setLoading(false);
    }
  };

  const handleDeprecateVersion = async (versionId) => {
    const sunsetDate = prompt('Enter sunset date (YYYY-MM-DD):');
    if (!sunsetDate) return;

    try {
      setLoading(true);
      await api.post(`/admin/apis/versions/${versionId}/deprecate`, { sunset_date: sunsetDate });
      toast.success('Version deprecated');
      fetchVersions();
    } catch (err) {
      toast.error('Deprecation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Control Panel */}
      <div style={controlPanelS}>
        <div style={selectGroupS}>
          <label style={labelS}>📦 Select API</label>
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

        <button
          onClick={() => setShowVersionForm(!showVersionForm)}
          style={buttonS(themeColor)}
        >
          {showVersionForm ? '❌ Cancel' : '➕ Create Version'}
        </button>
      </div>

      {/* Version Creation Form */}
      {showVersionForm && (
        <div style={formContainerS}>
          <h3 style={{margin: '0 0 20px', fontSize: '18px', fontWeight: '900', color: '#0f172a'}}>📝 Create New Version</h3>

          <div style={formGridS}>
            <div style={formGroupS}>
              <label style={labelS}>Version Number</label>
              <input
                type="text"
                placeholder="e.g., 2.0.0"
                value={formData.version_number}
                onChange={(e) => setFormData({...formData, version_number: e.target.value})}
                style={inputS}
              />
            </div>

            <div style={formGroupS}>
              <label style={labelS}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                style={inputS}
              >
                <option value="alpha">Alpha</option>
                <option value="beta">Beta</option>
                <option value="stable">Stable</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </div>

            <div style={{...formGroupS, gridColumn: 'span 2'}}>
              <label style={labelS}>Description</label>
              <textarea
                placeholder="Version description and changelog"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                style={{...inputS, minHeight: '100px', fontFamily: 'inherit', resize: 'vertical'}}
              />
            </div>

            <div style={{...formGroupS, gridColumn: 'span 2'}}>
              <label style={labelS}>Breaking Changes (comma-separated)</label>
              <textarea
                placeholder="List breaking changes, e.g., Removed /v1/users endpoint, Changed response format"
                value={formData.breaking_changes}
                onChange={(e) => setFormData({...formData, breaking_changes: e.target.value})}
                style={{...inputS, minHeight: '80px', fontFamily: 'inherit', resize: 'vertical'}}
              />
            </div>
          </div>

          <div style={formActionsS}>
            <button onClick={handleCreateVersion} style={buttonS(themeColor)} disabled={loading}>
              {loading ? '⏳ Creating...' : '✅ Create Version'}
            </button>
            <button onClick={() => setShowVersionForm(false)} style={cancelButtonS}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Versions List */}
      <div style={versionsContainerS}>
        <h3 style={{margin: '0 0 25px', fontSize: '18px', fontWeight: '900', color: '#0f172a'}}>📦 API Versions</h3>

        {versions.length === 0 ? (
          <div style={emptyStateS}>
            <p style={{fontSize: '15px', fontWeight: '700', color: '#94a3b8'}}>
              No versions found. Create your first version above.
            </p>
          </div>
        ) : (
          <div style={versionsGridS}>
            {versions.map(version => (
              <div key={version._id} style={versionCardS(version.status)}>
                <div style={versionHeaderS}>
                  <div>
                    <h4 style={{margin: 0, fontSize: '16px', fontWeight: '900', color: '#1e293b'}}>
                      v{version.version_number}
                    </h4>
                    <small style={{color: '#94a3b8', marginTop: '4px', display: 'block'}}>
                      Released: {new Date(version.released_at).toLocaleDateString()}
                    </small>
                  </div>
                  <span style={statusBadgeS(version.status)}>
                    {version.status.toUpperCase()}
                  </span>
                </div>

                <div style={{marginTop: '15px', marginBottom: '15px', color: '#475569', fontSize: '13px', lineHeight: '1.6'}}>
                  {version.description}
                </div>

                {version.breaking_changes && version.breaking_changes.length > 0 && (
                  <div style={{padding: '12px', background: '#fef2f2', borderRadius: '10px', marginBottom: '15px'}}>
                    <b style={{fontSize: '11px', color: '#991b1b', display: 'block', marginBottom: '8px'}}>⚠️ BREAKING CHANGES</b>
                    <ul style={{margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#7f1d1d'}}>
                      {version.breaking_changes.map((change, idx) => (
                        <li key={idx}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {version.status === 'deprecated' && version.sunset_date && (
                  <div style={{padding: '12px', background: '#fffbeb', borderRadius: '10px', marginBottom: '15px'}}>
                    <b style={{fontSize: '11px', color: '#92400e'}}>🔴 SUNSET DATE: {new Date(version.sunset_date).toLocaleDateString()}</b>
                  </div>
                )}

                <div style={versionStatsS}>
                  <div style={statItemS}>
                    <span>📊 Usage:</span>
                    <strong>{version.usage_count || 0}</strong>
                  </div>
                  <div style={statItemS}>
                    <span>📈 Error Rate:</span>
                    <strong>{(version.error_rate || 0).toFixed(2)}%</strong>
                  </div>
                </div>

                {version.status !== 'deprecated' && (
                  <button
                    onClick={() => handleDeprecateVersion(version._id)}
                    style={deprecateBtnS}
                  >
                    Mark as Deprecated
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const controlPanelS = { display: 'flex', gap: '15px', marginBottom: '30px', padding: '20px', background: '#fff', borderRadius: '18px', border: '1px solid #f1f5f9', alignItems: 'flex-end', flexWrap: 'wrap' };
const selectGroupS = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelS = { fontSize: '11px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' };
const selectS = { padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', background: '#fff', cursor: 'pointer', outline: 'none' };
const buttonS = (c) => ({ padding: '12px 24px', background: c, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', boxShadow: `0 4px 8px ${c}40` });

const formContainerS = { background: '#fff', padding: '30px', borderRadius: '18px', border: '1px solid #f1f5f9', marginBottom: '30px' };
const formGridS = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' };
const formGroupS = { display: 'flex', flexDirection: 'column', gap: '8px' };
const inputS = { padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', outline: 'none' };
const formActionsS = { display: 'flex', gap: '12px' };
const cancelButtonS = { padding: '12px 24px', background: '#f1f5f9', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontWeight: '900', fontSize: '13px', cursor: 'pointer' };

const versionsContainerS = { background: '#fff', padding: '30px', borderRadius: '18px', border: '1px solid #f1f5f9' };
const versionsGridS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' };

const versionCardS = (status) => {
  const bgColors = { alpha: '#f0f9ff', beta: '#f5f3ff', stable: '#ecfdf5', deprecated: '#fef2f2' };
  const borderColors = { alpha: '#dbeafe', beta: '#e9d5ff', stable: '#d1fae5', deprecated: '#fee2e2' };
  return { padding: '20px', background: bgColors[status], borderRadius: '15px', border: `2px solid ${borderColors[status]}` };
};

const versionHeaderS = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };
const statusBadgeS = (status) => {
  const colors = { alpha: '#3b82f6', beta: '#8b5cf6', stable: '#10b981', deprecated: '#ef4444' };
  return { fontSize: '10px', fontWeight: '900', color: '#fff', background: colors[status], padding: '6px 12px', borderRadius: '8px', textTransform: 'uppercase' };
};

const versionStatsS = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', background: 'rgba(0,0,0,0.03)', borderRadius: '10px', marginBottom: '15px' };
const statItemS = { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700' };

const deprecateBtnS = { width: '100%', padding: '10px', background: '#fef2f2', color: '#991b1b', border: '1.5px solid #fee2e2', borderRadius: '10px', fontWeight: '900', fontSize: '12px', cursor: 'pointer' };

const emptyStateS = { textAlign: 'center', padding: '60px 30px', color: '#cbd5e1' };

export default APIVersioningTab;
