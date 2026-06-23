import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { useBranding } from '../../../context/BrandingContext';
import { toast } from 'react-toastify';
import DistrictPendingDetails from './DistrictPendingDetails';

const DistrictPendingList = ({ stateName }) => {
    const { settings } = useBranding();
    const [shops, setShops] = useState([]);
    const [filteredShops, setFilteredShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState('list');
    const [selectedShopId, setSelectedShopId] = useState(null);

    const themeColor = settings?.themeColor || '#0f172a';

    // 1. डेटा लोड करना (Status: Pending वाले आवेदन)
    const fetchDistrictPending = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/shops/pending?status=Pending');
            if (res.data.success) {
                setShops(res.data.data);
                setFilteredShops(res.data.data);
            }
        } catch (err) {
            toast.error("Handshake Error: Failed to sync district-level registry.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDistrictPending();
    }, [fetchDistrictPending]);

    // 2. सर्च और फ़िल्टर लॉजिक
    useEffect(() => {
        const filtered = shops.filter(shop => 
            shop.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shop.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shop.shopDistrict?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shop.trackingId?.includes(searchTerm) ||
            shop.mobile?.includes(searchTerm) ||
            shop.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredShops(filtered);
    }, [searchTerm, shops]);

    if (viewMode === 'details' && selectedShopId) {
        return <DistrictPendingDetails shopId={selectedShopId} onBack={() => setViewMode('list')} />;
    }

    return (
        <div style={containerS}>
            {/* Header & Filter Module */}
            <div className="header-module" style={headerFlex}>
                <div className="title-section">
                    <h2 style={titleS}>📍 District-Level Monitoring</h2>
                    <p style={subS}>Monitoring all 'District Pending' nodes in <b>{stateName}</b>.</p>
                </div>
                
                <div className="filter-controls" style={filterRow}>
                    <div className="search-wrapper" style={searchBox}>
                        <span style={{opacity: 0.5}}>🔍</span>
                        <input 
                            placeholder="Search District, Name, Mobile or ID..." 
                            style={searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={fetchDistrictPending} className="sync-btn" style={refreshBtn}>🔄 Sync Registry</button>
                </div>
            </div>

            {/* Table Registry Card */}
            <div style={tableCard}>
                {loading ? (
                    <div style={loaderArea}>Establishing Secure Cross-District Uplink...</div>
                ) : filteredShops.length === 0 ? (
                    <div style={emptyArea}>No matching applications pending at district level.</div>
                ) : (
                    <div className="table-responsive" style={tableResponsiveS}>
                        <table style={tableS}>
                            <thead>
                                <tr style={thRow}>
                                    <th style={tdS}>OWNER IDENTITY</th>
                                    <th style={tdS}>DISTRICT HUB</th>
                                    <th style={tdS}>SHOP NAME</th>
                                    <th style={tdS}>TRACKING ID</th>
                                    <th style={tdS}>CONTACTS</th>
                                    <th style={tdS}>STATUS</th>
                                    <th style={tdS}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredShops.map((shop) => (
                                    <tr key={shop._id} style={trS}>
                                        {/* Column 1: Identity (Photo, Name, Father's Name) */}
                                        <td style={tdS}>
                                            <div style={profileGroup}>
                                                <img src={shop.displayPhoto || 'https://via.placeholder.com/100'} alt="Owner" style={ownerImg} />
                                                <div>
                                                    <div style={uName}>{shop.fullName}</div>
                                                    <small style={uFather}>S/O: {shop.fatherName || 'N/A'}</small>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Column 2: District */}
                                        <td style={tdS}><b style={{color:themeColor}}>📍 {shop.shopDistrict}</b></td>

                                        {/* Column 3: Shop Info */}
                                        <td style={tdS}>
                                            <div style={boldTxt}>{shop.shopName}</div>
                                            <small style={mutedTxt}>{shop.shopType}</small>
                                        </td>

                                        {/* Column 4: ID */}
                                        <td style={tdS}><span style={idBadge}>{shop.trackingId}</span></td>

                                        {/* Column 5: Contacts */}
                                        <td style={tdS}>
                                            <div style={contactBox}>
                                                <div style={cItem}>📞 {shop.mobile}</div>
                                                <div style={cItem}>✉️ {shop.email}</div>
                                            </div>
                                        </td>

                                        {/* Column 6: Status */}
                                        <td style={tdS}>
                                            <span style={statusTag}>DISTRICT PENDING</span>
                                        </td>

                                        {/* Column 7: Action */}
                                        <td style={tdS}>
                                            <button 
                                                onClick={() => { setSelectedShopId(shop._id); setViewMode('details'); }}
                                                className="view-btn"
                                                style={viewBtn(themeColor)}
                                            >👁️ Monitor</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                .table-responsive::-webkit-scrollbar { height: 6px; }
                .table-responsive::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

                @media (max-width: 1024px) {
                    .header-module { flex-direction: column !important; align-items: flex-start !important; gap: 20px !important; }
                    .filter-controls { width: 100% !important; justify-content: space-between !important; }
                    .search-wrapper { flex: 1 !important; width: auto !important; }
                }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Definitions ---
const containerS = { animation: 'fadeIn 0.5s ease', padding: '20px' };
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap' };
const titleS = { margin: 0, fontWeight: '900', color: '#0f172a', fontSize: '24px', letterSpacing: '-0.5px' };
const subS = { margin: '2px 0 0', color: '#64748b', fontSize: '14px' };

const filterRow = { display: 'flex', gap: '15px', alignItems: 'center' };
const searchBox = { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '0 15px', display: 'flex', alignItems: 'center', width: '320px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' };
const searchInput = { border: 'none', padding: '12px 0', outline: 'none', fontSize: '13px', fontWeight: '600', width: '100%', background: 'transparent' };
const refreshBtn = { background: '#fff', border: '1.5px solid #e2e8f0', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '13px' };

const tableCard = { background: '#fff', borderRadius: '25px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', overflow: 'hidden' };
const tableResponsiveS = { overflowX: 'auto', WebkitOverflowScrolling: 'touch' };
const tableS = { width: '100%', borderCollapse: 'collapse', minWidth: '1100px' };
const thRow = { background: '#f8fafc', textAlign: 'left', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' };
const trS = { borderBottom: '1px solid #f8fafc', transition: '0.2s' };
const tdS = { padding: '15px 20px', fontSize: '13px', verticalAlign: 'middle' };

const profileGroup = { display: 'flex', alignItems: 'center', gap: '12px' };
const ownerImg = { width: '45px', height: '45px', borderRadius: '12px', objectFit: 'cover', background: '#f1f5f9', border: '1px solid #e2e8f0' };
const uName = { fontWeight: '800', color: '#1e293b', fontSize: '14px' };
const uFather = { color: '#94a3b8', fontSize: '11px', fontWeight: '600' };

const boldTxt = { fontWeight: '700', color: '#1e293b' };
const mutedTxt = { color: '#64748b', fontSize: '11px' };
const idBadge = { background: '#f1f5f9', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', color: '#475569', fontFamily: 'monospace' };

const contactBox = { display: 'flex', flexDirection: 'column', gap: '4px' };
const cItem = { fontSize: '12px', fontWeight: '600', color: '#475569' };

const statusTag = { background: '#fffbeb', color: '#d97706', padding: '5px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '900', border: '1px solid #fef3c7', whiteSpace: 'nowrap' };

const viewBtn = (color) => ({ background: '#0f172a', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: '0.3s' });

const loaderArea = { padding: '100px', textAlign: 'center', color: '#94a3b8', fontWeight: '700' };
const emptyArea = { padding: '100px', textAlign: 'center', color: '#94a3b8' };

export default DistrictPendingList;