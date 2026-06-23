import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBranding } from '../../context/BrandingContext';
import { useAuth } from '../../context/AuthContext';
import { useCustomer } from '../../context/CustomerContext';

const HomeHeader = () => {
    const navigate = useNavigate();
    const { settings } = useBranding();
    const { user, logout, isAuthenticated } = useAuth();
    const { pincode, setPincode, cart } = useCustomer();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${searchTerm}&pin=${pincode}`);
        }
    };

    const handlePincodeChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val.length <= 6) {
            setPincode(val);
            localStorage.setItem('userPincode', val);
        }
    };

    const themeColor = settings?.themeColor || '#0f172a';

    return (
        <header style={headerStyles(themeColor, scrolled)}>
            <div style={containerStyles}>
                
                {/* --- [1] LOGO AREA --- */}
                <div style={leftSection}>
                    <Link to="/" style={logoLink}>
                        {settings.logoUrl ? (
                            <img src={settings.logoUrl} alt="Logo" style={logoImg} />
                        ) : (
                            <div style={logoPlaceholder(themeColor)}>
                                {settings.siteName?.charAt(0) || 'M'}
                            </div>
                        )}
                        <span style={logoText}>{settings.siteName}</span>
                    </Link>

                    <div style={desktopOnly}>
                        <Link to="/nearby-shops" style={navPill}>🏪 Shops Nearby</Link>
                    </div>
                </div>

                {/* --- [2] SEARCH & PINCODE --- */}
                <div style={middleSection}>
                    <div style={searchComposite}>
                        <div style={pincodeGroup}>
                            <span style={{fontSize:'14px'}}>📍</span>
                            <input 
                                style={pinInput} 
                                placeholder="PIN" 
                                value={pincode} 
                                onChange={handlePincodeChange}
                                maxLength="6"
                            />
                        </div>
                        <form style={searchForm} onSubmit={handleSearch}>
                            <input 
                                style={searchInput} 
                                placeholder="Search for products, stores or categories..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit" style={searchBtn(themeColor)}>🔍</button>
                        </form>
                    </div>
                </div>

                {/* --- [3] ACTIONS (Profile, Cart) --- */}
                <div style={rightSection}>
                    <div style={desktopOnly}>
                        <Link to="/" style={navLink}>🏠Home</Link>
                    </div>

                    {isAuthenticated ? (
                        <div 
                            style={profileWrapper} 
                            onMouseEnter={() => setShowProfileMenu(true)} 
                            onMouseLeave={() => setShowProfileMenu(false)}
                        >
                            <div style={profileTrigger}>
                                <div style={avatar(themeColor)}>
                                    {user?.fullName?.charAt(0) || 'U'}
                                </div>
                                <span style={desktopOnly}>{user?.fullName?.split(' ')[0]} ▾</span>
                            </div>
                            
                            {showProfileMenu && (
                                <div style={dropdownContainer}>
                                    <div style={dropdownBridge}></div>
                                    <div style={dropdownInner}>
                                        <div style={dropHeader(themeColor)}>Session: {user?.fullName?.split(' ')[0]}</div>
                                        <Link to="/profile" style={dropItem}>👤 My Profile</Link>
                                        <Link to="/my-orders" style={dropItem}>📦 My Orders</Link>
                                        <Link to="/wallet" style={dropItem}>💰 Wallet</Link>
                                        <div style={divider}></div>
                                        <div style={logoutBtn} onClick={logout}>🚪 Logout</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" style={loginPill}>🔐Login</Link>
                    )}

                    <Link to="/cart" style={cartLink}>
                        <div style={cartIconWrap}>
                            🛒
                            {cart.length > 0 && <span style={cartBadge}>{cart.length}</span>}
                        </div>
                        <span style={desktopOnly}>Cart</span>
                    </Link>
                </div>
            </div>

            {/* Mobile View Search */}
            <div style={mobileSearchRow}>
                <div style={searchCompositeMobile}>
                     <input 
                        style={searchInputMobile} 
                        placeholder="Search our catalog..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                    />
                </div>
            </div>
        </header>
    );
};

// --- Full Defined Styles ---

const headerStyles = (color, scrolled) => ({
    background: color,
    position: 'fixed', top: 0, left: 0, right: 0,
    zIndex: 9000,
    padding: scrolled ? '8px 0' : '12px 0',
    color: '#fff', width: '100%',
    boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.2)' : 'none',
    transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
});

const containerStyles = { width: '94%', maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' };
const leftSection = { display: 'flex', alignItems: 'center', gap: '25px' };
const logoLink = { textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' };
const logoImg = { height: '38px', width: '38px', borderRadius: '10px', background: '#fff', padding:'2px', objectFit:'contain' };
const logoPlaceholder = (color) => ({ width: '38px', height: '38px', background: '#fff', color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', borderRadius: '10px', fontSize: '20px' });
const logoText = { fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px' };

const navPill = { color: '#fff', textDecoration: 'none', fontSize: '12px', fontWeight: '800', background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '10px', textTransform: 'uppercase' };
const navLink = { color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: '700' };

const middleSection = { flex: 1, maxWidth: '600px', display: window.innerWidth < 1024 ? 'none' : 'block' };
const searchComposite = { display: 'flex', background: '#fff', borderRadius: '12px', overflow: 'hidden', height: '42px', alignItems: 'center' };
const pincodeGroup = { display: 'flex', alignItems: 'center', padding: '0 15px', background: '#f8fafc', borderRight: '1.5px solid #e2e8f0', color: '#334155' };
const pinInput = { width: '50px', border: 'none', background: 'transparent', fontWeight: '800', outline: 'none', color: '#0f172a' };
const searchForm = { flex: 1, display: 'flex', height: '100%' };
const searchInput = { flex: 1, border: 'none', padding: '0 15px', outline: 'none', fontSize: '14px', fontWeight: '600', color:'#333' };
const searchBtn = (color) => ({ background: 'transparent', border: 'none', padding: '0 15px', cursor: 'pointer', fontSize: '18px', color: color });

const rightSection = { display: 'flex', alignItems: 'center', gap: '25px' };
const loginPill = { background: '#fff', color: '#0f172a', padding: '8px 25px', borderRadius: '12px', fontWeight: '900', textDecoration: 'none', fontSize: '13px' };
const cartLink = { color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' };
const cartIconWrap = { position: 'relative', fontSize: '22px' };
const cartBadge = { position: 'absolute', top: '-8px', right: '-10px', background: '#ff3f6c', color: '#fff', fontSize: '9px', padding: '2px 6px', borderRadius: '50%', border: '2px solid #fff' };

const profileWrapper = { position: 'relative', cursor: 'pointer', paddingBottom: '10px', marginTop:'10px' };
const profileTrigger = { display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontWeight: '800', fontSize: '14px' };
const avatar = (color) => ({ width: '32px', height: '32px', background: '#fff', color: color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' });

const dropdownContainer = { position: 'absolute', top: '35px', right: 0, zIndex: 9999, paddingTop: '15px' };
const dropdownBridge = { position: 'absolute', top: 0, left: 0, right: 0, height: '15px', background: 'transparent' };
const dropdownInner = { background: '#fff', borderRadius: '15px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', width: '220px', overflow: 'hidden', border: '1px solid #f1f5f9' };
const dropHeader = (color) => ({ padding: '15px 20px', fontWeight: '900', color: '#fff', background: color, fontSize: '11px', textTransform: 'uppercase' });
const dropItem = { display: 'block', padding: '12px 20px', color: '#475569', textDecoration: 'none', fontSize: '13px', fontWeight: '700', transition: '0.2s' };
const divider = { height: '1px', background: '#f1f5f9', margin: '5px 0' };
const logoutBtn = { ...dropItem, color: '#f43f5e', borderTop: '1px solid #f1f5f9' };

const desktopOnly = window.innerWidth < 1024 ? { display: 'none' } : {};
const mobileSearchRow = { width: '94%', margin: '10px auto 0 auto', display: window.innerWidth < 1024 ? 'block' : 'none' };
const searchCompositeMobile = { background: '#fff', borderRadius: '12px', padding: '8px 15px', display: 'flex' };
const searchInputMobile = { border: 'none', width: '100%', outline: 'none', fontSize: '14px', color: '#0f172a', fontWeight: '600' };

export default HomeHeader;