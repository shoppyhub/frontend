import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../../services/api';
import { toast } from 'react-toastify';
import { useBranding } from '../../../../context/BrandingContext'; // For White-labeling

const SystemComplaints = () => {
    const { settings } = useBranding();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());
    
    // Filter & Search States
    const [statusFilter, setStatusFilter] = useState("Open"); 
    const [searchQuery, setSearchQuery] = useState("");

    // 1. 📡 Automatic Synchronization Protocol (No Buttons)
    const fetchComplaints = useCallback(async () => {
        try {
            // Initial sync shows loader, background refreshes are silent
            const res = await api.get('/admin/support/complaints');
            if (res.data.success) {
                setComplaints(res.data.data || []);
                setError(null);
            }
            setLastSynced(new Date().toLocaleTimeString());
            document.title = `Support Desk | ${settings.siteName}`;
        } catch (err) {
            console.error("Support Registry Sync Failure.");
            setError("Connectivity Alert: Node registry unreachable.");
        } finally {
            setLoading(false);
        }
    }, [settings.siteName]);

    useEffect(() => {
        fetchComplaints();
        // Auto-refresh when admin returns to this window (SaaS Protocol)
        window.addEventListener('focus', fetchComplaints);
        return () => window.removeEventListener('focus', fetchComplaints);
    }, [fetchComplaints]);

    // 2. 🔍 Discovery & Filter Engine
    const filteredComplaints = useMemo(() => {
        return complaints.filter(c => {
            const matchesStatus = statusFilter === "All" || c.status === statusFilter;
            const matchesSearch = 
                (c.orderId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.subject || "").toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesStatus && matchesSearch;
        });
    }, [complaints, statusFilter, searchQuery]);

    // 3. 🛠️ Operation: Resolve Grievance
    const handleResolve = async (id) => {
        if (!window.confirm("CRITICAL: Finalize audit and mark this grievance as Resolved?")) return;

        try {
            await api.put(`/admin/support/complaints/resolve/${id}`);
            toast.success("Protocol Success: Grievance resolved and logged. ✅");
            fetchComplaints(); // Silent Re-sync
        } catch (err) {
            toast.error("Operation Denied: Security handshake error.");
        }
    };

    // 4. 📱 Operation: Encrypted WhatsApp Contact
    const handleWhatsApp = (mobile, orderId) => {
        const message = `Hello, this is ${settings.siteName} Support regarding your complaint for Order #${orderId || 'Recent Order'}.`;
        window.open(`https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const themeColor = settings?.themeColor || '#0f172a';

    const priorityBadge = (p) => {
        const styles = {
            'High': { bg: '#fff1f2', col: '#f43f5e' },
            'Normal': { bg: '#f8fafc', col: '#64748b' },
            'Critical': { bg: '#7f1d1d', col: '#fff' }
        };
        const s = styles[p] || styles['Normal'];
        return { 
            fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', 
            color: s.col, background: s.bg, padding: '4px 12px', borderRadius: '20px',
            border: `1px solid ${s.col}20`
        };
    };

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Accessing Support Cluster...</p>
        </div>
    );

    return (
        <div style={containerS}>
            {/* --- [A] COMMAND HEADER & METRICS --- */}
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>🎧 Support Command Center</h2>
                    <p style={subTitleS}>Strategic management and high-level resolution of system grievances for {settings.siteName}.</p>
                </div>
                <div style={statsRow}>
                    <div style={statCard('#f43f5e')}>
                        <small style={statLab}>OPEN TICKETS</small>
                        <b style={statVal}>{complaints.filter(c => c.status === 'Open').length} Nodes</b>
                    </div>
                    <div style={statCard('#f59e0b')}>
                        <small style={statLab}>URGENT NODES</small>
                        <b style={statVal}>{complaints.filter(c => c.priority === 'High' && c.status === 'Open').length} High</b>
                    </div>
                    <div style={syncBadge}>
                        <span className="pulse-dot"></span>
                        <small>{lastSynced}</small>
                    </div>
                </div>
            </div>

            {/* --- [B] DISCOVERY TOOLBAR --- */}
            <div style={toolbarS}>
                <div style={searchBox}>
                    <span>🔍</span>
                    <input 
                        style={inSearch} 
                        placeholder="Search by ID, Identity or Subject..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div style={tabGroup}>
                    <button style={statusFilter === 'Open' ? activeTab(themeColor) : inactiveTab} onClick={() => setStatusFilter('Open')}>Open Tickets</button>
                    <button style={statusFilter === 'Resolved' ? activeTab(themeColor) : inactiveTab} onClick={() => setStatusFilter('Resolved')}>Archive</button>
                    <button style={statusFilter === 'All' ? activeTab(themeColor) : inactiveTab} onClick={() => setStatusFilter('All')}>Global Logs</button>
                </div>
            </div>

            {/* --- [C] COMPLAINT STREAM GRID --- */}
            <div style={streamGrid}>
                {error && <div style={errorArea}>{error}</div>}

                {filteredComplaints.length === 0 && !error ? (
                    <div style={emptyS}>
                        <div style={{fontSize:'60px', marginBottom:'20px'}}>✅</div>
                        <h3 style={{margin:0}}>Registry Clean</h3>
                        <p>No active grievances found in this sector.</p>
                    </div>
                ) : (
                    filteredComplaints.map((c) => (
                        <div key={c._id} style={compCard(c.status)}>
                            <div style={cardHeader}>
                                <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                                    <span style={orderIdS}>TICKET_ID: #{c._id?.toUpperCase().slice(-8)}</span>
                                    <span style={priorityBadge(c.priority)}>● {c.priority || 'NORMAL'}</span>
                                </div>
                                <div style={dateS}>{new Date(c.createdAt).toLocaleString()}</div>
                            </div>

                            <div style={msgContainer}>
                                <h4 style={subjectS}>"{c.subject}"</h4>
                                <p style={bodyTextS}>{c.message}</p>
                            </div>

                            <div style={cardFooter}>
                                <div style={metaInfo}>
                                    <div style={userRow}>
                                        <span style={uName}>👤 {c.customerName}</span>
                                        <span style={uMobile(themeColor)} onClick={() => handleWhatsApp(c.customerMobile, c.orderId)}>
                                            📱 {c.customerMobile} <small>(Click to Chat)</small>
                                        </span>
                                    </div>
                                    <div style={shopRow}>
                                        <span>Fulfilled at: <b>{c.shopName || 'Global Infrastructure'}</b></span>
                                        <small style={distTag}>📍 {c.district?.toUpperCase() || 'SYSTEM'}</small>
                                    </div>
                                </div>
                                
                                <div style={actionArea}>
                                    {c.status === 'Open' ? (
                                        <button style={btnResolve(themeColor)} onClick={() => handleResolve(c._id)}>RESOLVE PROTOCOL</button>
                                    ) : (
                                        <div style={resolvedBadge}>✅ RESOLUTION COMMITTED</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <div style={footerAuditS}>
                🛡️ <b>Registry Compliance:</b> All support interactions are logged and audited within the {settings.siteName} central registry.
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

// --- Enterprise Visual Definitions ---

const containerS = { padding: '10px', minHeight: '100vh', animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin: 0, fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '900', color: '#0f172a', letterSpacing:'-1px' };
const subTitleS = { margin: '8px 0 0', color: '#64748b', fontSize: '14px', fontWeight: '500' };

const statsRow = { display: 'flex', gap: '15px', alignItems:'center' };
const statCard = (color) => ({ background: '#fff', padding: '15px 25px', borderRadius: '24px', borderLeft: `6px solid ${color}`, boxShadow: '0 4px 10px rgba(0,0,0,0.02)', borderTop:'1px solid #f1f5f9', borderRight:'1px solid #f1f5f9', borderBottom:'1px solid #f1f5f9' });
const statLab = { fontSize: '9px', fontWeight: '900', color: '#cbd5e1', textTransform:'uppercase', letterSpacing: '1px' };
const statVal = { fontSize: '20px', fontWeight: '900', color: '#0f172a', marginTop:'5px', display:'block' };
const syncBadge = { display:'flex', alignItems:'center', background:'#fff', padding:'10px 18px', borderRadius:'14px', border:'1px solid #f1f5f9', color:'#94a3b8', fontSize:'11px', fontWeight:'800' };

const toolbarS = { display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '35px', flexWrap: 'wrap', alignItems:'center' };
const searchBox = { flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', background:'#fff', padding:'0 15px', borderRadius:'16px', border:'1.5px solid #f1f5f9', boxShadow:'0 10px 30px rgba(0,0,0,0.02)' };
const inSearch = { border: 'none', width: '100%', padding: '14px 0', outline: 'none', fontSize: '14px', background: 'transparent', fontWeight:'700', color:'#1e293b' };

const tabGroup = { display: 'flex', background: '#fff', padding: '6px', borderRadius: '18px', border: '1.5px solid #f1f5f9', gap: '8px' };
const inactiveTab = { padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '12px', color: '#94a3b8', fontWeight: '900', fontSize: '11px', textTransform:'uppercase', transition:'0.3s' };
const activeTab = (color) => ({ ...inactiveTab, background: color, color: '#fff', boxShadow: `0 4px 12px \${color}33` });

const streamGrid = { display: 'flex', flexDirection: 'column', gap: '25px' };
const compCard = (status) => ({
    background: '#fff', padding: window.innerWidth < 768 ? '25px' : '35px', borderRadius: '35px', border: '1px solid #f1f5f9',
    borderTop: status === 'Open' ? '8px solid #f43f5e' : '8px solid #10b981',
    boxShadow: '0 10px 30px rgba(0,0,0,0.02)', animation:'fadeIn 0.4s ease'
});

const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const orderIdS = { background: '#f8fafc', padding: '6px 14px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing:'1px' };
const dateS = { fontSize: '11px', color: '#cbd5e1', fontWeight: '800' };

const msgContainer = { background: '#f8fafc', padding: '25px', borderRadius: '25px', marginBottom: '25px', border: '1.5px solid #f1f5f9' };
const subjectS = { margin: '0 0 10px 0', fontSize: '18px', color: '#0f172a', fontWeight: '900', letterSpacing:'-0.5px' };
const bodyTextS = { margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.7', fontWeight:'500' };

const cardFooter = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '25px', borderTop: '1.5px solid #f8fafc', flexWrap:'wrap', gap:'20px' };
const metaInfo = { display: 'flex', flexDirection: 'column', gap: '12px' };
const userRow = { display: 'flex', gap: '30px', alignItems: 'center', flexWrap:'wrap' };
const uName = { fontSize: '15px', fontWeight: '900', color: '#1e293b', letterSpacing:'-0.5px' };
const uMobile = (color) => ({ fontSize: '13px', fontWeight: '900', color: '#22c55e', cursor: 'pointer', background: '#ecfdf5', padding:'5px 12px', borderRadius:'10px', border:`1px solid #dcfce7` });
const shopRow = { display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px', color: '#94a3b8', fontWeight:'700' };
const distTag = { background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '900', letterSpacing:'0.5px' };

const actionArea = { display: 'flex', alignItems: 'center' }; 
const btnResolve = (color) => ({ background: color, color: '#fff', border: 'none', padding: '14px 30px', borderRadius: '15px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', boxShadow: `0 8px 15px \${color}33`, transition:'0.3s' });
const resolvedBadge = { color: '#10b981', fontWeight: '900', fontSize: '13px', letterSpacing:'1px' };

const emptyS = { textAlign: 'center', padding: '100px 40px', color: '#cbd5e1', background: '#fff', borderRadius: '40px', border: '1px dashed #f1f5f9' };
const loaderS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background:'#f8fafc', gap:'20px' };
const errorArea = { padding:'20px', textAlign:'center', color:'#f43f5e', fontWeight:'900', background:'#fff1f2', borderRadius:'18px', marginBottom:'25px', border:'1px solid #fee2e2' };
const footerAuditS = { marginTop: '40px', fontSize: '11px', color: '#cbd5e1', textAlign: 'center', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' };

export default SystemComplaints;