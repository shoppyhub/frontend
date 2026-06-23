import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';

// ✅ Vite Compatibility के लिए Relative Paths का उपयोग
import api from '../../../../services/api'; 
import { useBranding } from '../../../../context/BrandingContext';

// स्थानीय कंपोनेंट
import MerchantAuditDetails from './MerchantAuditDetails'; 

const SystemRequests = () => {
    const { settings } = useBranding();
    
    // --- Core States ---
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('LIST'); // 'LIST' or 'AUDIT'
    const [selectedShop, setSelectedShop] = useState(null);
    
    // --- Filter States ---
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const themeColor = settings?.themeColor || '#0f172a';

    // 1. 📡 Registry Synchronization
    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/shops/pending');
            if (res.data.success) {
                // Sorting: Newest applications first
                const sorted = (res.data.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setShops(sorted);
            }
        } catch (err) {
            console.error("Registry Sync Failure:", err);
            toast.error("Failed to sync with master registry.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
        // ऑटो रिफ्रेश जब विंडो पर वापस आएं
        window.addEventListener('focus', fetchRequests);
        return () => window.removeEventListener('focus', fetchRequests);
    }, [fetchRequests]);

    // 2. 🔍 Intelligence Engine (Filtering Logic)
    const filteredShops = useMemo(() => {
        return shops.filter(s => {
            const str = `${s.fullName} ${s.shopName} ${s.mobile} ${s.trackingId} ${s.generatedId}`.toLowerCase();
            const matchSearch = str.includes(searchTerm.toLowerCase());
            
            // Status Normalization
            const shopStatus = s.status || s.shopDetails?.status || 'Pending';
            const matchStatus = statusFilter === "All" || shopStatus === statusFilter;
            
            return matchSearch && matchStatus;
        });
    }, [shops, searchTerm, statusFilter]);

    // --- 🛡️ SCREEN SWITCHER: AUDIT MODE ---
    if (viewMode === 'AUDIT' && selectedShop) {
        return (
            <div style={{ padding: '0px', margin: '0px' }}>
                <MerchantAuditDetails 
                    shop={selectedShop} 
                    themeColor={themeColor}
                    onBack={() => { setViewMode('LIST'); setSelectedShop(null); }}
                    onActionComplete={() => {
                        setViewMode('LIST');
                        setSelectedShop(null);
                        fetchRequests(); // लिस्ट रिफ्रेश करें
                    }}
                />
            </div>
        );
    }

    // --- LOADING STATE ---
    if (loading) return (
        <div style={loaderS}>
            <div className="pro-spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{fontWeight:'800', color:'#94a3b8', fontSize:'12px', letterSpacing:'1px', marginTop:'15px'}}>SYNCING MASTER REGISTRY...</p>
        </div>
    );

    return (
        <div style={containerS}>
            {/* --- [A] HEADER SECTION --- */}
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>🏢 Merchant Onboarding Registry</h2>
                    <p style={subS}>Full lifecycle verification queue for {settings.siteName || 'RKD MART'}.</p>
                </div>
                <div style={statCard(themeColor)}>
                    <small style={statLbl}>Queue Capacity</small>
                    <b style={statVal}>{shops.length} Total Nodes</b>
                </div>
            </div>

            {/* --- [B] CONTROL TOOLBAR --- */}
            <div style={toolbarS}>
                <div style={searchBox}>
                    <span style={{fontSize:'18px'}}>🔍</span>
                    <input 
                        style={inSearch} 
                        placeholder="Search by merchant, shop, mobile or ID..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                    />
                </div>
                <select style={selectS} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="All">All Active Requests</option>
                    <option value="Pending">New Registration</option>
                    <option value="DistrictApproved">District Approved</option>
                    <option value="StateApproved">State Approved</option>
                    <option value="CorrectionRequired">Correction Required</option>
                    <option value="Rejected">Rejected Application</option>
                </select>
            </div>

            {/* --- [C] DATA ARCHITECTURE (TABLE) --- */}
            <div style={tableWrapper}>
                <div style={{overflowX:'auto'}}>
                    <table style={tableS}>
                        <thead>
                            <tr style={thRow}>
                                <th style={tdS}>Merchant Details</th>
                                <th style={tdS}>Registration</th>
                                <th style={tdS}>Contact Info</th>
                                <th style={tdS}>Shop Details</th>
                                <th style={tdS}>Location</th>
                                <th style={tdS}>Status</th>
                                <th style={tdS}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredShops.map(s => {
                                const shopStatus = s.status || s.shopDetails?.status || 'Pending';
                                return (
                                <tr key={s._id} style={trS}>
                                    {/* 1. Merchant Details */}
                                    <td style={tdS}>
                                        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                                            <img 
                                                src={s.ownerPhoto || 'https://via.placeholder.com/40'} 
                                                alt="Owner" 
                                                style={avatarS} 
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }} 
                                            />
                                            <div>
                                                <div style={nameS}>{s.fullName}</div>
                                                <div style={metaS}>Father: {s.fatherName || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* 2. Registration */}
                                    <td style={tdS}>
                                        <div style={idS}>{s.trackingId || 'N/A'}</div>
                                        <div style={metaS}>Date: {new Date(s.createdAt).toLocaleDateString('en-IN')}</div>
                                    </td>

                                    {/* 3. Contact Info */}
                                    <td style={tdS}>
                                        <div style={metaS}>📱 {s.mobile}</div>
                                        <div style={metaS}>📧 {s.email || 'N/A'}</div>
                                    </td>

                                    {/* 4. Shop Details */}
                                    <td style={tdS}>
                                        <div style={{...nameS, color: themeColor}}>{s.shopName}</div>
                                        <div style={metaS}>{s.shopType}</div>
                                    </td>

                                    {/* 5. Location */}
                                    <td style={tdS}>
                                        <div style={metaS}>📍 {s.shopDistrict}</div>
                                        <small style={{color:'#cbd5e1'}}>{s.shopState}</small>
                                    </td>

                                    {/* 6. Status */}
                                    <td style={tdS}>
                                        <span style={statusBadge(shopStatus)}>● {shopStatus.toUpperCase()}</span>
                                    </td>

                                    {/* 7. Action */}
                                    <td style={tdS}>
                                        <button 
                                            onClick={() => { setSelectedShop(s); setViewMode('AUDIT'); }} 
                                            style={reviewBtn(themeColor)}
                                        >
                                            AUDIT NODE
                                        </button>
                                    </td>
                                </tr>
                            );})}
                        </tbody>
                    </table>
                </div>
                {filteredShops.length === 0 && (
                    <div style={noDataS}>
                        No requests found for current filters. Registry is up-to-date.
                    </div>
                )}
            </div>

            <style>{`
                .pro-spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-top-color: #0f172a; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                tr:hover { background-color: #fcfdfe !important; }
                table { border-spacing: 0; }
            `}</style>
        </div>
    );
};

// --- Atomic SaaS Styles (Optimized) ---
const containerS = { padding: '0px', margin: '0px', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f8fafc', animation: 'fadeIn 0.4s ease' };
const headerFlex = { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'30px', flexWrap:'wrap', gap:'20px', padding: '10px 5px 0 5px' };
const titleS = { margin:0, fontSize:'24px', fontWeight:'900', color:'#0f172a', letterSpacing:'-0.5px' };
const subS = { color: '#64748b', fontSize: '13px', marginTop: '4px' };
const statCard = (color) => ({ background:'#fff', padding:'12px 25px', borderRadius:'18px', borderLeft:`6px solid ${color}`, boxShadow:'0 4px 15px rgba(0,0,0,0.02)' });
const statLbl = { fontSize:'10px', fontWeight:'800', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.5px' };
const statVal = { display:'block', fontSize:'16px', fontWeight:'900', color:'#1e293b', marginTop:'2px' };

const toolbarS = { display:'flex', justifyContent:'space-between', gap:'15px', marginBottom:'25px', flexWrap:'wrap', padding: '0 5px' };
const searchBox = { flex:1, minWidth:'280px', background:'#fff', padding:'0 15px', borderRadius:'12px', border:'1.5px solid #f1f5f9', display:'flex', alignItems:'center', gap:'10px' };
const inSearch = { border:'none', width:'100%', padding:'10px 0', outline:'none', fontSize:'13px', fontWeight:'600' };
const selectS = { padding:'10px 15px', borderRadius:'12px', border:'1.5px solid #f1f5f9', background:'#fff', fontWeight:'700', fontSize:'11px', outline:'none', cursor:'pointer' };

const tableWrapper = { background:'#fff', borderRadius:'24px', border:'1px solid #f1f5f9', overflow:'hidden', boxShadow:'0 10px 30px rgba(0,0,0,0.02)', margin: '0 5px' };
const tableS = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1150px' };
const thRow = { backgroundColor: '#f8fafc', borderBottom: '1.5px solid #f1f5f9' };
const tdS = { padding: '14px 16px', fontSize: '12px', borderBottom: '1px solid #f8fafc' };
const trS = { transition: '0.2s' };

const avatarS = { width:'38px', height:'38px', borderRadius:'10px', objectFit:'cover', border:'1px solid #f1f5f9' };
const nameS = { fontWeight:'800', color:'#1e293b', fontSize:'13px' };
const idS = { fontWeight:'800', color:'#475569', fontSize:'12px' };
const metaS = { fontSize:'11px', color:'#94a3b8', fontWeight:'700', marginTop:'2px' };

const statusBadge = (s) => ({ 
    padding:'4px 10px', borderRadius:'6px', fontSize:'9px', fontWeight:'900', 
    display: 'inline-block',
    background: (s === 'Pending' || s === 'DistrictApproved' || s === 'StateApproved') ? '#fff7ed' : s === 'Rejected' ? '#fff1f2' : '#ecfdf5', 
    color: (s === 'Pending' || s === 'DistrictApproved' || s === 'StateApproved') ? '#c2410c' : s === 'Rejected' ? '#e11d48' : '#10b981' 
});

const reviewBtn = (color) => ({ 
    background: color, color: '#fff', border: 'none', padding: '8px 16px', 
    borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '10px',
    boxShadow: `0 4px 10px ${color}20`
});

const noDataS = { padding: '80px 20px', textAlign: 'center', color: '#cbd5e1', fontSize: '15px', fontWeight: '700' };
const loaderS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '60vh' };

export default SystemRequests;