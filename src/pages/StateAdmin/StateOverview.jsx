// src/pages/StateAdmin/StateOverview.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useBranding } from '../../context/BrandingContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
    Title, Tooltip, Legend, ArcElement 
} from 'chart.js';

// ChartJS को रजिस्टर करना जरूरी है
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StateOverview = ({ stateName }) => {
    const { settings } = useBranding();
    const [stats, setStats] = useState({
        activeShops: 0,
        pendingShops: 0,
        totalOrders: 0,
        revenue: 0,
        districtAdmins: 0,
        stateOperators: 0
    });
    const [loading, setLoading] = useState(true);

    const themeColor = settings?.themeColor || '#4f46e5';

    // 📡 बैकएंड से स्टेट लेवल का डेटा लाना
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // यह API एडमिन के रोल के हिसाब से ऑटोमैटिक डेटा फिल्टर करती है
                const res = await api.get('/admin/stats/global');
                if (res.data.success) {
                    setStats({
                        activeShops: res.data.stats.shops || 0,
                        pendingShops: res.data.stats.pending || 0,
                        totalOrders: res.data.stats.orders || 0,
                        revenue: res.data.stats.revenue || 0,
                        districtAdmins: res.data.stats.stateAdmins || 0, // State Admins actually means total nodes here
                        stateOperators: res.data.stats.districtAdmins || 0
                    });
                }
            } catch (err) {
                console.error("Failed to sync State Statistics.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // चार्ट डेटा कॉन्फ़िगरेशन
    const barData = {
        labels: ['Gross Revenue'],
        datasets: [{ 
            label: 'State Revenue (₹)', 
            data: [stats.revenue], 
            backgroundColor: themeColor, 
            borderRadius: 12 
        }]
    };

    const doughnutData = {
        labels: ['Approved Shops', 'Pending Audits'],
        datasets: [{
            data: [stats.activeShops, stats.pendingShops],
            backgroundColor: [themeColor, '#f59e0b'],
            hoverOffset: 4,
            borderWidth: 0
        }]
    };

    if (loading) return <div style={loaderS}>Synchronizing State Infrastructure...</div>;

    return (
        <div style={pageFadeS}>
            {/* Header Section */}
            <div style={pageHeaderS}>
                <div>
                    <h2 style={titleS}>🏛️ {stateName} Regional Dashboard</h2>
                    <p style={subTitleS}>Comprehensive monitoring of district nodes and commercial velocity.</p>
                </div>
                <div style={statusBadgeS}>
                    <span className="pulse-dot"></span> UPLINK_ACTIVE
                </div>
            </div>

            {/* KPI Metrics Grid */}
            <div style={statsGridS}>
                <KPICard label="TOTAL STATE REVENUE" val={`₹${stats.revenue.toLocaleString('en-IN')}`} icon="💰" color="#10b981" />
                <KPICard label="ACTIVE DISTRICT NODES" val={stats.stateOperators} icon="📍" color={themeColor} />
                <KPICard label="AUTHORIZED SHOPS" val={stats.activeShops} icon="🏪" color="#6366f1" />
                <KPICard label="PENDING VERIFICATIONS" val={stats.pendingShops} icon="⏳" color="#f59e0b" />
            </div>

            {/* Charts Section */}
            <div style={chartGridS}>
                <div style={chartCardS}>
                    <h3 style={cardTitleS}>Revenue Performance</h3>
                    <div style={{ height: '300px' }}>
                        <Bar data={barData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                <div style={chartCardS}>
                    <h3 style={cardTitleS}>Inventory Hub Distribution</h3>
                    <div style={{ height: '250px', marginTop: '20px' }}>
                        <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; margin-right: 10px; box-shadow: 0 0 10px #10b981; animation: pulse-anim 2s infinite; }
                @keyframes pulse-anim { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
            `}</style>
        </div>
    );
};

// --- Sub-Component: KPI Card ---
const KPICard = ({ label, val, icon, color }) => (
    <div style={{...statCardS, borderBottom: `5px solid ${color}`}}>
        <div style={cardTopS}>
            <small style={statLabS}>{label}</small>
            <span style={{...iconCircleS, backgroundColor: `${color}15`, color: color}}>{icon}</span>
        </div>
        <h2 style={statValS}>{val}</h2>
    </div>
);

// --- Professional Command Center Styles ---
const pageFadeS = { animation: 'fadeIn 0.6s ease-out' };
const loaderS = { padding: '100px', textAlign: 'center', fontWeight: '800', color: '#94a3b8', letterSpacing: '1px' };
const pageHeaderS = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };
const titleS = { margin: 0, fontSize: '30px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.8px' };
const subTitleS = { color: '#64748b', margin: '5px 0 0 0', fontSize: '15px' };
const statusBadgeS = { background: '#f8fafc', padding: '10px 20px', borderRadius: '100px', fontSize: '11px', fontWeight: '900', color: '#64748b', border: '1px solid #e2e8f0' };

const statsGridS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px', marginBottom: '40px' };
const statCardS = { background: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '15px' };
const cardTopS = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const statLabS = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px' };
const iconCircleS = { width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' };
const statValS = { margin: 0, fontSize: '28px', fontWeight: '900', color: '#1e293b' };

const chartGridS = { display: 'grid', gridTemplateColumns: window.innerWidth < 1100 ? '1fr' : '1.5fr 1fr', gap: '30px' };
const chartCardS = { background: '#fff', padding: '35px', borderRadius: '30px', border: '1px solid #f1f5f9', boxShadow: '0 15px 45px rgba(0,0,0,0.02)' };
const cardTitleS = { margin: 0, fontSize: '17px', fontWeight: '800', color: '#1e293b' };

export default StateOverview;