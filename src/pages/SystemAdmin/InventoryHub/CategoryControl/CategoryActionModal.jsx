import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useBranding } from '../../../../context/BrandingContext'; // For White-labeling

const CategoryActionModal = ({ isOpen, onClose, onSave, editData }) => {
    const { settings } = useBranding();
    
    // 1. 🏗️ State Management (Ecosystem Schema)
    const [formData, setFormData] = useState({
        name: '',
        icon: '📦',
        status: 'Active',
        commissionRate: 5.0 
    });
    const [isSaving, setIsSaving] = useState(false);

    // 2. 📡 Identity Node Sync (Edit vs New Protocol)
    useEffect(() => {
        if (editData) {
            setFormData({
                name: editData.name || '',
                icon: editData.icon || '📦',
                status: editData.status || 'Active',
                commissionRate: editData.commissionRate || 5.0
            });
        } else {
            setFormData({ name: '', icon: '📦', status: 'Active', commissionRate: 5.0 });
        }
    }, [editData, isOpen]);

    if (!isOpen) return null;

    const themeColor = settings?.themeColor || '#0f172a';

    // 3. 🚀 Deployment Protocol Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim() || formData.name.length < 2) {
            return toast.warning("Validation Error: Category identity name is too short.");
        }

        setIsSaving(true);
        try {
            await onSave(formData);
            // Closing is typically handled by the parent after success
        } catch (err) {
            console.error("Registry Sync Failure");
            toast.error("Transmission Interrupted: Check node connection.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={overlayS} onClick={onClose}>
            <div style={modalS} onClick={(e) => e.stopPropagation()}>
                
                {/* --- MODAL HEADER ARCHITECTURE --- */}
                <div style={headerS(themeColor)}>
                    <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                        <div style={headerIconS}>
                            {editData ? '⚙️' : '📁'}
                        </div>
                        <div>
                            <h3 style={titleS}>{editData ? 'Update Category Node' : 'Provision New Category'}</h3>
                            <p style={subTitleS}>Infrastructure Registry Protocol</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={closeBtn}>✕</button>
                </div>
                
                <form onSubmit={handleSubmit} style={bodyS}>
                    
                    {/* 📸 REAL-TIME IDENTITY PREVIEW */}
                    <div style={previewBoxS(themeColor)}>
                        <div style={iconBoxS(themeColor)}>{formData.icon}</div>
                        <div>
                            <div style={previewTitle}>{formData.name || 'ENTRY_NAME_PENDING'}</div>
                            <div style={previewMeta}>
                                Status: <b style={{color: formData.status === 'Active' ? '#10b981' : '#f43f5e'}}>{formData.status.toUpperCase()}</b> 
                                <span style={{margin:'0 8px', color:'#cbd5e1'}}>|</span>
                                Platform Fee: <b style={{color: themeColor}}>{formData.commissionRate}%</b>
                            </div>
                        </div>
                    </div>

                    {/* Classification Node Name */}
                    <div style={fieldS}>
                        <label style={labS}>Classification Name *</label>
                        <input 
                            style={inputS}
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g. Electricals, Grocery, Dairy"
                            required
                            autoFocus
                        />
                    </div>

                    <div style={gridResponsive}>
                        {/* Visual Asset (Icon) */}
                        <div style={fieldS}>
                            <label style={labS}>Visual Node (Emoji)</label>
                            <input 
                                style={inputS}
                                value={formData.icon}
                                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                                placeholder="e.g. 🛒"
                            />
                        </div>

                        {/* Deployment Status */}
                        <div style={fieldS}>
                            <label style={labS}>Initial Status</label>
                            <select 
                                style={selectS}
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="Active">VISIBLE_LIVE</option>
                                <option value="Inactive">HIDDEN_DRAFT</option>
                            </select>
                        </div>
                    </div>

                    {/* Fiscal Protocol (Commission) */}
                    <div style={fieldS}>
                        <label style={labS}>Platform Facilitation Fee (%)</label>
                        <input 
                            type="number"
                            step="0.1"
                            style={inputS}
                            value={formData.commissionRate}
                            onChange={(e) => setFormData({...formData, commissionRate: parseFloat(e.target.value)})}
                            placeholder="Standard Protocol: 5.0"
                            required
                        />
                        <small style={hintS}>Global percentage deducted from each transactional hub in this sector.</small>
                    </div>

                    {/* --- ACTION FOOTER --- */}
                    <div style={footerS}>
                        <button type="button" onClick={onClose} style={cancelBtn} disabled={isSaving}>DISCARD</button>
                        <button 
                            type="submit" 
                            style={isSaving ? btnDisabledS : saveBtn(themeColor)} 
                            disabled={isSaving}
                        >
                            {isSaving ? 'COMMITTING...' : editData ? 'COMMIT UPDATES' : 'DEPLOY CATEGORY'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                @keyframes modalSlideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Definitions ---

const overlayS = { position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(15, 23, 42, 0.85)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:10000, backdropFilter:'blur(10px)' };
const modalS = { background:'#fff', width:'480px', maxWidth:'95%', borderRadius:'40px', overflow:'hidden', boxShadow:'0 30px 60px rgba(0,0,0,0.4)', animation:'modalSlideUp 0.3s ease-out', fontFamily: "'Plus Jakarta Sans', sans-serif" };

const headerS = (color) => ({ padding:'30px 40px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff', borderTop:`8px solid ${color}` });
const headerIconS = { background:'#f8fafc', color:'#0f172a', width:'45px', height:'45px', borderRadius:'15px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', border:'1px solid #f1f5f9' };
const titleS = { margin:0, fontSize:'18px', fontWeight:'900', color:'#0f172a', letterSpacing:'-0.5px' };
const subTitleS = { margin:'4px 0 0 0', fontSize:'10px', fontWeight:'800', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1.5px' };
const closeBtn = { background:'#f8fafc', border:'none', fontSize:'18px', cursor:'pointer', color:'#cbd5e1', width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold' };

const bodyS = { padding:'40px' };
const previewBoxS = (color) => ({ display:'flex', alignItems:'center', gap:'20px', padding:'25px', background:'#f8fafc', borderRadius:'25px', marginBottom:'35px', border:`1.5px dashed ${color}20` });
const iconBoxS = (color) => ({ width:'60px', height:'60px', background:'#fff', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', boxShadow:'0 10px 20px rgba(0,0,0,0.05)', border:`1px solid ${color}10` });
const previewTitle = { fontWeight:'900', fontSize:'18px', color:'#0f172a', letterSpacing:'-0.5px' };
const previewMeta = { fontSize:'11px', color:'#94a3b8', marginTop:'5px', fontWeight:'700' };

const fieldS = { marginBottom:'25px' };
const gridResponsive = { display:'grid', gridTemplateColumns: window.innerWidth < 600 ? '1fr' : '1fr 1fr', gap:'20px' };
const labS = { display:'block', fontSize:'10px', fontWeight:'900', color:'#cbd5e1', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'1px' };
const inputS = { width:'100%', padding:'16px', borderRadius:'16px', border:'1.5px solid #f1f5f9', outline:'none', fontSize:'14px', boxSizing:'border-box', background:'#f8fafc', transition:'0.3s', fontWeight:'700', color:'#1e293b' };
const selectS = { ...inputS, cursor:'pointer' };
const hintS = { fontSize:'10px', color:'#94a3b8', marginTop:'8px', display:'block', fontWeight:'600', lineHeight:'1.5' };

const footerS = { display:'flex', gap:'15px', marginTop:'15px' };
const cancelBtn = { flex:1, padding:'18px', borderRadius:'18px', border:'1.5px solid #f1f5f9', background:'#fff', fontWeight:'800', cursor:'pointer', color:'#64748b', fontSize:'13px', transition:'0.3s' };
const saveBtn = (color) => ({ flex:1.8, padding:'18px', borderRadius:'18px', border:'none', background: color, color:'#fff', fontWeight: '900', cursor: 'pointer', boxShadow: `0 10px 20px ${color}33`, fontSize: '13px', letterSpacing:'1px', transition:'0.3s' });
const btnDisabledS = { ...saveBtn('#cbd5e1'), background:'#f1f5f9', color:'#cbd5e1', cursor:'not-allowed', boxShadow:'none' };

export default CategoryActionModal;