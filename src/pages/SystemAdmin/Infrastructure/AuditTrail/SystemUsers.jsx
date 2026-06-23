import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from 'services/api'; 
import { useBranding } from 'context/BrandingContext';

const SystemUsers = () => {
    const navigate = useNavigate();
    const { settings } = useBranding();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchCustomers = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            setIsRefreshing(true);
            const res = await api.get('/admin/users/all'); 
            if (res.data.success) {
                setCustomers(res.data.data);
            }
        } catch (err) {
            toast.error("Cloud Sync Error: Connection lost.");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const toggleStatus = async (id, currentStatus) => {
        const action = currentStatus ? 'SUSPEND' : 'ACTIVATE';
        if (!window.confirm(`Protocol: ${action} user access node?`)) return;
        try {
            await api.put(`/admin/users/update/${id}`, { isActive: !currentStatus });
            toast.success(`Identity node ${action}ed`);
            fetchCustomers(true);
        } catch (err) { toast.error("Modulation failure."); }
    };

    const adjustWallet = async (userId) => {
        const amount = window.prompt("Ledger Adjustment: (+ for Credit, - for Debit)");
        if (!amount || isNaN(amount)) return;
        try {
            const type = Number(amount) > 0 ? 'Credit' : 'Debit';
            await api.put(`/admin/users/update/${userId}`, { 
                walletAction: { amount: Math.abs(amount), type } 
            });
            toast.success("Ledger entry synchronized.");
            fetchCustomers(true);
        } catch (err) { toast.error("Financial sync failed."); }
    };

    const filtered = useMemo(() => {
        return customers.filter(c => 
            `${c.fullName} ${c.mobile} ${c.email} ${c.generatedId || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customers, searchTerm]);

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return (
        <div style={fullPageLoader}>
            <div className="rkd-main-spinner"></div>
            <p style={loaderTxt}>ESTABLISHING SECURE CONNECTION...</p>
        </div>
    );

    return (
        <div style={masterWrapper}>
            {/* --- ANALYTICS STRIP (Responsive) --- */}
            <div className="analytics-strip" style={analyticsStrip}>
                <SmallStat icon="👥" label="REGISTERED" val={customers.length} col={themeColor} />
                <SmallStat icon="🟢" label="OPERATIONAL" val={customers.filter(c=>c.isActive).length} col="#10b981" />
                <SmallStat icon="💰" label="WALLET" val={`₹${customers.reduce((a,c)=>a+(c.wallet?.balance||0),0).toLocaleString()}`} col="#6366f1" />
                <button onClick={() => fetchCustomers()} className="sync-btn-resp" style={syncBtn(isRefreshing)} disabled={isRefreshing}>
                    {isRefreshing ? "..." : "🔄 SYNC"}
                </button>
            </div>

            <div style={contentPadding} className="content-resp">
                {/* --- SEARCH HUB --- */}
                <div style={actionRow}>
                    <div className="search-hub-resp" style={searchHub}>
                        <span>🔍</span>
                        <input 
                            placeholder="Find by name, mobile, ID..." 
                            style={searchIn} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* --- DESKTOP TABLE VIEW (Hidden on Mobile) --- */}
                <div className="desktop-only" style={tableFrame}>
                    <table style={universalTable}>
                        <thead>
                            <tr style={thRow}>
                                <th style={thCell}>IDENTITY</th>
                                <th style={thCell}>LOGIN ID</th>
                                <th style={thCell}>WALLETS</th>
                                <th style={thCell}>STATUS</th>
                                <th style={thCell}>JOINED</th>
                                <th style={{...thCell, textAlign:'right'}}>COMMAND</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(c => (
                                <tr key={c._id} className="row-item" style={trBody}>
                                    <td style={tdCell}>
                                        <div style={userProfileCell}>
                                            {c.photo ? <img src={c.photo} style={avatarS} alt="" /> : <div style={initialsS(themeColor)}>{c.fullName?.charAt(0)}</div>}
                                            <div>
                                                <div style={uNameS}>{c.fullName}</div>
                                                <div style={uContactS}>{c.mobile}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tdCell}><code style={idLabel}>{c.email || c.mobile || c.generatedId || 'N/A'}</code></td>
                                    <td style={tdCell}>
                                        <div style={walletBadge(c.wallet?.balance)}>
                                            <span>₹{c.wallet?.balance?.toLocaleString() || 0}</span>
                                            <button onClick={() => adjustWallet(c._id)} style={adjustMini}>⚙️</button>
                                        </div>
                                    </td>
                                    <td style={tdCell}>
                                        <div onClick={() => toggleStatus(c._id, c.isActive)} style={statusPill(c.isActive)}>
                                            <span style={dotS(c.isActive)}></span>
                                            {c.isActive ? 'ACTIVE' : 'LOCKED'}
                                        </div>
                                    </td>
                                    <td style={tdCell}><span style={dateTxt}>{new Date(c.createdAt).toLocaleDateString()}</span></td>
                                    <td style={{...tdCell, textAlign:'right'}}>
                                        <button onClick={() => navigate(`/admin/customer-details/${c._id}`)} style={manageBtn(themeColor)}>AUDIT</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- MOBILE CARD VIEW (Hidden on Desktop) --- */}
                <div className="mobile-only">
                    {filtered.map(c => (
                        <div key={c._id} style={mobileCard}>
                            <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'15px'}}>
                                {c.photo ? <img src={c.photo} style={avatarM} alt="" /> : <div style={initialsM(themeColor)}>{c.fullName?.charAt(0)}</div>}
                                <div style={{flex:1}}>
                                    <div style={{fontWeight:'850', fontSize:'15px', color:'#1e293b'}}>{c.fullName}</div>
                                    <code style={{fontSize:'10px', color:'#94a3b8'}}>{c.email || c.mobile || 'N/A'}</code>
                                </div>
                                <div onClick={() => toggleStatus(c._id, c.isActive)} style={statusPill(c.isActive)}>
                                    {c.isActive ? 'ACTIVE' : 'LOCK'}
                                </div>
                            </div>
                            
                            <div style={cardInfoRow}>
                                <div style={{flex:1}}>
                                    <div style={cardLabel}>CONTACT</div>
                                    <div style={cardValue}>{c.mobile}</div>
                                </div>
                                <div style={{flex:1, textAlign:'right'}}>
                                    <div style={cardLabel}>WALLET</div>
                                    <div style={{...cardValue, color:'#10b981', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'5px'}}>
                                        ₹{c.wallet?.balance || 0}
                                        <button onClick={() => adjustWallet(c._id)} style={adjustMini}>⚙️</button>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => navigate(`/admin/customer-details/${c._id}`)} style={{...manageBtn(themeColor), width:'100%', marginTop:'10px', padding:'12px'}}>
                                VIEW FULL AUDIT
                            </button>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && <div style={noDataTxt}>No identity nodes discovered.</div>}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .rkd-main-spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top-color: ${themeColor}; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                
                /* DESKTOP VS MOBILE LOGIC */
                @media (min-width: 769px) {
                    .mobile-only { display: none !important; }
                    .desktop-only { display: block !important; }
                }

                @media (max-width: 768px) {
                    .desktop-only { display: none !important; }
                    .mobile-only { display: block !important; }
                    .analytics-strip { 
                        display: grid !important; 
                        grid-template-columns: 1fr 1fr; 
                        padding: 15px !important; 
                        gap: 10px !important;
                    }
                    .search-hub-resp { width: 100% !important; }
                    .sync-btn-resp { grid-column: span 2; margin: 0 !important; width: 100%; }
                    .content-resp { padding: 15px !important; }
                }

                @media (max-width: 480px) {
                    .analytics-strip { grid-template-columns: 1fr; }
                    .sync-btn-resp { grid-column: span 1; }
                }
            `}</style>
        </div>
    );
};

// --- Styles & Components ---
const SmallStat = ({ icon, label, val, col }) => (
    <div style={miniStatCard}>
        <span style={iconCircle(col)}>{icon}</span>
        <div>
            <div style={miniLabel}>{label}</div>
            <div style={miniVal}>{val}</div>
        </div>
    </div>
);

const masterWrapper = { background:'#f8fafc', minHeight:'100vh', padding:0, margin:0, fontFamily:"'Plus Jakarta Sans', sans-serif", animation:'fadeIn 0.4s ease' };
const contentPadding = { padding: '0 30px 30px 30px' };
const analyticsStrip = { display:'flex', gap:'15px', padding:'15px 30px', background:'#fff', borderBottom:'1px solid #e2e8f0', marginBottom:'25px', alignItems:'center' };
const miniStatCard = { display:'flex', alignItems:'center', gap:'10px', background:'#f8fafc', padding:'10px 15px', borderRadius:'14px', border:'1px solid #edf2f7', flex:1 };
const iconCircle = (col) => ({ width:'30px', height:'30px', borderRadius:'8px', background:`${col}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' });
const miniLabel = { fontSize:'8px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase' };
const miniVal = { fontSize:'15px', fontWeight:'900', color:'#1e293b' };
const syncBtn = (syncing) => ({ padding:'12px', borderRadius:'12px', border:'1.5px solid #e2e8f0', background:'#fff', fontWeight:'900', fontSize:'11px', color:'#64748b', cursor:'pointer', marginLeft:'auto', opacity: syncing ? 0.5 : 1 });
const actionRow = { marginBottom:'20px' };
const searchHub = { display:'flex', alignItems:'center', gap:'12px', background:'#fff', padding:'0 15px', borderRadius:'14px', border:'1px solid #e2e8f0', boxShadow:'0 4px 12px rgba(0,0,0,0.02)', width:'350px' };
const searchIn = { border:'none', padding:'15px 0', outline:'none', fontSize:'14px', fontWeight:'600', width:'100%', background:'transparent' };
const tableFrame = { background:'#fff', borderRadius:'20px', border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 10px 30px rgba(0,0,0,0.03)' };
const universalTable = { width:'100%', borderCollapse:'collapse', textAlign:'left' };
const thRow = { background:'#f8fafc', borderBottom:'2px solid #f1f5f9' };
const thCell = { padding:'15px 20px', fontSize:'9px', color:'#94a3b8', fontWeight:'900', textTransform:'uppercase', letterSpacing:'1.2px' };
const tdCell = { padding:'15px 20px', fontSize:'13px', borderBottom:'1px solid #f8fafc' };
const trBody = { transition:'0.2s' };
const userProfileCell = { display:'flex', alignItems:'center', gap:'12px' };
const avatarS = { width:'35px', height:'35px', borderRadius:'10px', objectFit:'cover' };
const initialsS = (col) => ({ width:'35px', height:'35px', borderRadius:'10px', background:`${col}10`, color:col, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'14px' });
const uNameS = { fontWeight:'850', color:'#1e293b' };
const uContactS = { fontSize:'11px', color:'#94a3b8' };
const idLabel = { background:'#f1f5f9', padding:'3px 6px', borderRadius:'5px', fontSize:'10px', fontWeight:'800', color:'#64748b' };
const walletBadge = (bal) => ({ display:'flex', alignItems:'center', gap:'8px', background: bal <= 0 ? '#fff1f2' : '#f0fdf4', padding:'5px 10px', borderRadius:'8px', color: bal <= 0 ? '#ef4444' : '#10b981', fontWeight:'900', fontSize:'12px' });
const adjustMini = { background:'#fff', border:'1px solid #e2e8f0', padding:'2px 5px', borderRadius:'5px', cursor:'pointer', fontSize:'10px' };
const statusPill = (active) => ({ display:'flex', alignItems:'center', gap:'5px', background: active ? '#ecfdf5' : '#fff1f2', color: active ? '#10b981' : '#f43f5e', padding:'6px 12px', borderRadius:'8px', fontSize:'10px', fontWeight:'900', cursor:'pointer' });
const dotS = (active) => ({ width:'5px', height:'5px', borderRadius:'50%', background: active ? '#10b981' : '#f43f5e' });
const dateTxt = { fontSize:'11px', color:'#94a3b8', fontWeight:'700' };
const manageBtn = (col) => ({ background: col, color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontSize: '11px', fontWeight: '900' });
const mobileCard = { background:'#fff', padding:'15px', borderRadius:'18px', border:'1px solid #e2e8f0', marginBottom:'15px', boxShadow:'0 4px 15px rgba(0,0,0,0.02)' };
const avatarM = { width:'45px', height:'45px', borderRadius:'12px', objectFit:'cover' };
const initialsM = (col) => ({ width:'45px', height:'45px', borderRadius:'12px', background:`${col}10`, color:col, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'18px' });
const cardInfoRow = { display:'flex', justifyContent:'space-between', padding:'10px 0', borderTop:'1px solid #f1f5f9', borderBottom:'1px solid #f1f5f9', marginBottom:'10px' };
const cardLabel = { fontSize:'9px', fontWeight:'900', color:'#94a3b8', marginBottom:'3px' };
const cardValue = { fontSize:'13px', fontWeight:'750', color:'#475569' };
const fullPageLoader = { height:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' };
const loaderTxt = { fontWeight:'900', color:'#94a3b8', letterSpacing:'2px', fontSize:'11px', marginTop:'15px' };
const noDataTxt = { padding:'60px', textAlign:'center', color:'#cbd5e1', fontWeight:'900' };

export default SystemUsers;