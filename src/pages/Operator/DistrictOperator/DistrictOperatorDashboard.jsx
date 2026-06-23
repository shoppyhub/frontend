import React, { useState, useEffect, Suspense, lazy } from 'react';

// --- [1] Context Hooks ---
// DistrictOperator -> Operator -> pages -> src (3 बार पीछे)
import { useAuth } from '../../../context/AuthContext';
import { useBranding } from '../../../context/BrandingContext';

// --- [2] Layout Components ---
// DistrictOperator -> Operator -> pages -> components (3 बार पीछे)
import DistrictOperatorHeader from '../../../components/Operator/DistrictOperator/DistrictOperatorHeader';
import DistrictOperatorSidebar from '../../../components/Operator/DistrictOperator/DistrictOperatorSidebar';
import DistrictOperatorFooter from '../../../components/Operator/DistrictOperator/DistrictOperatorFooter';

// --- [3] Operational Modules (Relative Paths Updated) ---
// सुधार: चूंकि ये फोल्डर्स इसी फोल्डर के अंदर हैं, इसलिए './' का उपयोग करें
const OperatorOverview = lazy(() => import('./OperatorOverview'));
const ActiveHubs = lazy(() => import('./Commerce/ActiveHubs'));
const MyActivityLog = lazy(() => import('./Performance/MyActivityLog'));
const AuditReports = lazy(() => import('./TaskManagement/AuditReports'));
const OperatorProfile = lazy(() => import('./Profile/OperatorProfile'));

// अतिरिक्त मॉड्यूल्स (TaskManagement के अंदर)
const UrgentTickets = lazy(() => import('./TaskManagement/UrgentTickets'));
const VerificationQueue = lazy(() => import('./TaskManagement/VerificationQueue'));

// --- [4] Administrative Shared Modules (2 बार पीछे) ---
const ShopVerification = lazy(() => import('../../DistrictAdmin/ShopManagement/ShopVerification'));
const DistrictOrders = lazy(() => import('../../DistrictAdmin/Logistics/DistrictOrders'));
const Helpdesk = lazy(() => import('../../DistrictAdmin/Support/Helpdesk'));

const DistrictOperatorDashboard = () => {
    const { user } = useAuth();
    const { settings } = useBranding();
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    const districtName = user?.district || "Unknown District";

    // 📱 Responsive Sidebar Handler
    useEffect(() => {
        const handleResize = () => setIsSidebarOpen(window.innerWidth > 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const renderView = () => {
        switch (activeTab) {
            case 'overview': return <OperatorOverview />;
            case 'audit': return <ShopVerification districtName={districtName} />;
            case 'shops': return <ActiveHubs />;
            case 'orders': return <DistrictOrders />;
            case 'helpdesk': return <Helpdesk />;
            case 'activity': return <MyActivityLog />;
            case 'reports': return <AuditReports />;
            case 'profile': return <OperatorProfile />;
            case 'urgent': return <UrgentTickets />;
            case 'queue': return <VerificationQueue />;
            default: return <OperatorOverview />;
        }
    };

    const themeColor = settings?.themeColor || '#0d9488';

    return (
        <div style={shellS}>
            <DistrictOperatorHeader districtName={districtName} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div style={bodyS}>
                <DistrictOperatorSidebar activeTab={activeTab} setTab={setActiveTab} isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
                <main style={mainS(isSidebarOpen)}>
                    <div style={contentWrap}>
                        <div style={{...breadcrumbS, borderLeftColor: themeColor}}>
                            <small style={{color: themeColor, fontWeight:'800'}}>OPERATIONAL UNIT</small>
                            <h3 style={tabTitle}>{activeTab.replace('-', ' ').toUpperCase()}</h3>
                        </div>

                        <div style={fadeAnim}>
                            <Suspense fallback={<div style={loadingS}>Synchronizing District Node...</div>}>
                                {renderView()}
                            </Suspense>
                        </div>
                    </div>
                    <DistrictOperatorFooter />
                </main>
            </div>
        </div>
    );
};

// --- Styles ---
const shellS = { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const bodyS = { display: 'flex', flex: 1, marginTop: '80px' };
const mainS = (open) => ({
    flex: 1, marginLeft: window.innerWidth > 1024 ? (open ? '280px' : '0') : '0',
    transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)', position: 'relative'
});
const contentWrap = { flex: 1, padding: window.innerWidth < 768 ? '25px' : '40px', boxSizing: 'border-box' };
const breadcrumbS = { marginBottom: '35px', borderLeft: '4px solid', paddingLeft: '20px' };
const tabTitle = { margin: '5px 0 0 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' };
const loadingS = { padding: '100px 0', textAlign: 'center', color: '#94a3b8', fontWeight: '700', letterSpacing: '1px' };
const fadeAnim = { animation: 'fadeIn 0.5s ease-out' };

export default DistrictOperatorDashboard;