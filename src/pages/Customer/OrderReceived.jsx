import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import HomeHeader from '../../components/Customer/HomeHeader';
import MobileBottomNav from '../../components/Customer/MobileBottomNav';

const OrderReceived = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [siteName] = useState(localStorage.getItem('siteName') || "RKD MART");

    return (
        <div style={pageBgS}>
            <HomeHeader />
            <div style={containerS}>
                <div style={successCardS}>
                    <div style={iconCircleS}>✅</div>
                    <h1 style={titleS}>Order Received!</h1>
                    <p style={subTextS}>
                        Thank you for shopping with <b>{siteName}</b>. Your order has been successfully placed and is being processed by the merchant hub.
                    </p>

                    <div style={orderBoxS}>
                        <small style={labelS}>YOUR ORDER ID</small>
                        <div style={idValS}>#ORD-{id?.slice(-8).toUpperCase()}</div>
                    </div>

                    <div style={infoGridS}>
                        <div style={infoItemS}>
                            <span>📅 Status</span>
                            <b>Confirmed</b>
                        </div>
                        <div style={infoItemS}>
                            <span>🚚 Delivery</span>
                            <b>Hyperlocal Express</b>
                        </div>
                    </div>

                    <div style={btnGroupS}>
                        <button onClick={() => navigate('/my-orders')} style={primaryBtnS}>Track Order Status</button>
                        <Link to="/" style={secondaryBtnS}>Continue Shopping</Link>
                    </div>
                </div>

                <div style={safetyNoteS}>
                    🛡️ A confirmation SMS and Email has been dispatched to your registered node.
                </div>
            </div>
            <MobileBottomNav />
        </div>
    );
};

// --- Professional Styles ---
const pageBgS = { background: '#f8fafc', minHeight: '100vh', paddingBottom: '100px', fontFamily: "'Inter', sans-serif" };
const containerS = { width: '92%', maxWidth: '500px', margin: '40px auto', textAlign: 'center' };
const successCardS = { background: '#fff', padding: '45px 30px', borderRadius: '40px', border: '1px solid #eef2f6', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' };
const iconCircleS = { width: '80px', height: '80px', background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 25px' };
const titleS = { fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: '0 0 10px 0' };
const subTextS = { color: '#64748b', fontSize: '14px', lineHeight: '1.6', margin: 0 };
const orderBoxS = { margin: '30px 0', padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px dashed #cbd5e1' };
const labelS = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px' };
const idValS = { fontSize: '22px', fontWeight: '900', color: '#1e293b', marginTop: '5px' };
const infoGridS = { display: 'flex', gap: '15px', marginBottom: '35px' };
const infoItemS = { flex: 1, padding: '15px', background: '#f1f5f9', borderRadius: '15px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '5px' };
const primaryBtnS = { width: '100%', padding: '18px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '18px', fontWeight: '800', cursor: 'pointer', fontSize: '14px', marginBottom: '15px' };
const secondaryBtnS = { display: 'block', textDecoration: 'none', color: '#64748b', fontSize: '14px', fontWeight: '700' };
const safetyNoteS = { marginTop: '25px', color: '#cbd5e1', fontSize: '11px', fontWeight: '600' };

export default OrderReceived;