import React from 'react';

const OrderSummary = ({ cart, cartTotal, discount, delivery, final, isMOVMet, minVal, brandName, themeColor }) => {
    return (
        <div style={rightCol}>
            <div style={priceCard}>
                <h4 style={priceHead}>💳 ORDER SUMMARY</h4>
                <div style={itemScroll}>
                    {cart.map(item => (
                        <div key={item._id} style={itemRow}>
                            <span style={{flex:1, fontSize:'13px'}}>{item.name} <small style={{fontSize:'11px', color:'#94a3b8'}}>x{item.quantity}</small></span>
                            <b style={{fontSize:'13px'}}>₹{item.price * item.quantity}</b>
                        </div>
                    ))}
                </div>
                <hr style={sep}/>
                <div style={billRow}><span>Subtotal</span><span>₹{cartTotal}</span></div>
                {discount > 0 && <div style={billRow}><span>Discount</span><span style={{color:'#10b981', fontWeight:'700'}}>- ₹{discount}</span></div>}
                <div style={billRow}><span>Delivery</span><span style={{color: delivery === 0 ? '#10b981' : '#1e293b', fontWeight:'700'}}>{delivery === 0 ? '✓ FREE' : `₹${delivery}`}</span></div>
                <hr style={sep}/>
                <div style={grandRow}><span>Total</span><span>₹{final}</span></div>

                {!isMOVMet && (
                    <div style={movError}>
                        ⚠️ Add ₹{minVal - cartTotal} more to checkout
                    </div>
                )}
            </div>
            <div style={trustBox}>🛡️ {brandName || 'Secure Checkout'}</div>
        </div>
    );
};

const rightCol = { position: 'sticky', top: '20px', height: 'fit-content' };
const priceCard = { background: '#fff', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' };
const priceHead = { margin: '0 0 22px 0', fontSize: '12px', fontWeight: '900', color: '#0f172a', letterSpacing: '0.8px' };
const itemScroll = { maxHeight:'160px', overflowY:'auto', marginBottom:'16px', paddingRight: '8px' };
const itemRow = { display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#475569', marginBottom:'10px', fontWeight: '500' };
const billRow = { display: 'flex', justifyContent: 'space-between', marginBottom: '13px', fontSize: '13px', fontWeight: '600', color: '#475569' };
const sep = { border: 'none', borderBottom: '1px solid #f1f5f9', margin: '14px 0' };
const grandRow = { display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '900', color: '#0f172a' };
const movError = { marginTop: '18px', padding: '12px 14px', background: '#fff1f2', color: '#e11d48', borderRadius: '12px', fontSize: '12px', fontWeight: '700', textAlign: 'center' };
const trustBox = { textAlign:'center', marginTop:'18px', fontSize:'11px', color:'#cbd5e1', fontWeight:'800', textTransform:'uppercase', letterSpacing: '0.5px' };

export default OrderSummary;