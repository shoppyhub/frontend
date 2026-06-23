import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from "../../../../../../services/api";
import ShopStaffRegister from "../../../StaffRegistry/ShopStaffRegister";

const StaffManagement = ({ merchantId, merchantGeneratedId }) => {
    // --- States ---
    const [view, setView] = useState('LIST'); // 'LIST' or 'ADD'
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. 📡 डेटा लोड करना (Registry Sync)
    const fetchStaff = useCallback(async () => {
        try {
            setLoading(true);
            // नोट: बैकएंड में यह रूट होना चाहिए, या आप अपनी जरूरत अनुसार बदल सकते हैं
            const res = await api.get(`/auth/staff/list-admin/${merchantId}`);
            if (res.data.success) {
                setStaff(res.data.data || []);
            }
        } catch (err) {
            setStaff([]); // 404 आने पर खाली लिस्ट
        } finally {
            setLoading(false);
        }
    }, [merchantId]);

    useEffect(() => {
        if (view === 'LIST') fetchStaff();
    }, [fetchStaff, view]);

    // 2. 🛡️ ऑपरेशनल कमांड्स (Admin Controls)
    const handleResetPassword = async (staffId) => {
        const newPass = window.prompt("Enter NEW Secure Password for Staff:");
        if (!newPass) return;
        try {
            await api.put(`/admin/users/reset-password/${staffId}`, { newPassword: newPass });
            toast.success("Staff credentials updated.");
        } catch (err) { toast.error("Override Failed."); }
    };

    const handleToggleStatus = async (staffId, currentStatus) => {
        if (!window.confirm("Change staff access status?")) return;
        try {
            await api.patch(`/auth/user/status/${staffId}`, { isActive: !currentStatus });
            toast.info("Status synchronized.");
            fetchStaff();
        } catch (err) { toast.error("Protocol Error."); }
    };

    const handlePurgeStaff = async (staffId) => {
        if (!window.confirm("🚨 CRITICAL: Remove staff node permanently?")) return;
        try {
            await api.delete(`/auth/staff/delete/${staffId}`);
            toast.error("Node purged from hub.");
            fetchStaff();
        } catch (err) { toast.error("Purge failed."); }
    };

    // --- 🖥️ रेंडर लॉजिक ---

    // अगर "ADD STAFF" मोड चालू है
    if (view === 'ADD') {
        return (
            <div className="fade-in">
                {/* हम वही रजिस्ट्रेशन फॉर्म रेंडर कर रहे हैं जो आपने दिया था */}
                <ShopStaffRegister 
                    onBack={() => setView('LIST')} 
                    initialShopId={merchantGeneratedId || ""} // ऑटो-फिल के लिए
                />
            </div>
        );
    }

    // लिस्ट व्यू (Default)
    return (
        <div style={containerS}>
            {/* Header Area */}
            <div style={headerS}>
                <div>
                    <h3 style={titleS}>👥 HUB STAFF INFRASTRUCTURE</h3>
                    <p style={subS}>Manage authorized personnel bound to this hub node.</p>
                </div>
                <button onClick={() => setView('ADD')} style={addBtnS}>
                    ➕ PROVISION NEW STAFF
                </button>
            </div>

            {loading ? (
                <div style={loaderS}>SYNCING PERSONNEL RECORDS...</div>
            ) : staff.length === 0 ? (
                <div style={emptyS}>
                    <div style={{fontSize:'50px', marginBottom:'15px'}}>👥</div>
                    <p>No active staff members discovered in this hub cluster.</p>
                    <button onClick={() => setView('ADD')} style={emptyAddBtnS}>Click to Deploy First Staff Node</button>
                </div>
            ) : (
                <div style={gridS}>
                    {staff.map(s => (
                        <div key={s._id} style={staffCardS(s.isActive)}>
                            <div style={cardTopS}>
                                <div style={avatarS(s.staffPhoto)}>
                                    {!s.staffPhoto && s.fullName.charAt(0)}
                                </div>
                                <div style={{flex: 1}}>
                                    <div style={nameS}>{s.fullName}</div>
                                    <div style={roleTagS}>{s.roleInShop || 'Staff Node'} • {s.generatedId}</div>
                                </div>
                                <div style={statusDotS(s.isActive)}></div>
                            </div>

                            <div style={contactRowS}>
                                <span>📞 {s.mobile}</span>
                                <span>📧 {s.email?.split('@')[0]}...</span>
                            </div>

                            <div style={permBoxS}>
                                <small style={labS}>Active Privileges</small>
                                <div style={tagsS}>
                                    {s.permissions && Object.keys(s.permissions).filter(k => s.permissions[k]).map(k => (
                                        <span key={k} style={tagS}>{k.replace(/([A-Z])/g, ' $1')}</span>
                                    ))}
                                </div>
                            </div>

                            <div style={actionRowS}>
                                <button onClick={() => handleResetPassword(s._id)} style={actBtnS('#3b82f6')} title="Reset Key">🔐</button>
                                <button onClick={() => handleToggleStatus(s._id, s.isActive)} style={actBtnS(s.isActive ? '#ef4444' : '#10b981')} title={s.isActive ? 'Suspend' : 'Activate'}>
                                    {s.isActive ? '🚫' : '✅'}
                                </button>
                                <button onClick={() => handlePurgeStaff(s._id)} style={actBtnS('#64748b')} title="Purge Node">🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <style>{`
                .fade-in { animation: fadeIn 0.4s ease; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

// --- Strategic SaaS Styles ---

const containerS = { animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerS = { display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff', padding:'25px 30px', borderRadius:'24px', marginBottom:'30px', border:'1px solid #f1f5f9' };
const titleS = { margin:0, fontSize:'16px', fontWeight:'900', color:'#0f172a', letterSpacing:'-0.5px' };
const subS = { margin:'5px 0 0 0', fontSize:'12px', color:'#94a3b8', fontWeight:'600' };

const addBtnS = { background:'#0f172a', color:'#fff', border:'none', padding:'12px 25px', borderRadius:'14px', fontWeight:'900', fontSize:'11px', cursor:'pointer', boxShadow:'0 10px 20px rgba(0,0,0,0.1)' };

const gridS = { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'25px' };

const staffCardS = (active) => ({ 
    background:'#fff', padding:'25px', borderRadius:'30px', border:'1px solid #f1f5f9', 
    boxShadow:'0 10px 30px rgba(0,0,0,0.02)', position:'relative',
    opacity: active ? 1 : 0.7, transition:'0.3s'
});

const cardTopS = { display:'flex', alignItems:'center', gap:'15px', marginBottom:'20px' };
const avatarS = (img) => ({ 
    width:'55px', height:'55px', borderRadius:'18px', background:'#f8fafc', 
    backgroundImage: img ? `url(${img})` : 'none', backgroundSize:'cover', 
    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', fontWeight:'900', color:'#0f172a', border:'2px solid #fff', boxShadow:'0 5px 15px rgba(0,0,0,0.05)' 
});

const nameS = { fontSize:'15px', fontWeight:'800', color:'#1e293b' };
const roleTagS = { fontSize:'10px', fontWeight:'800', color:'#94a3b8', textTransform:'uppercase', marginTop:'2px' };
const statusDotS = (a) => ({ width:'10px', height:'10px', borderRadius:'50%', background: a ? '#10b981' : '#ef4444', border:'2px solid #fff', boxShadow: a ? '0 0 8px #10b981' : 'none' });

const contactRowS = { display:'flex', justifyContent:'space-between', background:'#f8fafc', padding:'10px 15px', borderRadius:'12px', fontSize:'11px', fontWeight:'700', color:'#475569', marginBottom:'20px' };

const permBoxS = { marginBottom:'25px' };
const labS = { fontSize:'9px', fontWeight:'900', color:'#cbd5e1', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'10px' };
const tagsS = { display:'flex', flexWrap:'wrap', gap:'6px' };
const tagS = { background:'#f1f5f9', color:'#64748b', padding:'4px 10px', borderRadius:'6px', fontSize:'8px', fontWeight:'900', textTransform:'uppercase' };

const actionRowS = { display:'flex', gap:'10px', borderTop:'1px solid #f8fafc', paddingTop:'20px' };
const actBtnS = (c) => ({ flex:1, padding:'10px', background:'#fff', border:`1.5px solid ${c}30`, color:c, borderRadius:'10px', cursor:'pointer', fontSize:'14px', transition:'0.2s' });

const emptyS = { textAlign:'center', padding:'100px 40px', background:'#fff', borderRadius:'40px', border:'1px dashed #e2e8f0', color:'#cbd5e1' };
const emptyAddBtnS = { background:'none', border:'none', color:'#3b82f6', fontWeight:'900', fontSize:'13px', cursor:'pointer', marginTop:'10px', textDecoration:'underline' };
const loaderS = { height:'400px', display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', fontWeight:'900', fontSize:'12px', letterSpacing:'1px' };

export default StaffManagement;