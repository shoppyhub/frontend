import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HomeHeader from '../../../components/Customer/HomeHeader';
import CategoryBar from '../../../components/Customer/CategoryBar';
import MobileBottomNav from '../../../components/Customer/MobileBottomNav';
import api from '../../../services/api'; 
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import { useBranding } from '../../../context/BrandingContext';

// --- Modular Sub-Components ---
import OrderCard from './OrderCard';

const CustomerOrders = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { settings } = useBranding(); 
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [downloadingId, setDownloadingId] = useState(null); // डाउनलोडिंग स्टेट
    
    const token = localStorage.getItem('token');

    // 1. 📡 Automatic Data Synchronization
    const fetchOrders = useCallback(async () => {
        if (!token) return navigate('/login');
        try {
            // बैकएंड का नया पाथ: /api/orders/my-orders
            const res = await api.get('/orders/my-orders');
            if (res.data.success) {
                setOrders(res.data.data || []);
            }
        } catch (err) { 
            console.error("Order Sync Error");
        } finally { 
            setLoading(false); 
        }
    }, [token, navigate]);

    // 2. ⚡ Real-time Socket & Window Focus Sync
    useEffect(() => {
        fetchOrders();
        
        // Socket Connection (प्रॉक्सी के साथ सिंक)
        const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
        const socket = io(socketUrl, { transports: ['websocket'] });

        if (user?.id) {
            socket.emit('join_shop', user.id);
            socket.on('order_status_updated', () => fetchOrders());
        }

        window.addEventListener('focus', fetchOrders);
        document.title = `My Orders | ${settings.siteName}`;

        return () => {
            socket.disconnect();
            window.removeEventListener('focus', fetchOrders);
        };
    }, [user?.id, fetchOrders, settings.siteName]);

    // 3. 📄 New Feature: Download PDF Invoice from Backend
    const handleDownloadInvoice = async (orderId) => {
        setDownloadingId(orderId);
        try {
            toast.info("Preparing your bill...");
            
            const response = await api.get(`/orders/invoice/${orderId}`, {
                responseType: 'blob', // PDF के लिए blob जरूरी है
            });

            // ब्राउज़र डाउनलोड लॉजिक
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `RKD_Invoice_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success("Invoice downloaded!");
        } catch (err) {
            toast.error("Could not download invoice. Try again later.");
        } finally {
            setDownloadingId(null);
        }
    };

    // 4. ❌ Cancellation Protocol
    const handleCancel = async (id) => {
        if (!window.confirm("CRITICAL: Terminate this order request?")) return;
        try {
            const res = await api.put(`/orders/status/${id}`, { 
                status: 'Cancelled', 
                rejectionReason: 'Terminated by User' 
            });
            if (res.data.success) {
                toast.success("Order request cancelled.");
                fetchOrders();
            }
        } catch (err) { toast.error("Cancellation protocol failed."); }
    };

    const getStatusStyle = (s) => {
        const styles = {
            'Delivered': { bg: '#ecfdf5', col: '#10b981' },
            'Pending': { bg: '#fffbeb', col: '#f59e0b' },
            'Ready': { bg: '#f5f3ff', col: '#7c3aed' },
            'Cancelled': { bg: '#fff1f2', col: '#f43f5e' }
        };
        return styles[s] || { bg: '#f8fafc', col: '#64748b' };
    };

    const filteredOrders = orders.filter(o => 
        filter === 'All' ? true : 
        (filter === 'Active' ? !['Delivered', 'Cancelled'].includes(o.status) : o.status === 'Delivered')
    );

    if (loading) return (
        <div style={loaderS}>
            <div style={{...spinnerS, borderTopColor: settings.themeColor || '#2563eb'}}></div>
            <p>Syncing Transaction History...</p>
        </div>
    );

    return (
        <div style={pageBgS}>
            <HomeHeader />
            <CategoryBar />
            
            <div style={containerS}>
                <div style={headerRowS}>
                    <div>
                        <h1 style={titleS}>Purchase Ledger</h1>
                        <p style={subS}>Hyperlocal transactions monitored by {settings.siteName}.</p>
                    </div>
                    
                    <div style={filterBarS}>
                        {['All', 'Active', 'Delivered'].map(f => (
                            <button 
                                key={f} 
                                onClick={() => setFilter(f)} 
                                style={filter === f ? activeF(settings.themeColor) : inactiveF}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div style={emptyS}>
                        <div style={{fontSize:'80px', marginBottom:'20px'}}>🛍️</div>
                        <h3 style={{color: '#0f172a'}}>No Purchase Records</h3>
                        <p>No transactions found matching your "{filter}" filter.</p>
                        <Link to="/" style={shopBtnS(settings.themeColor)}>Start Shopping Now</Link>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <OrderCard 
                            key={order._id} 
                            order={order} 
                            // ✅ अब यहाँ handleDownloadInvoice फंक्शन कॉल होगा
                            onDownload={() => handleDownloadInvoice(order._id)}
                            onCancel={handleCancel}
                            onHelp={(id) => navigate(`/support?orderId=${id}`)}
                            getStatusStyle={getStatusStyle}
                            themeColor={settings.themeColor}
                            isDownloading={downloadingId === order._id} // डाउनलोडिंग स्टेट पास की
                        />
                    ))
                )}
            </div>
            <MobileBottomNav />
        </div>
    );
};

// --- Responsive Styles ---
const pageBgS = { background: '#f8fafc', minHeight: '100vh', paddingBottom: '120px', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const containerS = { width: '94%', maxWidth: '800px', margin: '30px auto' };
const headerRowS = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'40px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin: 0, fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: '900', color: '#0f172a', letterSpacing: '-1.5px' };
const subS = { color: '#64748b', fontSize: '14px', marginTop: '5px', fontWeight: '500' };

const filterBarS = { display:'flex', background:'#fff', padding:'6px', borderRadius:'16px', border:'1px solid #f1f5f9', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)' };
const inactiveF = { padding:'10px 24px', border:'none', background:'none', color:'#94a3b8', fontWeight:'800', cursor:'pointer', fontSize:'12px', borderRadius:'12px', transition:'0.3s' };
const activeF = (color) => ({ ...inactiveF, background: color || '#0f172a', color:'#fff', boxShadow: `0 4px 12px ${color}33` });

const emptyS = { textAlign: 'center', padding: '100px 20px', background: '#fff', borderRadius: '40px', border:'1px solid #f1f5f9' };
const shopBtnS = (color) => ({ display: 'inline-block', marginTop: '25px', background: color || '#2563eb', color: '#fff', padding: '15px 40px', borderRadius: '15px', textDecoration: 'none', fontWeight: '900', fontSize:'14px', boxShadow: `0 10px 20px ${color}33` });

const loaderS = { height: '100vh', display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', fontWeight: '900', color: '#94a3b8', gap:'15px' };
const spinnerS = { width: '40px', height: '40px', border: '4px solid #f1f5f9', borderRadius: '50%', animation: 'spin 1s linear infinite' };

export default CustomerOrders;