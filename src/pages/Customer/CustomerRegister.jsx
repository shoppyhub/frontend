import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import HomeHeader from '../../components/Customer/HomeHeader';
import { toast } from 'react-toastify';
import { useBranding } from '../../context/BrandingContext';

const CustomerRegister = () => {
    const navigate = useNavigate();
    const { settings } = useBranding();
    
    // --- States ---
    const [loading, setLoading] = useState(false);
    const [verifyingEmail, setVerifyingEmail] = useState(false);
    const [verifyingMobile, setVerifyingMobile] = useState(false);
    
    // Identity Verification Status
    const [emailVerified, setEmailVerified] = useState(false);
    const [mobileVerified, setMobileVerified] = useState(false);

    const [formData, setFormData] = useState({ 
        fullName: '', gender: '', dob: '', email: '', 
        mobile: '', password: '', confirmPassword: '', 
        referralCode: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- 📧 Email Verification Handler ---
    const handleVerifyEmail = async () => {
        if (!formData.email.trim()) return toast.warning("Email identity is required.");
        setVerifyingEmail(true);
        try {
            // OTP Simulation (Replace with actual API call)
            const otp = window.prompt("Enter 6-digit code dispatched to your email:");
            if (otp && otp.length === 6) {
                setEmailVerified(true);
                toast.success("Email Verified ✅");
            }
        } catch (err) { toast.error("Verification protocol failed."); }
        finally { setVerifyingEmail(false); }
    };

    // --- 📱 Mobile Verification Handler ---
    const handleVerifyMobile = async () => {
        if (formData.mobile.length !== 10) return toast.warning("10-digit mobile number required.");
        setVerifyingMobile(true);
        try {
            // OTP Simulation (Replace with actual API call)
            const otp = window.prompt("Enter 6-digit security code received via SMS:");
            if (otp && otp.length === 6) {
                setMobileVerified(true);
                toast.success("Mobile Verified ✅");
            }
        } catch (err) { toast.error("SMS handshake failed."); }
        finally { setVerifyingMobile(false); }
    };

    // --- 🛡️ Validation Engine ---
    const isFormValid = () => {
        const { fullName, gender, dob, email, mobile, password, confirmPassword } = formData;
        
        // 1. Check if all mandatory fields are filled
        const allFieldsFilled = fullName && gender && dob && email && mobile && password && confirmPassword;
        
        // 2. Passwords must match
        const passwordsMatch = password === confirmPassword;

        // 3. Verification Logic based on Admin Settings
        const emailReady = settings?.emailVerificationEnabled ? emailVerified : true;
        const mobileReady = settings?.mobileVerificationEnabled ? mobileVerified : true;

        return allFieldsFilled && passwordsMatch && emailReady && mobileReady;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isFormValid()) return toast.error("Deployment Error: Complete all mandatory identity nodes.");

        setLoading(true);
        try {
            const res = await api.post('/auth/register/customer', formData);
            if (res.data.success) {
                toast.success(`Welcome to ${settings.siteName}! Login with your email or mobile number.`);
                navigate('/login');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Registry sync error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={pageBg}>
            <HomeHeader />
            
            <div style={mainContainer}>
                <div style={registerCard}>
                    
                    {/* --- Branded Header --- */}
                    <div style={brandHeader}>
                        {settings.logoUrl ? (
                            <img src={settings.logoUrl} alt="Logo" style={dynamicLogoS} />
                        ) : (
                            <div style={logoPlaceholder(settings.themeColor)}>{settings.siteName?.charAt(0)}</div>
                        )}
                        <h2 style={brandName}>{settings.siteName || 'Infrastructure'}</h2>
                        <p style={subText}>Identity & Security Hub</p>
                    </div>

                    <div style={formTitleArea(settings.themeColor)}>
                        <h3 style={formTitle}>Establish User Profile</h3>
                        <p style={formSub}>All fields are cryptographically mandatory.</p>
                    </div>

                    <form onSubmit={handleSubmit} style={formS}>
                        
                        {/* Legal Name */}
                        <div style={inputGroup}>
                            <label style={labS}>Full Legal Name *</label>
                            <input type="text" name="fullName" placeholder="Enter as per Govt. ID" onChange={handleChange} required style={inputS} />
                        </div>

                        {/* Gender & DOB */}
                        <div style={grid2}>
                            <div style={inputGroup}>
                                <label style={labS}>Gender *</label>
                                <select name="gender" onChange={handleChange} required style={inputS}>
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div style={inputGroup}>
                                <label style={labS}>Date of Birth *</label>
                                <input type="date" name="dob" onChange={handleChange} required style={inputS} />
                            </div>
                        </div>

                        {/* Email with Conditional Verification */}
                        <div style={inputGroup}>
                            <label style={labS}>Email Identity *</label>
                            <div style={verifyWrapper}>
                                <input 
                                    type="email" name="email" placeholder="example@domain.com" 
                                    onChange={handleChange} disabled={emailVerified && settings?.emailVerificationEnabled}
                                    style={emailVerified && settings?.emailVerificationEnabled ? verifiedInput : inputS} required 
                                />
                                {settings?.emailVerificationEnabled && !emailVerified && formData.email.length > 2 && (
                                    <button type="button" onClick={handleVerifyEmail} style={verifyBtn(settings.themeColor)}>
                                        {verifyingEmail ? "..." : "Verify"}
                                    </button>
                                )}
                                {settings?.emailVerificationEnabled && emailVerified && <span style={checkBadge}>Verified ✅</span>}
                            </div>
                        </div>

                        {/* Mobile with Conditional Verification */}
                        <div style={inputGroup}>
                            <label style={labS}>Mobile Identifier *</label>
                            <div style={verifyWrapper}>
                                <input 
                                    type="text" name="mobile" placeholder="10-digit number" 
                                    onChange={handleChange} disabled={mobileVerified && settings?.mobileVerificationEnabled} maxLength="10"
                                    style={mobileVerified && settings?.mobileVerificationEnabled ? verifiedInput : inputS} required 
                                />
                                {settings?.mobileVerificationEnabled && !mobileVerified && formData.mobile.length === 10 && (
                                    <button type="button" onClick={handleVerifyMobile} style={verifyBtn(settings.themeColor)}>
                                        {verifyingMobile ? "..." : "Verify"}
                                    </button>
                                )}
                                {settings?.mobileVerificationEnabled && mobileVerified && <span style={checkBadge}>Verified ✅</span>}
                            </div>
                        </div>

                        {/* Passwords */}
                        <div style={grid2}>
                            <div style={inputGroup}>
                                <label style={labS}>Access Password *</label>
                                <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required style={inputS} />
                            </div>
                            <div style={inputGroup}>
                                <label style={labS}>Confirm Key *</label>
                                <input type="password" name="confirmPassword" placeholder="••••••••" onChange={handleChange} required style={inputS} />
                            </div>
                        </div>

                        {/* Optional Referral Code */}
                        {settings?.referralEnabled && (
                            <div style={inputGroup}>
                                <label style={labS}>Referral Code (Optional)</label>
                                <input type="text" name="referralCode" placeholder="Enter referral ID" onChange={handleChange} style={refInputS(settings.themeColor)} />
                            </div>
                        )}

                        <button 
                            type="submit" 
                            style={isFormValid() ? regBtn(settings.themeColor) : disabledBtn} 
                            disabled={loading || !isFormValid()}
                        >
                            {loading ? "COMMITTING DATA..." : "CREATE SECURE ACCOUNT"}
                        </button>
                    </form>
                    
                    <div style={footerText}>
                        Already registered? <Link to="/login" style={loginLink(settings.themeColor)}>Access Profile</Link>
                    </div>
                </div>
            </div>

            <div style={bottomNotice}>
                🛡️ Managed by {settings.siteName} Infrastructure. End-to-end identity encryption active.
            </div>
        </div>
    );
};

// --- Professional UI Architecture ---

const pageBg = { background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const mainContainer = { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0px 0px' };

const registerCard = { 
    background: '#ffffff', width: '100%', maxWidth: '520px', padding: window.innerWidth < 600 ? '30px 20px' : '45px', 
    borderRadius: '40px', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.05)', 
    border: '1px solid #f1f5f9', boxSizing: 'border-box' 
};

const brandHeader = { textAlign: 'center', marginBottom: '30px' };
const dynamicLogoS = { height: '50px', marginBottom: '15px', borderRadius: '10px', objectFit: 'contain' };
const logoPlaceholder = (color) => ({ width:'50px', height:'50px', background: color || '#0f172a', color:'#fff', borderRadius:'15px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', margin:'0 auto 12px', fontSize:'22px' });

const brandName = { margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px' };
const subText = { margin: '5px 0 0', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' };

const formTitleArea = (color) => ({ marginBottom: '30px', borderLeft: `5px solid ${color || '#0f172a'}`, paddingLeft: '15px' });
const formTitle = { margin: 0, fontSize: '18px', fontWeight: '900', color: '#1e293b' };
const formSub = { margin: '4px 0 0', fontSize: '12px', color: '#64748b', fontWeight: '600' };

const formS = { display: 'flex', flexDirection: 'column', gap: '18px' };
const grid2 = { display: 'grid', gridTemplateColumns: window.innerWidth < 600 ? '1fr' : '1fr 1fr', gap: '15px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labS = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' };

const inputS = { width: '100%', padding: '15px', borderRadius: '16px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '14px', background: '#f8fafc', fontWeight: '700', color: '#1e293b', boxSizing: 'border-box', transition:'0.3s' };
const verifiedInput = { ...inputS, background: '#f0fdf4', borderColor: '#10b981', color: '#166534' };

const verifyWrapper = { display: 'flex', gap: '10px', alignItems: 'center' };
const verifyBtn = (color) => ({ background: color || '#0f172a', color: '#fff', border: 'none', padding: '0 20px', height: '48px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '11px', animation: 'fadeIn 0.3s ease' });
const checkBadge = { color: '#10b981', fontWeight: '900', fontSize: '12px', whiteSpace: 'nowrap' };

const refInputS = (color) => ({ ...inputS, border: `2px dashed ${color || '#2563eb'}`, background: '#fff' });

const regBtn = (color) => ({ 
    width: '100%', padding: '18px', backgroundColor: color || '#0f172a', color: '#fff', border: 'none', 
    borderRadius: '16px', fontSize: '14px', fontWeight: '900', cursor: 'pointer', 
    boxShadow: `0 10px 20px -5px ${color}66`, transition: '0.3s', marginTop: '10px' 
});
const disabledBtn = { ...regBtn('#cbd5e1'), cursor: 'not-allowed', boxShadow: 'none' };

const footerText = { marginTop: '25px', textAlign: 'center', fontSize: '13px', color: '#64748b', fontWeight: '700' };
const loginLink = (color) => ({ color: color || '#2563eb', fontWeight: '900', textDecoration: 'none' });

const bottomNotice = { textAlign: 'center', padding: '30px', fontSize: '10px', color: '#cbd5e1', fontWeight: '800' };

export default CustomerRegister;