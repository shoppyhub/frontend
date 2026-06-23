import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from 'services/api'; 
import { useBranding } from 'context/BrandingContext';

const SubAdminManagement = () => {
    const navigate = useNavigate();
    const { settings } = useBranding();
    
    // --- States ---
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());
    const [sortBy, setSortBy] = useState('name'); // 'name' or 'id'
    
    const requestIdRef = useRef(0);
    const didInitialFetchRef = useRef(false);

    // 1. 📡 Registry Sync Logic
    const fetchMembers = useCallback(async (silent = false) => {
        const currentRequestId = ++requestIdRef.current;
        try {
            if (!silent && members.length === 0) setLoading(true);
            else setIsRefreshing(true);

            const res = await api.get(`/admin/hierarchy/members?role=SubSystemAdmin&limit=100`, {
                timeout: 45000
            });
            if (currentRequestId !== requestIdRef.current) return;
            
            if (res.data && res.data.success) {
                const data = res.data.data || [];
                setMembers(data);
                setLastSynced(new Date().toLocaleTimeString());
                sessionStorage.setItem('rkd_subadmin_members_cache', JSON.stringify(data));
            }
        } catch (err) {
            if (currentRequestId !== requestIdRef.current) return;
            toast.error("Registry handshake failed.");
        } finally {
            if (currentRequestId !== requestIdRef.current) return;
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [members.length]);

    useEffect(() => {
        if (didInitialFetchRef.current) return;
        didInitialFetchRef.current = true;

        const cached = sessionStorage.getItem('rkd_subadmin_members_cache');
        if (cached) {
            setMembers(JSON.parse(cached));
            setLoading(false);
        }
        fetchMembers(true);
    }, [fetchMembers]);

    // 2. 🔐 Status Modulation
    const handleToggleStatus = async (id, currentStatus) => {
        const action = currentStatus ? 'SUSPEND' : 'ACTIVATE';
        if (!window.confirm(`PROTOCOL: ${action} this node?`)) return;
        
        try {
            const res = await api.patch(`/admin/hierarchy/status/${id}`, { isActive: !currentStatus });
            if (res.data.success) {
                toast.success(`Node successfully ${action}ED.`);
                fetchMembers(true);
            }
        } catch (err) { toast.error("Update Failed."); }
    };

    // 3. 🔍 Discovery & Analytics
    const filtered = useMemo(() => {
        let result = members.filter(m => {
            const target = `${m.fullName} ${m.generatedId} ${m.mobile} ${m.department}`.toLowerCase();
            return target.includes(searchTerm.toLowerCase());
        });
        
        if (sortBy === 'name') result.sort((a, b) => a.fullName.localeCompare(b.fullName));
        return result;
    }, [members, searchTerm, sortBy]);

    const stats = useMemo(() => ({
        total: members.length,
        active: members.filter(m => m.isActive).length,
        suspended: members.filter(m => !m.isActive).length
    }), [members]);

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(members));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "subadmin_registry.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        toast.info("Registry exported successfully.");
    };

    const themeColor = settings?.themeColor || '#0f172a';
    const textColor = settings?.headerTextColor || '#ffffff';

    if (loading) return (
        <div style={loaderWrapperS}>
            <div className="rkd-spinner"></div>
            <p style={{marginTop:'15px', fontWeight:'900', color:'#94a3b8'}}>ESTABLISHING PERSONNEL LINK...</p>
        </div>
    );

    return (
        <div style={containerS}>
            {/* --- [A] COMMAND HEADER --- */}
            <div style={headerFlexS}>
                <div style={{flex: 1}}>
                    <h2 style={titleS}>🛡️ Sub-Admin Infrastructure</h2>
                    <p style={subS}>Registry of authorized administrative nodes.</p>
                </div>
                <div style={actionRowS}>
                    <div style={syncBadgeS}>
                        <span className={`pulse-dot ${isRefreshing ? 'syncing' : ''}`}></span>
                        <small>SYNC: {lastSynced}</small>
                    </div>
                    <button style={exportBtnS} onClick={handleExport}>📥 EXPORT</button>
                    <button style={addBtnS(themeColor, textColor)} onClick={() => navigate('/admin/subadmins/add')}>
                        + PROVISION NEW NODE
                    </button>
                </div>
            </div>

            {/* --- [B] ANALYTICS BAR --- */}
            <div style={analyticsGridS}>
                <StatCard label="Total Nodes" val={stats.total} color={themeColor} />
                <StatCard label="Operational" val={stats.active} color="#10b981" />
                <StatCard label="Suspended" val={stats.suspended} color="#f43f5e" />
            </div>

            {/* --- [C] DISCOVERY TOOLBAR --- */}
            <div style={toolbarS}>
                <div style={searchBoxS}>
                    <span style={{opacity: 0.5}}>🔍</span>
                    <input style={inS} placeholder="Search Name, ID, Mobile..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <select style={sortSelectS} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="name">Sort by Name</option>
                    <option value="id">Sort by ID</option>
                </select>
            </div>

            {/* --- [D] MASTER REGISTRY (RESPONSIVE) --- */}
            <div style={tableCardS}>
                {/* Desktop View */}
                <div className="desktop-only">
                    <table style={tableS}>
                        <thead>
                            <tr style={thRowS}>
                                <th style={tdS}>Identity</th>
                                <th style={tdS}>Communication Hub</th>
                                <th style={tdS}>Dept.</th>
                                <th style={tdS}>ID</th>
                                <th style={tdS}>Status</th>
                                <th style={tdS}>Command</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan="6" style={noDataS}>Registry Clean: No nodes discovered.</td></tr>
                            ) : (
                                filtered.map(m => (
                                    <tr key={m._id} style={trS}>
                                        <td style={tdS}>
                                            <div style={profileCellS}>
                                                <img src={m.adminPhoto || m.photo || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} style={avatarS} alt="P" />
                                                <b style={uNameS}>{m.fullName}</b>
                                            </div>
                                        </td>
                                        <td style={tdS}>
                                            <div style={contactBoxS}>
                                                <div style={mobS}>📱 {m.mobile}</div>
                                                <div style={emailS}>{m.primaryEmail || m.email}</div>
                                            </div>
                                        </td>
                                        <td style={tdS}><span style={deptBadgeS}>{m.department || 'OPS'}</span></td>
                                        <td style={tdS}><code style={idLabelS}>{m.generatedId || 'PENDING'}</code></td>
                                        <td style={tdS}>
                                            <div style={statusBadgeS(m.isActive)} onClick={() => handleToggleStatus(m._id, m.isActive)}>
                                                <span style={dotStyleS(m.isActive)}></span>
                                                {m.isActive ? 'ACTIVE' : 'LOCKED'}
                                            </div>
                                        </td>
                                        <td style={tdS}>
                                            <button style={auditBtnS(themeColor)} onClick={() => navigate(`/admin/subadmin-details/${m._id}`)}>AUDIT</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="mobile-only">
                    {filtered.map(m => (
                        <div key={m._id} style={mobileCardS}>
                            <div style={profileCellS}>
                                <img src={m.adminPhoto || m.photo || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} style={avatarS} alt="P" />
                                <div style={{flex: 1}}>
                                    <b style={uNameS}>{m.fullName}</b>
                                    <div style={emailS}>{m.generatedId}</div>
                                </div>
                                <div style={statusBadgeS(m.isActive)} onClick={() => handleToggleStatus(m._id, m.isActive)}>
                                    {m.isActive ? 'ACTIVE' : 'LOCKED'}
                                </div>
                            </div>
                            <div style={cardDividerS}></div>
                            <div style={cardRowS}>
                                <span>📱 {m.mobile}</span>
                                <span style={deptBadgeS}>{m.department || 'OPS'}</span>
                            </div>
                            <button style={{...auditBtnS(themeColor), width:'100%', marginTop:'15px', padding:'12px'}} onClick={() => navigate(`/admin/subadmin-details/${m._id}`)}>AUDIT NODE</button>
                        </div>
                    ))}
                    {filtered.length === 0 && <div style={noDataS}>No nodes discovered.</div>}
                </div>
            </div>

            <style>{`
                .rkd-spinner { width:45px; height:45px; border:5px solid #eee; border-top:5px solid ${themeColor}; border-radius:50%; animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform:rotate(360deg); } }
                .pulse-dot { width:8px; height:8px; background:#10b981; border-radius:50%; display:inline-block; animation: pulse 2s infinite; margin-right:8px; }
                .syncing { background:#3b82f6; }
                @keyframes pulse { 0% { opacity:1; } 50% { opacity:0.3; } 100% { opacity:1; } }
                
                @media (max-width: 768px) {
                    .desktop-only { display: none; }
                    .mobile-only { display: block; }
                }
                @media (min-width: 769px) {
                    .desktop-only { display: block; }
                    .mobile-only { display: none; }
                }
            `}</style>
        </div>
    );
};

// --- Helper Components ---
const StatCard = ({ label, val, color }) => (
    <div style={statCardS}>
        <div style={{fontSize:'22px', fontWeight:'900', color}}>{val}</div>
        <div style={{fontSize:'10px', fontWeight:'800', color:'#94a3b8', textTransform:'uppercase'}}>{label}</div>
    </div>
);

// --- Strategic SaaS Styles ---
const containerS = { padding: '20px', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background:'#f8fafc' };
const headerFlexS = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin: 0, fontSize:'24px', fontWeight:'900', color:'#0f172a', letterSpacing:'-1px' };
const subS = { color:'#64748b', fontSize:'13px', marginTop:'4px' };
const actionRowS = { display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap' };
const syncBadgeS = { display:'flex', alignItems:'center', background:'#fff', padding:'10px 15px', borderRadius:'12px', border:'1.5px solid #e2e8f0', color:'#94a3b8', fontSize:'10px', fontWeight:'800' };

const addBtnS = (bg, txt) => ({ background: bg, color: txt, border:'none', padding:'14px 24px', borderRadius:'14px', fontWeight:'900', cursor:'pointer', fontSize:'10px' });
const exportBtnS = { background:'#fff', color:'#475569', border:'1.5px solid #e2e8f0', padding:'12px 20px', borderRadius:'14px', fontWeight:'800', fontSize:'10px', cursor:'pointer' };

const analyticsGridS = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'15px', marginBottom:'25px' };
const statCardS = { background:'#fff', padding:'20px', borderRadius:'20px', border:'1px solid #e2e8f0', textAlign:'center' };

const toolbarS = { marginBottom:'25px', display:'flex', gap:'15px', flexWrap:'wrap' };
const searchBoxS = { flex:1, display:'flex', alignItems:'center', gap:'12px', background:'#fff', padding:'0 15px', borderRadius:'15px', border:'1.5px solid #e2e8f0', minWidth:'250px' };
const inS = { border:'none', padding:'12px 0', outline:'none', fontWeight:'700', fontSize:'14px', flex:1 };
const sortSelectS = { padding:'12px 15px', borderRadius:'15px', border:'1.5px solid #e2e8f0', fontWeight:'700', fontSize:'13px', outline:'none', cursor:'pointer' };

const tableCardS = { background:'#fff', borderRadius:'25px', border:'1.5px solid #e2e8f0', overflow:'hidden' };
const tableS = { width:'100%', borderCollapse:'collapse', textAlign:'left' };
const thRowS = { background:'#f8fafc', borderBottom:'2px solid #e2e8f0' };
const tdS = { padding:'18px 20px', borderBottom:'1px solid #f1f5f9', fontSize:'13px' };
const trS = { transition:'0.2s', ':hover': { background: '#fcfdfe' } };

const profileCellS = { display:'flex', alignItems:'center', gap:'12px' };
const avatarS = { width:'40px', height:'40px', borderRadius:'12px', objectFit:'cover' };
const uNameS = { color:'#1e293b', fontSize:'14px', fontWeight:'800' };

const contactBoxS = { display:'flex', flexDirection:'column', gap:'2px' };
const mobS = { fontWeight:'800', color:'#475569', fontSize:'12px' };
const emailS = { fontSize:'11px', color:'#94a3b8', fontWeight:'600' };

const deptBadgeS = { background:'#f1f5f9', padding:'5px 10px', borderRadius:'8px', fontSize:'10px', fontWeight:'900', color:'#64748b' };
const idLabelS = { background:'#f8fafc', padding:'4px 8px', borderRadius:'6px', fontSize:'11px', color: '#0f172a', fontWeight:'900', border:'1px solid #eef2f6' };

const statusBadgeS = (active) => ({ background: active ? '#ecfdf5' : '#fff1f2', color: active ? '#10b981' : '#f43f5e', padding:'6px 12px', borderRadius:'10px', fontSize:'10px', fontWeight:'900', display:'flex', alignItems:'center', gap:'6px', cursor:'pointer', border: active ? '1px solid #d1fae5' : '1px solid #fee2e2', width:'fit-content' });
const dotStyleS = (active) => ({ width:'6px', height:'6px', borderRadius:'50%', background: active ? '#10b981' : '#f43f5e' });

const auditBtnS = (bg) => ({ background: `${bg}08`, color: bg, border:`1.5px solid \${bg}30`, padding:'10px 15px', borderRadius:'10px', fontWeight:'900', fontSize:'10px', cursor:'pointer' });
const noDataS = { padding:'80px', textAlign:'center', color:'#cbd5e1', fontSize:'16px', fontWeight:'800' };
const loaderWrapperS = { display:'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '80vh' };

const mobileCardS = { background:'#fff', padding:'20px', margin:'10px', borderRadius:'20px', border:'1.5px solid #e2e8f0' };
const cardDividerS = { height:'1px', background:'#f1f5f9', margin:'15px 0' };
const cardRowS = { display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'12px', fontWeight:'800', color:'#475569' };

export default SubAdminManagement;