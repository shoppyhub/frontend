import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api'; 
import { useBranding } from '../../../context/BrandingContext';

/**
 * RKD MART - ENHANCED DISTRICT MERCHANT HUB MANAGEMENT
 * जिले की सभी दुकानों का अल्ट्रा प्रो प्रबंधन (View & Manage Version)
 */
const ManageShops = () => {
    const navigate = useNavigate();
    const { settings } = useBranding();
    
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

    const themeColor = settings?.themeColor || '#0d9488';
    const textColor = settings?.headerTextColor || '#ffffff';

    // 1. 📡 Fetch District-Specific Shops
    const fetchShops = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            // बैकएंड रोल के आधार पर जिला स्तर का डेटा फिल्टर करके देगा
            const res = await api.get('/admin/shops/all');
            if (res.data.success) {
                setShops(res.data.data || []);
                setLastSynced(new Date().toLocaleTimeString());
            }
        } catch (err) {
            if (!silent) toast.error("Registry synchronization failed.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchShops();
    }, [fetchShops]);

    // 2. 🔒 Toggle Store Status (Quick Action)
    const handleToggleStatus = async (id, currentStatus, name) => {
        const action = currentStatus ? 'SUSPEND' : 'ACTIVATE';
        if (!window.confirm(`SECURITY ALERT: Confirm ${action} protocol for hub "${name}"?`)) return;

        try {
            const res = await api.patch(`/admin/hierarchy/status/${id}`, { isActive: !currentStatus });
            if (res.data.success) {
                toast.success(`Hub status updated to ${!currentStatus ? 'ACTIVE' : 'LOCKED'}`);
                fetchShops(true);
            }
        } catch (err) {
            toast.error("Status synchronization failed.");
        }
    };

    // 3. 📊 Analytics Memo
    const analytics = useMemo(() => {
        const total = shops.length;
        const active = shops.filter(s => s.isActive).length;
        const pending = shops.filter(s => s.status === 'Pending' || s.status === 'PENDING').length;
        const totalStaff = shops.reduce((sum, s) => sum + (s.staffCount || 0), 0);
        return { total, active, pending, totalStaff };
    }, [shops]);

    // 4. 🔍 Filter Logic
    const filtered = useMemo(() => {
        return shops.filter(s => {
            const sName = s.shopName || "";
            const oName = s.fullName || s.owner || "";
            const fName = s.fatherName || "";
            const id = s.generatedId || s.id || "";
            const block = s.shopBlock || s.blockName || "";

            const searchTarget = `${sName} ${oName} ${fName} ${id} ${block}`.toLowerCase();
            const matchesSearch = searchTarget.includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === "All" || 
                                 (statusFilter === "Active" && s.isActive) ||
                                 (statusFilter === "Suspended" && !s.isActive);

            return matchesSearch && matchesStatus;
        });
    }, [shops, searchTerm, statusFilter]);

    if (loading) return (
        <div style={loaderWrapperS}>
            <div className="rkd-spinner-pro"></div>
            <p style={{marginTop:'15px', fontWeight:'900', color:'#94a3b8'}}>📡 SYNCING DISTRICT NODES...</p>
        </div>
    );

    return (
        <div style={containerS}>
            {/* --- HEADER MODULE --- */}
            <div style={headerFlexS}>
                <div style={{flex: 1, minWidth: '250px'}}>
                    <h2 style={titleS}>🏬 District Hub Directory</h2>
                    <p style={subS}>Complete governance of merchant hubs within your district jurisdiction.</p>
                </div>
                <div style={actionRowS}>
                    <div style={syncBadgeS}><span className="pulse-dot"></span><small>{lastSynced}</small></div>
                    <button style={primaryBtnS(themeColor, textColor)} onClick={() => fetchShops()}>REFRESH DATA</button>
                </div>
            </div>

            {/* --- ANALYTICS DASH --- */}
            <div style={analyticsGridS}>
                <StatCard label="Total Hubs" val={analytics.total} color={themeColor} />
                <StatCard label="Live Stores" val={analytics.active} color="#10b981" />
                <StatCard label="Pending Review" val={analytics.pending} color="#f59e0b" />
                <StatCard label="Total Staff" val={analytics.totalStaff} color="#8b5cf6" />
            </div>

            {/* --- TOOLBAR --- */}
            <div style={toolbarS}>
                <div style={searchBoxS}>
                    <span>🔍</span>
                    <input style={inS} placeholder="Search Hub, Owner, Father, ID, Block..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <select style={sortSelectS} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="All">All Status</option>
                    <option value="Active">Operational Only</option>
                    <option value="Suspended">Locked Only</option>
                </select>
            </div>

            {/* --- DATA DISPLAY --- */}
            <div style={displayWrapperS}>
                {/* Desktop View */}
                <div className="desktop-view">
                    <table style={tableS}>
                        <thead>
                            <tr style={thRowS}>
                                <th style={tdS}>Identity (Owner)</th>
                                <th style={tdS}>Contact Nodes</th>
                                <th style={tdS}>Hub ID</th>
                                <th style={tdS}>Shop Details</th>
                                <th style={tdS}>Jurisdiction (B/D)</th>
                                <th style={tdS}>Status</th>
                                <th style={tdS}>Admin Protocol</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(shop => (
                                <tr key={shop._id} style={trS}>
                                    <td style={tdS}>
                                        <div style={profileCellS}>
                                            <img src={shop.displayPhoto || shop.ownerPhoto || shop.photo || 'https://via.placeholder.com/50'} style={avatarS} alt="O" />
                                            <div>
                                                <div style={uNameS}>{shop.fullName || shop.owner}</div>
                                                <div style={fatherNameS}>S/O: {shop.fatherName || 'Not Provided'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tdS}>
                                        <div style={contactBoxS}>
                                            <div style={{color: themeColor, fontWeight:'800', fontSize:'11px'}}>📧 {shop.email || 'N/A'}</div>
                                            <div style={{color: '#64748b', fontWeight:'700', fontSize:'11px'}}>📱 {shop.mobile}</div>
                                        </div>
                                    </td>
                                    <td style={tdS}><code style={idLabelS}>{shop.generatedId || shop.id}</code></td>
                                    <td style={tdS}>
                                        <div style={shopCellS}>
                                            <b style={{color: '#1e293b'}}>{shop.shopName}</b>
                                            <small style={typeBadgeS}>{shop.shopType || 'Retail Hub'}</small>
                                        </div>
                                    </td>
                                    <td style={tdS}>
                                        <div style={locBadgeS}>
                                            <div style={{fontSize:'11px', fontWeight:'800'}}>📍 {shop.blockName || shop.shopBlock || 'N/A'}</div>
                                            <div style={{fontSize:'9px', color:'#94a3b8', marginTop:'2px'}}>{shop.districtName || shop.shopDistrict}</div>
                                        </div>
                                    </td>
                                    <td style={tdS}>
                                        <div style={statusBadgeS(shop.isActive)} onClick={() => handleToggleStatus(shop._id, shop.isActive, shop.shopName)}>
                                            <span style={dotStyleS(shop.isActive)}></span>
                                            {shop.isActive ? 'ONLINE' : 'LOCKED'}
                                        </div>
                                    </td>
                                    <td style={tdS}>
                                        <button 
                                            style={manageBtnS(themeColor)} 
                                            onClick={() => navigate(`/district-admin/shop/${shop._id}/control`)}
                                        >
                                            🔍 VIEW & MANAGE
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="mobile-view">
                    {filtered.map(shop => (
                        <div key={shop._id} style={mobileCardS}>
                            <div style={profileCellS}>
                                <img src={shop.displayPhoto || shop.ownerPhoto || shop.photo || 'https://via.placeholder.com/50'} style={avatarS} alt="O" />
                                <div style={{flex: 1}}>
                                    <b style={uNameS}>{shop.shopName}</b>
                                    <div style={subTextS}>{shop.fullName} | {shop.generatedId}</div>
                                </div>
                                <div style={statusBadgeS(shop.isActive)} onClick={() => handleToggleStatus(shop._id, shop.isActive, shop.shopName)}>
                                    {shop.isActive ? 'ON' : 'OFF'}
                                </div>
                            </div>
                            <div style={cardDividerS}></div>
                            <div style={mobileGridS}>
                                <div><small style={labS}>PROPRIETOR INFO</small><div style={{fontSize:'11px', fontWeight:'800'}}>S/O: {shop.fatherName || 'N/A'}</div></div>
                                <div><small style={labS}>LOCATION</small><div style={{fontSize:'11px', fontWeight:'800'}}>📍 {shop.blockName || 'N/A'}</div></div>
                            </div>
                            <button 
                                style={{...manageBtnS(themeColor), width:'100%', marginTop:'15px', padding:'15px'}} 
                                onClick={() => navigate(`/district-admin/shop/${shop._id}/control`)}
                            >
                                🔍 VIEW & MANAGE HUB
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .rkd-spinner-pro { width:40px; height:40px; border:4px solid #f3f3f3; border-top-color: ${themeColor}; border-radius:50%; animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform:rotate(360deg); } }
                .pulse-dot { width:8px; height:8px; background:#10b981; border-radius:50%; display:inline-block; animation: pulse 2s infinite; margin-right:5px; }
                @keyframes pulse { 0% { opacity:1; } 50% { opacity:0.3; } 100% { opacity:1; } }
                @media (max-width: 1024px) { .desktop-view { display: none; } .mobile-view { display: block; } }
                @media (min-width: 1025px) { .desktop-view { display: block; } .mobile-view { display: none; } }
            `}</style>
        </div>
    );
};

// --- HELPER COMPONENTS ---
const StatCard = ({ label, val, color }) => (
    <div style={statCardS}>
        <div style={{fontSize:'24px', fontWeight:'900', color}}>{val}</div>
        <div style={{fontSize:'10px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase', marginTop:'5px'}}>{label}</div>
    </div>
);

// --- ULTRA PRO STYLES ---
const containerS = { padding:'20px', minHeight:'100vh', background:'#f8fafc', fontFamily:"'Plus Jakarta Sans', sans-serif" };
const headerFlexS = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', flexWrap:'wrap', gap:'15px' };
const titleS = { margin:0, fontSize:'26px', fontWeight:'900', color:'#0f172a', letterSpacing:'-0.5px' };
const subS = { color:'#64748b', fontSize:'14px', marginTop:'4px' };
const actionRowS = { display:'flex', gap:'12px', alignItems:'center' };

const syncBadgeS = { display:'flex', alignItems:'center', background:'#fff', padding:'10px 15px', borderRadius:'12px', border:'1px solid #e2e8f0', color:'#94a3b8', fontSize:'11px', fontWeight:'800' };
const primaryBtnS = (bg, txt) => ({ background:bg, color:txt, border:'none', padding:'12px 24px', borderRadius:'14px', fontWeight:'900', cursor:'pointer', fontSize:'11px', boxShadow:`0 10px 20px ${bg}20` });

const analyticsGridS = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'20px', marginBottom:'30px' };
const statCardS = { background:'#fff', padding:'25px', borderRadius:'24px', border:'1px solid #f1f5f9', textAlign:'center', boxShadow:'0 4px 15px rgba(0,0,0,0.01)' };

const toolbarS = { marginBottom:'25px', display:'flex', gap:'15px', flexWrap:'wrap' };
const searchBoxS = { flex:1, display:'flex', alignItems:'center', gap:'12px', background:'#fff', padding:'0 20px', borderRadius:'18px', border:'1.5px solid #f1f5f9', minWidth:'280px' };
const inS = { border:'none', padding:'15px 0', outline:'none', fontWeight:'700', fontSize:'14px', flex:1 };
const sortSelectS = { padding:'12px 20px', borderRadius:'15px', border:'1.5px solid #f1f5f9', fontWeight:'800', fontSize:'12px', background:'#fff', cursor:'pointer' };

const displayWrapperS = { background:'#fff', borderRadius:'30px', border:'1px solid #f1f5f9', overflow:'hidden', boxShadow:'0 15px 40px rgba(0,0,0,0.02)' };
const tableS = { width:'100%', borderCollapse:'collapse', textAlign:'left', minWidth:'1100px' };
const thRowS = { background:'#f8fafc', borderBottom:'2px solid #f1f5f9' };
const tdS = { padding:'18px 20px', borderBottom:'1px solid #f8fafc', fontSize:'13px' };
const trS = { transition:'0.2s' };

const avatarS = { width:'45px', height:'45px', borderRadius:'15px', objectFit:'cover', border:'2.5px solid #fff', boxShadow:'0 5px 10px rgba(0,0,0,0.05)' };
const profileCellS = { display:'flex', alignItems:'center', gap:'15px' };
const uNameS = { color:'#1e293b', fontSize:'14px', fontWeight:'850' };
const fatherNameS = { fontSize:'10px', color:'#94a3b8', fontWeight:'700', textTransform:'uppercase', marginTop:'2px' };
const contactBoxS = { display:'flex', flexDirection:'column', gap:'4px' };
const shopCellS = { display:'flex', flexDirection:'column', gap:'4px' };
const typeBadgeS = { color: '#3b82f6', fontWeight:'900', fontSize:'9px', textTransform:'uppercase', letterSpacing:'0.5px' };
const idLabelS = { background:'#f1f5f9', padding:'4px 10px', borderRadius:'8px', fontSize:'10px', color:'#0f172a', fontWeight:'900', border:'1px solid #e2e8f0' };
const locBadgeS = { background:'#fcfdfe', border:'1px solid #f1f5f9', padding:'10px 15px', borderRadius:'15px' };

const statusBadgeS = (active) => ({ background: active ? '#ecfdf5' : '#fff1f2', color: active ? '#10b981' : '#f43f5e', padding:'8px 16px', borderRadius:'12px', fontSize:'10px', fontWeight:'900', display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', border:`1px solid ${active ? '#d1fae5' : '#fee2e2'}` });
const dotStyleS = (active) => ({ width:'7px', height:'7px', borderRadius:'50%', background: active ? '#10b981' : '#f43f5e' });

const manageBtnS = (bg) => ({ 
    background: bg, color: '#fff', border: 'none', padding: '10px 20px', 
    borderRadius: '12px', fontWeight: '900', fontSize: '11px', 
    cursor: 'pointer', boxShadow: `0 8px 15px ${bg}30`, transition: '0.3s' 
});

const loaderWrapperS = { height:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' };
const mobileCardS = { background:'#fff', padding:'20px', margin:'15px', borderRadius:'25px', border:'1px solid #f1f5f9', boxShadow:'0 10px 20px rgba(0,0,0,0.01)' };
const cardDividerS = { height:'1px', background:'#f1f5f9', margin:'15px 0' };
const mobileGridS = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px' };
const labS = { fontSize:'9px', color:'#94a3b8', fontWeight:'900', display:'block', marginBottom:'5px', textTransform:'uppercase' };
const subTextS = { fontSize:'11px', color:'#64748b', fontWeight:'600' };

export default ManageShops;