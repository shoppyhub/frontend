import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeHeader from '../../components/Customer/HomeHeader';
import MobileBottomNav from '../../components/Customer/MobileBottomNav';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext'; // Added for White-labeling

const EditIdentity = () => {
    const navigate = useNavigate();
    const { login } = useAuth(); 
    const { settings } = useBranding(); // Access admin settings

    // --- States ---
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showOtpField, setShowOtpField] = useState(false);
    
    const [formData, setFormData] = useState({ 
        fullName: '', 
        email: '', 
        photo: '', 
        otp: '' 
    });
    
    const [previewUrl, setPreviewUrl] = useState(null);

    // 1. 📡 Automatic Profile Sync (No Buttons)
    const fetchIdentity = useCallback(async () => {
        try {
            const res = await api.get('/auth/profile');
            if (res.data.success) {
                const u = res.data.data;
                setFormData({
                    fullName: u.fullName,
                    email: u.email || '',
                    photo: u.photo || '',
                    otp: ''
                });
                setPreviewUrl(u.photo);
                // Dynamic Title
                document.title = `Configure Identity | ${settings.siteName}`;
            }
        } catch (err) {
            toast.error("Security handshake interrupted.");
        } finally {
            setLoading(false);
        }
    }, [settings.siteName]);

    useEffect(() => {
        fetchIdentity();
    }, [fetchIdentity]);

    // 2. 📸 Cryptographic Image Handling
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2000000) return toast.error("Data Payload Error: File exceeds 2MB limit.");
            
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
                setFormData(prev => ({ ...prev, photo: reader.result }));
            };
        }
    };

    // 3. 🔐 Security Protocol: Step 1 (OTP Request)
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.post('/auth/security/request-otp');
            setShowOtpField(true);
            toast.info(`A security code has been dispatched by ${settings.siteName}.`);
        } catch (err) {
            toast.error("Protocol Error: Failed to send code.");
        } finally {
            setIsSaving(false);
        }
    };

    // 4. 🚀 Security Protocol: Step 2 (Final Sync)
    const handleFinalUpdate = async (e) => {
        e.preventDefault();
        if (showOtpField && !formData.otp) return toast.warning("Identity validation code required.");

        setIsSaving(true);
        try {
            const res = await api.put('/auth/security/update-profile', formData);
            if (res.data.success) {
                toast.success("Identity configuration synchronized!");
                
                // Re-sync global state immediately
                const profileRes = await api.get('/auth/profile');
                if (profileRes.data.success) {
                    login(profileRes.data.data); 
                }
                navigate('/profile');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Registry commit failed.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: settings.themeColor || '#2563eb'}}></div>
            <p style={loaderText}>Accessing Secure Registry...</p>
        </div>
    );

    return (
        <div style={pageWrapperS}>
            <HomeHeader />
            <div style={containerS}>
                {/* --- [A] DYNAMIC HEADER --- */}
                <div style={headerRowS}>
                    <button onClick={() => navigate(-1)} style={backBtnS}>✕</button>
                    <div style={{flex:1}}>
                        <h2 style={titleS}>Configure Identity</h2>
                        <p style={subS}>Manage your secure credentials on {settings.siteName}.</p>
                    </div>
                </div>

                <div style={cardS}>
                    {/* --- [B] PORTRAIT UPLOAD MODULE --- */}
                    <div style={photoSectionS}>
                        <div style={imgWrapperS}>
                            <img 
                                src={previewUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                                style={imgS} 
                                alt="Profile" 
                            />
                            <label style={uploadIconS(settings.themeColor)}>
                                📷
                                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                        <p style={photoHintS}>TAP TO UPDATE PORTRAIT</p>
                    </div>

                    <form onSubmit={showOtpField ? handleFinalUpdate : handleRequestOtp} style={formS}>
                        {/* Legal Name */}
                        <div style={inputGroupS}>
                            <label style={labS}>Legal Full Name</label>
                            <input 
                                style={inS} 
                                value={formData.fullName} 
                                onChange={e => setFormData({...formData, fullName: e.target.value})} 
                                placeholder="Full Name as per ID"
                                required
                                disabled={showOtpField}
                            />
                        </div>

                        {/* Email */}
                        <div style={inputGroupS}>
                            <label style={labS}>Official Email Address</label>
                            <input 
                                style={inS} 
                                type="email" 
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                placeholder="example@domain.com"
                                disabled={showOtpField}
                            />
                        </div>

                        {/* Restricted Field: Mobile */}
                        <div style={inputGroupS}>
                            <label style={labS}>Verified Mobile Identifier</label>
                            <div style={fixedFieldS}>
                                📱 NODE LOCKED TO REGISTRY
                            </div>
                        </div>

                        {/* --- [C] SECURITY VERIFICATION MODULE --- */}
                        {showOtpField && (
                            <div style={otpSectionS}>
                                <label style={{...labS, color: settings.themeColor || '#2563eb'}}>Verification Protocol Code</label>
                                <input 
                                    style={otpInS(settings.themeColor)} 
                                    maxLength="6"
                                    value={formData.otp}
                                    onChange={e => setFormData({...formData, otp: e.target.value})}
                                    placeholder="••••••"
                                    autoFocus
                                />
                                <p style={otpHintS(settings.themeColor)}>Input the 6-digit session key.</p>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            style={saveBtnS(settings.themeColor)} 
                            disabled={isSaving}
                        >
                            {isSaving ? 'SYNCHRONIZING...' : showOtpField ? 'AUTHORIZE & SAVE' : 'UPDATE IDENTITY'}
                        </button>

                        {showOtpField && (
                            <button 
                                type="button" 
                                onClick={() => setShowOtpField(false)} 
                                style={cancelBtnS}
                            >
                                Edit Metadata Again
                            </button>
                        )}
                    </form>
                </div>

                <div style={securityNoteS}>
                    🛡️ Identity modifications are logged within the {settings.siteName} audit cluster.
                </div>
            </div>
            
            <MobileBottomNav />

            <style>{`
                .spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

// --- Enterprise SaaS Visual Definitions ---

const pageWrapperS = { background: '#f8fafc', minHeight: '100vh', paddingBottom: '120px', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const containerS = { width: '92%', maxWidth: '450px', margin: '0 auto', padding: '30px 0' };

const headerRowS = { display:'flex', alignItems:'center', gap:'20px', marginBottom:'30px' };
const backBtnS = { width:'40px', height:'40px', borderRadius:'12px', background:'#fff', border:'1px solid #eef2f6', color:'#0f172a', fontWeight:'900', cursor:'pointer' };
const titleS = { margin:0, fontSize:'22px', fontWeight:'900', color:'#0f172a', letterSpacing:'-0.5px' };
const subS = { margin:0, fontSize:'13px', color:'#94a3b8', fontWeight:'500' };

const cardS = { background: '#fff', padding: window.innerWidth < 600 ? '30px 20px' : '40px', borderRadius: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' };

const photoSectionS = { display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'40px' };
const imgWrapperS = { position:'relative', width:'120px', height:'120px' };
const imgS = { width:'100%', height:'100%', borderRadius:'40px', objectFit:'cover', border:'5px solid #fff', boxShadow:'0 15px 30px rgba(0,0,0,0.1)' };
const uploadIconS = (color) => ({ position:'absolute', bottom:'-5px', right:'-5px', width:'38px', height:'38px', borderRadius:'14px', background: color || '#0f172a', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'4px solid #fff', fontSize:'18px' });
const photoHintS = { marginTop:'15px', fontSize:'10px', color:'#cbd5e1', fontWeight:'900', letterSpacing:'1px' };

const formS = { display:'flex', flexDirection:'column', gap:'22px' };
const inputGroupS = { display:'flex', flexDirection:'column', gap:'8px' };
const labS = { fontSize:'10px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1.5px' };
const inS = { padding:'16px', borderRadius:'16px', border:'1.5px solid #f1f5f9', outline:'none', fontSize:'14px', fontWeight:'700', color:'#1e293b', background:'#f8fafc', transition:'0.3s' };
const fixedFieldS = { ...inS, color:'#cbd5e1', background:'#f8fafc', borderStyle:'dashed', fontSize:'12px', letterSpacing:'0.5px' };

const otpSectionS = { background:'#f8fafc', padding:'25px', borderRadius:'24px', border:'1.5px dashed #e2e8f0', textAlign:'center' };
const otpInS = (color) => ({ width:'100%', background:'transparent', border:'none', borderBottom:`3px solid ${color || '#2563eb'}`, textAlign:'center', fontSize:'28px', fontWeight:'900', letterSpacing:'10px', outline:'none', color: color || '#2563eb', marginTop:'10px' });
const otpHintS = (color) => ({ fontSize:'11px', color: color || '#2563eb', marginTop:'15px', fontWeight:'700', textTransform:'uppercase' });

const saveBtnS = (color) => ({ background: color || '#0f172a', color: '#fff', padding: '20px', borderRadius: '18px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '14px', letterSpacing: '0.5px', boxShadow: `0 10px 20px ${color}33`, transition:'0.3s' });
const cancelBtnS = { background:'none', border:'none', color:'#94a3b8', fontWeight:'800', fontSize:'12px', cursor:'pointer', marginTop:'12px' };

const securityNoteS = { textAlign:'center', color:'#cbd5e1', fontSize:'11px', fontWeight:'700', marginTop:'30px', lineHeight:'1.6', padding:'0 20px' };
const loaderS = { display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh', gap:'20px', background:'#f8fafc' };
const loaderText = { fontSize:'14px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'2px' };

export default EditIdentity;