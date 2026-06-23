import React from 'react';
import { useAuth } from '../../context/AuthContext';

const StaffSidebar = ({ setTab, activeTab, isOpen, closeSidebar, isMobile }) => {
    const { logout } = useAuth();

    const menu = [
        { id: 'tasks', label: 'My Deliveries', icon: '🚚' },
        { id: 'idcard', label: 'My ID Card', icon: '🪪' },
    ];

    const btnS = (id) => ({
        width:'100%', padding:'15px', marginBottom:'8px', border:'none', borderRadius:'10px',
        background: activeTab === id ? 'rgba(241, 196, 15, 0.1)' : 'transparent',
        color: activeTab === id ? '#f1c40f' : '#bdc3c7',
        textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:'12px', fontWeight:'bold', transition:'0.3s'
    });

    const handleLogout = () => {
        if (window.confirm('Sign out of your session?')) {
            logout();
        }
    };

    return (
        <>
            {isOpen && isMobile && <div onClick={closeSidebar} style={overlayS} />}
            <aside style={{
                ...sidebarS,
                transform: isOpen || !isMobile ? 'translateX(0)' : 'translateX(-100%)',
            }}>
                <div style={{flex:1}}>
                    {menu.map(item => (
                        <button key={item.id} onClick={() => setTab(item.id)} style={btnS(item.id)}>
                            <span style={{fontSize:'18px'}}>{item.icon}</span> {item.label}
                        </button>
                    ))}
                </div>
                <button onClick={handleLogout} style={logoutB}>Sign Out</button>
            </aside>
        </>
    );
};

const overlayS = { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1100 };
const sidebarS = {
    width:'260px', backgroundColor:'#1a1a2e', height:'calc(100vh - 70px)', position:'fixed',
    top:'70px', left:0, zIndex:1200, padding:'20px 15px', display:'flex', flexDirection:'column',
    borderRight:'1px solid rgba(255,255,255,0.05)', transition:'transform 0.3s ease'
};
const logoutB = { padding:'12px', background:'rgba(231, 76, 60, 0.1)', color:'#e74c3c', border:'1px solid #e74c3c', borderRadius:'10px', cursor:'pointer', fontWeight:'bold' };

export default StaffSidebar;
