import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import { toast } from 'react-toastify';
import { useBranding } from '../../../../context/BrandingContext';
import { useAuth } from '../../../../context/AuthContext';
import HomeHeader from '../../../../components/Customer/HomeHeader';
import MobileBottomNav from '../../../../components/Customer/MobileBottomNav';

const ManageUserNode = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useBranding();
    const { user: currentAdmin } = useAuth();
    
    // --- 🛡️ Component States ---
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('identity');
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

    // 1. 📡 Automatic Node Synchronization Protocol (No Buttons)
    const fetchUserData = useCallback(async () => {
        try {
            const res = await api.get(`/admin/users/all`);
            if (res.data.success) {
                const node = res.data.data.find(u => u._id === id);
                if (node) {
                    setFormData(node);
                    setLastSynced(new Date().toLocaleTimeString());
                    document.title = `Manage: ${node.fullName} | ${settings.siteName}`;
                }
            }
        } catch (err) {
            console.error("Node Handshake Failed");
            toast.error("Cluster connection failed. retrying...");
        } finally {
            setLoading(false);
        }
    }, [id, settings.siteName]);

    useEffect(() => {
        fetchUserData();
        // Auto-refresh when admin returns to this window
        window.addEventListener('focus', fetchUserData);
        return () => window.removeEventListener('focus', fetchUserData);
    }, [fetchUserData]);

    // --- 2. Administrative Action Protocols ---

    const handleUpdate = async () => {
        if (!window.confirm("CRITICAL: Authorize and commit all identity modifications to global registry?")) return;
        setIsActionLoading(true);
        try {
            await api.put(`/admin/users/update/${id}`, formData);
            toast.success("Ecosystem Update: Node metadata synchronized successfully! ✅");
            fetchUserData();
        } catch (err) { toast.error("Protocol Error: Registry commit failed."); }
        finally { setIsActionLoading(false); }
    };

    const handleToggleStatus = async () => {
        if (id === currentAdmin?.id) return toast.error("Security Violation: Root session protection active.");
        
        try {
            await api.put(`/admin/user/status/${id}`);
            toast.info("Registry Updated: Node status toggled.");
            fetchUserData();
        } catch (err) { toast.error("Status protocol failed."); }
    };

    const handleResetPassword = async () => {
        const newPass = prompt("Identity Protocol: Enter new secure access key (Password):");
        if (!newPass || newPass.length < 6) return toast.warning("Entropy Alert: Password must be at least 6 characters.");
        
        try {
            await api.put(`/admin/users/reset-password/${id}`, { newPassword: newPass });
            toast.success("Security Handshake Success: New access key deployed.");
        } catch (err) { toast.error("Credential rotation failed."); }
    };

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Accessing Identity Node Registry...</p>
        </div>
    );

    return (
        <div style={containerS}>
            <HomeHeader />
            
            <div style={mainContentS}>
                {/* --- [A] DYNAMIC COMMAND HEADER --- */}
                <div style={headerS}>
                    <button onClick={() => navigate(-1)} style={backBtn}>← RETURN TO REGISTRY</button>
                    <div style={{flex: 1}}>
                        <h2 style={titleS}>🛠️ Manage Node: {formData.fullName}</h2>
                        <small style={syncTextS}>Last Auto-Sync: {lastSynced}</small>
                    </div>
                </div>

                {/* --- [B] ADMINISTRATIVE COMMAND TOOLBAR --- */}
                <div style={commandToolbar}>
                    <div style={{flex:1}}>
                        <h4 style={toolTitleS}>Administrative Command Center</h4>
                        <p style={toolSubS}>Execute high-level security and compliance protocols for this identity node.</p>
                    </div>
                    <div style={btnClusterS}>
                        <button onClick={handleResetPassword} style={utilBtn(themeColor)}>🔑 RESET KEY</button>
                        <button onClick={handleToggleStatus} style={formData.isActive ? blockBtn : unblockBtn}>
                            {formData.isActive ? '🚫 SUSPEND NODE' : '✅ RESTORE NODE'}
                        </button>
                        <button style={dangerBtn} disabled={id === currentAdmin?.id}>🗑️ PURGE NODE</button>
                    </div>
                </div>

                {/* --- [C] ADAPTIVE NAVIGATION TABS --- */}
                <div className="custom-scroll" style={tabContainer}>
                    <button style={activeTab === 'identity' ? activeTabS(themeColor) : tabS} onClick={() => setActiveTab('identity')}>👤 IDENTITY</button>
                    <button style={activeTab === 'docs' ? activeTabS(themeColor) : tabS} onClick={() => setActiveTab('docs')}>📑 DOCUMENTS</button>
                    <button style={activeTab === 'security' ? activeTabS(themeColor) : tabS} onClick={() => setActiveTab('security')}>🔒 SECURITY</button>
                    <button style={activeTab === 'history' ? activeTabS(themeColor) : tabS} onClick={() => setActiveTab('history')}>📜 LOGS</button>
                </div>

                <div style={formWrapperS}>
                    {/* 01. IDENTITY MODULE */}
                    {activeTab === 'identity' && (
                        <div style={sectionBox}>
                            <h3 style={secLabel(themeColor)}>Personnel Identity Details</h3>
                            <div style={gridResponsive3}>
                                <div style={inputGroup}><label style={labS}>Full Legal Name</label><input style={inS} value={formData.fullName} onChange={e=>setFormData({...formData, fullName: e.target.value})} /></div>
                                <div style={inputGroup}><label style={labS}>Guardian Name</label><input style={inS} value={formData.fatherName} onChange={e=>setFormData({...formData, fatherName: e.target.value})} /></div>
                                <div style={inputGroup}><label style={labS}>Date of Birth</label><input type="date" style={inS} value={formData.dob?.split('T')[0]} onChange={e=>setFormData({...formData, dob: e.target.value})} /></div>
                                <div style={inputGroup}><label style={labS}>Authorized Mobile Identifier</label><input style={inS} value={formData.mobile} onChange={e=>setFormData({...formData, mobile: e.target.value})} /></div>
                                <div style={inputGroup}><label style={labS}>Primary Email Node</label><input style={inS} value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} /></div>
                                <div style={fileBox}>
                                    <label style={labS}>Registry Portrait</label>
                                    <img src={formData.photo || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} style={previewImg} alt="Identity" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 02. STATUTORY DOCUMENTS MODULE */}
                    {activeTab === 'docs' && (
                        <div style={sectionBox}>
                            <h3 style={secLabel(themeColor)}>KYC & Statutory Verification</h3>
                            <div style={gridResponsive4}>
                                <DocBlock label="Aadhaar ID Copy" src={formData.kycDetails?.aadharCardFile} />
                                <DocBlock label="PAN Identity Copy" src={formData.kycDetails?.panCardFile} />
                                <DocBlock label="Bank Settlement Proof" src={formData.bankDetails?.passbookPhoto} />
                                <DocBlock label="Qualification Node" src={formData.qualificationFile} />
                            </div>
                        </div>
                    )}

                    {/* 03. NETWORK SECURITY MODULE */}
                    {activeTab === 'security' && (
                        <div style={sectionBox}>
                            <h3 style={secLabel(themeColor)}>Infrastructure & Network Binding</h3>
                            <div style={gridResponsive2}>
                                <div style={inputGroup}>
                                    <label style={labS}>Restricted Login IP Registry (CSV)</label>
                                    <input style={inS} value={formData.allowedIps?.join(',')} placeholder="e.g. 192.168.1.1, 10.0.0.1" onChange={e=>setFormData({...formData, allowedIps: e.target.value.split(',').map(ip=>ip.trim())})} />
                                </div>
                                <div style={inputGroup}>
                                    <label style={labS}>Hardware IMEI / Device Binding</label>
                                    <input style={inS} value={formData.deviceImei} placeholder="LOCKED_DEVICE_ID" onChange={e=>setFormData({...formData, deviceImei: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 04. LOGIN AUDIT MODULE */}
                    {activeTab === 'history' && (
                        <div style={sectionBox}>
                            <h3 style={secLabel(themeColor)}>Cryptographic Session Logs</h3>
                            <div style={tableContainerS}>
                                <table style={historyTable}>
                                    <thead>
                                        <tr style={thRow}>
                                            <th style={thS}>TIMESTAMP</th>
                                            <th style={thS}>ORIGIN IP</th>
                                            <th style={thS}>DEVICE / BROWSER AGENT</th>
                                            <th style={thS}>SECURITY</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.loginHistory?.length > 0 ? (
                                            [...formData.loginHistory].reverse().map((log, i) => (
                                                <tr key={i} style={trS}>
                                                    <td style={tdS}>{new Date(log.timestamp).toLocaleString()}</td>
                                                    <td style={tdS}><code style={codeS}>{log.ip}</code></td>
                                                    <td style={tdS}>{log.device || 'Unidentified Node'}</td>
                                                    <td style={tdS}><span style={vBadge}>● AUTHORIZED</span></td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="4" style={emptyLogs}>No session logs recorded in the current cluster.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Submit Node Changes */}
                    {activeTab !== 'history' && (
                        <button onClick={handleUpdate} style={submitBtn(themeColor)} disabled={isActionLoading}>
                            {isActionLoading ? '📡 SYNCHRONIZING WITH REGISTRY...' : '💾 AUTHORIZE & COMMIT CHANGES'}
                        </button>
                    )}
                </div>
            </div>

            <MobileBottomNav />

            <style>{`
                .spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .custom-scroll::-webkit-scrollbar { height: 4px; width: 4px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

// --- Atomic Helper Component ---
const DocBlock = ({ label, src }) => (
    <div style={docCard}>
        <small style={labS}>{label}</small>
        <div style={imgFrame}>
            {src ? (
                <img src={src} style={docImg} onClick={()=>window.open(src, '_blank')} alt="Asset" />
            ) : (
                <span style={{color:'#cbd5e1', fontSize:'10px', fontWeight:'800'}}>NO_DOCUMENT_LINKED</span>
            )}
        </div>
    </div>
);

// --- Enterprise Style Definitions ---

const containerS = { background:'#f8fafc', minHeight:'100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const mainContentS = { padding: '20px', maxWidth:'1200px', margin:'0 auto', paddingBottom:'100px' };

const headerS = { display:'flex', alignItems:'center', gap:'25px', marginBottom:'40px', flexWrap:'wrap' };
const backBtn = { padding:'12px 20px', borderRadius:'14px', border:'1px solid #e2e8f0', background:'#fff', color:'#0f172a', fontWeight:'800', cursor:'pointer', fontSize:'11px' };
const titleS = { margin:0, fontSize:'24px', fontWeight:'900', color:'#0f172a', letterSpacing:'-1px' };
const syncTextS = { color:'#94a3b8', fontWeight:'800', textTransform:'uppercase', fontSize:'10px', letterSpacing:'1px' };

const commandToolbar = { display:'flex', alignItems:'center', background:'#fff', padding:'25px 35px', borderRadius:'35px', border:'1px solid #f1f5f9', marginBottom:'35px', boxShadow:'0 10px 30px rgba(0,0,0,0.02)', flexWrap:'wrap', gap:'20px' };
const toolTitleS = { margin:0, fontSize:'16px', fontWeight:'900', color:'#1e293b' };
const toolSubS = { margin:'5px 0 0', fontSize:'12px', color:'#94a3b8', fontWeight:'500' };

const btnClusterS = { display:'flex', gap:'12px', flexWrap:'wrap' };
const utilBtn = (color) => ({ padding:'12px 20px', borderRadius:'12px', border:'none', background:`${color}10`, color: color, fontWeight:'900', cursor:'pointer', fontSize:'11px', transition:'0.3s' });
const blockBtn = { padding:'12px 20px', borderRadius:'12px', border:'none', background:'#fff1f2', color:'#f43f5e', fontWeight:'900', cursor:'pointer', fontSize:'11px' };
const unblockBtn = { ...blockBtn, background:'#ecfdf5', color:'#10b981' };
const dangerBtn = { padding:'12px 20px', borderRadius:'12px', border:'none', background:'#0f172a', color:'#fff', fontWeight:'900', cursor:'pointer', fontSize:'11px' };

const tabContainer = { display:'flex', gap:'10px', marginBottom:'30px', borderBottom:'1.5px solid #f1f5f9', paddingBottom:'12px', overflowX:'auto', scrollbarWidth:'none' };
const tabS = { padding:'14px 24px', borderRadius:'12px', border:'none', background:'none', cursor:'pointer', color:'#94a3b8', fontWeight:'800', fontSize:'12px', transition:'0.3s', whiteSpace:'nowrap' };
const activeTabS = (color) => ({ ...tabS, background: color, color:'#fff', boxShadow:`0 8px 15px ${color}33` });

const formWrapperS = { animation:'fadeIn 0.5s ease' };
const sectionBox = { background:'#fff', padding: window.innerWidth < 768 ? '25px' : '40px', borderRadius:'40px', border:'1px solid #f1f5f9', marginBottom:'35px', boxShadow:'0 15px 35px rgba(0,0,0,0.02)' };
const secLabel = (color) => ({ fontSize:'14px', fontWeight:'900', marginBottom:'35px', color:'#0f172a', borderLeft:`5px solid ${color}`, paddingLeft:'15px', textTransform:'uppercase', letterSpacing:'1px' });

const gridResponsive3 = { display:'grid', gridTemplateColumns: window.innerWidth < 992 ? '1fr' : 'repeat(3, 1fr)', gap:'30px' };
const gridResponsive2 = { display:'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap:'30px' };
const gridResponsive4 = { display:'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr 1fr' : 'repeat(4, 1fr)', gap:'20px' };

const inputGroup = { display:'flex', flexDirection:'column', gap:'10px' };
const labS = { fontSize:'10px', fontWeight:'900', color:'#cbd5e1', textTransform:'uppercase', letterSpacing:'1.5px' };
const inS = { padding:'18px', borderRadius:'18px', border:'1.5px solid #f1f5f9', background:'#f8fafc', outline:'none', fontSize:'14px', fontWeight:'700', color:'#1e293b', boxSizing:'border-box', transition:'0.3s' };

const fileBox = { textAlign:'center', border:'2px dashed #f1f5f9', borderRadius:'25px', padding:'20px', background:'#fcfdfe' };
const previewImg = { height:'90px', width:'90px', borderRadius:'20px', objectFit:'cover', border:'5px solid #fff', boxShadow:'0 10px 20px rgba(0,0,0,0.1)' };

const docCard = { background:'#f8fafc', padding:'20px', borderRadius:'24px', border:'1px solid #f1f5f9', textAlign:'center' };
const imgFrame = { height:'120px', background:'#fff', borderRadius:'18px', marginTop:'15px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', border:'1px solid #eee', cursor:'zoom-in' };
const docImg = { width:'100%', height:'100%', objectFit:'cover' };

const tableContainerS = { borderRadius:'20px', overflow:'hidden', border:'1px solid #f1f5f9' };
const historyTable = { width:'100%', borderCollapse:'collapse', textAlign:'left' };
const thRow = { background:'#f8fafc', borderBottom:'1px solid #f1f5f9' };
const thS = { padding:'18px 25px', fontSize:'10px', fontWeight:'900', color:'#94a3b8', letterSpacing:'1px' };
const tdS = { padding:'18px 25px', fontSize:'13px', color:'#475569', borderBottom:'1px solid #f8fafc' };
const trS = { transition:'0.2s' };
const codeS = { background:'#eff6ff', color:'#2563eb', padding:'4px 10px', borderRadius:'6px', fontWeight:'900', fontSize:'12px', fontFamily:"'JetBrains Mono', monospace" };
const vBadge = { color:'#10b981', fontWeight:'900', fontSize:'10px', textTransform:'uppercase' };
const emptyLogs = { padding:'60px', textAlign:'center', color:'#cbd5e1', fontWeight:'800', textTransform:'uppercase', fontSize:'12px' };

const submitBtn = (color) => ({ width:'100%', padding:'22px', background: color, color:'#fff', border:'none', borderRadius:'24px', fontWeight:'900', fontSize:'16px', cursor:'pointer', boxShadow:`0 15px 35px ${color}33`, transition:'0.3s', letterSpacing:'1px' });

const loaderS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap:'20px', background:'#f8fafc' };

export default ManageUserNode;