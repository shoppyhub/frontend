import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// API and Context Imports
// ध्यान दें: अगर फाइल नहीं मिलती है तो पाथ चेक करें (../../../)
import api from '../../../../services/api';
import { useBranding } from '../../../../context/BrandingContext';

// Components
import EmptyState from '../../../../components/SystemAdmin/EmptyState';
import LoadingState from '../../../../components/SystemAdmin/LoadingState';

// Utils
import { exportToCSV, exportToJSON } from '../../../../utils/exportUtils';

const ManageShops = () => {
    const navigate = useNavigate();
    const { settings } = useBranding();
    
    // --- Core States ---
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDistrict, setFilterDistrict] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

    const themeColor = settings?.themeColor || '#0f172a';

    // 1. 📡 Registry Synchronization
    const fetchShops = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/shops/all');
            if (res.data.success) {
                setShops(res.data.data || []);
            }
            setLastSynced(new Date().toLocaleTimeString());
        } catch (err) {
            console.error("Registry Sync Failure:", err);
            toast.error("Infrastructure Alert: Merchant node registry unreachable.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchShops();
        // ऑटो-रिफ्रेश जब यूजर टैब पर वापस आये
        window.addEventListener('focus', fetchShops);
        return () => window.removeEventListener('focus', fetchShops);
    }, [fetchShops]);

    // 2. 🛡️ Operational Handlers
    const handleToggleStatus = async (id, currentStatus) => {
        const isCurrentlyActive = currentStatus === 'ACTIVE';
        const actionLabel = isCurrentlyActive ? 'SUSPEND' : 'ACTIVATE';
        
        if (!window.confirm(`SECURITY ALERT: ${actionLabel} this hub node immediately?`)) return;

        try {
            const res = await api.patch(`/admin/shops/toggle/${id}`, { 
                isActive: !isCurrentlyActive 
            });
            
            if (res.data.success) {
                toast.success(`Node successfully ${isCurrentlyActive ? 'suspended' : 'activated'}.`);
                fetchShops(); // डेटा रिफ्रेश करें
            }
        } catch (err) {
            toast.error("Operation Denied: Registry handshake failed.");
        }
    };

    const handleManage = (id) => {
        if (!id) return toast.error("Deployment Error: Node ID mismatch.");
        navigate(`/admin/shop-control/${id}`);
    };

    // 3. 🔍 Intelligence Engine (Filtering & Stats)
    const filteredShops = useMemo(() => {
        return shops.filter(s => {
            const str = `${s.shopName} ${s.owner} ${s.id} ${s.mobile}`.toLowerCase();
            const matchesSearch = str.includes(searchTerm.toLowerCase());
            const matchesDist = filterDistrict === "All" || s.districtName === filterDistrict;
            const matchesStatus = filterStatus === "All" || s.status === filterStatus;
            return matchesSearch && matchesDist && matchesStatus;
        });
    }, [shops, searchTerm, filterDistrict, filterStatus]);

    const stats = useMemo(() => ({
        active: shops.filter(s => s.status === 'ACTIVE').length,
        revenue: shops.reduce((acc, s) => acc + (s.totalSales || 0), 0),
        total: shops.length
    }), [shops]);

    const districts = useMemo(() => ["All", ...new Set(shops.map(s => s.districtName).filter(Boolean))], [shops]);

    // 4. 📤 Export Logic
    const handleExportCSV = () => {
        const dataToExport = filteredShops.map(shop => ({
            'Shop Name': shop.shopName,
            'Owner': shop.owner,
            'Mobile': shop.mobile,
            'Email': shop.email,
            'District': shop.districtName,
            'Status': shop.status,
            'Revenue': shop.totalSales || 0,
            'Wallet Balance': shop.wallet?.balance || 0
        }));
        exportToCSV(dataToExport, `merchant_registry_${new Date().getTime()}.csv`);
    };

    const handleExportJSON = () => {
        exportToJSON(filteredShops, `merchant_registry_${new Date().getTime()}.json`);
    };

    if (loading) return <LoadingState message="LOADING MERCHANT REGISTRY..." color={themeColor} fullPage={false} />;

    return (
        <div style={containerS}>
            {/* --- [A] COMMAND HEADER --- */}
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>🏬 Active Merchant Hub Registry</h2>
                    <p style={subS}>Verification and operational control of verified storefront nodes.</p>
                </div>
                <div style={statsRow}>
                    <StatNode label="TOTAL REVENUE" val={`₹${stats.revenue.toLocaleString()}`} col="#10b981" />
                    <StatNode label="ACTIVE HUBS" val={stats.active} col={themeColor} />
                    <StatNode label="TOTAL REGISTRY" val={stats.total} col="#6366f1" isLast />
                </div>
            </div>

            {/* --- [B] CONTROL TOOLBAR --- */}
            <div style={toolbarS}>
                <div style={searchBox}>
                    <span>🔍</span>
                    <input 
                        style={inSearch} 
                        placeholder="Search hub name, proprietor or ID..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                    />
                </div>
                <div style={filterGroup}>
                    <select style={selectS} value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)}>
                        {districts.map(d => <option key={d} value={d}>{d === 'All' ? 'All Districts' : d.toUpperCase()}</option>)}
                    </select>
                    <select style={selectS} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="All">All Compliance</option>
                        <option value="ACTIVE">ACTIVE NODES</option>
                        <option value="SUSPENDED">SUSPENDED HUBS</option>
                    </select>
                    <div style={syncTag}>Last Synced: {lastSynced}</div>
                    <button onClick={handleExportCSV} style={exportBtnS(themeColor)}>📥 CSV</button>
                    <button onClick={handleExportJSON} style={exportBtnS(themeColor)}>📥 JSON</button>
                </div>
            </div>

            {/* --- [C] DATA ARCHITECTURE (TABLE) --- */}
            <div style={tableWrapper}>
                {filteredShops.length === 0 ? (
                    <EmptyState
                        icon="🏬"
                        title="No Shops Found"
                        description={searchTerm || filterDistrict !== 'All' || filterStatus !== 'All'
                            ? "No shops match your search or filter criteria."
                            : "No merchant hubs registered in the system yet."
                        }
                    />
                ) : (
                    <table style={tableS}>
                        <thead>
                            <tr style={thRow}>
                                <th style={tdS}>Proprietor Details</th>
                                <th style={tdS}>System ID</th>
                                <th style={tdS}>Contact Info</th>
                                <th style={tdS}>Shop Details</th>
                                <th style={tdS}>Location</th>
                                <th style={tdS}>Financials</th>
                                <th style={tdS}>Status</th>
                                <th style={tdS}>Action Console</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredShops.map(shop => (
                                <tr key={shop._id} style={trS}>
                                    {/* 1. Proprietor Details */}
                                    <td style={tdS}>
                                        <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                                            <img 
                                                src={shop.displayPhoto || 'https://via.placeholder.com/40'} 
                                                alt="O" 
                                                style={avatarS} 
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }} 
                                            />
                                            <div style={nameS}>{shop.owner}</div>
                                        </div>
                                    </td>

                                    {/* 2. System ID */}
                                    <td style={tdS}>
                                        <div style={idS}>{shop.id || 'N/A'}</div>
                                        <div style={metaS}>Since: {shop.since || 'New'}</div>
                                    </td>

                                    {/* 3. Contact Info */}
                                    <td style={tdS}>
                                        <div style={nameS}>📱 {shop.mobile}</div>
                                        <div style={metaS}>📧 {shop.email ? `${shop.email.split('@')[0]}...` : 'No Email'}</div>
                                    </td>

                                    {/* 4. Shop Details */}
                                    <td style={tdS}>
                                        <div style={{...nameS, color: themeColor}}>{shop.shopName}</div>
                                        <div style={metaS}>Sector: General Hub</div>
                                    </td>

                                    {/* 5. Location */}
                                    <td style={tdS}>
                                        <div style={metaS}>📍 {shop.districtName}</div>
                                        <small style={{color:'#94a3b8'}}>{shop.blockName || 'Main Cluster'}</small>
                                    </td>

                                    {/* 6. Financials */}
                                    <td style={tdS}>
                                        <div style={revenueS}>₹{(shop.totalSales || 0).toLocaleString()}</div>
                                        <div style={walletTag}>Wallet: ₹{shop.wallet?.balance || 0}</div>
                                    </td>

                                    {/* 7. Status */}
                                    <td style={tdS}>
                                        <span style={statusBadgeS(shop.status === 'ACTIVE')}>● {shop.status}</span>
                                    </td>

                                    {/* 8. Action Console */}
                                    <td style={tdS}>
                                        <div style={{display:'flex', gap:'8px'}}>
                                            <button 
                                                onClick={() => handleManage(shop._id)} 
                                                style={manageBtnS(themeColor)}
                                            >
                                                VIEW
                                            </button>
                                            <button 
                                                onClick={() => handleToggleStatus(shop._id, shop.status)} 
                                                style={shop.status === 'ACTIVE' ? suspBtnS : actBtnS}
                                            >
                                                {shop.status === 'ACTIVE' ? 'SUSPEND' : 'ACTIVATE'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                tr:hover { background-color: #fcfdfe !important; }
                input::placeholder { color: #cbd5e1; }
            `}</style>
        </div>
    );
};

// --- Atomic UI Helpers ---
const StatNode = ({ label, val, col, isLast }) => (
    <div style={{...statItem, borderRight: isLast ? 'none' : '1px solid #f1f5f9'}}>
        <small style={statLab}>{label}</small>
        <b style={{...statVal, color: col}}>{val}</b>
    </div>
);

// --- Strategic Styles ---
const containerS = { padding: '0px', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f8fafc', animation: 'fadeIn 0.4s ease' };
const headerFlex = { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'30px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin:0, fontSize:'24px', fontWeight:'900', color:'#0f172a', letterSpacing:'-0.5px' };
const subS = { color: '#64748b', fontSize: '13px', marginTop: '4px' };

const statsRow = { background:'#fff', display:'flex', borderRadius:'16px', border:'1px solid #f1f5f9', boxShadow:'0 4px 15px rgba(0,0,0,0.02)', overflow:'hidden' };
const statItem = { padding:'12px 20px', textAlign:'center', minWidth:'120px' };
const statLab = { display:'block', fontSize:'9px', fontWeight:'900', color:'#94a3b8', letterSpacing:'1px', marginBottom:'4px', textTransform:'uppercase' };
const statVal = { fontSize:'16px', fontWeight:'900' };

const toolbarS = { display:'flex', justifyContent:'space-between', gap:'15px', marginBottom:'25px', flexWrap:'wrap', background:'#fff', padding:'12px', borderRadius:'18px', border:'1px solid #f1f5f9', alignItems:'center' };
const searchBox = { flex:1, minWidth:'280px', background:'#f8fafc', padding:'0 15px', borderRadius:'12px', border:'1.5px solid #f1f5f9', display:'flex', alignItems:'center', gap:'10px' };
const inSearch = { border:'none', width:'100%', padding:'10px 0', outline:'none', fontSize:'13px', fontWeight:'600', background:'transparent' };
const filterGroup = { display:'flex', gap:'8px', alignItems:'center' };
const selectS = { padding:'8px 12px', borderRadius:'10px', border:'1.5px solid #f1f5f9', background:'#fff', fontWeight:'700', fontSize:'11px', outline:'none', cursor:'pointer' };
const syncTag = { fontSize:'10px', fontWeight:'700', color:'#cbd5e1', marginRight:'10px' };

const tableWrapper = { background:'#fff', borderRadius:'20px', border:'1px solid #f1f5f9', overflowX:'auto', boxShadow:'0 10px 30px rgba(0,0,0,0.02)' };
const tableS = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1100px' };
const thRow = { backgroundColor: '#f8fafc', borderBottom: '1.5px solid #f1f5f9' };
const tdS = { padding: '14px 16px', fontSize: '12px', borderBottom: '1px solid #f8fafc' };
const trS = { transition: '0.2s' };

const avatarS = { width:'38px', height:'38px', borderRadius:'10px', objectFit:'cover', border:'1px solid #f1f5f9' };
const nameS = { fontWeight:'800', color:'#1e293b', fontSize:'12.5px' };
const idS = { fontWeight:'800', color:'#0f172a', fontSize:'12px' };
const metaS = { fontSize:'10px', color:'#94a3b8', fontWeight:'700', marginTop:'2px' };

const revenueS = { fontWeight:'800', color:'#10b981', fontSize:'13px' };
const walletTag = { fontSize:'10px', fontWeight:'700', color:'#6366f1', marginTop:'2px' };

const statusBadgeS = (active) => ({ 
    padding:'4px 10px', borderRadius:'6px', fontSize:'9px', fontWeight:'900', 
    background: active ? '#ecfdf5' : '#fff1f2', 
    color: active ? '#10b981' : '#f43f5e',
    display: 'inline-block'
});

const manageBtnS = (col) => ({ background: col, color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '10px' });
const suspBtnS = { background:'#fff1f2', color:'#ef4444', border:'1px solid #fee2e2', borderRadius:'8px', padding:'8px 12px', fontWeight:'800', fontSize:'10px', cursor:'pointer' };
const actBtnS = { background:'#f0fdf4', color:'#16a34a', border:'1px solid #dcfce7', borderRadius:'8px', padding:'8px 12px', fontWeight:'800', fontSize:'10px', cursor:'pointer' };
const exportBtnS = (col) => ({ background:'#fff', color: col, border: `1px solid ${col}40`, borderRadius:'8px', padding:'8px 12px', fontWeight:'800', fontSize:'10px', cursor:'pointer' });

export default ManageShops;