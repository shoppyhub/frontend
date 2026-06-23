import React from 'react';
import OrderCard from './OrderCard';

const ReadyOrders = ({ orders, otpInputs, handleOtpChange, verifyAndDeliver, handlePhotoDelivery, uploadingId, getStatusTheme, openInMaps }) => (
    <div style={grid}>
        {orders.map(o => (
            <OrderCard key={o._id} order={o} getStatusTheme={getStatusTheme} openInMaps={openInMaps}>
                <div style={deliveryStack}>
                    <div style={otpRow}>
                        <input 
                            placeholder="4-Digit OTP" 
                            style={otpIn} 
                            maxLength="4" 
                            value={otpInputs[o._id] || ""}
                            onChange={(e) => handleOtpChange(o._id, e.target.value)} 
                        />
                        <button onClick={() => verifyAndDeliver(o._id)} style={verifyBtn}>VERIFY</button>
                    </div>
                    <div style={dividerS}><span>OR NO OTP?</span></div>
                    <label style={photoBtn}>
                        {uploadingId === o._id ? "📡 SYNCING PROOF..." : "📷 TAKE PHOTO PROOF"}
                        <input type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={(e) => handlePhotoDelivery(o._id, e)} />
                    </label>
                </div>
            </OrderCard>
        ))}
    </div>
);
const grid = { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(310px, 1fr))', gap:'25px' };
const deliveryStack = { display:'flex', flexDirection:'column', gap:'12px' };
const otpRow = { display:'flex', gap:'10px' };
const otpIn = { flex:1, padding:'14px', borderRadius:'12px', border:'2px solid #e2e8f0', textAlign:'center', fontWeight:'900', fontSize:'18px' };
const verifyBtn = { flex:1, background:'#10b981', color:'#fff', border:'none', borderRadius:'12px', fontWeight:'900', cursor:'pointer' };
const dividerS = { textAlign:'center', fontSize:'10px', color:'#cbd5e1', margin:'5px 0' };
const photoBtn = { display:'block', textAlign:'center', padding:'14px', borderRadius:'14px', border:'1.5px solid #2874f0', color:'#2874f0', fontWeight:'900', cursor:'pointer', fontSize:'12px' };
export default ReadyOrders;