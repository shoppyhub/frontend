import React from 'react';

const PaymentSection = ({ method, setMethod, walletBalance, onProcess, loading, isMOVMet, amount, isWalletEnabled }) => {
    const payOption = (active, disabled = false) => ({
        padding: '20px 18px', borderRadius: '16px', border: `2.5px solid ${active ? '#2563eb' : '#f1f5f9'}`,
        textAlign: 'center', cursor: disabled ? 'not-allowed' : 'pointer', background: active ? '#eff6ff' : '#fff',
        transition: '0.3s', display:'flex', flexDirection:'column', gap:'6px', opacity: disabled ? 0.5 : 1, boxShadow: active ? '0 4px 12px rgba(37, 99, 235, 0.1)' : 'none'
    });

    return (
        <div style={cardS}>
            <div style={cardHeader}><span style={stepNum}>2</span><span style={stepTitle}>PAYMENT METHOD</span></div>
            <div style={innerPadding}>
                <div style={payGrid}>
                    <div style={payOption(method === 'Online')} onClick={() => setMethod('Online')}>
                        <span style={{fontSize:'24px'}}>💳</span><b style={{fontSize:'13px'}}>Online Payment</b><small style={{fontSize:'11px', color:'#64748b'}}>UPI, Cards</small>
                    </div>
                    {isWalletEnabled && (
                        <div style={payOption(method === 'Wallet', walletBalance < amount)} onClick={() => walletBalance >= amount && setMethod('Wallet')}>
                            <span style={{fontSize:'24px'}}>💰</span><b style={{fontSize:'13px'}}>RKD Wallet</b><small style={{fontSize:'11px', color:'#64748b'}}>₹{walletBalance}</small>
                        </div>
                    )}
                    <div style={payOption(method === 'COD')} onClick={() => setMethod('COD')}>
                        <span style={{fontSize:'24px'}}>🚚</span><b style={{fontSize:'13px'}}>Cash on Delivery</b><small style={{fontSize:'11px', color:'#64748b'}}>At your door</small>
                    </div>
                </div>
                <button
                    onClick={onProcess}
                    style={isMOVMet ? payBtn : payBtnDisabled}
                    disabled={loading || !isMOVMet}
                >
                    {loading ? "⏳ PROCESSING..." : `✓ PLACE ORDER (₹${amount})`}
                </button>
            </div>
        </div>
    );
};

const cardS = { background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' };
const cardHeader = { padding: '22px 28px', background: '#fff', borderBottom: '1px solid #f1f5f9', display:'flex', alignItems:'center', gap:'16px' };
const stepNum = { background: '#0f172a', color: '#fff', width:'38px', height:'38px', borderRadius: '12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize: '14px', fontWeight: '900' };
const stepTitle = { fontSize: '14px', fontWeight: '900', color: '#0f172a', letterSpacing: '0.8px' };
const innerPadding = { padding: '28px' };
const payGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '24px' };
const payBtn = { width: '100%', padding: '18px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', boxShadow:'0 6px 16px rgba(15,23,42,0.15)', transition: '0.3s' };
const payBtnDisabled = { ...payBtn, background: '#cbd5e1', cursor: 'not-allowed', boxShadow: 'none' };

export default PaymentSection;