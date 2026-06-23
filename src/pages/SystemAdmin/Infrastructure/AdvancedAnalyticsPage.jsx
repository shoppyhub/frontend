import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { useBranding } from '../../../context/BrandingContext';

/**
 * 📊 SYSTEM ADMIN - ADVANCED ANALYTICS
 * Comprehensive analytics and insights
 */

const AdvancedAnalyticsPage = () => {
    const { settings } = useBranding();
    const [analytics, setAnalytics] = useState(null);
    const [timeRange, setTimeRange] = useState('30days');
    const [loading, setLoading] = useState(false);

    const themeColor = settings?.themeColor || '#0f172a';

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/global/analytics?timeRange=${timeRange}&reportType=comprehensive`);
            setAnalytics(res.data.analytics);
        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (loading) return <div style={styles.loader}>Loading analytics...</div>;
    if (!analytics) return <div style={styles.error}>Failed to load analytics</div>;

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>📊 Advanced Analytics</h1>
                    <p style={styles.subtitle}>Comprehensive platform insights and trends</p>
                </div>
                <div style={styles.controls}>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        style={styles.select}
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="year">This Year</option>
                    </select>
                    <button
                        onClick={fetchAnalytics}
                        style={{...styles.button, backgroundColor: themeColor}}
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* TRENDS SECTION */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>📈 Daily Trends</h2>
                <div style={styles.trendGrid}>
                    <div style={styles.trendCard}>
                        <h3 style={styles.trendTitle}>Daily Orders</h3>
                        <div style={styles.trendChart}>
                            {analytics.trends?.dailyOrders?.length > 0 ? (
                                <TrendsList data={analytics.trends.dailyOrders} color="#f59e0b" />
                            ) : (
                                <div style={styles.noData}>No data available</div>
                            )}
                        </div>
                    </div>

                    <div style={styles.trendCard}>
                        <h3 style={styles.trendTitle}>Daily Revenue</h3>
                        <div style={styles.trendChart}>
                            {analytics.trends?.dailyRevenue?.length > 0 ? (
                                <TrendsList data={analytics.trends.dailyRevenue} color="#10b981" formatValue={true} />
                            ) : (
                                <div style={styles.noData}>No data available</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* TOP PERFORMERS */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>⭐ Top Performers</h2>
                <div style={styles.performersGrid}>
                    {/* TOP SHOPS */}
                    <div style={styles.performerCard}>
                        <h3 style={styles.performerTitle}>🏪 Top Shops</h3>
                        <div style={styles.performerList}>
                            {analytics.topPerformers?.shops?.slice(0, 5).map((shop, idx) => (
                                <div key={idx} style={styles.performerRow}>
                                    <span style={styles.rank}>#{idx + 1}</span>
                                    <div style={styles.performerInfo}>
                                        <div style={styles.performerName}>{shop.shopName || 'Shop ' + (idx + 1)}</div>
                                        <div style={styles.performerSubtitle}>
                                            {shop.orders} orders • ₹{formatCurrency(shop.revenue)}
                                        </div>
                                    </div>
                                    <div style={{...styles.performerStat, color: '#10b981'}}>
                                        ₹{formatCurrency(shop.revenue)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TOP CATEGORIES */}
                    <div style={styles.performerCard}>
                        <h3 style={styles.performerTitle}>📦 Top Categories</h3>
                        <div style={styles.performerList}>
                            {analytics.topPerformers?.categories?.slice(0, 5).map((cat, idx) => (
                                <div key={idx} style={styles.performerRow}>
                                    <span style={styles.rank}>#{idx + 1}</span>
                                    <div style={styles.performerInfo}>
                                        <div style={styles.performerName}>{cat._id}</div>
                                        <div style={styles.performerSubtitle}>
                                            {cat.count} products • Avg ₹{Math.round(cat.avgPrice)}
                                        </div>
                                    </div>
                                    <div style={{...styles.performerStat, color: '#3b82f6'}}>
                                        {cat.count}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* CONVERSION METRICS */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>📊 Conversion Metrics</h2>
                <div style={styles.conversionGrid}>
                    {analytics.conversion && (
                        <>
                            <MetricBox
                                label="Repeat Customers"
                                value={analytics.conversion.conversions?.[0]?.repeat_customers || 0}
                                icon="👥"
                                color="#8b5cf6"
                            />
                            <MetricBox
                                label="Total Unique Customers"
                                value={analytics.conversion.all?.[0]?.total_customers || 0}
                                icon="👤"
                                color="#3b82f6"
                            />
                        </>
                    )}
                </div>
            </div>

            {/* CUSTOMER RETENTION */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>📈 Customer Retention</h2>
                <div style={styles.retentionChart}>
                    {analytics.retention?.length > 0 ? (
                        <div style={styles.retentionList}>
                            {analytics.retention.map((month, idx) => (
                                <div key={idx} style={styles.retentionRow}>
                                    <div style={styles.monthLabel}>
                                        {getMonthName(month._id.month)}/{month._id.year}
                                    </div>
                                    <div style={styles.retentionBar}>
                                        <div
                                            style={{
                                                width: `${(month.count / 1000) * 100}%`,
                                                maxWidth: '100%',
                                                height: '30px',
                                                backgroundColor: themeColor,
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'flex-end',
                                                paddingRight: '10px',
                                                color: '#fff',
                                                fontWeight: '700',
                                                fontSize: '12px'
                                            }}
                                        >
                                            {month.count}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={styles.noData}>No retention data available</div>
                    )}
                </div>
            </div>

            {/* EXPORT SECTION */}
            <div style={styles.exportSection}>
                <h2 style={styles.sectionTitle}>📥 Export Analytics</h2>
                <div style={styles.exportButtons}>
                    <button
                        onClick={() => downloadReport('json')}
                        style={{...styles.exportButton, backgroundColor: '#3b82f6'}}
                    >
                        📄 Download JSON
                    </button>
                    <button
                        onClick={() => downloadReport('csv')}
                        style={{...styles.exportButton, backgroundColor: '#10b981'}}
                    >
                        📊 Download CSV
                    </button>
                    <button
                        onClick={() => window.print()}
                        style={{...styles.exportButton, backgroundColor: '#8b5cf6'}}
                    >
                        🖨️ Print
                    </button>
                </div>
            </div>
        </div>
    );

    function downloadReport(format) {
        const dataStr = format === 'json'
            ? JSON.stringify(analytics, null, 2)
            : convertToCSV(analytics);
        
        const dataBlob = new Blob([dataStr], {type: 'text/plain'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics_${timeRange}.${format}`;
        link.click();
    }
};

const TrendsList = ({ data, color, formatValue = false }) => (
    <div style={styles.trendsList}>
        {data.map((item, idx) => (
            <div key={idx} style={styles.trendItem}>
                <div style={styles.trendDate}>{item._id}</div>
                <div style={{
                    ...styles.trendValue,
                    color,
                    fontSize: formatValue ? '14px' : '16px',
                    fontWeight: formatValue ? '700' : '800'
                }}>
                    {formatValue ? '₹' : ''}{formatCurrency(item.count || item.revenue)}
                </div>
            </div>
        ))}
    </div>
);

const MetricBox = ({ label, value, icon, color }) => (
    <div style={{...styles.metricBox, borderLeftColor: color}}>
        <div style={styles.metricIcon}>{icon}</div>
        <div>
            <div style={styles.metricLabel}>{label}</div>
            <div style={{...styles.metricValue, color}}>{value}</div>
        </div>
    </div>
);

const styles = {
    container: {
        padding: '30px',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        backgroundColor: '#fff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    title: {
        fontSize: '28px',
        fontWeight: '900',
        color: '#0f172a',
        margin: 0,
    },
    subtitle: {
        fontSize: '14px',
        color: '#64748b',
        marginTop: '8px',
    },
    controls: {
        display: 'flex',
        gap: '15px',
    },
    select: {
        padding: '10px 15px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '14px',
        cursor: 'pointer',
    },
    button: {
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
    },
    section: {
        backgroundColor: '#fff',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '25px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#0f172a',
        margin: '0 0 20px 0',
    },
    trendGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
    },
    trendCard: {
        padding: '15px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        borderLeft: '3px solid #3b82f6',
    },
    trendTitle: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#0f172a',
        margin: '0 0 15px 0',
    },
    trendChart: {
        maxHeight: '300px',
        overflowY: 'auto',
    },
    trendsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    trendItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 10px',
        backgroundColor: '#fff',
        borderRadius: '4px',
        fontSize: '12px',
    },
    trendDate: {
        color: '#64748b',
        fontWeight: '600',
    },
    trendValue: {
        fontWeight: '800',
    },
    performersGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
    },
    performerCard: {
        padding: '15px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        borderTop: '3px solid #f59e0b',
    },
    performerTitle: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#0f172a',
        margin: '0 0 15px 0',
    },
    performerList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    performerRow: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        padding: '10px',
        backgroundColor: '#fff',
        borderRadius: '4px',
    },
    rank: {
        fontWeight: '900',
        color: '#f59e0b',
        fontSize: '16px',
        minWidth: '30px',
    },
    performerInfo: {
        flex: 1,
    },
    performerName: {
        fontWeight: '700',
        color: '#0f172a',
        fontSize: '13px',
    },
    performerSubtitle: {
        fontSize: '11px',
        color: '#94a3b8',
        marginTop: '2px',
    },
    performerStat: {
        fontWeight: '800',
        fontSize: '13px',
    },
    conversionGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
    },
    metricBox: {
        display: 'flex',
        gap: '15px',
        padding: '20px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        borderLeft: '3px solid',
    },
    metricIcon: {
        fontSize: '32px',
    },
    metricLabel: {
        fontSize: '12px',
        color: '#64748b',
        fontWeight: '600',
    },
    metricValue: {
        fontSize: '24px',
        fontWeight: '900',
        marginTop: '5px',
    },
    retentionChart: {
        padding: '15px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
    },
    retentionList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    retentionRow: {
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
    },
    monthLabel: {
        minWidth: '80px',
        fontWeight: '700',
        color: '#0f172a',
        fontSize: '13px',
    },
    retentionBar: {
        flex: 1,
    },
    exportSection: {
        backgroundColor: '#fff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    exportButtons: {
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
    },
    exportButton: {
        padding: '12px 20px',
        borderRadius: '8px',
        border: 'none',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
    },
    noData: {
        textAlign: 'center',
        padding: '20px',
        color: '#94a3b8',
    },
    loader: {
        textAlign: 'center',
        padding: '40px',
        color: '#64748b',
    },
    error: {
        textAlign: 'center',
        padding: '40px',
        color: '#ef4444',
    }
};

function formatCurrency(value) {
    if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(2) + 'K';
    return value.toString();
}

function getMonthName(month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
}

function convertToCSV(data) {
    // Simple CSV conversion
    let csv = 'Analytics Report\n\n';
    csv += 'Daily Orders,Daily Revenue\n';
    if (data.trends?.dailyOrders) {
        data.trends.dailyOrders.forEach(item => {
            csv += `${item._id},${item.count}\n`;
        });
    }
    return csv;
}

export default AdvancedAnalyticsPage;
