import React from 'react';
import { useBranding } from '../../context/BrandingContext'; 

const OrderCard = ({ 
    order, 
    onUpdateStatus, 
    onVerifyOtp, 
    onPhotoUpload, 
    onDownloadInvoice, // ✅ नया प्रॉप प्राप्त हुआ
    otpValue, 
    onOtpChange, 
    isUploading,
    isDownloading      // ✅ डाउनलोडिंग स्टेट
}) => {
    const { settings } = useBranding();
    const themeColor = settings?.themeColor || '#0f172a';

    // 🎨 Logic: Dynamic Status Theming
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return { bg: '#fff7ed', color: '#c2410c', label: 'NEW REQUEST' };
            case 'Accepted': return { bg: '#eff6ff', color: '#1d4ed8', label: 'ACCEPTED' };
            case 'Ready': return { bg: '#f5f3ff', color: '#6d28d9', label: 'READY FOR PICKUP' };
            case 'Delivered': return { bg: '#ecfdf5', color: '#15803d', label: 'DELIVERED' };
            case 'Cancelled': return { bg: '#fef2f2', color: '#991b1b', label: 'CANCELLED' };
            default: return { bg: '#f8fafc', color: '#64748b', label: status.toUpperCase() };
        }
    };

    const theme = getStatusStyle(order.status);
    const hasGPS = order.customerDetails?.locationCoords?.lat;

    // Command: Open Logistics Map
    const openInMaps = () => {
        const details = order.customerDetails;
        let url = hasGPS 
            ? `https://www.google.com/maps?q=${details.locationCoords.lat},${details.locationCoords.lng}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(details.fullAddress)}`;
        window.open(url, '_blank');
    };

    return (
        <div style={cardS}>
            {/* --- [1] NODE HEADER --- */}
            <div style={cardTop}>
                <div style={{ flex: 1 }}>
                    <div style={idHeaderRow}>
                        <div style={idTag}>#ORD-{order.orderId || order._id.slice(-6).toUpperCase()}</div>
                        
                        {/* ✅ DOWNLOAD INVOICE BUTTON (नया फंक्शन यहाँ जोड़ा गया है) */}
                        {order.status !== 'Cancelled' && (
                            <button 
                                onClick={() => onDownloadInvoice(order._id)} 
                                style={downloadBtnS(isDownloading)}
                                disabled={isDownloading}
                                title="Download Bill"
                            >
                                {isDownloading ? "..." : "📄"}
                            </button>
                        )}
                    </div>
                    <small style={dateS}>
                        {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date(order.createdAt).toLocaleDateString('en-GB')}
                    </small>
                </div>
                <span style={{ ...statusBadge, background: theme.bg, color: theme.color }}>
                    ● {theme.label}
                </span>
            </div>

            {/* --- [2] CUSTOMER NODE INFO WITH COMPLETE ADDRESS --- */}
            <div style={custBox}>
                <div style={{fontWeight:'900', color:'#0f172a', fontSize:'15px'}}>👤 {order.customerDetails?.name}</div>
                <div style={{fontSize:'12px', color:'#64748b', marginTop:'4px'}}>📱 {order.customerDetails?.mobile}</div>
                
                <div style={{background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'12px', padding:'12px', marginTop:'12px'}}>
                    <div style={{fontSize:'11px', fontWeight:'700', color:'#64748b', textTransform:'uppercase', marginBottom:'8px'}}>📍 Delivery Address</div>
                    <div style={{fontSize:'13px', fontWeight:'600', color:'#1e293b', lineHeight:'1.6'}}>
                        {order.customerDetails?.address}
                    </div>
                    <div style={{fontSize:'12px', color:'#64748b', marginTop:'8px'}}>
                        📍 {order.customerDetails?.locality && `${order.customerDetails.locality}, `}{order.customerDetails?.district && `${order.customerDetails.district}, `}{order.customerDetails?.state}
                    </div>
                    <div style={{fontSize:'12px', fontWeight:'700', color:'#0f172a', marginTop:'6px'}}>🔑 PIN: {order.customerDetails?.pinCode}</div>
                </div>
                
                <div style={contactRow}>
                    <button onClick={openInMaps} style={hasGPS ? mapBtnGPS(themeColor) : mapBtnNormal}>
                        {hasGPS ? "🛰️ GPS TRACK" : "📍 FIND ON MAP"}
                    </button>
                    <a href={`tel:${order.customerDetails?.mobile}`} style={callBtn}>📞 CALL</a>
                </div>
            </div>

            {/* --- [3] ASSET MANIFEST (Items with Images) --- */}
            <div style={itemManifest}>
                {order.items.map((item, i) => (
                    <div key={i} style={manifestRow}>
                        <div style={{display:'flex', gap:'12px', alignItems:'flex-start', flex:1}}>
                            {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.name} style={productThumb} />
                            )}
                            <div style={{flex:1}}>
                                <div style={itemNameS}>{item.name} <small style={{color:'#94a3b8', fontWeight:'800'}}>x{item.quantity}</small></div>
                                <small style={{color:'#94a3b8', fontSize:'12px'}}>₹{item.price} each</small>
                            </div>
                        </div>
                        <b style={{color:'#1e293b'}}>₹{(item.price * item.quantity).toLocaleString()}</b>
                    </div>
                ))}
            </div>

            {/* --- [4] SETTLEMENT DATA --- */}
            <div style={settlementRow}>
                <div style={billRow}>
                    <span style={payLabel}>GROSS REVENUE:</span>
                    <b style={{color:'#0f172a'}}>₹{order.totalAmount.toLocaleString()}</b>
                </div>
                <div style={billRow}>
                    <span style={payLabel}>NET EARNINGS:</span>
                    <b style={{color:'#10b981'}}>₹{order.netToMerchant?.toLocaleString()}</b>
                </div>
                <div style={paymentTag}>Protocol: {order.paymentMethod} • {order.paymentStatus?.toUpperCase()}</div>
            </div>

            {/* --- [5] DYNAMIC OPERATIONAL CONTROLS --- */}
            <div style={actionArea}>
                
                {/* NEW ORDER PROTOCOL */}
                {order.status === 'Pending' && (
                    <div style={btnGrid}>
                        <button onClick={() => onUpdateStatus(order._id, 'Accepted')} style={acceptBtn(themeColor)}>ACCEPT ORDER</button>
                        <button onClick={() => onUpdateStatus(order._id, 'Cancelled')} style={cancelBtn}>REJECT</button>
                    </div>
                )}

                {/* ACCEPTED PROTOCOL */}
                {order.status === 'Accepted' && (
                    <button onClick={() => onUpdateStatus(order._id, 'Ready')} style={readyBtn(themeColor)}>MARK AS READY FOR PICKUP</button>
                )}

                {/* VERIFICATION PROTOCOL (OTP/PHOTO) */}
                {order.status === 'Ready' && (
                    <div style={verifyBox}>
                        <div style={verifyTitle}>🔐 DELIVERY AUTHENTICATION</div>
                        
                        <div style={otpRow}>
                            <input 
                                type="text" 
                                placeholder="4-DIGIT OTP" 
                                maxLength="4"
                                value={otpValue}
                                onChange={(e) => onOtpChange(e.target.value)}
                                style={otpIn}
                            />
                            <button onClick={() => onVerifyOtp(order._id)} style={verifyBtn(themeColor)}>VERIFY</button>
                        </div>

                        <div style={divider}>OR USE VISUAL PROOF</div>

                        <label style={isUploading ? photoBtnDisabled : photoBtn}>
                            {isUploading ? "SYNCING MEDIA..." : "📸 TAKE PHOTO & DELIVER"}
                            <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => onPhotoUpload(order._id, e)} disabled={isUploading} />
                        </label>
                    </div>
                )}

                {/* ARCHIVED STATUS */}
                {(order.status === 'Delivered' || order.status === 'Cancelled') && (
                    <div style={statusNote(order.status)}>
                        {order.status === 'Delivered' ? "✅ Transaction Successfully Completed" : `❌ Reason: ${order.rejectionReason || 'Policy Violation'}`}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Updated Styles Node ---

const cardS = { background: '#fff', borderRadius: '32px', border: '1px solid #f1f5f9', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', transition: '0.3s' };
const cardTop = { display: 'flex', justifyContent: 'space-between', marginBottom: '22px', alignItems: 'flex-start' };
const idHeaderRow = { display: 'flex', alignItems: 'center', gap: '10px' }; // ID और डाउनलोड बटन साथ में
const idTag = { fontSize: '15px', fontWeight: '900', color: '#0f172a', letterSpacing: '0.5px' };

const downloadBtnS = (loading) => ({
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    transition: '0.2s',
    opacity: loading ? 0.5 : 1
});

const dateS = { color: '#94a3b8', fontWeight: '800', fontSize: '10px', display: 'block', marginTop: '4px', textTransform:'uppercase' };
const statusBadge = { padding: '6px 14px', borderRadius: '12px', fontSize: '9px', fontWeight: '900', letterSpacing:'0.5px' };

const custBox = { padding: '18px', background: '#f8fafc', borderRadius: '22px', marginBottom: '18px', border: '1px solid #f1f5f9' };
const addrS = { fontSize: '13px', color: '#64748b', marginTop: '8px', lineHeight: '1.6', fontWeight: '600' };

const contactRow = { display:'flex', gap:'12px', marginTop:'15px' };
const mapBtnNormal = { flex: 2, padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: '900', fontSize: '11px', cursor: 'pointer' };
const mapBtnGPS = (color) => ({ ...mapBtnNormal, background: color, color: '#fff', border: 'none', boxShadow: `0 4px 10px ${color}33` });
const callBtn = { flex: 1, padding: '12px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981', textDecoration: 'none', textAlign: 'center', fontSize: '11px', fontWeight: '900', border: '1.5px solid #d1fae5' };

const itemManifest = { borderTop: '1.5px dashed #f1f5f9', paddingTop: '18px', marginBottom: '18px' };
const manifestRow = { display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px', color: '#475569', alignItems: 'center' };
const itemNameS = { fontWeight: '700', color: '#1e293b' };
const productThumb = { width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #e2e8f0' };

const settlementRow = { padding: '18px', background: '#ecfdf5', borderRadius: '22px', marginBottom: '25px', border: '1px solid #d1fae5' };
const billRow = { display:'flex', justifyContent:'space-between', marginBottom:'6px' };
const payLabel = { fontSize: '10px', fontWeight: '900', color: '#065f46', textTransform: 'uppercase', letterSpacing:'0.5px' };
const paymentTag = { fontSize: '10px', fontWeight: '900', color: '#10b981', marginTop: '12px', opacity: 0.8, textTransform:'uppercase' };

const actionArea = { marginTop: 'auto' };
const btnGrid = { display: 'flex', gap: '12px' };
const acceptBtn = (color) => ({ flex: 2, padding: '16px', borderRadius: '15px', border: 'none', background: color, color: '#fff', fontWeight: '900', cursor: 'pointer', fontSize: '12px', boxShadow: `0 8px 15px ${color}33` });
const cancelBtn = { flex: 1, padding: '16px', borderRadius: '15px', border: '1.5px solid #fecaca', background: '#fff', color: '#f43f5e', fontWeight: '900', cursor: 'pointer', fontSize: '12px' };
const readyBtn = (color) => ({ width: '100%', padding: '16px', borderRadius: '15px', border: 'none', background: color, color: '#fff', fontWeight: '900', cursor: 'pointer', fontSize: '12px', boxShadow: `0 8px 15px ${color}33` });

const verifyBox = { background: '#f5f3ff', padding: '20px', borderRadius: '24px', border: '1.5px solid #ddd6fe' };
const verifyTitle = { fontSize:'11px', fontWeight:'900', marginBottom:'12px', color:'#6d28d9', textAlign:'center', letterSpacing:'1px' };
const otpRow = { display: 'flex', gap: '12px' };
const otpIn = { flex: 1, padding: '14px', borderRadius: '12px', border: '2.5px solid #ddd6fe', textAlign: 'center', fontSize: '18px', fontWeight: '900', letterSpacing: '6px', outline: 'none', color:'#6d28d9' };
const verifyBtn = (color) => ({ padding: '0 25px', borderRadius: '12px', border: 'none', background: color, color: '#fff', fontWeight: '900', cursor: 'pointer' });
const divider = { textAlign: 'center', margin: '15px 0', fontSize: '10px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', letterSpacing:'1.5px' };
const photoBtn = { display: 'block', width: '100%', padding: '15px', borderRadius: '12px', background: '#fff', border: '2px dashed #6d28d9', color: '#6d28d9', textAlign: 'center', fontWeight: '900', fontSize: '12px', cursor: 'pointer' };
const photoBtnDisabled = { ...photoBtn, opacity: 0.5, cursor: 'not-allowed', borderStyle:'solid', background:'#f1f5f9' };

const statusNote = (s) => ({ textAlign: 'center', padding: '15px', borderRadius: '16px', background: s === 'Delivered' ? '#ecfdf5' : '#fff1f2', color: s === 'Delivered' ? '#10b981' : '#f43f5e', fontSize: '13px', fontWeight: '800', border: `1px solid ${s === 'Delivered' ? '#d1fae5' : '#fee2e2'}` });

export default OrderCard;