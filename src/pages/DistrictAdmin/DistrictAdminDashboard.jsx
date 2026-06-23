import React, { useState, useEffect, useMemo, Suspense, lazy, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useBranding } from '../../context/BrandingContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// --- Components ---
import DistrictHeader from '../../components/DistrictAdmin/DistrictHeader';
import DistrictSidebar from '../../components/DistrictAdmin/DistrictSidebar';

// --- Lazy Pages - Original ---
const ManageShops = lazy(() => import('./ShopManagement/ManageShops'));
const SystemComplaints = lazy(() => import('../SystemAdmin/SupportCenter/GrievanceRedressal/SystemComplaints'));
const DistrictHierarchy = lazy(() => import('./DistrictHierarchy')); 
const ShopVerification = lazy(() => import('./ShopManagement/ShopVerification'));
const DistrictOrders = lazy(() => import('./Logistics/DistrictOrders'));

// --- Lazy Pages - Enhanced & Management ---
const TaskManagement = lazy(() => import('./TaskManagement'));
const StaffManagement = lazy(() => import('./StaffManagement'));
const FinanceDashboard = lazy(() => import('./FinanceDashboard'));
const ReportsCenter = lazy(() => import('./ReportsCenter'));
const InventoryManagement = lazy(() => import('./InventoryManagement'));
const AdminSettings = lazy(() => import('./AdminSettings'));

// ✅ NEW: Shop Control Management Page
const ShopHubControl = lazy(() => import('./ShopManagement/ShopHubControl'));

// --- Charts Setup ---
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';
import { Bar } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

// ==================== MAIN DASHBOARD COMPONENT ====================

const DistrictAdminDashboard = () => {
    const { settings } = useBranding();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    const themeColor = settings?.themeColor || '#0d9488';

    const currentDistrict = useMemo(() => {
        return (user?.assignedDistrict || user?.shopDistrict || user?.pDistrict || 'General Hub');
    }, [user]);

    const activeTab = location.pathname.split('/').pop() || 'dashboard';

    if (authLoading) return <div style={loaderS}>SYNCHRONIZING SECURE NODE...</div>;

    return (
        <div style={dashboardWrapper}>
            <DistrictHeader 
                districtName={currentDistrict} 
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            />
            
            <div style={flexLayout}>
                <DistrictSidebar 
                    activeTab={activeTab} 
                    setTab={(tab) => navigate(`/district-admin/${tab}`)}
                    districtName={currentDistrict}
                    isOpen={isSidebarOpen}
                    closeSidebar={() => setIsSidebarOpen(false)}
                />
                
                <main style={mainContentArea(isSidebarOpen)}>
                    <div style={fadeAnim}>
                        <Suspense fallback={<div style={{padding:'40px', textAlign:'center'}}>Loading Module Matrix...</div>}>
                            <Routes>
                                <Route index element={<Navigate to="dashboard" replace />} />
                                <Route path="dashboard" element={<UltimateCommandCenter themeColor={themeColor} navigate={navigate} district={currentDistrict} />} />
                                
                                {/* 🏪 Shop Management Routes */}
                                <Route path="shops" element={<ManageShops />} />
                                <Route path="shop/:id/control" element={<ShopHubControl />} />
                                <Route path="verification" element={<ShopVerification districtName={currentDistrict} />} />

                                {/* 📋 Admin Core Routes */}
                                <Route path="tasks" element={<TaskManagement />} />
                                <Route path="staff" element={<StaffManagement />} />
                                <Route path="finance" element={<FinanceDashboard />} />
                                <Route path="reports" element={<ReportsCenter />} />
                                <Route path="inventory" element={<InventoryManagement />} />
                                <Route path="settings" element={<AdminSettings />} />
                                <Route path="orders" element={<DistrictOrders />} />
                                <Route path="operators/*" element={<DistrictHierarchy />} />
                                <Route path="complaints" element={<SystemComplaints scope="district" />} />
                                
                                <Route path="*" element={<Navigate to="dashboard" replace />} />
                            </Routes>
                        </Suspense>
                    </div>
                </main>
            </div>
        </div>
    );
};

// ==================== ULTIMATE COMMAND CENTER ====================

const UltimateCommandCenter = ({ themeColor, navigate, district }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        overview: {},
        commerce: {},
        support: {},
        team: {},
        recentActivity: []
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/district/stats-pulse');
            if (res.data.success) {
                setData(res.data.stats);
            }
        } catch (err) {
            console.error("Dashboard Pulse Error", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const timer = setInterval(fetchData, 120000); 
        return () => clearInterval(timer);
    }, [fetchData]);

    if (loading && !data.overview?.totalShops) {
        return (
            <div style={loaderContainerS}>
                <div style={spinnerS(themeColor)}></div>
                <p style={{marginTop:'15px', color:'#64748b', fontWeight:'600'}}>Establishing Secure Telemetry...</p>
            </div>
        );
    }

    return (
        <div style={contentWrapper}>
            {/* Header */}
            <div style={headerSectionS}>
                <div>
                    <h1 style={mainTitleS}>📍 {district} Command Center</h1>
                    <p style={subTitleS}>Live operational matrix and regional administration hub.</p>
                </div>
                <button onClick={fetchData} style={syncBtnS(themeColor)}>🔄 Force Data Sync</button>
            </div>

            {/* Quick Action Shortcuts */}
            <div style={actionButtonsGrid}>
                <ActionCard icon="✅" label="Tasks" link="/district-admin/tasks" theme={themeColor} navigate={navigate} />
                <ActionCard icon="📊" label="Reports" link="/district-admin/reports" theme={themeColor} navigate={navigate} />
                <ActionCard icon="👥" label="Staff" link="/district-admin/staff" theme={themeColor} navigate={navigate} />
                <ActionCard icon="💼" label="Departments" link="/district-admin/operators" theme={themeColor} navigate={navigate} />
                <ActionCard icon="⚙️" label="Settings" link="/district-admin/settings" theme={themeColor} navigate={navigate} />
            </div>

            {/* Main Stats Matrix */}
            <div style={matrixGridS}>
                <MetricBox 
                    title="🏬 Shop Management" 
                    theme={themeColor}
                    stats={[
                        { label: 'Total Units', value: data.overview?.totalShops || 0 },
                        { label: 'Active Hubs', value: data.overview?.activeShops || 0 },
                        { label: 'Pending Audit', value: data.overview?.pendingShops || 0 },
                        { label: 'Health Score', value: data.overview?.operationHealthScore || '0.00%', isProgress: true }
                    ]}
                />

                <MetricBox 
                    title="📦 Commerce Matrix" 
                    theme="#6366f1"
                    stats={[
                        { label: 'Total Orders', value: data.commerce?.totalOrders || 0 },
                        { label: 'Delivered', value: data.commerce?.completedOrders || 0 },
                        { label: 'In-Transit', value: data.commerce?.pendingOrders || 0 },
                        { label: 'Conv. Rate', value: data.commerce?.conversionRate || '0%', isProgress: true }
                    ]}
                />

                <MetricBox 
                    title="📞 Service & Support" 
                    theme="#ef4444"
                    stats={[
                        { label: 'Complaints', value: data.support?.totalComplaints || 0 },
                        { label: 'Resolved', value: data.support?.resolvedComplaints || 0 },
                        { label: 'Pending', value: data.support?.pendingComplaints || 0 },
                        { label: 'Res. Rate', value: data.support?.resolutionRate || '0%', isProgress: true }
                    ]}
                />

                <MetricBox 
                    title="💰 Revenue & 👥 Team" 
                    theme="#f59e0b"
                    stats={[
                        { label: 'Staff Count', value: data.team?.staffCount || 0 },
                        { label: 'Active Users', value: data.team?.activeCustomers || 0 },
                        { label: 'Gross Rev', value: `₹${(data.commerce?.totalRevenue || 0).toLocaleString('en-IN')}`, isBold: true },
                        { label: 'Avg / Order', value: `₹${Math.round((data.commerce?.totalRevenue || 0) / (data.commerce?.totalOrders || 1))}`, isBold: true }
                    ]}
                />
            </div>

            {/* Visual Analytics Grid */}
            <div style={bottomGridS}>
                <div style={activityCardS}>
                    <div style={cardHeaderS}>
                        <h3 style={cardTitleS}>📋 Recent Activity Log</h3>
                        <button style={textBtnS(themeColor)} onClick={() => navigate('/district-admin/reports')}>Full Audit</button>
                    </div>
                    <div style={activityListS}>
                        {data.recentActivity && data.recentActivity.length > 0 ? (
                            data.recentActivity.slice(0, 6).map((act, idx) => (
                                <div key={idx} style={activityItemS}>
                                    <div style={activityDotS(themeColor)}></div>
                                    <div style={activityContentS}>
                                        <p style={activityDescS}>{act.description}</p>
                                        <small style={activityTimeS}>{new Date(act.createdAt).toLocaleTimeString()}</small>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={emptyActivityS}>No administrative activities logged today.</div>
                        )}
                    </div>
                </div>

                <div style={chartCardS}>
                    <h3 style={cardTitleS}>📊 Telemetry Trends</h3>
                    <div style={{height: '240px', marginTop: '15px'}}>
                        <Bar 
                            data={{
                                labels: ['Hubs', 'Sales', 'Tickets', 'Staff'],
                                datasets: [{
                                    label: 'Volume Metrics',
                                    data: [data.overview?.totalShops, data.commerce?.totalOrders, data.support?.totalComplaints, data.team?.staffCount],
                                    backgroundColor: [themeColor, '#6366f1', '#ef4444', '#f59e0b'],
                                    borderRadius: 10
                                }]
                            }}
                            options={{ 
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } } }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==================== REUSABLE MINI-COMPONENTS ====================

const ActionCard = ({ icon, label, link, theme, navigate }) => (
    <button 
        onClick={() => navigate(link)}
        style={actionCardBaseS}
        onMouseEnter={e => e.currentTarget.style.borderColor = theme}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#f1f5f9'}
    >
        <span style={{fontSize:'26px'}}>{icon}</span>
        <span style={{fontSize:'12px', fontWeight:'800', color:'#1e293b', marginTop:'5px'}}>{label}</span>
    </button>
);

const MetricBox = ({ title, stats, theme }) => (
    <div style={metricBoxBaseS(theme)}>
        <h3 style={{...metricTitleS, color: theme}}>{title}</h3>
        <div style={metricStatsGrid}>
            {stats.map((stat, i) => (
                <div key={i} style={statItemS}>
                    <span style={statLabelS}>{stat.label}</span>
                    <span style={{...statValueS, color: stat.isBold ? theme : '#1e293b'}}>{stat.value}</span>
                    {stat.isProgress && <div style={miniProgressS(theme)}></div>}
                </div>
            ))}
        </div>
    </div>
);

// ==================== STYLES ====================

const dashboardWrapper = { backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const flexLayout = { display: 'flex' };
const mainContentArea = (isOpen) => ({ 
    flex: 1, 
    marginLeft: window.innerWidth > 1024 ? (isOpen ? '280px' : '0') : '0', 
    marginTop: '85px', 
    padding: window.innerWidth < 768 ? '15px' : '35px', 
    transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
});

const contentWrapper = { maxWidth: '1400px', margin: '0 auto' };
const headerSectionS = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', flexWrap: 'wrap', gap: '20px' };
const mainTitleS = { margin: 0, fontSize: '26px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' };
const subTitleS = { margin: '5px 0 0 0', color: '#64748b', fontSize: '14px', fontWeight: '500' };
const syncBtnS = (col) => ({ padding: '10px 20px', backgroundColor: col, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', boxShadow: '0 8px 15px rgba(0,0,0,0.1)' });

const actionButtonsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '15px', marginBottom: '35px' };
const actionCardBaseS = { background: '#fff', border: '2px solid #f1f5f9', borderRadius: '20px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: '0.3s' };

const matrixGridS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '35px' };
const metricBoxBaseS = (theme) => ({ background: '#fff', borderRadius: '24px', padding: '25px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.01)', borderTop: `6px solid ${theme}` });
const metricTitleS = { margin: '0 0 20px 0', fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.8px' };
const metricStatsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const statItemS = { display: 'flex', flexDirection: 'column', gap: '3px' };
const statLabelS = { fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' };
const statValueS = { fontSize: '18px', fontWeight: '900' };
const miniProgressS = (col) => ({ height: '3px', background: col, width: '35%', borderRadius: '10px', marginTop: '5px', opacity: 0.4 });

const bottomGridS = { display: 'grid', gridTemplateColumns: window.innerWidth < 1100 ? '1fr' : '1.2fr 1fr', gap: '30px', marginBottom: '50px' };
const activityCardS = { background: '#fff', borderRadius: '25px', padding: '25px', border: '1px solid #f1f5f9' };
const cardHeaderS = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const cardTitleS = { margin: 0, fontSize: '15px', fontWeight: '900', color: '#1e293b' };
const textBtnS = (col) => ({ background: 'none', border: 'none', color: col, fontWeight: '800', fontSize: '11px', cursor: 'pointer' });
const activityListS = { display: 'flex', flexDirection: 'column', gap: '15px' };
const activityItemS = { display: 'flex', gap: '12px', paddingBottom:'10px', borderBottom:'1px solid #f8fafc' };
const activityDotS = (col) => ({ width: '7px', height: '7px', borderRadius: '50%', background: col, marginTop: '6px', flexShrink: 0 });
const activityContentS = { display: 'flex', flexDirection: 'column' };
const activityDescS = { margin: 0, fontSize: '12px', color: '#334155', fontWeight: '600' };
const activityTimeS = { color: '#94a3b8', fontSize: '10px' };
const emptyActivityS = { textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '12px' };
const chartCardS = { background: '#fff', borderRadius: '25px', padding: '25px', border: '1px solid #f1f5f9' };

const loaderContainerS = { height: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' };
const spinnerS = (col) => ({ width: '45px', height: '45px', border: `4px solid #f3f3f3`, borderTop: `4px solid ${col}`, borderRadius: '50%', animation: 'spin 1s linear infinite' });
const loaderS = { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '900', color: '#94a3b8', background:'#f8fafc' };
const fadeAnim = { animation: 'fadeIn 0.5s ease-in-out' };

export default DistrictAdminDashboard;