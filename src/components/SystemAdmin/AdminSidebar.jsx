import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBranding } from '../../context/BrandingContext';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ isOpen, closeSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { settings } = useBranding();
    const { logout } = useAuth();

    // --- Dynamic Theme Constants ---
    const themeColor = settings?.themeColor || '#0f172a';
    const textColor = settings?.headerTextColor || '#ffffff';

    const menuGroups = [
        {
            groupName: "CORE OPERATIONS",
            items: [
                { id: 'dashboard', label: 'Command Overview', icon: '📊' },
                { id: 'requests', label: 'Registration Queue', icon: '📑' },
                { id: 'shops', label: 'Active Hub Nodes', icon: '🏬' },
            ]
        },
        {
            groupName: "HIERARCHY CONTROL",
            items: [
                { id: 'hierarchy-all', label: 'Global Registry', icon: '🌐' },
                { id: 'subadmins', label: 'Central Admins', icon: '🛡️' },
                { id: 'state-mgmt', label: 'State Hubs', icon: '🏛️' },
                { id: 'district-mgmt', label: 'District Hubs', icon: '📍' },
                { id: 'merchant-mgmt', label: 'Merchant Hubs', icon: '🏪' },
                { id: 'users', label: 'Customer Registry', icon: '👥' },
            ]
        },
        {
            groupName: "GLOBAL INVENTORY",
            items: [
                { id: 'inventory-global', label: 'Master Inventory', icon: '🛒' },
                { id: 'inventory-low-stock', label: 'Depletion Alerts', icon: '⚠️' },
                { id: 'inventory-categories', label: 'Catalog Manager', icon: '📁' },
                { id: 'inventory-price', label: 'Price Protocol', icon: '⚖️' },
                { id: 'coupons', label: 'Incentive Engine', icon: '🎟️' },
            ]
        },
        {
            groupName: "GOVERNANCE",
            items: [
                { id: 'settings-branding', label: 'Identity & Brand', icon: '🏢' },
                { id: 'settings-advanced', label: 'Marketing & SEO', icon: '🎨' },
                { id: 'banners', label: 'Banner System', icon: '🖼️' },
                { id: 'settings-cms', label: 'Legal & Compliance', icon: '📜' },
            ]
        },
        {
            groupName: "INFRASTRUCTURE CLUSTER",
            items: [
                { id: 'api-management', label: 'API Lifecycle Manager', icon: '🚀' },
                { id: 'api-keys', label: 'Strategic API Vault', icon: '🔑' },
                { id: 'health', label: 'Node Health Monitor', icon: '🛰️' },
                { id: 'infra-health', label: 'Infra Health Details', icon: '📊' },
                { id: 'failover-logs', label: 'Failover Audit Trail', icon: '🔄' },
                { id: 'logs', label: 'Audit & Security Logs', icon: '📜' },
                { id: 'devices', label: 'Hardware Registry', icon: '📱' },
                { id: 'settings-infra', label: 'Infrastructure Sync', icon: '🛡️' },
            ]
        },
        {
            groupName: "SYSTEM CONFIG",
            items: [
                { id: 'settings-tax', label: 'Fiscal & Tax Node', icon: '🧾' },
                { id: 'settings-master', label: 'Master Directory', icon: '🗂️' },
                { id: 'settings-coverage', label: 'Jurisdiction Map', icon: '🗺️' },
            ]
        },
        {
            groupName: "COMMUNICATION",
            items: [
                { id: 'broadcast', label: 'Broadcast Center', icon: '📢' },
                { id: 'complaints', label: 'Grievance Redressal', icon: '🎧' },
            ]
        }
    ];

    const handleLogout = () => {
        if (window.confirm("CRITICAL: Terminate secure administrative session?")) {
            logout();
            navigate('/login');
        }
    };

    const isActive = (id) => location.pathname.includes(`/admin/${id}`);

    const handleNavigate = (id) => {
        navigate(`/admin/${id}`);
        if (window.innerWidth <= 1024) closeSidebar();
    };

    return (
        <>
            {/* 🌑 Mobile Overlay */}
            {isOpen && <div onClick={closeSidebar} style={overlayS}></div>}

            <aside style={{
                ...sidebarStyle(themeColor),
                transform: isOpen || window.innerWidth > 1024 ? 'translateX(0)' : 'translateX(-100%)',
            }}>
                <div className="custom-scroll" style={scrollArea}>
                    {menuGroups.map((group, gIdx) => (
                        <div key={gIdx} style={{ marginBottom: '25px' }}>
                            <div style={groupTitle(textColor)}>{group.groupName}</div>
                            {group.items.map((item) => (
                                <div 
                                    key={item.id} 
                                    onClick={() => handleNavigate(item.id)}
                                    style={btnStyle(isActive(item.id), themeColor, textColor)}
                                >
                                    <span style={iconWrapperS(isActive(item.id))}>{item.icon}</span>
                                    <span style={{ flex: 1, letterSpacing:'0.3px' }}>{item.label}</span>
                                    {isActive(item.id) && (
                                        <div style={activeIndicator(textColor)}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                <div style={footerSection(textColor)}>
                    <div style={statusRow(textColor)}>
                        <span className="online-pulse"></span>
                        <small style={{letterSpacing:'1px'}}>NODE_SECURE: {settings.siteName?.toUpperCase() || 'RKD_MART'}</small>
                    </div>
                    <button onClick={handleLogout} style={logoutBtn(textColor)}>
                        🚪 DISCONNECT SESSION
                    </button>
                </div>

                <style>{`
                    .custom-scroll::-webkit-scrollbar { width: 4px; }
                    .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                    .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                    .custom-scroll:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
                    
                    .online-pulse {
                        width: 8px; height: 8px; background: #10b981; border-radius: 50%;
                        box-shadow: 0 0 10px #10b981; animation: pulse-green 2s infinite;
                    }
                    @keyframes pulse-green {
                        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                        70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                    }
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
    padding: '20px 12px',
    boxSizing: 'border-box',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    boxShadow: '15px 0 40px rgba(0,0,0,0.15)',
    transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)'
});

const scrollArea = { 
    flex: 1, 
    overflowY: 'auto', 
    paddingRight: '5px',
    scrollbarWidth: 'none'
};

const groupTitle = (textColor) => ({ 
    color: textColor, 
    opacity: 0.35,
    fontSize: '9px', 
    fontWeight: '900', 
    letterSpacing: '1.8px', 
    marginBottom: '14px', 
    paddingLeft: '15px', 
    textTransform: 'uppercase' 
});

const btnStyle = (active, themeColor, textColor) => ({
    display: 'flex', 
    alignItems: 'center', 
    padding: '12px 16px', 
    cursor: 'pointer', 
    borderRadius: '14px', 
    marginBottom: '4px', 
    color: textColor, 
    backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
    fontWeight: active ? '800' : '600',
    fontSize: '13px',
    transition: '0.2s ease',
    position: 'relative',
    border: active ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent'
});

const iconWrapperS = (active) => ({
    fontSize: '18px', 
    marginRight: '14px',
    display: 'flex',
    alignItems: 'center',
    opacity: active ? 1 : 0.6
});

const activeIndicator = (textColor) => ({ 
    position: 'absolute', 
    left: '-4px', 
    width: '4px', 
    height: '20px', 
    backgroundColor: textColor, 
    borderRadius: '0 10px 10px 0',
    boxShadow: `0 0 15px ${textColor}`
});

const footerSection = (textColor) => ({ 
    borderTop: `1px solid rgba(255,255,255,0.08)`, 
    paddingTop: '20px',
    marginTop: '10px'
});

const statusRow = (textColor) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
    paddingLeft: '12px',
    color: textColor,
    opacity: 0.5,
    fontWeight: '900',
    fontSize: '9px'
});

const logoutBtn = (textColor) => ({ 
    width: '100%', 
    padding: '14px', 
    backgroundColor: 'rgba(255, 255, 255, 0.04)', 
    color: textColor, 
    border: '1px solid rgba(255, 255, 255, 0.12)', 
    borderRadius: '14px', 
    cursor: 'pointer', 
    fontWeight: '900',
    fontSize: '10px',
    transition: '0.3s',
    letterSpacing:'0.5px'
});

const overlayS = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.7)',
    zIndex: 8000,
    backdropFilter: 'blur(6px)',
    animation: 'fadeIn 0.3s ease'
};

export default AdminSidebar;