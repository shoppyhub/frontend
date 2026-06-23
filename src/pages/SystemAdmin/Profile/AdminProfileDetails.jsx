import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import { useBranding } from '../../../context/BrandingContext';
import { useAuth } from '../../../context/AuthContext';

const AdminProfileDetails = () => {
    const { settings } = useBranding();
    const { login } = useAuth(); 
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const [profileData, setProfileData] = useState({ 
        fullName: '', email: '', mobile: '', department: '', photo: '' 
    });
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const [otp, setOtp] = useState("");

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/auth/profile');
            if (res.data.success) {
                const data = res.data.data;
                setUser(data);
                setProfileData({
                    fullName: data.fullName,
                    email: data.email,
                    mobile: data.mobile,
                    department: data.department || 'Operations',
                    photo: data.photo || ''
                });
                setPreviewPhoto(data.photo || null);
                document.title = `My Identity | ${settings.siteName}`;
            }
        } catch (err) { 
            console.error("Registry Sync Failure.");
            toast.error("Failed to sync with Identity Hub.");
        } finally { 
            setLoading(false); 
        }
    }, [settings.siteName]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2000000) return toast.error("File size must be under 2MB.");
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setProfileData(prev => ({ ...prev, photo: reader.result }));
                setPreviewPhoto(reader.result);
            };
        }
    };

    const handleUpdateReq = async () => {
        try {
            setIsUpdating(true);
            await api.post('/auth/security/request-otp');
            setShowOtpModal(true);
            toast.info("Security Protocol: Verification code dispatched to your node.");
        } catch (err) { 
            toast.error("Security gateway failed to dispatch OTP."); 
        } finally { 
            setIsUpdating(false); 
        }
    };

    const handleCommit = async () => {
        if (otp.length !== 6) return toast.warning("Provide 6-digit authorized code.");
        
        try {
            setIsUpdating(true);
            const res = await api.put('/auth/security/update-profile', { ...profileData, otp });
            
            if (res.data.success) {
                toast.success("Identity Synchronized Successfully! ✅");
                localStorage.setItem('userName', profileData.fullName);
                if(profileData.photo) localStorage.setItem('userPhoto', profileData.photo);
                
                setShowOtpModal(false);
                setOtp("");
                fetchProfile(); 
            }
        } catch (err) { 
            toast.error(err.response?.data?.message || "Verification Protocol Failed."); 
        } finally { 
            setIsUpdating(false); 
        }
    };

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return (
        <div style={loaderWrapperS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Accessing Secure Identity Node...</p>
        </div>
    );

    return (
        <div style={containerS}>
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>🛠️ Master Identity Configuration</h2>
                    <p style={subTitleS}>Strategic oversight of the administrative credentials for {settings.siteName}.</p>
                </div>
                <div style={badgeRow}>
                    <span style={roleBadge(themeColor)}>{user?.role} Node</span>
                    <span style={statusBadge}>● VERIFIED ACTIVE</span>
                </div>
            </div>

            <div style={layoutGrid}>
                <div style={cardS}>
                    <h4 style={cardHead(themeColor)}>Global System Avatar</h4>
                    <p style={nodeHintS}>Official portrait for the administrative registry.</p>
                    
                    <div style={avatarWrapper}>
                        <div style={avatarCircle(themeColor)}>
                            {previewPhoto ? (
                                <img src={previewPhoto} style={avatarImg} alt="Admin" />
                            ) : (
                                <div style={avatarText}>{profileData.fullName?.charAt(0)}</div>
                            )}
                            <label htmlFor="avatar-up" style={editLabel(themeColor)}>📷</label>
                        </div>
                        <input type="file" id="avatar-up" hidden onChange={handleFileChange} accept="image/*" />
                        <p style={avatarHint}>High-resolution professional portraits are mandatory for ecosystem nodes.</p>
                    </div>
                    
                    <div style={metaBox}>
                        <div style={metaRow}><small>Registry Created:</small> <b>{new Date(user?.createdAt).toLocaleDateString('en-GB')}</b></div>
                        <div style={metaRow}><small>Last Operational Sync:</small> <b>{new Date().toLocaleTimeString()}</b></div>
                    </div>
                </div>

                <div style={cardS}>
                    <h4 style={cardHead(themeColor)}>Administrative Identity Record</h4>
                    <p style={nodeHintS}>Synchronize your personnel metadata across the cluster.</p>

                    <div style={formS}>
                        <div style={inputGroup}>
                            <label style={labS}>Authorized Full Name</label>
                            <input style={inS} value={profileData.fullName} onChange={e => setProfileData({...profileData, fullName: e.target.value})} />
                        </div>
                        <div style={inputGroup}>
                            <label style={labS}>Primary Infrastructure Email</label>
                            <input style={inS} value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} />
                        </div>
                        <div style={inputGroup}>
                            <label style={labS}>Secure Mobile Node ID</label>
                            <input style={inS} value={profileData.mobile} onChange={e => setProfileData({...profileData, mobile: e.target.value})} />
                        </div>
                        <div style={inputGroup}>
                            <label style={labS}>Assigned Department</label>
                            <input style={fixedInS} value={profileData.department} readOnly />
                            <small style={fixedHintS}>LOCKED: Departmental nodes are controlled by root admin.</small>
                        </div>
                        
                        <button 
                            onClick={handleUpdateReq} 
                            style={isUpdating ? btnDisabledS : commitBtn(themeColor)} 
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'SYNCHRONIZING...' : 'AUTHORIZE IDENTITY UPDATE'}
                        </button>
                    </div>
                </div>
            </div>

            {showOtpModal && (
                <div style={modalOverlayS}>
                    <div style={modalContentS}>
                        <div style={lockIconS}>🔐</div>
                        <h3 style={{margin:'0 0 10px 0', fontSize:'22px', fontWeight:'900', color:'#0f172a'}}>MFA Security Verification</h3>
                        <p style={{fontSize:'14px', color:'#64748b', lineHeight:'1.5'}}>
                            A session key has been dispatched to <b>*{profileData.mobile?.slice(-4)}</b>. Confirm your identity to commit registry changes.
                        </p>
                        
                        <input 
                            style={otpInputS(themeColor)} 
                            maxLength="6" 
                            value={otp} 
                            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                            placeholder="0 0 0 0 0 0"
                            autoFocus
                        />
                        
                        <div style={modalActionGrid}>
                            <button onClick={()=>setShowOtpModal(false)} style={abortBtnS}>ABORT SESSION</button>
                            <button 
                                onClick={handleCommit} 
                                style={isUpdating ? btnDisabledS : finalizeBtnS(themeColor)}
                                disabled={isUpdating || otp.length !== 6}
                            >
                                {isUpdating ? 'COMMITING...' : 'VERIFY & DEPLOY'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

// --- Styles ---

const containerS = { padding: '10px', minHeight: '100vh', animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerFlex = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'40px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin: 0, fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '900', color: '#0f172a', letterSpacing:'-1.5px' };
const subTitleS = { margin:'5px 0 0', color:'#64748b', fontSize:'14px', fontWeight:'500' };
const badgeRow = { display:'flex', gap:'12px' };

const layoutGrid = { display:'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1.6fr', gap:'30px' };

const cardS = { background:'#fff', padding: window.innerWidth < 768 ? '25px' : '40px', borderRadius:'40px', border:'1px solid #f1f5f9', boxShadow:'0 10px 30px rgba(0,0,0,0.02)' };
const cardHead = (color) => ({ margin:'0 0 25px 0', fontSize:'13px', fontWeight:'900', color:'#0f172a', textTransform:'uppercase', letterSpacing:'1px', borderLeft:`5px solid ${color}`, paddingLeft:'15px' });
const nodeHintS = { fontSize:'12px', color:'#cbd5e1', marginTop:'-15px', marginBottom:'30px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1px' };

const avatarWrapper = { display:'flex', flexDirection:'column', alignItems:'center', gap:'25px', paddingBottom:'35px', borderBottom:'1px solid #f8fafc' };
const avatarCircle = (color) => ({ width:'150px', height:'150px', borderRadius:'50px', background:'#f8fafc', border:`5px solid ${color}10`, boxShadow:'0 15px 35px rgba(0,0,0,0.05)', position:'relative', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' });
const avatarImg = { width:'100%', height:'100%', objectFit:'cover' };
const avatarText = { fontSize:'56px', fontWeight:'900', color:'#cbd5e1' };

// ✅ FIXED: Closing parenthesis added below
const editLabel = (color) => ({ 
    position:'absolute', bottom:'10px', right:'10px', background: color, color:'#fff', 
    width:'40px', height:'40px', borderRadius:'14px', display:'flex', alignItems:'center', 
    justifyContent:'center', cursor:'pointer', border:'4px solid #fff', boxShadow:'0 8px 15px rgba(0,0,0,0.1)' 
});

const avatarHint = { textAlign:'center', fontSize:'11px', color:'#94a3b8', fontWeight:'600', lineHeight:'1.6', maxWidth:'250px' };

const metaBox = { marginTop:'30px', background:'#f8fafc', padding:'20px', borderRadius:'22px' };
const metaRow = { display:'flex', justifyContent:'space-between', marginBottom:'12px', fontSize:'12px', color:'#475569' };

const formS = { display:'flex', flexDirection:'column', gap:'22px' };
const inputGroup = { display:'flex', flexDirection:'column', gap:'10px' };
const labS = { fontSize:'10px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1.5px' };
const inS = { padding:'16px 20px', borderRadius:'18px', border:'1.5px solid #f1f5f9', background:'#f8fafc', outline:'none', fontSize:'14px', fontWeight:'700', boxSizing:'border-box', color:'#1e293b', transition:'0.3s' };
const fixedInS = { ...inS, background:'#f1f5f9', color:'#cbd5e1', borderStyle:'dashed', cursor:'not-allowed' };
const fixedHintS = { fontSize:'10px', color:'#ef4444', fontWeight:'700', letterSpacing:'0.5px' };

const commitBtn = (color) => ({ width:'100%', padding:'20px', background: color, color:'#fff', border:'none', borderRadius:'20px', fontWeight:'900', cursor:'pointer', fontSize:'14px', letterSpacing:'1px', boxShadow:`0 10px 20px ${color}33`, transition:'0.3s' });
const btnDisabledS = { padding:'20px', background:'#cbd5e1', color:'#fff', border:'none', borderRadius:'20px', fontWeight:'900', cursor:'not-allowed' };

const roleBadge = (color) => ({ background:`${color}10`, color: color, padding:'10px 20px', borderRadius:'15px', fontSize:'11px', fontWeight:'900', textTransform:'uppercase', letterSpacing:'1px' });
const statusBadge = { background:'#ecfdf5', color:'#10b981', padding:'10px 20px', borderRadius:'15px', fontSize:'11px', fontWeight:'900', letterSpacing:'1px' };

const modalOverlayS = { position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(15, 23, 42, 0.9)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:10000, backdropFilter:'blur(10px)' };
const modalContentS = { background:'#fff', padding: window.innerWidth < 600 ? '40px 25px' : '60px 50px', borderRadius:'45px', textAlign:'center', width:'480px', maxWidth:'90%', boxShadow:'0 30px 60px rgba(0,0,0,0.3)', animation:'fadeIn 0.3s ease' };
const lockIconS = { fontSize:'52px', marginBottom:'20px' };
const otpInputS = (color) => ({ width:'100%', textAlign: 'center', fontSize: '36px', padding: '18px', borderRadius: '25px', border: `2.5px solid #f1f5f9`, marginTop: '30px', fontWeight: '900', letterSpacing: '12px', outline:'none', background: '#f8fafc', color: color });

const modalActionGrid = { display:'flex', gap:'15px', marginTop:'40px' };
const abortBtnS = { flex:1, padding:'18px', borderRadius:'18px', border:'none', background:'#f1f5f9', cursor:'pointer', fontWeight:'900', color:'#64748b', fontSize:'13px' };
const finalizeBtnS = (color) => ({ ...abortBtnS, background: color, color:'#fff', boxShadow:`0 10px 20px ${color}33` });

const loaderWrapperS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap:'20px', background:'#f8fafc' };

export default AdminProfileDetails;