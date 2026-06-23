import React, { useState } from 'react';

/**
 * RKD MART - FINANCIALS & SETTLEMENT TAB (ULTRA PRO)
 * वॉलेट, बैंक विवरण और पासबुक वेरिफिकेशन सिस्टम
 */
const Financials = ({ shop, theme }) => {
    const [viewer, setViewer] = useState({ isOpen: false, url: '', rotation: 0, scale: 1 });

    // --- इमेज व्यूअर कंट्रोल्स ---
    const openViewer = (url) => setViewer({ isOpen: true, url, rotation: 0, scale: 1 });
    const closeViewer = () => setViewer({ ...viewer, isOpen: false });
    const rotate = () => setViewer(prev => ({ ...prev, rotation: prev.rotation + 90 }));
    const zoomIn = () => setViewer(prev => ({ ...prev, scale: Math.min(prev.scale + 0.2, 3) }));
    const zoomOut = () => setViewer(prev => ({ ...prev, scale: Math.max(prev.scale - 0.2, 0.5) }));

    return (
        <div style={containerS}>
            {/* --- 1. Top Highlights (Wallet & Earnings) --- */}
            <div style={cardsGridS}>
                <div style={fCardS(theme)}>
                    <div style={iconCircleS}>💰</div>
                    <small style={cardLabS}>CURRENT WALLET BALANCE</small>
                    <h2 style={cardValS}>₹{(shop.wallet?.balance || 0).toLocaleString('en-IN')}</h2>
                    <div style={cardActionsS}>
                        <button style={whiteBtnS}>VIEW LEDGER</button>
                        <button style={whiteBtnS}>ADJUSTMENT</button>
                    </div>
                </div>

                <div style={fCardS('#6366f1')}>
                    <div style={iconCircleS}>📈</div>
                    <small style={cardLabS}>COMMISSION ACCRUED</small>
                    <h2 style={cardValS}>₹{(shop.totalCommission || 0).toLocaleString('en-IN')}</h2>
                    <div style={cardActionsS}>
                        <button style={whiteBtnS}>REVENUE SPLIT</button>
                    </div>
                </div>

                <div style={fCardS('#f59e0b')}>
                    <div style={iconCircleS}>🏧</div>
                    <small style={cardLabS}>TOTAL PAYOUTS SETTLED</small>
                    <h2 style={cardValS}>₹{(shop.totalPayouts || 0).toLocaleString('en-IN')}</h2>
                    <div style={cardActionsS}>
                        <button style={whiteBtnS}>PAYOUT HISTORY</button>
                    </div>
                </div>
            </div>

            {/* --- 2. Bank Node & Document Section --- */}
            <div style={bankSectionS}>
                <div style={bankInfoS}>
                    <h3 style={secTitleS}>🏦 Bank Settlement Node</h3>
                    <div style={infoGridS}>
                        <InfoItem label="Bank Name" val={shop.bankName} />
                        <InfoItem label="Account Number" val={shop.bankAcc} />
                        <InfoItem label="IFSC Code" val={shop.bankIfsc} />
                        <InfoItem label="Account Holder" val={shop.fullName} />
                    </div>
                </div>

                <div style={bankDocS}>
                    <h3 style={secTitleS}>📄 Verified Bank Document</h3>
                    <div style={docPreviewS}>
                        {shop.bankFile ? (
                            <div style={{position:'relative', height:'100%'}}>
                                <img src={shop.bankFile} style={passbookImgS} alt="Bank Doc" />
                                <button onClick={() => openViewer(shop.bankFile)} style={inspectBtnS}>
                                    🔍 INSPECT PASSBOOK
                                </button>
                            </div>
                        ) : (
                            <div style={noDocS}>
                                <span style={{fontSize:'30px'}}>🚫</span>
                                <p>No Bank Document Discovered</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- ULTRA PRO IMAGE VIEWER (MODAL) --- */}
            {viewer.isOpen && (
                <div style={overlayS}>
                    <div style={viewerHeaderS}>
                        <h3 style={{margin:0, fontSize:'14px', color:'#1e293b'}}>BANK DOCUMENT INSPECTION</h3>
                        <div style={{display:'flex', gap:'10px'}}>
                            <button onClick={rotate} style={toolBtnS}>🔄 Rotate</button>
                            <button onClick={zoomIn} style={toolBtnS}>➕ Zoom</button>
                            <button onClick={zoomOut} style={toolBtnS}>➖ Zoom</button>
                            <button onClick={closeViewer} style={closeBtnS}>CLOSE ✕</button>
                        </div>
                    </div>
                    <div style={stageS}>
                        <img 
                            src={viewer.url} 
                            style={{
                                ...inspectedImgS,
                                transform: `rotate(${viewer.rotation}deg) scale(${viewer.scale})`
                            }} 
                            alt="Passbook"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

/** --- Helper for Text Info --- */
const InfoItem = ({ label, val }) => (
    <div style={itS}>
        <small style={itLabS}>{label}</small>
        <b style={itValS}>{val || "---"}</b>
    </div>
);

// --- CSS STYLES (Ultra Pro SaaS Style) ---
const containerS = { animation: 'fadeIn 0.5s ease' };
const cardsGridS = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'20px', marginBottom:'30px' };

const fCardS = (bg) => ({ 
    background: bg, padding:'25px', borderRadius:'28px', color:'#fff', 
    boxShadow: `0 10px 25px ${bg}30`, position:'relative', overflow:'hidden' 
});

const iconCircleS = { 
    position:'absolute', top:'-10px', right:'-10px', fontSize:'80px', opacity:0.1 
};

const cardLabS = { fontSize:'10px', fontWeight:'800', opacity:0.9, letterSpacing:'1px' };
const cardValS = { margin:'10px 0 20px 0', fontSize:'28px', fontWeight:'900' };
const cardActionsS = { display:'flex', gap:'10px' };

const whiteBtnS = { 
    background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', 
    color:'#fff', padding:'8px 15px', borderRadius:'10px', cursor:'pointer', 
    fontWeight:'800', fontSize:'10px', transition:'0.3s' 
};

const bankSectionS = { display:'grid', gridTemplateColumns:'1fr 350px', gap:'25px' };
const bankInfoS = { background:'#fff', padding:'30px', borderRadius:'24px', border:'1px solid #f1f5f9' };
const bankDocS = { background:'#fff', padding:'30px', borderRadius:'24px', border:'1px solid #f1f5f9' };

const secTitleS = { margin:'0 0 25px 0', fontSize:'15px', fontWeight:'900', color:'#0f172a', textTransform:'uppercase', letterSpacing:'0.5px' };
const infoGridS = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'25px' };

const itS = { display:'flex', flexDirection:'column', gap:'5px', paddingBottom:'15px', borderBottom:'1px solid #f8fafc' };
const itLabS = { color:'#94a3b8', fontSize:'10px', fontWeight:'800', textTransform:'uppercase' };
const itValS = { fontSize:'15px', color:'#1e293b', fontWeight:'700' };

const docPreviewS = { height:'200px', background:'#f8fafc', borderRadius:'20px', border:'1.5px dashed #e2e8f0', overflow:'hidden' };
const passbookImgS = { width:'100%', height:'100%', objectFit:'cover', opacity:0.8 };
const inspectBtnS = { position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', padding:'10px 18px', background:'#fff', border:'none', borderRadius:'12px', fontWeight:'900', fontSize:'11px', color:'#0d9488', cursor:'pointer', boxShadow:'0 5px 15px rgba(0,0,0,0.1)' };
const noDocS = { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'#94a3b8', fontSize:'12px', fontWeight:'700' };

// --- VIEWER STYLES ---
const overlayS = { position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(15, 23, 42, 0.98)', zIndex:9999, display:'flex', flexDirection:'column' };
const viewerHeaderS = { height:'60px', background:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 25px' };
const toolBtnS = { background:'#f1f5f9', border:'none', padding:'8px 12px', borderRadius:'8px', fontWeight:'800', fontSize:'10px', cursor:'pointer', color:'#475569' };
const closeBtnS = { background:'#f43f5e', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'8px', fontWeight:'900', fontSize:'10px', cursor:'pointer' };
const stageS = { flex:1, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' };
const inspectedImgS = { maxWidth:'85%', maxHeight:'80vh', transition:'transform 0.3s ease', boxShadow:'0 0 50px rgba(0,0,0,0.5)' };

export default Financials;