import React, { useState, useEffect, useCallback } from 'react';
import HomeHeader from '../../components/Customer/HomeHeader';
import MobileBottomNav from '../../components/Customer/MobileBottomNav';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useBranding } from '../../context/BrandingContext'; // Added for White-labeling

const ReferAndEarn = () => {
    const { settings } = useBranding(); // Access Global Admin Settings
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. 📡 Automatic Background Sync (No Buttons)
    const fetchReferralData = useCallback(async () => {
        try {
            const profileRes = await api.get('/auth/profile');
            if (profileRes.data.success) {
                setUser(profileRes.data.data);
            }
            // Update browser metadata
            document.title = `Refer & Earn | ${settings.siteName}`;
        } catch (err) {
            console.error("Referral Hub Handshake Failed");
        } finally {
            setLoading(false);
        }
    }, [settings.siteName]);

    useEffect(() => {
        fetchReferralData();
        // Auto-refresh stats when user returns to focus
        window.addEventListener('focus', fetchReferralData);
        return () => window.removeEventListener('focus', fetchReferralData);
    }, [fetchReferralData]);

    // 2. 📋 Utility: Cryptographic Copy Protocol
    const copyCode = () => {
        const code = user?.referral?.code || "";
        if (!code) return;
        navigator.clipboard.writeText(code);
        toast.success("Referral code copied to clipboard! 🚀");
    };

    // 3. 📤 Utility: Smart Multi-Channel Share Protocol
    const handleShare = async () => {
        const siteName = settings?.siteName || "Our Platform";
        const reward = settings?.walletSettings?.referralReward || 0;
        const code = user?.referral?.code;
        const shareUrl = window.location.origin;

        const shareText = `Hey! Join me on ${siteName}. Register using my code: ${code} and we both earn ₹${reward} instantly! 🎁\n\nSign up here: ${shareUrl}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: siteName,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (err) {
                // Share cancelled by user - no action needed
            }
        } else {
            // Desktop/Fallback to WhatsApp
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        }
    };

    // --- Loading State Architecture ---
    if (loading) return (
        <div style={loaderWrapper}>
            <div className="spinner" style={{borderTopColor: settings.themeColor || '#0f172a'}}></div>
            <p style={loaderText}>Synchronizing Referral Hub...</p>
            <style>{`
                .spinner { width: 45px; height: 45px; border: 4px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );

    const isReferralEnabled = settings?.walletSettings?.referralFeatureEnabled ?? true;
    const rewardAmount = settings?.walletSettings?.referralReward || 0;

    // --- Feature Disabled View ---
    if (!isReferralEnabled) {
        return (
            <div style={pageBgS}>
                <HomeHeader />
                <div style={disabledCardS}>
                    <div style={{fontSize:'80px', marginBottom:'20px'}}>📢</div>
                    <h2 style={{color: '#0f172a', fontWeight:'900'}}>Program Temporarily Offline</h2>
                    <p style={{color: '#64748b', fontSize:'15px', lineHeight:'1.6'}}>
                        The {settings.siteName} referral incentive program is currently undergoing technical audits. 
                        We will resume operations shortly with enhanced rewards.
                    </p>
                    <button style={backBtn(settings.themeColor)} onClick={() => window.history.back()}>
                        Return to Dashboard
                    </button>
                </div>
                <MobileBottomNav />
            </div>
        );
    }

    return (
        <div style={pageBgS}>
            <HomeHeader />
            
            <div style={containerS}>
                {/* --- [A] HERO MODULE (Branded) --- */}
                <div style={heroS}>
                    <div style={giftIconS}>🎁</div>
                    <h1 style={titleS}>Invite Friends & <br/> Earn ₹{rewardAmount}</h1>
                    <p style={subTitleS}>
                        Build your local network on {settings.siteName}. Get ₹{rewardAmount} in your wallet for every successful referral deployment.
                    </p>
                </div>

                {/* --- [B] REAL-TIME METRICS --- */}
                <div style={statsGridS}>
                    <div style={statItemS}>
                        <small style={statLabelS}>NETWORK NODES</small>
                        <div style={statValueS}>{user?.referral?.totalReferrals || 0}</div>
                        <span style={statDescS}>Friends Joined</span>
                    </div>
                    <div style={{width:'1.5px', background:'#f1f5f9'}}></div>
                    <div style={statItemS}>
                        <small style={statLabelS}>WALLET ACCRUAL</small>
                        <div style={{...statValueS, color:'#10b981'}}>
                            ₹{((user?.referral?.totalReferrals || 0) * rewardAmount).toLocaleString()}
                        </div>
                        <span style={statDescS}>Net Earnings</span>
                    </div>
                </div>

                {/* --- [C] SECURE CODE ACCESS --- */}
                <div style={codeCardS}>
                    <small style={codeLabelS}>YOUR UNIQUE INVITATION KEY</small>
                    <div style={codeWrapperS(settings.themeColor)}>
                        <span style={codeTextS}>{user?.referral?.code || "LINKING..."}</span>
                        <button style={copyBtnS(settings.themeColor)} onClick={copyCode}>COPY</button>
                    </div>
                    
                    <button style={mainShareBtnS(settings.themeColor)} onClick={handleShare}>
                        INVITE FRIENDS NOW
                    </button>
                    <p style={socialHintS}>Protocol: Encrypted link sharing via Secure Channels</p>
                </div>

                {/* --- [D] OPERATIONAL FLOW --- */}
                <div style={processSectionS}>
                    <h4 style={sectionTitleS}>Operational Protocol</h4>
                    <div style={stepRowS}>
                        <div style={stepNumS(settings.themeColor)}>1</div>
                        <div style={stepTextS}>
                            <b>Dispatch Invitation</b>
                            <p style={pS}>Share your unique registry key with your contact cluster.</p>
                        </div>
                    </div>
                    <div style={stepRowS}>
                        <div style={stepNumS(settings.themeColor)}>2</div>
                        <div style={stepTextS}>
                            <b>Identity Registration</b>
                            <p style={pS}>New nodes must register on {settings.siteName} using your code.</p>
                        </div>
                    </div>
                    <div style={stepRowS}>
                        <div style={stepNumS(settings.themeColor)}>3</div>
                        <div style={stepTextS}>
                            <b>Asset Settlement</b>
                            <p style={pS}>Reward of ₹{rewardAmount} is instantly synchronized with your wallet!</p>
                        </div>
                    </div>
                </div>
            </div>

            <MobileBottomNav />
        </div>
    );
};

// --- Professional SaaS Design Definitions ---

const pageBgS = { background: '#f8fafc', minHeight: '100vh', paddingBottom: '120px', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const containerS = { width: '92%', maxWidth: '500px', margin: '0 auto', textAlign: 'center', animation: 'fadeIn 0.5s ease' };

const heroS = { padding: '40px 10px 20px' };
const giftIconS = { fontSize: '75px', marginBottom: '20px', display: 'inline-block', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' };
const titleS = { fontWeight: '900', fontSize: 'clamp(24px, 7vw, 34px)', color: '#0f172a', margin: 0, letterSpacing: '-1.5px', lineHeight: '1.1' };
const subTitleS = { color: '#64748b', fontWeight: '500', lineHeight: '1.6', fontSize: '15px', marginTop: '15px' };

const statsGridS = { display:'flex', background:'#fff', padding:'25px', borderRadius:'32px', border:'1px solid #f1f5f9', marginBottom:'35px', boxShadow:'0 10px 30px rgba(0,0,0,0.02)' };
const statItemS = { flex:1, textAlign:'center' };
const statLabelS = { fontSize:'10px', fontWeight:'900', color:'#94a3b8', letterSpacing:'1.5px', textTransform:'uppercase' };
const statValueS = { fontSize:'26px', fontWeight:'900', color:'#0f172a', marginTop:'8px' };
const statDescS = { fontSize:'10px', color:'#cbd5e1', fontWeight:'700', textTransform:'uppercase', marginTop:'2px' };

const codeCardS = { 
    background: '#fff', padding: window.innerWidth < 600 ? '30px 20px' : '40px 35px', 
    borderRadius: '40px', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.08)', border: '1px solid #f1f5f9'
};
const codeLabelS = { fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px', textTransform:'uppercase' };

const codeWrapperS = (color) => ({ 
    display: 'flex', background: '#f8fafc', borderRadius: '20px', 
    padding: '10px', border: `2px dashed ${color}44` || '2px dashed #2563eb44', margin: '25px 0 30px' 
});
const codeTextS = { flex: 1, fontSize: '28px', fontWeight: '900', color: '#0f172a', letterSpacing: '4px', alignSelf:'center' };
const copyBtnS = (color) => ({ background: color || '#0f172a', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', fontSize: '12px', letterSpacing:'0.5px' });

const mainShareBtnS = (color) => ({ width: '100%', background: color || '#0f172a', color: '#fff', border: 'none', padding: '20px', borderRadius: '20px', fontWeight: '900', cursor: 'pointer', fontSize: '15px', letterSpacing: '1px', boxShadow: `0 10px 20px ${color}33`, transition: '0.3s' });
const socialHintS = { fontSize: '11px', color: '#cbd5e1', marginTop: '18px', fontWeight: '700', textTransform:'uppercase', letterSpacing:'0.5px' };

const processSectionS = { marginTop: '50px', textAlign: 'left', padding: '0 10px' };
const sectionTitleS = { fontSize: '15px', fontWeight: '900', color: '#0f172a', marginBottom: '30px', textTransform:'uppercase', letterSpacing:'1.5px', borderLeft:'4px solid #f1f5f9', paddingLeft:'15px' };
const stepRowS = { display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'flex-start' };
const stepNumS = (color) => ({ width: '36px', height: '36px', background: `${color}10` || '#f1f5f9', color: color || '#2563eb', borderRadius: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '16px', fontWeight: '900', flexShrink: 0 });
const stepTextS = { flex: 1 };
const pS = { margin: '5px 0 0', fontSize: '13px', color: '#64748b', fontWeight: '500', lineHeight: '1.5' };

const disabledCardS = { margin: '100px auto', width: '90%', maxWidth:'450px', textAlign: 'center', padding: '60px 30px', background: '#fff', borderRadius: '40px', border:'1px solid #f1f5f9', boxShadow:'0 20px 40px rgba(0,0,0,0.03)' };
const backBtn = (color) => ({ marginTop: '30px', padding: '18px 45px', background: color || '#0f172a', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '900', fontSize:'14px' });

const loaderWrapper = { height: '100vh', display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' };
const loaderText = { fontSize: '14px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' };

export default ReferAndEarn;