import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from 'services/api';
import { useBranding } from 'context/BrandingContext';

const CustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useBranding();
    
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); 
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({});

    const fetchFullData = useCallback(async () => {
        setLoading(true);
        try {
            const profileRes = await api.get(`/admin/hierarchy/details/${id}`);
            if (profileRes.data.success) {
                setCustomer(profileRes.data.data);
                setEditData(profileRes.data.data);
            }
            try {
                const orderRes = await api.get(`/admin/orders`); 
                if (orderRes.data.success) {
                    const customerOrders = orderRes.data.data.filter(o => 
                        (o.customerId?._id === id) || (o.customerId === id)
                    );
                    setOrders(customerOrders);
                }
            } catch (e) { console.warn("Order stream unavailable."); }
        } catch (err) {
            toast.error("Registry Sync Failed.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchFullData(); }, [fetchFullData]);

    // Actions
    const handleResetPassword = async () => {
        const newPass = window.prompt("New Password:");
        if (newPass) {
            try {
                await api.put(`/admin/users/reset-password/${id}`, { newPassword: newPass });
                toast.success("Security key rotated.");
            } catch (err) { toast.error("Reset failed."); }
        }
    };

    const handleToggleStatus = async () => {
        try {
            await api.put(`/admin/users/update/${id}`, { isActive: !customer.isActive });
            toast.success("Status Updated.");
            fetchFullData();
        } catch (err) { toast.error("Update failed."); }
    };

    const handleUpdateProfile = async () => {
        try {
            await api.put(`/admin/users/update/${id}`, {
                fullName: editData.fullName,
                mobile: editData.mobile,
                email: editData.email
            });
            toast.success("Updated.");
            setShowEditModal(false);
            fetchFullData();
        } catch (err) { toast.error("Update failed."); }
    };

    const handleWalletAdjust = async () => {
        const amount = window.prompt("Amount (+/-):");
        if (!amount || isNaN(amount)) return;
        try {
            const type = Number(amount) > 0 ? 'Credit' : 'Debit';
            await api.put(`/admin/users/update/${id}`, { 
                walletAction: { amount: Math.abs(amount), type, description: "Admin Sync" } 
            });
            toast.success("Wallet Synced.");
            fetchFullData();
        } catch (err) { toast.error("Failed."); }
    };

    const handleDeleteUser = async () => {
        if (!window.confirm("PERMANENT DELETE?")) return;
        try {
            await api.delete(`/admin/users/delete/${id}`);
            toast.success("Purged.");
            navigate('/admin/users');
        } catch (err) { toast.error("Failed."); }
    };

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return <div style={fullLoader}>📡 Synchronizing Node...</div>;
    if (!customer) return <div style={fullLoader}><h3>❌ Discovery Failed.</h3></div>;

    return (
        <div style={containerS} className="audit-shell">
            {/* 🟦 HEADER */}
            <div style={topHeader(themeColor)} className="resp-header">
                <div style={headerActionRow} className="resp-action-row">
                    <button onClick={() => navigate('/admin/users')} style={backBtn}>← REGISTRY</button>
                    <div style={actionGroup} className="resp-btn-group">
                        <button onClick={() => setShowEditModal(true)} style={secBtn}>📝 EDIT</button>
                        <button onClick={handleResetPassword} style={secBtn}>🔑 KEY</button>
                        <button onClick={handleToggleStatus} style={secBtn}>{customer.isActive ? '🔒 LOCK' : '🔓 UNLOCK'}</button>
                        <button onClick={handleDeleteUser} style={deleteBtn}>🗑️ PURGE</button>
                    </div>
                </div>

                <div style={profileMain} className="resp-profile-main">
                    <div style={profileFrame}>
                        <img src={customer.photo || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} alt="P" style={avatarL} />
                    </div>
                    <div style={infoBox}>
                        <h2 style={nameL} className="resp-name">{customer.fullName}</h2>
                        <div style={tagRow} className="resp-tags">
                            <span style={roleTag}>CUSTOMER</span>
                            <span style={idTag}>{customer.email || customer.mobile || 'N/A'}</span>
                            <span style={statusTag(customer.isActive)}>{customer.isActive ? '● ACTIVE' : '● LOCKED'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🗂️ TABS */}
            <div style={tabWrapper}>
                <div style={tabContainer} className="resp-tabs">
                    {['overview', 'wallet', 'orders', 'addresses', 'audit'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={tabBtn(activeTab === tab, themeColor)}>
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* 🗒️ CONTENT */}
            <div style={contentPadding} className="resp-content-padding">
                <div style={contentBox}>
                    {activeTab === 'overview' && (
                        <div style={gridRow} className="resp-grid">
                            <div style={cardS}>
                                <h4 style={cardH}>Contact Intelligence</h4>
                                <div style={dataItem}><label>MOBILE</label><span>{customer.mobile}</span></div>
                                <div style={dataItem}><label>EMAIL</label><span style={{wordBreak:'break-all'}}>{customer.email}</span></div>
                                <div style={dataItem}><label>JOINED</label><span>{new Date(customer.createdAt).toLocaleDateString()}</span></div>
                            </div>
                            <div style={cardS}>
                                <h4 style={cardH}>Analytics</h4>
                                <div style={dataItem}><label>ORDERS</label><span>{orders.length}</span></div>
                                <div style={dataItem}><label>TOTAL SPENT</label><span>₹{orders.reduce((acc,o)=>acc+o.totalAmount, 0).toLocaleString()}</span></div>
                                <div style={dataItem}><label>WALLET</label><span style={{fontWeight:'900', color:'#10b981'}}>₹{customer.wallet?.balance || 0}</span></div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'wallet' && (
                        <div>
                            <div style={walletSummary} className="resp-wallet-summary">
                                <h3 style={{margin:0}}>Balance: ₹{customer.wallet?.balance || 0}</h3>
                                <button onClick={handleWalletAdjust} style={manageBtn(themeColor)}>± ADJUST</button>
                            </div>
                            <div className="table-responsive">
                                <table style={tableS}>
                                    <thead><tr style={thRow}><th>DATE</th><th>TYPE</th><th>AMT</th><th>INFO</th></tr></thead>
                                    <tbody>
                                        {customer.wallet?.history?.slice().reverse().map((h, i) => (
                                            <tr key={i} style={trS}>
                                                <td style={tdS}>{new Date(h.timestamp).toLocaleDateString()}</td>
                                                <td style={{...tdS, color: h.type==='Credit'?'#10b981':'#f43f5e', fontWeight:'800'}}>{h.type}</td>
                                                <td style={tdS}>₹{h.amount}</td>
                                                <td style={tdS}>{h.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="table-responsive">
                            <table style={tableS}>
                                <thead><tr style={thRow}><th>ORDER ID</th><th>HUB</th><th>BILLING</th><th>STATUS</th></tr></thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o._id} style={trS}>
                                            <td style={tdS}><b>{o.orderId}</b></td>
                                            <td style={tdS}>{o.shopId?.shopDetails?.shopName || 'Merchant'}</td>
                                            <td style={tdS}>₹{o.totalAmount}</td>
                                            <td style={tdS}><span style={statusBadge(o.status)}>{o.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'addresses' && (
                        <div style={gridRow} className="resp-grid">
                            {customer.addresses?.map((a, i) => (
                                <div key={i} style={cardS}>
                                    <b>{a.addressType.toUpperCase()}</b>
                                    <p style={addrTxt}>{a.fullAddress}<br/>{a.district}, {a.state} - {a.pinCode}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'audit' && (
                        <div className="table-responsive">
                            <table style={tableS}>
                                <thead><tr style={thRow}><th>TIMESTAMP</th><th>IP</th><th>DEVICE</th></tr></thead>
                                <tbody>
                                    {customer.loginHistory?.slice().reverse().map((l, i) => (
                                        <tr key={i} style={trS}>
                                            <td style={tdS}>{new Date(l.timestamp).toLocaleString()}</td>
                                            <td style={tdS}><code>{l.ip || '0.0.0.0'}</code></td>
                                            <td style={tdS}>{l.device || 'Mobile'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* 📝 MODAL */}
            {showEditModal && (
                <div style={modalOverlay}>
                    <div style={modalContent} className="resp-modal">
                        <h3 style={{marginTop:0}}>Update identity</h3>
                        <label style={labelS}>Full Name</label>
                        <input style={modalIn} value={editData.fullName} onChange={e => setEditData({...editData, fullName: e.target.value})} />
                        <label style={labelS}>Mobile</label>
                        <input style={modalIn} value={editData.mobile} onChange={e => setEditData({...editData, mobile: e.target.value})} />
                        <label style={labelS}>Email ID</label>
                        <input style={modalIn} value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} />
                        <div style={{display:'flex', gap:'10px'}}>
                            <button onClick={handleUpdateProfile} style={manageBtn(themeColor)}>COMMIT</button>
                            <button onClick={() => setShowEditModal(false)} style={secBtnDark}>CANCEL</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .audit-shell { width: 100%; max-width: 100vw; overflow-x: hidden; }
                .table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin-top: 10px; }
                
                @media (max-width: 768px) {
                    .resp-header { padding: 15px !important; border-radius: 0 !important; }
                    .resp-action-row { flex-direction: column !important; align-items: stretch !important; gap: 15px; }
                    .resp-btn-group { display: grid !important; grid-template-columns: 1fr 1fr; width: 100%; gap: 10px; }
                    .resp-profile-main { flex-direction: column; text-align: center; gap: 10px !important; }
                    .resp-name { font-size: 20px !important; }
                    .resp-tags { justify-content: center; flex-wrap: wrap; }
                    .resp-tabs { overflow-x: auto; white-space: nowrap; padding: 10px !important; gap: 8px !important; display: flex; scrollbar-width: none; }
                    .resp-tabs::-webkit-scrollbar { display: none; }
                    .resp-content-padding { padding: 10px !important; width: 100% !important; margin-right: 0 !important; }
                    .resp-grid { grid-template-columns: 1fr !important; }
                    .resp-wallet-summary { flex-direction: column; gap: 10px; text-align: center; }
                    .resp-modal { width: 95% !important; padding: 20px !important; }
                }
            `}</style>
        </div>
    );
};

// --- Styles ---

const containerS = { background:'#f8fafc', minHeight:'100vh', width:'100%' };
const fullLoader = { padding:'150px 0', textAlign:'center', color:'#94a3b8', fontWeight:'900' };

const topHeader = (col) => ({ background: `linear-gradient(135deg, ${col} 0%, #1e293b 100%)`, padding:'30px 40px', color:'#fff', boxSizing:'border-box' });
const headerActionRow = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px' };
const backBtn = { background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', padding:'8px 15px', borderRadius:'8px', cursor:'pointer', fontWeight:'800', fontSize:'11px' };
const actionGroup = { display:'flex', gap:'8px' };
const secBtn = { background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', padding:'8px 12px', borderRadius:'8px', cursor:'pointer', fontWeight:'700', fontSize:'10px' };
const deleteBtn = { ...secBtn, background:'#f43f5e', border:'none' };

const profileMain = { display:'flex', alignItems:'center', gap:'25px' };
const profileFrame = { background:'#fff', padding:'4px', borderRadius:'18px' };
const avatarL = { width:'70px', height:'70px', borderRadius:'14px', objectFit:'cover' };
const infoBox = { flex:1 };
const nameL = { margin:0, fontSize:'24px', fontWeight:'900' };
const tagRow = { display:'flex', gap:'10px', marginTop:'5px' };
const roleTag = { background:'rgba(255,255,255,0.15)', padding:'3px 10px', borderRadius:'6px', fontSize:'9px', fontWeight:'800' };
const idTag = { ...roleTag, background:'rgba(0,0,0,0.2)' };
const statusTag = (active) => ({ ...roleTag, background: active ? '#10b981' : '#f43f5e' });

const tabWrapper = { background:'#fff', borderBottom:'1px solid #e2e8f0', width:'100%' };
const tabContainer = { display:'flex', padding:'0 40px', gap:'10px', boxSizing:'border-box' };
const tabBtn = (active, col) => ({ padding:'15px 20px', border:'none', background:'transparent', color: active ? col : '#94a3b8', borderBottom: active ? `3px solid ${col}` : '3px solid transparent', fontWeight:'900', cursor:'pointer', fontSize:'11px', transition:'0.2s' });

const contentPadding = { padding:'25px 40px', boxSizing:'border-box', width:'100%' };
const contentBox = { padding:'20px', background:'#fff', borderRadius:'15px', border:'1px solid #e2e8f0', width:'100%', boxSizing:'border-box' };
const gridRow = { display:'grid', gap:'20px' };
const cardS = { padding:'15px', border:'1.5px solid #f1f5f9', borderRadius:'12px', background:'#fcfdfe' };
const cardH = { margin:'0 0 10px 0', color:'#94a3b8', textTransform:'uppercase', fontSize:'10px', fontWeight:'900' };
const dataItem = { display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f1f5f9', fontSize:'13px', fontWeight:'600' };

const walletSummary = { display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f8fafc', padding:'15px', borderRadius:'12px', marginBottom:'20px', border:'1px solid #e2e8f0' };
const manageBtn = (col) => ({ background: col, color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight:'900', fontSize:'11px' });

const tableS = { width:'100%', borderCollapse:'collapse', textAlign:'left', minWidth:'450px' };
const thRow = { color:'#94a3b8', fontSize:'10px', textTransform:'uppercase', borderBottom:'2px solid #f1f5f9' };
const tdS = { padding:'12px 5px', fontSize:'13px', borderBottom:'1px solid #f8fafc' };
const trS = { transition:'0.2s' };
const addrTxt = { color:'#475569', fontSize:'13px', lineHeight:'1.4' };
const defBadge = { background:'#eff6ff', color:'#2563eb', padding:'2px 8px', borderRadius:'5px', fontSize:'9px', fontWeight:'900' };
const statusBadge = (s) => ({ padding:'4px 10px', borderRadius:'6px', fontSize:'10px', fontWeight:'900', background: s==='Delivered'?'#ecfdf5':'#fff1f2', color: s==='Delivered'?'#10b981':'#f43f5e' });

const modalOverlay = { position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000, backdropFilter:'blur(5px)' };
const modalContent = { background:'#fff', padding:'30px', borderRadius:'20px', width:'400px' };
const labelS = { display:'block', fontSize:'11px', fontWeight:'900', color:'#94a3b8', marginBottom:'5px' };
const modalIn = { width:'100%', padding:'12px', marginBottom:'15px', borderRadius:'10px', border:'1px solid #e2e8f0', fontSize:'14px', boxSizing:'border-box' };
const secBtnDark = { ...secBtn, color:'#475569', border:'1.5px solid #e2e8f0', background:'#fff' };

export default CustomerDetails;