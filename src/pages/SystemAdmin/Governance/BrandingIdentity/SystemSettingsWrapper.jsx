import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../../../services/api';
import { toast } from 'react-toastify';
import { useBranding } from '../../../../context/BrandingContext';
import * as XLSX from 'xlsx';

// --- Sub-Modules Imports (All Paths Verified) ---
import BrandingIdentity from './BrandingIdentity';
import AdvancedBranding from './AdvancedBranding';
import InfrastructureControl from '../../Infrastructure/InfrastructureControl';
import DirectoryRegistry from '../../Infrastructure/DirectoryRegistry';
import GeospatialSync from '../../Infrastructure/GeospatialSync';
import LegalPolicies from '../ContentManagement/LegalPolicies';
import LegalAssetManager from '../LegalAssets/LegalAssetManager';
import TaxFinanceControl from '../../FinancialHub/CommissionModels/TaxFinanceControl';

// ✅ Fixed this path (added HealthMonitor sub-folder)
import MaintenanceBackup from '../../Infrastructure/HealthMonitor/MaintenanceBackup';

const SystemSettingsWrapper = ({ tab }) => {
    const { settings: globalSettings, refreshBranding, updateSettingsImmediate } = useBranding();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(""); 
    const [actionLoading, setActionLoading] = useState(false);
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

    // 1. 🏗️ Master Configuration State
    const [config, setConfig] = useState({
        mobileVerificationEnabled: true,
        emailVerificationEnabled: true,
        enableMerchantMap: true,  
        siteName: "", siteLogo: "", siteFavicon: "",
        supportEmail: "", themeColor: "#0f172a", maintenanceMode: false,
        codEnabled: true, onlinePayEnabled: true, minOrderValue: 0,
        appVersion: "3.1.0", forceUpdate: false,
        standardRate: 5.0, taxOnCommission: 18,
        registrationFeeAmount: 0, featuredAdPrice: 0,
        announcement: "",
        socialLinks: { facebook: '', instagram: '', youtube: '', twitter: '' },
        seo: { metaTitle: '', metaDescription: '', metaKeywords: '' },
        appearance: { primaryColor: '#1e293b', secondaryColor: '#3b82f6', borderRadius: '12px' },
        cms: { aboutUs: '', privacyPolicy: '', termsCondition: '', returnPolicy: '' },
        taxConfig: { gstEnabled: true, defaultGstRate: 18, taxId: '' },
        invoiceConfig: { prefix: 'INV', footerNote: '' }
    });

    const [assets, setAssets] = useState({ signature: '', stamp: '' });
    const [helpConfigs, setHelpConfigs] = useState([{ district: '', number: '' }]);
    const [lastThemeChange, setLastThemeChange] = useState(0); 
    const [banks, setBanks] = useState([]);
    const [shopTypes, setShopTypes] = useState([]);
    const [locations, setLocations] = useState([]);

    // Page Title Helper
    const getPageTitle = useCallback(() => {
        const titles = {
            'branding': 'Global Identity',
            'advanced': 'Aesthetics & Ads',
            'cms': 'Legal Governance',
            'tax': 'Fiscal Parameters',
            'legal': 'Registry Protocol',
            'infra': 'Security Core',
            'master': 'Global Registry',
            'locations': 'Regional Nodes',
            'maintenance': 'Node Recovery'
        };
        return titles[tab] || 'System Hub';
    }, [tab]);

    // 2. 📡 Automatic Infrastructure Data Fetching
    const fetchEcosystemData = useCallback(async () => {
        try {
            const responses = await Promise.allSettled([
                api.get('/admin/directories/banks'),
                api.get('/admin/directories/shop-types'),
                api.get('/admin/directories/locations'),
                api.get('/admin/settings')
            ]);

            if (responses[0].status === 'fulfilled') setBanks(responses[0].value.data.data || []);
            if (responses[1].status === 'fulfilled') setShopTypes(responses[1].value.data.data || []);
            if (responses[2].status === 'fulfilled') setLocations(responses[2].value.data.data || []);
            
            if (responses[3].status === 'fulfilled' && responses[3].value.data.success) {
                const d = responses[3].value.data.data;
                setAssets({ signature: d.signature || '', stamp: d.stamp || '' });
                setHelpConfigs(d.helpConfigs || [{ district: '', number: '' }]);
                
                const isRecentChange = (Date.now() - lastThemeChange) < 10000;
                
                setConfig(prev => ({
                    ...prev, 
                    ...d,
                    themeColor: isRecentChange ? prev.themeColor : (d.themeColor || '#0f172a')
                }));
                
                document.title = `${getPageTitle()} | Control Center`;
            }
            setLastSynced(new Date().toLocaleTimeString());
        } catch (err) { 
            console.error("Infrastructure Handshake Failed"); 
        } finally { 
            setLoading(false); 
        }
    }, [lastThemeChange, getPageTitle]);

    useEffect(() => {
        fetchEcosystemData();
    }, [fetchEcosystemData]);

    const fetchDataRef = useRef(fetchEcosystemData);
    fetchDataRef.current = fetchEcosystemData;
    
    useEffect(() => {
        const handleFocus = () => fetchDataRef.current();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    // 3. 📸 Secure Visual Asset Deployment
    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2000000) return toast.error("Security Policy: Visual asset exceeds 2MB limit.");

        setUploading(field);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            try {
                const res = await api.post('/admin/settings/upload-asset', { image: reader.result, field });
                if (res.data.success) {
                    const url = res.data.url;
                    if (field === 'signature' || field === 'stamp') setAssets(p => ({ ...p, [field]: url }));
                    else setConfig(p => ({ ...p, [field]: url }));
                    
                    toast.success(`Protocol: ${field.toUpperCase()} deployed to cloud vault.`);
                    refreshBranding(); 
                }
            } catch (err) { toast.error("Cloud handshake failed."); }
            finally { setUploading(""); }
        };
    };

    // 4. 🗄️ Excel & Backup
    const handleExcelUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            setUploading("excel");
            try {
                const wb = XLSX.read(event.target.result, { type: 'binary' });
                const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                await api.post('/admin/directories/locations/add', { data });
                toast.success("Geospatial hierarchy synchronized.");
                fetchEcosystemData();
            } catch (err) { toast.error("File integrity check failed."); }
            finally { setUploading(""); }
        };
        reader.readAsBinaryString(file);
    };

    const handleDownloadBackup = async () => {
        try {
            const res = await api.get('/admin/support/backup', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${globalSettings.siteName}_DB_SNAP_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(link);
            link.click();
            toast.success("Registry snapshot archived.");
        } catch (err) { toast.error("Backup protocol failed."); }
    };

    // 5. 💾 Master Save
    const saveAllConfigs = async () => {
        setActionLoading(true);
        try {
            const response = await api.put('/admin/settings/update', { ...config, ...assets, helpConfigs });
            if (response.data.success) {
                toast.success("🚀 Ecosystem policies deployed!");
                updateSettingsImmediate({
                    siteName: config.siteName,
                    siteLogo: config.siteLogo,
                    siteFavicon: config.siteFavicon,
                    themeColor: config.themeColor
                });
                setLastThemeChange(0);
                setTimeout(() => refreshBranding(), 1000);
            }
        } catch (err) { 
            toast.error(err.response?.data?.message || "Sync failure."); 
        } finally { 
            setActionLoading(false); 
        }
    };

    // 🎨 Live Preview
    const handleLiveThemePreview = (newColor) => {
        setLastThemeChange(Date.now());
        setConfig(prev => ({ ...prev, themeColor: newColor }));
        if (updateSettingsImmediate) {
            updateSettingsImmediate({ themeColor: newColor });
        }
    };

    const themeColor = globalSettings?.themeColor || '#0f172a';

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px', fontWeight:'800', color:'#94a3b8'}}>SYNCHRONIZING TERMINAL...</p>
        </div>
    );

    const commonProps = { 
        config, setConfig, assets, setAssets, helpConfigs, setHelpConfigs, 
        banks, shopTypes, locations, handleFileUpload, uploading, 
        fetchData: fetchEcosystemData, handleExcelUpload, handleDownloadBackup,
        handleLiveThemePreview,
        labS, inS, cardS, cardHead, inputGroup 
    };

    return (
        <div style={containerS}>
            <div style={headerFlex}>
                <div style={{flex: 1}}>
                    <h2 style={titleS}>{getPageTitle().toUpperCase()}</h2>
                    <p style={subTitleS}>Managing infrastructure parameters for {globalSettings.siteName}.</p>
                </div>
                <div style={actionRow}>
                    <div style={syncBadge}>
                        <span className="pulse-dot"></span>
                        <small>Auto-Sync: {lastSynced}</small>
                    </div>
                    <button 
                        style={actionLoading ? saveBtnDisabled : saveBtnTop(themeColor)} 
                        onClick={saveAllConfigs} 
                        disabled={actionLoading}
                    >
                        {actionLoading ? 'DEPLOYING...' : '💾 SAVE & DEPLOY PROTOCOL'}
                    </button>
                </div>
            </div>

            <div style={fadeAnimS}>
                {tab === 'branding' && <BrandingIdentity {...commonProps} />}
                {tab === 'advanced' && <AdvancedBranding {...commonProps} />}
                {tab === 'cms' && <LegalPolicies {...commonProps} />}
                {tab === 'tax' && <TaxFinanceControl {...commonProps} />}
                {tab === 'legal' && <LegalAssetManager {...commonProps} />}
                {tab === 'infra' && <InfrastructureControl {...commonProps} />}
                {tab === 'master' && <DirectoryRegistry {...commonProps} />}
                {tab === 'locations' && <GeospatialSync {...commonProps} fetchData={fetchEcosystemData} />}
                {tab === 'maintenance' && <MaintenanceBackup {...commonProps} />}
            </div>

            <style>{`
                .spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; animation: pulse-anim 2s infinite; margin-right: 8px; }
                @keyframes pulse-anim { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Definitions ---
const containerS = { padding: '10px', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerFlex = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'40px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin:0, fontSize:'clamp(20px, 4vw, 28px)', fontWeight:'900', color:'#0f172a', letterSpacing:'-1.5px' };
const subTitleS = { color:'#64748b', fontSize:'14px', marginTop:'5px', fontWeight:'500' };
const actionRow = { display:'flex', gap:'15px', alignItems:'center' };
const syncBadge = { display:'flex', alignItems:'center', background:'#fff', padding:'10px 18px', borderRadius:'15px', border:'1px solid #f1f5f9', color:'#94a3b8', fontSize:'11px', fontWeight:'800' };
const saveBtnTop = (color) => ({ background: color, color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', boxShadow: `0 10px 20px ${color}44`, fontSize: '12px', transition: '0.3s' });
const saveBtnDisabled = { background:'#cbd5e1', color:'#fff', border:'none', padding:'15px 30px', borderRadius:'15px', fontWeight:'900', cursor:'not-allowed' };
const cardS = { background:'#fff', padding: window.innerWidth < 768 ? '25px' : '35px', borderRadius:'40px', border:'1px solid #f1f5f9', boxShadow:'0 10px 30px rgba(0,0,0,0.02)' };
const cardHead = { margin:'0 0 30px 0', fontSize:'14px', fontWeight:'900', color:'#0f172a', borderLeft:'5px solid #2563eb', paddingLeft:'15px', textTransform:'uppercase', letterSpacing:'1px' };
const inputGroup = { marginBottom:'25px' };
const labS = { fontSize:'10px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'10px', display:'block' };
const inS = { width:'100%', padding:'16px', borderRadius:'18px', border:'1.5px solid #f1f5f9', background:'#f8fafc', outline:'none', fontSize:'14px', fontWeight:'700', boxSizing:'border-box', color:'#1e293b' };
const loaderS = { display:'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '60vh', background: '#f8fafc', gap:'20px' };
const fadeAnimS = { animation: 'fadeIn 0.5s ease' };

export default SystemSettingsWrapper;