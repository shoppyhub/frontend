import React from 'react';
import OrderCard from './OrderCard';

const PendingOrders = ({ orders, updateStatus, getStatusTheme, openInMaps }) => (
    <div style={grid}>
        {orders.map(o => (
            <OrderCard key={o._id} order={o} getStatusTheme={getStatusTheme} openInMaps={openInMaps}>
                <div style={{display:'flex', gap:'10px'}}>
                    <button onClick={() => updateStatus(o._id, 'Accepted')} style={primaryBtn}>ACCEPT</button>
                    <button onClick={() => updateStatus(o._id, 'Cancelled')} style={dangerBtn}>REJECT</button>
                </div>
            </OrderCard>
        ))}
    </div>
);
const grid = { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(310px, 1fr))', gap:'25px' };
const primaryBtn = { flex: 2, background: '#0f172a', color: '#fff', border: 'none', padding: '15px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer' };
const dangerBtn = { flex: 1, background: '#fef2f2', color: '#ef4444', border: 'none', padding: '15px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer' };
export default PendingOrders;