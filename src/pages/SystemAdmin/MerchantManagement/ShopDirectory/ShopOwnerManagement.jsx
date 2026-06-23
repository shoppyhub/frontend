import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from 'services/api'; 
import { useBranding } from 'context/BrandingContext';

const ShopOwnerManagement = () => {
    const navigate = useNavigate();
    const { settings } = useBranding();
    
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());
    const [sortBy, setSortBy] = useState('newest');
    
    const requestIdRef = useRef(0);

    const fetchMerchants = useCallback(async (silent = false) => {
        const currentRequestId = ++requestIdRef.current;
        try {
            if (!silent && members.length === 0) setLoading(true);
            setIsRefreshing(true);

            const res = await api.get(`/admin/hierarchy/members?role=ShopOwner&limit=200`, { timeout: 120000 });
            
            if (currentRequestId !== requestIdRef.current) return;
            
            if (res.data && res.data.success) {
                setMembers(res.data.data || []);
                sessionStorage.setItem('rkd_merchant_pro_cache', JSON.stringify(res.data.data));
            }
            setLastSynced(new Date().toLocaleTimeString());
        } catch (err) {
            if (currentRequestId !== requestIdRef.current) return;
            if (!silent) toast.error("Handshake failed.");
        } finally {
            if (currentRequestId !== requestIdRef.current) return;
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [members.length]);

    useEffect(() => {
        const cached = sessionStorage.getItem('rkd_merchant_pro_cache');
        if (cached) { setMembers(JSON.parse(cached)); setLoading(false); }
        fetchMerchants(true);
    }, [fetchMerchants]);

    const handleToggleStatus = async (id, currentStatus) => {
        const action = currentStatus ? 'SUSPEND' : 'ACTIVATE';
        if (!window.confirm(`SECURITY ALERT: Confirm ${action}?`)) return;
        try {
            const res = await api.patch(`/admin/hierarchy/status/${id}`, { isActive: !currentStatus });
            if (res.data.success) { toast.success(`Status updated.`); fetchMerchants(true); }
        } catch (err) { toast.error("Update failed."); }
    };

    const analytics = useMemo(() => {
        const total = members.length;
        const active = members.filter(m => m.isActive).length;
        const deactive = members.filter(m => !m.isActive).length;
        const pending = members.filter(m => m.shopDetails?.status === 'Pending').length;
        const totalStaff = members.reduce((sum, m) => sum + (m.staffCount || 0), 0);
        return { total, active, deactive, pending, totalStaff };
    }, [members]);

    const filtered = useMemo(() => {
        return members.filter(m => {
            const sName = m.shopDetails?.shopName || m.shopName || "";
            const email = m.email || m.primaryEmail || "";
            
            // ✅ [UPDATE]: Search focused ONLY on Shop/Hub Location (Removed pDistrict/pBlock)
            const district = m.shopDistrict || m.shopDetails?.address?.district || "";
            const block = m.shopBlock || m.shopDetails?.address?.block || "";
            const state = m.shopState || m.shopDetails?.address?.state || "";
            
            const searchTarget = `${m.fullName} ${m.generatedId} ${m.mobile} ${sName} ${email} ${block} ${district} ${state}`.toLowerCase();
            const matchesSearch = searchTarget.includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === "All" || 
                                 (statusFilter === "Active" && m.isActive) ||
                                 (statusFilter === "Pending" && m.shopDetails?.status === 'Pending') ||
                                 (statusFilter === "Suspended" && !m.isActive);

            return matchesSearch && matchesStatus;
        });
    }, [members, searchTerm, statusFilter]);

    const themeColor = settings?.themeColor || '#0f172a';
    const textColor = settings?.headerTextColor || '#ffffff';

    if (loading) return (
        <div style={loaderWrapperS}>
            <div className="rkd-spinner-pro"></div>
            <p style={{marginTop:'15px', fontWeight:'900', color:'#94a3b8'}}>📡 CONNECTING SYSTEM...</p>
        </div>
    );

    return (
        <div style={containerS}>
            {/* --- HEADER --- */}
            <div style={headerFlexS}>
                <div style={{flex: 1, minWidth: '250px'}}>
                    <h2 style={titleS}>🏬 Master Merchant Hub</h2>
                    <p style={subS}>Complete governance of storefronts and workforce.</p>
                </div>
                <div style={actionRowS}>
                    <div style={syncBadgeS}><span className="pulse-dot"></span><small>{lastSynced}</small></div>
                    <button style={whiteBtnS(themeColor)} onClick={() => navigate('/admin/staff-mgmt/add')}>+ STAFF</button>
                    <button style={primaryBtnS(themeColor, textColor)} onClick={() => navigate('/admin/merchant-mgmt/add')}>+ OWNER</button>
                </div>
            </div>

            {/* --- ANALYTICS GRID --- */}
            <div style={analyticsGridS}>
                <StatCard label="Total Hubs" val={analytics.total} color={themeColor} />
                <StatCard label="Active" val={analytics.active} color="#10b981" />
                <StatCard label="Pending" val={analytics.pending} color="#f59e0b" />
                <StatCard label="Staff" val={analytics.totalStaff} color="#8b5cf6" />
            </div>

            {/* --- TOOLBAR --- */}
            <div style={toolbarS}>
                <div style={searchBoxS}>
                    <span>🔍</span>
                    <input style={inS} placeholder="Search Shop, Owner, Block, ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                    <select style={sortSelectS} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="All">All Compliance</option>
                        <option value="Active">Operational Only</option>
                        <option value="Suspended">Locked Only</option>
                    </select>
                </div>
            </div>

            {/* --- DATA DISPLAY --- */}
            <div style={displayWrapperS}>
                {/* 🖥️ Desktop View (Table) */}
                <div className="desktop-view">
                    <table style={tableS}>
                        <thead>
                            <tr style={thRowS}>
                                <th style={tdS}>Identity</th>
                                <th style={tdS}>Gmail / Mobile</th>
                                <th style={tdS}>Merchant ID</th>
                                <th style={tdS}>Shop Name</th>
                                <th style={tdS}>Jurisdiction (B/D/S)</th>
                                <th style={tdS}>Staff</th>
                                <th style={tdS}>Status</th>
                                <th style={tdS}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(m => (
                                <tr key={m._id} style={trS}>
                                    <td style={tdS}>
                                        <div style={profileCellS}>
                                            <img src={m.ownerPhoto || m.photo || 'https://via.placeholder.com/50'} style={avatarS} alt="P" />
                                            <b style={uNameS}>{m.fullName}</b>
                                        </div>
                                    </td>
                                    <td style={tdS}>
                                        <div style={contactBoxS}>
                                            <div style={{color: themeColor, fontWeight:'800', fontSize:'11px'}}>📧 {m.email || m.primaryEmail || 'N/A'}</div>
                                            <div style={{color: '#64748b', fontWeight:'700', fontSize:'11px'}}>📱 {m.mobile}</div>
                                        </div>
                                    </td>
                                    <td style={tdS}><code style={idLabelS}>{m.generatedId}</code></td>
                                    
                                    <td style={tdS}>
                                        <div style={shopCellS}>
                                            <b style={{color: '#1e293b'}}>
                                                {m.shopName || m.shopDetails?.shopName || 'N/A'}
                                            </b>
                                            <small style={typeBadgeS}>{m.shopType || m.shopDetails?.shopType || 'Retail'}</small>
                                        </div>
                                    </td>
                                    <td style={tdS}>
                                        <div style={locBadgeS}>
                                            <div style={{fontSize:'12px', fontWeight:'800'}}>
                                                {/* ✅ [UPDATE]: Display strictly Hub/Shop Block */}
                                                📍 {m.shopBlock || m.shopDetails?.address?.block || 'N/A'}
                                            </div>
                                            <div style={{fontSize:'10px', color:'#94a3b8', marginTop:'2px', textTransform:'uppercase'}}>
                                                {/* ✅ [UPDATE]: Display strictly Hub/Shop District and State */}
                                                {m.shopDistrict || m.shopDetails?.address?.district || 'N/A'}, 
                                                {m.shopState || m.shopDetails?.address?.state || ''}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tdS}>
                                        <div style={staffCountS} onClick={() => navigate('/admin/staff-registry')}>
                                            👥 {m.staffCount || 0}
                                        </div>
                                    </td>
                                    <td style={tdS}>
                                        <div style={statusBadgeS(m.isActive)} onClick={() => handleToggleStatus(m._id, m.isActive)}>
                                            <span style={dotStyleS(m.isActive)}></span>
                                            {m.isActive ? 'ACTIVE' : 'LOCKED'}
                                        </div>
                                    </td>
                                    <td style={tdS}>
                                        <button style={auditBtnS(themeColor)} onClick={() => navigate(`/admin/shop-owner-details/${m._id}`)}>AUDIT</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 📱 Mobile View (Card-based) */}
                <div className="mobile-view">
                    {filtered.map(m => (
                        <div key={m._id} style={mobileCardS}>
                            <div style={profileCellS}>
                                <img src={m.ownerPhoto || m.photo || 'https://via.placeholder.com/50'} style={avatarS} alt="P" />
                                <div style={{flex: 1}}>
                                    <b style={uNameS}>{m.shopDetails?.shopName || m.fullName}</b>
                                    <div style={subTextS}>ID: {m.generatedId}</div>
                                </div>
                                <div style={statusBadgeS(m.isActive)} onClick={() => handleToggleStatus(m._id, m.isActive)}>
                                    {m.isActive ? 'ON' : 'OFF'}
                                </div>
                            </div>
                            <div style={cardDividerS}></div>
                            <div style={mobileGridS}>
                                <div><small style={labS}>CONTACT</small><div style={{fontSize:'11px', fontWeight:'800'}}>📧 {m.email || 'N/A'}</div></div>
                                {/* ✅ [UPDATE]: Display strictly Hub/Shop Block in mobile view */}
                                <div><small style={labS}>BLOCK</small><div style={{fontSize:'11px', fontWeight:'800'}}>📍 {m.shopBlock || m.shopDetails?.address?.block || 'N/A'}</div></div>
                            </div>
                            <div style={{marginTop:'15px', display:'flex', gap:'10px'}}>
                                <button style={{...auditBtnS(themeColor), flex: 1}} onClick={() => navigate(`/admin/shop-owner-details/${m._id}`)}>AUDIT HUB</button>
                                <div style={{...staffCountS, padding:'10px 15px'}} onClick={() => navigate('/admin/staff-registry')}>👥 {m.staffCount || 0}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .rkd-spinner-pro { width:45px; height:45px; border:5px solid #f3f3f3; border-top-color: ${themeColor}; border-radius:50%; animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform:rotate(360deg); } }
                .pulse-dot { width:8px; height:8px; background:#10b981; border-radius:50%; display:inline-block; animation: pulse 2s infinite; margin-right:5px; }
                @keyframes pulse { 0% { opacity:1; } 50% { opacity:0.3; } 100% { opacity:1; } }
                
                @media (max-width: 1024px) {
                    .desktop-view { display: none; }
                    .mobile-view { display: block; }
                }
                @media (min-width: 1025px) {
                    .desktop-view { display: block; }
                    .mobile-view { display: none; }
                }
            `}</style>
        </div>
    );
};

// --- Sub Components ---
const StatCard = ({ label, val, color }) => (
    <div style={statCardS}>
        <div style={{fontSize:'22px', fontWeight:'900', color}}>{val}</div>
        <div style={{fontSize:'9px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase'}}>{label}</div>
    </div>
);

// --- Strategic Styles ---
const containerS = { padding:'15px', minHeight:'100vh', background:'#f8fafc', fontFamily:"'Plus Jakarta Sans', sans-serif" };
const headerFlexS = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px', flexWrap:'wrap', gap:'15px' };
const titleS = { margin:0, fontSize:'24px', fontWeight:'900', color:'#0f172a' };
const subS = { color:'#64748b', fontSize:'13px', marginTop:'4px' };
const actionRowS = { display:'flex', gap:'10px', alignItems:'center' };

const syncBadgeS = { display:'flex', alignItems:'center', background:'#fff', padding:'8px 12px', borderRadius:'10px', border:'1px solid #e2e8f0', color:'#94a3b8', fontSize:'10px', fontWeight:'800' };
const primaryBtnS = (bg, txt) => ({ background:bg, color:txt, border:'none', padding:'12px 20px', borderRadius:'12px', fontWeight:'900', cursor:'pointer', fontSize:'10px' });
const whiteBtnS = (col) => ({ background:'#fff', color:col, border:`1.5px solid ${col}`, padding:'12px 20px', borderRadius:'12px', fontWeight:'900', cursor:'pointer', fontSize:'10px' });

const analyticsGridS = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:'15px', marginBottom:'25px' };
const statCardS = { background:'#fff', padding:'20px', borderRadius:'20px', border:'1px solid #e2e8f0', textAlign:'center', boxShadow:'0 4px 12px rgba(0,0,0,0.02)' };

const toolbarS = { marginBottom:'20px', display:'flex', gap:'12px', flexWrap:'wrap', justifyContent:'space-between' };
const searchBoxS = { flex:1, display:'flex', alignItems:'center', gap:'12px', background:'#fff', padding:'0 15px', borderRadius:'15px', border:'1px solid #e2e8f0', minWidth:'280px' };
const inS = { border:'none', padding:'12px 0', outline:'none', fontWeight:'700', fontSize:'14px', flex:1 };
const sortSelectS = { padding:'12px 15px', borderRadius:'12px', border:'1.5px solid #e2e8f0', fontWeight:'800', fontSize:'12px', background:'#fff' };

const displayWrapperS = { background:'#fff', borderRadius:'25px', border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 10px 30px rgba(0,0,0,0.03)' };
const tableS = { width:'100%', borderCollapse:'collapse', textAlign:'left', minWidth:'1100px' };
const thRowS = { background:'#f8fafc', borderBottom:'2px solid #f1f5f9' };
const tdS = { padding:'18px 20px', borderBottom:'1px solid #f8fafc', fontSize:'13px' };
const trS = { transition:'0.2s', ':hover': { background:'#fcfdfe' } };

const avatarS = { width:'42px', height:'42px', borderRadius:'14px', objectFit:'cover', border:'2px solid #f1f5f9' };
const profileCellS = { display:'flex', alignItems:'center', gap:'12px' };
const uNameS = { color:'#1e293b', fontSize:'14px', fontWeight:'850' };
const contactBoxS = { display:'flex', flexDirection:'column', gap:'3px' };
const shopCellS = { display:'flex', flexDirection:'column', gap:'3px' };
const typeBadgeS = { color: '#2563eb', fontWeight:'800', fontSize:'9px', textTransform:'uppercase' };
const idLabelS = { background:'#f8fafc', padding:'3px 8px', borderRadius:'6px', fontSize:'10px', color:'#0f172a', fontWeight:'900', border:'1px solid #e2e8f0' };
const locBadgeS = { background:'#fcfdfe', border:'1.5px solid #f1f5f9', padding:'8px 12px', borderRadius:'12px' };
const staffCountS = { background:'#f0fdfa', color:'#0d9488', padding:'8px 12px', borderRadius:'10px', fontWeight:'900', cursor:'pointer', fontSize:'11px', border:'1px solid #ccfbf1' };

const statusBadgeS = (active) => ({ background: active ? '#ecfdf5' : '#fff1f2', color: active ? '#10b981' : '#f43f5e', padding:'6px 14px', borderRadius:'10px', fontSize:'10px', fontWeight:'900', display:'flex', alignItems:'center', gap:'6px', cursor:'pointer' });
const dotStyleS = (active) => ({ width:'7px', height:'7px', borderRadius:'50%', background: active ? '#10b981' : '#f43f5e' });
const auditBtnS = (bg) => ({ background:`${bg}08`, color:bg, border:`1.5px solid ${bg}30`, padding:'10px 18px', borderRadius:'12px', fontWeight:'900', fontSize:'10px', cursor:'pointer' });
const loaderWrapperS = { height:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' };

const mobileCardS = { background:'#fff', padding:'20px', margin:'15px', borderRadius:'22px', border:'1.5px solid #e2e8f0', boxShadow:'0 4px 10px rgba(0,0,0,0.02)' };
const cardDividerS = { height:'1px', background:'#f1f5f9', margin:'15px 0' };
const mobileGridS = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' };
const labS = { fontSize:'9px', color:'#94a3b8', fontWeight:'900', display:'block', marginBottom:'3px' };
const subTextS = { fontSize:'11px', color:'#94a3b8', fontWeight:'600' };

export default ShopOwnerManagement;