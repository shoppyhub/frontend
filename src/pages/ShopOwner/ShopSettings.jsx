import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useBranding } from '../../context/BrandingContext'; // Added for White-labeling

const ShopSettings = () => {
    const { settings: adminSettings } = useBranding();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [systemSettings, setSystemSettings] = useState(null); 
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

    const [formData, setFormData] = useState({
        openingTime: '09:00',
        closingTime: '21:00',
        holidayMode: false,
        deliveryPincodes: '',
        storeAddress: ''
    });

    // 1. 📡 Automatic Infrastructure Synchronization (No Buttons)
    const fetchStoreConfig = useCallback(async () => {
        try {
            // Initial load displays spinner, subsequent syncs are silent
            const [profileRes, settingsRes] = await Promise.all([
                api.get('/auth/profile'),
                api.get('/customer/settings')
            ]);

            if (profileRes.data.success) {
                const user = profileRes.data.data;
                setFormData({
                    openingTime: user.shopDetails?.openingTime || '09:00',
                    closingTime: user.shopDetails?.closingTime || '21:00',
                    holidayMode: user.shopDetails?.holidayMode || false,
                    deliveryPincodes: user.shopDetails?.address?.pinCode || '',
                    storeAddress: user.shopDetails?.address?.fullAddress || ''
                });
            }

            if (settingsRes.data.success) {
                setSystemSettings(settingsRes.data.data);
            }
            setLastSynced(new Date().toLocaleTimeString());
            document.title = `Hub Settings | ${adminSettings.siteName}`;
        } catch (err) {
            console.error("Operational sync failed.");
        } finally {
            setLoading(false);
        }
    }, [adminSettings.siteName]);

    useEffect(() => { 
        fetchStoreConfig(); 
        
        // Auto-refresh when returns to focus (SaaS Protocol)
        window.addEventListener('focus', fetchStoreConfig);
        return () => window.removeEventListener('focus', fetchStoreConfig);
    }, [fetchStoreConfig]);

    // 2. 🚀 Operational Protocol Commit (Save)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await api.put('/auth/security/update-profile-basic', formData);
            if (res.data.success) {
                toast.success("Operational Configuration Synchronized! ✅");
                fetchStoreConfig();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Protocol Interruption: Save failed.");
        } finally {
            setSaving(false);
        }
    };

    const themeColor = adminSettings?.themeColor || '#0f172a';

    // 🕒 Check Current Status based on Hours
    const isShopOpenNow = () => {
        if (formData.holidayMode) return false;
        const now = new Date();
        const time = now.getHours() + ":" + now.getMinutes();
        return time >= formData.openingTime && time <= formData.closingTime;
    };

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Syncing Operational Node...</p>
        </div>
    );

    return (
        <div style={container}>
            {/* --- [A] DYNAMIC COMMAND HEADER --- */}
            <div style={headerRow}>
                <div>
                    <h2 style={titleS}>⚙️ Hub Operational Protocols</h2>
                    <p style={subTitleS}>Configure business hours, holiday mode, and regional logistics.</p>
                </div>
                <div style={statusWrapper}>
                    <small style={syncText}>Last Auto-Sync: {lastSynced}</small>
                    <div style={statusBadge(!formData.holidayMode)}>
                        {formData.holidayMode ? "● NODE OFFLINE" : "● HUB OPERATIONAL"}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={settingsGrid}>
                
                {/* --- LEFT COLUMN: COMPLIANCE & LOGISTICS --- */}
                <div style={colS}>
                    
                    {/* 🛡️ ADMINISTRATIVE POLICIES (Sync with Global Admin) */}
                    <div style={policyCard(themeColor)}>
                        <h3 style={policyTitle}>Administrative Standards</h3>
                        <p style={policySub}>Governed by {adminSettings.siteName} central registry. Changes apply ecosystem-wide.</p>
                        <div style={policyGrid}>
                            <div style={pItem}>
                                <small style={pLab}>MIN. THRESHOLD</small>
                                <div style={pVal}>₹{systemSettings?.minOrderValue || 0}</div>
                            </div>
                            <div style={pItem}>
                                <small style={pLab}>NET COMMISSION</small>
                                <div style={pVal}>{systemSettings?.standardRate || 5}%</div>
                            </div>
                            <div style={pItem}>
                                <small style={pLab}>DISCOUNT CAP</small>
                                <div style={pVal}>5.0%</div>
                            </div>
                        </div>
                    </div>

                    {/* Regional Logistics Configuration */}
                    <div style={cardS}>
                        <h3 style={cardTitle(themeColor)}>Logistics & Regional Coverage</h3>
                        <div style={{marginBottom:'25px'}}>
                            <label style={labS}>Serviceable Area Pincodes</label>
                            <input 
                                style={inS} 
                                value={formData.deliveryPincodes} 
                                onChange={e => setFormData({...formData, deliveryPincodes: e.target.value})} 
                                placeholder="e.g. 302001, 302012" 
                            />
                            <small style={hintS}>Separate multiple pincodes with commas to expand your reach.</small>
                        </div>
                        <div>
                            <label style={labS}>Physical Store Identity (Detailed Address)</label>
                            <textarea 
                                style={areaS} 
                                value={formData.storeAddress} 
                                onChange={e => setFormData({...formData, storeAddress: e.target.value})} 
                                placeholder="Precision building, floor, and street details..."
                            />
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: AVAILABILITY MODULE --- */}
                <div style={colS}>
                    
                    <div style={cardS}>
                        <h3 style={cardTitle(themeColor)}>Operational Business Hours</h3>
                        <div style={rowS}>
                            <div style={{flex:1}}>
                                <label style={labS}>Opening Protocol</label>
                                <input type="time" style={inS} value={formData.openingTime} onChange={e => setFormData({...formData, openingTime: e.target.value})} />
                            </div>
                            <div style={{flex:1}}>
                                <label style={labS}>Closing Protocol</label>
                                <input type="time" style={inS} value={formData.closingTime} onChange={e => setFormData({...formData, closingTime: e.target.value})} />
                            </div>
                        </div>
                        {/* Real-time Status Indicator */}
                        <div style={liveStatusBox(isShopOpenNow())}>
                            {isShopOpenNow() ? "✨ Hub is currently visible to customers." : "🌙 Hub is currently hidden from marketplace."}
                        </div>
                    </div>

                    <div style={cardS}>
                        <h3 style={cardTitle(themeColor)}>Registry Availability Switch</h3>
                        <div style={toggleBox}>
                            <div style={tRow}>
                                <div>
                                    <b style={tMain}>Holiday / Maintenance Mode</b>
                                    <small style={tSub}>Immediately hide your storefront from the public network.</small>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.holidayMode} 
                                        onChange={e => setFormData({...formData, holidayMode: e.target.checked})} 
                                    />
                                    <span className="slider round" style={{backgroundColor: formData.holidayMode ? '#ef4444' : '#cbd5e1'}}></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={saving} style={saveBtn(themeColor)}>
                        {saving ? "📡 SYNCHRONIZING CLUSTER..." : "SAVE HUB CONFIGURATION"}
                    </button>
                    <p style={footerAlert}>🛡️ Unauthorized changes are logged for security audits.</p>
                </div>
            </form>

            <style>{`
                .spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                .switch { position: relative; display: inline-block; width: 50px; height: 26px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; transition: .4s; border-radius: 34px; }
                .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider:before { transform: translateX(24px); }
            `}</style>
        </div>
    );
};

// --- Enterprise Visual Definitions ---

const container = { padding: '10px', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin: 0, fontWeight: '900', color: '#0f172a', fontSize: '26px', letterSpacing:'-1px' };
const subTitleS = { color: '#64748b', fontSize: '14px', marginTop: '5px', fontWeight: '500' };

const statusWrapper = { textAlign:'right' };
const syncText = { display:'block', fontSize:'10px', color:'#cbd5e1', fontWeight:'800', marginBottom:'8px', textTransform:'uppercase' };
const statusBadge = (active) => ({ padding: '10px 20px', borderRadius: '14px', background: active ? '#ecfdf5' : '#fff1f2', color: active ? '#10b981' : '#f43f5e', fontSize: '10px', fontWeight: '900', border: '1.5px solid currentColor', letterSpacing:'0.5px' });

const settingsGrid = { display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1fr', gap: '30px' };
const colS = { display: 'flex', flexDirection: 'column', gap: '30px' };
const cardS = { background: '#fff', padding: window.innerWidth < 768 ? '25px' : '40px', borderRadius: '35px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' };
const cardTitle = (color) => ({ margin: '0 0 25px 0', fontSize: '12px', fontWeight: '900', color: color, textTransform: 'uppercase', letterSpacing: '1.5px', borderLeft:`4px solid ${color}`, paddingLeft:'15px' });

const labS = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', display: 'block' };
const inS = { width: '100%', padding: '16px', borderRadius: '16px', border: '1.5px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontWeight: '700', fontSize: '14px', boxSizing: 'border-box', transition:'0.3s' };
const areaS = { ...inS, height: '120px', resize: 'none', lineHeight:'1.6' };
const hintS = { fontSize: '10px', color: '#cbd5e1', marginTop: '8px', display: 'block', fontWeight: '700' };

const policyCard = (color) => ({ background: `linear-gradient(135deg, ${color} 0%, #1e293b 100%)`, padding: '40px', borderRadius: '40px', color: '#fff', boxShadow: `0 20px 40px ${color}33` });
const policyTitle = { margin:0, fontSize:'20px', fontWeight:'900', letterSpacing:'-0.5px' };
const policySub = { color:'rgba(255,255,255,0.6)', fontSize:'12px', marginBottom:'30px', marginTop:'8px', fontWeight:'500' };
const policyGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' };
const pItem = { background: 'rgba(255,255,255,0.08)', padding: '15px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' };
const pLab = { fontSize: '8px', fontWeight: '900', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform:'uppercase' };
const pVal = { fontSize: '18px', fontWeight: '900', marginTop: '5px' };

const toggleBox = { display: 'flex', flexDirection: 'column' };
const tRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const tMain = { display: 'block', color: '#1e293b', fontSize: '15px', fontWeight: '800' };
const tSub = { color: '#94a3b8', fontSize: '12px', fontWeight:'500' };

const rowS = { display: 'flex', gap: '20px', marginBottom:'25px' };
const liveStatusBox = (isOpen) => ({ marginTop:'10px', padding:'15px', borderRadius:'15px', background: isOpen ? '#f0fdf4' : '#f8fafc', color: isOpen ? '#10b981' : '#94a3b8', fontSize:'12px', fontWeight:'800', textAlign:'center', border: isOpen ? '1px solid #dcfce7' : '1px solid #f1f5f9' });

const saveBtn = (color) => ({ width: '100%', padding: '22px', background: color, color: '#fff', border: 'none', borderRadius: '20px', fontWeight: '900', fontSize: '15px', cursor: 'pointer', boxShadow: `0 10px 25px ${color}44`, transition: '0.3s', marginTop:'15px' });
const footerAlert = { textAlign:'center', color:'#cbd5e1', fontSize:'10px', fontWeight:'800', marginTop:'20px', textTransform:'uppercase', letterSpacing:'1px' };

const loaderS = { display: 'flex', flexDirection:'column', height: '80vh', justifyContent: 'center', alignItems: 'center', fontWeight: '900', color: '#94a3b8', fontSize: '14px', gap:'15px' };

export default ShopSettings;