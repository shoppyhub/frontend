import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import { useBranding } from '../../context/BrandingContext';
import { useAuth } from '../../context/AuthContext';

// --- Layout Components ---
import ShopHeader from '../../components/ShopOwner/ShopHeader';
import ShopSidebar from '../../components/ShopOwner/ShopSidebar';
import ShopFooter from '../../components/ShopOwner/ShopFooter';

// --- 📊 Chart Imports ---
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
    LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- 🚀 LAZY MODULES (High Performance) ---
const ProductManager = lazy(() => import('./ProductManager'));
const OrderManager = lazy(() => import('./OrderManager'));
const StaffManager = lazy(() => import('./StaffManager'));
const ShopDocuments = lazy(() => import('./ShopDocuments'));
const ShopProfile = lazy(() => import('./ShopProfile'));
const ShopSupport = lazy(() => import('./ShopSupport'));
const EarningsManager = lazy(() => import('./EarningsManager'));
const ShopSettings = lazy(() => import('./ShopSettings'));

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3";

const ShopDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { settings: branding } = useBranding();
    const { user: authUser } = useAuth();
    
    // --- UI States ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [loading, setLoading] = useState(true);
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());
    const [isSocketConnected, setIsSocketConnected] = useState(false);

    // --- Data States ---
    const [shopData, setShopData] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [stats, setStats] = useState({
        totalSKUs: 0, pending: 0, processing: 0,
        totalDelivered: 0, walletBalance: 0,
        weeklySales: [12, 19, 3, 5, 2, 3, 15] // Initial sample
    });

    const socket = useRef(null);
    const audioPlayer = useRef(new Audio(NOTIFICATION_SOUND_URL));
    const isMobile = windowWidth <= 1024;
    const themeColor = branding?.themeColor || '#0f172a';

    // --- 📡 Neural Data Synchronization ---
    const fetchHubIntel = useCallback(async () => {
        try {
            const [profileRes, orderRes, productRes] = await Promise.all([
                api.get('/auth/profile').catch(() => ({ data: {} })),
                api.get('/orders/shop-orders').catch(() => ({ data: {} })),
                api.get('/products/my-shop').catch(() => ({ data: {} }))
            ]);

            if (profileRes.data?.success) setShopData(profileRes.data.data);
            const orders = orderRes.data?.success ? orderRes.data.data : [];
            const products = productRes.data?.success ? productRes.data.data : [];
            
            setRecentOrders(orders.slice(0, 6));
            setLowStockItems(products.filter(p => p.stock <= (p.lowStockThreshold || 10)));
            setLastSynced(new Date().toLocaleTimeString());

            setStats({
                totalSKUs: products.length,
                pending: orders.filter(o => o.status === 'Pending').length,
                processing: orders.filter(o => ['Accepted', 'Ready', 'Out for Delivery'].includes(o.status)).length,
                totalDelivered: orders.filter(o => o.status === 'Delivered').length,
                walletBalance: profileRes.data?.data?.wallet?.balance || 0,
                weeklySales: [15, 22, 8, 12, 10, 18, 25] 
            });
        } catch (err) {
            console.error("Dashboard Sync Failed");
        } finally {
            setLoading(false);
        }
    }, []);

    // --- ⚡ Real-time Connectivity ---
    useEffect(() => {
        fetchHubIntel();
        const handleResize = () => {
            const width = window.innerWidth;
            setWindowWidth(width);
            if (width > 1024) setIsSidebarOpen(true);
            else setIsSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        window.addEventListener('focus', fetchHubIntel);

        // Socket logic
        const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
        socket.current = io(socketUrl, { transports: ['websocket'] });
        socket.current.on('connect', () => setIsSocketConnected(true));
        socket.current.on('disconnect', () => setIsSocketConnected(false));

        if (authUser?.id) {
            socket.current.emit('join_shop', authUser.id);
            socket.current.on('new_order_received', (data) => {
                toast.success(`🚀 NEW ORDER: ${data.orderId}`);
                audioPlayer.current.play().catch(() => {});
                fetchHubIntel();
            });
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('focus', fetchHubIntel);
            socket.current.disconnect();
        };
    }, [fetchHubIntel, authUser?.id]);

    if (loading) return (
        <div style={loaderContainer}>
            <div className="custom-spinner" style={{ borderTopColor: themeColor }}></div>
            <p style={{marginTop:'15px', fontWeight:'700', color:'#64748b'}}>SYNCHRONIZING HUB...</p>
        </div>
    );

    return (
        <div style={shellS}>
            {/* ✅ Header */}
            <ShopHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div style={layoutFlex}>
                {/* ✅ Sidebar (Blur Fix Integrated) */}
                <ShopSidebar 
                    isOpen={isSidebarOpen} 
                    closeSidebar={() => setIsSidebarOpen(false)} 
                />

                {/* ✅ Main Content Area */}
                <main style={mainAreaStyle(isSidebarOpen, isMobile)}>
                    <div style={contentCard(isMobile)}>
                        
                        {/* Status Bar */}
                        <div style={topIndicatorRow}>
                            <div style={badgeItem}>
                                <span style={isSocketConnected ? dotActive : dotInactive}></span> 
                                <small>NODE: <b>{isSocketConnected ? 'LIVE' : 'SYNCING'}</b></small>
                            </div>
                            <div style={badgeItem}>
                                <small>HUB_ID: <b>{shopData?.generatedId || 'OFFLINE'}</b></small>
                            </div>
                            {!isMobile && (
                                <div style={badgeItem}>
                                    <small>LAST SYNC: <b>{lastSynced}</b></small>
                                </div>
                            )}
                            <div style={walletBadge(themeColor, isMobile)}>
                                WALLET: <b>₹{stats.walletBalance.toLocaleString('en-IN')}</b>
                            </div>
                        </div>

                        {/* Module Viewport */}
                        <div style={fadeAnim}>
                            <Suspense fallback={<div style={{padding:'40px', textAlign:'center'}}>Loading Module...</div>}>
                                <Routes>
                                    <Route index element={<Navigate to="overview" replace />} />
                                    <Route path="overview" element={<Overview stats={stats} shop={shopData} lowStockItems={lowStockItems} themeColor={themeColor} />} />
                                    <Route path="products" element={<ProductManager />} />
                                    <Route path="orders" element={<OrderManager />} />
                                    <Route path="staff" element={<StaffManager shop={shopData} />} />
                                    <Route path="docs" element={<ShopDocuments shop={shopData} />} />
                                    <Route path="profile" element={<ShopProfile shop={shopData} />} />
                                    <Route path="earnings" element={<EarningsManager />} />
                                    <Route path="settings" element={<ShopSettings shop={shopData} />} />
                                    <Route path="support" element={<ShopSupport />} />
                                </Routes>
                            </Suspense>
                        </div>

                        <ShopFooter siteName={branding?.siteName} />
                    </div>
                </main>
            </div>

            <style>{`
                .custom-spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid ${themeColor}; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

// --- Internal Hub Components ---

const Overview = ({ stats, shop, lowStockItems, themeColor }) => {
    const chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ label: 'Network Revenue', data: stats.weeklySales, backgroundColor: themeColor, borderRadius: 6 }]
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div style={{ marginBottom: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
                    📍 {shop?.shopDetails?.shopName?.toUpperCase() || 'MY HUB'}
                </h2>
                <p style={{ color: '#64748b', fontSize: '13px', marginTop: '5px', fontWeight: '500' }}>Strategic oversight and neural performance audit.</p>
            </div>
            
            <div style={statsGrid}>
                <StatCard color="#10b981" label="SUCCESSFUL" val={stats.totalDelivered} icon="✅" />
                <StatCard color={themeColor} label="PENDING" val={stats.pending} icon="🔔" />
                <StatCard color="#f59e0b" label="PROCESSING" val={stats.processing} icon="⚙️" />
                <StatCard color="#6366f1" label="INVENTORY" val={stats.totalSKUs} icon="📋" />
            </div>

            <div style={analyticsGrid}>
                <div style={cardBox}>
                    <h3 style={sectionTitle}>Revenue Trajectory</h3>
                    <div style={{ height: '280px', marginTop: '20px' }}><Bar data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
                </div>
                <div style={cardBox}>
                    <h3 style={sectionTitle}>Critical Alerts</h3>
                    <div style={{ marginTop: '20px' }}>
                        {lowStockItems.length > 0 ? lowStockItems.map(item => (
                            <div key={item._id} style={feedItem}>
                                <div style={{flex:1, fontWeight:'800', fontSize:'13px'}}>{item.name}</div>
                                <b style={{color:'#ef4444', fontSize:'12px'}}>{item.stock} LEFT</b>
                            </div>
                        )) : <div style={{textAlign:'center', padding:'30px', color:'#94a3b8', fontSize:'12px'}}>All systems optimal.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ color, label, val, icon }) => (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '24px', borderTop: `5px solid ${color}`, boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <small style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing:'1px' }}>{label}</small>
            <span style={{fontSize:'18px'}}>{icon}</span>
        </div>
        <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '900', color: '#1e293b' }}>{val}</h2>
    </div>
);

// --- Strategic Visual Engine Styles ---

const shellS = { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' };
const layoutFlex = { display: 'flex', flex: 1, marginTop: '85px' };

const mainAreaStyle = (isOpen, isMobile) => ({
    flex: 1,
    marginLeft: isMobile ? '0' : (isOpen ? '280px' : '0'),
    transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    minHeight: 'calc(100vh - 85px)',
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden'
});

const contentCard = (isMobile) => ({
    flex: 1, backgroundColor: '#ffffff', 
    margin: '0px', 
    padding: isMobile ? '20px' : '25px 40px 40px',
    borderRadius: !isMobile ? '30px 0 0 0' : '0px',
    borderLeft: !isMobile ? '1px solid #f1f5f9' : 'none',
    boxShadow: !isMobile ? '-10px 0 30px rgba(0,0,0,0.02)' : 'none'
});

const topIndicatorRow = { display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid #f8fafc', paddingBottom: '15px' };
const badgeItem = { background: '#f8fafc', padding: '8px 16px', borderRadius: '12px', fontSize: '10px', fontWeight: '800', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #f1f5f9' };
const walletBadge = (color, isMobile) => ({ ...badgeItem, background: color, color: '#fff', marginLeft: isMobile ? '0' : 'auto', border:'none' });

const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' };
const analyticsGrid = { display: 'grid', gridTemplateColumns: window.innerWidth < 1100 ? '1fr' : '2fr 1.2fr', gap: '25px', marginTop: '30px' };
const cardBox = { background: '#fff', padding: '25px', borderRadius: '28px', border: '1px solid #f1f5f9' };
const sectionTitle = { fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', margin: 0, letterSpacing:'1px' };
const feedItem = { display: 'flex', padding: '14px', borderRadius: '16px', background: '#f8fafc', marginBottom: '10px', border: '1px solid #f1f5f9' };
const loaderContainer = { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fff' };
const dotActive = { width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' };
const dotInactive = { ...dotActive, background: '#cbd5e1', boxShadow: 'none' };
const fadeAnim = { animation: 'fadeIn 0.5s ease' };

export default ShopDashboard;