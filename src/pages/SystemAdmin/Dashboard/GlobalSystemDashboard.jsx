import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { useBranding } from '../../../context/BrandingContext';
import { useAuth } from '../../../context/AuthContext';

/**
 * 👑 SYSTEM ADMIN - GLOBAL DASHBOARD
 * Complete system overview with all metrics
 */

const GlobalSystemDashboard = () => {
    const { settings } = useBranding();
    const { user } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [health, setHealth] = useState(null);
    const [timeRange, setTimeRange] = useState('30days');
    const [loading, setLoading] = useState(true);

    const themeColor = settings?.themeColor || '#0f172a';

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const [dashRes, healthRes] = await Promise.all([
                api.get(`/admin/global/dashboard?timeRange=${timeRange}`),
                api.get('/admin/global/health')
            ]);

            setDashboard(dashRes.data.dashboard);
            setHealth(healthRes.data.health);
        } catch (err) {
            console.error('Error fetching dashboard:', err);
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading) return <DashboardLoader color={themeColor} />;
    if (!dashboard) return <ErrorState />;

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>👑 Global System Dashboard</h1>
                    <p style={styles.subtitle}>Complete Platform Overview & Control</p>
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
                        onClick={fetchDashboardData}
                        style={{...styles.button, backgroundColor: themeColor}}
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* SYSTEM HEALTH */}
            {health && (
                <div style={{...styles.section, borderLeft: `4px solid ${health.errors.lastHour < 10 ? '#10b981' : '#ef4444'}`}}>
                    <h2 style={styles.sectionTitle}>🏥 System Health</h2>
                    <div style={styles.healthGrid}>
                        <HealthCard
                            label="Status"
                            value={health.status}
                            icon="✅"
                            color="#10b981"
                        />
                        <HealthCard
                            label="Avg Latency"
                            value={health.api.avgLatency}
                            icon="⚡"
                            color={health.api.avgLatency < '500ms' ? '#3b82f6' : '#f59e0b'}
                        />
                        <HealthCard
                            label="Database"
                            value={health.database.queriesLastHour}
                            unit="queries/hr"
                            icon="🗄️"
                            color="#3b82f6"
                        />
                        <HealthCard
                            label="Errors"
                            value={health.errors.lastHour}
                            unit="last hour"
                            icon={health.errors.lastHour < 10 ? '✅' : '⚠️'}
                            color={health.errors.lastHour < 10 ? '#10b981' : '#ef4444'}
                        />
                        <HealthCard
                            label="Active Users"
                            value={health.activeUsers}
                            icon="👥"
                            color="#8b5cf6"
                        />
                        <HealthCard
                            label="Active Admins"
                            value={health.activeAdmins}
                            icon="👑"
                            color={themeColor}
                        />
                    </div>
                </div>
            )}

            {/* ADMIN HIERARCHY */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>👑 Admin Hierarchy Structure</h2>
                <div style={styles.gridMetrics}>
                    <MetricCard
                        title="System Admins"
                        value={dashboard.adminHierarchy.systemAdmins}
                        icon="👑"
                        color={themeColor}
                        description="Top level administrators"
                    />
                    <MetricCard
                        title="Sub-System Admins"
                        value={dashboard.adminHierarchy.subSystemAdmins}
                        icon="🛡️"
                        color="#3b82f6"
                        description="Supporting administrators"
                    />
                    <MetricCard
                        title="State Admins"
                        value={dashboard.adminHierarchy.stateAdmins}
                        icon="🏛️"
                        color="#8b5cf6"
                        description="State level management"
                    />
                    <MetricCard
                        title="District Admins"
                        value={dashboard.adminHierarchy.districtAdmins}
                        icon="🏘️"
                        color="#ec4899"
                        description="District management"
                    />
                    <MetricCard
                        title="Operators"
                        value={dashboard.adminHierarchy.operators}
                        icon="⚙️"
                        color="#10b981"
                        description="Field level operators"
                    />
                </div>
            </div>

            {/* MERCHANT STATISTICS */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>🏪 Merchant Management</h2>
                <div style={styles.gridMetrics}>
                    <MetricCard
                        title="Total Shops"
                        value={dashboard.merchants.total}
                        icon="🏪"
                        color="#f59e0b"
                        description="All registered shops"
                    />
                    <MetricCard
                        title="Approved Shops"
                        value={dashboard.merchants.approved}
                        icon="✅"
                        color="#10b981"
                        subtitle={dashboard.merchants.approvalRate}
                        description="Approved approval rate"
                    />
                    <MetricCard
                        title="Pending Shops"
                        value={dashboard.merchants.pending}
                        icon="⏳"
                        color="#f59e0b"
                        description="Awaiting approval"
                    />
                </div>
                <div style={styles.shopTypesContainer}>
                    <h3 style={styles.subTitle}>📊 Shops by Type</h3>
                    {dashboard.merchants.byType.map((type, idx) => (
                        <div key={idx} style={styles.shopTypeRow}>
                            <span>{type._id}</span>
                            <span style={{...styles.shopTypeCount, backgroundColor: themeColor}}>
                                {type.count} shops
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* CUSTOMER STATISTICS */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>👥 Customer Analytics</h2>
                <div style={styles.gridMetrics}>
                    <MetricCard
                        title="Total Customers"
                        value={dashboard.customers.total}
                        icon="👥"
                        color="#3b82f6"
                        description="Registered users"
                    />
                    <MetricCard
                        title="Active Customers"
                        value={dashboard.customers.active}
                        icon="🟢"
                        color="#10b981"
                        subtitle={dashboard.customers.activeRate}
                        description="Active rate"
                    />
                    <MetricCard
                        title="New Customers"
                        value={dashboard.customers.new}
                        icon="🆕"
                        color="#06b6d4"
                        description={`in ${timeRange}`}
                    />
                </div>
            </div>

            {/* COMMERCE METRICS */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>🛒 Commerce Overview</h2>
                <div style={styles.gridMetrics}>
                    <MetricCard
                        title="Total Orders"
                        value={dashboard.commerce.totalOrders}
                        icon="📦"
                        color="#f59e0b"
                        description="All time orders"
                    />
                    <MetricCard
                        title="Completed Orders"
                        value={dashboard.commerce.completed}
                        icon="✅"
                        color="#10b981"
                        subtitle={dashboard.commerce.completionRate}
                        description="Completion rate"
                    />
                    <MetricCard
                        title="Pending Orders"
                        value={dashboard.commerce.pending}
                        icon="⏳"
                        color="#f59e0b"
                        description="In progress"
                    />
                    <MetricCard
                        title="Cancelled Orders"
                        value={dashboard.commerce.cancelled}
                        icon="❌"
                        color="#ef4444"
                        description="Cancelled orders"
                    />
                </div>
            </div>

            {/* FINANCIAL SUMMARY */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>💰 Financial Dashboard</h2>
                <div style={styles.gridMetrics}>
                    <MetricCard
                        title="Total Revenue"
                        value={`₹${formatCurrency(dashboard.financials.revenue)}`}
                        icon="💵"
                        color="#10b981"
                        description="Platform revenue"
                    />
                    <MetricCard
                        title="Commission"
                        value={`₹${formatCurrency(dashboard.financials.commission)}`}
                        icon="🏦"
                        color="#3b82f6"
                        description="Total commission"
                    />
                    <MetricCard
                        title="Payouts"
                        value={`₹${formatCurrency(dashboard.financials.payouts)}`}
                        icon="💸"
                        color="#8b5cf6"
                        description="Merchant payouts"
                    />
                    <MetricCard
                        title="Platform Gain"
                        value={`₹${formatCurrency(dashboard.financials.platformGain)}`}
                        icon="📈"
                        color={dashboard.financials.platformGain > 0 ? '#10b981' : '#ef4444'}
                        description="Net platform gain"
                    />
                </div>
            </div>

            {/* SUPPORT METRICS */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>🆘 Support Center</h2>
                <div style={styles.gridMetrics}>
                    <MetricCard
                        title="Total Complaints"
                        value={dashboard.support.total}
                        icon="📝"
                        color="#f59e0b"
                        description="All complaints"
                    />
                    <MetricCard
                        title="Open Complaints"
                        value={dashboard.support.open}
                        icon="🔴"
                        color="#ef4444"
                        description="Pending resolution"
                    />
                    <MetricCard
                        title="Resolved"
                        value={dashboard.support.resolved}
                        icon="✅"
                        color="#10b981"
                        subtitle={dashboard.support.resolutionRate}
                        description="Resolution rate"
                    />
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={styles.actionButtons}>
                <ActionButton label="📊 View Analytics" href="/system-admin/analytics" color={themeColor} />
                <ActionButton label="👥 Manage Users" href="/system-admin/users" color="#3b82f6" />
                <ActionButton label="⚙️ Settings" href="/system-admin/settings" color="#8b5cf6" />
                <ActionButton label="📋 Audit Logs" href="/system-admin/compliance" color="#ef4444" />
                <ActionButton label="📢 Send Alert" href="/system-admin/alerts" color="#f59e0b" />
            </div>
        </div>
    );
};

// ===================================================================
// COMPONENT PARTS
// ===================================================================

const MetricCard = ({ title, value, icon, color, subtitle, description }) => (
    <div style={{...styles.metricCard, borderTopColor: color}}>
        <div style={styles.metricIcon}>{icon}</div>
        <div style={styles.metricContent}>
            <div style={styles.metricValue}>{value}</div>
            {subtitle && <div style={{...styles.metricSubtitle, color}}>{subtitle}</div>}
            <div style={styles.metricDescription}>{description}</div>
        </div>
    </div>
);

const HealthCard = ({ label, value, unit = '', icon, color }) => (
    <div style={{...styles.healthCard, borderLeftColor: color}}>
        <div style={styles.healthIcon}>{icon}</div>
        <div>
            <div style={styles.healthLabel}>{label}</div>
            <div style={styles.healthValue}>{value}</div>
            {unit && <div style={styles.healthUnit}>{unit}</div>}
        </div>
    </div>
);

const ActionButton = ({ label, href, color }) => (
    <a href={href} style={{...styles.actionButton, borderTopColor: color}}>
        <div style={{fontSize: '18px', marginBottom: '8px'}}>
            {label.split(' ')[0]}
        </div>
        <div style={{fontSize: '14px', fontWeight: '600'}}>
            {label.split(' ').slice(1).join(' ')}
        </div>
    </a>
);

const DashboardLoader = ({ color }) => (
    <div style={{...styles.loader, backgroundColor: color + '05'}}>
        <div style={{...styles.spinner, borderTopColor: color}} />
        <p style={{color, marginTop: '20px', fontWeight: '800', letterSpacing: '1px'}}>
            LOADING SYSTEM DASHBOARD...
        </p>
    </div>
);

const ErrorState = () => (
    <div style={styles.error}>
        <h2>⚠️ Error Loading Dashboard</h2>
        <p>Unable to load system dashboard. Please try again.</p>
    </div>
);

// ===================================================================
// STYLES
// ===================================================================

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
        marginBottom: '40px',
        backgroundColor: '#fff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    title: {
        fontSize: '32px',
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
        fontWeight: '600',
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
        transition: 'all 0.3s',
    },
    section: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '25px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    sectionTitle: {
        fontSize: '22px',
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: '25px',
        margin: 0,
    },
    subTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '15px',
        marginTop: 0,
    },
    gridMetrics: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
    },
    metricCard: {
        display: 'flex',
        gap: '15px',
        padding: '20px',
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        borderTop: '3px solid',
        cursor: 'pointer',
        transition: 'all 0.3s',
        ':hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        }
    },
    metricIcon: {
        fontSize: '36px',
        display: 'flex',
        alignItems: 'center',
    },
    metricContent: {
        flex: 1,
    },
    metricValue: {
        fontSize: '24px',
        fontWeight: '900',
        color: '#0f172a',
    },
    metricSubtitle: {
        fontSize: '13px',
        fontWeight: '700',
        marginTop: '4px',
    },
    metricDescription: {
        fontSize: '12px',
        color: '#64748b',
        marginTop: '6px',
    },
    healthGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
    },
    healthCard: {
        display: 'flex',
        gap: '12px',
        padding: '15px',
        backgroundColor: '#f1f5f9',
        borderRadius: '8px',
        borderLeft: '3px solid',
    },
    healthIcon: {
        fontSize: '24px',
    },
    healthLabel: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#64748b',
    },
    healthValue: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#0f172a',
        marginTop: '4px',
    },
    healthUnit: {
        fontSize: '11px',
        color: '#94a3b8',
        marginTop: '2px',
    },
    shopTypesContainer: {
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
    },
    shopTypeRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid #e2e8f0',
        fontSize: '14px',
        fontWeight: '600',
    },
    shopTypeCount: {
        padding: '6px 12px',
        borderRadius: '20px',
        color: '#fff',
        fontSize: '12px',
        fontWeight: '700',
    },
    actionButtons: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginTop: '30px',
    },
    actionButton: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '25px 20px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        borderTop: '4px solid',
        textDecoration: 'none',
        color: '#0f172a',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s',
        ':hover': {
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            transform: 'translateY(-4px)',
        }
    },
    loader: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #f1f5f9',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    error: {
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#fff',
        borderRadius: '12px',
        color: '#ef4444',
    }
};

function formatCurrency(value) {
    if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(2) + 'K';
    return value.toString();
}

export default GlobalSystemDashboard;
