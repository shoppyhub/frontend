import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../services/api'; 
import { toast } from 'react-toastify';
import { Bar } from 'react-chartjs-2';
import PayoutLedger from './PayoutLedger';
import { useBranding } from '../../context/BrandingContext';
import { useAuth } from '../../context/AuthContext';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend,
    PointElement,
    LineElement 
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const EarningsManager = () => {
    const { settings } = useBranding();
    const { user: authUser, refreshUser } = useAuth(); // ✅ refreshUser का उपयोग करें
    
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 850);
    const [loading, setLoading] = useState(true);
    const [payoutLoading, setPayoutLoading] = useState(false);
    const [user, setUser] = useState(null);
    
    const [stats, setStats] = useState({
        totalRevenue: 0,
        netEarnings: 0,
        platformFees: 0,
        totalOrders: 0,
        walletBalance: 0,
        weeklyData: [0, 0, 0, 0, 0, 0, 0]
    });

    const fetchFinancialHub = useCallback(async () => {
        try {
            const [profileRes, ordersRes] = await Promise.all([
                api.get('/auth/profile'),
                api.get('/orders/shop-orders')
            ]);

            if (profileRes.data.success && ordersRes.data.success) {
                const userData = profileRes.data.data;
                const orders = ordersRes.data.data || [];
                
                const delivered = orders.filter(o => o.status === 'Delivered');
                const totalGross = delivered.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                const totalFees = delivered.reduce((sum, o) => sum + (o.platformFee || 0), 0);
                
                const weeklyArray = [0, 0, 0, 0, 0, 0, 0];
                delivered.forEach(o => {
                    const day = new Date(o.createdAt).getDay(); 
                    weeklyArray[day] += (o.netToMerchant || 0);
                });

                setUser(userData);
                
                // ✅ सुधार: login(userData) को हटा दिया गया है। 
                // इसकी जगह स्थानीय स्टेट 'setUser' का उपयोग करें।
                
                setStats({
                    totalRevenue: totalGross,
                    platformFees: totalFees,
                    netEarnings: totalGross - totalFees,
                    totalOrders: delivered.length,
                    walletBalance: userData.wallet?.balance || 0,
                    weeklyData: weeklyArray
                });
                
                document.title = `Revenue Console | ${settings.siteName}`;
            }
        } catch (err) {
            console.error("Financial Sync Failure.");
        } finally {
            setLoading(false);
        }
    }, [settings.siteName]);

    useEffect(() => { 
        fetchFinancialHub(); 
        const handleResize = () => setIsMobile(window.innerWidth <= 850);
        window.addEventListener('resize', handleResize);
        window.addEventListener('focus', fetchFinancialHub);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('focus', fetchFinancialHub);
        };
    }, [fetchFinancialHub]);

    const totalBalance = stats.walletBalance;
    const minHolding = settings?.walletSettings?.minWalletHoldingBalance || 0;
    const minRedeem = settings?.walletSettings?.minRedeemAmount || 500;
    const withdrawableAmt = Math.max(0, totalBalance - minHolding);

    const handleWithdrawal = async () => {
        if (!user?.bankDetails?.accountNumber) {
            return toast.error("Deployment Error: Please configure bank details first.");
        }
        if (withdrawableAmt < minRedeem) {
            return toast.warning(`Constraint Alert: Minimum payout threshold is ₹${minRedeem}.`);
        }
        if (!window.confirm(`Protocol: Transfer ₹${withdrawableAmt} to your registered bank account?`)) return;

        setPayoutLoading(true);
        try {
            const res = await api.post('/auth/payout-request', { amount: withdrawableAmt });
            if (res.data.success) {
                toast.success("Settlement request dispatched! 🎉");
                fetchFinancialHub();
                if(refreshUser) refreshUser(); // ✅ ग्लोबल वॉलेट बैलेंस अपडेट करें
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Protocol Interruption.");
        } finally {
            setPayoutLoading(false);
        }
    };

    const themeColor = settings?.themeColor || '#0f172a';

    const chartData = useMemo(() => ({
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
            label: 'Net Accrual (₹)',
            data: stats.weeklyData,
            backgroundColor: themeColor,
            borderRadius: 12,
        }]
    }), [stats.weeklyData, themeColor]);

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p>Syncing Financial Ledger...</p>
        </div>
    );

    return (
        <div style={container}>
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>💰 Revenue Intelligence Hub</h2>
                    <p style={subS}>Managing settlements and fiscal performance.</p>
                </div>
            </div>

            <div style={policyAlert(themeColor)}>
                <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                    <span style={{fontSize:'28px'}}>📡</span>
                    <div>
                        <b style={{display:'block', fontSize:'14px'}}>Holding Compliance Protocol</b>
                        <small>A security holding of <b>₹{minHolding.toLocaleString()}</b> is maintained.</small>
                    </div>
                </div>
            </div>

            <div style={statsGrid(isMobile)}>
                <div style={statCard('#10b981')}>
                    <small style={mLabel}>GROSS REVENUE</small>
                    <h2 style={mValue}>₹{stats.totalRevenue.toLocaleString()}</h2>
                </div>
                <div style={statCard('#f43f5e')}>
                    <small style={mLabel}>SYSTEM FEES</small>
                    <h2 style={{ ...mValue, color: '#f43f5e' }}>- ₹{stats.platformFees.toLocaleString()}</h2>
                </div>
                <div style={statCard(themeColor)}>
                    <small style={mLabel}>NET HUB EARNINGS</small>
                    <h2 style={{ ...mValue, color: themeColor }}>₹{stats.netEarnings.toLocaleString()}</h2>
                </div>
            </div>

            <div style={walletSection}>
                <div style={walletHero(themeColor, isMobile)}>
                    <div style={{ flex: 1 }}>
                        <div style={vaultStatsFlex(isMobile)}>
                            <div>
                                <small style={wLabel}>Vault Balance</small>
                                <div style={{fontSize:'32px', fontWeight:'900'}}>₹{totalBalance.toLocaleString()}</div>
                            </div>
                            <div style={vDivider}></div>
                            <div>
                                <small style={wLabel}>Security Holding</small>
                                <div style={{fontSize:'32px', fontWeight:'900', color:'#fbbf24'}}>₹{minHolding.toLocaleString()}</div>
                            </div>
                        </div>
                        <div style={{marginTop:'40px'}}>
                            <small style={{...wLabel, color:'#10b981', opacity:1}}>Withdrawable Assets</small>
                            <h1 style={balanceVal}>₹{withdrawableAmt.toLocaleString()}.00</h1>
                        </div>
                    </div>
                    
                    <div style={actionBoxS}>
                        <button 
                            onClick={handleWithdrawal} 
                            style={withdrawableAmt >= minRedeem ? withdrawBtn : withdrawBtnDisabled}
                            disabled={payoutLoading || withdrawableAmt < minRedeem}
                        >
                            {payoutLoading ? "COMMITTING..." : "SETTLE TO BANK"}
                        </button>
                    </div>
                </div>
            </div>

            <div style={mainContentGrid(isMobile)}>
                <div style={chartCard}>
                    <h3 style={cardTitle}>📉 Fiscal Trajectory Analysis</h3>
                    <div style={{ height: isMobile ? '250px' : '350px', marginTop: '30px' }}>
                        <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                </div>

                <div style={ledgerColumn}>
                    <div style={policyBrief}>
                        <h4 style={briefTitle}>🏦 Settlement Endpoint</h4>
                        <div style={bankDetailsBox}>
                            <div style={bankRow}><small>ACC NO:</small> <b>{user?.bankDetails?.accountNumber || 'NOT LINKED'}</b></div>
                            <div style={bankRow}><small>BANK:</small> <b>{user?.bankDetails?.bankName || '---'}</b></div>
                        </div>
                    </div>
                    <PayoutLedger history={user?.payoutRequests || []} />
                </div>
            </div>
        </div>
    );
};

// --- Styles (Briefed for brevity) ---
const container = { padding: '10px' };
const headerFlex = { marginBottom: '30px' };
const titleS = { margin: 0, fontWeight: '900', color: '#0f172a', fontSize: '24px' };
const subS = { color: '#64748b', fontSize: '13px' };
const policyAlert = (color) => ({ background: '#fff', borderLeft: `6px solid ${color}`, padding: '20px', borderRadius: '15px', marginBottom: '25px', border: '1px solid #f1f5f9' });
const statsGrid = (isMobile) => ({ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' });
const statCard = (color) => ({ background: '#fff', padding: '25px', borderRadius: '20px', borderBottom: `5px solid ${color}`, border: '1px solid #f1f5f9' });
const mLabel = { fontSize: '9px', fontWeight: '900', color: '#94a3b8', textTransform:'uppercase' };
const mValue = { fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '10px 0 0' };
const walletSection = { marginBottom: '40px' };
const walletHero = (color, isMobile) => ({ background: `linear-gradient(135deg, ${color} 0%, #1e293b 100%)`, padding: '40px', borderRadius: '30px', color: '#fff', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap:'30px' });
const vaultStatsFlex = (isMobile) => ({ display:'flex', gap:'30px', justifyContent: isMobile ? 'center' : 'flex-start' });
const vDivider = { width:'1px', background:'rgba(255,255,255,0.2)', height:'40px' };
const wLabel = { color: 'rgba(255,255,255,0.6)', fontWeight: '900', fontSize: '9px', textTransform:'uppercase' };
const balanceVal = { fontWeight: '900', fontSize: '48px', margin: '10px 0' };
const actionBoxS = { minWidth:'200px' };
const withdrawBtn = { width:'100%', background: '#fff', color: '#0f172a', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' };
const withdrawBtnDisabled = { ...withdrawBtn, opacity: 0.5, cursor: 'not-allowed' };
const mainContentGrid = (isMobile) => ({ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.8fr 1.1fr', gap: '25px' });
const chartCard = { background: '#fff', padding: '25px', borderRadius: '30px', border: '1px solid #f1f5f9' };
const cardTitle = { fontSize: '12px', fontWeight: '900' };
const ledgerColumn = { display:'flex', flexDirection:'column', gap:'25px' };
const policyBrief = { background: '#fff', padding: '25px', borderRadius: '25px', border: '1px solid #f1f5f9' };
const briefTitle = { fontSize:'10px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase', marginBottom: '15px' };
const bankDetailsBox = { padding: '15px', background: '#f8fafc', borderRadius: '15px' };
const bankRow = { display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' };
const loaderS = { display: 'flex', flexDirection:'column', height: '50vh', justifyContent: 'center', alignItems: 'center' };

export default EarningsManager;