import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useBranding } from '../../context/BrandingContext';
import { useAuth } from '../../context/AuthContext';

const AdminHeader = ({ onToggleSidebar }) => {
    const navigate = useNavigate();
    const { settings } = useBranding();
    const { user, logout } = useAuth();
    
    // --- States ---
    const [dateTime, setDateTime] = useState({
        time: "",
        date: "",
        day: ""
    });
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [globalRevenue, setGlobalRevenue] = useState(0);

    // 1. 🕒 Intelligent Console Clock
    const updateClock = useCallback(() => {
        const now = new Date();
        setDateTime({
            time: now.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true }),
            date: now.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }),
            day: now.toLocaleDateString('en-GB', { weekday:'long' })
        });
    }, []);

    // 2. 📡 Real-time Ecosystem Pulse (Stats & Revenue)
    const fetchStats = useCallback(async () => {
        try {
            const res = await api.get('/admin/stats/global');
            if (res.data?.success) {
                setPendingCount(res.data.stats.pendingShops || 0);
                setGlobalRevenue(res.data.stats.revenue || 0);
            }
        } catch (err) { /* Silent sync */ }
    }, []);

    useEffect(() => {
        updateClock();
        fetchStats();
        const clockTimer = setInterval(updateClock, 1000);
        const statsTimer = setInterval(fetchStats, 60000); // 1 min sync cycle

        return () => {
            clearInterval(clockTimer);
            clearInterval(statsTimer);
        };
    }, [updateClock, fetchStats]);

    // --- Dynamic Identity Constants ---
    const bgColor = settings?.themeColor || '#0f172a';
    const txtColor = settings?.headerTextColor || '#ffffff';

    const handleLogout = () => {
        if (window.confirm("CRITICAL: Terminate Master Administrative Session?")) {
            logout();
            navigate('/login');
        }
    };

    return (
        <header style={headerS(bgColor, txtColor)}>
            {/* --- [A] LEFT: LOGO & COMMAND ACCESS --- */}
            <div style={leftSection}>
                <button onClick={onToggleSidebar} style={hamburgerBtn(txtColor)}>☰</button>
                
                <div style={brandGroup} onClick={() => navigate('/admin')}>
                    <div style={logoWrapper}>
                        {settings.logoUrl ? (
                            <img src={settings.logoUrl} style={logoImgS} alt="Logo" />
                        ) : (
                            <div style={logoBadge(bgColor, txtColor)}>{settings.siteName?.charAt(0)}</div>
                        )}
                    </div>
                    <div style={brandText}>
                        <span style={brandMain(txtColor)}>{settings.siteName}</span>
                        <span style={brandSub(txtColor)}>COMMAND CENTER</span>
                    </div>
                </div>
            </div>

            {/* --- [B] CENTER: LIVE INFRASTRUCTURE METRICS (Desktop Only) --- */}
            <div style={centerSection}>
                <div style={metricNode}>
                    <div style={statusTag}><span className="pulse-dot"></span> CLUSTER LIVE</div>
                    <span style={welcomeTxt(txtColor)}>Global Yield: ₹{globalRevenue.toLocaleString()}</span>
                </div>

                <div style={consoleClockS(txtColor)}>
                    <div style={clockText(txtColor)}>{dateTime.time}</div>
                    <div style={dateBox}>
                        <span style={dayLabel(txtColor)}>{dateTime.day}</span>
                        <span style={dateLabel(txtColor)}>{dateTime.date}</span>
                    </div>
                </div>
            </div>

            {/* --- [C] RIGHT: SYSTEM ALERTS & PROFILE --- */}
            <div style={rightSection}>
                {/* Pending Request Alert Node */}
                <div 
                    style={iconActionBox(txtColor)} 
                    title="Queue Management"
                    onClick={() => navigate('/admin/requests')}
                >
                    <span style={{fontSize: '20px'}}>🔔</span>
                    {pendingCount > 0 && <span style={badgeS}>{pendingCount}</span>}
                </div>

                <div style={divider(txtColor)}></div>

                {/* Administrative Identity Node */}
                <div 
                    style={profileTrigger} 
                    onMouseEnter={() => setShowProfileMenu(true)}
                    onMouseLeave={() => setShowProfileMenu(false)}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                    <div style={avatarS(bgColor, txtColor)}>
                        {user?.fullName?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div style={profileText}>
                        <div style={uName(txtColor)}>{user?.fullName || "Admin Node"}</div>
                        <div style={uRole(txtColor)}>ROOT_ACCESS_AUTHORIZED</div>
                    </div>

                    {/* Profile Dropdown Menu */}
                    {showProfileMenu && (
                        <div style={dropdownProfile}>
                            <div style={dropHeader}>COMMAND SETTINGS</div>
                            <div style={dropItemP} onClick={() => navigate('/admin/profile-details')}>👤 Identity Registry</div>
                            <div style={dropItemP} onClick={() => navigate('/admin/security')}>🔐 Security Vault</div>
                            <div style={itemDivider}></div>
                            <div style={logoutBtn} onClick={handleLogout}>🚪 TERMINATE SESSION</div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .pulse-dot {
                    width: 7px; height: 7px; background: #10b981; border-radius: 50%;
                    display: inline-block; animation: pulse-anim 2s infinite; margin-right: 10px;
                    box-shadow: 0 0 10px #10b981;
                }
                @keyframes pulse-anim { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
                @keyframes dropdownFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </header>
    );
};

// --- Enterprise Visual Architecture (SaaS Styled) ---

const headerS = (bg, txt) => ({
    height: '85px', width: '100%',
    background: bg,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 25px', position: 'fixed', top: 0, left: 0, zIndex: 9000,
    boxSizing: 'border-box', borderBottom: `1px solid rgba(255,255,255,0.08)`,
    boxShadow: '0 10px 40px rgba(0,0,0,0.25)'
});

const leftSection = { display: 'flex', alignItems: 'center', gap: '20px' };
const hamburgerBtn = (txt) => ({ background: 'none', border: 'none', color: txt, fontSize: '24px', cursor: 'pointer', display: window.innerWidth > 1024 ? 'none' : 'block' });

const brandGroup = { display:'flex', alignItems:'center', gap:'15px', cursor:'pointer' };
const logoWrapper = { width:'45px', height:'45px', background:'#fff', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', padding:'3px', boxShadow:'0 4px 10px rgba(0,0,0,0.1)' };
const logoImgS = { width: '100%', height: '100%', objectFit: 'contain' };
const logoBadge = (bg, txt) => ({ width:'100%', height:'100%', background: bg, color: txt, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'22px' });

const brandText = { display:'flex', flexDirection:'column' };
const brandMain = (txt) => ({ color: txt, fontWeight:'900', fontSize:'20px', letterSpacing:'-0.5px' });
const brandSub = (txt) => ({ color: txt, opacity: 0.5, fontSize:'8px', fontWeight:'800', letterSpacing:'1.5px', marginTop:'2px' });

const centerSection = { display: window.innerWidth < 1100 ? 'none' : 'flex', alignItems: 'center', gap: '40px', flex: 1, justifyContent: 'center' };
const metricNode = { textAlign:'left' };
const welcomeTxt = (txt) => ({ fontSize:'14px', fontWeight:'800', color: txt, letterSpacing:'0.5px' });
const statusTag = { fontSize:'9px', fontWeight:'900', color:'#10b981', display:'flex', alignItems:'center', marginBottom:'4px' };

const consoleClockS = (txt) => ({ display:'flex', alignItems:'center', gap:'20px', background:'rgba(255,255,255,0.05)', padding:'10px 20px', borderRadius:'15px', border:'1px solid rgba(255,255,255,0.1)' });
const clockText = (txt) => ({ fontSize:'20px', fontWeight:'900', color: txt, fontFamily:"'JetBrains Mono', monospace", borderRight:'1px solid rgba(255,255,255,0.1)', paddingRight:'20px' });
const dateBox = { display:'flex', flexDirection:'column' };
const dayLabel = (txt) => ({ fontSize:'9px', fontWeight:'900', color: txt, opacity:0.6, textTransform:'uppercase' });
const dateLabel = (txt) => ({ fontSize:'11px', fontWeight:'700', color: txt });

const rightSection = { display:'flex', alignItems:'center', gap:'20px', position:'relative' };
const iconActionBox = (txt) => ({ 
    position:'relative', background:'rgba(255,255,255,0.08)', width:'42px', height:'42px', 
    borderRadius:'12px', display:'flex', justifyContent:'center', alignItems:'center', 
    cursor:'pointer', color: txt, transition:'0.3s'
});
const badgeS = { position:'absolute', top:'-5px', right:'-5px', background:'#f43f5e', color:'#fff', fontSize:'10px', padding:'3px 7px', borderRadius:'50%', fontWeight:'900', border:'2px solid #0f172a' };

const divider = (txt) => ({ width:'1px', height:'35px', background: txt, opacity: 0.15 });

const profileTrigger = { display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', position:'relative', padding:'5px' };
const avatarS = (bg, txt) => ({ width:'42px', height:'42px', background: `linear-gradient(135deg, ${bg} 0%, #1e293b 100%)`, borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', color: txt, fontSize:'18px', border:`2px solid \${txt}20` });
const profileText = { display: window.innerWidth < 1250 ? 'none' : 'block' };
const uName = (txt) => ({ fontSize:'13px', fontWeight:'800', color: txt });
const uRole = (txt) => ({ fontSize:'8px', color: txt, opacity: 0.5, fontWeight:'900', textTransform:'uppercase', marginTop:'2px' });

const dropdownProfile = { 
    position:'absolute', top:'55px', right:0, width:'250px', background:'#fff', 
    borderRadius:'22px', padding:'12px', boxShadow:'0 25px 60px rgba(0,0,0,0.4)', 
    border:'1px solid #f1f5f9', animation: 'dropdownFade 0.3s ease' 
};
const dropHeader = { padding:'15px', fontSize:'10px', fontWeight:'900', color:'#94a3b8', letterSpacing:'1.5px', borderBottom:'1px solid #f8fafc' };
const dropItemP = { padding:'14px 18px', fontSize:'13px', color:'#475569', fontWeight:'700', cursor:'pointer', borderRadius:'14px', transition:'0.2s' };
const itemDivider = { height:'1px', background:'#f1f5f9', margin:'8px 0' };
const logoutBtn = { ...dropItemP, color:'#f43f5e', background:'#fff1f2', marginTop:'5px' };

export default AdminHeader;