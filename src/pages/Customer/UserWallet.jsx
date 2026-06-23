import React, { useState, useEffect, useCallback, useRef } from 'react';
import HomeHeader from '../../components/Customer/HomeHeader';
import MobileBottomNav from '../../components/Customer/MobileBottomNav';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext'; // For White-labeling
import io from 'socket.io-client';

const UserWallet = () => {
    const { login, user: authUser } = useAuth(); 
    const { settings } = useBranding();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const socket = useRef(null);

    // 1. 📡 Comprehensive Financial Hub Sync (No Buttons)
    const fetchWalletIntel = useCallback(async () => {
        try {
            const profileRes = await api.get('/auth/profile');
            if (profileRes.data.success) {
                const updatedUser = profileRes.data.data;
                setUser(updatedUser);
            }
            document.title = `Wallet | ${settings.siteName}`;
        } catch (err) {
            console.error("Financial Registry Handshake Error");
        } finally {
            setLoading(false);
        }
    }, [settings.siteName]);

    // 2. ⚡ Real-time Socket & Window Focus Implementation
    useEffect(() => {
        fetchWalletIntel();

        // Socket Connection for Live Balance Updates
        socket.current = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');
        if (authUser?.id) {
            socket.current.emit('join_shop', authUser.id);
            socket.current.on('wallet_updated', (data) => {
                toast.success(`Success: ${data.message}`);
                fetchWalletIntel(); // Silent Background Update
            });
        }

        // Re-sync when user switches back to this tab
        window.addEventListener('focus', fetchWalletIntel);
        
        return () => {
            socket.current.disconnect();
            window.removeEventListener('focus', fetchWalletIntel);
        };
    }, [authUser?.id, fetchWalletIntel]);

    // 3. 💳 Secure Top-up Protocol (Razorpay Integration)
    const handleAddMoney = async () => {
        const amount = window.prompt("Enter top-up amount (₹):");
        if (!amount || isNaN(amount) || amount < 10) return toast.warning("Protocol Violation: Minimum recharge is ₹10.");

        setActionLoading(true);
        try {
            const rzpKey = settings?.apiConfig?.razorpay?.KEY_ID || import.meta.env.VITE_RAZORPAY_KEY_ID;
            if (!rzpKey) return toast.error("Payment gateway not configured.");

            const orderRes = await api.post('/payments/razorpay/create-order', { amount });
            const { order_id, currency, amount: rzpAmount } = orderRes.data;

            const options = {
                key: rzpKey,
                amount: rzpAmount,
                currency,
                name: `${settings?.siteName || 'System'} Pay`,
                description: "Wallet Asset Recharge",
                image: settings?.logoUrl || "",
                order_id: order_id,
                handler: async (response) => {
                    const verifyRes = await api.post('/auth/wallet/topup-verify', response);
                    if (verifyRes.data.success) {
                        toast.success("Transaction verified. Assets added to vault! 🎉");
                        fetchWalletIntel(); 
                    }
                },
                prefill: { 
                    name: user?.fullName, 
                    contact: user?.mobile 
                },
                theme: { color: settings?.themeColor || "#0f172a" }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            toast.error("Gateway connection timed out.");
        } finally {
            setActionLoading(false);
        }
    };

    // 4. 🏛️ Payout Protocol
    const handleWithdraw = async () => {
        const balance = user?.wallet?.balance || 0;
        const minRedeem = settings?.walletSettings?.minRedeemAmount || 100;

        if (balance < minRedeem) {
            return toast.error(`Inadequate Funds: Minimum payout is ₹${minRedeem}`);
        }

        const amount = window.prompt(`Enter amount to redeem (Max ₹${balance}):`);
        if (!amount || amount < minRedeem) {
            return toast.warning(`Constraint Error: Payout must be at least ₹${minRedeem}.`);
        }
        if (amount > balance) return toast.error("Asset Mismatch: Amount exceeds balance.");

        setActionLoading(true);
        try {
            const res = await api.post('/auth/payout-request', { amount });
            if (res.data.success) {
                toast.success("Redemption request logged for audit! 🏛️");
                fetchWalletIntel();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Internal Vault Error.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: settings.themeColor || '#2563eb'}}></div>
            <p style={loaderText}>Establishing Secure Connection to {settings.siteName} Vault...</p>
        </div>
    );

    const isWalletEnabled = settings?.walletSettings?.enabled ?? true;

    if (!isWalletEnabled) {
        return (
            <div style={pageWrapperS}>
                <HomeHeader />
                <div style={disabledContainer}>
                    <div style={disabledCard}>
                        <div style={{fontSize:'80px'}}>🔐</div>
                        <h2 style={{color: '#0f172a', margin: '20px 0'}}>Digital Wallet Offline</h2>
                        <p style={{color: '#64748b', lineHeight:'1.6'}}>Financial services for <b>{settings?.siteName}</b> are currently suspended by the central admin.</p>
                        <button style={backBtn(settings.themeColor)} onClick={() => window.history.back()}>Back to Home</button>
                    </div>
                </div>
                <MobileBottomNav />
            </div>
        );
    }

    return (
        <div style={pageWrapperS}>
            <HomeHeader />
            <div style={containerS}>
                
                {/* --- [A] DYNAMIC BRANDED WALLET ARCHITECTURE --- */}
                <div style={walletCardS(settings?.themeColor)}>
                    <div style={cardGlow}></div>
                    <div style={badgeS}>AUTHENTICATED HUB</div>
                    <small style={labelS}>{settings?.siteName?.toUpperCase()} PAY BALANCE</small>
                    <h1 style={amountS}>
                        ₹{new Intl.NumberFormat('en-IN').format(user?.wallet?.balance || 0)}.00
                    </h1>
                    <div style={actionRowS}>
                        <button onClick={handleAddMoney} disabled={actionLoading} style={topupBtnS}>
                            {actionLoading ? "SYNCING..." : "Add Money"}
                        </button>
                        <button onClick={handleWithdraw} disabled={actionLoading} style={transferBtnS}>
                            Redeem
                        </button>
                    </div>
                </div>
                
                {/* --- [B] DYNAMIC TRANSACTION LEDGER --- */}
                <div style={historySectionS}>
                    <div style={flexHeaderS}>
                        <h3 style={secTitleS}>Transaction History</h3>
                        <span style={recordCount}>{user?.wallet?.history?.length || 0} Records Found</span>
                    </div>
                    
                    <div style={ledgerS}>
                        {user?.wallet?.history?.length > 0 ? (
                            [...user.wallet.history].reverse().map((item, index) => (
                                <div key={index} style={historyItemS}>
                                    <div style={itemLeftS}>
                                        <div style={iconBoxS(item.type)}>
                                            {item.type === 'Credit' ? '↓' : '↑'}
                                        </div>
                                        <div>
                                            <div style={txTypeS}>{item.transactionType.replace(/_/g, ' ')}</div>
                                            <div style={txDescS}>{item.description}</div>
                                            <div style={txDateS}>{new Date(item.timestamp).toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</div>
                                        </div>
                                    </div>
                                    <div style={txAmountS(item.type)}>
                                        {item.type === 'Credit' ? '+' : '-'} ₹{item.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={emptyS}>
                                <div style={{fontSize:'60px', marginBottom:'15px'}}>📃</div>
                                <p style={{margin:0, color:'#1e293b'}}>No financial activity detected.</p>
                                <small>Order refunds and bonuses will appear here automatically.</small>
                            </div>
                        )}
                    </div>
                </div>

                <div style={safetyNote}>
                    🛡️ This financial node is part of the {settings?.siteName} secure infrastructure. All assets are monitored for compliance.
                </div>
            </div>
            <MobileBottomNav />
        </div>
    );
};

// --- Enterprise Visual Definitions ---

const pageWrapperS = { background: '#f8fafc', minHeight: '100vh', paddingBottom: '120px', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const containerS = { width: '94%', maxWidth: '550px', margin: '0 auto', padding: '30px 0' };

const walletCardS = (color) => ({ 
    background: color ? `linear-gradient(135deg, ${color} 0%, #1e293b 100%)` : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
    color: '#fff', padding: '50px 30px', borderRadius: '40px', textAlign: 'center', 
    boxShadow: `0 20px 40px -10px ${color}66`, position: 'relative', overflow: 'hidden'
});

const cardGlow = { position:'absolute', top:'-50%', left:'-50%', width:'200%', height:'200%', background:'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', pointerEvents:'none' };

const badgeS = { position:'absolute', top:'25px', right:'25px', background:'rgba(255,255,255,0.15)', color:'#fff', padding:'6px 14px', borderRadius:'12px', fontSize:'9px', fontWeight:'900', letterSpacing:'1px', backdropFilter:'blur(5px)' };
const labelS = { letterSpacing: '2px', fontWeight: '800', color: 'rgba(255,255,255,0.6)', fontSize: '9px', display:'block', marginBottom:'8px' };
const amountS = { fontSize: 'clamp(32px, 8vw, 48px)', margin: '0', fontWeight: '900', letterSpacing:'-2px' };

const actionRowS = { display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '40px' };
const topupBtnS = { background: '#fff', color: '#0f172a', border: 'none', padding: '15px 30px', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', fontSize: '13px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' };
const transferBtnS = { background: 'rgba(255,255,255,0.1)', color:'#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '15px 30px', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', fontSize: '13px' };

const historySectionS = { marginTop: '45px' };
const flexHeaderS = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', padding:'0 10px' };
const secTitleS = { margin: 0, fontWeight: '900', color: '#0f172a', fontSize: '18px', letterSpacing:'-0.5px' };
const recordCount = { fontSize:'11px', color:'#94a3b8', fontWeight:'800', textTransform:'uppercase' };

const ledgerS = { background: '#fff', borderRadius: '35px', padding: '10px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' };

const historyItemS = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 15px', borderBottom: '1px solid #f8fafc' };
const itemLeftS = { display: 'flex', gap: '15px', alignItems: 'center' };
const iconBoxS = (type) => ({ 
    width: '45px', height: '45px', 
    background: type === 'Credit' ? '#ecfdf5' : '#fff1f2', 
    color: type === 'Credit' ? '#10b981' : '#f43f5e',
    borderRadius: '15px', display: 'flex', alignItems: 'center', 
    justifyContent: 'center', fontSize: '20px', fontWeight:'bold'
});

const txTypeS = { fontWeight: '800', color: '#1e293b', fontSize: '14px', textTransform: 'uppercase' };
const txDescS = { fontSize:'12px', color:'#64748b', fontWeight:'500', marginTop:'2px' };
const txDateS = { fontSize: '9px', color: '#cbd5e1', fontWeight: '800', marginTop:'4px' };
const txAmountS = (type) => ({ fontWeight: '900', fontSize: '16px', color: type === 'Credit' ? '#10b981' : '#1e293b' });

const emptyS = { textAlign: 'center', color: '#cbd5e1', padding: '80px 20px', fontWeight: '700' };
const safetyNote = { textAlign:'center', color:'#94a3b8', fontSize:'11px', fontWeight:'600', marginTop:'40px', lineHeight:'1.5' };

const loaderS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background:'#f8fafc', gap:'20px' };
const spinnerS = { width: '45px', height: '45px', border: '5px solid #f1f5f9', borderRadius: '50%', animation: 'spin 1s linear infinite' };
const loaderText = { fontSize: '14px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' };

const disabledContainer = { padding: '80px 20px', display: 'flex', justifyContent: 'center' };
const disabledCard = { background: '#fff', padding: '60px 40px', borderRadius: '40px', maxWidth:'450px', textAlign:'center', border:'1px solid #f1f5f9', boxShadow:'0 20px 40px rgba(0,0,0,0.05)' };
const backBtn = (color) => ({ marginTop: '30px', padding: '18px 40px', background: color || '#0f172a', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '900', fontSize:'14px' });

export default UserWallet;