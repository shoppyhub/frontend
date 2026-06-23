import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiManagementService from '../../../../../services/apiManagementService';

const HealthTab = ({ themeColor }) => {
  const [healthData, setHealthData] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('all');

  useEffect(() => {
    fetchHealth();
  }, [activeStatus]);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const [healthRes, incidentRes] = await Promise.all([
        apiManagementService.getAllHealthStatus(activeStatus === 'all' ? null : activeStatus),
        apiManagementService.getIncidents()
      ]);

      if (healthRes.data.success) {
        setHealthData(healthRes.data);
      }
      if (incidentRes.data.success) {
        setIncidents(incidentRes.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  const handleHealthCheck = async (apiId) => {
    try {
      const res = await apiManagementService.triggerHealthCheck(apiId);
      if (res.data.success) {
        toast.success(`✅ Health check completed: ${res.data.data.api_status}`);
        fetchHealth();
      }
    } catch (err) {
      toast.error('Health check failed');
    }
  };

  if (loading) return <div style={loaderS}>Loading health status...</div>;
  if (!healthData) return <div style={loaderS}>No health data</div>;

  const report = healthData.health_report || {};

  return (
    <div>
      {/* Health Report */}
      <div style={reportGridS}>
        <div style={reportCardS(themeColor, '#10b981')}>
          <div style={reportNumberS}>{report.healthy_apis || 0}</div>
          <div style={reportLabelS}>Healthy APIs</div>
        </div>
        <div style={reportCardS(themeColor, '#f59e0b')}>
          <div style={reportNumberS}>{report.degraded_apis || 0}</div>
          <div style={reportLabelS}>Degraded</div>
        </div>
        <div style={reportCardS(themeColor, '#ef4444')}>
          <div style={reportNumberS}>{report.down_apis || 0}</div>
          <div style={reportLabelS}>Down</div>
        </div>
        <div style={reportCardS(themeColor, '#8b5cf6')}>
          <div style={reportNumberS}>{report.avg_uptime?.toFixed(1) || 0}%</div>
          <div style={reportLabelS}>Avg Uptime</div>
        </div>
      </div>

      {/* Status Filter */}
      <div style={filterS}>
        {['all', 'healthy', 'degraded', 'down'].map(status => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            style={filterBtnS(status === activeStatus, themeColor)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* APIs Health Grid */}
      <div style={apisGridS}>
        {healthData.data?.map(api => (
          <div key={api.api_id} style={healthCardS(getStatusColor(api.status))}>
            <div style={cardHeaderS}>
              <div>
                <h4 style={apiNameS}>{api.api_name}</h4>
                <p style={providerS}>{api.provider}</p>
              </div>
              <button
                onClick={() => handleHealthCheck(api.api_id)}
                style={checkBtnS(themeColor)}
              >
                🔄
              </button>
            </div>

            <div style={statusIndicatorS(getStatusColor(api.status))}>
              {getStatusIcon(api.status)} {api.status.toUpperCase()}
            </div>

            <div style={metricsS}>
              <div style={metricS}>
                <span style={metricLabelS}>Uptime</span>
                <span style={metricValueS}>{api.uptime_percent?.toFixed(1)}%</span>
              </div>
              <div style={metricS}>
                <span style={metricLabelS}>Error Rate</span>
                <span style={metricValueS}>{api.error_rate?.toFixed(2)}%</span>
              </div>
              <div style={metricS}>
                <span style={metricLabelS}>Response Time</span>
                <span style={metricValueS}>{api.avg_response_time?.toFixed(0)}ms</span>
              </div>
            </div>

            <div style={lastCheckS}>
              Last check: {api.last_check_time ? new Date(api.last_check_time).toLocaleString() : 'Never'}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Incidents */}
      {incidents.length > 0 && (
        <div style={incidentsBoxS}>
          <h4 style={sectionTitleS}>🚨 Recent Incidents</h4>
          <div style={incidentListS}>
            {incidents.map((item, idx) => (
              <div key={idx} style={incidentItemS}>
                <div style={incidentHeaderS}>
                  <span style={incidentApiS}>{item.api_name}</span>
                  <span style={incidentSeverityS(item.incident.severity)}>
                    {item.incident.severity.toUpperCase()}
                  </span>
                </div>
                <p style={incidentReasonS}>{item.incident.reason || 'API Down'}</p>
                <div style={incidentTimesS}>
                  <span>
                    Started: {new Date(item.incident.started_at).toLocaleString()}
                  </span>
                  {item.incident.ended_at && (
                    <span>
                      Duration: {item.incident.duration_minutes} min
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = { healthy: '#10b981', degraded: '#f59e0b', down: '#ef4444', unknown: '#94a3b8' };
  return colors[status] || '#94a3b8';
};

const getStatusIcon = (status) => {
  const icons = { healthy: '✅', degraded: '⚠️', down: '❌', unknown: '❓' };
  return icons[status] || '❓';
};

// Styles
const loaderS = { textAlign: 'center', padding: '60px 30px', color: '#94a3b8' };

const reportGridS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '30px' };
const reportCardS = (theme, color) => ({ background: `${color}10`, border: `2px solid ${color}30`, borderRadius: '15px', padding: '20px', textAlign: 'center' });
const reportNumberS = { fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '0 0 5px' };
const reportLabelS = { fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' };

const filterS = { display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' };
const filterBtnS = (isActive, c) => ({ padding: '10px 18px', border: 'none', borderRadius: '10px', background: isActive ? c : '#f1f5f9', color: isActive ? '#fff' : '#64748b', fontWeight: '900', fontSize: '12px', cursor: 'pointer', transition: '0.2s' });

const apisGridS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' };
const healthCardS = (color) => ({ background: '#fff', border: `2px solid ${color}30`, borderRadius: '15px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' });

const cardHeaderS = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' };
const apiNameS = { margin: 0, fontSize: '14px', fontWeight: '900', color: '#0f172a' };
const providerS = { margin: '4px 0 0', fontSize: '12px', color: '#64748b', fontWeight: '600' };
const checkBtnS = (c) => ({ background: c, border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontWeight: '900', fontSize: '14px', transition: '0.2s' });

const statusIndicatorS = (color) => ({ background: `${color}15`, border: `1.5px solid ${color}`, color, padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', textAlign: 'center', marginBottom: '15px' });

const metricsS = { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0' };
const metricS = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const metricLabelS = { fontSize: '12px', color: '#64748b', fontWeight: '700' };
const metricValueS = { fontSize: '13px', fontWeight: '900', color: '#0f172a' };

const lastCheckS = { fontSize: '11px', color: '#94a3b8', fontWeight: '600' };

const incidentsBoxS = { background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '15px', padding: '25px', marginTop: '30px' };
const sectionTitleS = { margin: '0 0 20px', fontSize: '13px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' };
const incidentListS = { display: 'flex', flexDirection: 'column', gap: '15px' };
const incidentItemS = { background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const incidentHeaderS = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' };
const incidentApiS = { fontWeight: '900', color: '#0f172a' };
const incidentSeverityS = (sev) => {
  const colors = { low: '#3b82f6', medium: '#f59e0b', high: '#ef4444', critical: '#991b1b' };
  return { background: `${colors[sev]}20`, color: colors[sev], padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '900' };
};
const incidentReasonS = { margin: '0 0 8px', fontSize: '13px', color: '#475569', fontWeight: '600' };
const incidentTimesS = { fontSize: '11px', color: '#94a3b8', display: 'flex', gap: '20px' };

export default HealthTab;
