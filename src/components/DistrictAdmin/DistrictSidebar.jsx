import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';

const DistrictSidebar = ({ setTab, activeTab, districtName, isOpen, closeSidebar }) => {
    const { user, logout } = useAuth();
    const { settings } = useBranding();
    
    const themeColor = settings?.themeColor || '#0f172a';
    const textColor = settings?.headerTextColor || '#ffffff';

    const menuGroups = [
        {
            groupName: "DISTRICT CONTROL",
            roles: ['DistrictAdmin', 'DistrictOperator'],
            items: [
                { id: 'dashboard', label: 'District Overview', icon: '📊' },
                { id: 'verification', label: 'Shop Verifications', icon: '🛡️' },
                { id: 'shops', label: 'District Stores', icon: '🏬' },
            ]
        },
        {
            groupName: "MANAGEMENT SUITE",
            roles: ['DistrictAdmin'],
            items: [
                { id: 'tasks', label: 'Task Management', icon: '✅' },
                { id: 'staff', label: 'Staff Management', icon: '👥' },
                { id: 'inventory', label: 'Inventory Control', icon: '🛒' },
            ]
        },
        {
            groupName: "LOCAL COMMERCE",
            roles: ['DistrictAdmin', 'DistrictOperator'],
            items: [
                { id: 'orders', label: 'District Orders', icon: '📦' },
            ]
        },
        {
            groupName: "FINANCE & HELP",
            roles: ['DistrictAdmin'], 
            items: [
                { id: 'finance', label: 'Finance Dashboard', icon: '💰', adminOnly: true },
                { id: 'reports', label: 'Reports & Analytics', icon: '📊', adminOnly: true },
                { id: 'operators', label: 'Local Operators', icon: '🎧', adminOnly: true },
                { id: 'complaints', label: 'District Support', icon: '📞' },
            ]
        },
        {
            groupName: "SETTINGS",
            roles: ['DistrictAdmin'],
            items: [
                { id: 'settings', label: 'Admin Settings', icon: '⚙️', adminOnly: true },
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
        if (window.innerWidth <= 1024) closeSidebar();
    };

    return (
        <>
            {/* ✅ [FIXED]: ओवरले केवल मोबाइल (<=1024px) पर ही दिखेगा */}
            {isOpen && window.innerWidth <= 1024 && (
                <div style={overlayS} onClick={closeSidebar}></div>
            )}

            <aside style={{
                ...sidebarStyle(themeColor),
                transform: isOpen || window.innerWidth > 1024 ? 'translateX(0)' : 'translateX(-100%)'
            }}>
                
                <div className="custom-scroll" style={scrollArea}>
                    {menuGroups.map((group, gIdx) => {
                        if (group.roles && !group.roles.includes(user?.role)) return null;

                        return (
                            <div key={gIdx} style={{ marginBottom: '25px' }}>
                                <div style={groupTitle(textColor)}>{group.groupName}</div>
                                {group.items.map((item) => {
                                    if (item.adminOnly && user?.role !== 'DistrictAdmin') return null;

                                    const active = activeTab === item.id;
                                    return (
                                        <div 
                                            key={item.id} 
                                            onClick={() => handleNavClick(item.id)}
                                            style={btnStyle(active, themeColor, textColor)}
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
                        );
                    })}
                </div>

                <div style={footerSection(textColor)}>
                    <div style={statusRow(textColor)}>
                        <span className="pulse-dot"></span>
                        <small>NODE_SECURE: {districtName?.toUpperCase() || 'LOCAL'}</small>
                    </div>
                    <button onClick={handleLogout} style={logoutBtn(textColor)}>
                        🚪 DISCONNECT SESSION
                    </button>
                </div>

                <style>{`
                    .custom-scroll::-webkit-scrollbar { width: 4px; }
                    .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                    .pulse-dot { 
                        width: 6px; height: 6px; background: #10b981; border-radius: 50%; 
                        display: inline-block; margin-right: 8px; animation: pulse 2s infinite; 
                    }
                    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
                `}</style>
            </aside>
        </>
    );
};

// --- Styles ---
const sidebarStyle = (color) => ({ width: '280px', backgroundColor: color, height: 'calc(100vh - 85px)', position: 'fixed', top: '85px', left: 0, zIndex: 8500, display: 'flex', flexDirection: 'column', padding: '25px 12px', boxSizing: 'border-box', borderRight: '1px solid rgba(255,255,255,0.05)', transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '15px 0 40px rgba(0,0,0,0.15)' });
const overlayS = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 8000 };
const scrollArea = { flex: 1, overflowY: 'auto', paddingRight: '5px' };
const groupTitle = (txt) => ({ color: txt, opacity: 0.4, fontSize: '9px', fontWeight: '900', letterSpacing: '1.5px', marginBottom: '12px', paddingLeft: '15px', textTransform: 'uppercase' });
const btnStyle = (active, themeColor, textColor) => ({ display: 'flex', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', borderRadius: '12px', marginBottom: '4px', color: textColor, backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent', fontWeight: active ? '800' : '600', fontSize: '13px', transition: '0.2s ease', position: 'relative', border: active ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent' });
const iconWrapperS = (active) => ({ fontSize: '18px', marginRight: '12px', display: 'flex', alignItems: 'center', opacity: active ? 1 : 0.7 });
const activeIndicator = (textColor) => ({ position: 'absolute', left: '0px', width: '4px', height: '16px', backgroundColor: textColor, borderRadius: '0 10px 10px 0', boxShadow: `0 0 10px ${textColor}` });
const footerSection = (txt) => ({ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '10px' });
const statusRow = (txt) => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', marginBottom: '15px', color: txt, opacity: 0.6, fontWeight: '800', fontSize: '9px', letterSpacing: '0.5px' });
const logoutBtn = (txt) => ({ width: '100%', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', color: txt, border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', fontSize: '11px', transition: '0.3s' });

export default DistrictSidebar;
