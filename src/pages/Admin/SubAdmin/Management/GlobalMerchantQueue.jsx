// src/pages/Admin/SubAdmin/Management/GlobalMerchantQueue.jsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from "../../../../hooks/useFetch";
import { useBranding } from '../../../../context/BrandingContext';

/**
 * 🛰️ Internal Micro-Loader
 */
const InternalLoader = () => (
    <div style={{ padding: '80px 0', textAlign: 'center', width: '100%' }}>
        <div className="rkd-loader"></div>
        <p style={{ marginTop: '15px', color: '#94a3b8', fontSize: '12px', fontWeight: '800' }}>SYNCING MERCHANT REGISTRY...</p>
        <style>{`.rkd-loader { width: 35px; height: 35px; border: 3px solid #f1f5f9; border-top: 3px solid var(--primary-theme); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
);

const GlobalMerchantQueue = () => {
    const { settings } = useBranding();
    const navigate = useNavigate();
    const { data: shops, loading } = useFetch('/admin/shops/pending');

    // --- Filter States ---
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [stateFilter, setStateFilter] = useState("All");

    const themeColor = settings?.themeColor || '#0f172a';

    /**
     * 🔍 Filter Logic
     */
    const filteredShops = useMemo(() => {
        if (!shops) return [];
        return shops.filter(shop => {
            const matchesSearch = 
                shop.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shop.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shop.trackingId?.includes(searchTerm);
            
            const shopStatus = shop.status || shop.shopDetails?.status;
            const matchesStatus = statusFilter === "All" || shopStatus === statusFilter;
            const matchesState = stateFilter === "All" || shop.shopState === stateFilter;

            return matchesSearch && matchesStatus && matchesState;
        });
    }, [shops, searchTerm, statusFilter, stateFilter]);

    // Unique states for filter dropdown
    const uniqueStates = useMemo(() => {
        if (!shops) return [];
        return [...new Set(shops.map(s => s.shopState))].filter(Boolean);
    }, [shops]);

    if (loading) return <InternalLoader />;

    return (
        <div style={containerS} className="fade-in">
            
            {/* --- 🛠️ FILTERS SECTION --- */}
            <div style={filterBar}>
                <div style={searchBox}>
                    <span style={{opacity: 0.5}}>🔍</span>
                    <input 
                        style={searchInput} 
                        placeholder="Search Shop, Owner or ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={filterGroup}>
                    <select style={selectS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="All">All Status</option>
                        <option value="Pending">New (Pending)</option>
                        <option value="DistrictApproved">District Approved</option>
                        <option value="StateApproved">State Approved</option>
                        <option value="CorrectionRequired">Correction Needed</option>
                    </select>

                    <select style={selectS} value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
                        <option value="All">All States</option>
                        {uniqueStates.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>

                    <div style={countBadge}>
                        {filteredShops.length} Found
                    </div>
                </div>
            </div>

            {/* --- 📋 TABLE SECTION --- */}
            <div style={tableWrapper}>
                <table style={tableS}>
                    <thead style={theadS}>
                        <tr>
                            <th style={thS}>MERCHANT IDENTITY</th>
                            <th style={thS}>SHOP NAME</th>
                            <th style={thS}>TRACKING ID</th>
                            <th style={thS}>CONTACT INFO</th>
                            <th style={thS}>LOCATION HUB</th>
                            <th style={thS}>STATUS</th>
                            <th style={thS}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredShops.length > 0 ? filteredShops.map((shop) => (
                            <tr key={shop._id} style={trS} className="table-row">
                                {/* 1. Merchant Identity */}
                                <td style={tdS}>
                                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                        <div style={avatarWrapper}>
                                            <img src={shop.displayPhoto || 'https://via.placeholder.com/40'} style={avatarImg} alt="M" />
                                        </div>
                                        <div>
                                            <div style={mainTxt}>{shop.fullName}</div>
                                            <div style={subTxt}>S/O: {shop.fatherName || 'N/A'}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* 2. Shop Name */}
                                <td style={tdS}>
                                    <div style={shopNameTxt}>{shop.shopName}</div>
                                    <div style={subTxt}>{shop.shopType || 'Retail'}</div>
                                </td>

                                {/* 3. Tracking ID */}
                                <td style={tdS}>
                                    <span style={idBadge}>#{shop.trackingId || 'NO_ID'}</span>
                                </td>

                                {/* 4. Contact */}
                                <td style={tdS}>
                                    <div style={mainTxt}>📞 {shop.mobile}</div>
                                    <div style={subTxt}>✉️ {shop.email}</div>
                                </td>

                                {/* 5. Location */}
                                <td style={tdS}>
                                    <div style={mainTxt}>{shop.shopBlock || 'N/A'}</div>
                                    <div style={subTxt}>{shop.shopDistrict}, {shop.shopState}</div>
                                </td>

                                {/* 6. Status */}
                                <td style={tdS}>
                                    <span style={statusTag(shop.status || shop.shopDetails?.status)}>
                                        {(shop.status || shop.shopDetails?.status || 'Pending').replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                </td>

                                {/* 7. Action */}
                                <td style={tdS}>
                                    <button 
                                        onClick={() => navigate(`/sub-admin/shops/manage/${shop._id}`)}
                                        style={manageBtn(themeColor)}
                                    >
                                        MANAGE
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" style={emptyState}>
                                    No merchant applications discovered for these filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .table-row:hover { background: #fcfdfe; }
                .fade-in { animation: fadeIn 0.4s ease-in; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};

// --- ENTERPRISE STYLES ---

const containerS = { width: '100%', padding: '0px' };

const filterBar = { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
    marginBottom: '25px', gap: '20px', flexWrap: 'wrap',
    background: '#fff', padding: '15px 20px', borderRadius: '18px', border: '1px solid #f1f5f9'
};

const searchBox = { 
    display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', 
    padding: '10px 15px', borderRadius: '12px', flex: 1, minWidth: '250px' 
};

const searchInput = { border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '14px', fontWeight: '600' };

const filterGroup = { display: 'flex', alignItems: 'center', gap: '12px' };

const selectS = { 
    padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', 
    fontSize: '13px', fontWeight: '700', color: '#475569', outline: 'none', cursor: 'pointer' 
};

const countBadge = { background: '#f1f5f9', color: '#64748b', padding: '8px 15px', borderRadius: '10px', fontSize: '12px', fontWeight: '800' };

const tableWrapper = { 
    background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9', 
    overflowX: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
};

const tableS = { width: '100%', borderCollapse: 'collapse', minWidth: '1000px' };

const theadS = { background: '#f8fafc', textAlign: 'left' };

const thS = { 
    padding: '18px 20px', fontSize: '10px', fontWeight: '900', 
    color: '#94a3b8', letterSpacing: '1.2px', textTransform: 'uppercase' 
};

const trS = { borderBottom: '1px solid #f8fafc', transition: '0.2s' };

const tdS = { padding: '16px 20px', verticalAlign: 'middle' };

const avatarWrapper = { width: '42px', height: '42px', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };
const avatarImg = { width: '100%', height: '100%', objectFit: 'cover' };

const mainTxt = { fontSize: '14px', fontWeight: '700', color: '#1e293b' };
const subTxt = { fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginTop: '2px' };
const shopNameTxt = { fontSize: '14px', fontWeight: '800', color: 'var(--primary-theme)' };

const idBadge = { background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', fontFamily: 'monospace' };

const statusTag = (s) => {
    let colors = { bg: '#f1f5f9', txt: '#64748b' };
    if (s === 'DistrictApproved') colors = { bg: '#e0f2fe', txt: '#0369a1' };
    if (s === 'StateApproved') colors = { bg: '#fef3c7', txt: '#92400e' };
    if (s === 'Pending') colors = { bg: '#f1f5f9', txt: '#475569' };
    if (s === 'CorrectionRequired') colors = { bg: '#fff1f2', txt: '#e11d48' };
    
    return {
        background: colors.bg, color: colors.txt,
        padding: '5px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '900',
        display: 'inline-block', whiteSpace: 'nowrap'
    };
};

const manageBtn = (color) => ({
    background: color, color: '#fff', border: 'none', padding: '8px 16px', 
    borderRadius: '10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer',
    boxShadow: `0 4px 12px ${color}25`, transition: '0.3s'
});

const emptyState = { padding: '60px', textAlign: 'center', color: '#cbd5e1', fontWeight: '700', fontSize: '15px' };

export default GlobalMerchantQueue;