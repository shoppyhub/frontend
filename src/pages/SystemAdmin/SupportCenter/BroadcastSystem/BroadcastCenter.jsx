import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../../../services/api'; 
import { toast } from 'react-toastify';
import { useBranding } from '../../../../context/BrandingContext';

const BroadcastCenter = () => {
    const { settings } = useBranding();
    
    // --- State Management ---
    const [formData, setFormData] = useState({
        heading: "",
        content: "",
        target: "All Registered Users",
        priority: "Normal"
    });

    const [isSending, setIsSending] = useState(false);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

    // 1. 📡 Automatic Synchronization Protocol (No Buttons)
    const fetchBroadcastHistory = useCallback(async () => {
        try {
            const res = await api.get('/admin/support/broadcasts'); 
            if (res.data.success) {
                setHistory(res.data.data || []);
            }
            setLastSynced(new Date().toLocaleTimeString());
            document.title = `Broadcast Center | ${settings.siteName}`;
        } catch (err) {
            console.error("Communication Cluster Sync Failure.");
        } finally {
            setLoading(false);
        }
    }, [settings.siteName]);

    useEffect(() => {
        fetchBroadcastHistory();
        
        // Auto-refresh when admin returns to this window
        window.addEventListener('focus', fetchBroadcastHistory);
        return () => window.removeEventListener('focus', fetchBroadcastHistory);
    }, [fetchBroadcastHistory]);

    // 2. 🚀 Global Announcement Dispatch (Actual API Dispatch)
    const handleDispatch = async (e) => {
        e.preventDefault();
        if (!formData.heading.trim() || formData.content.length < 10) {
            return toast.warning("Validation Error: Comprehensive content is required.");
        }

        if (!window.confirm(`CRITICAL: Broadcast this session to ${formData.target}?`)) return;

        setIsSending(true);
        try {
            const res = await api.post('/admin/support/broadcast/send', formData);
            if (res.data.success) {
                toast.success("🚀 Protocol Success: Broadcast synchronized across all nodes!");
                setFormData({ heading: "", content: "", target: "All Registered Users", priority: "Normal" });
                fetchBroadcastHistory(); 
            }
        } catch (err) {
            toast.error("Handshake Failed: Cluster node unreachable.");
        } finally {
            setIsSending(false);
        }
    };

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Connecting to Broadcast Registry...</p>
        </div>
    );

    return (
        <div style={containerS}>
            {/* --- [A] COMMAND HEADER --- */}
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>📢 Global Broadcast Center</h2>
                    <p style={subTitleS}>Push real-time announcements and emergency protocols to {settings.siteName} nodes.</p>
                </div>
                <div style={syncBadge}>
                    <span className="pulse-dot"></span>
                    <small>Real-time Sync: {lastSynced}</small>
                </div>
            </div>

            <div style={layoutGrid}>
                {/* --- [B] LEFT: ANNOUNCEMENT COMPOSER --- */}
                <div style={broadcastCard}>
                    <h3 style={secTitle(themeColor)}>🆕 Compose Emergency Protocol</h3>
                    <p style={nodeHintS}>Targeted notification dispatch for system-wide alerts.</p>

                    <form onSubmit={handleDispatch}>
                        <div style={inputGroup}>
                            <label style={labS}>Announcement Heading *</label>
                            <input 
                                style={inS} 
                                maxLength="80"
                                value={formData.heading}
                                onChange={(e) => setFormData({...formData, heading: e.target.value})}
                                placeholder="e.g. Scheduled Maintenance Update" 
                                required
                            />
                        </div>

                        <div style={inputGroup}>
                            <label style={labS}>Message Content (Protocol Details) *</label>
                            <textarea 
                                style={areaS} 
                                value={formData.content}
                                onChange={(e) => setFormData({...formData, content: e.target.value})}
                                placeholder="Write the full announcement details here..."
                                required
                            ></textarea>
                        </div>

                        <div style={gridRowS}>
                            <div style={inputGroup}>
                                <label style={labS}>Node Target Audience</label>
                                <select 
                                    style={inS} 
                                    value={formData.target}
                                    onChange={(e) => setFormData({...formData, target: e.target.value})}
                                >
                                    <option value="All">Global (All Users)</option>
                                    <option value="ShopOwner">Merchant Hubs Only</option>
                                    <option value="Customer">Client Profiles Only</option>
                                    <option value="DistrictAdmin">District Command Nodes</option>
                                    <option value="StateAdmin">State Command Nodes</option>
                                </select>
                            </div>
                            <div style={inputGroup}>
                                <label style={labS}>Transmission Priority</label>
                                <select 
                                    style={inS}
                                    value={formData.priority}
                                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                >
                                    <option value="Normal">Normal (Silent Sync)</option>
                                    <option value="High">High (Immediate Alert)</option>
                                    <option value="Critical">Critical (System Override)</option>
                                </select>
                            </div>
                        </div>

                        {/* Visual Preview Mode */}
                        <div style={previewBoxS(themeColor)}>
                            <div style={previewHeaderS}><span style={dotActive}></span> PREVIEW ON MOBILE</div>
                            <div style={previewContentS}>
                                <b style={{display:'block', color:'#1e293b'}}>{formData.heading || 'Announcement Title'}</b>
                                <p style={{fontSize:'12px', margin:'5px 0 0', color:'#64748b', fontWeight:'500'}}>{formData.content || 'Message summary will manifest here...'}</p>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            style={isSending ? btnDisabledS : sendBtn(themeColor)}
                            disabled={isSending}
                        >
                            {isSending ? '📡 DISPATCHING ACROSS CLUSTER...' : '🚀 DISPATCH ANNOUNCEMENT'}
                        </button>
                    </form>
                </div>

                {/* --- [C] RIGHT: TRANSMISSION HISTORY --- */}
                <div style={historyCard}>
                    <h3 style={secTitle(themeColor)}>📜 Transmission Registry</h3>
                    <p style={nodeHintS}>Log of dispatched announcements.</p>

                    <div className="custom-scroll" style={listS}>
                        {history.length === 0 ? (
                            <div style={emptyS}>No previous transmissions found in hub.</div>
                        ) : (
                            [...history].reverse().map(log => (
                                <div key={log._id} style={logItemS}>
                                    <div style={{flex: 1}}>
                                        <div style={logHeadingS}>{log.heading}</div>
                                        <small style={logMetaS}>
                                            Target: {log.target} • {new Date(log.createdAt).toLocaleDateString()}
                                        </small>
                                    </div>
                                    <span style={priorityBadge(log.priority)}>
                                        {log.priority}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                    <div style={footerAuditS}>Audit Log ID: {settings._id || 'Master_Registry'}</div>
                </div>
            </div>

            <style>{`
                .spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; animation: pulse-anim 2s infinite; margin-right: 8px; }
                @keyframes pulse-anim { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; } 100% { opacity: 1; } }
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Definitions ---

const containerS = { padding: '10px', minHeight: '100vh', animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerFlex = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'40px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin: 0, fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '900', color: '#0f172a', letterSpacing:'-1px' };
const subTitleS = { color: '#64748b', fontSize: '14px', marginTop:'5px', fontWeight:'500' };

const syncBadge = { display:'flex', alignItems:'center', background:'#fff', padding:'10px 18px', borderRadius:'14px', border:'1px solid #f1f5f9', color:'#94a3b8', fontSize:'11px', fontWeight:'800' };

const layoutGrid = { display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1.6fr 1fr', gap: '30px' };

const broadcastCard = { background: '#fff', padding: window.innerWidth < 768 ? '25px' : '40px', borderRadius: '40px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' };
const historyCard = { background: '#fff', padding: '30px', borderRadius: '40px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', height:'fit-content', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' };

const secTitle = (color) => ({ marginTop: 0, marginBottom: '25px', fontSize: '18px', fontWeight: '900', color: '#0f172a', borderLeft: `5px solid ${color}`, paddingLeft: '15px', letterSpacing:'-0.5px' });
const nodeHintS = { fontSize:'12px', color:'#cbd5e1', marginTop:'-15px', marginBottom:'25px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1px' };

const inputGroup = { marginBottom: '22px' };
const labS = { display: 'block', fontWeight: '900', fontSize: '10px', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1.5px' };
const inS = { width: '100%', padding: '16px', borderRadius: '16px', border: '1.5px solid #f1f5f9', boxSizing: 'border-box', outline: 'none', fontSize: '14px', background: '#f8fafc', fontWeight:'700', color:'#1e293b', transition:'0.3s' };
const areaS = { ...inS, height: '140px', resize: 'none', lineHeight:'1.6' };

const gridRowS = { display: 'grid', gridTemplateColumns: window.innerWidth < 600 ? '1fr' : '1fr 1fr', gap: '20px' };

// ✅ Fixed Syntax Error here
const previewBoxS = (color) => ({ 
    padding:'20px', 
    borderRadius:'22px', 
    background:'#f8fafc', 
    border:`1px dashed ${color}44`, 
    marginBottom:'25px' 
});

const previewHeaderS = { fontSize:'9px', fontWeight:'900', color:'#94a3b8', marginBottom:'10px', display:'flex', alignItems:'center', gap:'8px' };
const dotActive = { width:'6px', height:'6px', borderRadius:'50%', background:'#10b981' };
const previewContentS = { background:'#fff', padding:'15px', borderRadius:'15px', border:'1px solid #e2e8f0', boxShadow:'0 4px 10px rgba(0,0,0,0.02)' };

const sendBtn = (color) => ({ width: '100%', padding: '20px', background: color, color: '#fff', border: 'none', borderRadius: '20px', fontWeight: '900', cursor: 'pointer', fontSize: '14px', letterSpacing: '1px', boxShadow: `0 10px 20px ${color}33`, transition:'0.3s' });
const btnDisabledS = { ...sendBtn('#cbd5e1'), background: '#f1f5f9', color: '#cbd5e1', cursor: 'not-allowed', boxShadow:'none' };

const listS = { flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' };
const logItemS = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9', transition:'0.3s' };
const logHeadingS = { fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom:'4px' };
const logMetaS = { fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform:'uppercase' };

const priorityBadge = (p) => ({
    background: p === 'Critical' ? '#fff1f2' : p === 'High' ? '#fffbeb' : '#ecfdf5',
    color: p === 'Critical' ? '#f43f5e' : p === 'High' ? '#d97706' : '#10b981',
    padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing:'0.5px'
});

const footerAuditS = { marginTop: '25px', fontSize: '10px', color: '#cbd5e1', fontWeight: '800', borderTop:'1px solid #f8fafc', paddingTop:'15px', textAlign:'left', letterSpacing:'1px' };
const emptyS = { textAlign:'center', color:'#cbd5e1', fontSize:'14px', padding:'60px 20px', fontWeight:'800' };

const loaderS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '70vh', background:'#f8fafc', gap:'20px' };

export default BroadcastCenter;