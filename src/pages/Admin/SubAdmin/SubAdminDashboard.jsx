// src/pages/Admin/SubAdmin/SubAdminDashboard.jsx

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useBranding } from '../../../context/BrandingContext';

// --- Layout Components ---
import SubAdminHeader from '../../../components/Admin/SubAdmin/SubAdminHeader';
import SubAdminSidebar from '../../../components/Admin/SubAdmin/SubAdminSidebar';

// --- Lazy Modules (Sub-Admin Specific) ---
const SubAdminOverview = lazy(() => import('./SubAdminOverview'));
const GlobalMerchantQueue = lazy(() => import('./Management/GlobalMerchantQueue'));
const MerchantAuditView = lazy(() => import('./Management/MerchantAuditView'));
const MasterResolutionCenter = lazy(() => import('./Disputes/MasterResolutionCenter'));
const PlatformHealth = lazy(() => import('./Infrastructure/PlatformHealth'));
const StateAdminAudit = lazy(() => import('./Performance/StateAdminAudit'));

// --- Shared Modules (Imported from System Admin Folders) ---
const GlobalInventory = lazy(() => import('../../SystemAdmin/InventoryHub/MasterCatalog/GlobalInventory'));
const MerchantPayouts = lazy(() => import('../../SystemAdmin/FinancialHub/Payouts/MerchantPayouts'));
const BroadcastCenter = lazy(() => import('../../SystemAdmin/SupportCenter/BroadcastSystem/BroadcastCenter'));
const AuditLogs = lazy(() => import('../../SystemAdmin/Infrastructure/AuditTrail/AuditLogs'));
const SystemUsers = lazy(() => import('../../SystemAdmin/Infrastructure/AuditTrail/SystemUsers'));

const SubAdminDashboard = () => {
    const { settings } = useBranding();
    const location = useLocation();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // स्क्रीन साइज़ मैनेजमेंट
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth > 1024) setIsSidebarOpen(true);
            else setIsSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const activeTab = location.pathname.split('/').pop() || 'overview';
    const themeColor = settings?.themeColor || '#0f172a';

    return (
        <div style={shellS}>
            {/* 1. मास्टर हेडर */}
            <SubAdminHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <div style={layoutFlex}>
                {/* 2. मास्टर साइडबार */}
                <SubAdminSidebar 
                    activeTab={activeTab} 
                    setTab={(tab) => navigate(`/sub-admin/${tab}`)} 
                    isOpen={isSidebarOpen}
                    closeSidebar={() => setIsSidebarOpen(false)}
                />
                
                {/* 3. मुख्य कंटेंट एरिया (साफ़ और व्यवस्थित) */}
                <main style={mainContentArea(isSidebarOpen, windowWidth <= 1024)}>
                    <div style={contentCard}>
                        
                        {/* ✅ पेज का सबसे ऊपरी हिस्सा: ब्रेडक्रंब और टाइटल */}
                        <div style={pageHeaderS}>
                            <div style={breadcrumb}>
                                <span style={dot(themeColor)}></span>
                                <small style={protocolTxt}>CLUSTER_OPERATIONS_NODE</small>
                            </div>
                            <h2 style={titleText}>{activeTab.replace('-', ' ').toUpperCase()}</h2>
                        </div>

                        {/* ✅ राउटिंग इंजन (लोडर के साथ) */}
                        <Suspense fallback={<div style={loadingArea}>ESTABLISHING SECURE CONNECTION...</div>}>
                            <Routes>
                                <Route index element={<Navigate to="overview" replace />} />
                                
                                {/* इंटेलिजेंस और डैशबोर्ड */}
                                <Route path="overview" element={<SubAdminOverview />} />
                                
                                {/* मर्चेंट मैनेजमेंट */}
                                <Route path="shops-queue" element={<GlobalMerchantQueue />} />
                                <Route path="shops/manage/:id" element={<MerchantAuditView />} />
                                
                                {/* ऑपरेशन्स */}
                                <Route path="users" element={<SystemUsers />} />
                                <Route path="inventory" element={<GlobalInventory />} />
                                <Route path="payouts" element={<MerchantPayouts />} />
                                <Route path="disputes" element={<MasterResolutionCenter />} />
                                
                                {/* गवर्नेंस और सपोर्ट */}
                                <Route path="broadcast" element={<BroadcastCenter />} />
                                <Route path="health" element={<PlatformHealth />} />
                                <Route path="logs" element={<AuditLogs />} />
                                <Route path="state-audit" element={<StateAdminAudit />} />

                                {/* फ़ॉलबैक */}
                                <Route path="*" element={<Navigate to="overview" replace />} />
                            </Routes>
                        </Suspense>
                    </div>
                </main>
            </div>

            {/* ग्लोबल एनिमेशन */}
            <style>{`
                .fade-in { animation: fadeIn 0.4s ease-in; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};

// --- एंटरप्राइज सिस्टम स्टाइल्स (ZERO GAPS) ---

const shellS = { 
    display: 'flex', 
    flexDirection: 'column', 
    minHeight: '100vh', 
    backgroundColor: '#f8fafc' 
};

const layoutFlex = { 
    display: 'flex', 
    flex: 1, 
    marginTop: '85px' // हेडर की ऊँचाई
};

const mainContentArea = (isOpen, isMobile) => ({
    flex: 1, 
    // डेस्कटॉप पर साइडबार की जगह छोड़ना, मोबाइल पर नहीं
    marginLeft: isMobile ? '0px' : (isOpen ? '260px' : '0px'),
    transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    minHeight: 'calc(100vh - 85px)',
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    backgroundColor: '#f8fafc'
});

const contentCard = {
    flex: 1,
    backgroundColor: '#ffffff', 
    padding: '25px 35px 35px 35px',
    borderRadius: window.innerWidth > 1024 ? '35px 0 0 0' : '0px',
    boxShadow: '-10px 0 40px rgba(0,0,0,0.03)',
    borderLeft: '1px solid #f1f5f9',
    margin: '0px'
};

const pageHeaderS = { 
    marginBottom: '25px', 
    paddingBottom: '15px', 
    borderBottom: '1px solid #f8fafc',
    marginTop: '0px' // बिल्कुल ऊपर से शुरू होगा
};

const breadcrumb = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    marginBottom: '4px' 
};

const dot = (c) => ({ 
    width: '8px', 
    height: '8px', 
    backgroundColor: c, 
    borderRadius: '50%', 
    boxShadow: `0 0 8px ${c}` 
});

const protocolTxt = { 
    letterSpacing: '1.2px', 
    fontWeight: '900', 
    color: '#cbd5e1', 
    fontSize: '10px' 
};

const titleText = { 
    margin: 0, 
    fontSize: '24px', 
    fontWeight: '900', 
    color: '#0f172a', 
    letterSpacing: '-0.5px' 
};

const loadingArea = { 
    padding: '100px', 
    textAlign: 'center', 
    fontWeight: '800', 
    color: '#cbd5e1', 
    letterSpacing: '2px', 
    fontSize: '12px' 
};

export default SubAdminDashboard;