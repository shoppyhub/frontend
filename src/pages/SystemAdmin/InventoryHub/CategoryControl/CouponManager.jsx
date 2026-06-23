import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../../services/api';
import { toast } from 'react-toastify';
import { useBranding } from '../../../../context/BrandingContext';

const CouponManager = () => {
    const { settings } = useBranding();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

    const [formData, setFormData] = useState({ 
        code: '', 
        discountType: 'Percentage', 
        discountAmount: '', 
        expiryDate: '', 
        minOrderValue: '' 
    });

    // 1. 📡 Automatic Registry Synchronization (No Buttons)
    const fetchCoupons = useCallback(async () => {
        try {
            const res = await api.get('/admin/marketing/coupons');
            if (res.data.success) {
                setCoupons(res.data.data || []);
                setLastSynced(new Date().toLocaleTimeString());
            }
            document.title = `Coupon Manager | ${settings.siteName}`;
        } catch (err) { 
            console.error("Coupon registry handshake failed.");
        } finally { 
            setLoading(false); 
        }
    }, [settings.siteName]);

    useEffect(() => { 
        fetchCoupons(); 
        // Auto-refresh when admin returns to focus
        window.addEventListener('focus', fetchCoupons);
        return () => window.removeEventListener('focus', fetchCoupons);
    }, [fetchCoupons]);

    // 2. 🚀 Deployment Protocol: Create New Promo Node
    const handleCreate = async (e) => {
        e.preventDefault();
        if (formData.code.length < 4) return toast.warning("Code must be at least 4 characters.");
        
        setIsActionLoading(true);
        try {
            const res = await api.post('/admin/marketing/coupons/add', formData);
            if (res.data.success) {
                toast.success(`Success: Promo Code ${formData.code} deployed to cluster! 🚀`);
                setFormData({ code: '', discountType: 'Percentage', discountAmount: '', expiryDate: '', minOrderValue: '' });
                fetchCoupons(); // Background re-sync
            }
        } catch (err) { 
            toast.error(err.response?.data?.message || "Deployment failed."); 
        } finally { 
            setIsActionLoading(false); 
        }
    };

    // 3. 🗑️ Decommission Protocol: Delete Coupon
    const handleDelete = async (id) => {
        if (!window.confirm("CRITICAL: Permanently purge this promo node from registry?")) return;
        try {
            await api.delete(`/admin/marketing/coupons/delete/${id}`);
            toast.info("Registry Updated: Coupon node purged.");
            fetchCoupons();
        } catch (err) { toast.error("Purge failed."); }
    };

    // 4. 📋 Copy Protocol
    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        toast.info("Code copied to clipboard.");
    };

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Accessing Incentive Registry...</p>
        </div>
    );

    return (
        <div style={containerS}>
            {/* --- [A] COMMAND HEADER --- */}
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>🎟️ Incentive & Promo Hub</h2>
                    <p style={subS}>Manage global promotional assets and discount protocols for {settings.siteName}.</p>
                </div>
                <div style={syncBadge}>
                    <span className="pulse-dot"></span>
                    <small>Auto-Sync: {lastSynced}</small>
                </div>
            </div>

            <div style={layoutGrid}>
                {/* --- [B] PROMO COMPOSER --- */}
                <div style={cardS}>
                    <h3 style={cardHead(themeColor)}>🆕 Deploy New Protocol</h3>
                    <p style={nodeHintS}>Configure a new incentive node for the marketplace.</p>
                    
                    <form onSubmit={handleCreate} style={formS}>
                        <div style={inputGroup}>
                            <label style={labS}>Unique Promo Code</label>
                            <input 
                                style={{...inS, textTransform:'uppercase', letterSpacing:'2px'}} 
                                placeholder="e.g. SAVE50" 
                                value={formData.code}
                                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                                required 
                            />
                        </div>

                        <div style={gridRowS}>
                            <div style={inputGroup}>
                                <label style={labS}>Incentive Type</label>
                                <select style={inS} value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                                    <option value="Percentage">Percentage (%)</option>
                                    <option value="Fixed">Fixed Amount (₹)</option>
                                </select>
                            </div>
                            <div style={inputGroup}>
                                <label style={labS}>Benefit Value</label>
                                <input style={inS} type="number" placeholder="Value" value={formData.discountAmount} onChange={e => setFormData({...formData, discountAmount: e.target.value})} required />
                            </div>
                        </div>

                        <div style={gridRowS}>
                            <div style={inputGroup}>
                                <label style={labS}>Min. Order Node (₹)</label>
                                <input style={inS} type="number" placeholder="0 for no limit" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: e.target.value})} />
                            </div>
                            <div style={inputGroup}>
                                <label style={labS}>Decommission Date</label>
                                <input style={inS} type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} required />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            style={isActionLoading ? btnDisabledS : submitBtn(themeColor)} 
                            disabled={isActionLoading}
                        >
                            {isActionLoading ? 'DISPATCHING...' : '🚀 PUBLISH GLOBAL PROMO'}
                        </button>
                    </form>
                </div>

                {/* --- [C] ACTIVE REGISTRY LIST --- */}
                <div style={cardS}>
                    <h3 style={cardHead(themeColor)}>📜 Operational Registry</h3>
                    <p style={nodeHintS}>Currently active promotional nodes in the cluster.</p>
                    
                    <div className="custom-scroll" style={scrollAreaS}>
                        {coupons.length === 0 ? (
                            <div style={emptyS}>No active promo nodes discovered.</div>
                        ) : (
                            [...coupons].reverse().map(c => {
                                const isExpired = new Date(c.expiryDate) < new Date();
                                return (
                                    <div key={c._id} style={listItemS}>
                                        <div style={{flex: 1}}>
                                            <div style={codeRowS}>
                                                <b onClick={() => copyToClipboard(c.code)} style={badgeCode(themeColor)}>{c.code}</b>
                                                <span style={typeTagS}>{c.discountAmount}{c.discountType === 'Percentage' ? '%' : '₹'} Reduction</span>
                                            </div>
                                            <div style={metaRowS}>
                                                <small>Min Order: ₹{c.minOrderValue || 0}</small>
                                                <small style={{color: isExpired ? '#f43f5e' : '#94a3b8'}}>
                                                    Expires: {new Date(c.expiryDate).toLocaleDateString('en-GB')} {isExpired && '(DEPLETED)'}
                                                </small>
                                            </div>
                                        </div>
                                        <button style={purgeBtn} onClick={() => handleDelete(c._id)}>PURGE</button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; animation: pulse-anim 2s infinite; margin-right: 8px; }
                @keyframes pulse-anim { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Definitions ---

const containerS = { padding: '10px', minHeight: '100vh', animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerFlex = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'40px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin: 0, fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px' };
const subS = { color: '#64748b', fontSize: '14px', marginTop: '5px', fontWeight:'500' };

const syncBadge = { display:'flex', alignItems:'center', background:'#fff', padding:'10px 18px', borderRadius:'14px', border:'1px solid #f1f5f9', color:'#94a3b8', fontSize:'11px', fontWeight:'800' };

const layoutGrid = { display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1.4fr', gap: '30px' };

const cardS = { background: '#fff', padding: window.innerWidth < 768 ? '25px' : '35px', borderRadius: '40px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' };
const cardHead = (color) => ({ margin: '0 0 25px 0', fontSize: '14px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1px', borderLeft:`5px solid ${color}`, paddingLeft:'15px' });
const nodeHintS = { fontSize:'12px', color:'#94a3b8', marginTop:'-15px', marginBottom:'30px', fontWeight:'600' };

const formS = { display:'flex', flexDirection:'column', gap:'20px' };
const inputGroup = { display:'flex', flexDirection:'column', gap:'8px' };
const labS = { fontSize:'10px', fontWeight:'900', color:'#cbd5e1', textTransform:'uppercase', letterSpacing:'1px' };
const inS = { width: '100%', padding:'16px', borderRadius:'16px', border:'1.5px solid #f1f5f9', outline:'none', fontSize:'14px', fontWeight:'700', color:'#1e293b', background:'#f8fafc', boxSizing:'border-box' };

const gridRowS = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' };

const submitBtn = (color) => ({ width: '100%', padding: '20px', background: color, color: '#fff', border: 'none', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', fontSize: '14px', letterSpacing: '1px', boxShadow: `0 10px 20px ${color}33`, transition:'0.3s' });
const btnDisabledS = { ...submitBtn('#cbd5e1'), background: '#f1f5f9', color: '#cbd5e1', cursor: 'not-allowed', boxShadow:'none' };

const scrollAreaS = { flex: 1, overflowY: 'auto', maxHeight: '550px', paddingRight: '8px' };

const listItemS = { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '20px 0', 
    borderBottom: '1px solid #f8fafc',
    transition: '0.2s'
};

const codeRowS = { display:'flex', alignItems:'center', gap:'12px', marginBottom:'6px' };
const badgeCode = (color) => ({ background:`${color}10`, color: color, padding:'6px 14px', borderRadius:'10px', fontSize:'15px', fontWeight:'900', letterSpacing:'1px', cursor:'pointer' });
const typeTagS = { fontSize:'11px', fontWeight:'800', color:'#1e293b' };

const metaRowS = { display:'flex', gap:'20px', color:'#94a3b8', fontSize:'11px', fontWeight:'700' };

const purgeBtn = { background:'#fff1f2', color:'#f43f5e', border:'none', padding:'8px 15px', borderRadius:'10px', fontWeight:'900', fontSize:'10px', cursor:'pointer' };

const emptyS = { textAlign:'center', padding:'100px 20px', color:'#cbd5e1', fontSize:'14px', fontWeight:'800', textTransform:'uppercase' };
const loaderS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '60vh', background:'#f8fafc', gap:'20px' };

export default CouponManager;