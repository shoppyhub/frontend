import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useBranding } from '../../context/BrandingContext';

const ProductForm = ({ editData, categories, onSuccess, onCancel }) => {
    const { settings } = useBranding();
    const [uploading, setUploading] = useState(false);
    const [gallery, setGallery] = useState([]); 
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '', 
        category: '', 
        price: '', 
        mrp: '', 
        stock: '', 
        lowStockThreshold: '', 
        unit: '', 
        description: '', 
        tags: '', 
        mfgDate: '', 
        expDate: '', 
        isActive: true
    });

    const unitList = ["kg", "ltr", "pc", "pkt", "dz", "gm", "ml", "box", "set", "unit"];

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

            if (editData.images && editData.images.length > 0) {
                setGallery(editData.images.map(img => ({
                    url: img.url, file: null, isExisting: true, publicId: img.publicId
                })));
            } else if (editData.imageUrl) {
                setGallery([{ url: editData.imageUrl, file: null, isExisting: true, publicId: editData.publicId }]);
            }
        }
    }, [editData]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
        if (!files.length) return toast.error("Invalid file: Please select a valid image (JPG, PNG, WEBP).");

        if (gallery.length + files.length > 5) return toast.error("Deployment Error: Maximum 5 images permitted.");

        const newEntries = files.map(file => ({
            url: URL.createObjectURL(file), file, isExisting: false
        }));
        setGallery(prev => [...prev, ...newEntries]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const clearAllImages = () => {
        if (window.confirm("CRITICAL: Purge entire visual gallery?")) {
            gallery.forEach(item => { if (!item.isExisting) URL.revokeObjectURL(item.url); });
            setGallery([]);
            toast.info("Gallery decommissioned.");
        }
    };

    const handleDragStart = (index) => setDraggedItemIndex(index);
    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (index) => {
        const updatedGallery = [...gallery];
        const itemToMove = updatedGallery.splice(draggedItemIndex, 1)[0];
        updatedGallery.splice(index, 0, itemToMove);
        setGallery(updatedGallery);
        setDraggedItemIndex(null);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (gallery.length === 0) return toast.error("Validation Error: Minimum 1 image required.");
        if (parseFloat(formData.price) > parseFloat(formData.mrp)) {
            return toast.warning("Commercial Alert: Selling price cannot exceed MRP.");
        }

        setUploading(true);
        const data = new FormData();

        Object.keys(formData).forEach(key => {
            if (formData[key] !== '' && formData[key] !== null) data.append(key, formData[key]);
        });

        const existingPhotos = [];
        gallery.forEach((item) => {
            if (item.isExisting) existingPhotos.push({ url: item.url, publicId: item.publicId });
            else data.append('images', item.file);
        });
        data.append('existingImagesJson', JSON.stringify(existingPhotos));

        try {
            const response = editData 
                ? await api.put(`/products/update/${editData._id}`, data, { timeout: 120000 })
                : await api.post('/products/add', data, { timeout: 120000 });

            if (response.data.success) {
                toast.success(`Success: Node ${editData ? 'Updated' : 'Deployed'} Successfully!`);
                onSuccess();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Communication failure with registry.");
        } finally {
            setUploading(false);
        }
    };

    const themeColor = settings?.themeColor || '#0f172a';

    return (
        <div style={formOverlay}>
            <div style={formCard}>
                <div style={formHeader}>
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        <span style={{fontSize:'22px'}}>{editData ? '📝' : '⚡'}</span>
                        <h3 style={formTitle}>{editData ? 'Update Inventory Metadata' : 'Deploy New Commercial Asset'}</h3>
                    </div>
                    <button onClick={onCancel} style={closeBtn}>✕</button>
                </div>
                
                <form onSubmit={handleSubmit} style={formScrollBody}>
                    <div style={formGrid}>
                        
                        <div style={col}>
                            <div style={flexHeaderS}>
                                <div style={sectionTitle(themeColor)}>Asset Gallery (Visual Hierarchy)</div>
                                {gallery.length > 0 && (
                                    <button type="button" onClick={clearAllImages} style={clearAllBtnS}>🗑️ Purge All</button>
                                )}
                            </div>
                            
                            <div style={uploadZone}>
                                <label style={uploadLabel}>
                                    <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/jpg,image/png,image/webp,image/*" onChange={handleImageChange} hidden />
                                    <span style={{fontSize:'24px'}}>📸</span>
                                    <small style={{fontWeight:'800', marginTop:'8px', color: themeColor}}>LINK PHOTO</small>
                                </label>

                                {gallery.map((item, i) => (
                                    <div 
                                        key={i} 
                                        style={dragCard(draggedItemIndex === i, themeColor)}
                                        draggable
                                        onDragStart={() => handleDragStart(i)}
                                        onDragOver={handleDragOver}
                                        onDrop={() => handleDrop(i)}
                                    >
                                        <div style={posBadge(themeColor)}>{i + 1}</div>
                                        <img src={item.url} alt="asset" style={thumbImg} />
                                        
                                        <div style={posControlArea}>
                                            <select 
                                                style={posSelect} 
                                                value={i + 1} 
                                                onChange={(e) => jumpToPosition(i, parseInt(e.target.value))}
                                            >
                                                {gallery.map((_, idx) => (
                                                    <option key={idx} value={idx + 1}>Index {idx + 1}</option>
                                                ))}
                                            </select>
                                            <button type="button" onClick={() => removeImage(i)} style={miniDelBtn}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div style={{marginTop:'30px'}}>
                                <label style={labS}>Extended Asset Documentation</label>
                                <textarea 
                                    style={areaS} 
                                    value={formData.description} 
                                    onChange={(e)=>setFormData({...formData, description:e.target.value})} 
                                    placeholder="Enter technical specifications, origin data, and usage details..." 
                                />
                            </div>
                        </div>

                        <div style={col}>
                            <div style={sectionTitle(themeColor)}>Operational Specifications</div>
                            
                            <div style={inputGroupS}>
                                <label style={labS}>Market Display Identity *</label>
                                <input style={inS} value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} required placeholder="e.g. Premium Organic Node" />
                            </div>

                            <div style={responsiveGrid}>
                                <div style={inputBox}>
                                    <label style={labS}>Sector Category *</label>
                                    <select style={inS} value={formData.category} onChange={(e)=>setFormData({...formData, category:e.target.value})} required>
                                        <option value="">-- Select --</option>
                                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div style={inputBox}>
                                    <label style={labS}>Operational Unit *</label>
                                    <select style={inS} value={formData.unit} onChange={(e)=>setFormData({...formData, unit:e.target.value})} required>
                                        <option value="">-- Select --</option>
                                        {unitList.map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={responsiveGrid}>
                                <div style={inputBox}>
                                    <label style={labS}>Net Price (₹) *</label>
                                    <input type="number" style={inS} value={formData.price} onChange={(e)=>setFormData({...formData, price:e.target.value})} required placeholder="0.00" />
                                </div>
                                <div style={inputBox}>
                                    <label style={labS}>Standard MRP (₹)</label>
                                    <input type="number" style={inS} value={formData.mrp} onChange={(e)=>setFormData({...formData, mrp:e.target.value})} placeholder="0.00" />
                                </div>
                            </div>

                            <div style={responsiveGrid}>
                                <div style={inputBox}>
                                    <label style={labS}>Available Inventory *</label>
                                    <input type="number" style={inS} value={formData.stock} onChange={(e)=>setFormData({...formData, stock:e.target.value})} required placeholder="Stock Count" />
                                </div>
                                <div style={inputBox}>
                                    <label style={labS}>Depletion Alert Threshold</label>
                                    <input type="number" style={inS} value={formData.lowStockThreshold} onChange={(e)=>setFormData({...formData, lowStockThreshold:e.target.value})} placeholder="Alert limit" />
                                </div>
                            </div>

                            <div style={responsiveGrid}>
                                <div style={inputBox}>
                                    <label style={labS}>MFG Timestamp</label>
                                    <input type="date" style={inS} value={formData.mfgDate} onChange={(e)=>setFormData({...formData, mfgDate:e.target.value})} />
                                </div>
                                <div style={inputBox}>
                                    <label style={labS}>EXP Timestamp</label>
                                    <input type="date" style={inS} value={formData.expDate} onChange={(e)=>setFormData({...formData, expDate:e.target.value})} />
                                </div>
                            </div>

                            <div style={{marginTop:'15px'}}>
                                <label style={labS}>Discovery Meta Tags (SEO)</label>
                                <input 
                                    style={inS} 
                                    value={formData.tags} 
                                    onChange={(e)=>setFormData({...formData, tags:e.target.value})} 
                                    placeholder="Keywords separated by commas..." 
                                />
                                <small style={tagHint}>Linked nodes will use these for marketplace indexing.</small>
                            </div>
                        </div>
                    </div>

                    <div style={footer}>
                        <button type="button" onClick={onCancel} style={cancelBtn}>Discard Protocol</button>
                        <button 
                            type="submit" 
                            disabled={uploading} 
                            style={uploading ? disabledBtnS : submitBtn(themeColor)}
                        >
                            {uploading ? "📡 SYNCHRONIZING..." : "DEPLOY ASSET"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- CORRECTED & DEFINED STYLES ---

const formOverlay = { position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(15, 23, 42, 0.85)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:10000, backdropFilter:'blur(10px)' };
const formCard = { background:'#fff', width:'95%', maxWidth:'1150px', maxHeight:'95vh', borderRadius:'40px', overflow:'hidden', boxShadow:'0 30px 60px rgba(0,0,0,0.3)', display:'flex', flexDirection:'column' };
const formHeader = { padding:'25px 45px', background:'#f8fafc', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' };
const formTitle = { margin:0, fontSize:'20px', fontWeight:'900', color:'#0f172a', letterSpacing:'-0.5px' };
const closeBtn = { background:'#f1f5f9', border:'none', width:'35px', height:'35px', borderRadius:'12px', cursor:'pointer', color:'#94a3b8', fontWeight:'bold' };

const formScrollBody = { flex:1, overflowY:'auto', padding: window.innerWidth < 768 ? '25px' : '45px' };
const formGrid = { display:'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1fr', gap:'50px' };
const col = { display:'flex', flexDirection:'column' };

const flexHeaderS = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' };
const clearAllBtnS = { background:'#fff1f2', color:'#f43f5e', border:'1px solid #fee2e2', padding:'6px 14px', borderRadius:'10px', fontSize:'11px', fontWeight:'900', cursor:'pointer' };

const sectionTitle = (color) => ({ fontSize:'12px', fontWeight:'900', color: color, textTransform:'uppercase', letterSpacing:'1.5px', borderBottom:`2px solid ${color}10`, paddingBottom:'12px' });

// ✅ Fixed: Added inputGroupS definition
const inputGroupS = { marginBottom: '22px', display: 'flex', flexDirection: 'column' };

const labS = { fontSize:'10px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'10px', display:'block' };
const inS = { width:'100%', padding:'16px', borderRadius:'16px', border:'1.5px solid #f1f5f9', background:'#f8fafc', outline:'none', fontWeight:'700', fontSize:'14px', boxSizing:'border-box', transition:'0.3s' };
const areaS = { ...inS, height:'180px', resize:'none', lineHeight:'1.6' };

const responsiveGrid = { display:'flex', gap:'20px', marginBottom:'20px', flexWrap:'wrap' };
const inputBox = { flex:1, minWidth:'180px' };

const uploadZone = { display:'flex', flexWrap:'wrap', gap:'15px', padding:'20px', background:'#f8fafc', border:'2px dashed #e2e8f0', borderRadius:'30px' };
const uploadLabel = { width:'115px', height:'150px', background:'#fff', border:'1.5px solid #f1f5f9', borderRadius:'22px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'0.2s', boxShadow:'0 4px 10px rgba(0,0,0,0.02)' };

const dragCard = (isDragging, color) => ({
    width:'115px', height:'150px', borderRadius:'22px', position:'relative', border: isDragging ? `2px solid ${color}` : '2px solid transparent',
    background:'#fff', overflow:'hidden', boxShadow:'0 10px 20px rgba(0,0,0,0.04)', cursor:'grab', transition:'0.2s', opacity: isDragging ? 0.5 : 1
});

const posBadge = (color) => ({ position:'absolute', top:'8px', left:'8px', background: color, color:'#fff', width:'22px', height:'22px', borderRadius:'8px', fontSize:'10px', display:'flex', justifyContent:'center', alignItems:'center', zIndex:5, fontWeight:'900' });
const thumbImg = { width:'100%', height:'100px', objectFit:'contain', background:'#f8fafc' };

const posControlArea = { display:'flex', flexDirection:'column', background:'#fff', padding:'5px' };
const posSelect = { width:'100%', border:'1px solid #f1f5f9', borderRadius:'8px', fontSize:'11px', fontWeight:'800', cursor:'pointer', padding:'4px', outline:'none', background:'#f8fafc' };
const miniDelBtn = { marginTop:'5px', background:'none', border:'none', color:'#f43f5e', fontSize:'10px', cursor:'pointer', fontWeight:'900', textTransform:'uppercase' };

const footer = { padding:'30px 45px', background:'#f8fafc', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end', gap:'20px', flexWrap:'wrap' };
const submitBtn = (color) => ({ padding:'18px 50px', background: color, color:'#fff', border:'none', borderRadius:'18px', fontWeight:'900', cursor:'pointer', fontSize:'15px', boxShadow:`0 10px 20px ${color}44`, transition:'0.3s' });
const disabledBtnS = { padding:'18px 50px', background:'#cbd5e1', color:'#fff', border:'none', borderRadius:'18px', fontWeight:'900', cursor:'not-allowed' };
const cancelBtn = { padding:'18px 50px', background:'#fff', color:'#64748b', border:'1.5px solid #f1f5f9', borderRadius:'18px', fontWeight:'800', cursor:'pointer' };

const tagHint = { fontSize:'10px', color:'#94a3b8', marginTop:'8px', display:'block', fontWeight:'600' };

export default ProductForm;