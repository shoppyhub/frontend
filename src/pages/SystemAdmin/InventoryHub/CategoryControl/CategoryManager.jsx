import React, { useState, useMemo, useEffect, useCallback } from 'react';
import api from '../../../../services/api'; 
import { toast } from 'react-toastify';
import { useBranding } from '../../../../context/BrandingContext'; // Added for White-labeling
import CategoryActionModal from './CategoryActionModal'; 

const CategoryManager = () => {
    const { settings } = useBranding();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

    // 1. 📡 Automatic Registry Synchronization Protocol (No Buttons)
    const fetchCategories = useCallback(async () => {
        try {
            // Initial sync shows loader, background updates are silent
            const res = await api.get('/admin/directories/shop-types');
            if (res.data.success) {
                setCategories(res.data.data || []);
                setLastSynced(new Date().toLocaleTimeString());
            }
            document.title = `Category Registry | ${settings.siteName}`;
        } catch (err) {
            console.error("Category Cluster Sync Failure.");
        } finally {
            setLoading(false);
        }
    }, [settings.siteName]);

    useEffect(() => {
        fetchCategories();
        
        // Auto-refresh when admin returns to this window (SaaS Protocol)
        window.addEventListener('focus', fetchCategories);
        return () => window.removeEventListener('focus', fetchCategories);
    }, [fetchCategories]);

    // 2. 🔍 Discovery Engine: Search Filter
    const filteredCategories = useMemo(() => {
        return categories.filter(c => 
            (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    // 3. 🚀 Deployment Protocol: Save or Update (API Call)
    const handleSave = async (formData) => {
        try {
            if (editingCategory) {
                await api.put(`/admin/directories/shop-types/update/${editingCategory._id}`, formData);
                toast.success("Protocol Success: Category properties synchronized. ✅");
            } else {
                await api.post('/admin/directories/shop-types/add', formData);
                toast.success("Ecosystem Update: New category node deployed! 🚀");
            }
            setIsModalOpen(false);
            fetchCategories(); // Background Re-sync
        } catch (err) {
            toast.error(err.response?.data?.message || "Registry commit failed.");
        }
    };

    // 4. 🗑️ Node Purge Protocol (Delete)
    const handleDelete = async (id) => {
        if (!window.confirm("CRITICAL: Purging this category will affect all linked merchant hubs. Proceed?")) return;
        
        try {
            await api.delete(`/admin/directories/shop-types/delete/${id}`);
            toast.info("Registry Updated: Category node decommissioned.");
            fetchCategories();
        } catch (err) {
            toast.error("Operation Denied: Node might be in active use.");
        }
    };

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Accessing Global Catalog Registry...</p>
        </div>
    );

    return (
        <div style={containerS}>
            {/* --- [A] COMMAND HEADER --- */}
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>📁 Global Category Registry</h2>
                    <p style={subTitleS}>Enterprise classification and sector control for {settings.siteName} ecosystem.</p>
                </div>
                <div style={statsRow}>
                    <div style={syncBadge}>
                        <span className="pulse-dot"></span>
                        <small>Auto-Sync: {lastSynced}</small>
                    </div>
                    <div style={statItem(themeColor)}>
                        <small style={statLab}>ACTIVE SECTORS</small>
                        <b style={statVal}>{categories.length} Nodes</b>
                    </div>
                </div>
            </div>

            {/* --- [B] DISCOVERY TOOLBAR (No Sync Button) --- */}
            <div style={controlBar}>
                <div style={searchBox}>
                    <span style={searchIcon}>🔍</span>
                    <input 
                        style={inSearch} 
                        placeholder="Filter system categories by identity name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    style={btnCreate(themeColor)} 
                    onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
                >
                    + REGISTER NEW CATEGORY
                </button>
            </div>

            {/* --- [C] SECTOR REGISTRY GRID --- */}
            <div style={gridS}>
                {filteredCategories.map(cat => (
                    <div key={cat._id} style={cardS}>
                        <div style={cardHeader}>
                            <span style={statusBadge(cat.isActive !== false)}>{cat.isActive !== false ? '● ACTIVE' : '● INACTIVE'}</span>
                            <button style={btnDel} onClick={() => handleDelete(cat._id)}>✕</button>
                        </div>
                        
                        <div style={iconCircle(themeColor)}>{cat.icon || '📦'}</div>
                        <div style={nameS}>{cat.name}</div>
                        <div style={countS}>{cat.productCount || 0} Assets Linked</div>
                        
                        {/* Visual Node Load Indicator */}
                        <div style={progressBarBg}>
                            <div style={progressBarFill(themeColor, cat.productCount || 0)}></div>
                        </div>

                        <div style={actionS}>
                            <button 
                                style={btnEdit(themeColor)} 
                                onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }}
                            >
                                CONFIGURE NODE PROPERTIES
                            </button>
                        </div>
                    </div>
                ))}

                {filteredCategories.length === 0 && (
                    <div style={noDataS}>
                        <div style={{fontSize:'60px', marginBottom:'20px'}}>📂</div>
                        <h3>Registry Clean</h3>
                        <p>No category nodes discovered matching your current query.</p>
                    </div>
                )}
            </div>

            {/* --- MODULAR CONFIGURATOR --- */}
            <CategoryActionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                editData={editingCategory} 
                themeColor={themeColor}
            />

            <style>{`
                .spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; animation: pulse-anim 2s infinite; margin-right: 8px; }
                @keyframes pulse-anim { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
};

// --- Enterprise Visual Definitions ---

const containerS = { padding: '10px', minHeight: '100vh', animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '45px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin: 0, fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '900', color: '#0f172a', letterSpacing: '-1.5px' };
const subTitleS = { margin: '5px 0 0', color: '#64748b', fontSize: '14px', fontWeight: '500' };

const statsRow = { display: 'flex', gap: '15px', alignItems:'center' };
const syncBadge = { display:'flex', alignItems:'center', background:'#fff', padding:'10px 18px', borderRadius:'14px', border:'1px solid #f1f5f9', color:'#94a3b8', fontSize:'11px', fontWeight:'800' };
const statItem = (color) => ({ background: '#fff', padding: '12px 25px', borderRadius: '15px', borderLeft: `5px solid ${color}`, textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', borderTop:'1px solid #f1f5f9', borderRight:'1px solid #f1f5f9', borderBottom:'1px solid #f1f5f9' });
const statLab = { fontSize: '9px', fontWeight: '900', color: '#cbd5e1', letterSpacing: '1px', textTransform:'uppercase' };
const statVal = { fontSize: '18px', fontWeight: '900', color: '#0f172a', display: 'block', marginTop:'2px' };

const controlBar = { display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '40px', flexWrap:'wrap', alignItems:'center' };
const searchBox = { position: 'relative', flex: 1, minWidth: '300px' };
const inSearch = { width: '100%', padding: '16px 20px 16px 50px', borderRadius: '18px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '14px', background: '#fff', boxSizing:'border-box', fontWeight:'700', color:'#1e293b', boxShadow:'0 10px 30px rgba(0,0,0,0.02)' };
const searchIcon = { position: 'absolute', left: '18px', top: '16px', fontSize: '18px', color: '#94a3b8' };

const btnCreate = (color) => ({ background: color, color: '#fff', border: 'none', padding: '16px 28px', borderRadius: '16px', cursor: 'pointer', fontWeight: '900', fontSize: '12px', boxShadow:`0 8px 15px ${color}33`, transition:'0.3s' });

const gridS = { display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' };
const cardS = { background: '#fff', padding: '40px 30px', borderRadius: '40px', textAlign: 'center', border: '1px solid #f1f5f9', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', transition: '0.3s' };

const cardHeader = { display: 'flex', justifyContent: 'space-between', position: 'absolute', top: '25px', width: '86%', left: '7%', alignItems:'center' };
const statusBadge = (active) => ({ fontSize: '9px', fontWeight: '900', color: active ? '#10b981' : '#f43f5e', background: active ? '#ecfdf5' : '#fff1f2', padding: '5px 12px', borderRadius: '8px', letterSpacing:'0.5px' });
const btnDel = { background: 'rgba(244, 63, 94, 0.05)', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '14px', width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold' };

const iconCircle = (color) => ({ width: '85px', height: '85px', borderRadius: '30px', background: `${color}05`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', margin: '15px auto 25px', border: `1.5px solid ${color}10`, boxShadow:`0 10px 20px ${color}08` });
const nameS = { fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '8px', letterSpacing:'-0.5px' };
const countS = { color: '#94a3b8', fontSize: '12px', marginBottom: '22px', fontWeight: '800', textTransform:'uppercase', letterSpacing:'1px' };

const progressBarBg = { height: '8px', width: '80%', background: '#f8fafc', borderRadius: '10px', margin: '0 auto 25px', overflow: 'hidden', border:'1px solid #f1f5f9' };
const progressBarFill = (color, count) => ({ height: '100%', width: `${Math.min((count / 500) * 100, 100)}%`, background: color, borderRadius: '10px', transition:'1.2s cubic-bezier(0.4, 0, 0.2, 1)' });

const actionS = { borderTop: '1.5px solid #f8fafc', paddingTop: '25px' };
const btnEdit = (color) => ({ background: '#f8fafc', color: '#475569', border: '1.5px solid #e2e8f0', padding: '14px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '800', width: '100%', fontSize: '11px', textTransform:'uppercase', letterSpacing:'0.5px', transition:'0.2s' });

const noDataS = { gridColumn: '1/-1', textAlign: 'center', padding: '120px 40px', color: '#cbd5e1', background:'#fff', borderRadius:'40px', border:'1px dashed #f1f5f9' };
const loaderS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '60vh', background:'#f8fafc', gap:'20px' };

export default CategoryManager;