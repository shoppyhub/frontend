import React, { useState } from 'react';

/**
 * RKD MART - KYC & SHOP INSPECTION TAB (ULTRA PRO)
 * आधार, पैन और दुकान की तस्वीरों का लाइव ऑडिट और व्यूअर सिस्टम
 */
const KYCCompliance = ({ shop, canApprove }) => {
    const [viewer, setViewer] = useState({ isOpen: false, url: '', title: '', rotation: 0, scale: 1 });

    // --- व्यूअर कंट्रोल्स ---
    const openViewer = (url, title) => setViewer({ isOpen: true, url, title, rotation: 0, scale: 1 });
    const closeViewer = () => setViewer({ ...viewer, isOpen: false });
    const rotate = () => setViewer(prev => ({ ...prev, rotation: prev.rotation + 90 }));
    const zoomIn = () => setViewer(prev => ({ ...prev, scale: Math.min(prev.scale + 0.2, 3) }));
    const zoomOut = () => setViewer(prev => ({ ...prev, scale: Math.max(prev.scale - 0.2, 0.5) }));

    const downloadImage = (url, name) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${name}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={containerS}>
            {/* --- Document Grid --- */}
            <div style={gridS}>
                {/* 1. Identity Docs */}
                <DocCard label="AADHAAR CARD" id={shop.aadharNumber} img={shop.aadharFile} onInspect={() => openViewer(shop.aadharFile, "Aadhaar Card")} />
                <DocCard label="PAN CARD" id={shop.panNumber} img={shop.panFile} onInspect={() => openViewer(shop.panFile, "PAN Card")} />
                
                {/* 2. Shop Physical Photos */}
                <DocCard label="SHOP FRONT (OUTSIDE)" id="Physical View" img={shop.shopPhotoOut} onInspect={() => openViewer(shop.shopPhotoOut, "Shop Front View")} />
                <DocCard label="SHOP INTERIOR (INSIDE)" id="Physical View" img={shop.shopPhotoIn} onInspect={() => openViewer(shop.shopPhotoIn, "Shop Interior View")} />
            </div>

            {/* --- Quick Audit Section --- */}
            {canApprove && (
                <div style={auditS}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'15px'}}>
                        <span style={{fontSize:'20px'}}>🛡️</span>
                        <h4 style={{margin:0, color:'#0f172a'}}>COMPLIANCE DECISION</h4>
                    </div>
                    <div style={{display:'flex', gap:'15px'}}>
                        <button style={btnS('#10b981')}>✅ APPROVE EVERYTHING</button>
                        <button style={btnS('#f43f5e')}>❌ FLAG FOR CORRECTION</button>
                    </div>
                </div>
            )}

            {/* --- ULTRA PRO IMAGE VIEWER (MODAL) --- */}
            {viewer.isOpen && (
                <div style={overlayS}>
                    {/* Viewer Header */}
                    <div style={viewerHeaderS}>
                        <h3 style={{margin:0, fontSize:'16px'}}>{viewer.title}</h3>
                        <div style={{display:'flex', gap:'15px'}}>
                            <button onClick={rotate} style={toolBtnS}>🔄 Rotate</button>
                            <button onClick={zoomIn} style={toolBtnS}>➕ Zoom In</button>
                            <button onClick={zoomOut} style={toolBtnS}>➖ Zoom Out</button>
                            <button onClick={() => downloadImage(viewer.url, viewer.title)} style={toolBtnS}>📥 Download</button>
                            <button onClick={closeViewer} style={closeBtnS}>CLOSE ✕</button>
                        </div>
                    </div>

                    {/* Image Stage */}
                    <div style={stageS}>
                        <img 
                            src={viewer.url} 
                            alt="Inspect" 
                            style={{
                                ...inspectedImgS,
                                transform: `rotate(${viewer.rotation}deg) scale(${viewer.scale})`
                            }} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

/** --- Document Card Component --- */
const DocCard = ({ label, id, img, onInspect }) => (
    <div style={cardS}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
            <small style={labS}>{label}</small>
            {img && <span style={verifiedTagS}>DIGITAL COPY</span>}
        </div>
        <div style={idTxtS}>{id || 'NOT_FOUND'}</div>
        <div style={previewS}>
            {img ? (
                <img src={img} style={imgS} alt="Preview" />
            ) : (
                <div style={{textAlign:'center', color:'#94a3b8'}}><div style={{fontSize:'30px'}}>🚫</div>MISSING</div>
            )}
        </div>
        {img && (
            <button onClick={onInspect} style={inspectBtnS}>
                🔍 INSPECT DOCUMENT
            </button>
        )}
    </div>
);

// --- STYLES (अल्ट्रा प्रो लेवल) ---
const containerS = { position:'relative' };
const gridS = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'25px' };

const cardS = { background:'#fff', padding:'25px', borderRadius:'24px', border:'1px solid #f1f5f9', boxShadow:'0 4px 15px rgba(0,0,0,0.02)', display:'flex', flexDirection:'column' };
const labS = { color:'#94a3b8', fontSize:'10px', fontWeight:'900', letterSpacing:'0.5px' };
const idTxtS = { fontSize:'15px', fontWeight:'800', color:'#1e293b', margin:'10px 0' };
const previewS = { height:'180px', background:'#f8fafc', borderRadius:'16px', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', border:'1px dashed #e2e8f0', marginBottom:'15px' };
const imgS = { width:'100%', height:'100%', objectFit:'cover' };
const inspectBtnS = { width:'100%', padding:'12px', background:'#f0f9ff', color:'#3b82f6', border:'none', borderRadius:'12px', fontWeight:'900', fontSize:'11px', cursor:'pointer', transition:'0.2s' };
const verifiedTagS = { fontSize:'8px', background:'#ecfdf5', color:'#10b981', padding:'3px 8px', borderRadius:'5px', fontWeight:'900' };

const auditS = { background:'#fff', padding:'25px', borderRadius:'24px', border:'1px solid #f1f5f9', marginTop:'30px', boxShadow:'0 10px 30px rgba(0,0,0,0.03)' };
const btnS = (bg) => ({ background:bg, color:'#fff', border:'none', padding:'12px 25px', borderRadius:'14px', fontWeight:'900', cursor:'pointer', fontSize:'12px', boxShadow:`0 8px 15px ${bg}30` });

// --- VIEWWER MODAL STYLES ---
const overlayS = { position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(15, 23, 42, 0.95)', zIndex:9999, display:'flex', flexDirection:'column' };
const viewerHeaderS = { height:'70px', background:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 30px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' };
const toolBtnS = { background:'#f1f5f9', border:'none', padding:'8px 15px', borderRadius:'8px', fontWeight:'800', fontSize:'11px', cursor:'pointer', color:'#475569' };
const closeBtnS = { background:'#f43f5e', color:'#fff', border:'none', padding:'8px 20px', borderRadius:'8px', fontWeight:'900', fontSize:'11px', cursor:'pointer' };
const stageS = { flex:1, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' };
const inspectedImgS = { maxWidth:'90%', maxHeight:'85vh', transition:'transform 0.3s ease', cursor:'grab' };

export default KYCCompliance;