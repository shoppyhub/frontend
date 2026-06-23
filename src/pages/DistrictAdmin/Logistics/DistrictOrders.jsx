import React, { useState, useEffect } from 'react';
import api from '../../../services/api'; 
import { useBranding } from '../../../context/BrandingContext';

/**
 * RKD MART - DISTRICT LOGISTICS MONITORING
 * जिले के सभी आर्डर्स की लाइव ट्रैकिंग
 */
const DistrictOrders = () => {
    const { settings } = useBranding();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const themeColor = settings?.themeColor || '#0d9488';

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // यह एंडपॉइंट जिले के सभी आर्डर्स लाएगा (Backend Auth के आधार पर)
                const res = await api.get('/admin/orders');
                if (res.data.success) {
                    setOrders(res.data.data || []);
                }
            } catch (err) {
                console.error("Order Pulse Sync Error");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const StatusBadge = ({ status }) => {
        const colors = { 
            'Delivered': '#10b981', 
            'Pending': '#f59e0b', 
            'In-Transit': '#3b82f6', 
            'Cancelled': '#ef4444' 
        };
        const color = colors[status] || '#64748b';
        return (
            <span style={{
                background: `${color}15`, 
                color: color, 
                padding: '6px 12px', 
                borderRadius: '8px', 
                fontSize: '10px', 
                fontWeight: '900',
                border: `1px solid ${color}30`
            }}>
                {status?.toUpperCase() || 'UNKNOWN'}
            </span>
        );
    };

    if (loading) return (
        <div style={{padding:'100px', textAlign:'center'}}>
            <div className="spinner-pro" style={{borderTopColor: themeColor, width:'30px', height:'30px', border:'3px solid #f1f5f9', borderRadius:'50%', display:'inline-block'}}></div>
            <p style={{marginTop:'15px', color:'#94a3b8', fontWeight:'800', fontSize:'11px'}}>SYNCING LOGISTICS NODES...</p>
        </div>
    );

    return (
        <div style={cardS} className="fade-in">
            <div style={header}>
                <div>
                    <h2 style={title}>📦 District Order Pipeline</h2>
                    <p style={subTitle}>Live monitoring of hyperlocal trade across the district.</p>
                </div>
                <div style={filterBox}>
                    <input type="text" placeholder="Search by Hub or Order ID..." style={inS} />
                </div>
            </div>

            <div style={tableWrap}>
                <table style={tableS}>
                    <thead>
                        <tr style={thRow}>
                            <th style={thS}>ORDER ID</th>
                            <th style={thS}>MERCHANT HUB</th>
                            <th style={thS}>CUSTOMER NODE</th>
                            <th style={thS}>TOTAL AMOUNT</th>
                            <th style={thS}>LOGISTICS STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr><td colSpan="5" style={empty}>No active logistic nodes discovered in this district.</td></tr>
                        ) : (
                            orders.map(o => (
                                <tr key={o._id} style={trS}>
                                    <td style={tdS}>
                                        <b style={{color: themeColor}}>#{o.orderId || o._id?.slice(-8).toUpperCase()}</b>
                                        <div style={{fontSize:'9px', color:'#94a3b8'}}>{new Date(o.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td style={tdS}>
                                        <div style={hubName}>{o.shopId?.shopDetails?.shopName || 'N/A'}</div>
                                        <small style={{color:'#64748b'}}>{o.shopId?.shopBlock || 'General Block'}</small>
                                    </td>
                                    <td style={tdS}>
                                        <div style={custName}>{o.customerId?.fullName || 'Guest Customer'}</div>
                                        <small style={{color:'#94a3b8'}}>{o.customerDetails?.mobile || '---'}</small>
                                    </td>
                                    <td style={tdS}>
                                        <b style={{fontSize:'15px'}}>₹{o.totalAmount.toLocaleString()}</b>
                                    </td>
                                    <td style={tdS}>
                                        <StatusBadge status={o.status} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spinner-pro { animation: spin 1s linear infinite; }
                .fade-in { animation: fadeIn 0.5s ease; }
            `}</style>
        </div>
    );
};

// --- Strategic SaaS Styles ---
const cardS = { background: '#fff', padding: '30px', borderRadius: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', flexWrap: 'wrap', gap: '20px' };
const title = { margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' };
const subTitle = { margin: '5px 0 0 0', fontSize: '13px', color: '#64748b' };
const filterBox = { width: window.innerWidth < 600 ? '100%' : '350px' };
const inS = { width: '100%', padding: '14px 20px', borderRadius: '14px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '14px', fontWeight: '600', background:'#fcfdfe' };
const tableWrap = { overflowX: 'auto' };
const tableS = { width: '100%', borderCollapse: 'collapse', minWidth: '900px' };
const thRow = { textAlign: 'left', background: '#f8fafc', borderBottom: '2px solid #f1f5f9' };
const thS = { padding: '18px 20px', fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' };
const trS = { borderBottom: '1px solid #f8fafc', transition: '0.2s' };
const tdS = { padding: '20px', fontSize: '14px', verticalAlign: 'middle' };
const hubName = { fontWeight: '800', color: '#1e293b' };
const custName = { fontWeight: '700', color: '#475569' };
const empty = { textAlign: 'center', padding: '80px', color: '#94a3b8', fontWeight: '700', fontSize: '15px' };

export default DistrictOrders;