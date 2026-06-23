import React, { useState, useEffect } from 'react';

const StaffHeader = ({ onToggleSidebar }) => {
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    const userName = localStorage.getItem('userName') || 'Delivery Partner';

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header style={headerS}>
            {onToggleSidebar && (
                <button onClick={onToggleSidebar} style={menuBtn} aria-label="Toggle menu">☰</button>
            )}
            <div style={logoBox}>
                <div style={iconCircle}>S</div>
                <div>
                    <div style={brandN}>RKD_MART</div>
                    <div style={portalN}>STAFF PORTAL</div>
                </div>
            </div>

            <div style={middleS}>
                <div style={statusBadge}>● Online & Ready</div>
                <div style={clockS}>{time}</div>
            </div>

            <div style={profileS}>
                <div style={infoS}>
                    <div style={uName}>{userName}</div>
                    <div style={uRole}>Field Executive</div>
                </div>
                <div style={avatarS}>{userName.charAt(0)}</div>
            </div>
        </header>
    );
};

const headerS = { height:'70px', width:'100%', background:'#1a1a2e', color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 15px 0 25px', position:'fixed', top:0, left:0, zIndex:1400, boxShadow:'0 2px 10px rgba(0,0,0,0.2)', gap:'12px', flexWrap:'wrap' };
const menuBtn = { background:'transparent', border:'none', color:'#f1c40f', fontSize:'22px', cursor:'pointer', padding:'8px', display:'block' };
const logoBox = { display:'flex', alignItems:'center', gap:'10px' };
const iconCircle = { width:'35px', height:'35px', background:'#f1c40f', color:'#1a1a2e', borderRadius:'50%', display:'flex', justifyContent:'center', alignItems:'center', fontWeight:'bold' };
const brandN = { fontSize:'18px', fontWeight:'bold', color:'#f1c40f' };
const portalN = { fontSize:'9px', letterSpacing:'1px', opacity:0.8 };
const middleS = { display:'flex', alignItems:'center', gap:'30px' };
const statusBadge = { background:'rgba(46, 204, 113, 0.2)', color:'#2ecc71', padding:'5px 12px', borderRadius:'15px', fontSize:'11px', fontWeight:'bold' };
const clockS = { fontSize:'15px', fontFamily:'monospace', color:'#f1c40f' };
const profileS = { display:'flex', alignItems:'center', gap:'12px' };
const infoS = { textAlign:'right' };
const uName = { fontSize:'13px', fontWeight:'bold' };
const uRole = { fontSize:'10px', color:'#f1c40f' };
const avatarS = { width:'38px', height:'38px', background:'#f1c40f', color:'#1a1a2e', borderRadius:'8px', display:'flex', justifyContent:'center', alignItems:'center', fontWeight:'bold' };

export default StaffHeader;