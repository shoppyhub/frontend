import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../../../../../services/api';

const BulkOperationsTab = ({ themeColor }) => {
  const [bulkAction, setBulkAction] = useState('none');
  const [selectedAPIs, setSelectedAPIs] = useState([]);
  const [allAPIs, setAllAPIs] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Load all APIs on mount
  React.useEffect(() => {
    fetchAllAPIs();
  }, []);

  const fetchAllAPIs = async () => {
    try {
      const res = await api.get('/admin/apis/all?limit=1000');
      if (res.data.success) {
        setAllAPIs(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load APIs');
    }
  };

  // Bulk Status Update
  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedAPIs.length === 0) {
      toast.warning('Select APIs first');
      return;
    }

    try {
      setLoading(true);
      await Promise.all(
        selectedAPIs.map(apiId =>
          api.patch(`/admin/apis/${apiId}/status`, { status: newStatus })
        )
      );
      toast.success(`${selectedAPIs.length} APIs updated to ${newStatus}`);
      setSelectedAPIs([]);
      fetchAllAPIs();
    } catch (err) {
      toast.error('Bulk update failed');
    } finally {
      setLoading(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedAPIs.length === 0) {
      toast.warning('Select APIs first');
      return;
    }

    if (!window.confirm(`Delete ${selectedAPIs.length} APIs? This cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await Promise.all(
        selectedAPIs.map(apiId =>
          api.delete(`/admin/apis/${apiId}`)
        )
      );
      toast.success(`${selectedAPIs.length} APIs deleted`);
      setSelectedAPIs([]);
      fetchAllAPIs();
    } catch (err) {
      toast.error('Bulk delete failed');
    } finally {
      setLoading(false);
    }
  };

  // Export APIs
  const handleExport = (format) => {
    const dataToExport = selectedAPIs.length > 0
      ? allAPIs.filter(a => selectedAPIs.includes(a._id))
      : allAPIs;

    const dataStr = format === 'json'
      ? JSON.stringify(dataToExport, null, 2)
      : convertToCSV(dataToExport);

    const element = document.createElement('a');
    const mimeType = format === 'json' ? 'application/json' : 'text/csv';
    element.setAttribute(
      'href',
      `data:${mimeType};charset=utf-8,${encodeURIComponent(dataStr)}`
    );
    element.setAttribute('download', `apis-export-${new Date().getTime()}.${format}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success(`Exported ${dataToExport.length} APIs as ${format.toUpperCase()}`);
  };

  const convertToCSV = (data) => {
    const headers = ['Name', 'Category', 'Provider', 'Status', 'URL'];
    let csv = headers.join(',') + '\n';
    data.forEach(api => {
      csv += `"${api.name}","${api.category}","${api.provider}","${api.status}","${api.api_url}"\n`;
    });
    return csv;
  };

  // Import APIs
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        const apisToImport = JSON.parse(content);

        if (!Array.isArray(apisToImport)) {
          toast.error('Invalid format. Expected an array of APIs.');
          return;
        }

        setLoading(true);
        const results = await Promise.allSettled(
          apisToImport.map(apiData =>
            api.post('/admin/apis/create', apiData)
          )
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        toast.success(`Imported ${successful} APIs. Failed: ${failed}`);
        fetchAllAPIs();
      } catch (err) {
        toast.error('Invalid JSON format');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const toggleAPI = (apiId) => {
    setSelectedAPIs(prev =>
      prev.includes(apiId)
        ? prev.filter(id => id !== apiId)
        : [...prev, apiId]
    );
  };

  const toggleAllAPIs = () => {
    if (selectedAPIs.length === allAPIs.length) {
      setSelectedAPIs([]);
    } else {
      setSelectedAPIs(allAPIs.map(a => a._id));
    }
  };

  return (
    <div>
      {/* Action Toolbar */}
      <div style={toolbarS}>
        <div style={toolbarGroupS}>
          <label style={labelS}>🎯 Bulk Actions</label>
          <button onClick={() => handleBulkStatusUpdate('active')} style={bulkButtonS(themeColor)}>
            ✅ Activate Selected
          </button>
          <button onClick={() => handleBulkStatusUpdate('inactive')} style={bulkButtonS('#f59e0b')}>
            ⏸️ Deactivate Selected
          </button>
          <button onClick={handleBulkDelete} style={bulkButtonS('#ef4444')}>
            🗑️ Delete Selected
          </button>
        </div>

        <div style={toolbarGroupS}>
          <label style={labelS}>📥 Import / Export</label>
          <button onClick={() => handleExport('json')} style={bulkButtonS(themeColor)}>
            📥 Export JSON
          </button>
          <button onClick={() => handleExport('csv')} style={bulkButtonS(themeColor)}>
            📥 Export CSV
          </button>
          <button onClick={() => fileInputRef.current?.click()} style={bulkButtonS('#3b82f6')}>
            📤 Import APIs
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* APIs List with Checkboxes */}
      <div style={tableContainerS}>
        <div style={tableHeaderS}>
          <div style={headerCellS}>
            <input
              type="checkbox"
              checked={selectedAPIs.length === allAPIs.length && allAPIs.length > 0}
              onChange={toggleAllAPIs}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <strong style={{marginLeft: '10px'}}>Select All</strong>
          </div>
          <div style={{flex: 1, textAlign: 'right', fontSize: '12px', fontWeight: '900', color: '#64748b'}}>
            {selectedAPIs.length} selected
          </div>
        </div>

        <div style={apisListS}>
          {allAPIs.length === 0 ? (
            <div style={emptyS}>No APIs to manage</div>
          ) : (
            allAPIs.map(api => (
              <div key={api._id} style={apiItemS(selectedAPIs.includes(api._id))}>
                <input
                  type="checkbox"
                  checked={selectedAPIs.includes(api._id)}
                  onChange={() => toggleAPI(api._id)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div style={{flex: 1, marginLeft: '15px'}}>
                  <div style={{fontWeight: '900', color: '#1e293b'}}>{api.name}</div>
                  <small style={{color: '#94a3b8'}}>
                    {api.provider} • {api.category}
                  </small>
                </div>
                <span style={statusBadgeS(api.status)}>{api.status}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div style={summaryS}>
        <div style={summaryItemS}>
          <span>📊 Total APIs:</span>
          <strong>{allAPIs.length}</strong>
        </div>
        <div style={summaryItemS}>
          <span>✅ Selected:</span>
          <strong style={{color: themeColor}}>{selectedAPIs.length}</strong>
        </div>
        <div style={summaryItemS}>
          <span>🟢 Active:</span>
          <strong>{allAPIs.filter(a => a.status === 'active').length}</strong>
        </div>
        <div style={summaryItemS}>
          <span>⏸️ Inactive:</span>
          <strong>{allAPIs.filter(a => a.status === 'inactive').length}</strong>
        </div>
      </div>
    </div>
  );
};

// Styles
const toolbarS = { display: 'flex', gap: '30px', marginBottom: '30px', padding: '25px', background: '#fff', borderRadius: '18px', border: '1px solid #f1f5f9', flexWrap: 'wrap' };
const toolbarGroupS = { display: 'flex', alignItems: 'flex-end', gap: '10px', flexWrap: 'wrap' };
const labelS = { fontSize: '11px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' };
const bulkButtonS = (c) => ({ padding: '10px 18px', background: c, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', boxShadow: `0 4px 8px ${c}40`, transition: '0.2s' });

const tableContainerS = { background: '#fff', borderRadius: '18px', border: '1px solid #f1f5f9', overflow: 'hidden', marginBottom: '20px' };
const tableHeaderS = { display: 'flex', alignItems: 'center', padding: '20px 25px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' };
const headerCellS = { display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: '900', color: '#0f172a' };

const apisListS = { maxHeight: '500px', overflowY: 'auto' };
const apiItemS = (selected) => ({ display: 'flex', alignItems: 'center', padding: '18px 25px', borderBottom: '1px solid #f1f5f9', background: selected ? '#f0f9ff' : '#fff', cursor: 'pointer', transition: '0.2s' });
const statusBadgeS = (s) => { const colors = { active: '#10b981', inactive: '#94a3b8' }; return { display: 'inline-block', padding: '6px 12px', borderRadius: '10px', background: `${colors[s]}20`, color: colors[s], fontWeight: '900', fontSize: '11px' }; };

const summaryS = { display: 'flex', gap: '20px', padding: '20px', background: '#f8fafc', borderRadius: '15px', flexWrap: 'wrap' };
const summaryItemS = { display: 'flex', gap: '10px', fontSize: '13px', fontWeight: '700', alignItems: 'center' };

const emptyS = { textAlign: 'center', padding: '60px 30px', color: '#cbd5e1', fontSize: '14px' };

export default BulkOperationsTab;
