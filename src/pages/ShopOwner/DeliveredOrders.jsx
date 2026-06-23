import React from 'react';
import OrderCard from './OrderCard';

const DeliveredOrders = ({ orders, getStatusTheme, openInMaps }) => (
    <div style={grid}>
        {orders.map(o => (
            <OrderCard key={o._id} order={o} getStatusTheme={getStatusTheme} openInMaps={openInMaps}>
                <div style={successBox}>
                    <div style={successTag}>✅ SUCCESSFULLY DELIVERED</div>
                    <small style={{display:'block', marginTop:'5px'}}>Time: {new Date(o.deliveredAt).toLocaleString()}</small>
                    {o.isManualVerified && <div style={manualTag}>Verified via Photo Proof</div>}
                </div>
            </OrderCard>
        ))}
    </div>
);
const grid = { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(310px, 1fr))', gap:'25px' };
const successBox = { padding:'15px', background:'#f0fdf4', borderRadius:'15px', textAlign:'center' };
const successTag = { color:'#10b981', fontWeight:'900', fontSize:'12px' };
const manualTag = { fontSize:'10px', color:'#f59e0b', fontWeight:'800', marginTop:'5px' };
export default DeliveredOrders;