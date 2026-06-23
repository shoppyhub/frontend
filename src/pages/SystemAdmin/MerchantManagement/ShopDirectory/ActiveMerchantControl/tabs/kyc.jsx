import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from 'services/api';

const KYCCompliance = ({ merchant, refresh }) => {
    // --- States ---
    const [actionLoading, setActionLoading] = useState(false);
    const [viewer, setViewer] = useState({ isOpen: false, url: '', title: '', rotation: 0, scale: 1 });
    const [editData, setEditData] = useState({ ...merchant });

    // --- 1. Media Engine Functions ---
    const openViewer = (url, title) => setViewer({ isOpen: true, url, title, rotation: 0, scale: 1 });
    const closeViewer = () => setViewer({ ...viewer, isOpen: false });
    const rotate = () => setViewer(prev => ({ ...prev, rotation: prev.rotation + 90 }));
    const zoomIn = () => setViewer(prev => ({ ...prev, scale: Math.min(prev.scale + 0.3, 4) }));
    const zoomOut = () => setViewer(prev => ({ ...prev, scale: Math.max(prev.scale - 0.3, 0.5) }));
    
    const downloadDoc = (url, title) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `RKD_Audit_${title.replace(/\s+/g, '_')}_${merchant.generatedId}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- 2. Update & Delete Functions ---
    const handleFileChange = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            if (window.confirm(`FORCE UPDATE: Replace current ${field}?`)) {
                setActionLoading(true);
                try {
                    await api.put(`/admin/hierarchy/update/${merchant._id}`, { [field]: reader.result });
                    toast.success("Document Synchronized.");
                    refresh();
                } catch (err) { toast.error("Upload Failed."); }
                finally { setActionLoading(false); }
            }
        };
    };

    const handleDeleteDoc = async (field) => {
        if (!window.confirm(`CRITICAL: Permanently purge this document from registry?`)) return;
        setActionLoading(true);
        try {
            await api.put(`/admin/hierarchy/update/${merchant._id}`, { [field]: "" });
            toast.error("Document Purged.");
            refresh();
        } catch (err) { toast.error("Purge Failed."); }
        finally { setActionLoading(false); }
    };

    const updateDocNumber = async (field, value) => {
        try {
            await api.put(`/admin/hierarchy/update/${merchant._id}`, { [field]: value });
            toast.info("Registry Updated.");
        } catch (err) { toast.error("Sync Failed."); }
    };

    return (
        <div style={containerS}>
            {/* Header Control */}
            <div style={headerS}>
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    <div style={statusBadgeS(merchant.kycStatus === 'Verified')}>
                        {merchant.kycStatus === 'Verified' ? '🛡️ COMPLIANCE_OK' : '⚠️ AUDIT_REQUIRED'}
                    </div>
                    <h3 style={titleS}>Global Compliance Vault</h3>
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                    <button style={secBtnS} onClick={refresh}>🔄 RE-SYNC</button>
                    <button style={mainBtnS} onClick={() => updateDocNumber('kycStatus', 'Verified')}>✅ APPROVE PROFILE</button>
                </div>
            </div>

            {/* Document Matrix */}
            <div style={docGridS}>
                <DocNode 
                    label="AADHAAR IDENTITY" 
                    imgField="aadharFile"
                    numField="aadharNumber"
                    src={merchant.aadharFile} 
                    val={merchant.aadharNumber}
                    onZoom={openViewer}
                    onDelete={handleDeleteDoc}
                    onUpload={handleFileChange}
                    onUpdateNum={updateDocNumber}
                />
                <DocNode 
                    label="PAN TAX CARD" 
                    imgField="panFile"
                    numField="panNumber"
                    src={merchant.panFile} 
                    val={merchant.panNumber}
                    onZoom={openViewer}
                    onDelete={handleDeleteDoc}
                    onUpload={handleFileChange}
                    onUpdateNum={updateDocNumber}
                />
                <DocNode 
                    label="BANK SETTLEMENT" 
                    imgField="bankFile"
                    numField="bankAcc"
                    src={merchant.bankFile} 
                    val={merchant.bankAcc}
                    onZoom={openViewer}
                    onDelete={handleDeleteDoc}
                    onUpload={handleFileChange}
                    onUpdateNum={updateDocNumber}
                />
                <DocNode 
                    label="SHOP EXTERIOR" 
                    imgField="shopPhotoOut"
                    src={merchant.shopPhotoOut} 
                    onZoom={openViewer}
                    onDelete={handleDeleteDoc}
                    onUpload={handleFileChange}
                />
                <DocNode 
                    label="SHOP INTERIOR" 
                    imgField="shopPhotoIn"
                    src={merchant.shopPhotoIn} 
                    onZoom={openViewer}
                    onDelete={handleDeleteDoc}
                    onUpload={handleFileChange}
                />
                <DocNode 
                    label="PROPRIETOR PORTRAIT" 
                    imgField="ownerPhoto"
                    src={merchant.ownerPhoto || merchant.photo} 
                    onZoom={openViewer}
                    onDelete={handleDeleteDoc}
                    onUpload={handleFileChange}
                />
            </div>

            {/* --- ULTIMATE MEDIA INSPECTOR MODAL --- */}
            {viewer.isOpen && (
                <div style={overlayS} onClick={closeViewer}>
                    <div style={viewerPanelS} onClick={e => e.stopPropagation()}>
                        <div style={viewerHeaderS}>
                            <div style={{color:'#fff'}}>{viewer.title.toUpperCase()}</div>
                            <div style={toolGroupS}>
                                <button onClick={rotate} style={tBtnS}>ROTATE 🔄</button>
                                <button onClick={zoomIn} style={tBtnS}>ZOOM +</button>
                                <button onClick={zoomOut} style={tBtnS}>ZOOM -</button>
                                <button onClick={() => downloadDoc(viewer.url, viewer.title)} style={tBtnS}>DOWNLOAD 📥</button>
                                <button onClick={closeViewer} style={closeS}>CLOSE ✕</button>
                            </div>
                        </div>
                        <div style={stageS}>
                            <img 
                                src={viewer.url} 
                                style={{
                                    ...imgMainS,
                                    transform: `rotate(${viewer.rotation}deg) scale(${viewer.scale})`
                                }} 
                                alt="Inspection"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub Component: Individual Doc Card ---
const DocNode = ({ label, src, val, imgField, numField, onZoom, onDelete, onUpload, onUpdateNum }) => (
    <div style={cardS}>
        <div style={cardHeadS}>
            <span style={labS}>{label}</span>
            <div style={btnRowS}>
                <label style={icoBtnS('#3b82f6')} title="Update">
                    ✏️ <input type="file" hidden onChange={(e) => onUpload(e, imgField)} />
                </label>
                <button onClick={() => onDelete(imgField)} style={icoBtnS('#ef4444')} title="Purge">🗑️</button>
            </div>
        </div>
        
        <div style={imgBoxS} onClick={() => src && onZoom(src, label)}>
            {src ? <img src={src} style={imgS} alt={label} /> : <div style={nullS}>DOCUMENT_NOT_FOUND</div>}
            {src && <div style={zoomHintS}>🔍 CLICK TO INSPECT</div>}
        </div>

        <div style={cardFooterS}>
            {numField && (
                <input 
                    defaultValue={val} 
                    onBlur={(e) => onUpdateNum(numField, e.target.value)}
                    style={docInS}
                    placeholder={`Enter ${label} No.`}
                />
            )}
            <div style={statusRowS}>
                <button style={stBtnS('#10b981')}>APPROVE</button>
                <button style={stBtnS('#f59e0b')}>FLAG</button>
            </div>
        </div>
    </div>
);

// --- Strategic Styles ---
const containerS = { animation: 'fadeIn 0.5s ease' };
const headerS = { display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff', padding:'20px 30px', borderRadius:'25px', marginBottom:'30px', border:'1px solid #f1f5f9', boxShadow:'0 5px 20px rgba(0,0,0,0.02)' };
const titleS = { margin:0, fontSize:'18px', fontWeight:'900', color:'#0f172a', letterSpacing:'-0.5px' };
const statusBadgeS = (v) => ({ background: v?'#ecfdf5':'#fff1f2', color: v?'#10b981':'#f43f5e', padding:'6px 12px', borderRadius:'10px', fontSize:'9px', fontWeight:'900' });

const mainBtnS = { background:'#0f172a', color:'#fff', border:'none', padding:'12px 25px', borderRadius:'12px', fontWeight:'900', fontSize:'11px', cursor:'pointer' };
const secBtnS = { background:'#f8fafc', color:'#64748b', border:'1.5px solid #e2e8f0', padding:'12px 20px', borderRadius:'12px', fontWeight:'800', fontSize:'11px', cursor:'pointer' };

const docGridS = { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'25px' };
const cardS = { background:'#fff', borderRadius:'30px', border:'1px solid #f1f5f9', overflow:'hidden', boxShadow:'0 10px 30px rgba(0,0,0,0.02)' };
const cardHeadS = { padding:'20px 25px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fcfdfe' };
const labS = { fontSize:'10px', fontWeight:'900', color:'#94a3b8', letterSpacing:'0.5px' };
const btnRowS = { display:'flex', gap:'8px' };
const icoBtnS = (c) => ({ width:'32px', height:'32px', borderRadius:'8px', border:`1px solid ${c}30`, color:c, background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', cursor:'pointer' });

const imgBoxS = { height:'200px', background:'#f8fafc', position:'relative', cursor:'zoom-in', overflow:'hidden' };
const imgS = { width:'100%', height:'100%', objectFit:'cover' };
const zoomHintS = { position:'absolute', bottom:0, width:'100%', background:'rgba(15,23,42,0.6)', color:'#fff', textAlign:'center', fontSize:'9px', fontWeight:'900', padding:'8px 0', opacity:0, transition:'0.3s' };
// Hint appears on hover (can add CSS class for it)

const nullS = { height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#cbd5e1', fontSize:'10px', fontWeight:'800', border:'2px dashed #f1f5f9' };

const cardFooterS = { padding:'20px 25px', display:'flex', flexDirection:'column', gap:'12px' };
const docInS = { padding:'12px', borderRadius:'12px', border:'1.5px solid #f1f5f9', fontSize:'13px', fontWeight:'800', outline:'none', background:'#fcfdfe' };
const statusRowS = { display:'flex', gap:'10px' };
const stBtnS = (c) => ({ flex:1, padding:'10px', borderRadius:'10px', border:`1.2px solid ${c}`, color:c, background:'transparent', fontWeight:'900', fontSize:'10px', cursor:'pointer' });

// --- Viewer Styles ---
const overlayS = { position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(15, 23, 42, 0.98)', zIndex:20000, display:'flex', alignItems:'center', justifyContent:'center' };
const viewerPanelS = { width:'95%', height:'95%', display:'flex', flexDirection:'column' };
const viewerHeaderS = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px', borderBottom:'1px solid rgba(255,255,255,0.1)' };
const toolGroupS = { display:'flex', gap:'10px' };
const tBtnS = { background:'rgba(255,255,255,0.1)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', padding:'10px 18px', borderRadius:'10px', fontWeight:'800', fontSize:'11px', cursor:'pointer' };
const closeS = { ...tBtnS, background:'#f43f5e', border:'none' };
const stageS = { flex:1, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' };
const imgMainS = { maxWidth:'90%', maxHeight:'85vh', transition:'0.3s ease', boxShadow:'0 0 50px rgba(0,0,0,0.5)', cursor:'grab' };

export default KYCCompliance;