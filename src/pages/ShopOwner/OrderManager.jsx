import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import { useBranding } from '../../context/BrandingContext'; 
import { useAuth } from '../../context/AuthContext';

// --- Sub-Components ---
import OrderCard from './OrderCard'; 

const OrderManager = () => {
    const { settings } = useBranding();
    const { user: authUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState("");
    const [otpInputs, setOtpInputs] = useState({});
    const [uploadingId, setUploadingId] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null); // डाउनलोडिंग स्टेट के लिए
    const socket = useRef(null);

    // 1. 📡 Automatic Data Synchronization Protocol
    const fetchOrders = useCallback(async () => {
        try {
            // बैकएंड का नया पाथ: /api/orders/shop-orders
            const res = await api.get('/orders/shop-orders');
            if (res.data.success) {
                setOrders(res.data.data || []);
            }
            document.title = `Orders Console | ${settings.siteName}`;
        } catch (err) {
            console.error("Order registry sync failure.");
        } finally {
            setLoading(false);
        }
    }, [settings.siteName]);

    // 2. ⚡ Real-time Socket & Window Focus Integration
    useEffect(() => {
        fetchOrders();

        // Socket Connection (नए WebSocket प्रॉक्सी के साथ सिंक)
        const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
        socket.current = io(socketUrl, { transports: ['websocket'] });

        if (authUser?.id) {
            socket.current.emit('join_shop', authUser.id);
            socket.current.on('new_order_received', () => {
                toast.info("Notification: New inbound order request!");
                fetchOrders(); 
            });
            socket.current.on('order_status_updated', () => fetchOrders());
        }

        window.addEventListener('focus', fetchOrders);

        return () => {
            if (socket.current) socket.current.disconnect();
            window.removeEventListener('focus', fetchOrders);
        };
    }, [fetchOrders, authUser?.id]);

    // 3. 🔄 Operation: Status Transition
    const handleStatusUpdate = async (orderId, newStatus) => {
        let payload = { status: newStatus };

        if (newStatus === 'Cancelled') {
            const reason = window.prompt("Security Protocol: Specify cancellation reason:");
            if (!reason) return;
            payload.rejectionReason = reason;
        }

        try {
            const res = await api.put(`/orders/status/${orderId}`, payload);
            if (res.data.success) {
                toast.success(`Protocol Success: Order moved to ${newStatus}.`);
                fetchOrders();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Operational update failed.");
        }
    };

    // 4. 📄 New Feature: Download PDF Invoice
    const handleDownloadInvoice = async (orderId) => {
        setDownloadingId(orderId);
        try {
            toast.info("Generating Secure Invoice...");
            
            const response = await api.get(`/orders/invoice/${orderId}`, {
                responseType: 'blob', // PDF के लिए blob जरूरी है
            });

            // ब्राउज़र में डाउनलोड ट्रिगर करना
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `RKD_Invoice_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            
            // क्लीनअप
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success("Invoice successfully downloaded.");
        } catch (err) {
            console.error(err);
            toast.error("Handshake Error: Could not generate bill.");
        } finally {
            setDownloadingId(null);
        }
    };

    // 5. 🔑 Secure Delivery: OTP Verification
    const verifyAndDeliver = async (orderId) => {
        const otp = otpInputs[orderId];
        if (!otp || otp.length !== 4) {
            return toast.warning("Protocol Alert: 4-digit security key required.");
        }

        try {
            const res = await api.put(`/orders/status/${orderId}`, { 
                status: 'Delivered', 
                inputOtp: otp,
                isManualBypass: false 
            });
            if (res.data.success) {
                toast.success("Identity Verified. Transaction Settlement Complete! 🎉");
                fetchOrders();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid Security Key.");
        }
    };

    // 6. 📸 Visual Proof: Manual Delivery Bypass
    const handlePhotoDelivery = async (orderId, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            setUploadingId(orderId);
            try {
                const res = await api.put(`/orders/status/${orderId}`, {
                    status: 'Delivered',
                    deliveryImage: reader.result,
                    isManualBypass: true
                });
                if (res.data.success) {
                    toast.success("Visual proof accepted. Hub successfully cleared.");
                    fetchOrders();
                }
            } catch (err) {
                toast.error("Cloud upload failed.");
            } finally {
                setUploadingId(null);
            }
        };
    };

    // 7. Discovery & Filtering Engine
    const filteredOrders = orders.filter(o => {
        const matchesFilter = filter === 'All' ? true : o.status === filter;
        const matchesSearch = 
            (o.orderId && o.orderId.toLowerCase().includes(searchTerm.toLowerCase())) || 
            (o.customerDetails?.name && o.customerDetails.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Connecting to Order Registry...</p>
        </div>
    );

    return (
        <div style={pageContainer}>
            {/* --- [A] DYNAMIC COMMAND TOOLBAR --- */}
            <div style={toolbarRow}>
                <div>
                    <h2 style={titleS}>📦 Commercial Order Hub</h2>
                    <p style={subTitleS}>Real-time monitoring of commercial assets and logistics.</p>
                </div>
                
                <div style={actionGroup}>
                    <div style={searchBox}>
                        <span>🔍</span>
                        <input 
                            placeholder="Search by ID or Customer..." 
                            style={searchIn} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* --- [B] DYNAMIC FILTER CLUSTER --- */}
            <div style={filterBar}>
                {['All', 'Pending', 'Accepted', 'Ready', 'Delivered', 'Cancelled'].map(f => {
                    const count = orders.filter(o => o.status === f).length;
                    return (
                        <button 
                            key={f} 
                            onClick={() => setFilter(f)} 
                            style={filter === f ? activeTab(themeColor) : inactiveTab}
                        >
                            {f} 
                            {count > 0 && <span style={countBadge(themeColor)}>{count}</span>}
                        </button>
                    );
                })}
            </div>

            {/* --- [C] LOGISTICS NODES GRID --- */}
            {filteredOrders.length === 0 ? (
                <div style={noDataBox}>
                    <div style={{fontSize:'60px', marginBottom:'20px'}}>📑</div>
                    <h3>Registry Clean: No orders found in "{filter}"</h3>
                    <p>New customer requests will manifest here in real-time.</p>
                </div>
            ) : (
                <div style={gridS}>
                    {filteredOrders.map(o => (
                        <OrderCard 
                            key={o._id} 
                            order={o}
                            onUpdateStatus={handleStatusUpdate}
                            onVerifyOtp={verifyAndDeliver}
                            onPhotoUpload={handlePhotoDelivery}
                            onDownloadInvoice={handleDownloadInvoice} // ✅ नया प्रॉप पास किया गया
                            otpValue={otpInputs[o._id] || ""}
                            onOtpChange={(val) => setOtpInputs({...otpInputs, [o._id]: val})}
                            isUploading={uploadingId === o._id}
                            isDownloading={downloadingId === o._id} // ✅ डाउनलोडिंग स्टेट
                            themeColor={themeColor}
                        />
                    ))}
                </div>
            )}

            <style>{`
                .spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

// --- Enterprise Visual Definitions ---

const pageContainer = { padding: '10px', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const titleS = { margin: 0, fontWeight: '900', color: '#0f172a', fontSize: '26px', letterSpacing:'-1px' };
const subTitleS = { color: '#64748b', fontSize: '14px', marginTop: '4px', fontWeight:'500' };
const toolbarRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', flexWrap: 'wrap', gap: '20px' };
const actionGroup = { display: 'flex', gap: '15px', alignItems: 'center' };
const searchBox = { background: '#fff', border: '1.5px solid #f1f5f9', borderRadius: '16px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow:'0 10px 30px rgba(0,0,0,0.02)' };
const searchIn = { border: 'none', outline: 'none', fontSize: '14px', fontWeight: '700', width: '250px', color:'#1e293b' };
const filterBar = { display: 'flex', gap: '12px', marginBottom: '35px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth:'none' };
const inactiveTab = { padding: '12px 24px', borderRadius: '14px', border: '1.5px solid #f1f5f9', background: '#fff', color: '#64748b', cursor: 'pointer', fontWeight: '800', fontSize: '12px', whiteSpace: 'nowrap', transition:'0.3s' };
const activeTab = (color) => ({ ...inactiveTab, background: color, color: '#fff', borderColor: color, boxShadow: `0 8px 15px ${color}33` });
const countBadge = (color) => ({ marginLeft: '10px', background: '#fff', color: color, padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight:'900' });
const gridS = { display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))', gap: '25px' };
const noDataBox = { textAlign: 'center', padding: '100px 20px', background: '#fff', borderRadius: '35px', border: '1px solid #f1f5f9', color: '#94a3b8', animation: 'fadeIn 0.5s ease' };
const loaderS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '60vh', fontWeight: '900', color: '#94a3b8', fontSize:'14px' };

export default OrderManager;