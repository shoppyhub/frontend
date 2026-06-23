import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HomeHeader from '../../components/Customer/HomeHeader';
import MobileBottomNav from '../../components/Customer/MobileBottomNav';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext'; // Added for White-labeling
import { toast } from 'react-toastify';

const CustomerProfile = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { settings } = useBranding(); // Access Global Admin Settings
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. 📡 Silent Background Sync Protocol (No Buttons)
    const fetchProfileIntel = useCallback(async () => {
        try {
            const res = await api.get('/auth/profile');
            if (res.data.success) {
                setUser(res.data.data);
                document.title = `My Profile | ${settings.siteName}`;
            }
        } catch (err) {
            console.error("Profile Sync Error");
            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate, logout, settings.siteName]);

    useEffect(() => {
        fetchProfileIntel();
        
        // Auto-sync when user returns to the tab
        window.addEventListener('focus', fetchProfileIntel);
        return () => window.removeEventListener('focus', fetchProfileIntel);
    }, [fetchProfileIntel]);

    const handleLogout = () => {
        if (window.confirm("TERMINATION PROTOCOL: Are you sure you want to end this session?")) {
            logout();
            toast.info("Session terminated successfully.");
        }
    };

    if (loading) return <SkeletonLoader themeColor={settings.themeColor} siteName={settings.siteName} />;

    // Feature Access Control
    const isWalletEnabled = settings?.walletSettings?.enabled ?? true;
    const isReferralEnabled = settings?.walletSettings?.referralFeatureEnabled ?? true;

    return (
        <div style={pageWrapper}>
            <HomeHeader />
            
            <div style={mainLayout}>
                {/* --- [A] DYNAMIC IDENTITY MODULE --- */}
                <div style={heroSection(settings.themeColor)}>
                    <div style={profileCircle}>
                        <img 
                            src={user?.photo || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                            style={avatarImg} 
                            alt="Identity" 
                        />
                    </div>
                    <div style={heroText}>
                        <h1 style={userName}>{user?.fullName}</h1>
                        <p style={userHandle}>
                            Login: <b style={{color: '#fff'}}>{user?.email || user?.mobile || 'N/A'}</b>
                        </p>
                        <div style={badgeRow}>
                            <span style={primeBadge}>✦ Verified Profile</span>
                            <span style={nodeBadge}>{user?.role?.toUpperCase()}</span>
                        </div>
                    </div>
                    <Link to="/edit-identity" style={editFloatingBtn}>Configure</Link>
                </div>

                {/* --- [B] METRICS ANALYTICS --- */}
                <div style={statsGrid}>
                    <StatCard icon="📦" label="Total Orders" value={user?.orderCount || 0} sub="Transaction Count" />
                    
                    {isWalletEnabled && (
                        <StatCard 
                            icon="💳" 
                            label="Wallet Assets" 
                            value={`₹${user?.wallet?.balance || 0}`} 
                            sub={`${settings?.siteName} Pay Balance`} 
                        />
                    )}

                    <StatCard icon="🎁" label="Referral Points" value={user?.referral?.totalReferrals || 0} sub="Network Influence" />
                </div>

                {/* --- [C] COMMAND CENTER (Menu) --- */}
                <div style={menuContainer}>
                    <h3 style={sectionTitle}>Personal Administration</h3>
                    <div style={menuList}>
                        <MenuLink to="/edit-identity" icon="👤" title="Identity Settings" desc="Update personal data & security keys" />
                        <MenuLink to="/my-orders" icon="🛍️" title="Purchase Ledger" desc="Monitor delivery status & order history" />
                        <MenuLink to="/address-book" icon="📍" title="Logistics Nodes" desc="Manage primary delivery locations" />
                        
                        {isWalletEnabled && (
                            <MenuLink to="/wallet" icon="💰" title="Financial Vault" desc="Audit transactions & recharge wallet" />
                        )}

                        {isReferralEnabled && (
                            <MenuLink 
                                to="/refer-earn" 
                                icon="🔗" 
                                title="Growth Network" 
                                desc={`Registry Key: ${user?.referral?.code || 'LINKING...'}`} 
                            />
                        )}
                    </div>

                    <h3 style={{...sectionTitle, marginTop:'30px'}}>Support Infrastructure</h3>
                    <div style={menuList}>
                        <MenuLink to="/support" icon="🎧" title="Helpdesk Support" desc="Open a ticket with technical cluster" />
                        <MenuLink to="/terms" icon="📜" title="Protocol Terms" desc="Ecosystem legal terms & compliance" />
                    </div>

                    <button onClick={handleLogout} style={logoutBtn}>
                        SECURE LOGOUT
                    </button>
                    
                    <div style={versionTag}>
                        {settings?.siteName} Build v{settings?.appVersion || '3.0.1'} • Stable Node
                    </div>
                </div>
            </div>

            <MobileBottomNav />
        </div>
    );
};

// --- Atomic Helper Components ---
const StatCard = ({ icon, label, value, sub }) => (
    <div style={statCardS}>
        <div style={statIconBox}>{icon}</div>
        <div>
            <div style={statLabel}>{label}</div>
            <div style={statValue}>{value}</div>
            <div style={statSub}>{sub}</div>
        </div>
    </div>
);

const MenuLink = ({ to, icon, title, desc }) => (
    <Link to={to} style={menuRowS}>
        <div style={iconBox}>{icon}</div>
        <div style={{flex:1}}>
            <div style={menuTitle}>{title}</div>
            <div style={menuDesc}>{desc}</div>
        </div>
        <span style={chevron}>❯</span>
    </Link>
);

const SkeletonLoader = ({ themeColor, siteName }) => (
    <div style={skeletonContainer}>
        <div className="spinner" style={{borderTopColor: themeColor || '#0f172a'}}></div>
        <p style={{marginTop:'20px', color:'#94a3b8', fontWeight:'800', letterSpacing:'1.5px', fontSize:'12px'}}>
            SYNCING {siteName?.toUpperCase()} IDENTITY...
        </p>
        <style>{`
            .spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
    </div>
);

// --- Enterprise SaaS Design System ---

const pageWrapper = { background: '#f8fafc', minHeight: '100vh', paddingBottom: '120px', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const mainLayout = { width: '94%', maxWidth: '900px', margin: '0 auto' };

const heroSection = (color) => ({ 
    background: color ? `linear-gradient(135deg, ${color} 0%, #1e293b 100%)` : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
    borderRadius: '0 0 40px 40px', 
    padding: window.innerWidth < 768 ? '40px 20px' : '60px 40px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '25px', 
    color: '#fff', 
    position: 'relative',
    boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
});

const profileCircle = { width: '90px', height: '90px', borderRadius: '28px', overflow: 'hidden', border: '4px solid rgba(255,255,255,0.2)', flexShrink: 0, background: '#fff' };
const avatarImg = { width: '100%', height: '100%', objectFit: 'cover' };
const heroText = { flex: 1 };

const userName = { fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: '900', margin: 0, letterSpacing: '-1px' };
const userHandle = { color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '5px 0 15px', fontWeight: '600' };

const badgeRow = { display: 'flex', gap: '10px' };
const primeBadge = { background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', color: '#fff', padding: '5px 12px', borderRadius: '10px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing:'0.5px' };
const nodeBadge = { background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '5px 12px', borderRadius: '10px', fontSize: '9px', fontWeight: '900' };

const editFloatingBtn = { position: 'absolute', top: '30px', right: '30px', background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none', padding: '8px 18px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', border: '1px solid rgba(255,255,255,0.2)' };

const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px', marginTop: '-35px', position: 'relative', zIndex: 10, padding: '0 20px' };

const statCardS = { background: '#fff', padding: '20px', borderRadius: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #f1f5f9' };
const statIconBox = { width: '45px', height: '45px', borderRadius: '15px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' };
const statLabel = { fontSize: '10px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' };
const statValue = { fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: '2px 0' };
const statSub = { fontSize: '10px', color: '#10b981', fontWeight: '800' };

const menuContainer = { marginTop: '45px', padding: '0 20px' };
const sectionTitle = { fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px', paddingLeft: '5px' };
const menuList = { background: '#fff', borderRadius: '32px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' };

const menuRowS = { display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 25px', textDecoration: 'none', borderBottom: '1.5px solid #f8fafc', transition: '0.2s' };
const iconBox = { width: '45px', height: '45px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' };
const menuTitle = { fontSize: '15px', fontWeight: '800', color: '#1e293b' };
const menuDesc = { fontSize: '11px', color: '#64748b', marginTop: '3px', fontWeight: '500' };
const chevron = { color: '#cbd5e1', fontSize: '12px' };

const logoutBtn = { width: '100%', padding: '20px', background: '#fff1f2', color: '#f43f5e', border: '1px solid #fee2e2', borderRadius: '22px', fontWeight: '900', marginTop: '40px', cursor: 'pointer', fontSize: '14px', letterSpacing: '1px' };
const versionTag = { textAlign: 'center', color: '#cbd5e1', fontSize: '10px', fontWeight: '800', marginTop: '30px', textTransform: 'uppercase', letterSpacing: '2px' };

const skeletonContainer = { height: '100vh', display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', background: '#fff' };

export default CustomerProfile;