import React, { useState, useEffect } from 'react';
// सुधार: Absolute paths का उपयोग किया गया है ताकि 'src' फोल्डर से बाहर जाने की एरर न आए
import { useAuth } from 'context/AuthContext';
import { useBranding } from 'context/BrandingContext';

const DistrictOperatorHeader = ({ toggleSidebar, districtName }) => {
    const { user, logout } = useAuth();
    const { settings } = useBranding();
    const [time, setTime] = useState(new Date().toLocaleTimeString());

    // 🕒 Real-time Clock Sync
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    const themeColor = settings?.themeColor || '#0d9488';

    return (
        <header style={headerS}>
            {/* [LEFT] Brand & Control Node */}
            <div style={leftS}>
                <button onClick={toggleSidebar} style={hamBtn} title="Toggle Sidebar">☰</button>
                <div style={brandBox}>
                    <div style={logoS(themeColor)}>{settings.siteName?.charAt(0) || 'O'}</div>
                    <div style={textS}>
                        <b style={{fontSize:'16px'}}>{settings.siteName || 'RKD MART'}</b>
                        <small style={{color:themeColor, display:'block', fontSize:'9px', fontWeight:'900', letterSpacing:'0.5px'}}>
                            DISTRICT OPERATOR NODE
                        </small>
                    </div>
                </div>
            </div>

            {/* [CENTER] Operational Status (Hidden on mobile) */}
            <div style={centerS}>
                <div style={nodeBadge}>
                    <span style={dot}></span>
                    📍 NODE: {districtName?.toUpperCase() || 'UNKNOWN'}
                </div>
                <div style={clockS(themeColor)}>{time}</div>
            </div>

            {/* [RIGHT] Identity & Session Management */}
            <div style={rightS}>
                <div style={profileS}>
                    <div style={avatarS(themeColor)}>
                        {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div style={uDetails}>
                        <span style={uName}>{user?.fullName || 'Field Operator'}</span>
                        <span style={uRole}>Operational Staff</span>
                    </div>
                </div>
                <div style={divider}></div>
                <button onClick={logout} style={exitBtn}>EXIT NODE</button>
            </div>

            <style>{`
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
            `}</style>
        </header>
    );
};

// --- Enterprise Infrastructure Styles ---

const headerS = { 
    height:'80px', width:'100%', background:'#0f172a', 
    display:'flex', justifyContent:'space-between', alignItems:'center', 
    padding:'0 25px', position:'fixed', top:0, left:0, zIndex:1500, 
    borderBottom:'1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
};

const leftS = { display:'flex', alignItems:'center', gap:'20px' };

const hamBtn = { 
    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', 
    color:'#fff', fontSize:'20px', cursor:'pointer', padding:'8px 12px', borderRadius:'10px',
    transition: '0.3s'
};

const brandBox = { display:'flex', alignItems:'center', gap:'12px', color:'#fff' };

const logoS = (color) => ({ 
    width:'38px', height:'38px', background:color, borderRadius:'10px', 
    display:'flex', alignItems:'center', justifyContent:'center', 
    fontWeight:'900', fontSize:'18px', color:'#fff', boxShadow: `0 0 15px ${color}44` 
});

const textS = { display:'flex', flexDirection:'column' };

const centerS = { 
    display: window.innerWidth < 1024 ? 'none' : 'flex', 
    alignItems:'center', gap:'30px' 
};

const nodeBadge = { 
    background:'rgba(255,255,255,0.03)', padding:'10px 20px', borderRadius:'12px', 
    fontSize:'10px', color:'#94a3b8', fontWeight:'900', letterSpacing:'1px', 
    border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:'10px' 
};

const dot = { width:'6px', height:'6px', background:'#10b981', borderRadius:'50%', animation:'pulse 2s infinite' };

const clockS = (color) => ({ 
    color:color, fontSize:'18px', fontWeight:'900', 
    fontFamily: "'JetBrains Mono', monospace", letterSpacing:'1px' 
});

const rightS = { display:'flex', alignItems:'center', gap:'20px' };

const profileS = { display:'flex', alignItems:'center', gap:'12px', color:'#fff' };

const avatarS = (color) => ({ 
    width:'42px', height:'42px', background:color, borderRadius:'50%', 
    display:'flex', alignItems:'center', justifyContent:'center', 
    fontWeight:'900', border:'2px solid rgba(255,255,255,0.1)',
    fontSize:'16px'
});

const uDetails = { 
    display: window.innerWidth < 768 ? 'none' : 'flex', 
    flexDirection:'column', textAlign:'left' 
};

const uName = { fontSize:'14px', fontWeight:'700', color: '#f8fafc' };

const uRole = { fontSize:'10px', color:'#64748b', fontWeight:'800', textTransform:'uppercase' };

const divider = { width:'1px', height:'35px', background:'rgba(255,255,255,0.1)' };

const exitBtn = { 
    background:'rgba(239, 68, 68, 0.1)', color:'#ef4444', 
    border:'1px solid rgba(239, 68, 68, 0.2)', padding:'8px 16px', 
    borderRadius:'10px', fontSize:'11px', fontWeight:'900', 
    cursor:'pointer', transition:'0.3s', letterSpacing:'0.5px'
};

export default DistrictOperatorHeader;