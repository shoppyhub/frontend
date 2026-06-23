import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBranding } from '../../context/BrandingContext'; 
import { useAuth } from '../../context/AuthContext';

const ShopSidebar = ({ isOpen, closeSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { settings } = useBranding();
    const { logout } = useAuth();

    const themeColor = settings?.themeColor || '#0f172a';
    const textColor = settings?.headerTextColor || '#ffffff';

    const menuGroups = [
        {
            groupName: "OPERATIONS",
            items: [
                { id: 'overview', label: 'Dashboard Overview', icon: '📊' },
                { id: 'orders', label: 'Order Pipeline', icon: '📦' },
            ]
        },
        {
            groupName: "MANAGEMENT",
            items: [
                { id: 'products', label: 'Inventory Assets', icon: '🛒' },
                { id: 'staff', label: 'Personnel Hub', icon: '👥' },
            ]
        },
        {
            groupName: "ADMIN & SETTINGS",
            items: [
                { id: 'profile', label: 'Identity Profile', icon: '👤' },
                { id: 'earnings', label: 'Financial Ledger', icon: '💰' },
                { id: 'docs', label: 'Compliance Vault', icon: '📜' },
                { id: 'settings', label: 'Hub Configuration', icon: '⚙️' },
                { id: 'support', label: 'Technical Helpdesk', icon: '🎧' },
            ]
        }
    ];

    const handleNavigate = (id) => {
        navigate(`/shop-dashboard/${id}`);
        if (window.innerWidth <= 1024) closeSidebar();
    };

    return (
        <>
            {/* ✅ FIXED: ओवरले केवल मोबाइल (<=1024px) पर ही दिखेगा */}
            {isOpen && window.innerWidth <= 1024 && (
                <div style={overlayS} onClick={closeSidebar}></div>
            )}

            <aside style={{
                ...sidebarStyle(themeColor),
                transform: isOpen || window.innerWidth > 1024 ? 'translateX(0)' : 'translateX(-100%)'
            }}>
                <div className="custom-scroll" style={scrollArea}>
                    {menuGroups.map((group, gIdx) => (
                        <div key={gIdx} style={{ marginBottom: '25px' }}>
                            <div style={groupTitle(textColor)}>{group.groupName}</div>
                            {group.items.map((item) => {
                                const active = location.pathname.includes(item.id);
                                return (
                                    <div 
                                        key={item.id} 
                                        onClick={() => handleNavigate(item.id)}
                                        style={btnStyle(active, themeColor, textColor)}
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

                <div style={footerSection(textColor)}>
                    <button onClick={logout} style={logoutBtn(textColor)}>🚪 DISCONNECT</button>
                </div>
            </aside>
        </>
    );
};

const sidebarStyle = (color) => ({ width: '280px', backgroundColor: color, height: 'calc(100vh - 85px)', position: 'fixed', top: '85px', left: 0, zIndex: 8500, display: 'flex', flexDirection: 'column', padding: '25px 12px', boxSizing: 'border-box', borderRight: '1px solid rgba(255,255,255,0.05)', transition: '0.4s ease', boxShadow: '15px 0 40px rgba(0,0,0,0.15)' });
const overlayS = { position: 'fixed', inset: 0, top: '85px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 8000 };
const scrollArea = { flex: 1, overflowY: 'auto', paddingRight: '5px' };
const groupTitle = (txt) => ({ color: txt, opacity: 0.4, fontSize: '9px', fontWeight: '900', letterSpacing: '1.5px', marginBottom: '12px', paddingLeft: '15px', textTransform: 'uppercase' });
const btnStyle = (active, themeColor, textColor) => ({ display: 'flex', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', borderRadius: '12px', marginBottom: '4px', color: textColor, backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent', fontWeight: active ? '800' : '600', fontSize: '13px', position: 'relative' });
const iconWrapperS = (active) => ({ fontSize: '18px', marginRight: '12px', opacity: active ? 1 : 0.7 });
const activeIndicator = (textColor) => ({ position: 'absolute', left: '0px', width: '4px', height: '16px', backgroundColor: textColor, borderRadius: '0 10px 10px 0', boxShadow: `0 0 10px ${textColor}` });
const footerSection = (txt) => ({ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' });
const logoutBtn = (txt) => ({ width: '100%', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', color: txt, border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', fontSize: '10px' });

export default ShopSidebar;