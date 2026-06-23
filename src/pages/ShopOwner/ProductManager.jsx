import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../services/api'; 
import { toast } from 'react-toastify';
import ProductForm from './ProductForm';
import { useBranding } from '../../context/BrandingContext'; // Added for White-labeling

const ProductManager = () => {
    const { settings } = useBranding();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // --- 🛡️ States ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // 1. 📡 Automatic Inventory Hub Synchronization (No Buttons)
    const loadInventoryHub = useCallback(async ({ silent = false } = {}) => {
        try {
            if (!silent) setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                api.get('/products/my-shop'),
                api.get('/admin/directories/shop-types')
            ]);
            setProducts(prodRes.data.data || []);
            setCategories(catRes.data.data || []);
            
            // Dynamic Metadata
            document.title = `Inventory Manager | ${settings.siteName}`;
        } catch (err) {
            console.error("Cluster Sync Failed.");
        } finally {
            if (!silent) setLoading(false);
        }
    }, [settings.siteName]);

    useEffect(() => { 
        loadInventoryHub(); 
        
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);

        // Silent refresh on focus — avoids unmounting ProductForm when file picker closes
        const handleFocusRefresh = () => loadInventoryHub({ silent: true });
        window.addEventListener('focus', handleFocusRefresh);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('focus', handleFocusRefresh);
        };
    }, [loadInventoryHub]);

    // 2. 🗓️ Intelligent Operational Metadata
    const getExpiryMetadata = (date) => {
        if (!date) return { status: "NO DATA", date: "N/A", color: "#fff", bg: "#94a3b8" };
        
        const expDate = new Date(date);
        const today = new Date();
        const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        const formattedDate = expDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        if (diffDays < 0) return { status: "EXPIRED", date: formattedDate, color: "#fff", bg: "#ef4444" };
        if (diffDays <= 30) return { status: `${diffDays}D LEFT`, date: formattedDate, color: "#fff", bg: "#f59e0b" };
        return { status: "HEALTHY", date: formattedDate, color: "#fff", bg: "#10b981" };
    };

    const getStockMetadata = (stock, threshold = 10) => {
        if (stock <= 0) return { label: "OUT OF STOCK", color: "#ef4444", barWidth: '0%' };
        if (stock <= threshold) return { label: "LOW STOCK", color: "#f59e0b", barWidth: '35%' };
        return { label: "OPTIMAL", color: "#10b981", barWidth: '100%' };
    };

    // 3. 🔎 Discovery & Search Filter
    const filteredRegistry = useMemo(() => {
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.generatedId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, products]);

    // 4. 🗑️ Asset Decommissioning (Delete)
    const deleteAsset = async (id) => {
        if (!window.confirm("CRITICAL: Permanently purge this asset from the registry?")) return;
        try {
            const res = await api.delete(`/products/delete/${id}`);
            if (res.data.success) {
                toast.success("Asset decommissioned successfully.");
                loadInventoryHub();
            }
        } catch (err) { toast.error("Purge Protocol Failed."); }
    };

    // Metrics Logic
    const valuation = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const lowStockAlerts = products.filter(p => p.stock <= (p.lowStockThreshold || 10)).length;
    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Accessing Inventory Cluster...</p>
        </div>
    );

    return (
        <div style={pageContainer}>
            
            {/* --- [A] ANALYTICS METRICS BAR --- */}
            <div style={{...metricsRow, flexDirection: isMobile ? 'column' : 'row'}}>
                <div style={metricCard}>
                    <small style={mLabel}>NET ASSET VALUATION</small>
                    <div style={mValue}>₹{valuation.toLocaleString('en-IN')}</div>
                    <div style={mIndicator(themeColor)}></div>
                </div>
                <div style={metricCard}>
                    <small style={mLabel}>LOW STOCK INCIDENTS</small>
                    <div style={{...mValue, color: lowStockAlerts > 0 ? '#f59e0b' : '#0f172a'}}>{lowStockAlerts} Nodes</div>
                    <div style={mIndicator('#f59e0b')}></div>
                </div>
                <button onClick={() => { setEditingProduct(null); setShowForm(true); }} style={addBtnS(themeColor)}>
                    ➕ REGISTER NEW ASSET
                </button>
            </div>

            {/* --- [B] SEARCH & DISCOVERY --- */}
            <div style={controlBar}>
                <div style={searchBoxS}>
                    <span>🔍</span>
                    <input 
                        placeholder="Search by Asset Name, Category or SKU..." 
                        style={searchIn} 
                        value={searchTerm} 
                        onChange={(e)=>setSearchTerm(e.target.value)} 
                    />
                </div>
            </div>

            {/* --- [C] CENTRAL PRODUCT REGISTRY --- */}
            <div style={tableCard}>
                {!isMobile && (
                    <div style={tableHead}>
                        <div style={{flex: 0.8}}>VISUAL</div>
                        <div style={{flex: 2.2}}>ASSET IDENTITY</div>
                        <div style={{flex: 1.2}}>COMMERCIALS</div>
                        <div style={{flex: 1.5}}>INVENTORY HEALTH</div>
                        <div style={{flex: 1.5}}>EXPIRY POLICY</div>
                        <div style={{flex: 1.2}}>OPERATIONS</div>
                    </div>
                )}

                {filteredRegistry.length === 0 ? (
                    <div style={emptyS}>No commercial assets detected in current sector.</div>
                ) : (
                    filteredRegistry.map(p => {
                        const exp = getExpiryMetadata(p.expDate);
                        const stock = getStockMetadata(p.stock, p.lowStockThreshold);
                        
                        return (
                            <div key={p._id} style={pRow(isMobile)}>
                                {/* Visual Asset */}
                                <div style={{flex: isMobile ? 'none' : 0.8, marginBottom: isMobile ? '15px' : 0}}>
                                    <div style={imgContainer}>
                                        <img src={p.imageUrl} alt="asset" style={pImgS} />
                                    </div>
                                </div>
                                
                                {/* Identity Module */}
                                <div style={{flex: 2.2, marginBottom: isMobile ? '12px' : 0}}>
                                    <div style={rowName}>{p.name}</div>
                                    <div style={rowMeta}>
                                        <span style={catBadge(themeColor)}>{p.category}</span>
                                        <span style={skuBadge}>SKU: {p.generatedId?.toUpperCase() || 'RKD-PRO'}</span>
                                    </div>
                                </div>

                                {/* Commercials */}
                                <div style={{flex: 1.2, marginBottom: isMobile ? '15px' : 0}}>
                                    <div style={rowPrice}>₹{p.price.toLocaleString()} <small style={unitS}>/{p.unit}</small></div>
                                    {p.mrp > p.price && <small style={rowMrp}>MRP: ₹{p.mrp}</small>}
                                </div>

                                {/* Inventory Pulse */}
                                <div style={{flex: 1.5, marginBottom: isMobile ? '15px' : 0, width: isMobile ? '100%' : 'auto'}}>
                                    <div style={{...stockLabS, color: stock.color}}>{stock.label} ({p.stock} Units)</div>
                                    <div style={healthBarBg}>
                                        <div style={healthBarFill(stock.color, stock.barWidth)}></div>
                                    </div>
                                </div>

                                {/* Legal Compliance (Expiry) */}
                                <div style={{flex: 1.5, marginBottom: isMobile ? '20px' : 0}}>
                                    <span style={{...expBadgeS, background: exp.bg, color: exp.color}}>
                                        {exp.status}
                                    </span>
                                    <div style={expDateTextS}>{exp.date}</div>
                                </div>

                                {/* Operation Controls */}
                                <div style={btnGroup(isMobile)}>
                                    <button onClick={() => { setEditingProduct(p); setShowForm(true); }} style={editBtnS}>Configure</button>
                                    <button onClick={() => deleteAsset(p._id)} style={delBtnS}>Purge</button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {showForm && (
                <ProductForm 
                    editData={editingProduct} 
                    categories={categories}
                    onSuccess={() => { setShowForm(false); setEditingProduct(null); loadInventoryHub(); }}
                    onCancel={() => { setShowForm(false); setEditingProduct(null); }}
                />
            )}

            <style>{`
                .spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

// --- Enterprise Visual Definitions ---

const pageContainer = { padding: '10px', fontFamily: "'Plus Jakarta Sans', sans-serif" };

const metricsRow = { display: 'flex', gap: '20px', marginBottom: '35px' };
const metricCard = { flex: 1, background: '#fff', padding: '25px', borderRadius: '24px', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' };
const mLabel = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1.5px' };
const mValue = { fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' };
const mIndicator = (color) => ({ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '5px', background: color });

const addBtnS = (color) => ({ background: color, color: '#fff', border: 'none', padding: '18px 35px', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', fontSize: '13px', boxShadow: `0 10px 20px ${color}33`, transition:'0.3s' });

const controlBar = { marginBottom: '25px' };
const searchBoxS = { display: 'flex', alignItems: 'center', gap: '15px', background: '#fff', padding: '15px 25px', borderRadius: '20px', border: '1.5px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' };
const searchIn = { border: 'none', outline: 'none', width: '100%', fontSize: '14px', fontWeight: '700', color:'#1e293b' };

const tableCard = { background: '#fff', borderRadius: '32px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' };
const tableHead = { display: 'flex', padding: '20px 35px', background: '#f8fafc', borderBottom: '1.5px solid #f1f5f9', fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px', textTransform:'uppercase' };

const pRow = (isMobile) => ({ 
    display: 'flex', 
    flexDirection: isMobile ? 'column' : 'row', 
    alignItems: isMobile ? 'flex-start' : 'center', 
    padding: isMobile ? '25px' : '25px 35px', 
    borderBottom: '1.5px solid #f8fafc', 
    transition: '0.2s',
    animation: 'fadeIn 0.4s ease'
});

const imgContainer = { width: '65px', height: '65px', borderRadius: '16px', border: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' };
const pImgS = { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' };

const rowName = { fontWeight: '900', color: '#1e293b', marginBottom: '8px', fontSize: '16px' };
const rowMeta = { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' };
const catBadge = (color) => ({ background: `${color}10`, color: color, padding: '4px 10px', borderRadius: '8px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' });
const skuBadge = { color: '#cbd5e1', fontSize: '10px', fontWeight: '800' };

const rowPrice = { fontWeight: '900', color: '#0f172a', fontSize: '20px' };
const unitS = { fontSize: '12px', color: '#94a3b8', fontWeight: '800' };
const rowMrp = { textDecoration: 'line-through', color: '#cbd5e1', fontSize: '12px', fontWeight:'700' };

const stockLabS = { fontSize: '11px', fontWeight: '900', marginBottom: '8px', textTransform:'uppercase', letterSpacing:'0.5px' };
const healthBarBg = { height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', width: '100px' };
const healthBarFill = (color, width) => ({ width: width, height: '100%', background: color });

const expBadgeS = { padding: '5px 12px', borderRadius: '10px', fontSize: '9px', fontWeight: '900' };
const expDateTextS = { fontSize: '11px', marginTop: '6px', fontWeight: '800', color: '#cbd5e1' };

const btnGroup = (isMobile) => ({ display:'flex', gap:'12px', width: isMobile ? '100%' : 'auto', flex: 1.2 });
const editBtnS = { flex: 1, background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '12px' };
const delBtnS = { ...editBtnS, background: '#fff1f2', color: '#f43f5e', border: '1px solid #fee2e2' };

const loaderS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '60vh', fontWeight: '900', color: '#94a3b8', fontSize:'14px' };
const emptyS = { textAlign: 'center', padding: '100px 0', color: '#cbd5e1', fontWeight: '800', textTransform:'uppercase', letterSpacing:'1px' };

export default ProductManager;