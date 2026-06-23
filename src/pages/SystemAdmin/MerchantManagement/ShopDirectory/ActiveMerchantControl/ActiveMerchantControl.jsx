import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../../../services/api';
import { useBranding } from '../../../../../context/BrandingContext';

// Import Modular Tabs (System Admin Special)
import HubOverview from './tabs/HubOverview';
import FinancialCommand from './tabs/FinancialCommand';
import InventoryControl from "./tabs/InventoryPriceControl";
import StaffMonitor from './tabs/StaffManagement';
import SecurityVault from './tabs/SecurityNode';
import NodeSettings from './tabs/InfrastructureSettings';
import KYCCompliance from './tabs/kyc';

const ActiveMerchantControl = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useBranding();
    const themeColor = settings?.themeColor || '#0f172a';

    const [merchant, setMerchant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // 📡 Global Hub Synchronization
    const fetchFullHubData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/shops/audit/${id}`);
            if (res.data.success) {
                setMerchant(res.data.data);
            }
        } catch (err) {
            toast.error("Cluster Handshake Failed.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchFullHubData();
    }, [fetchFullHubData]);

    if (loading) return <div style={loaderS}>⚙️ INITIALIZING COMMAND CENTER...</div>;
    if (!merchant) return <div style={loaderS}>NODE_OFFLINE_OR_NOT_FOUND</div>;

    return (
        <div style={rootContainerS}>
            {/* --- TOP CONTROL BAR --- */}
            <div style={tabBarS}>
                <button onClick={() => navigate('/admin/shops')} style={backBtnS}>← REGISTRY</button>
                <div style={tabGroupS}>
                    <TabBtn id="overview" label="OVERVIEW" active={activeTab} set={setActiveTab} icon="📊" />
                     <TabBtn id="kyc" label="KYC_DOCS" active={activeTab} set={setActiveTab} icon="🛡️" />
                    <TabBtn id="financial" label="FINANCIALS" active={activeTab} set={setActiveTab} icon="💰" />
                    <TabBtn id="inventory" label="INVENTORY" active={activeTab} set={setActiveTab} icon="🛒" />
                    <TabBtn id="staff" label="STAFF" active={activeTab} set={setActiveTab} icon="👥" />
                    <TabBtn id="security" label="SECURITY" active={activeTab} set={setActiveTab} icon="🔐" />
                    <TabBtn id="settings" label="INFRA" active={activeTab} set={setActiveTab} icon="⚙️" />
                </div>
            </div>

            {/* --- ACTIVE COMMAND AREA --- */}
            <div style={contentAreaS}>
                {activeTab === 'overview' && <HubOverview merchant={merchant} theme={themeColor} />}
                {activeTab === 'kyc' && <KYCCompliance merchant={merchant} refresh={fetchFullHubData} />}
                {activeTab === 'financial' && <FinancialCommand merchant={merchant} refresh={fetchFullHubData} />}
                {activeTab === 'inventory' && <InventoryControl merchant={merchant} />}
                {activeTab === 'staff' && (
    <StaffMonitor 
        merchantId={merchant._id} 
        merchantGeneratedId={merchant.generatedId} 
    />
)}
                {activeTab === 'security' && <SecurityVault merchant={merchant} refresh={fetchFullHubData} />}
                {activeTab === 'settings' && <NodeSettings merchant={merchant} refresh={fetchFullHubData} />}
            </div>
        </div>
    );
};

const TabBtn = ({ id, label, active, set, icon }) => (
    <button onClick={() => set(id)} style={id === active ? activeTabS : tabS}>
        <span>{icon}</span> {label}
    </button>
);

// --- Styles ---
const rootContainerS = { padding:'0px', background:'#f8fafc', minHeight:'100vh', fontFamily:"'Plus Jakarta Sans', sans-serif" };
const tabBarS = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px 30px', background:'#fff', borderBottom:'1px solid #f1f5f9', position:'sticky', top:0, zIndex:1000 };
const tabGroupS = { display:'flex', gap:'5px' };
const backBtnS = { background:'#f1f5f9', border:'none', padding:'10px 20px', borderRadius:'12px', fontWeight:'800', fontSize:'11px', cursor:'pointer' };
const tabS = { padding:'12px 20px', borderRadius:'12px', border:'none', background:'none', color:'#94a3b8', fontWeight:'800', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', fontSize:'11px', transition:'0.3s' };
const activeTabS = { ...tabS, background:'#0f172a', color:'#fff', boxShadow:'0 10px 20px rgba(0,0,0,0.1)' };
const contentAreaS = { padding:'30px' };
const loaderS = { height:'90vh', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', color:'#94a3b8', fontSize:'14px', letterSpacing:'2px' };

export default ActiveMerchantControl;