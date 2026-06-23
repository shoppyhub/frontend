import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiManagementService from '../../../../../services/apiManagementService';

const AnalyticsTab = ({ themeColor }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await apiManagementService.getAnalytics(null, days);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={loaderS}>Loading analytics...</div>;
  if (!data) return <div style={loaderS}>No data available</div>;

  const summary = data.summary || {};

  return (
    <div>
      {/* Time Period Selector */}
      <div style={controlsS}>
        {[7, 30, 90].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            style={periodBtnS(d === days, themeColor)}
          >
            {d} Days
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div style={cardsGridS}>
        <div style={cardS(themeColor, '#3b82f6')}>
          <div style={cardNumberS}>{summary.total_calls?.toLocaleString() || 0}</div>
          <div style={cardLabelS}>Total Calls</div>
        </div>
        <div style={cardS(themeColor, '#10b981')}>
          <div style={cardNumberS}>{summary.success_calls?.toLocaleString() || 0}</div>
          <div style={cardLabelS}>Success</div>
        </div>
        <div style={cardS(themeColor, '#ef4444')}>
          <div style={cardNumberS}>{summary.failed_calls?.toLocaleString() || 0}</div>
          <div style={cardLabelS}>Failed</div>
        </div>
        <div style={cardS(themeColor, '#f59e0b')}>
          <div style={cardNumberS}>{data.success_rate}%</div>
          <div style={cardLabelS}>Success Rate</div>
        </div>
        <div style={cardS(themeColor, '#8b5cf6')}>
          <div style={cardNumberS}>{summary.avg_response_time?.toFixed(2) || 0}ms</div>
          <div style={cardLabelS}>Avg Response</div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div style={chartsContainerS}>
        <div style={chartBoxS}>
          <h4 style={chartTitleS}>📈 Call Volume Trend</h4>
          <div style={chartPlaceholderS}>
            <p>Daily call volume chart will appear here</p>
            <p style={smallTextS}>{data.daily_trend?.length || 0} data points</p>
          </div>
        </div>

        <div style={chartBoxS}>
          <h4 style={chartTitleS}>🎯 Top APIs by Calls</h4>
          <div style={chartPlaceholderS}>
            <p>Top performing APIs will appear here</p>
            <p style={smallTextS}>{data.top_apis?.length || 0} APIs</p>
          </div>
        </div>
      </div>

      {/* Error Distribution */}
      <div style={tableBoxS}>
        <h4 style={chartTitleS}>🔴 Status Distribution</h4>
        <div style={statusTableS}>
          {data.status_distribution?.map(item => (
            <div key={item._id} style={statusRowS}>
              <span style={statusLabelS}>{item._id === 'success' ? '✅ Success' : '❌ Error'}</span>
              <span style={statusCountS}>{item.count} calls</span>
              <div style={statusBarS(item._id === 'success' ? '#10b981' : '#ef4444', item.count, summary.total_calls)}>
                <span style={barTextS}>{((item.count / summary.total_calls) * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Styles
const loaderS = { textAlign: 'center', padding: '60px 30px', color: '#94a3b8' };
const controlsS = { display: 'flex', gap: '10px', marginBottom: '30px' };
const periodBtnS = (isActive, c) => ({ padding: '10px 20px', border: 'none', borderRadius: '10px', background: isActive ? c : '#f1f5f9', color: isActive ? '#fff' : '#64748b', fontWeight: '900', fontSize: '12px', cursor: 'pointer', transition: '0.2s', boxShadow: isActive ? `0 6px 15px ${c}40` : 'none' });

const cardsGridS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' };
const cardS = (theme, bgGradient) => ({ background: `linear-gradient(135deg, ${bgGradient}20 0%, ${bgGradient}05 100%)`, border: `2px solid ${bgGradient}30`, borderRadius: '15px', padding: '20px', textAlign: 'center' });
const cardNumberS = { fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '0 0 5px' };
const cardLabelS = { fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' };

const chartsContainerS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' };
const chartBoxS = { background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '15px', padding: '20px' };
const chartTitleS = { margin: '0 0 15px', fontSize: '13px', fontWeight: '900', color: '#0f172a' };
const chartPlaceholderS = { textAlign: 'center', padding: '40px 20px', color: '#94a3b8', borderRadius: '10px', background: '#fff', border: '2px dashed #e2e8f0' };
const smallTextS = { fontSize: '12px', margin: '10px 0 0', color: '#cbd5e1' };

const tableBoxS = { background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '15px', padding: '25px' };
const statusTableS = { display: 'flex', flexDirection: 'column', gap: '15px' };
const statusRowS = { display: 'flex', alignItems: 'center', gap: '15px' };
const statusLabelS = { minWidth: '80px', fontWeight: '700', color: '#475569' };
const statusCountS = { minWidth: '60px', textAlign: 'right', fontWeight: '700', color: '#475569' };
const statusBarS = (color, value, total) => ({ flex: 1, height: '30px', background: `${color}20`, borderRadius: '10px', border: `1.5px solid ${color}40`, position: 'relative', overflow: 'hidden' });
const barTextS = { display: 'flex', alignItems: 'center', height: '100%', paddingRight: '8px', justifyContent: 'flex-end', fontSize: '11px', fontWeight: '700', color: '#0f172a' };

export default AnalyticsTab;
