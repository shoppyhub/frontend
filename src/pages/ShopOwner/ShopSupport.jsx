import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useBranding } from '../../context/BrandingContext'; // Added for White-labeling

const ShopSupport = () => {
    const { settings } = useBranding();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        priority: 'Normal',
        orderId: ''
    });

    // 1. 📡 Automatic Synchronization Protocol (No Buttons)
    const fetchMyTickets = useCallback(async () => {
        try {
            // Background syncs are silent, only initial load shows spinner
            const res = await api.get('/auth/support/tickets/my');
            if (res.data.success) {
                setTickets(res.data.data || []);
            }
            setLastSynced(new Date().toLocaleTimeString());
            document.title = `Support Hub | ${settings.siteName}`;
        } catch (err) { 
            console.error("Support Node Sync failure."); 
        } finally { 
            setLoading(false); 
        }
    }, [settings.siteName]);

    useEffect(() => { 
        fetchMyTickets(); 
        
        // Auto-refresh when returns to focus (Ensuring real-time response view)
        window.addEventListener('focus', fetchMyTickets);
        return () => window.removeEventListener('focus', fetchMyTickets);
    }, [fetchMyTickets]);

    // 2. 🚀 Grievance Deployment (Submit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);
        try {
            const res = await api.post('/auth/support/ticket/add', formData);
            if (res.data.success) {
                toast.success("Security Note: Support ticket dispatched to master node.");
                setShowForm(false);
                setFormData({ subject: '', message: '', priority: 'Normal', orderId: '' });
                fetchMyTickets();
            }
        } catch (err) { 
            toast.error("Dispatch Protocol Interrupted."); 
        } finally { 
            setIsSending(false); 
        }
    };

    const themeColor = settings?.themeColor || '#0f172a';

    const getStatusStyle = (s) => {
        if (s === 'Open') return { color: '#f43f5e', bg: '#fff1f2' };
        if (s === 'In Progress') return { color: '#f59e0b', bg: '#fffbeb' };
        return { color: '#10b981', bg: '#ecfdf5' };
    };

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Connecting to Helpdesk Cluster...</p>
        </div>
    );

    return (
        <div style={container}>
            {/* --- [A] COMMAND HEADER --- */}
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>🎧 Merchant Support Hub</h2>
                    <p style={subS}>Direct communication link to {settings.siteName} administrative infrastructure.</p>
                </div>
                <div style={{textAlign:'right'}}>
                    <small style={syncText}>Auto-Sync: {lastSynced}</small>
                    <button onClick={() => setShowForm(!showForm)} style={addBtn(themeColor)}>
                        {showForm ? 'CLOSE TICKETING' : '● RAISE NEW TICKET'}
                    </button>
                </div>
            </div>

            {/* --- [B] MODULAR TICKET SUBMISSION FORM --- */}
            {showForm && (
                <div style={formCard}>
                    <div style={cardHeader(themeColor)}>
                        <h3 style={formTitle}>New Grievance Redressal Protocol</h3>
                        <p style={{margin:0, fontSize:'12px', opacity:0.8}}>Ensure all fields are accurate for prioritized resolution.</p>
                    </div>
                    <form onSubmit={handleSubmit} style={formPadding}>
                        <div style={formGrid}>
                            <div style={inputGroup}>
                                <label style={labS}>Subject / Protocol Type *</label>
                                <input 
                                    style={inS} 
                                    placeholder="e.g. Transaction Settlement Interruption" 
                                    value={formData.subject}
                                    onChange={e => setFormData({...formData, subject: e.target.value})}
                                    required 
                                />
                            </div>
                            <div style={inputGroup}>
                                <label style={labS}>Reference Order ID (Optional)</label>
                                <input 
                                    style={inS} 
                                    placeholder="e.g. ORD-992381" 
                                    value={formData.orderId}
                                    onChange={e => setFormData({...formData, orderId: e.target.value})}
                                />
                            </div>
                            <div style={inputGroup}>
                                <label style={labS}>Escalation Level</label>
                                <select style={inS} value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                                    <option value="Normal">Normal (Default)</option>
                                    <option value="High">High (Service Degradation)</option>
                                    <option value="Critical">Critical (System Failure)</option>
                                </select>
                            </div>
                            <div style={{...inputGroup, gridColumn: window.innerWidth < 768 ? 'auto' : 'span 2'}}>
                                <label style={labS}>Detailed Documentation *</label>
                                <textarea 
                                    style={areaS} 
                                    placeholder="Provide a comprehensive technical or operational summary..." 
                                    value={formData.message}
                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                    required
                                ></textarea>
                            </div>
                        </div>
                        <div style={formFooter}>
                            <button type="submit" style={submitBtn(themeColor)} disabled={isSending}>
                                {isSending ? 'DISPATCHING...' : 'AUTHORIZE & DISPATCH TICKET'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- [C] COMMUNICATION REGISTRY --- */}
            <div style={historySection}>
                <h3 style={sectionTitle(themeColor)}>Operational Ticket Registry</h3>
                <div style={ticketList}>
                    {tickets.length === 0 ? (
                        <div style={emptyS}>
                            <div style={{fontSize:'50px', marginBottom:'15px'}}>📋</div>
                            <p>Communication Registry Clean.</p>
                            <small>All support threads will manifest here in real-time.</small>
                        </div>
                    ) : (
                        [...tickets].reverse().map(t => {
                            const status = getStatusStyle(t.status);
                            return (
                                <div key={t._id} style={tCard}>
                                    <div style={tHead}>
                                        <div style={tIdBadge}>REF_ID: TKT-{t._id.slice(-6).toUpperCase()}</div>
                                        <span style={{...tStatusBadge, color: status.color, background: status.bg}}>
                                            ● {t.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <h4 style={tSubject}>{t.subject}</h4>
                                    <p style={tMsg}>{t.message}</p>
                                    <div style={tFooter}>
                                        <div style={footerItem}><small>LEVEL:</small> <b>{t.priority}</b></div>
                                        <div style={footerItem}><small>TIMESTAMP:</small> <b>{new Date(t.createdAt).toLocaleString()}</b></div>
                                    </div>
                                    
                                    {t.status === 'Resolved' && (
                                        <div style={resBox}>
                                            <div style={{fontWeight:'900', marginBottom:'8px', fontSize:'11px'}}>ADMIN RESOLUTION LOG:</div>
                                            <p style={{margin:0}}>{t.resolutionDetails || 'Issue has been successfully audited and resolved.'}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <style>{`
                .spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

// --- Enterprise Visual Definitions ---

const container = { padding: '10px', animation: 'fadeIn 0.4s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerFlex = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'45px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin:0, fontSize:'28px', fontWeight:'900', color:'#0f172a', letterSpacing:'-1px' };
const subS = { color: '#64748b', fontSize:'14px', marginTop:'5px', fontWeight:'500' };

const syncText = { display:'block', fontSize:'10px', color:'#cbd5e1', fontWeight:'800', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'1px' };
const addBtn = (color) => ({ background: color, color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '12px', boxShadow: `0 10px 20px ${color}33`, transition:'0.3s' });

const formCard = { background:'#fff', borderRadius:'35px', border:'1px solid #f1f5f9', marginBottom:'45px', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.05)', overflow:'hidden' };
const cardHeader = (color) => ({ padding:'25px 40px', background: color, color:'#fff' });
const formTitle = { margin:0, fontSize:'18px', fontWeight:'900', letterSpacing:'-0.5px', marginBottom:'5px' };
const formPadding = { padding: window.innerWidth < 768 ? '25px' : '40px' };

const formGrid = { display:'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap:'25px' };
const inputGroup = { display:'flex', flexDirection:'column', gap:'10px' };
const labS = { fontSize:'10px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px' };
const inS = { padding:'16px', borderRadius:'16px', border:'1.5px solid #f1f5f9', background:'#f8fafc', fontWeight:'700', outline:'none', fontSize:'14px', color:'#1e293b' };
const areaS = { ...inS, height:'150px', resize:'none', lineHeight:'1.6' };

const formFooter = { marginTop:'30px', borderTop:'1.5px solid #f8fafc', paddingTop:'30px', textAlign:'right' };
const submitBtn = (color) => ({ padding:'18px 45px', background: color, color:'#fff', border:'none', borderRadius:'18px', fontWeight:'900', cursor:'pointer', fontSize:'14px', boxShadow:`0 10px 20px ${color}44`, transition:'0.3s' });

const historySection = { marginTop:'50px' };
const sectionTitle = (color) => ({ fontSize:'12px', fontWeight:'900', color: color, textTransform:'uppercase', letterSpacing:'2px', marginBottom:'30px', paddingLeft:'15px', borderLeft:`5px solid ${color}` });
const ticketList = { display:'flex', flexDirection:'column', gap:'25px' };

const tCard = { background:'#fff', padding:'30px', borderRadius:'32px', border:'1px solid #f1f5f9', boxShadow:'0 10px 25px rgba(0,0,0,0.02)', animation: 'fadeIn 0.5s ease' };
const tHead = { display:'flex', justifyContent:'space-between', marginBottom:'20px', alignItems:'center' };
const tIdBadge = { background:'#f8fafc', padding:'6px 14px', borderRadius:'10px', fontSize:'11px', fontWeight:'900', color:'#94a3b8', border:'1px solid #f1f5f9', letterSpacing:'1px' };
const tStatusBadge = { padding:'6px 16px', borderRadius:'12px', fontSize:'10px', fontWeight:'900', letterSpacing:'1px' };

const tSubject = { margin:'0 0 12px 0', fontSize:'18px', fontWeight:'800', color:'#0f172a', letterSpacing:'-0.5px' };
const tMsg = { fontSize:'14px', color:'#475569', lineHeight:'1.8', margin:0 };

const tFooter = { display:'flex', justifyContent:'space-between', marginTop:'25px', color:'#94a3b8', borderTop:'1px solid #f8fafc', paddingTop:'20px', flexWrap:'wrap', gap:'15px' };
const footerItem = { display:'flex', alignItems:'center', gap:'8px' };

const resBox = { marginTop:'25px', padding:'25px', background:'#ecfdf5', borderRadius:'22px', border:'1px solid #d1fae5', fontSize:'14px', color:'#065f46', lineHeight:'1.7' };

const loaderS = { display:'flex', flexDirection:'column', height:'70vh', justifyContent:'center', alignItems:'center', fontWeight:'900', color:'#94a3b8', fontSize:'14px', gap:'15px' };
const emptyS = { padding:'80px 40px', textAlign:'center', color:'#cbd5e1', background:'#fff', borderRadius:'40px', border:'1px dashed #e2e8f0' };

export default ShopSupport;