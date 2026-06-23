import React, { useEffect, Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useBranding } from './context/BrandingContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * --- [1] STATIC IMPORTS ---
 */
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CustomerHome from './pages/Customer/CustomerHome';

/**
 * --- [2] LAZY IMPORTS ---
 */
const Register = lazy(() => import('./pages/Register'));
const CustomerRegister = lazy(() => import('./pages/Customer/CustomerRegister'));
const ShopView = lazy(() => import('./pages/Customer/ShopView'));
const Cart = lazy(() => import('./pages/Customer/Cart'));
const CustomerOrders = lazy(() => import('./pages/Customer/Orders/CustomerOrders'));
const Checkout = lazy(() => import('./pages/Customer/Checkout/Checkout'));
const SearchResults = lazy(() => import('./pages/Customer/SearchResults'));
const ProductDetail = lazy(() => import('./pages/Customer/ProductDetail'));
const NearbyShops = lazy(() => import('./pages/Customer/NearbyShops'));
const CustomerProfile = lazy(() => import('./pages/Customer/CustomerProfile'));
const CustomerHelp = lazy(() => import('./pages/Customer/CustomerHelp'));
const AddressBook = lazy(() => import('./pages/Customer/AddressBook'));
const UserWallet = lazy(() => import('./pages/Customer/UserWallet'));
const ReferAndEarn = lazy(() => import('./pages/Customer/ReferAndEarn'));
const EditIdentity = lazy(() => import('./pages/Customer/EditIdentity'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const TrackApplication = lazy(() => import('./pages/TrackApplication'));

const SystemAdminDashboard = lazy(() => import('./pages/SystemAdmin/Dashboard/SystemAdminDashboard'));
const SubAdminDashboard = lazy(() => import('./pages/Admin/SubAdmin/SubAdminDashboard'));
const DistrictAdminDashboard = lazy(() => import('./pages/DistrictAdmin/DistrictAdminDashboard'));
const StateAdminDashboard = lazy(() => import('./pages/StateAdmin/StateAdminDashboard'));
const ShopDashboard = lazy(() => import('./pages/ShopOwner/ShopDashboard'));
const StaffDashboard = lazy(() => import('./pages/Staff/StaffDashboard'));
const OperatorDashboard = lazy(() => import('./pages/Operator/DistrictOperator/DistrictOperatorDashboard'));

// ✅ NEW IMPORT: Shop Hub Control (View & Manage Page)
const ShopHubControl = lazy(() => import('./pages/DistrictAdmin/ShopManagement/ShopHubControl'));

const MobileBottomNav = lazy(() => import('./components/Customer/MobileBottomNav'));

/**
 * 🛰️ Pro-Level Infrastructure Loader
 */
const ProLoader = () => {
  const { settings } = useBranding();
  const themeColor = settings?.themeColor || '#0f172a';
  return (
    <div style={globalLoaderS}>
      <div className="pro-spinner" style={{ borderTopColor: themeColor }}></div>
      <p style={loaderTextS}>SYNCHRONIZING INFRASTRUCTURE...</p>
    </div>
  );
};

/**
 * 🛡️ Strategic Home Redirection Node
 */
const HomeRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return <ProLoader />;

  if (!isAuthenticated) return <CustomerHome />;
  if (user?.role === 'Customer') return <CustomerHome />;

  const rolePaths = {
    'SystemAdmin': '/admin',
    'SubSystemAdmin': '/sub-admin',
    'StateAdmin': '/state-admin',
    'DistrictAdmin': '/district-admin',
    'DistrictOperator': '/operator-dashboard',
    'StateOperator': '/operator-dashboard',
    'ShopOwner': '/shop-dashboard',
    'Staff': '/staff-dashboard'
  };

  return <Navigate to={rolePaths[user?.role] || '/'} replace />;
};

/**
 * 🔐 Protected Route Guard
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <ProLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * 🔓 Public Route Guard
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <ProLoader />;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

/**
 * 📜 Scroll Recovery & Dynamic Metadata
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const { settings } = useBranding();
  useEffect(() => {
    window.scrollTo(0, 0);
    const siteTitle = settings.siteName || 'RKD MART';
    const pageName = pathname === '/' ? 'Home' : pathname.split('/')[1].toUpperCase().replace('-', ' ');
    document.title = `${siteTitle} | ${pageName}`;
  }, [pathname, settings.siteName]);
  return null;
};

/**
 * 🏗️ Master App Shell Layout
 */
const AppLayout = ({ children }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const dashPaths = [
    '/admin', '/sub-admin', '/state-admin', 
    '/district-admin', '/shop-dashboard', 
    '/staff-dashboard', '/operator-dashboard'
  ];
  
  const isDashboard = dashPaths.some(p => location.pathname.startsWith(p));

  const getPaddingTop = () => {
    if (isDashboard) return '0px';
    const path = location.pathname;
    const isAuthPage = ['/login', '/register', '/customer-register'].includes(path);
    if (isAuthPage) return isMobile ? '145px' : '105px'; 
    const hasCategoryBar = ['/', '/search', '/nearby-shops'].includes(path);
    if (hasCategoryBar) return isMobile ? '180px' : '125px';
    return isMobile ? '100px' : '95px';
  };

  return (
    <div className={`rkd-main-shell ${isDashboard ? 'dashboard-mode' : 'public-mode'}`}
      style={{
        minHeight: '100vh',
        backgroundColor: isDashboard ? '#fff' : '#f8fafc',
        paddingTop: getPaddingTop(),
        paddingBottom: (!isDashboard && isMobile) ? '80px' : '0px',
        transition: 'padding 0.2s ease',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <main style={{ flex: 1, width: '100%' }}>{children}</main>
      {!isDashboard && (
        <Suspense fallback={null}>
          <MobileBottomNav />
        </Suspense>
      )}
    </div>
  );
};

function App() {
  const { settings } = useBranding();

  useEffect(() => {
    if (settings?.themeColor) {
      document.documentElement.style.setProperty('--primary-theme', settings.themeColor);
    }
  }, [settings]);

  if (settings.loading) return <ProLoader />;

  return (
    <Router>
      <ScrollToTop />
      <ToastContainer position="top-right" theme="colored" autoClose={1500} limit={2} />
      
      <AppLayout>
        <Suspense fallback={<ProLoader />}>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            
            {/* Public */}
            <Route path="/search" element={<SearchResults />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/nearby-shops" element={<NearbyShops />} />
            <Route path="/shop/:shopId" element={<ShopView />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/track" element={<TrackApplication />} />
            
            {/* Auth */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/customer-register" element={<PublicRoute><CustomerRegister /></PublicRoute>} />

            {/* Private Customer */}
            <Route path="/checkout" element={<ProtectedRoute allowedRoles={['Customer']}><Checkout /></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute allowedRoles={['Customer']}><CustomerOrders /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><CustomerProfile /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><UserWallet /></ProtectedRoute>} />
            <Route path="/refer-earn" element={<ProtectedRoute><ReferAndEarn /></ProtectedRoute>} />
            <Route path="/address-book" element={<ProtectedRoute><AddressBook /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><CustomerHelp /></ProtectedRoute>} />
            <Route path="/edit-identity" element={<ProtectedRoute><EditIdentity /></ProtectedRoute>} />

            {/* Private Dashboards */}
            <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['SystemAdmin']}><SystemAdminDashboard /></ProtectedRoute>} />
            <Route path="/sub-admin/*" element={<ProtectedRoute allowedRoles={['SubSystemAdmin']}><SubAdminDashboard /></ProtectedRoute>} />
            <Route path="/state-admin/*" element={<ProtectedRoute allowedRoles={['StateAdmin']}><StateAdminDashboard /></ProtectedRoute>} />
            <Route path="/district-admin/*" element={<ProtectedRoute allowedRoles={['DistrictAdmin']}><DistrictAdminDashboard /></ProtectedRoute>} />
            <Route path="/operator-dashboard/*" element={<ProtectedRoute allowedRoles={['StateOperator', 'DistrictOperator']}><OperatorDashboard /></ProtectedRoute>} />
            <Route path="/shop-dashboard/*" element={<ProtectedRoute allowedRoles={['ShopOwner']}><ShopDashboard /></ProtectedRoute>} />
            <Route path="/staff-dashboard/*" element={<ProtectedRoute allowedRoles={['Staff']}><StaffDashboard /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppLayout>

      <style>{`
          .pro-spinner { width: 45px; height: 45px; border: 4px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .dashboard-mode { padding-top: 0 !important; }
          .public-mode { transition: all 0.3s ease; }
      `}</style>
    </Router>
  );
}

const globalLoaderS = { height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#fff' };
const loaderTextS = { marginTop: '20px', fontWeight: '800', color: '#94a3b8', letterSpacing: '1px', fontSize: '11px' };

export default App;