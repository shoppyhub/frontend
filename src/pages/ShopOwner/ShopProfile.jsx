import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api'; 
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useBranding } from '../../context/BrandingContext'; // For White-labeling
import { useAuth } from '../../context/AuthContext';

const ShopProfile = ({ shop }) => {
    const navigate = useNavigate();
    const { settings } = useBranding();
    const { logout } = useAuth();
    
    // --- 🛡️ Security States ---
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState("");
    const [activeAction, setActiveAction] = useState(""); 

    // Data Models
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [profileData, setProfileData] = useState({
        fullName: '', email: '', mobile: '', whatsapp: '',
        bankName: '', bankAcc: '', bankIfsc: '',
        aadharNumber: '', panNumber: ''
    });

    // 1. 📡 Identity Synchronization Protocol
    useEffect(() => {
        if (shop) {
            setProfileData({
                fullName: shop.fullName || '',
                email: shop.email || '',
                mobile: shop.mobile || '',
                whatsapp: shop.whatsapp || '',
                bankName: shop.bankDetails?.bankName || '',
                bankAcc: shop.bankDetails?.accountNumber || '',
                bankIfsc: shop.bankDetails?.ifscCode || '',
                aadharNumber: shop.kycDetails?.aadharNumber || '',
                panNumber: shop.kycDetails?.panNumber || ''
            });
        }
        document.title = `Security Console | ${settings.siteName}`;
    }, [shop, settings.siteName]);

    // 2. 🔐 Security Handshake: Request Authorization Code
    const initiateSecurityHandshake = async (e, type) => {
        e.preventDefault();
        setActiveAction(type);

        if (type === 'password') {
            if (passwords.newPassword !== passwords.confirmPassword) {
                return toast.error("Verification Error: Passwords do not match.");
            }
            if (passwords.newPassword.length < 8) {
                return toast.warning("Security Policy: New key must be at least 8 characters.");
            }
        }

        try {
            setIsActionLoading(true);
            const res = await api.post('/auth/security/request-otp');
            if (res.data.success) {
                setShowOtpModal(true);
                toast.info(`Authorized security code dispatched by ${settings.siteName}.`);
            }
        } catch (err) {
            toast.error("Gateway Error: Security code dispatch failed.");
        } finally {
            setIsActionLoading(false);
        }
    };

    // 3. 🚀 Registry Commit: Final Submission
    const handleFinalSubmit = async () => {
        if (otp.length !== 6) return toast.warning("Input Error: 6-digit code required.");
        
        try {
            setIsActionLoading(true);
            let res;
            
            if (activeAction === 'password') {
                res = await api.put('/auth/security/update-password', { ...passwords, otp });
            } else {
                res = await api.put('/auth/security/update-profile', { ...profileData, otp });
            }

            if (res.data.success) {
                toast.success("Identity Credentials Synchronized! Terminating current session...");
                setTimeout(() => {
                    logout();
                    navigate('/login?session=updated');
                }, 2500);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Registry Protocol Failure.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const themeColor = settings?.themeColor || '#0f172a';

    return (
        <div style={containerS}>
            {/* --- HEADER ARCHITECTURE --- */}
            <div style={headerS}>
                <div>
                    <h2 style={titleS}>{settings.siteName} Identity Hub</h2>
                    <p style={subS}>Managing secure administrative credentials and commercial registry nodes.</p>
                </div>
                <div style={badgeRowS}>
                    <span style={roleBadgeS(themeColor)}>{shop?.role?.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span style={statusBadgeS(shop?.isActive !== false)}>
                        {shop?.isActive !== false ? "● NODE ONLINE" : "● SUSPENDED"}
                    </span>
                </div>
            </div>

            <div style={gridS}>
                {/* --- [COLUMN 1]: IDENTITY METADATA --- */}
                <div style={colS}>
                    <div style={pCardS}>
                        <div style={avatarSectionS}>
                            <div style={imgRingS(themeColor)}>
                                <img src={shop?.photo || 'https://via.placeholder.com/150'} style={profileImgS} alt="Proprietor" />
                            </div>
                            <h3 style={uNameS}>{shop?.fullName}</h3>
                            <small style={uidTagS}>MASTER NODE ID: {shop?.generatedId}</small>
                        </div>
                        <div style={infoListS}>
                            <DataRow label="Commercial Entity" val={shop?.shopDetails?.shopName} />
                            <DataRow label="Registry Email" val={shop?.email} />
                            <DataRow label="Primary Mobile" val={shop?.mobile} />
                        </div>
                    </div>

                    <div style={pCardS}>
                        <h3 style={cardTitleS(themeColor)}>Government Compliance Data</h3>
                        <div style={infoListS}>
                            <DataRow label="Aadhar UID" val={profileData.aadharNumber} />
                            <DataRow label="PAN Identity" val={profileData.panNumber} />
                            <div style={noticeBoxS}>
                                ⚠️ KYC data is locked by {settings.siteName} Administration. Audit required for modifications.
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- [COLUMN 2]: SETTLEMENT & SECURITY --- */}
                <div style={colS}>
                    <div style={pCardS}>
                        <h3 style={cardTitleS(themeColor)}>Settlement Hub Node</h3>
                        <div style={infoListS}>
                            <DataRow label="Institution" val={profileData.bankName} />
                            <DataRow label="Account Identifier" val={profileData.bankAcc} />
                            <DataRow label="IFSC Protocol" val={profileData.bankIfsc} />
                        </div>
                        <button onClick={(e) => initiateSecurityHandshake(e, 'profile')} style={secondaryBtnS(themeColor)}>
                            MODIFY SETTLEMENT DATA
                        </button>
                    </div>

                    <div style={pCardS}>
                        <h3 style={cardTitleS(themeColor)}>Access Key Rotation</h3>
                        <form onSubmit={(e) => initiateSecurityHandshake(e, 'password')}>
                            <div style={inputGrpS}>
                                <label style={labS}>Current Access Key</label>
                                <input type="password" style={inS} onChange={(e)=>setPasswords({...passwords, oldPassword:e.target.value})} required placeholder="••••••••" />
                            </div>
                            <div style={inputGrpS}>
                                <label style={labS}>New Secure Key</label>
                                <input type="password" style={inS} placeholder="Entropy: Min 8 chars" onChange={(e)=>setPasswords({...passwords, newPassword:e.target.value})} required />
                            </div>
                            <div style={inputGrpS}>
                                <label style={labS}>Confirm Key Rotation</label>
                                <input type="password" style={inS} onChange={(e)=>setPasswords({...passwords, confirmPassword:e.target.value})} required placeholder="Repeat new key" />
                            </div>
                            <button type="submit" style={upBtnS(themeColor)} disabled={isActionLoading}>
                                {isActionLoading ? 'INITIATING HANDSHAKE...' : 'ROTATE ACCESS KEYS'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* --- 🔒 MULTI-FACTOR AUTHORIZATION MODAL --- */}
            {showOtpModal && (
                <div style={overlayS}>
                    <div style={modalS}>
                        <div style={lockIconS}>🔐</div>
                        <h3 style={{margin:'10px 0', fontSize:'22px', fontWeight:'900', color:'#0f172a'}}>Identity Verification</h3>
                        <p style={{fontSize:'14px', color:'#64748b', lineHeight:'1.5'}}>Enter the 6-digit session key dispatched to node <b>*{shop?.mobile?.slice(-4)}</b>.</p>
                        <input 
                            style={otpInS(themeColor)} 
                            maxLength="6" 
                            placeholder="000000" 
                            autoFocus
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                        />
                        <div style={modalActionsS}>
                            <button onClick={() => setShowOtpModal(false)} style={cancelBtnS}>ABORT</button>
                            <button 
                                onClick={handleFinalSubmit} 
                                style={confirmBtnS(themeColor)} 
                                disabled={isActionLoading || otp.length !== 6}
                            >
                                {isActionLoading ? 'COMMITTING...' : 'AUTHORIZE CHANGE'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
            `}</style>
        </div>
    );
};

// --- Atomic Helpers ---
const DataRow = ({ label, val }) => (
    <div style={rowStyle}><span style={dLabS}>{label}</span><span style={dValS}>{val || 'LINK_PENDING'}</span></div>
);

// --- Professional SaaS Visual Definitions ---

const containerS = { padding: '10px', animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerS = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'40px', borderBottom:'1.5px solid #f1f5f9', paddingBottom:'25px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin:0, fontSize:'28px', fontWeight:'900', color:'#0f172a', letterSpacing:'-1px' };
const subS = { color: '#64748b', fontSize: '14px', marginTop: '5px', fontWeight:'500' };

const badgeRowS = { display: 'flex', gap: '12px' };
const gridS = { display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' };
const colS = { display: 'flex', flexDirection: 'column', gap: '30px' };

const pCardS = { background: '#fff', padding: window.innerWidth < 600 ? '25px' : '35px', borderRadius: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' };
const avatarSectionS = { textAlign:'center', marginBottom:'25px' };
const imgRingS = (color) => ({ width:'120px', height:'120px', borderRadius:'45px', border:`4px solid ${color}15`, padding:'5px', margin:'0 auto' });
const profileImgS = { width:'100%', height:'100%', borderRadius:'40px', objectFit:'cover', background:'#f8fafc' };

const uNameS = { margin:'15px 0 5px 0', color:'#0f172a', fontSize:'22px', fontWeight:'900', letterSpacing:'-0.5px' };
const uidTagS = { background:'#f8fafc', color:'#94a3b8', padding:'5px 12px', borderRadius:'10px', fontSize:'10px', fontWeight:'800', letterSpacing:'1px' };

const infoListS = { display:'flex', flexDirection:'column' };
const rowStyle = { display:'flex', justifyContent:'space-between', padding:'18px 0', borderBottom:'1px solid #f8fafc' };
const dLabS = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing:'0.5px' };
const dValS = { fontSize: '14px', fontWeight: '800', color: '#1e293b' };

const cardTitleS = (color) => ({ marginTop: 0, marginBottom: '25px', fontSize: '13px', fontWeight: '900', color: '#0f172a', borderLeft: `5px solid ${color}`, paddingLeft: '15px', textTransform:'uppercase', letterSpacing:'1px' });
const labS = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', display: 'block' };
const inS = { width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1.5px solid #f1f5f9', background:'#f8fafc', outline:'none', fontSize:'14px', fontWeight:'700', boxSizing:'border-box', transition:'0.3s' };
const inputGrpS = { marginBottom:'22px' };

const noticeBoxS = { background: '#f8fafc', padding: '15px', borderRadius: '18px', border: '1px dashed #e2e8f0', color: '#64748b', fontSize: '12px', marginTop: '25px', textAlign:'center', lineHeight:'1.5' };
const upBtnS = (color) => ({ width: '100%', background: color, color: '#fff', border: 'none', padding: '18px', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', fontSize:'14px', letterSpacing:'0.5px', boxShadow:`0 10px 20px ${color}33`, transition:'0.3s' });
const secondaryBtnS = (color) => ({ ...upBtnS('#fff'), color: color, border: `1.5px solid ${color}`, marginTop: '25px', boxShadow:'none', background:'#fff' });

const roleBadgeS = (color) => ({ background:`${color}10`, color: color, padding:'10px 20px', borderRadius:'15px', fontSize:'11px', fontWeight:'900', textTransform:'uppercase', letterSpacing:'0.5px' });
const statusBadgeS = (active) => ({ background: active ? '#ecfdf5' : '#fff1f2', color: active ? '#10b981' : '#f43f5e', padding:'10px 20px', borderRadius:'15px', fontSize:'11px', fontWeight:'900', letterSpacing:'0.5px' });

const overlayS = { position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(15, 23, 42, 0.85)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:10000, backdropFilter:'blur(12px)' };
const modalS = { background:'#fff', padding: window.innerWidth < 600 ? '40px 20px' : '50px', borderRadius:'45px', textAlign:'center', width:'450px', maxWidth:'90%', boxShadow:'0 30px 60px rgba(0,0,0,0.3)', animation: 'fadeIn 0.3s ease' };
const lockIconS = { fontSize:'48px', marginBottom:'15px' };
const otpInS = (color) => ({ width: '100%', textAlign: 'center', fontSize: '32px', padding: '18px', borderRadius: '22px', border: `2px solid #f1f5f9`, fontWeight: '900', letterSpacing: '10px', background: '#f8fafc', marginTop: '25px', outline:'none', color: color });

const modalActionsS = { display:'flex', gap:'15px', marginTop:'35px' };
const cancelBtnS = { flex: 1, padding: '18px', borderRadius: '18px', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontWeight: '800', color: '#64748b', fontSize:'13px' };
const confirmBtnS = (color) => ({ ...cancelBtnS, background: color, color: '#fff', boxShadow:`0 10px 20px ${color}33` });

export default ShopProfile;