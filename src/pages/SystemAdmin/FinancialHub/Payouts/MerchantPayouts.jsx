import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../../services/api'; 
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { useBranding } from '../../../../context/BrandingContext'; // Added for White-labeling

const MerchantPayouts = () => {
    const { settings } = useBranding();
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Pending'); 
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

    // 1. 📡 Automatic Financial Synchronization Protocol (No Buttons)
    const fetchPayoutData = useCallback(async () => {
        try {
            // Background sync is silent, initial load shows spinner
            const res = await api.get('/admin/financials/payout-summary');
            if (res.data.success) {
                setPayouts(res.data.data || []);
                setError(null);
            }
            setLastSynced(new Date().toLocaleTimeString());
            document.title = `Payout Manager | ${settings.siteName}`;
        } catch (err) {
            console.error("Financial Cluster Sync Failure.");
            setError("Connectivity Alert: Financial registry unreachable.");
        } finally {
            setLoading(false);
        }
    }, [settings.siteName]);

    useEffect(() => {
        fetchPayoutData();
        
        // Auto-refresh when admin returns to this window (SaaS Protocol)
        window.addEventListener('focus', fetchPayoutData);
        return () => window.removeEventListener('focus', fetchPayoutData);
    }, [fetchPayoutData]);

    // 2. 🔍 Discovery & Filtering Logic
    const filteredPayouts = useMemo(() => {
        return payouts.filter(p => {
            const matchesTab = p.payoutStatus === activeTab;
            const matchesSearch = 
                (p.shopName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.merchantId || "").toLowerCase().includes(searchTerm.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [payouts, activeTab, searchTerm]);

    // 3. 📈 Operational Financial Analytics
    const stats = useMemo(() => {
        const pending = payouts.filter(p => p.payoutStatus === 'Pending').reduce((sum, p) => sum + (p.payableAmount || 0), 0);
        const commission = payouts.reduce((sum, p) => sum + (p.platformFee || 0), 0);
        const settled = payouts.filter(p => p.payoutStatus === 'Settled').reduce((sum, p) => sum + (p.payableAmount || 0), 0);
        return { pending, commission, settled };
    }, [payouts]);

    // 4. 🏛️ Settlement Protocol Execution (Process Payout)
    const processSettlement = async (merchantId, amount) => {
        const reference = window.prompt(`CRITICAL PROTOCOL: Enter Bank UTR / Transaction ID for INR ${amount.toLocaleString()}:`);
        if (!reference) return toast.warning("Reconciliation Alert: UTR/Reference ID is mandatory.");

        if (!window.confirm("Confirm Authorization: Have you initiated the bank transfer? This record will be immutable.")) return;

        try {
            await api.post('/admin/financials/process-payout', {
                merchantId,
                amount,
                utr: reference
            });
            
            toast.success("Protocol Success: Settlement processed and registry locked. ✅");
            fetchPayoutData(); // Silent background re-sync
        } catch (err) {
            toast.error("Security Handshake Failed: Registry commit denied.");
        }
    };

    // 5. 📥 Intelligent Audit Ledger Export
    const exportToExcel = () => {
        if (filteredPayouts.length === 0) return toast.warning("Export Aborted: No records discovered.");
        
        const exportData = filteredPayouts.map(p => ({
            "Hub Name": p.shopName,
            "Merchant ID": p.merchantId,
            "Gross Sales (INR)": p.totalSales,
            "Platform Fee (5%)": p.platformFee,
            "Net Payable (INR)": p.payableAmount,
            "Bank Institution": p.bankDetails?.bankName,
            "Account Identifier": p.bankDetails?.accountNumber,
            "IFSC Protocol": p.bankDetails?.ifscCode,
            "UTR Reference": p.utrNumber || 'N/A',
            "Status": p.payoutStatus
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Payout_Registry");
        XLSX.writeFile(wb, `${settings.siteName}_Financial_Ledger_${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.info("Audit Ledger dispatched to downloads.");
    };

    const viewBankInfo = (bank) => {
        if(!bank) return toast.error("Deployment Error: No bank credentials discovered.");
        alert(`🏦 AUTHORIZED BANK CREDENTIALS:\n\n` +
              `Institution: ${bank.bankName}\n` +
              `Account Identifier: ${bank.accountNumber}\n` +
              `Gateway IFSC: ${bank.ifscCode}\n\n` +
              `PROTOCOL: Verify these details via your banking node before initiating transfer.`);
    };

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Syncing Financial Hub Registry...</p>
        </div>
    );

    return (
        <div style={containerS}>
            {/* --- [A] COMMAND HEADER & EXPORT --- */}
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>💰 Financial Payout Console</h2>
                    <p style={subTitleS}>Strategic settlement management and hub reconciliation for {settings.siteName}.</p>
                </div>
                <button onClick={exportToExcel} style={exportBtn(themeColor)}>📥 Export Audit Ledger (.xlsx)</button>
            </div>

            {/* --- [B] REAL-TIME METRICS DASHBOARD --- */}
            <div style={statsGrid}>
                <div style={statCard('#f43f5e')}>
                    <small style={statLab}>PENDING PAYABLE</small>
                    <h2 style={{...statValS, color: '#f43f5e'}}>₹{stats.pending.toLocaleString()}</h2>
                    <div style={trendS}>Requires Immediate Action</div>
                </div>
                <div style={statCard(themeColor)}>
                    <small style={statLab}>PLATFORM REVENUE (NET)</small>
                    <h2 style={{...statValS, color: themeColor}}>₹{stats.commission.toLocaleString()}</h2>
                    <div style={trendS}>Net Infrastructure Facilitation</div>
                </div>
                <div style={statCard('#10b981')}>
                    <small style={statLab}>SETTLED (CURRENT CYCLE)</small>
                    <h2 style={{...statValS, color: '#10b981'}}>₹{stats.settled.toLocaleString()}</h2>
                    <div style={trendS}>Transactions Successfully Reconciled</div>
                </div>
            </div>

            {/* --- [C] DISCOVERY TOOLBAR (No Buttons) --- */}
            <div style={toolbarS}>
                <div style={tabGroup}>
                    <button style={activeTab === 'Pending' ? activeTabS(themeColor) : inactiveTab} onClick={()=>setActiveTab('Pending')}>Pending Payouts</button>
                    <button style={activeTab === 'Settled' ? activeTabS(themeColor) : inactiveTab} onClick={()=>setActiveTab('Settled')}>Archived History</button>
                </div>
                <div style={searchBox}>
                    <span>🔍</span>
                    <input 
                        placeholder="Search by Merchant Identity or Hub ID..." 
                        style={inS} 
                        value={searchTerm}
                        onChange={(e)=>setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={syncBadge}>
                    <span className="pulse-dot"></span>
                    <small>{lastSynced}</small>
                </div>
            </div>

            {/* --- [D] MASTER PAYOUT TABLE --- */}
            <div style={tableCard}>
                {error ? (
                    <div style={errorArea}>{error}</div>
                ) : (
                    <div style={{overflowX: 'auto'}}>
                        <table style={tableS}>
                            <thead>
                                <tr style={thRow}>
                                    <th style={tdS}>Merchant Hub</th>
                                    <th style={tdS}>Gross Ledger</th>
                                    <th style={tdS}>Platform Fee</th>
                                    <th style={tdS}>Net Settlement</th>
                                    <th style={tdS}>Compliance</th>
                                    <th style={tdS}>Command</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayouts.length === 0 ? (
                                    <tr><td colSpan="6" style={emptyS}>Registry Clean: No payout transactions discovered.</td></tr>
                                ) : (
                                    filteredPayouts.map(p => (
                                        <tr key={p.merchantId} style={trS}>
                                            <td style={tdS}>
                                                <div style={{fontWeight:'900', color:'#0f172a', fontSize:'15px'}}>{p.shopName}</div>
                                                <div style={idBadge}>NODE_ID: {p.merchantId?.toUpperCase()}</div>
                                            </td>
                                            <td style={tdS}>
                                                <div style={ledgerLabelS}>GROSS SALES</div>
                                                <div style={{fontWeight:'800', color:'#1e293b'}}>₹{p.totalSales.toLocaleString()}</div>
                                            </td>
                                            <td style={tdS}>
                                                <div style={{color:'#f43f5e', fontWeight:'900', fontSize:'13px'}}>- ₹{p.platformFee.toLocaleString()}</div>
                                            </td>
                                            <td style={tdS}>
                                                <div style={{fontWeight:'900', color: themeColor, fontSize:'18px'}}>₹{p.payableAmount.toLocaleString()}</div>
                                            </td>
                                            <td style={tdS}>
                                                <button onClick={()=>viewBankInfo(p.bankDetails)} style={bankBtn(themeColor)}>Verify Banking</button>
                                            </td>
                                            <td style={tdS}>
                                                {p.payoutStatus === 'Pending' ? (
                                                    <button 
                                                        onClick={() => processSettlement(p.merchantId, p.payableAmount)}
                                                        style={payBtn(themeColor)}
                                                    >
                                                        Confirm Settlement
                                                    </button>
                                                ) : (
                                                    <div style={settledBadge}>
                                                        <span>✅ SETTLED</span>
                                                        <small style={utrNoteS}>UTR: {p.utrNumber}</small>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div style={noticeBox}>
                🛡️ <b>Automated Financial Protocol:</b> All settlements are reconciled after a <b>standard system fee</b>. Manual overrides are logged in the cryptographic security audit trail of {settings.siteName}.
            </div>

            <style>{`
                .spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; animation: pulse-anim 2s infinite; margin-right: 10px; }
                @keyframes pulse-anim { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Definitions ---

const containerS = { padding: '10px', minHeight: '100vh', animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '45px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin: 0, color: '#0f172a', fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '900', letterSpacing:'-1.5px' };
const subTitleS = { color: '#64748b', fontSize: '14px', marginTop: '5px', fontWeight:'500' };

const exportBtn = (color) => ({ background: color, color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', fontSize:'13px', boxShadow:`0 8px 15px ${color}33`, transition:'0.3s' });

const statsGrid = { display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' };
const statCard = (color) => ({ background: '#fff', padding: '30px', borderRadius: '35px', borderLeft: `6px solid ${color}`, boxShadow: '0 10px 30px rgba(0,0,0,0.02)', borderTop:'1px solid #f1f5f9', borderRight:'1px solid #f1f5f9', borderBottom:'1px solid #f1f5f9' });
const statLab = { fontSize: '10px', fontWeight: '900', color: '#cbd5e1', textTransform:'uppercase', letterSpacing:'1.5px' };
const statValS = { margin: '12px 0 6px 0', fontSize: '28px', fontWeight: '900', letterSpacing:'-1px' };
const trendS = { fontSize: '11px', color: '#cbd5e1', fontWeight: '800', textTransform:'uppercase', letterSpacing:'0.5px' };

const toolbarS = { display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '35px', flexWrap: 'wrap', background: '#fff', padding: '15px', borderRadius: '24px', border: '1px solid #f1f5f9', alignItems:'center' };
const tabGroup = { display: 'flex', background: '#f8fafc', padding: '6px', borderRadius: '18px', border: '1px solid #f1f5f9', gap: '8px' };
const inactiveTab = { padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '12px', color: '#94a3b8', fontWeight: '900', fontSize: '11px', textTransform:'uppercase', transition:'0.3s' };
const activeTabS = (color) => ({ ...inactiveTab, background: color, color: '#fff', boxShadow: `0 4px 12px \${color}33` });

const searchBox = { flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', background:'#fff', padding:'0 15px', borderRadius:'16px', border:'1.5px solid #f1f5f9', boxShadow:'0 10px 30px rgba(0,0,0,0.02)' };
const inS = { border: 'none', width: '100%', padding: '14px 0', outline: 'none', fontSize: '14px', background: 'transparent', fontWeight:'700', color:'#1e293b' };
const syncBadge = { display:'flex', alignItems:'center', background:'#f8fafc', padding:'10px 18px', borderRadius:'14px', border:'1px solid #e2e8f0', color:'#94a3b8', fontSize:'11px', fontWeight:'800' };

const tableCard = { background: '#fff', borderRadius: '40px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' };
const tableS = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' };
const thRow = { backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' };
const tdS = { padding: '22px 30px', fontSize: '14px', borderBottom: '1px solid #f8fafc' };
const trS = { transition: '0.2s' };

const idBadge = { background:'#f8fafc', padding:'3px 8px', borderRadius:'6px', fontSize:'9px', color:'#cbd5e1', fontWeight:'900', display:'inline-block', marginTop:'5px', border:'1px solid #f1f5f9' };
const ledgerLabelS = { fontSize:'9px', fontWeight:'900', color:'#cbd5e1', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'4px' };

const bankBtn = (color) => ({ background: `${color}10`, border: `1.5px solid ${color}20`, padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontSize: '11px', fontWeight: '900', color: color, transition:'0.2s' });
const payBtn = (color) => ({ background: '#0f172a', color: '#fff', border: 'none', padding: '12px 22px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '11px', letterSpacing:'0.5px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)' });

const settledBadge = { color: '#10b981', fontWeight: '900', fontSize: '12px', display:'flex', flexDirection:'column', gap:'3px' };
const utrNoteS = { fontSize:'10px', color:'#cbd5e1', fontWeight:'800', letterSpacing:'0.5px' };

const emptyS = { padding: '120px 20px', textAlign: 'center', color: '#cbd5e1', fontSize: '18px', fontWeight: '800', textTransform:'uppercase', letterSpacing:'1px' };
const errorArea = { padding: '50px', textAlign: 'center', color: '#f43f5e', fontWeight: '800', background:'#fff1f2', fontSize:'14px' };
const noticeBox = { marginTop: '40px', padding: '25px', borderRadius: '25px', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', color: '#9a3412', fontSize: '13px', lineHeight: '1.8', textAlign:'center', fontWeight:'500' };

const loaderS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '60vh', background:'#f8fafc', gap:'20px' };

export default MerchantPayouts;