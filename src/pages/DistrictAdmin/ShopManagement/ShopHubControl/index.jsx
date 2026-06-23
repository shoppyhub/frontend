import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import { useBranding } from '../../../../context/BrandingContext';
import { useAuth } from '../../../../context/AuthContext';

// Import Modular Tabs
import HubProfile from './tabs/HubProfile';
import KYCCompliance from './tabs/KYCCompliance';
import Performance from './tabs/Performance';
import Financials from './tabs/Financials';
import SecurityControl from './tabs/SecurityControl';
import EditHub from './tabs/EditHub';

/**
 * RKD MART - ULTIMATE SHOP HUB CONTROL (FULL PAGE VIEW)
 * हेडर पट्टी हटा दी गई है ताकि कंटेंट फुल स्क्रीन में दिखे।
 */
const ShopHubControl = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: districtAdmin } = useAuth();
    const { settings } = useBranding();
    const themeColor = settings?.themeColor || '#0d9488';

    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');

    // 1. 📡 डाटा सिन्क्रोनाइज़ेशन
    const fetchFullAudit = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/shops/audit/${id}`);
            if (res.data.success) {
                setShop(res.data.data);
            }
        } catch (err) {
            toast.error("Registry Connection Failed.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchFullAudit();
    }, [fetchFullAudit]);

    // 2. 🔐 परमिशन्स लॉजिक
    const perms = useMemo(() => ({
        canViewProfile: districtAdmin?.permissions?.canViewProfile ?? true,
        canViewKYC: districtAdmin?.permissions?.canViewKYC ?? true,
        canViewPerformance: districtAdmin?.permissions?.canViewPerformance ?? true,
        canViewFinancials: districtAdmin?.permissions?.canViewFinancials ?? true,
        canManageSecurity: districtAdmin?.permissions?.canManageSecurity ?? true,
        canEditHub: districtAdmin?.permissions?.canEditHub ?? true,
        canSuspend: districtAdmin?.permissions?.canSuspendShop ?? true
    }), [districtAdmin]);

    // 3. 🛠️ पासवर्ड रीसेट
    const handleResetPassword = async () => {
        const confirm = window.prompt("Type 'RESET' to confirm:");
        if (confirm !== 'RESET') return;
        try {
            const res = await api.put(`/admin/users/reset-password/${id}`, { 
                newPassword: "RKD" + Math.floor(100000 + Math.random() * 900000) 
            });
            if (res.data.success) toast.success("Key Rotated: " + res.data.tempPass);
        } catch (err) { toast.error("Override Failed."); }
    };

    if (loading) return (
        <div style={fullLoaderS}>
            <div className="pro-spinner"></div>
            <p>LOADING HUB DATA MATRIX...</p>
        </div>
    );

    if (!shop) return <div style={fullLoaderS}>NODE_NOT_FOUND</div>;

    return (
        <div style={rootContainerS}>
            
            {/* --- NAVIGATION TABS (Starts from Top) --- */}
            <div style={tabBarS}>
                <button onClick={() => navigate(-1)} style={backBtnS}>← BACK</button>
                <div style={{display:'flex', gap:'8px'}}>
                    {perms.canViewProfile && <TabBtn id="profile" label="PROFILE" active={activeTab} set={setActiveTab} icon="🏢" />}
                    {perms.canViewKYC && <TabBtn id="kyc" label="KYC" active={activeTab} set={setActiveTab} icon="🛡️" />}
                    {perms.canViewPerformance && <TabBtn id="performance" label="ANALYTICS" active={activeTab} set={setActiveTab} icon="📊" />}
                    {perms.canViewFinancials && <TabBtn id="financials" label="FINANCE" active={activeTab} set={setActiveTab} icon="💰" />}
                    {perms.canManageSecurity && <TabBtn id="security" label="SECURITY" active={activeTab} set={setActiveTab} icon="🔐" />}
                    {perms.canEditHub && <TabBtn id="edit" label="EDIT" active={activeTab} set={setActiveTab} icon="📝" />}
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div style={contentAreaS}>
                <div className="fade-in">
                    {activeTab === 'profile' && <HubProfile shop={shop} />}
                    {activeTab === 'kyc' && <KYCCompliance shop={shop} canApprove={districtAdmin?.permissions?.canApproveKYC} />}
                    {activeTab === 'performance' && <Performance stats={shop.stats} theme={themeColor} />}
                    {activeTab === 'financials' && <Financials shop={shop} theme={themeColor} />}
                    {activeTab === 'security' && <SecurityControl shop={shop} canSuspend={perms.canSuspend} onReset={handleResetPassword} refresh={fetchFullAudit} />}
                    {activeTab === 'edit' && <EditHub shop={shop} refresh={fetchFullAudit} theme={themeColor} />}
                </div>
            </div>

            <style>{`
                .pro-spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top-color: ${themeColor}; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .fade-in { animation: fadeIn 0.3s ease-in; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

// --- Tab Button Component ---
const TabBtn = ({ id, label, active, set, icon }) => (
    <button onClick={() => set(id)} style={id === active ? activeTabS : tabS}>
        <span>{icon}</span> {label}
    </button>
);

// --- CSS STYLES ---
const rootContainerS = { padding:'0px', background:'#f8fafc', minHeight:'100vh', fontFamily:"'Plus Jakarta Sans', sans-serif" };

const tabBarS = { 
    display:'flex', 
    justifyContent:'space-between', 
    alignItems:'center', 
    marginBottom:'20px', 
    background:'#fff', 
    padding:'10px 20px', 
    borderRadius:'20px', 
    boxShadow:'0 4px 15px rgba(0,0,0,0.02)',
    border:'1px solid #f1f5f9'
};

const backBtnS = { 
    background:'#f8fafc', 
    border:'1px solid #e2e8f0', 
    padding:'8px 15px', 
    borderRadius:'12px', 
    cursor:'pointer', 
    fontWeight:'800', 
    fontSize:'11px', 
    color:'#64748b' 
};

const tabS = { 
    padding:'10px 18px', 
    borderRadius:'12px', 
    border:'none', 
    background:'none', 
    color:'#64748b', 
    fontWeight:'700', 
    cursor:'pointer', 
    display:'flex', 
    alignItems:'center', 
    gap:'8px', 
    fontSize:'12px', 
    transition:'0.2s' 
};

const activeTabS = { 
    ...tabS, 
    background:'#0f172a', 
    color:'#fff', 
    boxShadow:'0 8px 15px rgba(0,0,0,0.1)' 
};

const contentAreaS = { 
    background:'#fff', 
    borderRadius:'25px', 
    padding:'30px', 
    border:'1px solid #f1f5f9', 
    boxShadow:'0 10px 30px rgba(0,0,0,0.02)', 
    minHeight:'calc(100vh - 120px)' 
};

const fullLoaderS = { 
    height:'90vh', 
    display:'flex', 
    flexDirection:'column', 
    justifyContent:'center', 
    alignItems:'center', 
    gap:'15px', 
    fontWeight:'900', 
    color:'#94a3b8', 
    fontSize:'12px' 
};

export default ShopHubControl;