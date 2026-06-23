import React from 'react';
import OrderCard from './OrderCard';

const AcceptedOrders = ({ orders, updateStatus, getStatusTheme, openInMaps }) => (
    <div style={grid}>
        {orders.map(o => (
            <OrderCard key={o._id} order={o} getStatusTheme={getStatusTheme} openInMaps={openInMaps}>
                <button onClick={() => updateStatus(o._id, 'Ready')} style={purpleBtn}>
                    📦 MARK AS READY FOR SHIPMENT
                </button>
            </OrderCard>
        ))}
    </div>
);
const grid = { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(310px, 1fr))', gap:'25px' };
const purpleBtn = { width: '100%', background: '#6d28d9', color: '#fff', border: 'none', padding: '15px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer' };
export default AcceptedOrders;