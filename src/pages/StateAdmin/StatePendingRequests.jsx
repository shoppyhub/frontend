import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useBranding } from '../../context/BrandingContext';
import { toast } from 'react-toastify';
import MerchantViewDetails from './MerchantViewDetails';

const StatePendingRequests = ({ stateName }) => {
    const { settings } = useBranding();
    
    // --- Data States ---
    const [shops, setShops] = useState([]);
    const [filteredShops, setFilteredShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // --- Navigation States ---
    const [viewMode, setViewMode] = useState('list'); 
    const [selectedShopId, setSelectedShopId] = useState(null);

    const themeColor = settings?.themeColor || '#4f46e5';

    // 1. डेटा लोड करना
    const fetchPendingShops = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/shops/pending');
            if (res.data.success) {
                setShops(res.data.data);
                setFilteredShops(res.data.data);
            }
        } catch (err) {
            toast.error("Failed to sync registry.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingShops();
    }, [fetchPendingShops]);

    // 2. सर्च फ़िल्टर लॉजिक
    useEffect(() => {
        const filtered = shops.filter(shop => 
            shop.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shop.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shop.trackingId?.includes(searchTerm) ||
            shop.mobile?.includes(searchTerm)
        );
        setFilteredShops(filtered);
    }, [searchTerm, shops]);

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedShopId(null);
        fetchPendingShops();
    };

    // विस्तृत ऑडिट व्यू (Details)
    if (viewMode === 'details' && selectedShopId) {
        return (
            <MerchantViewDetails 
                shopId={selectedShopId} 
                onBack={handleBackToList} 
                stateName={stateName} 
            />
        );
    }

    return (
        <div style={responsiveWrapper}>
            {/* --- RESPONSIVE HEADER MODULE --- */}
            <div className="state-admin-header" style={headerModule}>
                <div style={titleBox}>
                    <h2 style={mainTitle}>📥 Pending Applications</h2>
                    <p style={subTitle}>Registry Node: <b>{stateName}</b></p>
                </div>
                
                <div style={controlsRow}>
                    <div style={searchContainer}>
                        <span style={{opacity: 0.5}}>🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search Merchant, ID, Mobile..." 
                            style={searchField}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={fetchPendingShops} style={syncBtn}>🔄 Sync</button>
                </div>
            </div>

            {/* --- TABLE CONTAINER WITH OVERFLOW CONTROL --- */}
            <div style={cardWrapper}>
                {loading ? (
                    <div style={statusMsg}>Syncing Registry Database...</div>
                ) : filteredShops.length === 0 ? (
                    <div style={statusMsg}>No pending applications found in this sector.</div>
                ) : (
                    <div className="custom-table-scroll" style={tableScroll}>
                        <table style={mainTable}>
                            <thead>
                                <tr style={headerRow}>
                                    <th style={thStyle}>IDENTITY & OWNER</th>
                                    <th style={thStyle}>BUSINESS HUB</th>
                                    <th style={thStyle}>TRACKING ID</th>
                                    <th style={thStyle}>COMMUNICATION</th>
                                    <th style={thStyle}>STATUS</th>
                                    <th style={thStyle}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredShops.map((shop) => (
                                    <tr key={shop._id} style={dataRow}>
                                        {/* Column 1: Profile */}
                                        <td style={tdStyle}>
                                            <div style={profileFlex}>
                                                <img 
                                                    src={shop.displayPhoto || 'https://via.placeholder.com/100'} 
                                                    alt="Merchant" 
                                                    style={avatarImg} 
                                                />
                                                <div>
                                                    <div style={boldTxt}>{shop.fullName}</div>
                                                    <small style={mutedTxt}>S/O: {shop.fatherName || 'N/A'}</small>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Column 2: Business */}
                                        <td style={tdStyle}>
                                            <div style={boldTxt}>{shop.shopName}</div>
                                            <small style={mutedTxt}>{shop.shopDistrict}</small>
                                        </td>

                                        {/* Column 3: Tracking ID */}
                                        <td style={tdStyle}>
                                            <span style={idBadge}>{shop.trackingId}</span>
                                        </td>

                                        {/* Column 4: Contacts */}
                                        <td style={tdStyle}>
                                            <div style={contactBox}>
                                                <div style={smallBold}>📞 {shop.mobile}</div>
                                                <div style={smallMuted}>{shop.email}</div>
                                            </div>
                                        </td>

                                        {/* Column 5: Status */}
                                        <td style={tdStyle}>
                                            <span style={statusBadge(shop.shopDetails?.status)}>
                                                {shop.shopDetails?.status || 'PENDING'}
                                            </span>
                                        </td>

                                        {/* Column 6: Action */}
                                        <td style={tdStyle}>
                                            <button 
                                                onClick={() => { setSelectedShopId(shop._id); setViewMode('details'); }}
                                                style={viewDetailsBtn}
                                            >
                                                👁️ View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- INLINE MEDIA QUERIES FOR TRUE RESPONSIVENESS --- */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                
                .custom-table-scroll::-webkit-scrollbar { height: 6px; }
                .custom-table-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

                /* मोबाइल के लिए सुधार */
                @media (max-width: 768px) {
                    .state-admin-header {
                        flex-direction: column !important;
                        align-items: stretch !important;
                        gap: 15px !important;
                    }
                    .search-container {
                        width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
};

// --- STYLING OBJECTS (Compatible with index.css) ---

const responsiveWrapper = {
    animation: 'fadeIn 0.5s ease-in',
    padding: '20px',
    maxWidth: '100%',
    margin: '0 auto',
    boxSizing: 'border-box'
};

const headerModule = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    gap: '20px'
};

const titleBox = { flex: 1 };
const mainTitle = { margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--primary-theme)' };
const subTitle = { margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '14px' };

const controlsRow = { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' };
const searchContainer = { 
    background: '#fff', 
    border: '1px solid #e2e8f0', 
    borderRadius: '12px', 
    padding: '0 12px', 
    display: 'flex', 
    alignItems: 'center', 
    minWidth: '260px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
};
const searchField = { border: 'none', padding: '12px 8px', outline: 'none', fontSize: '13px', fontWeight: '600', width: '100%', background: 'transparent' };
const syncBtn = { background: '#fff', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: '10px', fontWeight: '700', fontSize: '13px' };

const cardWrapper = { 
    background: '#fff', 
    borderRadius: '16px', 
    border: '1px solid #f1f5f9', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
    overflow: 'hidden' 
};

const tableScroll = { overflowX: 'auto', width: '100%' };
const mainTable = { width: '100%', borderCollapse: 'collapse', minWidth: '1000px' };

const headerRow = { background: '#f8fafc', borderBottom: '1px solid #f1f5f9' };
const thStyle = { padding: '15px 20px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' };

const dataRow = { borderBottom: '1px solid #f8fafc', transition: '0.2s' };
const tdStyle = { padding: '15px 20px', verticalAlign: 'middle', fontSize: '14px' };

const profileFlex = { display: 'flex', alignItems: 'center', gap: '12px' };
const avatarImg = { width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', background: '#f1f5f9' };
const boldTxt = { fontWeight: '700', color: 'var(--text-main)' };
const mutedTxt = { color: 'var(--text-muted)', fontSize: '12px' };

const idBadge = { background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', color: '#475569', fontFamily: 'monospace' };

const contactBox = { display: 'flex', flexDirection: 'column', gap: '2px' };
const smallBold = { fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' };
const smallMuted = { fontSize: '12px', color: 'var(--text-muted)' };

const statusBadge = (s) => ({
    background: s === 'DistrictApproved' ? '#ecfdf5' : '#fffbeb',
    color: s === 'DistrictApproved' ? '#059669' : '#d97706',
    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800'
});

const viewDetailsBtn = {
    background: 'var(--primary-theme)',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    whiteSpace: 'nowrap'
};

const statusMsg = { padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600' };

export default StatePendingRequests;