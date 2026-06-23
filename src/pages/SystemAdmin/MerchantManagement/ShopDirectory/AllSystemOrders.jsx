import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from '../../../../services/api'; 
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client'; // For Real-time updates
import { useBranding } from '../../../../context/BrandingContext'; // For White-labeling
import { toast } from 'react-toastify';

const AllSystemOrders = () => {
    const navigate = useNavigate();
    const { settings } = useBranding();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());
    const socket = useRef(null);

    // 1. 📡 Automatic Synchronization Protocol (No Buttons)
    const fetchOrders = useCallback(async () => {
        try {
            // Initial sync shows loader, subsequent syncs are silent background updates
            const res = await api.get('/admin/orders/all'); 
            if (res.data.success) {
                const sortedData = (res.data.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sortedData);
                setError(null);
            }
            setLastSynced(new Date().toLocaleTimeString());
            document.title = `Order Stream | ${settings.siteName}`;
        } catch (err) {
            console.error("Order Stream Handshake Failure.");
            setError("Connectivity Alert: Transaction registry unreachable.");
        } finally {
            setLoading(false);
        }
    }, [settings.siteName]);

    // 2. ⚡ Real-time Socket & Window Focus Integration
    useEffect(() => {
        fetchOrders();

        // Socket Implementation for Real-time Inbound Orders
        socket.current = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');
        socket.current.on('ecosystem_order_update', () => fetchOrders());

        // Auto-refresh when admin returns to this window (SaaS Protocol)
        window.addEventListener('focus', fetchOrders);

        return () => {
            socket.current.disconnect();
            window.removeEventListener('focus', fetchOrders);
        };
    }, [fetchOrders]);

    // 3. 🔍 Discovery & Filtering Logic
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = 
                (order.orderId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order._id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.customerDetails?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.shopId?.shopDetails?.shopName || "").toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === "All" || order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    // 4. 📊 Operational Metrics
    const stats = useMemo(() => {
        const totalAmount = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        return { totalAmount, count: filteredOrders.length };
    }, [filteredOrders]);

    // 5. 📥 Intelligent Data Export
    const exportToCSV = () => {
        if (filteredOrders.length === 0) return toast.warning("Protocol Error: No datasets available for export.");
        
        const headers = ["Order_ID", "Timestamp", "Customer_Identity", "Merchant_Hub", "Net_Value", "Status", "Gateway"].join(",");
        const rows = filteredOrders.map(o => [
            o.orderId || o._id,
            new Date(o.createdAt).toLocaleString(),
            o.customerDetails?.name || 'N/A',
            o.shopId?.shopDetails?.shopName || 'N/A',
            o.totalAmount,
            o.status,
            o.paymentMethod
        ].join(","));
        
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${settings.siteName}_Order_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Delivered': return { bg: '#ecfdf5', text: '#10b981', dot: '#10b981' };
            case 'Pending': return { bg: '#fffbeb', text: '#f59e0b', dot: '#f59e0b' };
            case 'Out for Delivery': return { bg: '#eff6ff', text: '#3b82f6', dot: '#3b82f6' };
            case 'Cancelled': return { bg: '#fff1f2', text: '#f43f5e', dot: '#f43f5e' };
            default: return { bg: '#f8fafc', text: '#64748b', dot: '#cbd5e1' };
        }
    };

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Establishing Order Stream Connection...</p>
        </div>
    );

    return (
        <div style={containerS}>
            {/* --- [A] COMMAND HEADER & ANALYTICS --- */}
            <div style={headerFlex}>
                <div style={{flex:1}}>
                    <h2 style={titleS}>📦 Global Order Stream</h2>
                    <p style={subS}>Strategic real-time auditing of commercial logistics across the {settings.siteName} ecosystem.</p>
                </div>
                <div style={statsRow}>
                    <div style={statItem}>
                        <small style={statLab}>FILTERED VOLUME</small>
                        <b style={statVal}>₹{stats.totalAmount.toLocaleString('en-IN')}</b>
                    </div>
                    <div style={{...statItem, borderRight:'none'}}>
                        <small style={statLab}>NODES ACTIVE</small>
                        <b style={{...statVal, color: themeColor}}>{stats.count} TX</b>
                    </div>
                    <button style={exportBtn(themeColor)} onClick={exportToCSV}>📥 Export Dataset</button>
                </div>
            </div>

            {/* --- [B] DISCOVERY TOOLBAR (No Buttons) --- */}
            <div style={toolbarS}>
                <div style={searchBox}>
                    <span style={searchIcon}>🔍</span>
                    <input 
                        style={searchIn} 
                        placeholder="Search by ID, Customer Identity or Merchant Hub..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={filterGroup}>
                    <select style={selectS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="All">All Transactions</option>
                        <option value="Pending">Awaiting Audit</option>
                        <option value="Ready">Ready for Hub Dispatch</option>
                        <option value="Out for Delivery">Logistics Transit</option>
                        <option value="Delivered">Successful Settlement</option>
                        <option value="Cancelled">Voided Protocols</option>
                    </select>
                    <div style={syncBadge}>
                        <span className="pulse-dot"></span>
                        <small>{lastSynced}</small>
                    </div>
                </div>
            </div>

            {/* --- [C] MASTER REGISTRY TABLE --- */}
            <div style={tableCard}>
                {error ? (
                    <div style={errorArea}>
                        <p>{error}</p>
                        <button onClick={fetchOrders} style={refreshBtn}>Attempt Re-connection</button>
                    </div>
                ) : (
                    <div style={{overflowX: 'auto'}}>
                        <table style={tableS}>
                            <thead>
                                <tr style={thRow}>
                                    <th style={tdS}>Transaction Identity</th>
                                    <th style={tdS}>Authorized Personnel</th>
                                    <th style={tdS}>Merchant Hub</th>
                                    <th style={tdS}>Net Value</th>
                                    <th style={tdS}>Node Status</th>
                                    <th style={tdS}>Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length === 0 ? (
                                    <tr><td colSpan="6" style={noData}>Registry Clean: No transaction logs discovered.</td></tr>
                                ) : (
                                    filteredOrders.map((order) => {
                                        const statusStyle = getStatusStyle(order.status);
                                        return (
                                            <tr key={order._id} style={trS}>
                                                <td style={tdS}>
                                                    <div style={orderIdS}>#ORD-{order.orderId?.toUpperCase() || order._id.slice(-8).toUpperCase()}</div>
                                                    <small style={dateS}>{new Date(order.createdAt).toLocaleString()}</small>
                                                </td>
                                                <td style={tdS}>
                                                    <div style={nameS}>{order.customerDetails?.name}</div>
                                                    <div style={phoneS}>📱 {order.customerDetails?.mobile}</div>
                                                </td>
                                                <td style={tdS}>
                                                    <div style={shopNameS}>{order.shopId?.shopDetails?.shopName || "Global Node"}</div>
                                                    <small style={distS}>📍 {order.shopId?.shopDetails?.address?.district?.toUpperCase() || 'SYSTEM'}</small>
                                                </td>
                                                <td style={tdS}>
                                                    <div style={amountS}>₹{order.totalAmount?.toLocaleString()}</div>
                                                    <small style={payS}>{order.paymentMethod} • {order.paymentStatus?.toUpperCase()}</small>
                                                </td>
                                                <td style={tdS}>
                                                    <span style={{...badgeBase, background: statusStyle.bg, color: statusStyle.text}}>
                                                        <span style={{...dotS, background: statusStyle.dot}}></span> {order.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td style={tdS}>
                                                    <button style={viewBtn(themeColor)} onClick={() => navigate(`/admin/orders/${order._id}`)}>
                                                        Inspect Ledger
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div style={footerS}>
                🛡️ All transaction data is end-to-end encrypted and logged within the {settings.siteName} audit cluster.
            </div>

            <style>{`
                .spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .pulse-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; display: inline-block; animation: pulse-anim 2s infinite; margin-right: 8px; }
                @keyframes pulse-anim { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
            `}</style>
        </div>
    );
};

// --- Enterprise Visual Definitions ---

const containerS = { padding: '10px', minHeight: '100vh', animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin: 0, fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px' };
const subS = { margin: '5px 0 0', color: '#64748b', fontSize: '14px', fontWeight: '500' };

const statsRow = { display: 'flex', gap: '15px', alignItems: 'center' };
const statItem = { background: '#fff', padding: '15px 25px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', borderRight:'3px solid #f1f5f9' };
const statLab = { fontSize: '9px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px', textTransform:'uppercase' };
const statVal = { fontSize: '22px', fontWeight: '900', color: '#0f172a', marginTop: '5px', display: 'block', letterSpacing:'-0.5px' };

const toolbarS = { display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '35px', background: '#fff', padding: '15px', borderRadius: '24px', border: '1px solid #f1f5f9', flexWrap:'wrap', alignItems:'center' };
const searchBox = { position: 'relative', flex: 1, minWidth: '300px' };
const searchIn = { width: '100%', padding: '14px 15px 14px 50px', borderRadius: '16px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '14px', background: '#f8fafc', fontWeight: '700', boxSizing: 'border-box', color:'#1e293b' };
const searchIcon = { position: 'absolute', left: '18px', top: '15px', color: '#94a3b8', fontSize: '18px' };

const filterGroup = { display: 'flex', gap: '12px', alignItems:'center' };
const selectS = { padding: '12px 20px', borderRadius: '14px', border: '1.5px solid #f1f5f9', background: '#fff', fontSize: '12px', fontWeight: '800', color: '#475569', cursor: 'pointer', outline:'none' };
const syncBadge = { display:'flex', alignItems:'center', background:'#f8fafc', padding:'10px 18px', borderRadius:'14px', border:'1px solid #e2e8f0', color:'#94a3b8', fontSize:'11px', fontWeight:'900' };

const exportBtn = (color) => ({ padding: '12px 25px', borderRadius: '15px', border: 'none', background: color, color: '#fff', fontWeight: '900', cursor: 'pointer', fontSize: '12px', boxShadow: `0 8px 15px ${color}33`, transition:'0.3s' });

const tableCard = { background: '#fff', borderRadius: '40px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' };
const tableS = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth:'1000px' };
const thRow = { backgroundColor: '#f8fafc', borderBottom: '1.5px solid #f1f5f9' };
const tdS = { padding: '22px 30px', fontSize: '14px', borderBottom: '1px solid #f8fafc' };
const trS = { transition: '0.2s' };

const orderIdS = { fontWeight: '900', color: '#0f172a', fontSize: '14px' };
const dateS = { color: '#cbd5e1', fontSize: '10px', fontWeight: '800', textTransform:'uppercase', marginTop:'3px', display:'block' };
const nameS = { fontWeight: '800', color: '#334155' };
const phoneS = { fontSize: '12px', color: '#64748b', fontWeight: '700' };
const shopNameS = { fontWeight: '800', color: '#1e293b' };
const distS = { color: '#3b82f6', fontSize: '11px', fontWeight: '900', letterSpacing:'0.5px' };
const amountS = { fontWeight: '900', color: '#0f172a', fontSize: '18px', letterSpacing:'-0.5px' };
const payS = { color: '#94a3b8', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', marginTop:'4px', display:'block' };

const badgeBase = { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', borderRadius: '10px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', width: 'fit-content', letterSpacing:'1px' };
const dotS = { width: '6px', height: '6px', borderRadius: '50%' };

const viewBtn = (color) => ({ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '11px', transition:'0.2s' });

const refreshBtn = { padding: '10px 20px', borderRadius: '12px', border: '1px solid #fee2e2', background: '#fff1f2', color: '#f43f5e', fontWeight: '900', cursor: 'pointer', fontSize:'11px' };
const loaderS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '60vh', background:'#f8fafc', gap:'20px' };
const noData = { padding: '120px 20px', textAlign: 'center', color: '#cbd5e1', fontSize: '18px', fontWeight: '800', letterSpacing:'1px', textTransform:'uppercase' };
const errorArea = { padding: '50px', textAlign: 'center', color: '#f43f5e', fontWeight: '800', background:'#fff1f2', fontSize:'14px' };
const footerS = { marginTop: '40px', fontSize: '10px', color: '#cbd5e1', textAlign: 'left', fontWeight: '900', borderTop:'1.5px solid #f8fafc', paddingTop:'20px', textTransform:'uppercase', letterSpacing:'1px' };

export default AllSystemOrders;