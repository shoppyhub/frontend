import React from 'react';

const OrderCard = ({ order, onDownload, onCancel, onHelp, getStatusStyle, themeColor }) => {
    const style = getStatusStyle(order.status);
    const isLive = ['Pending', 'Accepted', 'Ready', 'Out for Delivery'].includes(order.status);

    return (
        <div style={cardS}>
            <div style={headerS}>
                <div>
                    <small style={labelS}>ORDER REFERENCE</small>
                    <div style={idS}>#ORD-{order._id.toUpperCase().slice(-8)}</div>
                    <div style={{...sellerS, color: themeColor || '#2563eb'}}>🏪 {order.shopId?.shopDetails?.shopName}</div>
                </div>
                <div style={{textAlign:'right'}}>
                    <span style={{...badgeS, background: style.bg, color: style.col}}>
                        ● {order.status.toUpperCase()}
                    </span>
                    <div style={dateS}>{new Date(order.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}</div>
                </div>
            </div>

            <div style={itemsAreaS}>
                {order.items.map((item, i) => (
                    <div key={i} style={itemRowS}>
                        <span style={itemNameS}>{item.name} <small style={{color:'#94a3b8', fontWeight:'900'}}>x{item.quantity}</small></span>
                        <b style={{color:'#0f172a'}}>₹{(item.price * item.quantity).toLocaleString()}</b>
                    </div>
                ))}
            </div>

            {isLive && (
                <div style={otpBoxS(themeColor)}>
                    <div style={{flex: 1}}>
                        <small style={otpLabS}>SECURITY PROTOCOL ID</small>
                        <p style={otpHintS}>Share with agent only upon delivery.</p>
                    </div>
                    <div style={otpNumS}>{order.otp || '----'}</div>
                </div>
            )}

            <div style={footerS}>
                <div style={amountBoxS}>
                    <small style={labelS}>TOTAL PAYABLE</small>
                    <div style={amountS}>₹{order.totalAmount.toLocaleString()}</div>
                </div>
                
                <div style={btnGroupS}>
                    {order.status === 'Pending' && (
                        <button onClick={() => onCancel(order._id)} style={cancelBtnS}>Cancel</button>
                    )}
                    {order.status === 'Delivered' && (
                        <button onClick={() => onDownload(order)} style={invoiceBtnS(themeColor)}>Invoice</button>
                    )}
                    <button onClick={() => onHelp(order._id)} style={helpBtnS}>Support</button>
                </div>
            </div>
        </div>
    );
};

const cardS = { background: '#fff', borderRadius: '32px', padding: '25px', marginBottom: '25px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' };
const headerS = { display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #f8fafc', paddingBottom: '20px', marginBottom: '20px' };
const labelS = { fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' };
const idS = { fontSize: '16px', fontWeight: '900', color: '#0f172a', marginTop: '4px' };
const sellerS = { fontSize: '13px', fontWeight: '800', marginTop: '6px' };
const badgeS = { padding: '6px 14px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' };
const dateS = { fontSize: '11px', color: '#cbd5e1', marginTop: '8px', fontWeight: '800' };

const itemsAreaS = { marginBottom: '25px' };
const itemRowS = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #fcfdfe', fontSize: '14px' };
const itemNameS = { color: '#475569', fontWeight: '700' };

const otpBoxS = (color) => ({ 
    background: color ? `linear-gradient(135deg, ${color} 0%, #1e293b 100%)` : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
    padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', marginBottom: '25px', boxShadow:'0 10px 20px rgba(0,0,0,0.05)' 
});
const otpLabS = { fontSize:'9px', fontWeight:'900', color:'rgba(255,255,255,0.6)', letterSpacing:'1px' };
const otpHintS = { margin:0, fontSize:'12px', color:'#fff', fontWeight:'600' };
const otpNumS = { fontSize: '28px', fontWeight: '900', color: '#f1c40f', letterSpacing: '4px', marginLeft: '20px' };

const footerS = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '20px', borderRadius: '24px', flexWrap: 'wrap', gap: '15px' };
const amountBoxS = { display: 'flex', flexDirection: 'column' };
const amountS = { fontSize: '22px', fontWeight: '900', color: '#0f172a' };

const btnGroupS = { display: 'flex', gap: '10px' };
const invoiceBtnS = (color) => ({ background: color || '#0f172a', color: '#fff', border: 'none', padding: '12px 22px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '12px' });
const helpBtnS = { background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', padding: '12px 22px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '12px' };
const cancelBtnS = { background: '#fff1f2', color: '#f43f5e', border: 'none', padding: '12px 22px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '12px' };

export default OrderCard;