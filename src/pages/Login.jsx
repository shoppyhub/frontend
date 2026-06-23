import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import HomeHeader from '../components/Customer/HomeHeader';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { toast } from 'react-toastify';

const Login = () => {
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated, user } = useAuth(); // 'user' को भी निकाला गया है
    const { settings } = useBranding();
    const navigate = useNavigate();

    /**
     * 🚩 Redirect Logic
     * यह फंक्शन यूजर रोल के आधार पर उसे सही डैशबोर्ड पर भेजता है।
     */
    const redirectByRole = useCallback((role) => {
        if (!role) return;
        const paths = {
            'SystemAdmin': '/admin',
            'SubSystemAdmin': '/sub-admin',
            'StateAdmin': '/state-admin',
            'DistrictAdmin': '/district-admin',
            'StateOperator': '/operator-dashboard',
            'DistrictOperator': '/operator-dashboard',
            'ShopOwner': '/shop-dashboard',
            'Staff': '/staff-dashboard',
            'Customer': '/'
        };
        navigate(paths[role] || '/', { replace: true });
    }, [navigate]);

    // अगर पहले से लॉगिन है, तो सीधे डैशबोर्ड पर भेजें
    useEffect(() => {
        if (isAuthenticated && user?.role) {
            redirectByRole(user.role);
        }
    }, [isAuthenticated, user, redirectByRole]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('status') === 'session_expired') {
            toast.warning('Your session has expired. Please log in again.');
        }
    }, []);

    /**
     * 🔐 Handle Login Handshake
     */
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { 
                identifier: formData.identifier.trim(), 
                password: formData.password 
            });

            if (res.data.success) {
                // ✅ [UPDATE]: पूरा res.data भेजें ताकि AuthContext तुरंत Normalize कर सके
                login(res.data);
                
                const userRole = res.data.user?.role || res.data.role;
                const userName = res.data.user?.fullName || res.data.fullName || "User";
                
                toast.success(`Welcome, ${userName.split(' ')[0]}`);

                // छोटा सा डिले ताकि स्टेट अपडेट हो जाए, फिर नेविगेट करें
                setTimeout(() => {
                    redirectByRole(userRole);
                }, 100);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Login Failed: System Unreachable");
        } finally { 
            setLoading(false); 
        }
    };

    const themeColor = settings.themeColor || '#0f172a';

    return (
        <div style={pageWrapper}>
            <HomeHeader />
            <div style={mainContent}>
                <div style={loginCard} className="fade-in">
                    
                    {/* Left: Branding Panel (Desktop Only) */}
                    <div style={brandPanel(themeColor)}>
                        <div style={brandOverlay}></div>
                        <div style={brandInfo}>
                            {settings.logoUrl ? (
                                <img src={settings.logoUrl} alt="Logo" style={logoImg} />
                            ) : (
                                <div style={logoFallback}>{settings.siteName?.charAt(0)}</div>
                            )}
                            <h1 style={titleL}>{settings.siteName || "RKD Mart"}</h1>
                            <p style={subL}>The most trusted unified ecosystem for business and trade management.</p>
                            <div style={statusTag}>🛡️ SSL Secure Connection</div>
                        </div>
                    </div>

                    {/* Right: Form Panel */}
                    <div style={formPanel}>
                        <div style={formHeader}>
                            <h2 style={formTitle}>Sign In</h2>
                            <p style={formSubtitle}>Access your secure dashboard session</p>
                        </div>

                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={labelS}>IDENTIFIER</label>
                                <div style={inputBox}>
                                    <span style={inputIcon}>👤</span>
                                    <input 
                                        style={inputS} 
                                        placeholder="Email or Mobile Number" 
                                        value={formData.identifier}
                                        onChange={(e)=>setFormData({...formData, identifier: e.target.value})}
                                        required
                                        autoComplete="username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelS}>PASSWORD</label>
                                <div style={inputBox}>
                                    <span style={inputIcon}>🔒</span>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        style={inputS} 
                                        placeholder="••••••••" 
                                        value={formData.password}
                                        onChange={(e)=>setFormData({...formData, password: e.target.value})}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button type="button" onClick={()=>setShowPassword(!showPassword)} style={eyeBtn}>
                                        {showPassword ? "👁️" : "🙈"}
                                    </button>
                                </div>
                            </div>

                            <button disabled={loading} style={submitBtn(themeColor)}>
                                {loading ? "Processing..." : "LOGIN"}
                            </button>
                        </form>

                        <div style={divider}><span style={divText}>EXTERNAL ACCESS</span></div>

                        <div style={footerLinks}>
                            <p style={footText}>New here? <Link to="/customer-register" style={{color: themeColor, fontWeight: '700', textDecoration: 'none'}}>Create Account</Link></p>
                            <Link to="/forgot-password" style={{...merchantLink, marginTop: '8px'}}>Forgot Password?</Link>
                            <Link to="/register" style={merchantLink}>Register Merchant Hub</Link>
                        </div>
                    </div>
                </div>
            </div>
            <p style={copyR}>© {new Date().getFullYear()} {settings.siteName}. All Data Encrypted.</p>
        </div>
    );
};

// --- Styles (Tighter Margins & Pro Look) ---
const pageWrapper = { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' };
const mainContent = { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px' };

const loginCard = { 
    width: '100%', maxWidth: '1000px', background: '#fff', borderRadius: '24px', 
    display: 'flex', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0', minHeight: '580px'
};

const brandPanel = (color) => ({
    flex: 1, background: color, position: 'relative', display: window.innerWidth < 800 ? 'none' : 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '40px'
});

const brandOverlay = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.15)', zIndex: 1 };
const brandInfo = { position: 'relative', zIndex: 2, textAlign: 'center' };
const logoImg = { height: '70px', marginBottom: '50px', borderRadius: '12px', objectFit: 'contain' };
const logoFallback = { width: '70px', height: '70px', background: '#fff', color: '#000', borderRadius: '15px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: '800' };
const titleL = { fontSize: '32px', fontWeight: '800', marginBottom: '10px' };
const subL = { fontSize: '15px', opacity: 0.8, maxWidth: '280px', margin: '0 auto 25px', lineHeight: '1.6' };
const statusTag = { fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '6px 15px', borderRadius: '100px', display: 'inline-block' };

const formPanel = { flex: 1, padding: window.innerWidth < 600 ? '40px 20px' : '50px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' };
const formHeader = { marginBottom: '20px' };
const formTitle = { fontSize: '26px', fontWeight: '800', color: '#0f172a' };
const formSubtitle = { color: '#64748b', fontSize: '14px', marginTop: '5px' };

const labelS = { display: 'block', fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px', letterSpacing: '1px' };
const inputBox = { position: 'relative', display: 'flex', alignItems: 'center' };
const inputIcon = { position: 'absolute', left: '16px', opacity: 0.5 };
const inputS = { width: '100%', padding: '14px 14px 14px 45px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', background: '#fcfdfe' };
const eyeBtn = { position: 'absolute', right: '15px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' };

const submitBtn = (color) => ({
    width: '100%', padding: '16px', background: color, color: '#fff', border: 'none', 
    borderRadius: '12px', fontSize: '15px', fontWeight: '700', boxShadow: `0 10px 20px ${color}44`, marginTop: '10px', cursor: 'pointer'
});

const divider = { textAlign: 'center', margin: '25px 0', borderBottom: '1px solid #f1f5f9', lineHeight: '0.1em' };
const divText = { background: '#fff', padding: '0 15px', color: '#cbd5e1', fontSize: '10px', fontWeight: '700' };

const footerLinks = { textAlign: 'center' };
const footText = { fontSize: '14px', color: '#64748b', marginBottom: '10px' };
const merchantLink = { fontSize: '13px', color: '#10b981', fontWeight: '700', textDecoration: 'none' };
const copyR = { textAlign: 'center', fontSize: '10px', color: '#94a3b8', padding: '70px' };

export default Login;