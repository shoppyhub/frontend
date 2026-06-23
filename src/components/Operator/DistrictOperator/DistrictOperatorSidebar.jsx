import React from 'react';
// सुधार: Absolute path का उपयोग किया गया है ताकि 'src' फोल्डर से बाहर जाने वाली एरर न आए
import { useBranding } from 'context/BrandingContext';

const DistrictOperatorSidebar = ({ setTab, activeTab, isOpen, closeSidebar }) => {
    const { settings } = useBranding();
    const themeColor = settings?.themeColor || '#0d9488';

    // 📋 Operational Navigation Menu
    const menu = [
        { id: 'overview', label: 'Operations Overview', icon: '📊' },
        { id: 'audit', label: 'Shop Audit Queue', icon: '🛡️' },
        { id: 'shops', label: 'Verified Hubs', icon: '🏬' },
        { id: 'orders', label: 'Logistics Monitor', icon: '📦' },
        { id: 'helpdesk', label: 'Merchant Support', icon: '📞' },
    ];

    const sidebarS = {
        width: '280px', 
        backgroundColor: '#0f172a', 
        height: 'calc(100vh - 80px)',
        position: 'fixed', 
        top: '80px', 
        left: isOpen ? 0 : '-280px',
        transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
        padding: '25px 15px', 
        zIndex: 1400,
        borderRight: '1px solid rgba(255,255,255,0.05)',
        boxShadow: isOpen ? '10px 0 30px rgba(0,0,0,0.3)' : 'none'
    };

    return (
        <>
            {/* Mobile View Overlay (Blur Effect) */}
            {isOpen && window.innerWidth <= 1024 && (
                <div onClick={closeSidebar} style={overlay}></div>
            )}
            
            <aside style={sidebarS} className="custom-scroll">
                <div style={titleS}>OPERATIONAL QUEUE</div>
                
                <nav style={navS}>
                    {menu.map(item => (
                        <button 
                            key={item.id} 
                            onClick={() => { 
                                setTab(item.id); 
                                if(window.innerWidth <= 1024) closeSidebar(); 
                            }}
                            style={btnS(activeTab === item.id, themeColor)}
                            className="sidebar-btn"
                        >
                            <span style={{
                                fontSize:'18px', 
                                opacity: activeTab === item.id ? 1 : 0.6,
                                transition: '0.3s'
                            }}>
                                {item.icon}
                            </span>
                            {item.label}
                            {activeTab === item.id && <div style={activeIndicator(themeColor)}></div>}
                        </button>
                    ))}
                </nav>

                {/* Optional Internal Logic Stats */}
                <div style={bottomInfo}>
                    <div style={badgeS}>v0.1.0 STABLE NODE</div>
                </div>
            </aside>

            <style>{`
                .sidebar-btn:hover { background: rgba(255,255,255,0.03) !important; transform: translateX(5px); }
                .custom-scroll { overflow-y: auto; }
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
        </>
    );
};

// --- Infrastructure Layout Styles ---

const overlay = { 
    position:'fixed', 
    inset:0, 
    background:'rgba(15, 23, 42, 0.5)', 
    backdropFilter:'blur(4px)', 
    zIndex:1300 
};

const navS = { display: 'flex', flexDirection: 'column', gap: '8px' };

const titleS = { 
    color:'#475569', 
    fontSize:'10px', 
    fontWeight:'900', 
    letterSpacing:'2px', 
    marginBottom:'25px', 
    paddingLeft:'15px',
    textTransform: 'uppercase'
};

const btnS = (active, color) => ({
    width:'100%', 
    padding:'14px 18px', 
    background: active ? `${color}15` : 'transparent',
    color: active ? color : '#94a3b8', 
    border:'none', 
    borderRadius:'14px',
    display:'flex', 
    alignItems:'center', 
    gap:'15px', 
    cursor:'pointer',
    textAlign:'left', 
    fontWeight: active ? '800' : '600', 
    fontSize:'14px', 
    transition:'0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position:'relative',
    outline: 'none'
});

const activeIndicator = (color) => ({
    position: 'absolute',
    right: '15px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: color,
    boxShadow: `0 0 10px ${color}`
});

const bottomInfo = {
    marginTop: 'auto',
    paddingTop: '40px',
    paddingLeft: '15px'
};

const badgeS = {
    fontSize: '9px',
    color: '#334155',
    fontWeight: '900',
    letterSpacing: '1px'
};

export default DistrictOperatorSidebar;