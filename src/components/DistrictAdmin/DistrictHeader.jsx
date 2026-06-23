import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DistrictHeader = ({ districtName: propsDistrictName, onToggleSidebar }) => {
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

    // 1. 🕒 Intelligent Console Clock (IST Format)
    const updateClock = useCallback(() => {
        const now = new Date();
        setDateTime({
            time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
            date: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            day: now.toLocaleDateString('en-IN', { weekday: 'long' })
        });
    }, []);

    // 2. 📡 Real-time District Stats Pulse (Alerts)
    const fetchDistrictStats = useCallback(async () => {
        try {
            const res = await api.get('/admin/district/stats-pulse');
            if (res.data?.success) {
                setAlertCount(res.data.pendingActions || 0);
            }
        } catch (err) { /* Silent sync */ }
    }, []);

    useEffect(() => {
        updateClock();
        fetchDistrictStats();
        const clockTimer = setInterval(updateClock, 1000);
        const statsTimer = setInterval(fetchDistrictStats, 60000);

        return () => {
            clearInterval(clockTimer);
            clearInterval(statsTimer);
        };
    }, [updateClock, fetchDistrictStats]);

    // --- Dynamic Theme Constants ---
    const bgColor = settings?.themeColor || '#0f172a';
    const txtColor = settings?.headerTextColor || '#ffffff';

    const handleLogout = () => {
        if (window.confirm("CRITICAL: Terminate secure District Administrative session?")) {
            logout();
            navigate('/login');
        }
    };

    // ✅ डिस्ट्रिक्ट नेम के लिए मजबूत फॉलबैक लॉजिक
const displayDistrict = (
    user?.assignedDistrict || 
    user?.shopDistrict || 
    user?.pDistrict || 
    user?.district ||
    districtName || 
    'N/A'
).toUpperCase();

    return (
        <header style={headerS(bgColor, txtColor)}>
            {/* --- [A] LEFT: BRANDING --- */}
            <div style={leftSection}>
                <button onClick={onToggleSidebar} style={hamburgerBtn(txtColor)}>☰</button>
                
                <div style={brandGroup} onClick={() => navigate('/district-admin')}>
                    <div style={logoWrapper}>
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} style={logoImgS} alt="Logo" />
                        ) : (
                            <div style={logoBadge(bgColor, txtColor)}>{settings?.siteName?.charAt(0)}</div>
                        )}
                    </div>
                    <div style={brandText}>
                        <span style={brandMain(txtColor)}>{settings?.siteName || 'RKD_MART'}</span>
                        <span style={brandSub(txtColor)}>ADMIN COMMAND CENTER</span>
                    </div>
                </div>
            </div>

            {/* --- [B] CENTER: DISTRICT NAME & LIVE CLOCK --- */}
            <div style={centerSection}>
                {/* District Display (To the Left of Clock) */}
                <div style={centerDistrictBox(txtColor)}>
                    <span className="online-pulse"></span>
                    <div style={centerDistrictText}>
                        <span style={labelSmall(txtColor)}>ACTIVE DISTRICT HUB</span>
                       <span style={districtMainName(txtColor)}>
    {displayDistrict}
</span>
                    </div>
                </div>

                <div style={consoleClockS(txtColor)}>
                    <div style={clockText(txtColor)}>{dateTime.time}</div>
                    <div style={dateBox}>
                        <span style={dayLabel(txtColor)}>{dateTime.day}</span>
                        <span style={dateLabel(txtColor)}>{dateTime.date}</span>
                    </div>
                </div>
            </div>

            {/* --- [C] RIGHT: IDENTITY & ACTIONS --- */}
            <div style={rightSection}>
                
                {/* Notification Node */}
                <div 
                    style={iconActionBox(txtColor)} 
                    onClick={() => navigate('/district-admin/verification')}
                    title="Verification Requests"
                >
                    <span style={{fontSize: '20px'}}>🔔</span>
                    {alertCount > 0 && <span style={badgeS}>{alertCount}</span>}
                </div>

                <div style={divider(txtColor)}></div>

                {/* Profile Identity Node */}
                <div 
                    style={profileTrigger} 
                    onMouseEnter={() => setIsProfileOpen(true)}
                    onMouseLeave={() => setIsProfileOpen(false)}
                >
                    {/* Admin Photo Wrapper */}
                    <div style={avatarWrapper(bgColor, txtColor)}>
                        {user?.photo ? (
                            <img src={user.photo} alt="Admin" style={avatarImg} />
                        ) : (
                            <div style={avatarFallback(txtColor)}>{user?.fullName?.charAt(0).toUpperCase()}</div>
                        )}
                        <div style={statusDot}></div>
                    </div>

                    <div style={profileText}>
                        <div style={uName(txtColor)}>{user?.fullName || "District Admin"}</div>
                        <div style={uIdRow}>
                            <span style={uIdBadge(txtColor)}>ID: {user?.generatedId || 'OFFLINE'}</span>
                        </div>
                    </div>

                    {/* Advanced Dropdown */}
                    {isProfileOpen && (
                        <div style={dropdownProfile}>
                            <div style={dropHeader}>SYSTEM CONTROLS</div>
                            <div style={dropItemP} onClick={() => navigate('/district-admin/profile')}>👤 My Profile</div>
                            <div style={dropItemP} onClick={() => navigate('/district-admin/security')}>🔐 Security Keys</div>
                            <div style={dropItemP} onClick={() => navigate('/district-admin/logs')}>📜 System Logs</div>
                            <div style={itemDivider}></div>
                            <div style={logoutBtn} onClick={handleLogout}>🚪 TERMINATE SESSION</div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .online-pulse {
                    width: 8px; height: 8px; background: #10b981; border-radius: 50%;
                    display: inline-block; animation: glow-pulse 2s infinite; margin-right: 12px;
                }
                @keyframes glow-pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
                @keyframes dropdownFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </header>
    );
};

// --- Enterprise Style Definitions ---

const headerS = (bg, txt) => ({
    height: '85px', width: '100%', background: bg,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 25px', position: 'fixed', top: 0, left: 0, zIndex: 9000,
    boxSizing: 'border-box', borderBottom: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
});

const leftSection = { display: 'flex', alignItems: 'center', gap: '20px' };
const hamburgerBtn = (txt) => ({ background: 'none', border: 'none', color: txt, fontSize: '24px', cursor: 'pointer', display: window.innerWidth > 1024 ? 'none' : 'block' });

const brandGroup = { display:'flex', alignItems:'center', gap:'15px', cursor:'pointer' };
const logoWrapper = { width:'45px', height:'45px', background:'#fff', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', padding:'3px' };
const logoImgS = { width: '100%', height: '100%', objectFit: 'contain' };
const logoBadge = (bg, txt) => ({ width:'100%', height:'100%', background: bg, color: txt, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'22px' });

const brandText = { display:'flex', flexDirection:'column' };
const brandMain = (txt) => ({ color: txt, fontWeight:'900', fontSize:'18px', letterSpacing:'-0.5px' });
const brandSub = (txt) => ({ color: txt, opacity: 0.5, fontSize: '8px', fontWeight: '900', letterSpacing: '1.5px' });

const centerSection = { display: window.innerWidth < 1100 ? 'none' : 'flex', alignItems: 'center', gap: '30px', flex: 1, justifyContent: 'center' };

const centerDistrictBox = (txt) => ({
    display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)',
    padding: '10px 20px', borderRadius: '15px', border: `1px solid ${txt}20`
});
const centerDistrictText = { display: 'flex', flexDirection: 'column' };
const labelSmall = (txt) => ({ fontSize: '8px', fontWeight: '900', color: txt, opacity: 0.5, letterSpacing: '1px' });
const districtMainName = (txt) => ({ fontSize: '15px', fontWeight: '900', color: txt, letterSpacing: '0.5px' });

const consoleClockS = (txt) => ({ 
    display:'flex', alignItems:'center', gap:'20px', background:'rgba(255,255,255,0.1)', 
    padding:'10px 25px', borderRadius:'15px', border:`1px solid ${txt}20` 
});
const clockText = (txt) => ({ fontSize:'22px', fontWeight:'900', color: txt, fontFamily:"'JetBrains Mono', monospace", borderRight:`1px solid ${txt}30`, paddingRight:'20px' });
const dateBox = { display:'flex', flexDirection:'column' };
const dayLabel = (txt) => ({ fontSize:'9px', fontWeight:'900', color: txt, opacity:0.6, textTransform:'uppercase' });
const dateLabel = (txt) => ({ fontSize:'11px', fontWeight:'700', color: txt });

const rightSection = { display:'flex', alignItems:'center', gap:'20px' };
const iconActionBox = (txt) => ({ 
    background:'rgba(255,255,255,0.1)', width:'42px', height:'42px', borderRadius:'12px', 
    display:'flex', justifyContent:'center', alignItems:'center', cursor:'pointer', color: txt, border:`1px solid ${txt}20`
});
const badgeS = { position:'absolute', top:'-5px', right:'-5px', background:'#f43f5e', color:'#fff', fontSize:'10px', padding:'3px 7px', borderRadius:'50%', fontWeight:'900' };
const divider = (txt) => ({ width:'1px', height:'35px', background: txt, opacity: 0.2 });

const profileTrigger = { display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', position:'relative' };
const avatarWrapper = (bg, txt) => ({ 
    position: 'relative', width:'48px', height:'48px', background: `linear-gradient(135deg, ${bg} 0%, #1e293b 100%)`, 
    borderRadius:'15px', display:'flex', alignItems:'center', justifyContent:'center', border: `2px solid ${txt}40`, overflow:'hidden'
});
const avatarImg = { width:'100%', height:'100%', objectFit:'cover' };
const avatarFallback = (txt) => ({ color: txt, fontSize:'20px', fontWeight:'900' });
const statusDot = { position:'absolute', bottom:'2px', right:'2px', width:'10px', height:'10px', background:'#10b981', borderRadius:'50%', border:'2px solid #0f172a' };

const profileText = { display: window.innerWidth < 1250 ? 'none' : 'block' };
const uName = (txt) => ({ fontSize:'14px', fontWeight:'800', color: txt });
const uIdRow = { display:'flex', alignItems:'center', marginTop:'2px' };
const uIdBadge = (txt) => ({ fontSize:'9px', fontWeight:'900', color: txt, opacity: 0.7, background: `${txt}15`, padding:'2px 8px', borderRadius:'4px' });

const dropdownProfile = { position:'absolute', top:'60px', right:0, width:'240px', background:'#fff', borderRadius:'22px', padding:'10px', boxShadow:'0 25px 60px rgba(0,0,0,0.4)', border:'1px solid #f1f5f9', animation: 'dropdownFade 0.3s ease' };
const dropHeader = { padding:'12px', fontSize:'10px', fontWeight:'900', color:'#94a3b8', letterSpacing:'1px', borderBottom:'1px solid #f8fafc' };
const dropItemP = { padding:'12px 15px', fontSize:'13px', color:'#475569', fontWeight:'700', cursor:'pointer', borderRadius:'12px', transition:'0.2s' };
const itemDivider = { height:'1px', background:'#f1f5f9', margin:'5px 0' };
const logoutBtn = { ...dropItemP, color:'#f43f5e', background:'#fff1f2', marginTop:'5px' };

export default DistrictHeader;