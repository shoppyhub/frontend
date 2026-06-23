import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api'; // ✅ फिक्स्ड पाथ
import { useBranding } from '../../../context/BrandingContext'; // ✅ फिक्स्ड पाथ
import { toast } from 'react-toastify';
import MerchantViewDetails from '../MerchantViewDetails'; 

const StateManageShops = ({ state }) => {
    const { settings } = useBranding();
    const [shops, setShops] = useState([]);
    const [filteredShops, setFilteredShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState('list'); 
    const [selectedShopId, setSelectedShopId] = useState(null);

    const themeColor = settings?.themeColor || '#0f172a';

    const fetchActiveShops = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/shops/all');
            if (res.data.success) {
                setShops(res.data.data);
                setFilteredShops(res.data.data);
            }
        } catch (err) {
            toast.error("Regional registry sync failed.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActiveShops();
    }, [fetchActiveShops]);

    useEffect(() => {
        const filtered = shops.filter(s => 
            s.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.owner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.districtName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredShops(filtered);
    }, [searchTerm, shops]);

    const toggleShopStatus = async (id, currentStatus) => {
        const action = currentStatus === 'ACTIVE' ? 'SUSPEND' : 'ACTIVATE';
        if (!window.confirm(`Are you sure you want to ${action} this merchant node?`)) return;
        try {
            const res = await api.patch(`/admin/hierarchy/status/${id}`, { isActive: currentStatus !== 'ACTIVE' });
            if (res.data.success) {
                toast.success(`Merchant Hub successfully ${action}ED.`);
                fetchActiveShops();
            }
        } catch (err) { toast.error("Operation failed."); }
    };

    if (viewMode === 'details') {
        return <MerchantViewDetails shopId={selectedShopId} onBack={() => setViewMode('list')} stateName={state} />;
    }

    return (
        <div style={containerS}>
            <div className="header-module" style={headerFlex}>
                <div className="title-section">
                    <h2 style={titleS}>🏪 Authorized Merchant Registry</h2>
                    <p style={subS}>Managing live commercial nodes in <b>{state}</b></p>
                </div>
                <div className="controls-row" style={filterRow}>
                    <div className="search-container" style={searchBox}>
                        <span style={{opacity: 0.5}}>🔍</span>
                        <input placeholder="Search..." style={searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button onClick={fetchActiveShops} style={refreshBtn}>🔄 Sync Hubs</button>
                </div>
            </div>

            <div style={miniStatsGrid}>
                <div style={statCardS('#3b82f6')}><small>TOTAL NODES</small><b>{shops.length}</b></div>
                <div style={statCardS('#10b981')}><small>ACTIVE HUB</small><b>{shops.filter(s => s.status === 'ACTIVE').length}</b></div>
                <div style={statCardS('#ef4444')}><small>SUSPENDED</small><b>{shops.filter(s => s.status === 'SUSPENDED').length}</b></div>
            </div>

            <div style={tableWrapper}>
                {loading ? (
                    <div style={loaderArea}>Establishing Data Link...</div>
                ) : (
                    <div className="table-scroll-area" style={tableResponsiveS}>
                        <table style={tableS}>
                            <thead>
                                <tr style={thRow}>
                                    <th style={tdS}>HUB & ID</th>
                                    <th style={tdS}>OWNER</th>
                                    <th style={tdS}>JURISDICTION</th>
                                    <th style={tdS}>STATUS</th>
                                    <th style={tdS}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredShops.map((shop) => (
                                    <tr key={shop._id} style={trS}>
                                        <td style={tdS}><b>{shop.shopName}</b><br/><small>{shop.id}</small></td>
                                        <td style={tdS}>{shop.owner}</td>
                                        <td style={tdS}>{shop.districtName}</td>
                                        <td style={tdS}><span style={statusTag(shop.status)}>{shop.status}</span></td>
                                        <td style={tdS}>
                                            <button onClick={() => { setSelectedShopId(shop._id); setViewMode('details'); }} style={auditBtn}>👁️ Audit</button>
                                            <button onClick={() => toggleShopStatus(shop._id, shop.status)} style={shop.status === 'ACTIVE' ? suspBtn : actvBtn}>{shop.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// Styles (Shortened for brevity)
const containerS = { padding: '20px' };
const headerFlex = { display:'flex', justifyContent:'space-between', marginBottom:'30px', flexWrap:'wrap' };
const titleS = { margin: 0, fontWeight: '900', color: '#0f172a', fontSize: '26px' };
const subS = { margin: 0, color: '#64748b', fontSize: '14px' };
const filterRow = { display: 'flex', gap: '15px' };
const searchBox = { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '0 15px', display: 'flex', alignItems: 'center' };
const searchInput = { border: 'none', padding: '12px 0', outline: 'none' };
const refreshBtn = { background: '#fff', border: '1.5px solid #e2e8f0', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800' };
const miniStatsGrid = { display:'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap:'20px', marginBottom:'30px' };
const statCardS = (c) => ({ background:'#fff', padding:'20px', borderRadius:'18px', borderLeft:`6px solid ${c}` });
const tableWrapper = { background: '#fff', borderRadius: '25px', overflow: 'hidden', border: '1px solid #f1f5f9' };
const tableResponsiveS = { overflowX: 'auto' };
const tableS = { width: '100%', borderCollapse: 'collapse', minWidth: '1000px' };
const thRow = { background: '#f8fafc', textAlign: 'left', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' };
const trS = { borderBottom: '1px solid #f8fafc' };
const tdS = { padding: '15px 20px' };
const statusTag = (s) => ({ background: s === 'ACTIVE' ? '#ecfdf5' : '#fff1f2', color: s === 'ACTIVE' ? '#059669' : '#e11d48', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '900' });
const auditBtn = { background:'#0f172a', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer' };
const suspBtn = { background:'#fff1f2', color:'#e11d48', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer' };
const actvBtn = { background:'#f0fdf4', color:'#16a34a', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer' };
const loaderArea = { padding:'100px', textAlign:'center', color:'#94a3b8' };

export default StateManageShops;