import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { useBranding } from '../../../context/BrandingContext';
import { toast } from 'react-toastify';
import ShopDetailView from './ShopDetailView';

const ShopVerification = ({ districtName }) => {
    const { settings } = useBranding();
    const [view, setView] = useState('list'); 
    const [selectedShop, setSelectedShop] = useState(null);
    const [pendingShops, setPendingShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const themeColor = settings?.themeColor || '#0d9488';

    // 1. Fetch Data
    const fetchPendingShops = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/shops/pending');
            if (res.data.success) {
                setPendingShops(res.data.data || []);
            }
        } catch (err) {
            toast.error("Failed to sync application registry.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingShops();
    }, [fetchPendingShops]);

    const handleAction = async (id, status, shopName) => {
        try {
            const endpoint = status === 'Approved' ? 'approve' : 'reject';
            const res = await api.put(`/admin/shops/${endpoint}/${id}`);
            if (res.data.success) {
                toast.success(`${shopName} verified successfully.`);
                setView('list');
                fetchPendingShops();
            }
        } catch (err) { toast.error("Action failed."); }
    };

    // Advanced search filter logic
    const filteredShops = pendingShops.filter(shop => {
        const sName = shop.shopName || shop.shopDetails?.shopName || "";
        const fName = shop.fullName || "";
        const fatName = shop.fatherName || "";
        const tid = shop.trackingId || "";
        
        const target = `${sName} ${fName} ${fatName} ${tid}`.toLowerCase();
        return target.includes(filter.toLowerCase());
    });

    if (view === 'audit' && selectedShop) {
        return (
            <ShopDetailView 
                shopData={selectedShop} 
                onBack={() => setView('list')} 
                onAction={handleAction}
            />
        );
    }

    return (
        <div style={containerS}>
            <div style={headerFlex}>
                <div style={headTxtBox}>
                    <h2 style={titleS}>🛡️ Merchant Verification Queue</h2>
                    <p style={subTitleS}>Audit local hubs for {districtName || 'GARHWA'} District Node.</p>
                </div>
                <div style={searchWrapper}>
                    <input 
                        type="text" 
                        placeholder="Search by ID, Name or Shop..." 
                        style={searchIn}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div style={loaderBox}><div className="pulse-loader" style={{borderColor:themeColor}}></div></div>
            ) : (
                <div style={tableCard}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={tableS}>
                            <thead>
                                <tr style={thRow}>
                                    <th style={thS}>MERCHANT IDENTITY</th>
                                    <th style={thS}>SHOP NAME</th>
                                    <th style={thS}>APPLICATION ID</th>
                                    <th style={thS}>MOBILE / EMAIL</th>
                                    <th style={thS}>BLOCK</th>
                                    <th style={thS}>STATUS</th>
                                    <th style={thS}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredShops.length === 0 ? (
                                    <tr><td colSpan="7" style={emptyMsg}>No pending applications discovered.</td></tr>
                                ) : (
                                    filteredShops.map((shop) => (
                                        <tr key={shop._id} style={trS}>
                                            {/* Column 1: Identity (Photo + Name + Father Name) */}
                                            <td style={tdS}>
                                                <div style={identityFlex}>
                                                    <img 
                                                        src={shop.ownerPhoto || shop.photo || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                                                        style={avatarS} alt="Proprietor" 
                                                    />
                                                    <div>
                                                        <div style={nameTxt}>{shop.fullName}</div>
                                                        <small style={fatherTxt}>S/O: {shop.fatherName || 'Not Mentioned'}</small>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Column 2: Shop Name */}
                                            <td style={tdS}>
                                                <b style={shopNameTxt}>{shop.shopName || shop.shopDetails?.shopName}</b>
                                                <div style={typeBadgeS}>{shop.shopType || 'Commercial'}</div>
                                            </td>

                                            {/* Column 3: App ID (trackingId) */}
                                            <td style={tdS}><code style={idLabelS}>{shop.trackingId || 'PENDING'}</code></td>

                                            {/* Column 4: Contact */}
                                            <td style={tdS}>
                                                <div style={mobTxt}>📱 {shop.mobile}</div>
                                                <div style={emailTxt}>📧 {shop.email}</div>
                                            </td>

                                            {/* Column 5: Block */}
                                            <td style={tdS}>
                                                <span style={blockBadge}>{shop.shopBlock || shop.shopDetails?.address?.block || 'N/A'}</span>
                                            </td>

                                            {/* Column 6: Status */}
                                            <td style={tdS}><span style={statusBadge}>AWAITING_AUDIT</span></td>

                                            {/* Column 7: Action */}
                                            <td style={tdS}>
                                                <button 
                                                    style={viewBtn(themeColor)}
                                                    onClick={() => { setSelectedShop(shop); setView('audit'); }}
                                                >
                                                    👁️ INSPECT
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Styles ---
const containerS = { padding: '20px', animation: 'fadeIn 0.5s ease' };
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' };
const headTxtBox = { flex: 1 };
const titleS = { margin: 0, fontWeight: '900', fontSize: '22px', color: '#0f172a' };
const subTitleS = { margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' };
const searchWrapper = { position: 'relative', width: '320px' };
const searchIn = { width: '100%', padding: '12px 18px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px', fontWeight: '700' };

const tableCard = { background: '#fff', borderRadius: '22px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', overflow: 'hidden' };
const tableS = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1100px' };
const thRow = { background: '#f8fafc', borderBottom: '1px solid #f1f5f9' };
const thS = { padding: '15px 20px', fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' };
const trS = { borderBottom: '1px solid #f8fafc', transition: '0.2s' };
const tdS = { padding: '15px 20px', fontSize: '13px' };

const identityFlex = { display: 'flex', alignItems: 'center', gap: '12px' };
const avatarS = { width: '42px', height: '42px', borderRadius: '12px', objectFit: 'cover', background: '#f1f5f9', border: '1.5px solid #e2e8f0' };
const nameTxt = { fontWeight: '800', color: '#1e293b', fontSize: '14px' };
const fatherTxt = { color: '#94a3b8', fontSize: '11px', fontWeight: '600' };

const shopNameTxt = { color: '#1e293b', fontWeight: '800' };
const typeBadgeS = { color: '#3b82f6', fontWeight: '800', fontSize: '9px', textTransform: 'uppercase' };

const idLabelS = { background: '#f8fafc', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', color: '#0f172a', fontWeight: '900', border: '1px solid #e2e8f0' };
const mobTxt = { fontWeight: '700', color: '#1e293b' };
const emailTxt = { fontSize: '11px', color: '#94a3b8', fontWeight: '600' };
const blockBadge = { background: '#f0f9ff', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', color: '#0369a1', border: '1px solid #e0f2fe' };
const statusBadge = { background: '#fff4e5', color: '#d97706', fontSize: '9px', fontWeight: '900', padding: '4px 10px', borderRadius: '8px' };

const viewBtn = (color) => ({ background: color, color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '900', fontSize: '11px', boxShadow: `0 4px 12px ${color}33` });
const loaderBox = { display: 'flex', justifyContent: 'center', padding: '100px' };
const emptyMsg = { textAlign: 'center', padding: '60px', color: '#94a3b8', fontWeight: '800' };

export default ShopVerification;