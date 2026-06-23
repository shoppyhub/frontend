import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from "../../../../../services/api";

/**
 * RKD MART - SECURITY & DEVICE GOVERNANCE (ULTRA PRO)
 * पॉलिसी: 1 मोबाइल + 1 PC (Windows/macOS/Android/iOS)
 */
const SecurityControl = ({ shop, canSuspend, refresh, onReset }) => {
    const [reason, setReason] = useState("");
    const [isProcessing, setIsRefreshing] = useState(false);

    // --- 1. सस्पेंड/रीस्टोर लॉजिक ---
    const toggleStatus = async () => {
        if (!reason && shop.isActive) return toast.warn("Please provide a suspension reason.");
        try {
            const res = await api.patch(`/admin/shops/toggle/${shop._id}`, { isActive: !shop.isActive, reason });
            if (res.data.success) {
                toast.success(`Node ${shop.isActive ? 'Deactivated' : 'Activated'} successfully.`);
                setReason("");
                refresh();
            }
        } catch (err) { toast.error("Communication Protocol Failed."); }
    };

    // --- 2. डिवाइस रिवोक (Revoke) लॉजिक ---
    const handleRevoke = async (deviceId) => {
        if (!window.confirm("🚨 ALERT: This will force logout the merchant from this device. Proceed?")) return;
        try {
            const res = await api.patch(`/admin/hierarchy/device-status/${shop._id}`, { deviceId, isAuthorized: false });
            if (res.data.success) {
                toast.error("Device access revoked.");
                refresh();
            }
        } catch (err) { toast.error("Purge Protocol Failed."); }
    };

    // --- डिवाइस वर्गीकरण (Mobile vs PC) ---
    const devices = shop.authorizedDevices || [];
    const mobileDevices = devices.filter(d => /android|iphone|ipad/i.test(d.userAgent || d.deviceName));
    const pcDevices = devices.filter(d => /windows|macintosh|linux/i.test(d.userAgent || d.deviceName));

    return (
        <div style={containerS}>
            <div style={gridS}>
                
                {/* --- LEFT: NODE CONTROL --- */}
                <div style={columnS}>
                    <div style={cardS}>
                        <h3 style={cardTitleS}>🛡️ HUB ACCESS CONTROL</h3>
                        <p style={descS}>Termination of this node will instantly freeze all merchant operations and clear marketplace visibility.</p>
                        
                        {shop.isActive && (
                            <div style={{marginTop:'15px'}}>
                                <label style={labelS}>OFFICIAL REASON</label>
                                <textarea 
                                    style={areaS} 
                                    placeholder="Enter reason for suspension..." 
                                    value={reason} 
                                    onChange={e => setReason(e.target.value)} 
                                />
                            </div>
                        )}

                        {canSuspend ? (
                            <button style={btnS(shop.isActive)} onClick={toggleStatus}>
                                {shop.isActive ? "🔒 SUSPEND HUB ACCESS" : "🔓 RESTORE HUB ACCESS"}
                            </button>
                        ) : <div style={lockAlertS}>ADMIN PRIVILEGE REQUIRED FOR SUSPENSION</div>}
                    </div>

                    <div style={{...cardS, borderTop:'4px solid #6366f1'}}>
                        <h3 style={cardTitleS}>🔑 CREDENTIAL OVERRIDE</h3>
                        <p style={descS}>Force a master password reset for this merchant node.</p>
                        <button onClick={onReset} style={resetBtnS}>INITIATE PASSWORD RESET</button>
                    </div>
                </div>

                {/* --- RIGHT: DEVICE MANAGEMENT --- */}
                <div style={columnS}>
                    <div style={cardS}>
                        <div style={headerFlexS}>
                            <h3 style={cardTitleS}>📱 DEVICE STRATEGY MONITOR</h3>
                            <span style={policyBadgeS}>POLICY: 1 MOBILE + 1 PC</span>
                        </div>
                        
                        {/* Policy Status Bar */}
                        <div style={policyBarS}>
                            <div style={usageItemS}>MOBILE: <b>{mobileDevices.length}/1</b></div>
                            <div style={usageItemS}>PC/TABLET: <b>{pcDevices.length}/1</b></div>
                        </div>

                        <div style={deviceListS}>
                            {devices.length === 0 ? (
                                <div style={emptyS}>No devices currently registered to this hub.</div>
                            ) : (
                                devices.map((dev, i) => (
                                    <div key={i} style={devItemS(dev.isAuthorized)}>
                                        <div style={devIconS}>{getDeviceIcon(dev.userAgent || dev.deviceName)}</div>
                                        <div style={{flex: 1}}>
                                            <div style={devNameS}>{dev.deviceName} {dev.isAuthorized ? '' : '(BLOCKED)'}</div>
                                            <div style={devMetaS}>
                                                <span>🌐 IP: {dev.ip}</span> • 
                                                <span>🕒 {new Date(dev.lastLogin).toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                        {dev.isAuthorized && (
                                            <button onClick={() => handleRevoke(dev.deviceId)} style={revBtnS}>REVOKE</button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        <p style={footerNoteS}>※ Merchants can only login from authorized devices within the RKD MART cluster.</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

// --- डिवाइस आइकन डिटेक्शन ---
const getDeviceIcon = (ua = "") => {
    const lowUA = ua.toLowerCase();
    if (lowUA.includes('windows')) return '🪟';
    if (lowUA.includes('android')) return '🤖';
    if (lowUA.includes('iphone') || lowUA.includes('ios')) return '🍎';
    if (lowUA.includes('mac')) return '💻';
    if (lowUA.includes('linux')) return '🐧';
    return '📱';
};

// --- STYLES (Ultra Pro SaaS) ---
const containerS = { animation: 'fadeIn 0.5s ease' };
const gridS = { display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:'30px' };
const columnS = { display:'flex', flexDirection:'column', gap:'25px' };

const cardS = { background:'#fff', padding:'25px', borderRadius:'24px', border:'1px solid #f1f5f9', boxShadow:'0 10px 30px rgba(0,0,0,0.02)' };
const cardTitleS = { margin:0, fontSize:'14px', fontWeight:'900', color:'#1e293b', letterSpacing:'0.5px' };
const descS = { fontSize:'12px', color:'#64748b', marginTop:'8px', lineHeight:'1.5' };
const labelS = { fontSize:'10px', fontWeight:'900', color:'#94a3b8', display:'block', marginBottom:'5px' };

const areaS = { width:'100%', height:'80px', borderRadius:'15px', padding:'12px', border:'2px solid #f1f5f9', background:'#f8fafc', fontSize:'13px', outline:'none', fontFamily:'inherit' };
const btnS = (active) => ({ width:'100%', padding:'16px', borderRadius:'15px', border:'none', background: active ? '#f43f5e' : '#10b981', color:'#fff', fontWeight:'900', fontSize:'12px', marginTop:'20px', cursor:'pointer', boxShadow: `0 8px 15px ${active ? '#f43f5e30' : '#10b98130'}` });

const lockAlertS = { marginTop:'20px', padding:'15px', borderRadius:'12px', background:'#fff1f2', color:'#f43f5e', fontSize:'11px', fontWeight:'800', textAlign:'center' };
const resetBtnS = { width:'100%', padding:'14px', borderRadius:'12px', border:'2px solid #e2e8f0', background:'#fff', color:'#1e293b', fontWeight:'900', fontSize:'11px', marginTop:'15px', cursor:'pointer' };

const headerFlexS = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px' };
const policyBadgeS = { fontSize:'9px', fontWeight:'900', background:'#f0f9ff', color:'#0369a1', padding:'4px 10px', borderRadius:'6px', border:'1px solid #bae6fd' };
const policyBarS = { display:'flex', gap:'15px', background:'#f8fafc', padding:'12px', borderRadius:'15px', marginBottom:'20px' };
const usageItemS = { fontSize:'11px', color:'#475569', fontWeight:'600' };

const deviceListS = { display:'flex', flexDirection:'column', gap:'12px' };
const devItemS = (auth) => ({ display:'flex', alignItems:'center', gap:'15px', padding:'15px', borderRadius:'18px', background: auth ? '#fcfdfe' : '#fff1f2', border: `1px solid ${auth ? '#f1f5f9' : '#fee2e2'}`, opacity: auth ? 1 : 0.7 });
const devIconS = { width:'45px', height:'45px', borderRadius:'12px', background:'#fff', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'22px', border:'1px solid #f1f5f9' };
const devNameS = { fontSize:'13px', fontWeight:'800', color:'#1e293b' };
const devMetaS = { fontSize:'10px', color:'#94a3b8', fontWeight:'600', marginTop:'3px' };
const revBtnS = { background:'#fff', color:'#f43f5e', border:'1px solid #f43f5e', padding:'6px 12px', borderRadius:'8px', fontSize:'10px', fontWeight:'900', cursor:'pointer' };

const emptyS = { textAlign:'center', padding:'40px', color:'#94a3b8', fontSize:'12px', fontWeight:'600' };
const footerNoteS = { fontSize:'10px', color:'#94a3b8', marginTop:'20px', fontStyle:'italic' };

export default SecurityControl;