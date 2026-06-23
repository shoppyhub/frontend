import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import io from 'socket.io-client';
import { useBranding } from '../../../context/BrandingContext';
import ErrorBoundary from '../../../components/SystemAdmin/ErrorBoundary';

// --- Static Layout Components ---
import AdminHeader from '../../../components/SystemAdmin/AdminHeader';
import AdminSidebar from '../../../components/SystemAdmin/AdminSidebar';
import LoadingState from '../../../components/SystemAdmin/LoadingState';

// --- 🚀 LAZY IMPORTS (Paths Updated Based on Your Provided Structure) ---
const AdvancedAnalytics = lazy(() => import('./AdvancedAnalytics'));

// 1. Hierarchy Management (List Pages)
const AllAdminNodes = lazy(() => import('../HierarchyManagement/AllAdminNodes'));
const SubAdminManagement = lazy(() => import('../HierarchyManagement/SubAdminManagement'));
const StateAdminManagement = lazy(() => import('../HierarchyManagement/StateAdminManagement'));
const DistrictAdminManagement = lazy(() => import('../HierarchyManagement/DistrictAdminManagement'));

// 2. Registration Components (Updated to correct sub-folders)
const SubAdminRegister = lazy(() => import('../HierarchyManagement/SubAdmins/SubAdminRegister'));
const StateAdminRegister = lazy(() => import('../HierarchyManagement/StateNodes/StateAdminRegister'));
const StateOperatorRegister = lazy(() => import('../HierarchyManagement/StateNodes/StateOperatorRegister'));
const DistrictAdminRegister = lazy(() => import('../HierarchyManagement/DistrictNodes/DistrictAdminRegister'));
const DistrictOperatorRegister = lazy(() => import('../HierarchyManagement/DistrictNodes/DistrictOperatorRegister'));

// 3. Merchant & Staff Registration
const ShopOwnerRegister = lazy(() => import('../MerchantManagement/StaffRegistry/ShopOwnerRegister'));
const ShopStaffRegister = lazy(() => import('../MerchantManagement/StaffRegistry/ShopStaffRegister'));

// 4. Details & Audit Nodes (Audit Pages)
const SubAdminDetails = lazy(() => import('../HierarchyManagement/SubAdmins/SubAdminDetails'));
const StateAdminDetails = lazy(() => import('../HierarchyManagement/StateNodes/StateAdminDetails'));
const DistrictAdminDetails = lazy(() => import('../HierarchyManagement/DistrictNodes/DistrictAdminDetails'));
const ShopOwnerDetails = lazy(() => import('../MerchantManagement/ShopDirectory/ShopOwnerDetails'));
const StaffDetails = lazy(() => import('../MerchantManagement/StaffRegistry/StaffDetails'));

// 5. Merchant Management (Lists)
const ShopOwnerManagement = lazy(() => import('../MerchantManagement/ShopDirectory/ShopOwnerManagement'));
const ManageShops = lazy(() => import('../MerchantManagement/ShopDirectory/ManageShops'));
const SystemRequests = lazy(() => import('../MerchantManagement/VerificationQueue/SystemRequests'));
const AllSystemOrders = lazy(() => import('../MerchantManagement/ShopDirectory/AllSystemOrders'));
const ActiveMerchantControl = lazy(() => import('../MerchantManagement/ShopDirectory/ActiveMerchantControl/ActiveMerchantControl'));

// 6. Inventory Hub
const GlobalInventory = lazy(() => import('../InventoryHub/MasterCatalog/GlobalInventory'));
const LowStockAlerts = lazy(() => import('../InventoryHub/MasterCatalog/LowStockAlerts'));
const CategoryManager = lazy(() => import('../InventoryHub/CategoryControl/CategoryManager'));
const PriceControl = lazy(() => import('../InventoryHub/PriceRegulation/PriceControl'));
const CouponManager = lazy(() => import('../InventoryHub/CategoryControl/CouponManager'));

// 7. Finance & Governance
const MerchantPayouts = lazy(() => import('../FinancialHub/Payouts/MerchantPayouts'));
const PlatformCommissions = lazy(() => import('../FinancialHub/CommissionModels/PlatformCommissions'));
const TaxFinanceControl = lazy(() => import('../FinancialHub/CommissionModels/TaxFinanceControl'));
const SystemSettingsWrapper = lazy(() => import('../Governance/BrandingIdentity/SystemSettingsWrapper'));
const APIIntegrations = lazy(() => import('../Infrastructure/APIVault/APIIntegrations'));
const APIManagementDashboard = lazy(() => import('../Infrastructure/APIManagement/APIManagementDashboard'));
const SystemUsers = lazy(() => import('../Infrastructure/AuditTrail/SystemUsers'));
const ServerHealth = lazy(() => import('../Infrastructure/HealthMonitor/ServerHealth'));
const InfraHealthMonitor = lazy(() => import('../Infrastructure/HealthMonitor/InfraHealthMonitor'));
const InfraFailoverLogs = lazy(() => import('../Infrastructure/AuditTrail/InfraFailoverLogs'));
const AuditLogs = lazy(() => import('../Infrastructure/AuditTrail/AuditLogs'));
const DeviceManagement = lazy(() => import('../Infrastructure/DeviceManagement/DeviceManagement'));
const CustomerDetails = lazy(() => import('../Infrastructure/AuditTrail/CustomerDetails'));
// 8. Support & Profile
const BroadcastCenter = lazy(() => import('../SupportCenter/BroadcastSystem/BroadcastCenter'));
const SystemComplaints = lazy(() => import('../SupportCenter/GrievanceRedressal/SystemComplaints'));
const BannerManagement = lazy(() => import('../../../components/SystemAdmin/BannerManagement'));
const AdminProfileDetails = lazy(() => import('../Profile/AdminProfileDetails'));
const AdminSecurity = lazy(() => import('../Profile/AdminSecurity'));

// --- Charts Logic ---
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const SystemAdminDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { settings } = useBranding();
    
    const [stats, setStats] = useState({ shops: 0, customers: 0, orders: 0, revenue: 0, stateAdmins: 0, districtAdmins: 0 });
    const [graphData, setGraphData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    const fetchGlobalIntel = useCallback(async () => {
        try {
            const res = await api.get('/admin/stats/global');
            if (res.data?.success) {
                setStats(res.data.stats);
                setGraphData(res.data.graph || []);
            }
        } catch (err) {
            console.error("Infrastructure Sync Failure");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGlobalIntel();
        const handleResize = () => {
            const mobile = window.innerWidth <= 1024;
            setIsMobile(mobile);
            if (!mobile) setIsSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);

        let socketUrl = 'http://localhost:5000';
        try {
            const envBase = import.meta.env?.VITE_API_BASE_URL;
            if (envBase) {
                socketUrl = envBase.replace('/api', '');
            }
        } catch (e) {
            console.warn("Socket URL fallback engaged.");
        }

        const socket = io(socketUrl, { transports: ['websocket'], upgrade: false });
        socket.on('ecosystem_updated', fetchGlobalIntel);

        return () => {
            window.removeEventListener('resize', handleResize);
            socket.disconnect();
        };
    }, [fetchGlobalIntel]);

    const themeColor = settings?.themeColor || '#0f172a';
    const isDashboardHome = ['/admin', '/admin/', '/admin/dashboard'].includes(location.pathname);

    if (loading && isDashboardHome) return <LoadingState color={themeColor} />;

    return (
        <ErrorBoundary>
            <div style={dashboardWrapper}>
            <AdminHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <div style={flexLayout}>
                <AdminSidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
                
                <main style={mainContentArea(isMobile)}>
                    {/* Sub-Navigation for Inventory Section */}
                    {location.pathname.includes('inventory') && (
                        <div style={subNavigationS}>
                            <button onClick={() => navigate('/admin/inventory-global')} style={location.pathname === '/admin/inventory-global' ? activeSubBtn(themeColor) : subBtn}>📦 Master Stock</button>
                            <button onClick={() => navigate('/admin/inventory-low-stock')} style={location.pathname === '/admin/inventory-low-stock' ? activeSubBtn(themeColor) : subBtn}>⚠️ Stock Alerts</button>
                            <button onClick={() => navigate('/admin/inventory-categories')} style={location.pathname === '/admin/inventory-categories' ? activeSubBtn(themeColor) : subBtn}>📁 Global Catalog</button>
                            <button onClick={() => navigate('/admin/inventory-price')} style={location.pathname === '/admin/inventory-price' ? activeSubBtn(themeColor) : subBtn}>⚖️ Price Protocol</button>
                        </div>
                    )}

                    {/* Sub-Navigation for API Management Section */}
                    {location.pathname.includes('api-management') && (
                        <div style={subNavigationS}>
                            <button onClick={() => navigate('/admin/api-management')} style={location.pathname === '/admin/api-management' ? activeSubBtn(themeColor) : subBtn}>📋 Registry</button>
                            <button onClick={() => navigate('/admin/api-management')} style={location.pathname === '/admin/api-management' ? activeSubBtn(themeColor) : subBtn}>📈 Analytics</button>
                            <button onClick={() => navigate('/admin/api-management')} style={location.pathname === '/admin/api-management' ? activeSubBtn(themeColor) : subBtn}>🏥 Health</button>
                            <button onClick={() => navigate('/admin/api-management')} style={location.pathname === '/admin/api-management' ? activeSubBtn(themeColor) : subBtn}>🔐 Security</button>
                            <button onClick={() => navigate('/admin/api-management')} style={location.pathname === '/admin/api-management' ? activeSubBtn(themeColor) : subBtn}>📦 Versioning</button>
                            <button onClick={() => navigate('/admin/api-management')} style={location.pathname === '/admin/api-management' ? activeSubBtn(themeColor) : subBtn}>⚙️ Bulk Ops</button>
                        </div>
                    )}

                    <div style={fadeAnimS}>
                        <Suspense fallback={<LoadingState color={themeColor} fullPage={false} />}>
                            <Routes>
                                <Route index element={<Navigate to="dashboard" replace />} />
                                
                                {/* 1. CORE OPERATIONS */}
                                <Route path="dashboard" element={<DashboardOverview stats={stats} graphData={graphData} themeColor={themeColor} siteName={settings.siteName} />} />
                                <Route path="requests" element={<SystemRequests />} />
                                <Route path="shops" element={<ManageShops />} />
                                 <Route path="users" element={<SystemUsers />} />
                                <Route path="orders" element={<AllSystemOrders />} />

                                {/* 2. HIERARCHY MANAGEMENT & REGISTRATION */}
                                <Route path="hierarchy-all" element={<AllAdminNodes />} />
                                <Route path="subadmins" element={<SubAdminManagement />} />
                                <Route path="subadmins/add" element={<SubAdminRegister onBack={() => navigate('/admin/subadmins')} />} /> 
                                
                                <Route path="state-mgmt" element={<StateAdminManagement />} />
                                <Route path="stateadmins/add" element={<StateAdminRegister onBack={() => navigate('/admin/state-mgmt')} />} />
                                <Route path="state-operators/add" element={<StateOperatorRegister onBack={() => navigate('/admin/state-mgmt')} />} />
                                
                                <Route path="district-mgmt" element={<DistrictAdminManagement />} />
                                <Route path="districtadmins/add" element={<DistrictAdminRegister onBack={() => navigate('/admin/district-mgmt')} />} />
                                <Route path="district-operators/add" element={<DistrictOperatorRegister onBack={() => navigate('/admin/district-mgmt')} />} />

                                <Route path="merchant-mgmt" element={<ShopOwnerManagement />} />
                                <Route path="merchant-mgmt/add" element={<ShopOwnerRegister onBack={() => navigate('/admin/merchant-mgmt')} />} />
                                {/* 3. DETAILS & AUDIT NODES */}
                                <Route path="subadmin-details/:id" element={<SubAdminDetails />} />
                                <Route path="stateadmin-details/:id" element={<StateAdminDetails />} />
                                <Route path="district-admin-details/:id" element={<DistrictAdminDetails />} />
                                <Route path="shop-owner-details/:id" element={<ShopOwnerDetails />} />
                                <Route path="shop-control/:id" element={<ActiveMerchantControl />} />
                                <Route path="staff-details/:id" element={<StaffDetails />} />
                                <Route path="staff-mgmt/add" element={<ShopStaffRegister onBack={() => navigate('/admin/merchant-mgmt')} />} />
                                    
                                {/* 4. INVENTORY HUB */}
                                <Route path="inventory-global" element={<GlobalInventory />} />
                                <Route path="inventory-low-stock" element={<LowStockAlerts />} />
                                <Route path="inventory-categories" element={<CategoryManager />} />
                                <Route path="inventory-price" element={<PriceControl />} />
                                <Route path="coupons" element={<CouponManager />} />

                                {/* 5. FINANCE & GOVERNANCE */}
                                <Route path="payouts" element={<MerchantPayouts />} />
                                <Route path="commissions" element={<PlatformCommissions />} />
                                <Route path="tax-control" element={<TaxFinanceControl />} />
                                <Route path="settings-branding" element={<SystemSettingsWrapper tab="branding" />} />
                                <Route path="settings-advanced" element={<SystemSettingsWrapper tab="advanced" />} />
                                <Route path="banners" element={<BannerManagement />} />
                                <Route path="settings-cms" element={<SystemSettingsWrapper tab="cms" />} />
                                <Route path="settings-master" element={<SystemSettingsWrapper tab="master" />} />
                                <Route path="settings-coverage" element={<SystemSettingsWrapper tab="locations" />} />
                                <Route path="settings-tax" element={<SystemSettingsWrapper tab="tax" />} />
                                <Route path="settings-infra" element={<SystemSettingsWrapper tab="infra" />} />
                                <Route path="api-keys" element={<APIIntegrations />} />
                                <Route path="api-management" element={<APIManagementDashboard />} />

                                {/* 6. INFRASTRUCTURE & SUPPORT */}
                                <Route path="users" element={<SystemUsers />} />
                                <Route path="broadcast" element={<BroadcastCenter />} />
                                <Route path="complaints" element={<SystemComplaints />} />
                                <Route path="health" element={<ServerHealth />} />
                                <Route path="infra-health" element={<InfraHealthMonitor />} />
                                <Route path="failover-logs" element={<InfraFailoverLogs />} />
                                <Route path="logs" element={<AuditLogs />} />
                                <Route path="devices" element={<DeviceManagement />} />
                                <Route path="customer-details/:id" element={<CustomerDetails />} />
                                <Route path="profile-details" element={<AdminProfileDetails />} />
                                <Route path="security" element={<AdminSecurity />} />

                                <Route path="*" element={<Navigate to="dashboard" replace />} />
                            </Routes>
                        </Suspense>
                    </div>
                </main>
            </div>

            <style>{`
                .spinner-pro { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top-color: ${themeColor}; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
            </div>
        </ErrorBoundary>
    );
};

// --- Sub-Component: Dashboard Overview ---
const DashboardOverview = ({ stats, graphData, themeColor, siteName }) => {
    const navigate = useNavigate();
    const revenueTrajectory = { 
        labels: graphData.length > 0 ? graphData.map(d => d.month) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], 
        datasets: [{ 
            label: 'Network Revenue (₹)', 
            data: graphData.length > 0 ? graphData.map(d => d.amount) : [0,0,0,0,0,0], 
            borderColor: themeColor, 
            backgroundColor: `${themeColor}10`, 
            fill: true, 
            tension: 0.4, 
            pointRadius: 6,
            pointBackgroundColor: '#fff',
            pointBorderColor: themeColor,
            pointBorderWidth: 3
        }] 
    };

    return (
        <div>
            <div style={topActionRow}>
                <div>
                    <h2 style={titleS}>Ecosystem Pulse: {siteName || 'RKD MART'}</h2>
                    <p style={subTitleS}>Strategic oversight and real-time operational analytics.</p>
                </div>
            </div>

            <div style={statsGridUnified}>
                <ClickableCard label="TOTAL REVENUE" val={`₹${(stats.revenue || 0).toLocaleString()}`} icon="💰" col="#10b981" path="/admin/commissions" navigate={navigate} />
                <ClickableCard label="MERCHANT NODES" val={stats.shops || 0} icon="🏪" col={themeColor} path="/admin/shops" navigate={navigate} />
                <ClickableCard label="NETWORK TRAFFIC" val={stats.orders || 0} icon="📦" col="#f59e0b" path="/admin/inventory-global" navigate={navigate} />
                <ClickableCard label="USER BASE" val={stats.customers || 0} icon="👥" col="#6366f1" path="/admin/users" navigate={navigate} />
                <ClickableCard label="STATE ADMINS" val={stats.stateAdmins || 0} icon="🏛️" col="#8b5cf6" path="/admin/state-mgmt" navigate={navigate} />
                <ClickableCard label="DISTRICT ADMINS" val={stats.districtAdmins || 0} icon="📍" col="#f43f5e" path="/admin/district-mgmt" navigate={navigate} />
            </div>

            <div style={graphCard}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
                    <h3 style={cardHeadS}>📈 Trajectory Analysis</h3>
                    <span style={liveBadge}>REAL-TIME SYNC</span>
                </div>
                <div style={{ height: '350px' }}>
                    <Line data={revenueTrajectory} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { borderDash: [5, 5] } } } }} />
                </div>
            </div>
        </div>
    );
};

const ClickableCard = ({ label, val, icon, col, path, navigate }) => (
    <div onClick={() => navigate(path)} style={statCardBase(col)}>
        <div style={cardTop}><small style={statLab}>{label}</small><span style={{ ...iconCircle, backgroundColor: `${col}15`, color: col }}>{icon}</span></div>
        <h2 style={statValS}>{val}</h2>
        <div style={cardFooter(col)}>View Protocol →</div>
    </div>
);

// --- Strategic SaaS Styles ---
const dashboardWrapper = { backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const flexLayout = { display: 'flex' };
const mainContentArea = (isMobile) => ({ flex: 1, marginLeft: isMobile ? '0' : '280px', marginTop: '85px', padding: isMobile ? '20px' : '40px', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)' });
const subNavigationS = { display: 'flex', gap: '10px', marginBottom: '35px', background: '#fff', padding: '10px', borderRadius: '18px', border: '1px solid #f1f5f9', overflowX: 'auto', scrollbarWidth: 'none' };
const subBtn = { padding: '12px 25px', borderRadius: '12px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: '800', fontSize: '11px', whiteSpace: 'nowrap' };
const activeSubBtn = (color) => ({ ...subBtn, background: color, color: '#fff', boxShadow: `0 8px 15px ${color}33` });
const topActionRow = { marginBottom: '40px' };
const titleS = { margin: 0, fontSize: '28px', fontWeight: '900', color: '#0f172a', letterSpacing:'-1.5px' };
const subTitleS = { color: '#64748b', fontSize: '14px', marginTop:'4px', fontWeight:'500' };
const statsGridUnified = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' };
const statCardBase = (col) => ({ background: '#fff', padding: '25px', borderRadius: '24px', borderTop: `5px solid ${col}`, boxShadow: '0 10px 20px rgba(0,0,0,0.02)', cursor:'pointer', transition:'0.3s', border: '1px solid #f1f5f9' });
const cardTop = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const iconCircle = { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' };
const statLab = { fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' };
const statValS = { margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a' };
const cardFooter = (col) => ({ fontSize: '9px', color: col, fontWeight: '900', marginTop: '15px', textAlign: 'right', textTransform:'uppercase' });
const graphCard = { background: '#fff', padding: '30px', borderRadius: '30px', border: '1px solid #f1f5f9' };
const cardHeadS = { margin: 0, fontSize: '16px', fontWeight: '900', color: '#0f172a' };
const liveBadge = { background:'#ecfdf5', color:'#10b981', padding:'5px 12px', borderRadius:'8px', fontSize:'9px', fontWeight:'900' };
const fadeAnimS = { animation: 'fadeIn 0.5s ease' };

export default SystemAdminDashboard;