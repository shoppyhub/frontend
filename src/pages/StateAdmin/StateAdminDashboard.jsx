import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';

// --- Layout Components ---
import StateHeader from '../../components/StateAdmin/StateHeader';
import StateSidebar from '../../components/StateAdmin/StateSidebar';

// --- Management Modules ---
import StateHierarchy from './StateHierarchy';
import StatePendingRequests from './StatePendingRequests'; 
import DistrictPendingList from './DistrictManagement/DistrictPendingList'; 
import DistrictPerformance from './Performance/DistrictPerformance'; 
import StateManageShops from './StateMerchantManagement/StateManageShops'; 
import AllSystemOrders from '../SystemAdmin/MerchantManagement/ShopDirectory/AllSystemOrders';
import MerchantPayouts from '../SystemAdmin/FinancialHub/Payouts/MerchantPayouts';
import StateRevenue from './Finance/StateRevenue';
import SystemComplaints from '../SystemAdmin/SupportCenter/GrievanceRedressal/SystemComplaints';
import BroadcastCenter from '../SystemAdmin/SupportCenter/BroadcastSystem/BroadcastCenter';

// --- Charts ---
import { 
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
    Title, Tooltip, Legend, ArcElement 
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

/**
 * RKD MART - STATE ADMIN COMMAND CENTER (MASTER VERSION)
 * यह फ़ाइल सभी सब-मॉड्यूल्स को नियंत्रित करती है।
 */
const StateAdminDashboard = () => {
    const { user } = useAuth();
    const { settings } = useBranding();
    
    // --- UI Control States ---
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    const [loading, setLoading] = useState(true);

    // --- Data States ---
    const [stats, setStats] = useState({ 
        shops: 0, 
        revenue: 0, 
        districtAdmins: 0, 
        stateOperators: 0, 
        pendingShops: 0, // State Queue
        distPending: 0,  // District Queue
        totalOrders: 0 
    });

    const themeColor = settings?.themeColor || '#0f172a'; 
    const stateName = user?.assignedState || "State";

    // 1. 📡 डेटा सिंक्रोनाइज़ेशन (Real-time Analytics)
    const fetchStateStats = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/stats/global');
            if (res.data.success) {
                const s = res.data.stats;
                setStats({
                    shops: s.shops || 0,
                    revenue: s.revenue || 0,
                    districtAdmins: s.districtAdmins || 0,
                    stateOperators: s.stateAdmins || 0,
                    pendingShops: s.pending || 0, 
                    distPending: s.distPending || s.pendingAtDistrict || 0, 
                    totalOrders: s.orders || 0
                });
            }
        } catch (err) {
            console.error("Critical: Stats Synchronization Failed.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStateStats();
        const handleResize = () => setIsSidebarOpen(window.innerWidth > 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [fetchStateStats]);

    // 🛡️ मास्टर टैब स्विचर (Logic to switch between pages)
    const renderActiveModule = () => {
        switch (activeTab) {
            case 'overview': 
                return <StateOverview stats={stats} stateName={stateName} themeColor={themeColor} setActiveTab={setActiveTab} />;
            
            case 'pending_requests': 
                return <StatePendingRequests stateName={stateName} />;

            case 'dist_pending_monitoring': 
                return <DistrictPendingList stateName={stateName} />;

            case 'performance': 
                return <DistrictPerformance stateName={stateName} />;
            
            case 'districts':
            case 'operators':
                return <StateHierarchy targetTab={activeTab} stateName={stateName} />;
            
            case 'merchants': 
                return <StateManageShops state={stateName} />;
                
            case 'revenue': 
                return <StateRevenue stateName={stateName} />;
            case 'payouts':
                return <MerchantPayouts scope="state" state={stateName} />;
                
            case 'support': 
                return <SystemComplaints scope="state" state={stateName} />;
                
            case 'broadcast': 
                return <BroadcastCenter scope="state" state={stateName} />;

            default: 
                return <StateOverview stats={stats} stateName={stateName} themeColor={themeColor} setActiveTab={setActiveTab} />;
        }
    };

    if (loading && stats.shops === 0) return (
        <div style={fullLoader}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop: 15, fontWeight:'800', color:'#94a3b8'}}>LOADING SECURE STATE NODE...</p>
        </div>
    );

    return (
        <div style={shellS}>
            <StateHeader 
                stateName={stateName} 
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            />
            
            <div style={bodyS}>
                <StateSidebar 
                    activeTab={activeTab} 
                    setTab={setActiveTab} 
                    isOpen={isSidebarOpen}
                    closeSidebar={() => setIsSidebarOpen(false)}
                />
                
                <main style={mainS(isSidebarOpen)}>
                    <div style={contentWrap}>
                        <div className="fade-in-content">
                            {renderActiveModule()}
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile View Backdrop */}
            {window.innerWidth <= 1024 && isSidebarOpen && (
                <div style={overlayS} onClick={() => setIsSidebarOpen(false)}></div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in-content { animation: fadeIn 0.5s ease-out forwards; }
                .spinner { width: 45px; height: 45px; border: 4px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .live-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; animation: pulse 2s infinite; }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
            `}</style>
        </div>
    );
};

// --- डैसबोर्ड ओवरव्यू घटक (DASHBOARD OVERVIEW) ---
const StateOverview = ({ stats, stateName, themeColor, setActiveTab }) => {
    
    const barData = {
        labels: ['Regional Growth'],
        datasets: [{ 
            label: 'Total Volume', 
            data: [stats.totalOrders], 
            backgroundColor: themeColor, 
            borderRadius: 8 
        }]
    };

    const doughnutData = {
        labels: ['State Verification', 'District Monitoring'],
        datasets: [{
            data: [stats.pendingShops, stats.distPending],
            backgroundColor: [themeColor, '#f59e0b'],
            borderWidth: 0,
            hoverOffset: 12
        }]
    };

    return (
        <div>
            <div style={pageHeader}>
                <div>
                    <h2 style={titleS}>🏛️ {stateName} State Console</h2>
                    <p style={subTitleS}>Enterprise monitoring of all commercial and administrative nodes.</p>
                </div>
                <div style={statusBadge}>
                    <span className="live-dot"></span> NODE_UPLINK: ACTIVE
                </div>
            </div>

            {/* --- Clickable Dashboard Cards --- */}
            <div style={statsGrid}>
                <KPICard 
                    label="TOTAL REVENUE" 
                    val={`₹${stats.revenue.toLocaleString('en-IN')}`} 
                    icon="💰" 
                    color="#10b981" 
                    onClick={() => setActiveTab('performance')}
                />
                <KPICard 
                    label="STATE QUEUE" 
                    val={stats.pendingShops} 
                    icon="📥" 
                    color={themeColor} 
                    onClick={() => setActiveTab('pending_requests')}
                />
                <KPICard 
                    label="DISTRICT QUEUE" 
                    val={stats.distPending} 
                    icon="🔍" 
                    color="#f59e0b" 
                    onClick={() => setActiveTab('dist_pending_monitoring')}
                />
                <KPICard 
                    label="AUTHORIZED HUB" 
                    val={stats.shops} 
                    icon="🏪" 
                    color="#6366f1" 
                    onClick={() => setActiveTab('merchants')}
                />
            </div>

            {/* --- Charts Matrix --- */}
            <div style={graphGrid}>
                <div style={graphCard}>
                    <div style={cardHeadWrap}>
                        <h3 style={cardHeadS}>Sales Velocity Analytics</h3>
                        <small style={{color:'#94a3b8'}}>Real-time regional transaction tracking</small>
                    </div>
                    <div style={{ height: '320px' }}>
                        <Bar data={barData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                <div style={graphCard}>
                    <h3 style={cardHeadS}>Verification Workload</h3>
                    <div style={{ height: '230px', display: 'flex', justifyContent: 'center' }}>
                        <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                    <div style={healthStats}>
                        <div style={hItem}><span>Forwarded to State:</span> <b style={{color:themeColor}}>{stats.pendingShops}</b></div>
                        <div style={hItem}><span>Awaiting District Action:</span> <b style={{color:'#f59e0b'}}>{stats.distPending}</b></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- KPI Card UI Helper ---
const KPICard = ({ label, val, icon, color, onClick }) => (
    <div 
        style={{...statCard, borderBottom: `5px solid ${color}`}} 
        onClick={onClick}
        className="kpi-card-hover"
    >
        <div style={cardTop}>
            <small style={statLab}>{label}</small>
            <span style={{...iconCircle, backgroundColor: `${color}15`, color: color}}>{icon}</span>
        </div>
        <h2 style={statVal}>{val}</h2>
        <div style={viewMoreLink(color)}>EXPLORE MODULE →</div>

        <style>{`
            .kpi-card-hover { cursor: pointer; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
            .kpi-card-hover:hover { transform: translateY(-8px); box-shadow: 0 15px 45px rgba(0,0,0,0.1); }
        `}</style>
    </div>
);

// --- Styles (Enterprise-Ready) ---
const shellS = { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' };
const bodyS = { display: 'flex', flex: 1, marginTop: '85px' };
const mainS = (open) => ({
    flex: 1, 
    marginLeft: window.innerWidth > 1024 ? (open ? '280px' : '0') : '0',
    transition: '0.4s ease',
    padding: window.innerWidth < 768 ? '15px' : '30px',
    boxSizing: 'border-box'
});
const contentWrap = { maxWidth: '1500px', margin: '0 auto' };
const pageHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '35px', flexWrap: 'wrap', gap: '20px' };
const titleS = { margin: 0, color: '#0f172a', fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' };
const subTitleS = { color: '#64748b', margin: '6px 0 0 0', fontSize: '15px' };
const statusBadge = { background: '#f0fdf4', color: '#16a34a', padding: '10px 18px', borderRadius: '100px', fontSize: '11px', fontWeight: '900', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '10px' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', marginBottom: '40px' };
const statCard = { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' };
const cardTop = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const iconCircle = { width: '48px', height: '48px', borderRadius: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' };
const statLab = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1.2px', textTransform: 'uppercase' };
const statVal = { margin: 0, color: '#0f172a', fontSize: '28px', fontWeight: '900' };
const viewMoreLink = (color) => ({ fontSize: '9px', fontWeight: '800', color: color, marginTop: '8px', letterSpacing: '1px' });
const graphGrid = { display: 'grid', gridTemplateColumns: window.innerWidth < 1100 ? '1fr' : '1.8fr 1fr', gap: '30px' };
const graphCard = { backgroundColor: '#fff', padding: '35px', borderRadius: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' };
const cardHeadWrap = { marginBottom: '25px', borderBottom: '1px solid #f8fafc', paddingBottom: '15px' };
const cardHeadS = { margin: 0, fontSize: '18px', color: '#1e293b', fontWeight: '800' };
const healthStats = { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '30px' };
const hItem = { display: 'flex', justifyContent: 'space-between', padding: '15px 20px', background: '#f8fafc', borderRadius: '16px', fontSize: '13px', fontWeight: '700' };
const fullLoader = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#fff' };
const overlayS = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(3px)', zIndex: 1300 };

export default StateAdminDashboard;