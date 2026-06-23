import React from 'react';
import { useBranding } from '../../context/BrandingContext';
import { useAuth } from '../../context/AuthContext';

/**
 * RKD MART - STATE ADMIN SIDEBAR NAVIGATION
 * मैनेज करता है: डैसबोर्ड, पेंडिंग क्यू, जिला प्रदर्शन और पदानुक्रम।
 */
const StateSidebar = ({ setTab, activeTab, isOpen, closeSidebar }) => {
    const { settings } = useBranding();
    const { user, logout } = useAuth();

    // --- डायनामिक थीम सिंकिंग ---
    const themeColor = settings?.themeColor || '#0f172a';
    const textColor = settings?.headerTextColor || '#ffffff';

    // --- नेविगेशन स्ट्रक्चर ---
    const menuGroups = [
        {
            groupName: "REGIONAL COMMAND",
            items: [
                { id: 'overview', label: 'Dashboard', icon: '🌍' },
                { id: 'pending_requests', label: 'State Queue', icon: '📥' }, // जिला एडमिन द्वारा फॉरवर्ड किए गए
                { id: 'dist_pending_monitoring', label: 'District Queue', icon: '🔍' }, // जो अभी जिला स्तर पर पेंडिंग हैं
                { id: 'performance', label: 'District Performance', icon: '📊' }, // जिला प्रदर्शन एनालिटिक्स
                { id: 'districts', label: 'District Admins', icon: '📍' }, // जिला एडमिन यूजर्स का प्रबंधन
            ]
        },
        {
            groupName: "HIERARCHY & STAFF",
            items: [
                { id: 'operators', label: 'State Operators', icon: '🎧' },
                { id: 'merchants', label: 'ActivShops', icon: '🏪' },
            ]
        },
        {
            groupName: "FINANCE & POLICY",
            items: [
                { id: 'revenue', label: 'Fiscal Analytics', icon: '💰' },
                { id: 'broadcast', label: 'State Broadcast', icon: '📢' },
                { id: 'support', label: 'Emergency Support', icon: '📞' },
            ]
        }
    ];

    const handleLogout = () => {
        if(window.confirm("CRITICAL: Terminate secure administrative session?")) {
            logout();
        }
    };

    const handleNavClick = (id) => {
        setTab(id);
        // मोबाइल पर क्लिक करने के बाद साइडबार बंद करें
        if (window.innerWidth <= 1024) closeSidebar();
    };

    return (
        <>
            {/* 🌑 मोबाइल ओवरले - साइडबार के पीछे धुंधलापन */}
            {isOpen && window.innerWidth <= 1024 && (
                <div style={overlayS} onClick={closeSidebar}></div>
            )}

            <aside style={{
                ...sidebarStyle(themeColor),
                transform: isOpen || window.innerWidth > 1024 ? 'translateX(0)' : 'translateX(-100%)'
            }}>
                
                {/* स्क्रॉल करने योग्य नेविगेशन एरिया */}
                <div className="custom-scroll" style={scrollArea}>
                    {menuGroups.map((group, gIdx) => (
                        <div key={gIdx} style={{ marginBottom: '25px' }}>
                            <div style={groupTitle(textColor)}>{group.groupName}</div>
                            {group.items.map((item) => {
                                const active = activeTab === item.id;
                                return (
                                    <div 
                                        key={item.id} 
                                        onClick={() => handleNavClick(item.id)}
                                        style={btnStyle(active, textColor)}
                                    >
                                        <span style={iconWrapperS(active)}>{item.icon}</span>
                                        <span style={{ flex: 1 }}>{item.label}</span>
                                        {active && (
                                            <div style={activeIndicator(textColor)}></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* साइडबार फुटर - सुरक्षा और लॉगआउट */}
                <div style={footerSection(textColor)}>
                    <div style={statusRow(textColor)}>
                        <span className="pulse-dot"></span>
                        <small>STATE_NODE: {user?.assignedState?.toUpperCase() || 'SYSTEM'}</small>
                    </div>
                    <button onClick={handleLogout} style={logoutBtn(textColor)}>
                        🚪 DISCONNECT SESSION
                    </button>
                </div>

                <style>{`
                    .custom-scroll::-webkit-scrollbar { width: 4px; }
                    .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                    .custom-scroll:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
                    
                    .pulse-dot { 
                        width: 6px; height: 6px; background: #3b82f6; border-radius: 50%; 
                        display: inline-block; margin-right: 8px; animation: pulse 2s infinite; 
                        box-shadow: 0 0 6px #3b82f6;
                    }

                    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                `}</style>
            </aside>
        </>
    );
};

// --- Enterprise Style Definitions ---

const sidebarStyle = (color) => ({ 
    width: '280px', 
    backgroundColor: color, 
    height: 'calc(100vh - 85px)', 
    position: 'fixed', 
    top: '85px', 
    left: 0, 
    zIndex: 8500, 
    display: 'flex', 
    flexDirection: 'column', 
    padding: '25px 12px', 
    boxSizing: 'border-box', 
    borderRight: '1px solid rgba(255,255,255,0.05)', 
    transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '15px 0 40px rgba(0,0,0,0.15)'
});

const overlayS = { 
    position: 'fixed', 
    inset: 0, 
    background: 'rgba(0,0,0,0.6)', 
    backdropFilter: 'blur(4px)', 
    zIndex: 8000,
    animation: 'fadeIn 0.3s ease'
};

const scrollArea = { 
    flex: 1, 
    overflowY: 'auto', 
    paddingRight: '5px',
    scrollbarWidth: 'none' 
};

const groupTitle = (txt) => ({ 
    color: txt, 
    opacity: 0.4, 
    fontSize: '9px', 
    fontWeight: '900', 
    letterSpacing: '1.5px', 
    marginBottom: '12px', 
    paddingLeft: '15px', 
    textTransform: 'uppercase' 
});

const btnStyle = (active, textColor) => ({
    display: 'flex', 
    alignItems: 'center', 
    padding: '12px 16px', 
    cursor: 'pointer', 
    borderRadius: '12px', 
    marginBottom: '4px', 
    color: textColor, 
    backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
    fontWeight: active ? '800' : '600',
    fontSize: '13px',
    transition: '0.2s ease',
    position: 'relative',
    border: active ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
});

const iconWrapperS = (active) => ({
    fontSize: '18px', 
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center',
    opacity: active ? 1 : 0.7
});

const activeIndicator = (textColor) => ({ 
    position: 'absolute', 
    left: '0px', 
    width: '4px', 
    height: '16px', 
    backgroundColor: textColor, 
    borderRadius: '0 10px 10px 0',
    boxShadow: `0 0 10px ${textColor}`
});

const footerSection = (txt) => ({ 
    borderTop: '1px solid rgba(255,255,255,0.1)', 
    paddingTop: '20px',
    marginTop: '10px'
});

const statusRow = (txt) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    marginBottom: '15px',
    color: txt,
    opacity: 0.6,
    fontWeight: '800',
    fontSize: '9px',
    letterSpacing: '0.5px'
});

const logoutBtn = (txt) => ({ 
    width: '100%', 
    padding: '12px', 
    background: 'rgba(255, 255, 255, 0.05)', 
    color: txt, 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: '900', 
    fontSize: '11px', 
    transition: '0.3s' 
});

export default StateSidebar;