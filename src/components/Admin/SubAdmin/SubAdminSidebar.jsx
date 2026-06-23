// src/components/Admin/SubAdmin/SubAdminSidebar.jsx

import React from 'react';
import { useAuth } from "../../../context/AuthContext";
import { useBranding } from "../../../context/BrandingContext";

const SubAdminSidebar = ({ activeTab, setTab, isOpen, closeSidebar }) => {
    const { settings } = useBranding();
    const { logout } = useAuth();

    // --- Dynamic Theme Constants ---
    const themeColor = settings?.themeColor || '#0f172a';
    const textColor = settings?.headerTextColor || '#ffffff';

    /**
     * 🛠️ Optimized Navigation Menu Groups
     * बटन के नामों को छोटा और प्रोफेशनल बनाया गया है।
     */
    const menuGroups = [
        {
            groupName: "COMMAND HUB",
            items: [
                { id: 'overview', label: 'Intelligence', icon: '🌌' },
                { id: 'shops-queue', label: 'Requests', icon: '📥' },
                { id: 'disputes', label: 'Disputes', icon: '⚖️' },
            ]
        },
        {
            groupName: "REGISTRY",
            items: [
                { id: 'users', label: 'Users', icon: '👥' },
                { id: 'inventory', label: 'Catalog', icon: '🗂️' },
                { id: 'payouts', label: 'Payouts', icon: '💰' }
            ]
        },
        {
            groupName: "MAINTENANCE",
            items: [
                { id: 'broadcast', label: 'Broadcast', icon: '📢' },
                { id: 'health', label: 'Health', icon: '🖥️' },
                { id: 'logs', label: 'Logs', icon: '📜' }
            ]
        }
    ];

    const handleLogout = () => {
        if (window.confirm("CRITICAL: Terminate secure administrative session?")) {
            logout();
        }
    };

    const handleNavClick = (id) => {
        setTab(id);
        // मोबाइल पर क्लिक के बाद साइडबार बंद करें
        if (window.innerWidth <= 1024) closeSidebar();
    };

    return (
        <>
            {/* 🌑 Mobile Overlay (Blur effect) */}
            {isOpen && window.innerWidth <= 1024 && (
                <div style={overlayS} onClick={closeSidebar}></div>
            )}

            <aside style={{
                ...sidebarStyle(themeColor),
                transform: isOpen || window.innerWidth > 1024 ? 'translateX(0)' : 'translateX(-100%)'
            }}>
                
                {/* --- NAVIGATION SCROLL AREA --- */}
                <div className="custom-scroll" style={scrollArea}>
                    {menuGroups.map((group, gIdx) => (
                        <div key={gIdx} style={{ marginBottom: '22px' }}>
                            <div style={groupTitle(textColor)}>{group.groupName}</div>
                            {group.items.map((item) => {
                                const active = activeTab === item.id;
                                return (
                                    <div 
                                        key={item.id} 
                                        onClick={() => handleNavClick(item.id)}
                                        style={btnStyle(active, themeColor, textColor)}
                                        className="sidebar-btn"
                                    >
                                        <span style={iconWrapperS(active)}>{item.icon}</span>
                                        <span style={{ flex: 1 }}>{item.label}</span>
                                        {active && <div style={activeIndicator(textColor)}></div>}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* --- FOOTER STATUS & LOGOUT --- */}
                <div style={footerSection}>
                    <div style={statusRow(textColor)}>
                        <span className="pulse-dot"></span>
                        <small style={{letterSpacing:'1px'}}>ID: {settings.siteName?.substring(0, 3).toUpperCase()}_NODE</small>
                    </div>
                    <button onClick={handleLogout} style={logoutBtn(textColor)}>
                        🚪 LOGOUT
                    </button>
                </div>

                {/* --- GLOBAL CSS FOR SIDEBAR --- */}
                <style>{`
                    .custom-scroll::-webkit-scrollbar { width: 4px; }
                    .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                    .custom-scroll:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
                    
                    .sidebar-btn:hover { background: rgba(255,255,255,0.08) !important; transform: translateX(5px); }
                    
                    .pulse-dot { 
                        width: 6px; height: 6px; background: #10b981; border-radius: 50%; 
                        display: inline-block; margin-right: 8px; animation: pulse-anim 2s infinite; 
                        box-shadow: 0 0 8px #10b981;
                    }
                    @keyframes pulse-anim { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                `}</style>
            </aside>
        </>
    );
};

// --- ENTERPRISE STYLE DEFINITIONS ---

const sidebarStyle = (color) => ({ 
    width: '260px', 
    backgroundColor: color, 
    height: 'calc(100vh - 85px)', 
    position: 'fixed', 
    top: '85px', 
    left: 0, 
    zIndex: 8500, 
    display: 'flex', 
    flexDirection: 'column', 
    padding: '20px 12px', 
    boxSizing: 'border-box', 
    borderRight: '1px solid rgba(255,255,255,0.05)', 
    transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '10px 0 30px rgba(0,0,0,0.1)'
});

const overlayS = { 
    position: 'fixed', 
    inset: 0, 
    background: 'rgba(0,0,0,0.4)', 
    backdropFilter: 'blur(3px)', 
    zIndex: 8000,
    animation: 'fadeIn 0.3s ease'
};

const scrollArea = { 
    flex: 1, 
    overflowY: 'auto', 
    paddingRight: '4px',
    scrollbarWidth: 'none' 
};

const groupTitle = (txt) => ({ 
    color: txt, 
    opacity: 0.4, 
    fontSize: '9px', 
    fontWeight: '900', 
    letterSpacing: '1.2px', 
    marginBottom: '10px', 
    paddingLeft: '14px', 
    textTransform: 'uppercase' 
});

const btnStyle = (active, themeColor, textColor) => ({
    display: 'flex', 
    alignItems: 'center', 
    padding: '11px 14px', 
    cursor: 'pointer', 
    borderRadius: '12px', 
    marginBottom: '5px', 
    color: textColor, 
    backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
    fontWeight: active ? '800' : '600',
    fontSize: '13.5px',
    transition: '0.3s ease',
    position: 'relative',
    border: active ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
});

const iconWrapperS = (active) => ({
    fontSize: '18px', 
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center',
    opacity: active ? 1 : 0.75
});

const activeIndicator = (textColor) => ({ 
    position: 'absolute', 
    left: '0px', 
    width: '3.5px', 
    height: '14px', 
    backgroundColor: textColor, 
    borderRadius: '0 5px 5px 0',
    boxShadow: `0 0 8px ${textColor}`
});

const footerSection = { 
    borderTop: '1px solid rgba(255,255,255,0.1)', 
    paddingTop: '18px',
    marginTop: '10px'
};

const statusRow = (txt) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    color: txt,
    opacity: 0.5,
    fontWeight: '800',
    fontSize: '9px'
});

const logoutBtn = (txt) => ({ 
    width: '100%', 
    padding: '12px', 
    background: 'rgba(255, 255, 255, 0.04)', 
    color: txt, 
    border: '1px solid rgba(255, 255, 255, 0.08)', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontWeight: '900', 
    fontSize: '11px', 
    transition: '0.3s',
    letterSpacing: '1px'
});

export default SubAdminSidebar;