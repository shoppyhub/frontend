import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// ✅ Vite Aliases
import api from 'services/api'; 
import { useBranding } from 'context/BrandingContext';

/**
 * RKD_MART - Master District Governance Hub
 */
const DistrictAdminManagement = () => {
    const navigate = useNavigate();
    const { settings } = useBranding();
    
    // --- System States ---
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());
    const [sortBy, setSortBy] = useState('name');
    
    const requestIdRef = useRef(0);
    const didInitialFetchRef = useRef(false);

    // 1. 📡 District Registry Synchronization
    const fetchDistrictNodes = useCallback(async (silent = false) => {
        const currentRequestId = ++requestIdRef.current;
        try {
            if (!silent && members.length === 0) setLoading(true);
            setIsRefreshing(true);

            const res = await api.get(`/admin/hierarchy/members?role=DistrictAdmin&limit=100`, {
                timeout: 120000 
            });
            
            if (currentRequestId !== requestIdRef.current) return;
            
            if (res.data && res.data.success) {
                const data = res.data.data || [];
                setMembers(data);
                sessionStorage.setItem('rkd_district_admin_cache', JSON.stringify(data));
            }
            setLastSynced(new Date().toLocaleTimeString());
        } catch (err) {
            if (currentRequestId !== requestIdRef.current) return;
            if (!silent) toast.error("District Registry handshake failed.");
        } finally {
            if (currentRequestId !== requestIdRef.current) return;
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [members.length]);

    useEffect(() => {
        if (didInitialFetchRef.current) return;
        didInitialFetchRef.current = true;

        const cached = sessionStorage.getItem('rkd_district_admin_cache');
        if (cached) {
            setMembers(JSON.parse(cached));
            setLoading(false);
        }
        fetchDistrictNodes(true);
    }, [fetchDistrictNodes]);

    // 2. 🔐 Status Toggle Logic
    const handleToggleStatus = async (id, currentStatus) => {
        const action = currentStatus ? 'SUSPEND' : 'ACTIVATE';
        if (!window.confirm(`DISTRICT PROTOCOL: Confirm ${action} for this district hub?`)) return;
        
        try {
            const res = await api.patch(`/admin/hierarchy/status/${id}`, { isActive: !currentStatus });
            if (res.data.success) {
                toast.success(`District node ${action}ED successfully.`);
                fetchDistrictNodes(true);
            }
        } catch (err) { toast.error("Update failed."); }
    };

    // 3. 🔍 Discovery & Sort Engine (FIXED SYNTAX)
    const filtered = useMemo(() => {
        let result = members.filter(m => {
            const target = `${m.fullName} ${m.generatedId} ${m.mobile} ${m.assignedDistrict} ${m.pDistrict} ${m.assignedState}`.toLowerCase();
            return target.includes(searchTerm.toLowerCase());
        });
        
        // Sorting Logic
        if (sortBy === 'name') {
            result.sort((a, b) => a.fullName.localeCompare(b.fullName));
        }

        if (sortBy === 'district') {
            result.sort((a, b) => {
                const distA = (a.assignedDistrict || a.pDistrict || "").toLowerCase();
                const distB = (b.assignedDistrict || b.pDistrict || "").toLowerCase();
                return distA.localeCompare(distB);
            });
        }
        
        return result;
    }, [members, searchTerm, sortBy]);

    // 4. Analytics Calculation
    const analytics = useMemo(() => ({
        total: members.length,
        active: members.filter(m => m.isActive).length,
        offline: members.filter(m => !m.isActive).length
    }), [members]);

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(members));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "district_admin_registry.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const themeColor = settings?.themeColor || '#0f172a';
    const textColor = settings?.headerTextColor || '#ffffff';

    if (loading) return (
        <div style={loaderWrapperS}>
            <div className="rkd-spinner"></div>
            <p style={{marginTop:'15px', fontWeight:'900', color:'#94a3b8'}}>📡 LINKING TO DISTRICT INFRASTRUCTURE...</p>
        </div>
    );

    return (
        <div style={containerS}>
            <div style={headerFlexS}>
                <div style={{flex: 1, minWidth:'280px'}}>
                    <h2 style={titleS}>📍 District Admin Infrastructure</h2>
                    <p style={subS}>Managing local district hubs and field personnel registry.</p>
                </div>
                <div style={actionRowS}>
                    <div style={syncBadgeS}>
                        <span className={`pulse-dot ${isRefreshing ? 'syncing' : ''}`}></span>
                        <small>SYNC: {lastSynced}</small>
                    </div>
                    <button style={whiteBtnS(themeColor)} onClick={() => navigate('/admin/district-operators/add')}>
                        + CREATE OPERATOR
                    </button>
                    <button style={primaryBtnS(themeColor, textColor)} onClick={() => navigate('/admin/districtadmins/add')}>
                        + PROVISION DISTRICT ADMIN
                    </button>
                </div>
            </div>

            <div style={analyticsGridS}>
                <div style={statCardS}>
                    <div style={{fontSize:'22px', fontWeight:'900', color:themeColor}}>{analytics.total}</div>
                    <div style={statLabS}>TOTAL DISTRICT HUBS</div>
                </div>
                <div style={statCardS}>
                    <div style={{fontSize:'22px', fontWeight:'900', color:'#10b981'}}>{analytics.active}</div>
                    <div style={statLabS}>OPERATIONAL</div>
                </div>
                <div style={statCardS}>
                    <div style={{fontSize:'22px', fontWeight:'900', color:'#f43f5e'}}>{analytics.offline}</div>
                    <div style={statLabS}>OFFLINE / LOCKED</div>
                </div>
                <button style={exportBtnS} onClick={handleExport}>📥 EXPORT JSON</button>
            </div>

            <div style={toolbarS}>
                <div style={searchBoxS}>
                    <span>🔍</span>
                    <input style={inS} placeholder="Search by Name, District, ID or Mobile..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <select style={sortSelectS} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="name">Sort by Name</option>
                    <option value="district">Sort by District</option>
                </select>
            </div>

            <div style={displayWrapperS}>
                <div className="desktop-view">
                    <table style={tableS}>
                        <thead>
                            <tr style={thRowS}>
                                <th style={tdS}>Personnel Identity</th>
                                <th style={tdS}>Communication Hub</th>
                                <th style={tdS}>JURISDICTION</th>
                                <th style={tdS}>Registry ID</th>
                                <th style={tdS}>Node Status</th>
                                <th style={tdS}>Command</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan="6" style={noDataS}>District Registry Clear.</td></tr>
                            ) : (
                                filtered.map(m => (
                                    <tr key={m._id} style={trS}>
                                        <td style={tdS}>
                                            <div style={profileCellS}>
                                                <img src={m.adminPhoto || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} style={avatarS} alt="P" />
                                                <b style={uNameS}>{m.fullName}</b>
                                            </div>
                                        </td>
                                        <td style={tdS}>
                                            <div style={contactBoxS}>
                                                <div style={mobS}>📱 {m.mobile}</div>
                                                <div style={emailS}>{m.primaryEmail}</div>
                                            </div>
                                        </td>
                                        <td style={tdS}>
                                            <div style={stateBadgeS}>
                                                📍 {(m.assignedDistrict || m.pDistrict || 'N/A')}, {(m.assignedState || m.pState || '')}
                                            </div>
                                        </td>
                                        <td style={tdS}><code style={idLabelS}>{m.generatedId || 'PENDING'}</code></td>
                                        <td style={tdS}>
                                            <div style={statusBadgeS(m.isActive)} onClick={() => handleToggleStatus(m._id, m.isActive)}>
                                                <span style={dotStyleS(m.isActive)}></span>
                                                {m.isActive ? 'OPERATIONAL' : 'OFFLINE'}
                                            </div>
                                        </td>
                                        <td style={tdS}>
                                            <button style={auditBtnS(themeColor)} onClick={() => navigate(`/admin/district-admin-details/${m._id}`)}>AUDIT NODE</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 📱 Mobile Card View */}
                <div className="mobile-view">
                    {filtered.map(m => (
                        <div key={m._id} style={mobileCardS}>
                            <div style={profileCellS}>
                                <img src={m.adminPhoto || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} style={avatarS} alt="P" />
                                <div style={{flex:1}}>
                                    <b style={uNameS}>{m.fullName}</b>
                                    <div style={emailS}>ID: {m.generatedId}</div>
                                </div>
                                <div style={statusBadgeS(m.isActive)} onClick={() => handleToggleStatus(m._id, m.isActive)}>
                                    {m.isActive ? 'ON' : 'OFF'}
                                </div>
                            </div>
                            <div style={cardDividerS}></div>
                            <div style={cardRowS}>
                                <div style={stateBadgeS}>📍 {(m.assignedDistrict || m.pDistrict || 'N/A')}</div>
                                <div style={mobS}>📱 {m.mobile}</div>
                            </div>
                            <button style={{...primaryBtnS(themeColor, textColor), width:'100%', marginTop:'15px'}} onClick={() => navigate(`/admin/district-admin-details/${m._id}`)}>
                                AUDIT DISTRICT NODE
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .rkd-spinner { width:50px; height:50px; border:5px solid #f3f3f3; border-top:5px solid ${themeColor}; border-radius:50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }
                .pulse-dot { width:8px; height:8px; background:#10b981; border-radius:50%; display:inline-block; animation: pulse 2s infinite; margin-right:8px; }
                .syncing { background:#3b82f6; }
                @keyframes pulse { 0% { opacity:1; } 50% { opacity:0.3; } 100% { opacity:1; } }

                @media (max-width: 768px) { .desktop-view { display: none; } .mobile-view { display: block; } }
                @media (min-width: 769px) { .desktop-view { display: block; } .mobile-view { display: none; } }
            `}</style>
        </div>
    );
};

// --- Strategic Styles ---
const containerS = { padding:'20px', minHeight:'100vh', background:'#f8fafc', fontFamily:"'Plus Jakarta Sans', sans-serif" };
const headerFlexS = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin:0, fontSize:'26px', fontWeight:'900', color:'#0f172a' };
const subS = { color:'#64748b', fontSize:'14px', marginTop:'4px' };
const actionRowS = { display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap' };
const syncBadgeS = { display:'flex', alignItems:'center', background:'#fff', padding:'10px 15px', borderRadius:'12px', border:'1px solid #e2e8f0', color:'#94a3b8', fontSize:'10px', fontWeight:'800' };
const primaryBtnS = (bg, txt) => ({ background:bg, color:txt, border:'none', padding:'13px 22px', borderRadius:'14px', fontWeight:'900', cursor:'pointer', fontSize:'10px' });
const whiteBtnS = (col) => ({ background:'#fff', color:col, border:`1.2px solid ${col}`, padding:'12px 22px', borderRadius:'14px', fontWeight:'900', cursor:'pointer', fontSize:'10px' });
const exportBtnS = { background:'#fff', color:'#475569', border:'1.5px solid #e2e8f0', padding:'10px 20px', borderRadius:'12px', fontWeight:'800', fontSize:'10px', cursor:'pointer' };
const analyticsGridS = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'15px', marginBottom:'25px' };
const statCardS = { background:'#fff', padding:'20px', borderRadius:'20px', border:'1px solid #e2e8f0', textAlign:'center' };
const statLabS = { fontSize:'9px', fontWeight:'800', color:'#94a3b8', marginTop:'5px' };
const toolbarS = { marginBottom:'25px', display:'flex', gap:'15px', flexWrap:'wrap' };
const searchBoxS = { flex:1, display:'flex', alignItems:'center', gap:'12px', background:'#fff', padding:'0 15px', borderRadius:'15px', border:'1.5px solid #e2e8f0' };
const inS = { border:'none', padding:'12px 0', outline:'none', fontWeight:'700', fontSize:'14px', flex:1 };
const sortSelectS = { padding:'12px 15px', borderRadius:'15px', border:'1.5px solid #e2e8f0', fontWeight:'700', fontSize:'13px', cursor:'pointer' };
const displayWrapperS = { background:'#fff', borderRadius:'25px', border:'1px solid #e2e8f0', overflow:'hidden' };
const tableS = { width:'100%', borderCollapse:'collapse', textAlign:'left' };
const thRowS = { background:'#f8fafc', borderBottom:'2px solid #f1f5f9' };
const tdS = { padding:'20px 25px', borderBottom:'1px solid #f8fafc', fontSize:'13px' };
const trS = { transition:'0.2s' };
const profileCellS = { display:'flex', alignItems:'center', gap:'12px' };
const avatarS = { width:'42px', height:'42px', borderRadius:'14px', objectFit:'cover' };
const uNameS = { color:'#1e293b', fontSize:'14px', fontWeight:'850' };
const contactBoxS = { display:'flex', flexDirection:'column', gap:'2px' };
const mobS = { fontWeight:'800', color:'#475569', fontSize:'12px' };
const emailS = { fontSize:'11px', color:'#94a3b8', fontWeight:'600' };
const stateBadgeS = { background:'#eff6ff', padding:'6px 12px', borderRadius:'8px', fontSize:'11px', fontWeight:'900', color:'#2563eb', border:'1px solid #dbeafe', width:'fit-content' };
const idLabelS = { background:'#f8fafc', padding:'5px 10px', borderRadius:'6px', fontSize:'11px', color:'#0f172a', fontWeight:'900', border:'1px solid #e2e8f0' };
const statusBadgeS = (active) => ({ background: active ? '#ecfdf5' : '#fff1f2', color: active ? '#10b981' : '#f43f5e', padding:'6px 14px', borderRadius:'10px', fontSize:'10px', fontWeight:'900', display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', border: active ? '1px solid #d1fae5' : '1px solid #fee2e2', width:'fit-content' });
const dotStyleS = (active) => ({ width:'7px', height:'7px', borderRadius:'50%', background: active ? '#10b981' : '#f43f5e' });
const auditBtnS = (bg) => ({ background:`${bg}08`, color:bg, border:`1.5px solid ${bg}30`, padding:'10px 18px', borderRadius:'10px', fontWeight:'900', fontSize:'10px', cursor:'pointer' });
const noDataS = { padding:'100px', textAlign:'center', color:'#cbd5e1', fontSize:'18px', fontWeight:'800' };
const loaderWrapperS = { height:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' };
const mobileCardS = { background:'#fff', padding:'20px', margin:'15px', borderRadius:'22px', border:'1.5px solid #e2e8f0' };
const cardDividerS = { height:'1.5px', background:'#f1f5f9', margin:'15px 0' };
const cardRowS = { display:'flex', justifyContent:'space-between', alignItems:'center' };

export default DistrictAdminManagement;