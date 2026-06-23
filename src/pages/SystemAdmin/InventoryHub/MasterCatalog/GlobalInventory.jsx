import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../../../services/api'; 
import { useNavigate } from 'react-router-dom';
import { useBranding } from '../../../../context/BrandingContext'; // Added for White-labeling

const GlobalInventory = () => {
    const navigate = useNavigate();
    const { settings } = useBranding(); // Access admin branding
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

    // 1. 📡 Automatic Inventory Synchronization Protocol (No Buttons)
    const fetchInventory = useCallback(async () => {
        try {
            // Initial sync shows loader, background syncs are silent
            const res = await api.get('/admin/inventory/global'); 
            if (res.data.success) {
                setProducts(res.data.data || []);
                setError(null);
            }
            setLastSynced(new Date().toLocaleTimeString());
            document.title = `Global Inventory | ${settings.siteName}`;
        } catch (err) {
            console.error("Infrastructure Sync Error");
            setError("Connectivity Alert: Node registry unreachable.");
        } finally {
            setLoading(false);
        }
    }, [settings.siteName]);

    useEffect(() => {
        fetchInventory();
        
        // Auto-refresh when admin returns to this window (SaaS Protocol)
        window.addEventListener('focus', fetchInventory);
        return () => window.removeEventListener('focus', fetchInventory);
    }, [fetchInventory]);

    // 2. 🔍 Discovery & Filtering Engine
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = 
                (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                (p.shopId?.shopDetails?.shopName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.generatedId || "").toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCat = filterCategory === 'All' || p.category === filterCategory;
            return matchesSearch && matchesCat;
        });
    }, [products, searchTerm, filterCategory]);

    // 3. 📊 Operational Analytics
    const stats = useMemo(() => ({
        totalItems: products.length,
        lowStock: products.filter(p => p.stock < 10 && p.stock > 0).length,
        outOfStock: products.filter(p => p.stock === 0).length,
        totalValue: products.reduce((acc, curr) => acc + (Number(curr.price || 0) * Number(curr.stock || 0)), 0)
    }), [products]);

    const categoryOptions = useMemo(() => {
        const cats = products.map(p => p.category).filter(Boolean);
        return ['All', ...new Set(cats)];
    }, [products]);

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px', fontWeight:'800', color:'#94a3b8'}}>Syncing Central Inventory Registry...</p>
        </div>
    );

    return (
        <div style={containerS}>
            {/* --- [A] COMMAND HEADER --- */}
            <div style={headerFlex}>
                <div style={{flex:1}}>
                    <h2 style={titleS}>🛒 Central Inventory Intelligence</h2>
                    <p style={subTitleS}>Enterprise-level monitoring of commercial assets across the {settings.siteName} ecosystem.</p>
                </div>
                <div style={actionBtns}>
                    <div style={syncBadge}>
                        <span className="pulse-dot"></span> 
                        <small>Last Auto-Sync: {lastSynced}</small>
                    </div>
                    <button style={btnExport(themeColor)} onClick={() => window.print()}>📑 Export Ledger</button>
                </div>
            </div>

            {/* --- [B] ANALYTICS DASHBOARD --- */}
            <div style={statsGrid}>
                <div style={statCard(themeColor)}>
                    <span style={statLabel}>GLOBAL SKUs</span>
                    <span style={statValue}>{stats.totalItems} Units</span>
                </div>
                <div style={statCard('#f59e0b')}>
                    <span style={statLabel}>DEPLETION ALERTS</span>
                    <span style={{...statValue, color:'#f59e0b'}}>{stats.lowStock} Nodes</span>
                </div>
                <div style={statCard('#ef4444')}>
                    <span style={statLabel}>OUT OF STOCK</span>
                    <span style={{...statValue, color:'#ef4444'}}>{stats.outOfStock} Critical</span>
                </div>
                <div style={statCard('#10b981')}>
                    <span style={statLabel}>INVENTORY VALUATION</span>
                    <span style={{...statValue, color:'#10b981'}}>₹{stats.totalValue.toLocaleString('en-IN')}</span>
                </div>
            </div>

            {/* --- [C] DISCOVERY TOOLBAR --- */}
            <div style={toolbarS}>
                <div style={searchBox}>
                    <span style={searchIcon}>🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search by Product Name, SKU ID or Merchant Hub..." 
                        style={searchIn} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={filterGroup}>
                    <select style={selectS} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                        {categoryOptions.map(cat => (
                            <option key={cat} value={cat}>{cat.toUpperCase()} CATEGORY</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- [D] MASTER REGISTRY TABLE --- */}
            <div style={tableCard}>
                {error ? (
                    <div style={errorArea}>{error}</div>
                ) : (
                    <div style={{overflowX: 'auto'}}>
                        <table style={tableS}>
                            <thead>
                                <tr style={thRow}>
                                    <th style={tdS}>Visual & Identity</th>
                                    <th style={tdS}>Origin Hub</th>
                                    <th style={tdS}>Category</th>
                                    <th style={tdS}>Net Valuation</th>
                                    <th style={tdS}>Real-time Stock</th>
                                    <th style={tdS}>Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((p) => (
                                    <tr key={p._id} style={trS}>
                                        <td style={tdS}>
                                            <div style={prodInfo}>
                                                <img src={p.imageUrl || 'https://via.placeholder.com/50'} alt="asset" style={prodImg} />
                                                <div>
                                                    <div style={pName}>{p.name}</div>
                                                    <small style={pId}>SKU: {p.generatedId?.toUpperCase() || p._id.slice(-8).toUpperCase()}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tdS}>
                                            <div style={shopN}>{p.shopId?.shopDetails?.shopName || "Global Node"}</div>
                                            <small style={pDist}>📍 {p.shopId?.shopDetails?.address?.district || 'System'}</small>
                                        </td>
                                        <td style={tdS}><span style={catTag(themeColor)}>{p.category}</span></td>
                                        <td style={tdS}><b style={{color:'#0f172a', fontSize:'15px'}}>₹{p.price.toLocaleString()} / {p.unit || 'unit'}</b></td>
                                        <td style={tdS}>
                                            <div style={{marginBottom:'8px'}}>
                                                <span style={stockStatus(p.stock)}>
                                                    {p.stock <= 0 ? '🚫 Depleted' : `● ${p.stock} Units Live`}
                                                </span>
                                            </div>
                                            <div style={stockBarBg}>
                                                <div style={stockBarFill(p.stock)}></div>
                                            </div>
                                        </td>
                                        <td style={tdS}>
                                            <button 
                                                style={manageBtn(themeColor)} 
                                                onClick={() => navigate(`/admin/member-details/${p.shopId?._id}`)}
                                            >
                                                Inspect Hub
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {filteredProducts.length === 0 && !loading && (
                    <div style={noData}>Registry Clean: No inventory assets discovered for this sector.</div>
                )}
            </div>

            <style>{`
                .spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; animation: pulse-anim 2s infinite; margin-right: 8px; }
                @keyframes pulse-anim { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
            `}</style>
        </div>
    );
};

// --- Enterprise Visual Definitions ---

const containerS = { padding: '10px', minHeight: '100vh', animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin: 0, fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px' };
const subTitleS = { margin: '5px 0 0', color: '#64748b', fontSize: '14px', fontWeight: '500' };

const actionBtns = { display: 'flex', gap: '15px', alignItems:'center' };
const syncBadge = { display:'flex', alignItems:'center', background:'#fff', padding:'10px 15px', borderRadius:'12px', border:'1px solid #f1f5f9' };
const btnExport = (color) => ({ padding: '12px 25px', borderRadius: '14px', cursor: 'pointer', fontWeight: '900', fontSize: '12px', background: color, color: '#fff', border: 'none', boxShadow:`0 8px 15px ${color}33`, transition: '0.3s' });

const statsGrid = { display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' };
const statCard = (color) => ({ background: '#fff', padding: '25px', borderRadius: '32px', borderTop: `6px solid ${color}`, boxShadow: '0 10px 25px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', border: '1px solid #f1f5f9' });
const statLabel = { fontSize: '10px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px' };
const statValue = { fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '12px' };

const toolbarS = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '20px', background: '#fff', padding: '15px', borderRadius: '22px', border: '1px solid #f1f5f9', flexWrap:'wrap' };
const searchBox = { position: 'relative', flex: 1, minWidth: '300px' };
const searchIn = { width: '100%', padding: '14px 15px 14px 50px', borderRadius: '16px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '14px', background: '#f8fafc', fontWeight:'700', color:'#1e293b' };
const searchIcon = { position: 'absolute', left: '18px', top: '15px', color: '#94a3b8', fontSize: '18px' };

const filterGroup = { display: 'flex', gap: '15px' };
const selectS = { padding: '12px 20px', borderRadius: '16px', border: '1.5px solid #f1f5f9', background: '#fff', fontSize: '12px', fontWeight: '800', color: '#475569', outline: 'none', cursor:'pointer' };

const tableCard = { background: '#fff', borderRadius: '35px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' };
const tableS = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const thRow = { backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' };
const tdS = { padding: '22px 25px', fontSize: '14px', borderBottom: '1px solid #f8fafc' };
const trS = { transition: '0.2s' };

const prodInfo = { display: 'flex', alignItems: 'center', gap: '18px' };
const prodImg = { width: '55px', height: '55px', borderRadius: '15px', objectFit: 'cover', background: '#f8fafc', border: '1.5px solid #f1f5f9' };
const pName = { fontWeight: '900', color: '#0f172a', fontSize: '15px' };
const pId = { color: '#cbd5e1', fontSize: '10px', fontWeight: '900', textTransform:'uppercase', marginTop:'3px', display:'block' };
const shopN = { fontWeight: '800', color: '#334155' };
const pDist = { color: '#3b82f6', fontSize: '11px', fontWeight: '900' };
const catTag = (color) => ({ background: `${color}10`, color: color, padding: '5px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', textTransform:'uppercase', letterSpacing:'0.5px' });

const stockStatus = (qty) => ({
    fontWeight: '900', fontSize: '10px', textTransform: 'uppercase', letterSpacing:'0.5px',
    color: qty <= 0 ? '#ef4444' : qty < 10 ? '#f59e0b' : '#10b981'
});

const stockBarBg = { height: '6px', width: '120px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' };
const stockBarFill = (qty) => ({
    height: '100%',
    width: `${Math.min((qty / 100) * 100, 100)}%`, 
    background: qty <= 5 ? '#ef4444' : qty < 15 ? '#f59e0b' : '#10b981',
    borderRadius: '10px', transition: '0.5s cubic-bezier(0.4, 0, 0.2, 1)'
});

const manageBtn = (color) => ({ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontSize: '11px', fontWeight: '800', transition:'0.2s' });

const errorArea = { padding: '50px', textAlign: 'center', color: '#f43f5e', fontWeight: '800', background:'#fff1f2', fontSize:'14px' };
const noData = { padding: '100px 20px', textAlign: 'center', color: '#cbd5e1', fontSize: '16px', fontWeight: '800', letterSpacing:'1px', textTransform:'uppercase' };
const loaderS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '60vh', background:'#f8fafc', gap:'20px' };

export default GlobalInventory;