import React from 'react';
import { useBranding } from '../../context/BrandingContext'; // Added for White-labeling

const PayoutLedger = ({ history }) => {
    const { settings } = useBranding();
    const themeColor = settings?.themeColor || '#0f172a';
    
    // 🎨 Logic: Mapping Status to Visual Themes (All Labels in English)
    const getStatusDetails = (status) => {
        switch (status) {
            case 'Settled': 
                return { color: '#10b981', bg: '#ecfdf5', label: 'SUCCESSFULLY SETTLED' };
            case 'Pending': 
                return { color: '#f59e0b', bg: '#fffbeb', label: 'AWAITING AUDIT' };
            case 'Processing': 
                return { color: '#3b82f6', bg: '#eff6ff', label: 'TRANSFER IN PROGRESS' };
            case 'Rejected': 
                return { color: '#ef4444', bg: '#fef2f2', label: 'REQUEST REJECTED' };
            default: 
                return { color: '#64748b', bg: '#f8fafc', label: status.toUpperCase() };
        }
    };

    return (
        <div style={ledgerWrapper}>
            {/* --- [A] LEDGER HEADER --- */}
            <div style={headerS}>
                <div>
                    <h4 style={titleS}>🏛️ Settlement Ledger</h4>
                    <p style={subS}>History of fund transfers to your bank.</p>
                </div>
                <span style={countBadge(themeColor)}>{history.length} Records</span>
            </div>

            {/* --- [B] DYNAMIC TRANSACTION LIST --- */}
            <div className="custom-scroll" style={scrollArea}>
                {history.length === 0 ? (
                    <div style={emptyS}>
                        <div style={{fontSize:'40px', marginBottom:'15px'}}>📋</div>
                        <p style={{margin:0}}>No settlement requests found in registry.</p>
                    </div>
                ) : (
                    [...history].reverse().map((item, i) => {
                        const style = getStatusDetails(item.status);
                        return (
                            <div key={i} style={rowS}>
                                <div style={{ flex: 1 }}>
                                    <div style={dateS}>
                                        {new Date(item.date || item.createdAt).toLocaleDateString('en-GB', { 
                                            day: '2-digit', month: 'short', year: 'numeric' 
                                        })}
                                    </div>
                                    <div style={statusBadge(style.bg, style.color)}>
                                        {style.label}
                                    </div>
                                    
                                    {/* Transaction Reference Number */}
                                    {item.utr && (
                                        <div style={utrBox}>
                                            REF_ID: <b style={{color:'#1e293b'}}>{item.utr}</b>
                                        </div>
                                    )}

                                    {/* Error/Rejection Logic */}
                                    {item.status === 'Rejected' && item.reason && (
                                        <div style={rejectReason}>
                                            Reason: {item.reason}
                                        </div>
                                    )}
                                </div>

                                <div style={amountSection}>
                                    <div style={amtS}>₹{item.amount.toLocaleString('en-IN')}</div>
                                    <small style={feeNote}>NET DISPATCH</small>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            {/* --- [C] COMPLIANCE FOOTNOTE --- */}
            <div style={footerNote}>
                ℹ️ <b>Security Protocol:</b> Settlement assets are typically synchronized with your primary bank node within 24-48 business hours.
            </div>

            <style>{`
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-track { background: #f8fafc; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Definitions ---

const ledgerWrapper = { 
    background: '#fff', 
    padding: window.innerWidth < 768 ? '20px' : '30px', 
    borderRadius: '35px', 
    border: '1px solid #f1f5f9', 
    boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    animation: 'fadeIn 0.5s ease'
};

const headerS = { 
    display:'flex', 
    justifyContent:'space-between', 
    alignItems:'center', 
    marginBottom: '25px',
    paddingBottom: '20px',
    borderBottom: '1.5px solid #f8fafc'
};

const titleS = { margin: 0, fontSize: '15px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1px' };
const subS = { margin: '4px 0 0', fontSize: '11px', color: '#94a3b8', fontWeight: '600' };
const countBadge = (color) => ({ background: `${color}10`, color: color, padding: '5px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: '900' });

const scrollArea = { flex: 1, overflowY: 'auto', maxHeight: '450px', paddingRight: '8px' };

const rowS = { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    padding: '20px 0', 
    borderBottom: '1px solid #f8fafc',
    transition: '0.2s'
};

const dateS = { fontWeight: '800', color: '#1e293b', fontSize: '14px', marginBottom: '8px' };

const statusBadge = (bg, col) => ({
    display: 'inline-block',
    padding: '5px 12px',
    borderRadius: '8px',
    background: bg,
    color: col,
    fontSize: '9px',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
});

const utrBox = { marginTop: '10px', fontSize: '11px', color: '#64748b', fontWeight: '700', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', display: 'inline-block' };
const rejectReason = { marginTop: '10px', fontSize: '11px', color: '#f43f5e', background: '#fff1f2', padding: '8px 12px', borderRadius: '10px', fontWeight: '700', border: '1px solid #fee2e2' };

const amountSection = { textAlign: 'right' };
const amtS = { fontWeight: '900', color: '#0f172a', fontSize: '20px', letterSpacing: '-1px' };
const feeNote = { fontSize: '9px', color: '#cbd5e1', fontWeight: '900', textTransform: 'uppercase', letterSpacing:'0.5px', marginTop:'4px', display:'block' };

const emptyS = { textAlign: 'center', padding: '80px 20px', color: '#cbd5e1', fontSize: '14px', fontWeight: '700', lineHeight: '1.6' };
const footerNote = { marginTop: '25px', padding: '18px', background: '#f8fafc', borderRadius: '20px', fontSize: '11px', color: '#94a3b8', lineHeight: '1.6', fontWeight: '600', border: '1px solid #f1f5f9' };

export default PayoutLedger;