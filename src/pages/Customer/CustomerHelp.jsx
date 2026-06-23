import React, { useState, useEffect, useCallback } from 'react';
import HomeHeader from '../../components/Customer/HomeHeader';
import MobileBottomNav from '../../components/Customer/MobileBottomNav';
import api from '../../services/api';
import { useBranding } from '../../context/BrandingContext';
import { toast } from 'react-toastify';

const CustomerHelp = () => {
    const { settings } = useBranding();
    const [ticket, setTicket] = useState({ subject: '', message: '', priority: 'Normal' });
    const [sending, setSending] = useState(false);

    // 📡 Background Identity Sync
    useEffect(() => {
        document.title = `Support Hub | ${settings.siteName}`;
    }, [settings.siteName]);

    // 🚀 Complaint Submission Protocol
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (ticket.message.length < 10) {
            return toast.warning("Documentation too short. Please provide more details.");
        }

        setSending(true);
        try {
            const res = await api.post('/customer/complaints/add', ticket);
            if (res.data.success) {
                toast.success("🚀 Grievance logged in central registry! Support node will contact you.");
                setTicket({ subject: '', message: '', priority: 'Normal' });
            }
        } catch (err) { 
            toast.error(err.response?.data?.message || "Protocol Interrupted: Submission failed."); 
        } finally { 
            setSending(false); 
        }
    };

    // Admin-defined support coordinates
    const waNumber = settings?.supportMobile || "911234567890";
    const supportEmail = settings?.contactEmail || "support@infrastructure.com";

    return (
        <div style={pageWrapper}>
            <HomeHeader />

            <div style={containerS}>
                {/* --- [A] DYNAMIC HERO SECTION --- */}
                <div style={heroS(settings.themeColor)}>
                    <h1 style={heroTitle}>How can we assist you today?</h1>
                    <p style={heroSub}>Submit a request to the {settings.siteName} support cluster.</p>
                </div>

                <div style={helpGridS}>
                    {/* --- [B] LEFT: CONTACT NODES --- */}
                    <div style={contactColS}>
                        <div style={contactCardS}>
                            <div style={iconS}>📱</div>
                            <div style={{flex:1}}>
                                <h4 style={cardTitle}>Instant WhatsApp Support</h4>
                                <p style={smallS}>Response Protocol: within 15-30 mins</p>
                                <button 
                                    style={waBtnS} 
                                    onClick={() => window.open(`https://wa.me/${waNumber}`)}
                                >
                                    OPEN SECURE CHAT
                                </button>
                            </div>
                        </div>

                        <div style={contactCardS}>
                            <div style={iconS}>📧</div>
                            <div style={{flex:1}}>
                                <h4 style={cardTitle}>Registry Email Query</h4>
                                <p style={smallS}>{supportEmail}</p>
                                <p style={{...smallS, color:'#94a3b8'}}>For legal & data compliance issues.</p>
                            </div>
                        </div>

                        <div style={trustNoteS}>
                            🛡️ Your communication is encrypted via 256-bit SSL infrastructure of {settings.siteName}.
                        </div>
                    </div>

                    {/* --- [C] RIGHT: COMPLAINT ARCHITECTURE --- */}
                    <div style={formCardS}>
                        <h3 style={formHeading}>🚩 Register Official Complaint</h3>
                        <p style={{fontSize:'13px', color:'#64748b', marginBottom:'25px'}}>
                            Your ticket will be assigned a unique Tracking ID upon submission.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div style={inputGroupS}>
                                <label style={labS}>Complaint Subject</label>
                                <input 
                                    style={inS} 
                                    placeholder="e.g. Order Delivery Interruption" 
                                    required 
                                    value={ticket.subject}
                                    onChange={e => setTicket({...ticket, subject: e.target.value})}
                                />
                            </div>

                            <div style={inputGroupS}>
                                <label style={labS}>Priority Protocol</label>
                                <select 
                                    style={inS} 
                                    value={ticket.priority} 
                                    onChange={e => setTicket({...ticket, priority: e.target.value})}
                                >
                                    <option value="Normal">Normal Operation</option>
                                    <option value="High">Urgent Escalation</option>
                                    <option value="Critical">Critical System Failure</option>
                                </select>
                            </div>

                            <div style={inputGroupS}>
                                <label style={labS}>Detailed Documentation</label>
                                <textarea 
                                    style={areaS} 
                                    placeholder="Provide comprehensive details for faster resolution..." 
                                    required
                                    value={ticket.message}
                                    onChange={e => setTicket({...ticket, message: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit" 
                                style={ticket.message.length > 5 ? submitBtnS(settings.themeColor) : disabledBtn} 
                                disabled={sending || ticket.message.length <= 5}
                            >
                                {sending ? 'SYNCHRONIZING...' : '🚀 DEPLOY SUPPORT TICKET'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <MobileBottomNav />
        </div>
    );
};

// --- Enterprise SaaS Design System ---

const pageWrapper = { background: '#f8fafc', minHeight: '100vh', paddingBottom: '120px', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const containerS = { width: '94%', maxWidth: '1200px', margin: '0 auto' };

const heroS = (color) => ({ 
    background: color || '#0f172a', 
    color: '#fff', 
    padding: window.innerWidth < 768 ? '40px 20px' : '60px 40px', 
    borderRadius: '0 0 40px 40px', 
    textAlign: 'center', 
    marginBottom: '40px',
    boxShadow: `0 15px 30px ${color}20`
});

const heroTitle = { fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: '900', margin: 0, letterSpacing: '-1.5px' };
const heroSub = { opacity: 0.7, marginTop: '10px', fontSize: '15px', fontWeight: '500' };

const helpGridS = { 
    display: 'grid', 
    gridTemplateColumns: window.innerWidth < 992 ? '1fr' : '1fr 1.6fr', 
    gap: '30px' 
};

const contactColS = { display:'flex', flexDirection:'column', gap:'20px' };
const contactCardS = { background: '#fff', padding: '25px', borderRadius: '28px', display: 'flex', gap: '20px', alignItems: 'center', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' };

const iconS = { fontSize: '28px', background: '#f8fafc', width: '65px', height: '65px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9' };

const cardTitle = { margin: '0 0 5px 0', fontSize: '16px', fontWeight: '800', color: '#1e293b' };
const smallS = { color: '#64748b', fontSize: '12px', margin: '2px 0', fontWeight: '600' };

const waBtnS = { background: '#22c55e', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', marginTop: '12px', cursor: 'pointer', fontSize: '11px', letterSpacing: '0.5px' };

const formCardS = { background: '#fff', padding: window.innerWidth < 768 ? '25px' : '40px', borderRadius: '35px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' };
const formHeading = { margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a' };

const inputGroupS = { marginBottom: '22px' };
const labS = { display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' };
const inS = { width: '100%', padding: '16px', borderRadius: '16px', border: '1.5px solid #f1f5f9', outline: 'none', background: '#f8fafc', fontSize: '14px', fontWeight: '700', color: '#1e293b', boxSizing: 'border-box' };
const areaS = { ...inS, height: '140px', resize: 'none', lineHeight: '1.6' };

const submitBtnS = (color) => ({ 
    width: '100%', padding: '20px', background: color || '#0f172a', color: '#fff', 
    border: 'none', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', 
    fontSize: '14px', letterSpacing: '1px', boxShadow: `0 10px 20px ${color}33`, transition: '0.3s' 
});
const disabledBtn = { ...submitBtnS('#cbd5e1'), background: '#f1f5f9', color: '#cbd5e1', cursor: 'not-allowed', boxShadow: 'none' };

const trustNoteS = { textAlign:'center', color:'#cbd5e1', fontSize:'11px', fontWeight:'700', marginTop:'15px', lineHeight:'1.5', padding:'0 20px' };

export default CustomerHelp;