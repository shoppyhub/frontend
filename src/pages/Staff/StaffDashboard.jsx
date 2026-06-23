import React, { useState, useEffect, useCallback } from 'react';
import StaffHeader from '../../components/Staff/StaffHeader';
import StaffSidebar from '../../components/Staff/StaffSidebar';
import api from '../../services/api';
import { toast } from 'react-toastify';

const StaffDashboard = () => {
    const [activeTab, setActiveTab] = useState('tasks');
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [staffInfo, setStaffInfo] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const [profileRes, orderRes] = await Promise.all([
                api.get('/auth/profile'),
                api.get('/orders/shop-orders')
            ]);
            
            if (profileRes.data.success) setStaffInfo(profileRes.data.data);
            
            if (orderRes.data.success) {
                setAssignments(orderRes.data.data.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled'));
            }
        } catch (err) {
            toast.error("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
        const handleResize = () => {
            const mobile = window.innerWidth <= 1024;
            setIsMobile(mobile);
            if (!mobile) setIsSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [fetchDashboardData]);

    const renderModule = () => {
        switch (activeTab) {
            case 'tasks': return <DeliveryTasks tasks={assignments} refresh={fetchDashboardData} loading={loading} />;
            case 'idcard': return <StaffIdentity user={staffInfo} />;
            default: return <DeliveryTasks tasks={assignments} refresh={fetchDashboardData} loading={loading} />;
        }
    };

    return (
        <div style={wrapper}>
            <StaffHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div style={bodyS}>
                <StaffSidebar
                    setTab={(tab) => { setActiveTab(tab); if (isMobile) setIsSidebarOpen(false); }}
                    activeTab={activeTab}
                    isOpen={isSidebarOpen}
                    closeSidebar={() => setIsSidebarOpen(false)}
                    isMobile={isMobile}
                />
                <main style={mainArea(isMobile)}>
                    <div style={fadeAnim}>{renderModule()}</div>
                </main>
            </div>
        </div>
    );
};

const DeliveryTasks = ({ tasks, refresh, loading }) => {
    const openInMaps = (address) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
        window.open(url, '_blank');
    };

    const handleCompleteDelivery = async (orderId) => {
        const otp = window.prompt("Enter the 4-digit Delivery OTP from customer:");
        if (!otp) return;

        try {
            const res = await api.put(`/orders/status/${orderId}`, { status: 'Delivered', inputOtp: otp });
            if (res.data.success) {
                toast.success("Delivery completed successfully!");
                refresh();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid OTP or server error.");
        }
    };

    if (loading) return <div style={emptyBox}>Loading tasks...</div>;

    return (
        <div>
            <div style={headerRow}>
                <h2 style={titleS}>Today's Tasks ({tasks.length})</h2>
                <button onClick={refresh} style={syncBtn}>Refresh</button>
            </div>

            {tasks.length === 0 ? (
                <div style={emptyBox}>No delivery tasks assigned right now.</div>
            ) : (
                <div style={gridS}>
                    {tasks.map(task => (
                        <div key={task._id} style={taskCard}>
                            <div style={cardHead}>
                                <span style={orderId}>#{task.orderId || task._id.slice(-6).toUpperCase()}</span>
                                <span style={statusBadge(task.status)}>{task.status}</span>
                            </div>
                            
                            <h3 style={{margin:'15px 0 5px 0', color: '#1e293b'}}>{task.customerDetails?.name}</h3>
                            <p style={phoneText}>Phone: {task.customerDetails?.mobile}</p>
                            
                            <div style={addressBox} onClick={() => openInMaps(task.customerDetails?.address)}>
                                <p style={addr}>{task.customerDetails?.address}</p>
                                <small style={{color: '#3b82f6', fontWeight: 'bold'}}>Open in Maps</small>
                            </div>

                            <div style={priceRow}>
                                <span>Total Amount:</span>
                                <b style={{fontSize: '18px'}}>₹{task.totalAmount}</b>
                            </div>

                            <div style={payTypeBadge(task.paymentMethod)}>
                                {task.paymentMethod === 'COD' ? "Collect Cash on Delivery" : "Paid Online"}
                            </div>

                            <button onClick={() => handleCompleteDelivery(task._id)} style={doneBtn}>
                                Mark as Delivered
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const StaffIdentity = ({ user }) => {
    if (!user) return <p>Loading profile...</p>;

    return (
        <div style={{textAlign:'center', padding:'20px'}}>
            <div style={idCardBox}>
                <div style={idHeader}>
                    <div style={{fontWeight: '900', fontSize: '20px'}}>RKD MART</div>
                    <small>Official Staff ID</small>
                </div>
                <div style={idBody}>
                    <img src={user.photo || 'https://via.placeholder.com/100'} alt="Profile" style={idImg} />
                    <h2 style={{margin: '10px 0 5px 0', color: '#0f172a'}}>{user.fullName}</h2>
                    <p style={{color: '#2874f0', fontWeight: 'bold', margin: 0}}>{user.staffDetails?.roleInShop || 'Delivery Staff'}</p>
                    
                    <div style={idDetails}>
                        <div style={idRow}><span>ID Number:</span> <b>{user.generatedId}</b></div>
                        <div style={idRow}><span>Mobile:</span> <b>{user.mobile}</b></div>
                        <div style={idRow}><span>Joined:</span> <b>{new Date(user.createdAt).toLocaleDateString()}</b></div>
                    </div>
                </div>
                <div style={idFooter}>
                    <p style={{fontSize: '10px', margin: '5px 0 0 0'}}>Authorized Personnel Only</p>
                </div>
            </div>
            <button onClick={() => window.print()} style={printBtn}>Print ID Card</button>
        </div>
    );
};

const wrapper = { backgroundColor:'#f1f5f9', minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily: 'sans-serif' };
const bodyS = { display:'flex', flex:1, position:'relative' };
const mainArea = (mobile) => ({ flex:1, marginTop:'70px', padding: mobile ? '20px 15px' : '30px', boxSizing:'border-box', width:'100%' });
const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap:'wrap', gap:'10px' };
const titleS = { color:'#0f172a', margin: 0, fontWeight: '800', fontSize: 'clamp(18px, 4vw, 24px)' };
const syncBtn = { background: '#fff', border: '1px solid #ddd', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const gridS = { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap:'20px' };
const taskCard = { background:'#fff', padding:'20px', borderRadius:'16px', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)', border:'1px solid #e2e8f0' };
const cardHead = { display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', flexWrap:'wrap', gap:'8px' };
const orderId = { fontSize:'14px', fontWeight:'900', color:'#2874f0' };
const phoneText = { color: '#64748b', fontWeight: 'bold', margin: '0 0 10px 0' };
const addressBox = { background: '#f8fafc', padding: '12px', borderRadius: '10px', cursor: 'pointer', marginBottom: '15px', border: '1px dashed #cbd5e1' };
const addr = { fontSize:'14px', color:'#334155', lineHeight:'1.5', margin: 0 };
const priceRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0' };
const payTypeBadge = (type) => ({ padding: '8px', borderRadius: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', background: type === 'COD' ? '#fff7ed' : '#f0fdf4', color: type === 'COD' ? '#c2410c' : '#15803d', marginBottom: '15px' });
const doneBtn = { width:'100%', padding:'14px', background:'#10b981', color:'#fff', border:'none', borderRadius:'12px', cursor:'pointer', fontWeight:'900', fontSize: '15px' };
const statusBadge = (s) => ({ background: s === 'Out for Delivery' ? '#e0f2fe' : '#fef3c7', color: s === 'Out for Delivery' ? '#0369a1' : '#92400e', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' });
const emptyBox = { padding: '50px', textAlign: 'center', background: '#fff', borderRadius: '15px', color: '#94a3b8', fontWeight: 'bold' };
const idCardBox = { width:'min(320px, 100%)', background:'#fff', borderRadius:'25px', overflow:'hidden', display:'inline-block', boxShadow:'0 20px 40px rgba(0,0,0,0.15)', border:'1px solid #eee' };
const idHeader = { background:'#0f172a', color:'#f1c40f', padding:'20px' };
const idBody = { padding:'25px' };
const idImg = { width:'100px', height:'100px', borderRadius:'20px', objectFit:'cover', border:'4px solid #fff', boxShadow:'0 5px 15px rgba(0,0,0,0.1)', marginTop: '-70px', background: '#fff' };
const idDetails = { marginTop: '20px', textAlign: 'left', background: '#f8fafc', padding: '15px', borderRadius: '15px' };
const idRow = { display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px', flexWrap:'wrap', gap:'4px' };
const idFooter = { padding:'15px', background:'#f8fafc', borderTop:'1px dotted #ccc' };
const printBtn = { marginTop:'20px', padding:'12px 30px', background:'#0f172a', color:'#fff', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'bold' };
const fadeAnim = { animation: 'fadeIn 0.5s ease-out' };

export default StaffDashboard;
