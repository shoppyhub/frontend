import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from 'services/api';

const SecurityNode = ({ merchant, refresh }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [newPass, setNewPass] = useState("");
    const [showPassIn, setShowPassIn] = useState(false);

    // --- 🛡️ 1. डिवाइस रिस्ट्रिक्शन टॉगल (Master Hardware Lock) ---
    const toggleRestriction = async () => {
        const target = !merchant.isDeviceRestricted;
        if (!window.confirm(`PROTOCOL CHANGE: ${target ? 'Enable' : 'Disable'} Hardware Binding?`)) return;
        
        setIsProcessing(true);
        try {
            await api.put(`/admin/hierarchy/update/${merchant._id}`, { isDeviceRestricted: target });
            toast.success(`Hardware Binding ${target ? 'Activated' : 'Deactivated'}`);
            refresh();
        } catch (err) { toast.error("Handshake Failed."); }
        finally { setIsProcessing(false); }
    };

    // --- 📱 2. डिवाइस ऑथराइजेशन कंट्रोल ---
    const handleDeviceAuth = async (deviceId, currentStatus) => {
        try {
            await api.patch(`/admin/hierarchy/device-status/${merchant._id}`, { 
                deviceId, 
                isAuthorized: !currentStatus 
            });
            toast.info(!currentStatus ? "Hardware Node Authorized." : "Hardware Access Revoked.");
            refresh();
        } catch (err) { toast.error("Protocol Error."); }
    };

    // --- 🚪 3. फोर्स लॉगआउट ऑल ---
    const handleForceLogoutAll = async () => {
        if (!window.confirm("🚨 CRITICAL: Terminate all active sessions for this hub?")) return;
        try {
            await api.patch(`/admin/devices/revoke-all/${merchant._id}`);
            toast.error("All sessions terminated.");
            refresh();
        } catch (err) { toast.error("Command Rejected."); }
    };

    // --- 🔑 4. पासवर्ड मैनेजमेंट (Manual & Auto) ---
    const handleManualPassChange = async () => {
        if (newPass.length < 6) return toast.warn("Password must be at least 6 characters.");
        if (!window.confirm("Overwrite current merchant credentials?")) return;

        setIsProcessing(true);
        try {
            await api.put(`/admin/users/reset-password/${merchant._id}`, { newPassword: newPass });
            toast.success("Master Password Updated.");
            setNewPass("");
            setShowPassIn(false);
        } catch (err) { toast.error("Override Failed."); }
        finally { setIsProcessing(false); }
    };

    const handleAutoReset = async () => {
        const temp = "RKD" + Math.floor(100000 + Math.random() * 900000);
        if (!window.confirm(`Generate Temporary Key: ${temp}?`)) return;

        try {
            await api.put(`/admin/users/reset-password/${merchant._id}`, { newPassword: temp });
            toast.success(`Temporary Key Issued: ${temp}`, { autoClose: false });
        } catch (err) { toast.error("Reset Failed."); }
    };

    const devices = merchant.authorizedDevices || [];

    return (
        <div style={containerS}>
            <div style={mainGridS}>
                
                {/* --- LEFT: HARDWARE REGISTRY --- */}
                <div style={colS}>
                    <div style={cardS}>
                        <div style={cardHeadS}>
                            <h3 style={titleS}>📱 REGISTERED HARDWARE REGISTRY</h3>
                            <div style={badgeS(merchant.isDeviceRestricted)}>
                                {merchant.isDeviceRestricted ? '🔒 HARDWARE_LOCKED' : '🔓 OPEN_ACCESS'}
                            </div>
                        </div>

                        <div style={deviceListS}>
                            {devices.length === 0 ? (
                                <div style={emptyS}>No hardware fingerprints detected.</div>
                            ) : (
                                devices.map((d, i) => (
                                    <div key={i} style={devItemS(d.isAuthorized)}>
                                        <div style={devIconS(d.userAgent || d.deviceName)}>
                                            {getIcon(d.userAgent || d.deviceName)}
                                        </div>
                                        <div style={{flex:1}}>
                                            <div style={devNameS}>{d.deviceName}</div>
                                            <div style={devMetaS}>
                                                <span>🌐 {d.ip}</span> • <span>🕒 {new Date(d.lastLogin).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeviceAuth(d.deviceId, d.isAuthorized)} 
                                            style={d.isAuthorized ? revBtnS : grantBtnS}
                                        >
                                            {d.isAuthorized ? 'REVOKE' : 'AUTHORIZE'}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: CREDENTIALS & COMMANDS --- */}
                <div style={colS}>
                    
                    {/* 🔑 Credential Vault */}
                    <div style={{...cardS, borderTop:'4px solid #6366f1'}}>
                        <h3 style={titleS}>🔑 CREDENTIAL OVERRIDE VAULT</h3>
                        <p style={descS}>Administrators can manually reset or assign new security keys to this node.</p>
                        
                        <div style={passActionRowS}>
                            <button onClick={handleAutoReset} style={resetBtnS}>✨ AUTO-GENERATE TEMP KEY</button>
                            <button onClick={() => setShowPassIn(!showPassIn)} style={manualBtnS}>⌨️ SET MANUAL PASSWORD</button>
                        </div>

                        {showPassIn && (
                            <div style={manualPassBoxS}>
                                <input 
                                    type="text" 
                                    placeholder="Enter Secure New Password" 
                                    style={passInS}
                                    value={newPass}
                                    onChange={e => setNewPass(e.target.value)}
                                />
                                <button onClick={handleManualPassChange} style={savePassBtnS} disabled={isProcessing}>
                                    COMMIT CHANGE
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 🛡️ Hardware Protocol */}
                    <div style={{...cardS, borderLeft:'6px solid #10b981'}}>
                        <h3 style={titleS}>🛡️ HARDWARE BINDING PROTOCOL</h3>
                        <div style={restrictionBoxS(merchant.isDeviceRestricted)}>
                            <div style={{flex:1}}>
                                <div style={{fontWeight:'900', fontSize:'13px'}}>Restrict Access</div>
                                <div style={{fontSize:'10px', opacity:0.7}}>Only authorized hardware node login allowed.</div>
                            </div>
                            <button onClick={toggleRestriction} style={toggleBtnS(merchant.isDeviceRestricted)} disabled={isProcessing}>
                                {merchant.isDeviceRestricted ? 'ACTIVE' : 'INACTIVE'}
                            </button>
                        </div>
                    </div>

                    {/* ⚡ Emergency Dock */}
                    <div style={cardS}>
                        <h3 style={titleS}>⚡ EMERGENCY TERMINATION</h3>
                        <div style={btnStackS}>
                            <button style={cmdBtnS('#f43f5e')} onClick={handleForceLogoutAll}>
                                🚪 TERMINATE ALL ACTIVE SESSIONS
                            </button>
                            <button style={cmdBtnS('#0f172a')} onClick={() => window.confirm("Locked.")}>
                                ❄️ FREEZE HUB INFRASTRUCTURE
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// --- Helpers & Styles ---
const getIcon = (ua = "") => {
    const u = ua.toLowerCase();
    if (u.includes('windows')) return '🪟';
    if (u.includes('android')) return '🤖';
    if (u.includes('iphone')) return '🍎';
    if (u.includes('macintosh')) return '💻';
    return '📱';
};

const containerS = { animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const mainGridS = { display:'grid', gridTemplateColumns: '1.2fr 1fr', gap:'30px' };
const colS = { display:'flex', flexDirection:'column', gap:'25px' };
const cardS = { background:'#fff', padding:'25px', borderRadius:'25px', border:'1px solid #f1f5f9', boxShadow:'0 10px 30px rgba(0,0,0,0.02)' };
const cardHeadS = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' };
const titleS = { margin:0, fontSize:'13px', fontWeight:'900', color:'#0f172a', letterSpacing:'0.5px' };
const badgeS = (active) => ({ background: active ? '#ecfdf5' : '#fff1f2', color: active ? '#10b981' : '#f43f5e', padding:'5px 12px', borderRadius:'8px', fontSize:'9px', fontWeight:'900' });

const deviceListS = { maxHeight:'500px', overflowY:'auto' };
const devItemS = (auth) => ({ display:'flex', alignItems:'center', gap:'15px', padding:'15px', background: auth?'#fcfdfe':'#fff1f2', borderRadius:'18px', border:`1px solid ${auth?'#f1f5f9':'#fee2e2'}`, marginBottom:'12px' });
const devIconS = (ua) => ({ width:'45px', height:'45px', borderRadius:'12px', background:'#fff', border:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' });
const devNameS = { fontSize:'14px', fontWeight:'800', color:'#1e293b' };
const devMetaS = { fontSize:'10px', color:'#94a3b8', fontWeight:'700', marginTop:'2px' };
const revBtnS = { background:'#fff', color:'#ef4444', border:'1px solid #ef4444', padding:'8px 15px', borderRadius:'8px', fontSize:'9px', fontWeight:'900', cursor:'pointer' };
const grantBtnS = { ...revBtnS, color:'#10b981', border:'1px solid #10b981' };

const descS = { fontSize:'11px', color:'#64748b', marginTop:'8px', lineHeight:'1.5' };
const passActionRowS = { display:'flex', gap:'10px', marginTop:'15px' };
const resetBtnS = { flex:1, background:'#f8fafc', border:'1px solid #e2e8f0', padding:'12px', borderRadius:'10px', fontSize:'9px', fontWeight:'900', cursor:'pointer' };
const manualBtnS = { ...resetBtnS, background:'#fff', border:'1px solid #6366f1', color:'#6366f1' };

const manualPassBoxS = { marginTop:'15px', display:'flex', gap:'10px' };
const passInS = { flex:1, padding:'10px', borderRadius:'10px', border:'2px solid #f1f5f9', outline:'none', fontWeight:'700', fontSize:'13px', background:'#fcfdfe' };
const savePassBtnS = { background:'#6366f1', color:'#fff', border:'none', padding:'0 15px', borderRadius:'10px', fontWeight:'900', fontSize:'10px', cursor:'pointer' };

const restrictionBoxS = (active) => ({ marginTop:'15px', padding:'15px', borderRadius:'15px', background: active?'#f0fdf4':'#f8fafc', border: `1px dashed ${active?'#10b981':'#cbd5e1'}`, display:'flex', alignItems:'center' });
const toggleBtnS = (active) => ({ background: active?'#10b981':'#0f172a', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'8px', fontWeight:'900', fontSize:'10px', cursor:'pointer' });

const btnStackS = { display:'flex', flexDirection:'column', gap:'10px', marginTop:'15px' };
const cmdBtnS = (c) => ({ width:'100%', padding:'15px', background:c, color:'#fff', border:'none', borderRadius:'12px', fontWeight:'900', fontSize:'11px', cursor:'pointer' });

const emptyS = { textAlign:'center', padding:'40px 0', color:'#cbd5e1', fontWeight:'900', fontSize:'11px' };

export default SecurityNode;