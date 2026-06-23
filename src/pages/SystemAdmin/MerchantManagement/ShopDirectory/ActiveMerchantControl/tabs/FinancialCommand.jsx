import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from 'services/api';

const FinancialCommand = ({ merchant, refresh }) => {
    const [amount, setAmount] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [viewer, setViewer] = useState(false);

    // --- Wallet Override Logic ---
    const adjustWallet = async (type) => {
        if (!amount || amount <= 0) return toast.warn("Invalid adjustment value.");
        if (!window.confirm(`CRITICAL: Force ${type} of ₹${amount} to node ${merchant.generatedId}?`)) return;

        setIsProcessing(true);
        try {
            await api.put(`/admin/hierarchy/adjust-wallet`, {
                userId: merchant._id,
                amount,
                type,
                description: `System Admin Manual Override: ${type}`
            });
            toast.success(`Node Liquidity Synchronized: ${type} Success`);
            setAmount("");
            refresh();
        } catch (err) {
            toast.error("Financial Sync Failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={containerS}>
            <div style={mainGridS}>
                
                {/* --- LEFT: WALLET COMMAND CENTER --- */}
                <div style={colS}>
                    <div style={walletCardS}>
                        <div style={cardHeaderS}>
                            <h3 style={titleS}>💰 WALLET COMMAND CENTER</h3>
                            <span style={liveTagS}>REAL-TIME BALANCE</span>
                        </div>
                        
                        <div style={balanceDisplayS}>
                            <small style={balLabS}>AVAILABLE LIQUIDITY</small>
                            <h2 style={balValS}>₹{merchant.wallet?.balance?.toLocaleString('en-IN') || 0}</h2>
                        </div>

                        <div style={inputAreaS}>
                            <label style={inLabS}>ADJUSTMENT AMOUNT (INR)</label>
                            <div style={inputWrapS}>
                                <span style={currencyS}>₹</span>
                                <input 
                                    type="number" 
                                    placeholder="0.00" 
                                    style={inS} 
                                    value={amount} 
                                    onChange={e=>setAmount(e.target.value)} 
                                />
                            </div>
                            <div style={btnGridS}>
                                <button 
                                    onClick={()=>adjustWallet('Credit')} 
                                    style={actionBtnS('#10b981')}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? '...' : 'FORCE CREDIT'}
                                </button>
                                <button 
                                    onClick={()=>adjustWallet('Debit')} 
                                    style={actionBtnS('#f43f5e')}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? '...' : 'FORCE DEBIT'}
                                </button>
                            </div>
                            <p style={disclaimerS}>※ Manual adjustments bypass standard settlement protocols and log directly to audit trail.</p>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: BANK & DOCUMENTS --- */}
                <div style={colS}>
                    <div style={bankCardS}>
                        <h3 style={titleS}>🏦 SETTLEMENT INFRASTRUCTURE</h3>
                        <div style={bankInfoGridS}>
                            <DataItem label="BANK PARTNER" val={merchant.bankName} icon="🏛️" />
                            <DataItem label="IFSC PROTOCOL" val={merchant.bankIfsc} icon="⚙️" />
                            <DataItem label="ACCOUNT IDENTIFIER" val={merchant.bankAcc} icon="💳" />
                            <DataItem label="BENEFICIARY NAME" val={merchant.fullName} icon="👤" />
                        </div>
                    </div>

                    <div style={docCardS}>
                        <div style={docHeaderS}>
                            <h3 style={titleS}>📄 VERIFIED BANK DOCUMENT</h3>
                            <button onClick={()=>setViewer(true)} style={zoomBtnS}>🔍 INSPECT FULLSCREEN</button>
                        </div>
                        <div style={docPreviewS} onClick={()=>setViewer(true)}>
                            {merchant.bankFile ? (
                                <img src={merchant.bankFile} style={passbookImgS} alt="Bank Proof" />
                            ) : (
                                <div style={missingS}>DOCUMENT_NOT_DISCOVERED</div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* --- DOCUMENT INSPECTOR MODAL --- */}
            {viewer && merchant.bankFile && (
                <div style={overlayS} onClick={()=>setViewer(false)}>
                    <div style={modalContentS} onClick={e=>e.stopPropagation()}>
                        <div style={modalHeadS}>
                            <span>BANK EVIDENCE AUDIT</span>
                            <button onClick={()=>setViewer(false)} style={closeS}>CLOSE ✕</button>
                        </div>
                        <img src={merchant.bankFile} style={largeImgS} alt="Inspect" />
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub Components ---
const DataItem = ({ label, val, icon }) => (
    <div style={itemBoxS}>
        <div style={itemIconS}>{icon}</div>
        <div>
            <small style={inLabS}>{label}</small>
            <div style={itemValS}>{val || 'N/A'}</div>
        </div>
    </div>
);

// --- Strategic Styles (Ultra Pro) ---
const containerS = { animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const mainGridS = { display:'grid', gridTemplateColumns: '1fr 1.2fr', gap:'30px' };
const colS = { display:'flex', flexDirection:'column', gap:'30px' };

const walletCardS = { background:'#fff', borderRadius:'30px', padding:'35px', border:'1px solid #f1f5f9', boxShadow:'0 15px 35px rgba(0,0,0,0.02)' };
const cardHeaderS = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px' };
const titleS = { margin:0, fontSize:'13px', fontWeight:'900', color:'#0f172a', letterSpacing:'1px' };
const liveTagS = { fontSize:'9px', fontWeight:'900', color:'#10b981', background:'#ecfdf5', padding:'5px 12px', borderRadius:'8px' };

const balanceDisplayS = { background:'#0f172a', padding:'30px', borderRadius:'24px', color:'#fff', marginBottom:'30px', position:'relative', overflow:'hidden' };
const balLabS = { fontSize:'10px', fontWeight:'800', opacity:0.5, letterSpacing:'1px' };
const balValS = { margin:'10px 0 0 0', fontSize:'32px', fontWeight:'900' };

const inputAreaS = { display:'flex', flexDirection:'column', gap:'10px' };
const inLabS = { fontSize:'9px', fontWeight:'900', color:'#94a3b8', letterSpacing:'0.5px' };
const inputWrapS = { position:'relative', display:'flex', alignItems:'center' };
const currencyS = { position:'absolute', left:'20px', fontSize:'20px', fontWeight:'900', color:'#cbd5e1' };
const inS = { width:'100%', padding:'18px 18px 18px 45px', borderRadius:'16px', border:'2px solid #f1f5f9', outline:'none', fontSize:'22px', fontWeight:'900', color:'#0f172a', background:'#fcfdfe' };

const btnGridS = { display:'flex', gap:'15px', marginTop:'10px' };
const actionBtnS = (c) => ({ flex:1, padding:'16px', borderRadius:'14px', border:'none', background:c, color:'#fff', fontWeight:'900', fontSize:'12px', cursor:'pointer', boxShadow:`0 10px 20px ${c}30`, transition:'0.3s' });
const disclaimerS = { fontSize:'9px', color:'#94a3b8', marginTop:'15px', fontStyle:'italic', lineHeight:'1.4' };

const bankCardS = { background:'#fff', padding:'35px', borderRadius:'30px', border:'1px solid #f1f5f9' };
const bankInfoGridS = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'25px', marginTop:'30px' };
const itemBoxS = { display:'flex', gap:'15px', alignItems:'center', paddingBottom:'15px', borderBottom:'1px solid #f8fafc' };
const itemIconS = { width:'35px', height:'35px', background:'#f8fafc', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' };
const itemValS = { fontSize:'14px', fontWeight:'700', color:'#1e293b', marginTop:'2px' };

const docCardS = { background:'#fff', padding:'35px', borderRadius:'30px', border:'1px solid #f1f5f9' };
const docHeaderS = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' };
const zoomBtnS = { background:'#f8fafc', border:'1px solid #e2e8f0', padding:'6px 12px', borderRadius:'8px', fontSize:'10px', fontWeight:'800', cursor:'pointer' };
const docPreviewS = { height:'250px', background:'#f8fafc', borderRadius:'20px', border:'1.5px dashed #e2e8f0', overflow:'hidden', cursor:'zoom-in', display:'flex', alignItems:'center', justifyContent:'center' };
const passbookImgS = { width:'100%', height:'100%', objectFit:'cover', opacity:0.9 };
const missingS = { color:'#94a3b8', fontSize:'11px', fontWeight:'800' };

const overlayS = { position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(15, 23, 42, 0.98)', zIndex:20000, display:'flex', justifyContent:'center', alignItems:'center' };
const modalContentS = { width:'90%', height:'90%', display:'flex', flexDirection:'column', gap:'20px' };
const modalHeadS = { display:'flex', justifyContent:'space-between', color:'#fff', fontWeight:'900', fontSize:'12px', letterSpacing:'1px' };
const closeS = { background:'#f43f5e', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'10px', fontWeight:'900', cursor:'pointer' };
const largeImgS = { width:'100%', height:'100%', objectFit:'contain', borderRadius:'20px' };

export default FinancialCommand;