// src/pages/Admin/SubAdmin/SubAdminOverview.jsx

import React, { useMemo } from 'react';
import { useBranding } from "../../../context/BrandingContext";
import useFetch from "../../../hooks/useFetch";
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { toast } from 'react-toastify';

// 📊 ChartJS components register
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

/**
 * 🛰️ Integrated Infrastructure Loader
 */
const InternalLoader = () => (
    <div style={{ padding: '120px 0', textAlign: 'center', width: '100%' }}>
        <div className="rkd-main-spinner"></div>
        <p style={{ marginTop: '20px', fontWeight: '800', color: '#94a3b8', fontSize: '12px', letterSpacing: '2px' }}>
            INITIALIZING INTELLIGENCE_NODE...
        </p>
        <style>{`
            .rkd-main-spinner {
                width: 45px; height: 45px; border: 4px solid #f1f5f9;
                border-top: 4px solid var(--primary-theme, #0f172a);
                border-radius: 50%; animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; margin: 0 auto;
            }
            @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
    </div>
);

const SubAdminOverview = () => {
    const { settings } = useBranding();
    const { data: stats, loading, error } = useFetch('/admin/stats/global');
    const themeColor = settings?.themeColor || '#0f172a';

    /**
     * ⚡ System Action Protocols
     */
    const handleAction = (protocol) => {
        toast.info(`Executing Protocol: ${protocol.replace('_', ' ')}`);
        // Future API integrations for system-wide tasks
    };

    // Prepare dynamic KPI statistics
    const kpiData = useMemo(() => [
        { label: 'GLOBAL_ACTIVE_NODES', val: stats?.stats?.shops || 0, icon: '🏪', color: themeColor },
        { label: 'PENDING_APPROVALS', val: stats?.stats?.pending || 0, icon: '📥', color: '#f59e0b' },
        { label: 'TOTAL_PLATFORM_USERS', val: stats?.stats?.customers || 0, icon: '👥', color: '#10b981' },
        { label: 'SYSTEM_REVENUE_SYNC', val: `₹${(stats?.stats?.revenue || 0).toLocaleString()}`, icon: '💰', color: '#ef4444' }
    ], [stats, themeColor]);

    // Chart Configuration: Regional Node Distribution
    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { 
            y: { beginAtZero: true, grid: { color: '#f8fafc' }, border: { display: false } },
            x: { grid: { display: false }, border: { display: false } }
        }
    };

    const barData = {
        labels: ['State Admins', 'District Admins', 'Sub Admins', 'Operational'],
        datasets: [{
            data: [stats?.stats?.stateAdmins || 0, stats?.stats?.districtAdmins || 0, 2, 8],
            backgroundColor: [`${themeColor}CC`, '#10b981CC', '#6366f1CC', '#f59e0bCC'],
            borderRadius: 10,
            barThickness: 35
        }]
    };

    if (loading) return <InternalLoader />;

    if (error) return (
        <div style={{ padding: '60px', textAlign: 'center', color: '#ef4444', fontWeight: '800' }}>
            🔴 CRITICAL_SYNC_FAILURE: {error}
        </div>
    );

    return (
        <div style={containerS} className="fade-in">
            
            {/* --- 1. STRATEGIC HEADER --- */}
            <div style={headerS}>
                <h2 style={titleS}>🌌 Strategic Global Intelligence</h2>
                <p style={subS}>Real-time synchronization of all regional clusters and merchant nodes.</p>
            </div>

            {/* --- 2. KPI GRID SECTION --- */}
            <div style={kpiGrid}>
                {kpiData.map((kpi, idx) => (
                    <div key={idx} style={kpiCard(kpi.color)}>
                        <div style={kpiTop}>
                            <div style={iconBadge(kpi.color)}>{kpi.icon}</div>
                            <small style={labelS}>{kpi.label}</small>
                        </div>
                        <h2 style={valueS}>{kpi.val}</h2>
                        <div style={miniBar}><div style={miniProgress(kpi.color)}></div></div>
                    </div>
                ))}
            </div>

            {/* --- 3. ANALYTICS & CONTROL HUB --- */}
            <div style={mainLayout}>
                
                {/* Visual Distribution Hub */}
                <div style={glassCard}>
                    <div style={cardHeadRow}>
                        <h4 style={cardTitle}>Regional Node Distribution</h4>
                        <span style={livePulse}>LIVE_NETWORK</span>
                    </div>
                    <div style={{ height: '320px', marginTop: '25px' }}>
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>

                {/* Operation Control Panel */}
                <div style={controlCard}>
                    <h4 style={cardTitle}>Infrastructure Protocols</h4>
                    <div style={actionGrid}>
                        <button onClick={() => handleAction('GENERATE_AUDIT')} style={protocolBtn}>
                            <span style={btnIcon}>📊</span>
                            <div style={btnText}>
                                <b>Audit Report</b>
                                <small>Generate Global SLA Audit</small>
                            </div>
                        </button>
                        <button onClick={() => handleAction('BROADCAST_ALL')} style={protocolBtn}>
                            <span style={btnIcon}>📢</span>
                            <div style={btnText}>
                                <b>Global Broadcast</b>
                                <small>Notify Regional Nodes</small>
                            </div>
                        </button>
                        <button onClick={() => handleAction('SECURITY_SCAN')} style={protocolBtn}>
                            <span style={btnIcon}>🛡️</span>
                            <div style={btnText}>
                                <b>Node Scan</b>
                                <small>Security Integrity Check</small>
                            </div>
                        </button>
                        <button onClick={() => handleAction('FLUSH_CACHE')} style={protocolBtn}>
                            <span style={btnIcon}>🧹</span>
                            <div style={btnText}>
                                <b>Flush Cache</b>
                                <small>Purge System Edge Nodes</small>
                            </div>
                        </button>
                    </div>

                    <div style={eventPanel}>
                        <div style={eventHeader}>SYSTEM_LOG_SNAPSHOT</div>
                        <div style={eventRow}>
                            <span style={dot('#10b981')}></span> 
                            <span>Cluster status: <b>Optimal</b> (100% Uptime)</span>
                        </div>
                        <div style={eventRow}>
                            <span style={dot('#f59e0b')}></span> 
                            <span>Pending approval queue: <b>{stats?.stats?.pending || 0} hubs</b></span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// --- SYSTEM STYLES ---

const containerS = { width: '100%', animation: 'fadeIn 0.5s ease-out' };
const headerS = { marginBottom: '35px' };
const titleS = { margin: 0, fontSize: '26px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.8px' };
const subS = { margin: '5px 0 0 0', color: '#64748b', fontSize: '14px', fontWeight: '500' };

const kpiGrid = { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', 
    gap: '20px', 
    marginBottom: '35px' 
};

const kpiCard = (color) => ({
    background: '#fff', padding: '25px', borderRadius: '24px', border: '1px solid #f1f5f9',
    boxShadow: '0 4px 20px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden'
});

const kpiTop = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' };
const iconBadge = (c) => ({
    width: '38px', height: '38px', borderRadius: '10px', background: `${c}12`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
});
const labelS = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' };
const valueS = { margin: 0, fontSize: '26px', fontWeight: '900', color: '#0f172a', fontFamily: 'monospace' };

const miniBar = { height: '3px', background: '#f8fafc', borderRadius: '10px', marginTop: '18px' };
const miniProgress = (c) => ({ width: '65%', height: '100%', background: c, borderRadius: '10px' });

const mainLayout = { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
    gap: '25px' 
};

const glassCard = { background: '#fff', padding: '30px', borderRadius: '30px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' };
const cardHeadRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const cardTitle = { margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b' };
const livePulse = { fontSize: '9px', fontWeight: '900', color: '#10b981', background: '#10b98110', padding: '4px 12px', borderRadius: '100px', letterSpacing: '0.5px' };

const controlCard = { background: '#fff', padding: '30px', borderRadius: '30px', border: '1px solid #f1f5f9' };
const actionGrid = { display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '22px' };

const protocolBtn = {
    padding: '14px 20px', border: '1.5px solid #f8fafc', background: '#fcfdfe', borderRadius: '16px',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)'
};
const btnIcon = { fontSize: '20px' };
const btnText = { textAlign: 'left', display: 'flex', flexDirection: 'column' };

const eventPanel = { marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #f8fafc' };
const eventHeader = { fontSize: '9px', fontWeight: '900', color: '#cbd5e1', letterSpacing: '1.5px', marginBottom: '15px' };
const eventRow = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#475569', marginBottom: '12px' };
const dot = (c) => ({ width: '6px', height: '6px', background: c, borderRadius: '50%' });

export default SubAdminOverview;