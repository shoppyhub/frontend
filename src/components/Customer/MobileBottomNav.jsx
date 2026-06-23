import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBranding } from '../../context/BrandingContext';
import { useCustomer } from '../../context/CustomerContext';
import { useAuth } from '../../context/AuthContext';

const MobileBottomNav = () => {
    const location = useLocation();
    const { settings } = useBranding();
    const { cart } = useCustomer();
    const { isAuthenticated } = useAuth();

    const isActive = (path) => location.pathname === path;

    // वॉलेट की स्थिति चेक करें (Admin Controlled)
    const isWalletEnabled = settings?.walletSettings?.enabled ?? true;

    // --- Navigation Nodes Configuration ---
    const navItems = [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/nearby-shops', label: 'Stores', icon: '🏪' },
        { path: '/my-orders', label: 'Orders', icon: '📦' },
        { path: '/cart', label: 'Cart', icon: '🛒', count: cart.length },
        { 
            path: isAuthenticated ? '/profile' : '/login', 
            label: isAuthenticated ? 'Profile' : 'Login', 
            icon: isAuthenticated ? '👤' : '🔑' 
        },
    ];

    return (
        <nav style={navBarStyle} className="mobile-app-nav">
            {navItems.map((item, index) => {
                const active = isActive(item.path);
                const themeColor = settings?.themeColor || '#0f172a';

                return (
                    <Link 
                        key={index} 
                        to={item.path} 
                        style={itemStyle(active)}
                    >
                        <div style={iconWrapper}>
                            <span style={{ 
                                fontSize: '22px',
                                filter: active ? 'none' : 'grayscale(0.5) opacity(0.7)',
                                transform: active ? 'scale(1.15)' : 'scale(1)',
                                transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'inline-block'
                            }}>
                                {item.icon}
                            </span>
                            
                            {/* 🛒 Dynamic Cart Badge */}
                            {item.count !== undefined && item.count > 0 && (
                                <span style={badgeStyle}>{item.count}</span>
                            )}

                            {/* 💰 Wallet Status Indicator */}
                            {item.label === 'Profile' && isAuthenticated && isWalletEnabled && (
                                <span style={walletDot(themeColor)}></span>
                            )}
                        </div>
                        
                        <span style={{ 
                            marginTop: '5px', 
                            fontSize: '10px',
                            fontWeight: active ? '900' : '700',
                            color: active ? themeColor : '#94a3b8',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            transition: '0.3s'
                        }}>
                            {item.label}
                        </span>
                        
                        {/* High-end Active Indicator Bar */}
                        {active && (
                            <div style={{...activeBar, backgroundColor: themeColor}}></div>
                        )}
                    </Link>
                );
            })}

            <style>{`
                @media (min-width: 769px) {
                    .mobile-app-nav { display: none !important; }
                }
            `}</style>
        </nav>
    );
};

// --- Enterprise SaaS Visual Definitions ---

const navBarStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '72px',
    backgroundColor: '#ffffff',
    borderTop: '1.5px solid #f1f5f9',
    zIndex: 9999,
    boxShadow: '0 -10px 25px rgba(0,0,0,0.04)',
    paddingBottom: 'env(safe-area-inset-bottom)', // Optimization for Modern Mobile Devices
    boxSizing: 'border-box'
};

const itemStyle = (active) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    flex: 1,
    height: '100%',
    position: 'relative',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent'
});

const iconWrapper = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '26px'
};

const badgeStyle = {
    position: 'absolute',
    top: '-8px',
    right: '-12px',
    background: '#ef4444',
    color: '#fff',
    fontSize: '9px',
    fontWeight: '900',
    padding: '2px 6px',
    borderRadius: '10px',
    border: '2px solid #fff',
    minWidth: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(239, 68, 68, 0.3)'
};

const walletDot = (color) => ({
    position: 'absolute',
    top: '-2px',
    right: '-4px',
    width: '8px',
    height: '8px',
    background: '#10b981', 
    borderRadius: '50%',
    border: '2px solid #fff',
    boxShadow: `0 0 10px ${color}44`
});

const activeBar = {
    position: 'absolute',
    top: 0,
    width: '35px',
    height: '4px',
    borderRadius: '0 0 10px 10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    animation: 'slideDown 0.3s ease'
};

export default MobileBottomNav;