import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext'; // रास्ता ठीक किया गया
import { useBranding } from '../../context/BrandingContext'; // रास्ता ठीक किया गया
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; // पक्का करें कि यह भी सही फोल्डर में है

const StateHeader = ({ stateName, onToggleSidebar }) => {
    const { user, logout } = useAuth();
    const { settings } = useBranding();
    const navigate = useNavigate();
    
    // --- States ---
    const [dateTime, setDateTime] = useState({
        time: "",
        date: "",
        day: ""
    });
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [alertCount, setAlertCount] = useState(0);

    const updateClock = useCallback(() => {
        const now = new Date();
        setDateTime({
            time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
            date: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            day: now.toLocaleDateString('en-IN', { weekday: 'long' })
        });
    }, []);

    const fetchStateStats = useCallback(async () => {
        try {
            const res = await api.get('/admin/stats/global');
            if (res.data?.success) {
                setAlertCount(res.data.stats.pendingShops || 0);
            }
        } catch (err) { /* Silent sync */ }
    }, []);

    useEffect(() => {
        updateClock();
        fetchStateStats();
        const clockTimer = setInterval(updateClock, 1000);
        const statsTimer = setInterval(fetchStateStats, 60000);
        return () => {
            clearInterval(clockTimer);
            clearInterval(statsTimer);
        };
    }, [updateClock, fetchStateStats]);

    const bgColor = settings?.themeColor || '#0f172a';
    const txtColor = settings?.headerTextColor || '#ffffff';

    const handleLogout = () => {
        if (window.confirm("CRITICAL: Terminate secure State Administrative session?")) {
            logout();
            navigate('/login');
        }
    };

    return (
        <header style={headerS(bgColor, txtColor)}>
            <div style={leftSection}>
                <button onClick={onToggleSidebar} style={hamburgerBtn(txtColor)}>☰</button>
                <div style={brandGroup} onClick={() => navigate('/state-admin')}>
                    <div style={logoWrapper}>
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} style={logoImgS} alt="Logo" />
                        ) : (
                            <div style={logoBadge(bgColor, txtColor)}>{settings?.siteName?.charAt(0)}</div>
                        )}
                    </div>
                    <div style={brandText}>
                        <span style={brandMain(txtColor)}>{settings?.siteName || 'RKD_MART'}</span>
                        <div style={stateTag(txtColor)}>
                             <span className="online-indicator"></span>
                             {stateName?.toUpperCase() || user?.assignedState?.toUpperCase() || 'SYSTEM'} STATE HUB
                        </div>
                    </div>
                </div>
            </div>

            <div style={centerSection}>
                <div style={consoleClockS(txtColor)}>
                    <div style={clockText(txtColor)}>{dateTime.time}</div>
                    <div style={dateBox}>
                        <span style={dayLabel(txtColor)}>{dateTime.day}</span>
                        <span style={dateLabel(txtColor)}>{dateTime.date}</span>
                    </div>
                </div>
            </div>

            <div style={rightSection}>
                <div style={iconActionBox(txtColor)} onClick={() => navigate('/state-admin/requests')}>
                    <span style={{fontSize: '20px'}}>🔔</span>
                    {alertCount > 0 && <span style={badgeS}>{alertCount}</span>}
                </div>
                <div style={divider(txtColor)}></div>
                <div style={profileTrigger} onMouseEnter={() => setIsProfileOpen(true)} onMouseLeave={() => setIsProfileOpen(false)}>
                    <div style={avatarWrapper(bgColor, txtColor)}>
                        {user?.photo ? (
                            <img src={user.photo} alt="StateAdmin" style={avatarImg} />
                        ) : (
                            <div style={avatarFallback(txtColor)}>{user?.fullName?.charAt(0).toUpperCase()}</div>
                        )}
                        <div style={activePulse}></div>
                    </div>
                    <div style={profileText}>
                        <div style={uName(txtColor)}>{user?.fullName || "State Admin"}</div>
                        <div style={uIdRow}>
                            <span style={uIdBadge(txtColor)}>ID: {user?.generatedId || 'OFFLINE'}</span>
                        </div>
                    </div>
                    {isProfileOpen && (
                        <div style={dropdownProfile}>
                            <div style={dropHeader}>STATE COMMANDER PANEL</div>
                            <div style={dropItemP} onClick={() => navigate('/state-admin/profile')}>👤 Regional Profile</div>
                            <div style={dropItemP} onClick={() => navigate('/state-admin/security')}>🔐 Security Vault</div>
                            <div style={itemDivider}></div>
                            <div style={logoutBtn} onClick={handleLogout}>🚪 TERMINATE SESSION</div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .online-indicator { width: 7px; height: 7px; background: #3b82f6; border-radius: 50%; display: inline-block; margin-right: 8px; box-shadow: 0 0 8px #3b82f6; }
                @keyframes pulse-anim { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
                @keyframes dropdownFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </header>
    );
};

// Styles (Fix: Template literals like \${txt} were incorrect in your previous structure, using ${txt} now)
const headerS = (bg, txt) => ({ height: '85px', width: '100%', background: bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 25px', position: 'fixed', top: 0, left: 0, zIndex: 9000, boxSizing: 'border-box', borderBottom: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' });
const leftSection = { display: 'flex', alignItems: 'center', gap: '20px' };
const hamburgerBtn = (txt) => ({ background: 'none', border: 'none', color: txt, fontSize: '24px', cursor: 'pointer', display: window.innerWidth > 1024 ? 'none' : 'block' });
const brandGroup = { display:'flex', alignItems:'center', gap:'15px', cursor:'pointer' };
const logoWrapper = { width:'45px', height:'45px', background:'#fff', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', padding:'3px', boxShadow:'0 4px 10px rgba(0,0,0,0.1)' };
const logoImgS = { width: '100%', height: '100%', objectFit: 'contain' };
const logoBadge = (bg, txt) => ({ width:'100%', height:'100%', background: bg, color: txt, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'22px' });
const brandText = { display:'flex', flexDirection:'column' };
const brandMain = (txt) => ({ color: txt, fontWeight:'900', fontSize:'18px', letterSpacing:'-0.5px' });
const stateTag = (txt) => ({ color: txt, opacity: 0.7, fontSize: '9px', fontWeight: '900', letterSpacing: '1px', marginTop: '2px', display:'flex', alignItems:'center' });
const centerSection = { display: window.innerWidth < 1100 ? 'none' : 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' };
const consoleClockS = (txt) => ({ display:'flex', alignItems:'center', gap:'20px', background:'rgba(255,255,255,0.06)', padding:'10px 22px', borderRadius:'16px', border:`1px solid ${txt}20` });
const clockText = (txt) => ({ fontSize:'22px', fontWeight:'900', color: txt, fontFamily:"'JetBrains Mono', monospace", borderRight:`1px solid ${txt}30`, paddingRight:'20px' });
const dateBox = { display:'flex', flexDirection:'column' };
const dayLabel = (txt) => ({ fontSize:'9px', fontWeight:'900', color: txt, opacity:0.6, textTransform:'uppercase' });
const dateLabel = (txt) => ({ fontSize:'11px', fontWeight:'700', color: txt });
const rightSection = { display:'flex', alignItems:'center', gap:'18px', position:'relative' };
const iconActionBox = (txt) => ({ position:'relative', background:'rgba(255,255,255,0.08)', width:'42px', height:'42px', borderRadius:'12px', display:'flex', justifyContent:'center', alignItems:'center', cursor:'pointer', color: txt, transition:'0.3s', border:`1px solid ${txt}15` });
const badgeS = { position:'absolute', top:'-5px', right:'-5px', background:'#f43f5e', color:'#fff', fontSize:'10px', padding:'3px 7px', borderRadius:'50%', fontWeight:'900' };
const divider = (txt) => ({ width:'1px', height:'35px', background: txt, opacity: 0.15 });
const profileTrigger = { display:'flex', alignItems:'center', gap:'14px', cursor:'pointer', position:'relative', padding:'5px' };
const avatarWrapper = (bg, txt) => ({ position: 'relative', width:'48px', height:'48px', background: `linear-gradient(135deg, ${bg} 0%, #1e293b 100%)`, borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', border: `2px solid ${txt}30`, overflow:'visible' });
const avatarImg = { width:'100%', height:'100%', borderRadius:'12px', objectFit:'cover' };
const avatarFallback = (txt) => ({ color: txt, fontSize:'20px', fontWeight:'900' });
const activePulse = { position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', background: '#10b981', border: '2px solid #0f172a', borderRadius: '50%', animation: 'pulse-anim 2s infinite' };
const profileText = { display: window.innerWidth < 1300 ? 'none' : 'block' };
const uName = (txt) => ({ fontSize:'14px', fontWeight:'800', color: txt });
const uIdRow = { display:'flex', marginTop:'3px' };
const uIdBadge = (txt) => ({ fontSize:'9px', background:`${txt}15`, padding:'2px 8px', borderRadius:'4px', color: txt, fontWeight:'900', opacity: 0.8 });
const dropdownProfile = { position:'absolute', top:'60px', right:0, width:'260px', background:'#fff', borderRadius:'22px', padding:'12px', boxShadow:'0 25px 60px rgba(0,0,0,0.4)', border:'1px solid #f1f5f9', animation: 'dropdownFade 0.3s ease' };
const dropHeader = { padding:'15px', fontSize:'10px', fontWeight:'900', color:'#94a3b8', letterSpacing:'1.5px', borderBottom:'1px solid #f8fafc' };
const dropItemP = { padding:'12px 15px', fontSize:'13px', color:'#475569', fontWeight:'700', cursor:'pointer', borderRadius:'14px', transition:'0.2s' };
const itemDivider = { height:'1px', background:'#f1f5f9', margin:'8px 0' };
const logoutBtn = { ...dropItemP, color:'#f43f5e', background:'#fff1f2', marginTop:'5px' };

export default StateHeader;