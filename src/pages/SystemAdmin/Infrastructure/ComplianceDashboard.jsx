import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { useBranding } from '../../../context/BrandingContext';

/**
 * 🔐 SYSTEM ADMIN - COMPLIANCE DASHBOARD
 * Audit logs, compliance tracking, and security monitoring
 */

const ComplianceDashboard = () => {
    const { settings } = useBranding();
    const [compliance, setCompliance] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({
        action: 'all',
        adminRole: 'all',
        severity: 'all'
    });
    const [loading, setLoading] = useState(false);
    const [timeRange, setTimeRange] = useState('30days');

    const themeColor = settings?.themeColor || '#0f172a';

    const fetchData = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const [compRes, logsRes] = await Promise.all([
                api.get(`/admin/global/compliance/dashboard?timeRange=${timeRange}`),
                api.get(`/admin/global/compliance/audit-logs?page=${page}&limit=30&${new URLSearchParams(filters)}`)
            ]);

            setCompliance(compRes.data.compliance);
            setAuditLogs(logsRes.data.data);
            setPagination(logsRes.data.pagination);
        } catch (err) {
            console.error('Error fetching compliance data:', err);
        } finally {
            setLoading(false);
        }
    }, [filters, timeRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <div style={styles.loader}>Loading compliance data...</div>;

    const riskColors = {
        'Low': '#10b981',
        'Medium': '#f59e0b',
        'High': '#ef4444'
    };

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>🔐 Compliance & Audit</h1>
                    <p style={styles.subtitle}>Monitor system security and compliance</p>
                </div>
                <button
                    onClick={() => fetchData()}
                    style={{...styles.refreshButton, backgroundColor: themeColor}}
                >
                    🔄 Refresh
                </button>
            </div>

            {/* COMPLIANCE OVERVIEW */}
            {compliance && (
                <div style={styles.complianceOverview}>
                    <div style={{...styles.complianceCard, borderTopColor: riskColors[compliance.riskLevel]}}>
                        <div style={styles.complianceIcon}>⚠️</div>
                        <div>
                            <div style={styles.complianceLabel}>Risk Level</div>
                            <div style={{...styles.complianceValue, color: riskColors[compliance.riskLevel]}}>
                                {compliance.riskLevel}
                            </div>
                        </div>
                    </div>

                    <div style={{...styles.complianceCard, borderTopColor: '#3b82f6'}}>
                        <div style={styles.complianceIcon}>📊</div>
                        <div>
                            <div style={styles.complianceLabel}>Compliance Score</div>
                            <div style={{...styles.complianceValue, color: '#3b82f6'}}>
                                {compliance.complianceScore}%
                            </div>
                        </div>
                    </div>

                    <div style={{...styles.complianceCard, borderTopColor: '#ef4444'}}>
                        <div style={styles.complianceIcon}>🚨</div>
                        <div>
                            <div style={styles.complianceLabel}>Suspicious Activities</div>
                            <div style={{...styles.complianceValue, color: '#ef4444'}}>
                                {compliance.suspiciousActivities}
                            </div>
                        </div>
                    </div>

                    <div style={{...styles.complianceCard, borderTopColor: '#f59e0b'}}>
                        <div style={styles.complianceIcon}>🔴</div>
                        <div>
                            <div style={styles.complianceLabel}>Failed Logins</div>
                            <div style={{...styles.complianceValue, color: '#f59e0b'}}>
                                {compliance.failedLoginAttempts}
                            </div>
                        </div>
                    </div>

                    <div style={{...styles.complianceCard, borderTopColor: '#8b5cf6'}}>
                        <div style={styles.complianceIcon}>📋</div>
                        <div>
                            <div style={styles.complianceLabel}>KYC Pending</div>
                            <div style={{...styles.complianceValue, color: '#8b5cf6'}}>
                                {compliance.kycPending}
                            </div>
                        </div>
                    </div>

                    <div style={{...styles.complianceCard, borderTopColor: '#06b6d4'}}>
                        <div style={styles.complianceIcon}>⏰</div>
                        <div>
                            <div style={styles.complianceLabel}>Documents Expiring</div>
                            <div style={{...styles.complianceValue, color: '#06b6d4'}}>
                                {compliance.documentsExpiring}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AUDIT LOGS SECTION */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>📋 Audit Logs</h2>

                {/* FILTERS */}
                <div style={styles.filterBar}>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        style={styles.select}
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                    </select>

                    <select
                        value={filters.action}
                        onChange={(e) => setFilters({...filters, action: e.target.value})}
                        style={styles.select}
                    >
                        <option value="all">All Actions</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                        <option value="LOGIN">Login</option>
                        <option value="LOGOUT">Logout</option>
                    </select>

                    <select
                        value={filters.adminRole}
                        onChange={(e) => setFilters({...filters, adminRole: e.target.value})}
                        style={styles.select}
                    >
                        <option value="all">All Roles</option>
                        <option value="SystemAdmin">System Admin</option>
                        <option value="StateAdmin">State Admin</option>
                        <option value="DistrictAdmin">District Admin</option>
                    </select>

                    <select
                        value={filters.severity}
                        onChange={(e) => setFilters({...filters, severity: e.target.value})}
                        style={styles.select}
                    >
                        <option value="all">All Severity</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                {/* AUDIT LOGS TABLE */}
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.headerRow}>
                                <th style={styles.headerCell}>Timestamp</th>
                                <th style={styles.headerCell}>Admin</th>
                                <th style={styles.headerCell}>Role</th>
                                <th style={styles.headerCell}>Action</th>
                                <th style={styles.headerCell}>Target</th>
                                <th style={styles.headerCell}>Severity</th>
                                <th style={styles.headerCell}>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.map((log, idx) => (
                                <tr key={idx} style={styles.dataRow}>
                                    <td style={styles.dataCell}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td style={styles.dataCell}>
                                        <div style={styles.adminName}>{log.adminName}</div>
                                    </td>
                                    <td style={styles.dataCell}>
                                        <span style={styles.roleBadge}>{log.adminRole}</span>
                                    </td>
                                    <td style={styles.dataCell}>
                                        <span style={styles.actionBadge}>{log.action}</span>
                                    </td>
                                    <td style={styles.dataCell}>
                                        <div style={styles.targetInfo}>
                                            <div style={styles.targetType}>{log.targetType}</div>
                                            <div style={styles.targetName}>{log.targetName}</div>
                                        </div>
                                    </td>
                                    <td style={styles.dataCell}>
                                        <span style={{
                                            ...styles.severityBadge,
                                            backgroundColor: getSeverityColor(log.severity) + '15',
                                            color: getSeverityColor(log.severity)
                                        }}>
                                            {log.severity || 'Normal'}
                                        </span>
                                    </td>
                                    <td style={styles.dataCell}>
                                        {log.details && (
                                            <details style={styles.details}>
                                                <summary style={styles.summary}>View</summary>
                                                <pre style={styles.pre}>
                                                    {JSON.stringify(log.details, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {pagination.pages > 1 && (
                    <div style={styles.pagination}>
                        {Array.from({length: Math.min(5, pagination.pages)}, (_, i) => (
                            pagination.page - 2 + i > 0 ? (
                                <button
                                    key={pagination.page - 2 + i}
                                    onClick={() => fetchData(pagination.page - 2 + i)}
                                    style={{
                                        ...styles.pageButton,
                                        backgroundColor: (pagination.page - 2 + i) === pagination.page ? themeColor : '#e2e8f0',
                                        color: (pagination.page - 2 + i) === pagination.page ? '#fff' : '#0f172a'
                                    }}
                                >
                                    {pagination.page - 2 + i}
                                </button>
                            ) : null
                        ))}
                    </div>
                )}
            </div>

            {/* RECOMMENDATIONS */}
            <div style={styles.recommendationsSection}>
                <h2 style={styles.sectionTitle}>💡 Security Recommendations</h2>
                <div style={styles.recommendations}>
                    <RecommendationCard
                        icon="⚠️"
                        title="Suspicious Activities Detected"
                        description="Review recent delete operations and bulk updates"
                        priority="high"
                    />
                    <RecommendationCard
                        icon="📋"
                        title="Complete KYC Verification"
                        description="Process pending KYC applications to ensure compliance"
                        priority="medium"
                    />
                    <RecommendationCard
                        icon="🔑"
                        title="Security Update Available"
                        description="Consider updating security policies and protocols"
                        priority="low"
                    />
                </div>
            </div>
        </div>
    );

    function getSeverityColor(severity) {
        const colors = {
            'high': '#ef4444',
            'medium': '#f59e0b',
            'low': '#10b981',
            'normal': '#3b82f6'
        };
        return colors[severity?.toLowerCase()] || '#3b82f6';
    }
};

const RecommendationCard = ({ icon, title, description, priority }) => {
    const priorityColors = {
        'high': '#ef4444',
        'medium': '#f59e0b',
        'low': '#10b981'
    };

    return (
        <div style={{...styles.recommendationCard, borderLeftColor: priorityColors[priority]}}>
            <div style={styles.recIcon}>{icon}</div>
            <div style={styles.recContent}>
                <div style={styles.recTitle}>{title}</div>
                <div style={styles.recDescription}>{description}</div>
            </div>
        </div>
    );
};

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
    refreshButton: {
        padding: '12px 25px',
        borderRadius: '8px',
        border: 'none',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
    },
    complianceOverview: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '30px',
    },
    complianceCard: {
        display: 'flex',
        gap: '15px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        borderTop: '3px solid',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    complianceIcon: {
        fontSize: '32px',
    },
    complianceLabel: {
        fontSize: '12px',
        fontWeight: '700',
        color: '#64748b',
    },
    complianceValue: {
        fontSize: '24px',
        fontWeight: '900',
        marginTop: '5px',
    },
    section: {
        backgroundColor: '#fff',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '25px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: '20px',
        margin: 0,
    },
    filterBar: {
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap',
    },
    select: {
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        fontSize: '13px',
        cursor: 'pointer',
    },
    tableWrapper: {
        overflowX: 'auto',
        marginTop: '15px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    headerRow: {
        backgroundColor: '#f8fafc',
        borderBottom: '2px solid #e2e8f0',
    },
    headerCell: {
        padding: '12px 15px',
        textAlign: 'left',
        fontWeight: '700',
        color: '#0f172a',
        fontSize: '12px',
    },
    dataRow: {
        borderBottom: '1px solid #e2e8f0',
        ':hover': { backgroundColor: '#f8fafc' }
    },
    dataCell: {
        padding: '12px 15px',
        fontSize: '12px',
        color: '#475569',
    },
    adminName: {
        fontWeight: '700',
        color: '#0f172a',
    },
    roleBadge: {
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: '#f1f5f9',
        fontSize: '11px',
        fontWeight: '700',
        color: '#64748b',
    },
    actionBadge: {
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: '#fef3c7',
        color: '#92400e',
        fontSize: '11px',
        fontWeight: '700',
    },
    targetInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    targetType: {
        fontWeight: '700',
        color: '#0f172a',
    },
    targetName: {
        fontSize: '11px',
        color: '#94a3b8',
    },
    severityBadge: {
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '700',
    },
    details: {
        cursor: 'pointer',
    },
    summary: {
        color: '#3b82f6',
        fontWeight: '700',
        fontSize: '11px',
    },
    pre: {
        backgroundColor: '#f1f5f9',
        padding: '10px',
        borderRadius: '4px',
        fontSize: '10px',
        overflow: 'auto',
        maxHeight: '200px',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #e2e8f0',
    },
    pageButton: {
        padding: '6px 12px',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '700',
        fontSize: '12px',
    },
    recommendationsSection: {
        backgroundColor: '#fff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    recommendations: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
    },
    recommendationCard: {
        display: 'flex',
        gap: '15px',
        padding: '15px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        borderLeft: '3px solid',
    },
    recIcon: {
        fontSize: '24px',
    },
    recContent: {
        flex: 1,
    },
    recTitle: {
        fontWeight: '700',
        color: '#0f172a',
        fontSize: '13px',
    },
    recDescription: {
        fontSize: '12px',
        color: '#64748b',
        marginTop: '4px',
    },
    loader: {
        textAlign: 'center',
        padding: '40px',
        color: '#64748b',
    }
};

export default ComplianceDashboard;
