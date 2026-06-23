import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../../../../services/api';

const SecurityComplianceTab = ({ themeColor }) => {
  const [apis, setAPIs] = useState([]);
  const [selectedAPI, setSelectedAPI] = useState(null);
  const [auditResult, setAuditResult] = useState(null);
  const [complianceResult, setComplianceResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('security');

  useEffect(() => {
    fetchAPIs();
  }, []);

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

  const handleSecurityAudit = async () => {
    if (!selectedAPI) {
      toast.warning('Select an API first');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/admin/apis/${selectedAPI}/security-audit`);
      if (res.data.success) {
        setAuditResult(res.data.data);
      }
    } catch (err) {
      toast.error('Audit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleComplianceCheck = async () => {
    if (!selectedAPI) {
      toast.warning('Select an API first');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/admin/apis/${selectedAPI}/compliance-check`);
      if (res.data.success) {
        setComplianceResult(res.data.data);
      }
    } catch (err) {
      toast.error('Compliance check failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRotateKey = async () => {
    if (!selectedAPI) {
      toast.warning('Select an API first');
      return;
    }

    if (!window.confirm('Rotate API key? Old key will be invalidated.')) return;

    try {
      setLoading(true);
      const res = await api.post(`/admin/apis/${selectedAPI}/rotate-key`);
      if (res.data.success) {
        toast.success(`Key rotated. New key preview: ${res.data.data.api_key_preview}`);
      }
    } catch (err) {
      toast.error('Key rotation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Control Panel */}
      <div style={controlPanelS}>
        <div style={selectGroupS}>
          <label style={labelS}>🔐 Select API</label>
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

        <button onClick={handleSecurityAudit} style={buttonS(themeColor)} disabled={loading}>
          🛡️ {loading ? 'Auditing...' : 'Run Security Audit'}
        </button>

        <button onClick={handleComplianceCheck} style={buttonS('#10b981')} disabled={loading}>
          ✓ {loading ? 'Checking...' : 'Compliance Check'}
        </button>

        <button onClick={handleRotateKey} style={buttonS('#ef4444')} disabled={loading}>
          🔄 Rotate API Key
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={tabNavS}>
        <button
          onClick={() => setActiveTab('security')}
          style={tabButtonS(activeTab === 'security', themeColor)}
        >
          🛡️ Security Audit
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          style={tabButtonS(activeTab === 'compliance', themeColor)}
        >
          📋 Compliance
        </button>
      </div>

      {/* Security Audit Results */}
      {activeTab === 'security' && auditResult && (
        <div style={resultContainerS}>
          <div style={resultHeaderS}>
            <h3 style={{margin: 0}}>🛡️ Security Audit Report</h3>
            <div style={scoreDisplayS(auditResult.security_score)}>
              Security Score: {auditResult.security_score}%
            </div>
          </div>

          <div style={checksGridS}>
            {Object.entries(auditResult.checks).map(([checkName, isPassed]) => (
              <div key={checkName} style={checkItemS(isPassed)}>
                <span style={{fontSize: '20px'}}>
                  {isPassed ? '✅' : '❌'}
                </span>
                <span style={{marginLeft: '10px', fontWeight: '700', textTransform: 'capitalize'}}>
                  {checkName.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>

          {auditResult.vulnerabilities.length > 0 && (
            <div style={vulnerabilitySectionS}>
              <h4 style={{margin: '0 0 15px', color: '#ef4444', fontWeight: '900'}}>⚠️ Vulnerabilities Found:</h4>
              {auditResult.vulnerabilities.map((vuln, idx) => (
                <div key={idx} style={vulnerabilityItemS}>
                  <span style={{color: '#ef4444', fontWeight: '900'}}>•</span>
                  <span style={{marginLeft: '10px'}}>{vuln}</span>
                </div>
              ))}
            </div>
          )}

          {auditResult.recommendations.length > 0 && (
            <div style={recommendationSectionS}>
              <h4 style={{margin: '0 0 15px', color: '#f59e0b', fontWeight: '900'}}>💡 Recommendations:</h4>
              {auditResult.recommendations.map((rec, idx) => (
                <div key={idx} style={recommendationItemS}>
                  <span style={{color: '#f59e0b', fontWeight: '900'}}>→</span>
                  <span style={{marginLeft: '10px'}}>{rec}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Compliance Results */}
      {activeTab === 'compliance' && complianceResult && (
        <div style={resultContainerS}>
          <div style={resultHeaderS}>
            <h3 style={{margin: 0}}>📋 Compliance Report</h3>
            <div style={scoreDisplayS(complianceResult.compliance_score)}>
              Compliance Score: {complianceResult.compliance_score}%
            </div>
          </div>

          <div style={complianceGridS}>
            <div style={complianceCardS(complianceResult.gdpr_compliant)}>
              <div style={{fontSize: '24px'}}>{complianceResult.gdpr_compliant ? '✅' : '❌'}</div>
              <div style={{marginTop: '10px', fontWeight: '900', fontSize: '14px'}}>GDPR Compliant</div>
            </div>
            <div style={complianceCardS(complianceResult.data_encryption)}>
              <div style={{fontSize: '24px'}}>{complianceResult.data_encryption ? '✅' : '❌'}</div>
              <div style={{marginTop: '10px', fontWeight: '900', fontSize: '14px'}}>Data Encryption</div>
            </div>
            <div style={complianceCardS(complianceResult.audit_logging)}>
              <div style={{fontSize: '24px'}}>{complianceResult.audit_logging ? '✅' : '❌'}</div>
              <div style={{marginTop: '10px', fontWeight: '900', fontSize: '14px'}}>Audit Logging</div>
            </div>
            <div style={complianceCardS(complianceResult.access_control)}>
              <div style={{fontSize: '24px'}}>{complianceResult.access_control ? '✅' : '❌'}</div>
              <div style={{marginTop: '10px', fontWeight: '900', fontSize: '14px'}}>Access Control</div>
            </div>
            <div style={complianceCardS(complianceResult.data_retention)}>
              <div style={{fontSize: '24px'}}>{complianceResult.data_retention ? '✅' : '❌'}</div>
              <div style={{marginTop: '10px', fontWeight: '900', fontSize: '14px'}}>Data Retention</div>
            </div>
          </div>

          {complianceResult.recommended_actions.length > 0 && (
            <div style={actionsSectionS}>
              <h4 style={{margin: '0 0 15px', fontWeight: '900'}}>📌 Recommended Actions:</h4>
              {complianceResult.recommended_actions.map((action, idx) => (
                <div key={idx} style={{padding: '10px 0', paddingLeft: '20px', borderLeft: '3px solid #3b82f6'}}>
                  {action}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!auditResult && !complianceResult && !loading && (
        <div style={emptyStateS}>
          <p style={{fontSize: '18px', fontWeight: '900', color: '#94a3b8'}}>
            🔐 Select an API and run security audit or compliance check
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
const buttonS = (c) => ({ padding: '10px 20px', background: c, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', boxShadow: `0 4px 8px ${c}40` });

const tabNavS = { display: 'flex', gap: '10px', marginBottom: '20px' };
const tabButtonS = (isActive, c) => ({ padding: '10px 20px', background: isActive ? c : '#f1f5f9', color: isActive ? '#fff' : '#64748b', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', transition: '0.2s' });

const resultContainerS = { background: '#fff', padding: '30px', borderRadius: '18px', border: '1px solid #f1f5f9' };
const resultHeaderS = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' };
const scoreDisplayS = (score) => ({ fontSize: '16px', fontWeight: '900', color: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444', padding: '8px 16px', background: score >= 80 ? '#ecfdf5' : score >= 60 ? '#fffbeb' : '#fef2f2', borderRadius: '10px' });

const checksGridS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '25px' };
const checkItemS = (isPassed) => ({ display: 'flex', alignItems: 'center', padding: '15px', background: isPassed ? '#ecfdf5' : '#fef2f2', borderRadius: '12px', border: `1px solid ${isPassed ? '#d1fae5' : '#fee2e2'}` });

const vulnerabilitySectionS = { padding: '20px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2', marginBottom: '20px' };
const vulnerabilityItemS = { display: 'flex', alignItems: 'flex-start', padding: '10px 0' };

const recommendationSectionS = { padding: '20px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fef3c7', marginBottom: '20px' };
const recommendationItemS = { display: 'flex', alignItems: 'flex-start', padding: '10px 0' };

const complianceGridS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '25px' };
const complianceCardS = (isPassed) => ({ padding: '20px', background: isPassed ? '#ecfdf5' : '#fef2f2', borderRadius: '12px', border: `2px solid ${isPassed ? '#d1fae5' : '#fee2e2'}`, textAlign: 'center' });

const actionsSectionS = { padding: '20px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe' };

const emptyStateS = { textAlign: 'center', padding: '80px 30px', color: '#cbd5e1', fontSize: '14px' };

export default SecurityComplianceTab;
