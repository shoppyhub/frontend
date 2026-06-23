import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../../services/api'; 
import { toast } from 'react-toastify';
import { useBranding } from '../../../../context/BrandingContext'; // For White-labeling

// --- Sub-Component: Campaign Configuration Modal ---
const BannerActionModal = ({ isOpen, onClose, onSave, editData, themeColor }) => {
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        targetAudience: 'All',
        position: 'Home Page Top',
        isActive: true
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (editData) {
            setFormData({
                title: editData.title || '',
                imageUrl: editData.imageUrl || '',
                targetAudience: editData.targetAudience || 'All',
                position: editData.position || 'Home Page Top',
                isActive: editData.isActive ?? true
            });
        } else {
            setFormData({ title: '', imageUrl: '', targetAudience: 'All', position: 'Home Page Top', isActive: true });
        }
    }, [editData, isOpen]);

    if (!isOpen) return null;

    // Logic: Convert Image to Base64 (Safe Synchronization)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2000000) return toast.error("File size must be under 2MB.");
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => setFormData({ ...formData, imageUrl: reader.result });
        }
    };

    return (
        <div style={modalOverlayS}>
            <div style={modalContentS}>
                <div style={modalHeaderS(themeColor)}>
                    <h3 style={{ margin: 0, color:'#fff' }}>{editData ? '📝 Update Campaign' : '🖼️ Deploy New Asset'}</h3>
                    <button onClick={onClose} style={closeBtnS}>✕</button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} style={formPadding}>
                    <div style={fieldS}>
                        <label style={labelS}>Campaign Title *</label>
                        <input 
                            style={inputS} 
                            value={formData.title} 
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Festival Season Sale"
                            required
                        />
                    </div>
                    
                    <div style={fieldS}>
                        <label style={labelS}>Banner Visual Asset *</label>
                        <div style={uploadBoxS}>
                            <input type="file" accept="image/*" onChange={handleFileChange} />
                            {formData.imageUrl && <img src={formData.imageUrl} style={previewImgS} alt="Preview" />}
                        </div>
                    </div>

                    <div style={grid2}>
                        <div style={fieldS}>
                            <label style={labelS}>Target Segment</label>
                            <select style={inputS} value={formData.targetAudience} onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}>
                                <option value="All">Global (All Users)</option>
                                <option value="Customer">Customers Only</option>
                                <option value="ShopOwner">Merchants Only</option>
                            </select>
                        </div>
                        <div style={fieldS}>
                            <label style={labelS}>UI Placement</label>
                            <select style={inputS} value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })}>
                                <option>Home Page Top</option>
                                <option>Sidebar Ad</option>
                                <option>Checkout Promo</option>
                            </select>
                        </div>
                    </div>

                    <div style={modalFooterS}>
                        <button type="button" onClick={onClose} style={btnCancelS}>Discard</button>
                        <button type="submit" style={btnSaveS(themeColor)}>
                            {editData ? 'SYNCHRONIZE CHANGES' : 'PUBLISH CAMPAIGN'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Marketing Hub Component ---
const MarketingBanners = () => {
    const { settings } = useBranding();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

    // 1. 📡 Automatic Synchronization Protocol (No Buttons)
    const fetchBanners = useCallback(async () => {
        try {
            const res = await api.get('/admin/marketing/banners');
            if (res.data.success) {
                setBanners(res.data.data || []);
            }
            setLastSynced(new Date().toLocaleTimeString());
            document.title = `Marketing Manager | ${settings.siteName}`;
        } catch (err) {
            console.error("Marketing registry sync failure.");
        } finally {
            setLoading(false);
        }
    }, [settings.siteName]);

    useEffect(() => { 
        fetchBanners(); 
        // Auto-refresh when admin returns to this window
        window.addEventListener('focus', fetchBanners);
        return () => window.removeEventListener('focus', fetchBanners);
    }, [fetchBanners]);

    // 2. 🚀 Deployment & Update Logic
    const handleSave = async (data) => {
        try {
            if (editingBanner) {
                await api.put(`/admin/marketing/banners/update/${editingBanner._id}`, data);
                toast.success("Campaign updated successfully! ✅");
            } else {
                await api.post('/admin/marketing/banners/add', data);
                toast.success("New campaign deployed to production! 🚀");
            }
            setIsModalOpen(false);
            fetchBanners(); // Background Silent Re-sync
        } catch (err) {
            toast.error("Operation Interrupted: Protocol Error.");
        }
    };

    // 3. ⏸️ Status Toggle Protocol
    const toggleStatus = async (id, currentStatus) => {
        try {
            await api.patch(`/admin/marketing/banners/status/${id}`, { isActive: !currentStatus });
            toast.info(`Asset ${!currentStatus ? 'Activated' : 'Paused'}.`);
            fetchBanners();
        } catch (err) { toast.error("Sync failed."); }
    };

    // 4. 🗑️ Asset Purge Protocol
    const handleDelete = async (id) => {
        if (!window.confirm("CRITICAL: Permanently purge this promotional asset?")) return;
        try {
            await api.delete(`/admin/marketing/banners/delete/${id}`);
            toast.success("Visual node decommissioned.");
            fetchBanners();
        } catch (err) { toast.error("Action failed."); }
    };

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Connecting to Marketing Cluster...</p>
        </div>
    );

    return (
        <div style={containerS}>
            {/* --- [A] COMMAND HEADER --- */}
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>🖼️ Promotional Hub Manager</h2>
                    <p style={subS}>Strategic control over global marketing real-estate across {settings.siteName}.</p>
                </div>
                <div style={{textAlign:'right'}}>
                    <div style={syncStatus}>
                        <span className="pulse-dot"></span>
                        <small>Auto-Sync: {lastSynced}</small>
                    </div>
                    <button style={addBtn(themeColor)} onClick={() => { setEditingBanner(null); setIsModalOpen(true); }}>
                        + DEPLOY NEW CAMPAIGN
                    </button>
                </div>
            </div>

            {/* --- [B] ASSET REGISTRY GRID --- */}
            <div style={bannerGrid}>
                {banners.map((banner) => (
                    <div key={banner._id} style={bannerCard}>
                        <div style={{ position: 'relative' }}>
                            <img 
                                src={banner.imageUrl || 'https://via.placeholder.com/1200x400?text=No+Data'} 
                                alt={banner.title} 
                                style={bannerImg} 
                            />
                            <div style={statusBadge(banner.isActive)}>
                                {banner.isActive ? '● LIVE' : '● PAUSED'}
                            </div>
                        </div>
                        <div style={bannerDetails}>
                            <h3 style={bannerTitleS}>{banner.title}</h3>
                            <div style={metaGrid}>
                                <div style={metaItem}><small>AUDIENCE</small><b>{banner.targetAudience}</b></div>
                                <div style={metaItem}><small>UI PLACEMENT</small><b>{banner.position}</b></div>
                            </div>
                            <div style={btnGroup}>
                                <button style={editBtn(themeColor)} onClick={() => { setEditingBanner(banner); setIsModalOpen(true); }}>Modify</button>
                                <button style={toggleBtn(banner.isActive, themeColor)} onClick={() => toggleStatus(banner._id, banner.isActive)}>
                                    {banner.isActive ? 'Pause' : 'Resume'}
                                </button>
                                <button style={delBtn} onClick={() => handleDelete(banner._id)}>Purge</button>
                            </div>
                        </div>
                    </div>
                ))}

                {banners.length === 0 && (
                    <div style={noDataBox}>
                        <div style={{fontSize:'60px', marginBottom:'20px'}}>🖼️</div>
                        <h3>Registry Clean</h3>
                        <p>No active marketing campaigns discovered.</p>
                    </div>
                )}
            </div>

            {/* --- [C] MODULAR CAMPAIGN CONFIGURATOR --- */}
            <BannerActionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                editData={editingBanner} 
                themeColor={themeColor}
            />

            <style>{`
                .spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .pulse-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; display: inline-block; animation: pulse-anim 2s infinite; margin-right: 8px; }
                @keyframes pulse-anim { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Definitions ---

const containerS = { padding: '10px', minHeight: '100vh', animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin: 0, fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px' };
const subS = { color: '#64748b', fontSize: '14px', marginTop: '5px', fontWeight:'500' };

const syncStatus = { display:'flex', alignItems:'center', background:'#fff', padding:'8px 15px', borderRadius:'12px', border:'1px solid #f1f5f9', marginBottom:'10px', fontWeight:'800', fontSize:'11px', color:'#94a3b8' };
const addBtn = (color) => ({ background: color, color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', fontSize: '12px', boxShadow: `0 8px 15px ${color}33`, transition:'0.3s' });

const bannerGrid = { display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fill, minmax(380px, 1fr))', gap: '30px' };
const bannerCard = { background: '#fff', borderRadius: '40px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', transition: '0.3s' };
const bannerImg = { width: '100%', height: '220px', objectFit: 'cover', background: '#f8fafc' };

const statusBadge = (active) => ({ position: 'absolute', top: '20px', right: '20px', background: active ? '#10b981' : '#64748b', color: '#fff', padding: '6px 14px', borderRadius: '12px', fontSize: '9px', fontWeight: '900', letterSpacing: '1px' });

const bannerDetails = { padding: '30px' };
const bannerTitleS = { margin: '0 0 15px 0', fontSize: '18px', fontWeight: '900', color: '#0f172a', letterSpacing:'-0.5px' };

const metaGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px', padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9' };
const metaItem = { display: 'flex', flexDirection: 'column', gap: '5px' };

const btnGroup = { display: 'flex', gap: '12px' };
const editBtn = (color) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: `${color}10`, color: color, fontWeight: '900', cursor: 'pointer', fontSize: '11px', textTransform:'uppercase' });
const toggleBtn = (active, color) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#fff', color: active ? '#64748b' : '#10b981', fontWeight: '900', cursor: 'pointer', fontSize: '11px', textTransform:'uppercase' });
const delBtn = { flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#fff1f2', color: '#f43f5e', fontWeight: '900', cursor: 'pointer', fontSize: '11px', textTransform:'uppercase' };

// Modal Styles
const modalOverlayS = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20000, backdropFilter: 'blur(8px)' };
const modalContentS = { background: '#fff', width: '500px', maxWidth:'95%', borderRadius: '40px', overflow: 'hidden', animation: 'fadeIn 0.3s ease' };
const modalHeaderS = (color) => ({ padding: '30px 40px', background: color, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' });
const closeBtnS = { position: 'absolute', top: 14, right: 14, zIndex: 20001, background: 'rgba(255,255,255,0.2)', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#fff', width:'35px', height:'35px', borderRadius:'50%', fontWeight: 'bold' };
const formPadding = { padding: '40px' };
const fieldS = { marginBottom: '25px' };
const labelS = { display: 'block', fontSize: '10px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing:'1px' };
const inputS = { width: '100%', padding: '16px', borderRadius: '16px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '14px', background: '#f8fafc', fontWeight: '700', boxSizing: 'border-box', color:'#1e293b' };
const uploadBoxS = { display:'flex', flexDirection:'column', gap:'15px', padding:'20px', background:'#f8fafc', borderRadius:'20px', border:'2px dashed #e2e8f0' };
const previewImgS = { width: '100%', height: '140px', objectFit: 'cover', borderRadius: '15px' };

const modalFooterS = { display:'flex', gap:'15px', marginTop:'10px' };
const btnSaveS = (color) => ({ flex: 1.5, padding: '18px', borderRadius: '18px', border: 'none', background: color, color: '#fff', fontWeight: '900', cursor: 'pointer', boxShadow:`0 10px 20px ${color}33` });
const btnCancelS = { flex: 1, padding: '18px', borderRadius: '18px', border: '1.5px solid #f1f5f9', background: '#fff', fontWeight: '800', cursor: 'pointer', color: '#64748b' };

const noDataBox = { textAlign: 'center', padding: '100px 40px', gridColumn: '1/-1', color: '#cbd5e1', background:'#fff', borderRadius:'40px', border:'1px dashed #e2e8f0' };
const loaderS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '60vh', background:'#f8fafc', gap:'20px' };
const grid2 = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' };

export default MarketingBanners;