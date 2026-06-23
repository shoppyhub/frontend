import React, { useState, useEffect, useRef } from 'react';
import api from '../../../../../../services/api';
import { toast } from 'react-toastify';

const AdminProductForm = ({ editData, categories, onSuccess, onCancel, themeColor }) => {
    const [uploading, setUploading] = useState(false);
    const [gallery, setGallery] = useState([]); 
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '', category: '', price: '', mrp: '', stock: '', 
        lowStockThreshold: '', unit: '', description: '', tags: '', 
        mfgDate: '', expDate: '', isActive: true
    });

    const unitList = ["kg", "ltr", "pc", "pkt", "dz", "gm", "ml", "box", "set", "unit"];

    // 1. 📡 डेटा सिंक्रोनाइज़ेशन (Sync Registry Data)
    useEffect(() => {
        if (editData) {
            setFormData({
                name: editData.name || '',
                category: editData.category || '',
                price: editData.price || '',
                mrp: editData.mrp || '',
                stock: editData.stock || '',
                lowStockThreshold: editData.lowStockThreshold || '',
                unit: editData.unit || '',
                description: editData.description || '',
                tags: Array.isArray(editData.tags) ? editData.tags.join(', ') : (editData.tags || ''),
                mfgDate: editData.mfgDate ? editData.mfgDate.split('T')[0] : '',
                expDate: editData.expDate ? editData.expDate.split('T')[0] : '',
                isActive: editData.isActive ?? true
            });

            if (editData.images?.length > 0) {
                setGallery(editData.images.map(img => ({
                    url: img.url, file: null, isExisting: true, publicId: img.publicId
                })));
            } else if (editData.imageUrl) {
                setGallery([{ url: editData.imageUrl, file: null, isExisting: true, publicId: editData.publicId }]);
            }
        }
    }, [editData]);

    // 2. 📸 गैलरी कंट्रोल (Image Management)
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
        if (gallery.length + files.length > 5) return toast.error("Deployment Error: Max 5 images permitted.");
        
        const newEntries = files.map(file => ({
            url: URL.createObjectURL(file), file, isExisting: false
        }));
        setGallery(prev => [...prev, ...newEntries]);
    };

    const jumpToPosition = (currentIndex, targetPosition) => {
        const targetIndex = targetPosition - 1;
        const updatedGallery = [...gallery];
        const itemToMove = updatedGallery.splice(currentIndex, 1)[0];
        updatedGallery.splice(targetIndex, 0, itemToMove);
        setGallery(updatedGallery);
    };

    const removeImage = (index) => {
        const item = gallery[index];
        if (!item.isExisting) URL.revokeObjectURL(item.url);
        setGallery(gallery.filter((_, i) => i !== index));
    };

    // 3. 🗑️ एसेट डिलीट (Decommission/Purge)
    const handlePurgeAsset = async () => {
        if (!window.confirm("🚨 CRITICAL: Permanently purge this asset from the global registry? This action is irreversible.")) return;
        setUploading(true);
        try {
            await api.delete(`/products/delete/${editData._id}`);
            toast.error("Asset Purged Successfully.");
            onSuccess();
        } catch (err) { toast.error("Purge Protocol Failed."); }
        finally { setUploading(false); }
    };

    // 4. 💾 सबमिट (Commit Changes)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (gallery.length === 0) return toast.error("Minimum 1 image required.");
        
        setUploading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        
        const existingPhotos = [];
        gallery.forEach(item => {
            if (item.isExisting) existingPhotos.push({ url: item.url, publicId: item.publicId });
            else data.append('images', item.file);
        });
        data.append('existingImagesJson', JSON.stringify(existingPhotos));

        try {
            const res = await api.put(`/admin/inventory/price-update/${editData._id}`, data);
            if (res.data.success) {
                toast.success("Master Metadata Synchronized.");
                onSuccess();
            }
        } catch (err) { toast.error("Sync Failure."); }
        finally { setUploading(false); }
    };

    return (
        <div style={formOverlay}>
            <div style={formCard}>
                {/* Header */}
                <div style={formHeader}>
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        <div style={statusDot(formData.isActive)}></div>
                        <h3 style={formTitle}>🛠️ SYSTEM AUDIT: {editData.generatedId}</h3>
                    </div>
                    <button onClick={onCancel} style={closeBtn}>✕</button>
                </div>
                
                <form onSubmit={handleSubmit} style={formScrollBody}>
                    <div style={formGrid}>
                        
                        {/* LEFT: Visual Hierarchy */}
                        <div style={col}>
                            <label style={labS}>Asset Gallery (Drag to Reorder)</label>
                            <div style={uploadZone}>
                                <label style={uploadLabel}>
                                    <input type="file" multiple onChange={handleImageChange} hidden />
                                    <span style={{fontSize:'20px'}}>📸</span>
                                    <small style={{fontWeight:'800', fontSize:'9px'}}>ADD PHOTO</small>
                                </label>
                                {gallery.map((item, i) => (
                                    <div key={i} draggable 
                                        onDragStart={()=>setDraggedItemIndex(i)} 
                                        onDragOver={e=>e.preventDefault()} 
                                        onDrop={()=>{
                                            const updated = [...gallery];
                                            const itemToMove = updated.splice(draggedItemIndex, 1)[0];
                                            updated.splice(i, 0, itemToMove);
                                            setGallery(updated);
                                        }} 
                                        style={dragCard}
                                    >
                                        <div style={posBadge(themeColor)}>{i + 1}</div>
                                        <img src={item.url} style={thumbImg} alt="P" />
                                        <div style={imgControls}>
                                            <select style={posSelect} value={i+1} onChange={(e)=>jumpToPosition(i, e.target.value)}>
                                                {gallery.map((_, idx)=><option key={idx} value={idx+1}>{idx+1}</option>)}
                                            </select>
                                            <button type="button" onClick={()=>removeImage(i)} style={miniDel}>✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{marginTop:'25px'}}>
                                <label style={labS}>Technical Specifications (Description)</label>
                                <textarea style={areaS} value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} placeholder="Detailed product info..." />
                            </div>

                            <div style={{marginTop:'20px'}}>
                                <label style={labS}>Marketplace Discovery Tags</label>
                                <input style={inS} value={formData.tags} onChange={e=>setFormData({...formData, tags:e.target.value})} placeholder="Separated by commas..." />
                            </div>
                        </div>

                        {/* RIGHT: Operational Data */}
                        <div style={col}>
                            <label style={labS}>Display Identity</label>
                            <input style={inS} value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} required />
                            
                            <div style={responsiveGrid}>
                                <div style={{flex:1}}><label style={labS}>Sector Category</label>
                                    <select style={inS} value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})}>
                                        <option value="">-- Select --</option>
                                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div style={{flex:1}}><label style={labS}>Inventory Unit</label>
                                    <select style={inS} value={formData.unit} onChange={e=>setFormData({...formData, unit:e.target.value})}>
                                        <option value="">-- Select --</option>
                                        {unitList.map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={responsiveGrid}>
                                <div style={{flex:1}}><label style={labS}>Market Price (MRP)</label><input type="number" style={inS} value={formData.mrp} onChange={e=>setFormData({...formData, mrp:e.target.value})} /></div>
                                <div style={{flex:1}}><label style={labS}>Selling Price (INR)</label><input type="number" style={inS} value={formData.price} onChange={e=>setFormData({...formData, price:e.target.value})} /></div>
                            </div>

                            <div style={responsiveGrid}>
                                <div style={{flex:1}}><label style={labS}>Available Stock</label><input type="number" style={inS} value={formData.stock} onChange={e=>setFormData({...formData, stock:e.target.value})} /></div>
                                <div style={{flex:1}}><label style={labS}>Alert Threshold</label><input type="number" style={inS} value={formData.lowStockThreshold} onChange={e=>setFormData({...formData, lowStockThreshold:e.target.value})} /></div>
                            </div>

                            <div style={responsiveGrid}>
                                <div style={{flex:1}}><label style={labS}>MFG Timestamp</label><input type="date" style={inS} value={formData.mfgDate} onChange={e=>setFormData({...formData, mfgDate:e.target.value})} /></div>
                                <div style={{flex:1}}><label style={labS}>EXP Policy Date</label><input type="date" style={inS} value={formData.expDate} onChange={e=>setFormData({...formData, expDate:e.target.value})} /></div>
                            </div>

                            <div style={{marginTop:'15px'}}>
                                <label style={labS}>Global Visibility Node</label>
                                <select style={inS} value={formData.isActive} onChange={e=>setFormData({...formData, isActive: e.target.value === 'true'})}>
                                    <option value="true">🟢 LIVE ON MARKETPLACE</option>
                                    <option value="false">🔴 HIDDEN FROM STORE</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div style={footer}>
                    <button type="button" onClick={handlePurgeAsset} style={purgeBtnS} disabled={uploading}>🗑️ PURGE ASSET</button>
                    <div style={{display:'flex', gap:'15px'}}>
                        <button type="button" onClick={onCancel} style={cancelBtn}>Discard</button>
                        <button type="submit" onClick={handleSubmit} disabled={uploading} style={submitBtn(themeColor)}>
                            {uploading ? "📡 SYNCING..." : "COMMIT CHANGES"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Styles (Ultra Pro SaaS Edition) ---

const formOverlay = { position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(15, 23, 42, 0.9)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:10000, backdropFilter:'blur(10px)' };
const formCard = { background:'#fff', width:'95%', maxWidth:'1100px', maxHeight:'95vh', borderRadius:'40px', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 30px 60px rgba(0,0,0,0.4)' };
const formHeader = { padding:'25px 40px', background:'#f8fafc', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' };
const formTitle = { margin:0, fontSize:'18px', fontWeight:'900', color:'#0f172a', letterSpacing:'-0.5px' };
const statusDot = (a) => ({ width:'10px', height:'10px', borderRadius:'50%', background: a ? '#10b981' : '#ef4444', boxShadow: a ? '0 0 10px #10b981' : 'none' });
const closeBtn = { background:'#f1f5f9', border:'none', width:'35px', height:'35px', borderRadius:'12px', cursor:'pointer', color:'#94a3b8', fontWeight:'bold' };

const formScrollBody = { padding:'40px', overflowY:'auto', flex:1 };
const formGrid = { display:'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1fr', gap:'50px' };
const col = { display:'flex', flexDirection:'column', gap:'15px' };

const labS = { fontSize:'10px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'5px', display:'block' };
const inS = { width:'100%', padding:'15px', borderRadius:'15px', border:'2px solid #f1f5f9', outline:'none', fontWeight:'700', fontSize:'14px', background:'#fcfdfe', transition:'0.3s' };
const areaS = { ...inS, height:'120px', resize:'none', lineHeight:'1.6' };

const uploadZone = { display:'flex', flexWrap:'wrap', gap:'12px', background:'#f8fafc', padding:'20px', borderRadius:'25px', border:'2px dashed #e2e8f0' };
const uploadLabel = { width:'100px', height:'130px', background:'#fff', border:'1.5px solid #f1f5f9', borderRadius:'18px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'0.2s' };
const dragCard = { width:'100px', height:'130px', borderRadius:'18px', position:'relative', border:'1.5px solid #f1f5f9', background:'#fff', overflow:'hidden', cursor:'grab' };
const posBadge = (c) => ({ position:'absolute', top:'5px', left:'5px', background:c, color:'#fff', width:'18px', height:'18px', borderRadius:'5px', fontSize:'9px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', zIndex:2 });
const thumbImg = { width:'100%', height:'80px', objectFit:'contain', background:'#fcfdfe' };
const imgControls = { padding:'5px', display:'flex', gap:'5px', background:'#f8fafc' };
const posSelect = { flex:1, fontSize:'10px', fontWeight:'800', border:'1px solid #e2e8f0', borderRadius:'5px', outline:'none' };
const miniDel = { background:'#fff1f2', color:'#ef4444', border:'1px solid #fee2e2', borderRadius:'5px', width:'22px', cursor:'pointer', fontWeight:'bold' };

const responsiveGrid = { display:'flex', gap:'15px' };
const footer = { padding:'25px 40px', background:'#f8fafc', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap' };
const submitBtn = (c) => ({ padding:'16px 40px', background:c, color:'#fff', border:'none', borderRadius:'15px', fontWeight:'900', fontSize:'14px', cursor:'pointer', boxShadow:`0 10px 20px ${c}30` });
const purgeBtnS = { background:'#fff1f2', color:'#e11d48', border:'1.5px solid #fecaca', padding:'16px 30px', borderRadius:'15px', fontWeight:'900', fontSize:'12px', cursor:'pointer' };
const cancelBtn = { padding:'16px 30px', background:'#fff', color:'#64748b', border:'1.5px solid #f1f5f9', borderRadius:'15px', fontWeight:'800', cursor:'pointer' };

export default AdminProductForm;