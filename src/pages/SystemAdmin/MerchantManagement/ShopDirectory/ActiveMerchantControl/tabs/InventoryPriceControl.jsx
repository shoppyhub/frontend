import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from 'services/api';
import AdminProductForm from './AdminProductForm'; // ✅ आपकी नई फाइल

const InventoryPriceControl = ({ merchant }) => {
    // --- Core States ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // --- Modal & Edit States ---
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // 1. 📡 Registry Synchronization (Products & Categories)
    const fetchFullData = useCallback(async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                api.get(`/admin/inventory/global?shopId=${merchant._id}`),
                api.get('/admin/directories/shop-types')
            ]);
            
            if (prodRes.data.success) {
                // Filter only this merchant's assets
                const shopProducts = prodRes.data.data.filter(p => p.shopId?._id === merchant._id);
                setProducts(shopProducts);
            }
            if (catRes.data.success) {
                setCategories(catRes.data.data || []);
            }
        } catch (err) {
            toast.error("Cluster Handshake Failed: Registry unreachable.");
        } finally {
            setLoading(false);
        }
    }, [merchant._id]);

    useEffect(() => {
        fetchFullData();
    }, [fetchFullData]);

    // 2. 🛡️ Operational Overrides
    const toggleProductStatus = async (id, currentStatus) => {
        try {
            const res = await api.patch(`/admin/inventory/status/${id}`, { isActive: !currentStatus });
            if (res.data.success) {
                toast.success(`Node visibility updated.`);
                fetchFullData(); // Refresh list
            }
        } catch (err) {
            toast.error("Operation Denied by Registry.");
        }
    };

    // 3. 🔍 Intelligence Engine (Filtering & Stats)
    const filteredItems = useMemo(() => {
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.generatedId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const stats = useMemo(() => ({
        total: products.length,
        live: products.filter(p => p.isActive).length,
        low: products.filter(p => p.stock > 0 && p.stock <= 5).length,
        out: products.filter(p => p.stock === 0).length
    }), [products]);

    const themeColor = '#0f172a'; // Default Admin Theme

    if (loading) return (
        <div style={loaderWrapperS}>
            <div className="pro-inventory-spinner"></div>
            <p style={{marginTop:'15px', fontWeight:'900', color:'#94a3b8', fontSize:'12px'}}>SYNCING HUB INVENTORY...</p>
        </div>
    );

    return (
        <div style={containerS}>
            
            {/* --- [A] ANALYTICS METRICS BAR --- */}
            <div style={metricsRowS}>
                <MetricCard label="Master Assets" val={stats.total} icon="📦" col="#6366f1" />
                <MetricCard label="Live Nodes" val={stats.live} icon="🌐" col="#10b981" />
                <MetricCard label="Depletion Alerts" val={stats.low} icon="⚠️" col="#f59e0b" />
                <MetricCard label="Void Stock" val={stats.out} icon="🚫" col="#ef4444" />
            </div>

            {/* --- [B] COMMAND TOOLBAR --- */}
            <div style={toolbarS}>
                <div style={searchBoxS}>
                    <span style={{fontSize:'18px'}}>🔍</span>
                    <input 
                        style={inS} 
                        placeholder="Filter by asset name or SKU ID..." 
                        value={searchTerm} 
                        onChange={(e)=>setSearchTerm(e.target.value)} 
                    />
                </div>
                <div style={{display:'flex', gap:'12px'}}>
                    <button style={syncBtnS} onClick={fetchFullData}>🔄 RE-SYNC CLUSTER</button>
                </div>
            </div>

            {/* --- [C] INVENTORY MATRIX (TABLE) --- */}
            <div style={tableWrapperS}>
                <table style={tableS}>
                    <thead>
                        <tr style={thRowS}>
                            <th style={thS}>ASSET IDENTITY</th>
                            <th style={thS}>MARKET VALUE (INR)</th>
                            <th style={thS}>NODE STOCK</th>
                            <th style={thS}>GLOBAL VISIBILITY</th>
                            <th style={thS}>OPERATIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(p => (
                            <tr key={p._id} style={trS}>
                                <td style={tdS}>
                                    <div style={prodBoxS}>
                                        <img src={p.imageUrl} style={thumbS} alt="P" onError={(e)=>e.target.src='https://via.placeholder.com/40'} />
                                        <div>
                                            <div style={pNameS}>{p.name}</div>
                                            <code style={idS}>{p.generatedId}</code>
                                        </div>
                                    </div>
                                </td>
                                <td style={tdS}>
                                    <div style={priceContainerS}>
                                        <b style={{color:'#10b981'}}>₹{p.price.toLocaleString()}</b>
                                        {p.mrp > p.price && <del style={mrpS}>₹{p.mrp}</del>}
                                    </div>
                                </td>
                                <td style={tdS}>
                                    <div style={stockBadgeS(p.stock)}>
                                        {p.stock} <small style={{fontSize:'9px'}}>{p.unit?.toUpperCase() || 'UNIT'}</small>
                                    </div>
                                </td>
                                <td style={tdS}>
                                    <div style={toggleControlS} onClick={() => toggleProductStatus(p._id, p.isActive)}>
                                        <div style={toggleTrackS(p.isActive)}>
                                            <div style={toggleThumbS(p.isActive)}></div>
                                        </div>
                                        <span style={toggleLabS(p.isActive)}>{p.isActive ? 'LIVE' : 'HIDDEN'}</span>
                                    </div>
                                </td>
                                <td style={tdS}>
                                    <button 
                                        style={inspectBtnS} 
                                        onClick={() => { setSelectedProduct(p); setShowForm(true); }}
                                    >
                                        🛠️ INSPECT & MANAGE
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredItems.length === 0 && (
                    <div style={emptyS}>No inventory nodes discovered matching current protocol.</div>
                )}
            </div>

            {/* --- [D] MASTER PRODUCT FORM OVERLAY --- */}
            {showForm && selectedProduct && (
                <AdminProductForm 
                    editData={selectedProduct}
                    categories={categories}
                    themeColor={themeColor}
                    onSuccess={() => {
                        setShowForm(false);
                        setSelectedProduct(null);
                        fetchFullData();
                    }}
                    onCancel={() => {
                        setShowForm(false);
                        setSelectedProduct(null);
                    }}
                />
            )}

            <style>{`
                .pro-inventory-spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top-color: #0f172a; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                tr:hover { background-color: #fcfdfe !important; }
            `}</style>
        </div>
    );
};

// --- Atomic Professional UI Components ---

const MetricCard = ({ label, val, icon, col }) => (
    <div style={mCardS}>
        <div style={mIconS(col)}>{icon}</div>
        <div>
            <div style={mValS}>{val}</div>
            <div style={mLabS}>{label}</div>
        </div>
    </div>
);

// --- Strategic SaaS Styles (Professional Admin UI) ---

const containerS = { animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };

const metricsRowS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' };
const mCardS = { background: '#fff', padding: '25px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' };
const mIconS = (c) => ({ width: '50px', height: '50px', borderRadius: '14px', background: `${c}10`, color: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' });
const mValS = { fontSize: '22px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' };
const mLabS = { fontSize: '9px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' };

const toolbarS = { display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '25px', alignItems: 'center', flexWrap:'wrap' };
const searchBoxS = { flex: 1, minWidth:'300px', background: '#fff', padding: '0 18px', borderRadius: '16px', border: '1.5px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' };
const inS = { border: 'none', width: '100%', padding: '14px 0', outline: 'none', fontSize: '14px', fontWeight: '600', background: 'transparent', color:'#1e293b' };
const syncBtnS = { background: '#0f172a', color: '#fff', border: 'none', padding: '14px 25px', borderRadius: '12px', fontWeight: '900', fontSize: '11px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', transition:'0.3s' };

const tableWrapperS = { background: '#fff', borderRadius: '30px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' };
const tableS = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const thRowS = { backgroundColor: '#f8fafc' };
const thS = { padding: '20px 25px', fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.2px', borderBottom: '2px solid #f1f5f9' };
const tdS = { padding: '18px 25px', borderBottom: '1px solid #f8fafc' };
const trS = { transition: '0.2s' };

const prodBoxS = { display: 'flex', alignItems: 'center', gap: '15px' };
const thumbS = { width: '45px', height: '45px', borderRadius: '12px', objectFit: 'cover', background: '#f8fafc', border:'1px solid #f1f5f9' };
const pNameS = { fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom:'2px' };
const idS = { fontSize: '9px', fontWeight: '700', color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: '5px', letterSpacing:'0.5px' };

const priceContainerS = { display:'flex', flexDirection:'column', gap:'2px' };
const mrpS = { fontSize: '10px', color: '#cbd5e1', fontWeight: '700' };

const stockBadgeS = (s) => ({ 
    fontSize: '14px', fontWeight: '900', 
    color: s === 0 ? '#ef4444' : s <= 5 ? '#f59e0b' : '#1e293b',
    background: s === 0 ? '#fff1f2' : s <= 5 ? '#fffbeb' : 'transparent',
    padding: s <= 5 ? '4px 10px' : '0',
    borderRadius: '8px',
    display: 'inline-block'
});

const toggleControlS = { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' };
const toggleTrackS = (a) => ({ width: '38px', height: '20px', background: a ? '#10b981' : '#cbd5e1', borderRadius: '20px', padding: '3px', position: 'relative', transition: '0.3s' });
const toggleThumbS = (a) => ({ width: '14px', height: '14px', background: '#fff', borderRadius: '50%', position: 'absolute', left: a ? '21px' : '3px', transition: '0.3s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' });
const toggleLabS = (a) => ({ fontSize: '9px', fontWeight: '900', color: a ? '#10b981' : '#94a3b8', textTransform:'uppercase' });

const inspectBtnS = { background: '#fcfdfe', color: '#475569', border: '1.5px solid #e2e8f0', padding: '10px 18px', borderRadius: '12px', fontWeight: '900', fontSize: '10px', cursor: 'pointer', transition:'0.2s' };
const noDataS = { padding: '100px', textAlign: 'center', color: '#cbd5e1', fontSize: '16px', fontWeight: '800', textTransform: 'uppercase', letterSpacing:'1px' };
const loaderWrapperS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '400px' };

export default InventoryPriceControl;