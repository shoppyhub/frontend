import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useBranding } from '../../../context/BrandingContext';
import { useAuth } from '../../../context/AuthContext';

const AdminSecurity = () => {
    const navigate = useNavigate();
    const { settings } = useBranding();
    const { logout } = useAuth();

    const [passData, setPassData] = useState({ 
        oldPassword: '', 
        newPassword: '', 
        confirmPassword: '' 
    });
    const [otp, setOtp] = useState("");
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 1. 📡 Automatic Metadata Sync
    useEffect(() => {
        document.title = `Security Protocols | ${settings.siteName}`;
    }, [settings.siteName]);

    // 2. 🔐 Step 1: Initiate Security Rotation (Request OTP)
    const handleInitiateRotation = async (e) => {
        e.preventDefault();
        
        if (passData.newPassword.length < 8) {
            return toast.warning("Security Policy: Access key must be at least 8 characters.");
        }
        if (passData.newPassword !== passData.confirmPassword) {
            return toast.error("Configuration Mismatch: New keys do not match.");
        }

        try {
            setIsLoading(true);
            const res = await api.post('/auth/security/request-otp');
            if (res.data.success) {
                setShowOtpModal(true);
                toast.info(`Authorized security code dispatched by ${settings.siteName}.`);
            }
        } catch (err) {
            toast.error("Security Gateway Error: OTP dispatch failed.");
        } finally {
            setIsLoading(false);
        }
    };

    // 3. 🚀 Step 2: Final Verification & Key Rotation
    const handleVerifyAndRotate = async () => {
        if (otp.length !== 6) return toast.warning("Protocol Error: Valid 6-digit code required.");

        try {
            setIsLoading(true);
            const res = await api.put('/auth/security/update-password', {
                ...passData,
                otp
            });

            if (res.data.success) {
                toast.success("Identity Credentials Rotated Successfully! ✅");
                setTimeout(() => {
                    logout(); // Terminate all sessions for safety
                    navigate('/login');
                }, 2000);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Verification Failed: Access Denied.");
        } finally {
            setIsLoading(false);
        }
    };

    const themeColor = settings?.themeColor || '#0f172a';

    return (
        <div style={containerS}>
            {/* --- [A] COMMAND HEADER --- */}
            <div style={headerS}>
                <h2 style={titleS}>🔐 Security & Cryptography Hub</h2>
                <p style={subS}>Manage system access keys and multi-factor authorization protocols for {settings.siteName}.</p>
            </div>

            <div style={layoutGrid}>
                {/* --- [B] CREDENTIAL ROTATION MODULE --- */}
                <div style={cardS}>
                    <h4 style={cardHead(themeColor)}>Access Key Rotation</h4>
                    <p style={nodeHintS}>Perform a secure update of your administrative node credentials.</p>
                    
                    <form onSubmit={handleInitiateRotation}>
                        <div style={inputGroupS}>
                            <label style={labS}>Current Access Key</label>
                            <input 
                                type="password" 
                                style={inS} 
                                placeholder="••••••••••••" 
                                required
                                onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                            />
                        </div>
                        <div style={inputGroupS}>
                            <label style={labS}>New Secure Key</label>
                            <input 
                                type="password" 
                                style={inS} 
                                placeholder="Entropy: Minimum 8 characters" 
                                required
                                onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                            />
                        </div>
                        <div style={inputGroupS}>
                            <label style={labS}>Confirm Key Rotation</label>
                            <input 
                                type="password" 
                                style={inS} 
                                placeholder="Repeat new secure key" 
                                required
                                onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                            />
                        </div>
                        
                        <div style={warningBoxS}>
                            <div style={{fontWeight:'900', marginBottom:'5px'}}>⚠️ SECURITY PROTOCOL ALERT</div>
                            Updating your access key will immediately terminate all active administrative sessions across the global cluster.
                        </div>

                        <button 
                            type="submit" 
                            style={isLoading ? btnDisabledS : commitBtnS(themeColor)} 
                            disabled={isLoading}
                        >
                            {isLoading ? 'DISPATCHING OTP...' : 'INITIATE KEY ROTATION'}
                        </button>
                    </form>
                </div>

                {/* --- [C] COMPLIANCE GUIDELINES --- */}
                <div style={cardS}>
                    <h4 style={cardHead(themeColor)}>Governance Standards</h4>
                    <p style={nodeHintS}>Policy requirements for identity nodes.</p>
                    
                    <div style={checklistS}>
                        <div style={checkItemS}>
                            <span style={dotActive(themeColor)}>✔</span> Minimum 8 cryptographic characters.
                        </div>
                        <div style={checkItemS}>
                            <span style={dotActive(themeColor)}>✔</span> Alphanumeric (A-Z, 0-9) complexity.
                        </div>
                        <div style={checkItemS}>
                            <span style={dotActive(themeColor)}>✔</span> Inclusion of special character symbols.
                        </div>
                        <div style={checkItemS}>
                            <span style={dotActive(themeColor)}>✔</span> Case-sensitive (Upper & Lower) nodes.
                        </div>
                        
                        <div style={dividerS}></div>
                        
                        <div style={auditNoteS}>
                            <b>Audit Registry:</b> It is recommended to rotate administrative keys every 90 days. All security events are logged in the <b>Global Audit Trail</b>.
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 🔒 MULTI-FACTOR AUTHORIZATION MODAL --- */}
            {showOtpModal && (
                <div style={overlayS}>
                    <div style={modalS}>
                        <div style={lockIconS(themeColor)}>🔒</div>
                        <h3 style={modalTitleS}>MFA Verification</h3>
                        <p style={modalTextS}>
                            A unique session key has been dispatched to your authorized node. Confirm to commit changes.
                        </p>
                        
                        <input 
                            style={otpInputS(themeColor)} 
                            maxLength="6" 
                            placeholder="000000"
                            autoFocus
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        />

                        <div style={modalActionRowS}>
                            <button onClick={() => setShowOtpModal(false)} style={abortBtnS}>ABORT</button>
                            <button 
                                onClick={handleVerifyAndRotate} 
                                style={isUpdatingBtnS(themeColor)} 
                                disabled={isLoading || otp.length !== 6}
                            >
                                {isLoading ? 'SYNCING...' : 'VERIFY & COMMIT'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @media (max-width: 1024px) {
                    .security-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

// --- Enterprise Visual Architecture ---

const containerS = { padding: '10px', minHeight: '100vh', animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerS = { marginBottom: '40px', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '30px' };
const titleS = { margin: 0, fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '900', color: '#0f172a', letterSpacing: '-1.5px' };
const subS = { margin: '8px 0 0', color: '#64748b', fontSize: '14px', fontWeight: '500' };

const layoutGrid = { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '30px', className:'security-grid' };

const cardS = { background: '#fff', padding: window.innerWidth < 768 ? '25px' : '40px', borderRadius: '40px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' };
const cardHead = (color) => ({ margin: '0 0 25px 0', fontSize: '14px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1px', borderLeft: `5px solid ${color}`, paddingLeft: '15px' });
const nodeHintS = { fontSize:'12px', color:'#cbd5e1', marginTop:'-15px', marginBottom:'35px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1px' };

const inputGroupS = { marginBottom: '25px' };
const labS = { display: 'block', fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1.5px' };
const inS = { width: '100%', padding: '16px 20px', borderRadius: '18px', border: '1.5px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontSize: '14px', fontWeight: '700', boxSizing: 'border-box', color: '#1e293b', transition: '0.3s' };

const warningBoxS = { background: '#fff1f2', padding: '20px', borderRadius: '22px', border: '1px solid #fee2e2', color: '#f43f5e', fontSize: '12px', marginBottom: '30px', lineHeight: '1.6', fontWeight:'500' };

const commitBtnS = (color) => ({ width: '100%', padding: '20px', background: color, color: '#fff', border: 'none', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', fontSize: '14px', letterSpacing: '1px', boxShadow: `0 10px 20px ${color}33`, transition: '0.3s' });
const btnDisabledS = { ...commitBtnS('#cbd5e1'), background: '#f1f5f9', color: '#cbd5e1', cursor: 'not-allowed', boxShadow: 'none' };

const checklistS = { display: 'flex', flexDirection: 'column', gap: '18px' };
const checkItemS = { fontSize: '14px', fontWeight: '700', color: '#334155', display:'flex', alignItems:'center', gap:'12px' };
const dotActive = (color) => ({ color: color, fontSize:'18px' });
const dividerS = { height: '1.5px', background: '#f8fafc', margin: '15px 0' };
const auditNoteS = { fontSize: '13px', color: '#64748b', lineHeight: '1.7', fontWeight: '500' };

const overlayS = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(10px)' };
const modalS = { background: '#fff', padding: '50px 40px', borderRadius: '45px', textAlign: 'center', width: '450px', maxWidth:'90%', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', animation: 'fadeIn 0.3s ease' };
const lockIconS = (color) => ({ fontSize: '56px', marginBottom: '15px', color: color });
const modalTitleS = { margin: '15px 0 10px 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' };
const modalTextS = { fontSize: '14px', color: '#64748b', lineHeight: '1.6' };
const otpInputS = (color) => ({ width: '100%', textAlign: 'center', fontSize: '36px', padding: '18px', borderRadius: '25px', border: `2.5px solid #f1f5f9`, marginTop: '30px', fontWeight: '900', letterSpacing: '12px', outline: 'none', background: '#f8fafc', color: color });

const modalActionRowS = { display: 'flex', gap: '15px', marginTop: '40px' };
const abortBtnS = { flex: 1, padding: '18px', borderRadius: '18px', border: 'none', background: '#f8fafc', cursor: 'pointer', fontWeight: '900', color: '#94a3b8', fontSize: '13px' };
const isUpdatingBtnS = (color) => ({ ...abortBtnS, background: color, color: '#fff', boxShadow: `0 10px 20px ${color}33` });

export default AdminSecurity;