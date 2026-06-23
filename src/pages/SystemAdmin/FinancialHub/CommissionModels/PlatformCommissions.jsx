import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../../../services/api';
import { useBranding } from '../../../../context/BrandingContext';
import { toast } from 'react-toastify';

const PlatformCommissions = () => {
    const { settings } = useBranding();
    
    // --- State Management ---
    const [config, setConfig] = useState({
        standardRate: 5.0,
        fixedHandlingFee: 0,
        taxOnCommission: 18 // GST
    });
    const [categoryRates, setCategoryRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

    // 1. 📡 Automatic Fiscal Synchronization Protocol (No Buttons)
    const fetchFinancialData = useCallback(async () => {
        try {
            // Background sync is silent, initial load displays spinner
            const [settingsRes, categoriesRes] = await Promise.all([
                api.get('/admin/settings'),
                api.get('/admin/directories/shop-types')
            ]);

            if (settingsRes.data?.data) {
                const d = settingsRes.data.data;
                setConfig({
                    standardRate: d.standardRate || 5.0,
                    fixedHandlingFee: d.fixedHandlingFee || 0,
                    taxOnCommission: d.taxOnCommission || 18
                });
            }
            setCategoryRates(categoriesRes.data.data || []);
            setLastSynced(new Date().toLocaleTimeString());
            document.title = `Revenue Control | ${settings.siteName}`;
        } catch (err) {
            console.error("Revenue Hub Sync Failure.");
        } finally {
            setLoading(false);
        }
    }, [settings.siteName]);

    useEffect(() => {
        fetchFinancialData();
        // Auto-refresh when user returns to this window
        window.addEventListener('focus', fetchFinancialData);
        return () => window.removeEventListener('focus', fetchFinancialData);
    }, [fetchFinancialData]);

    // 2. 🚀 Global Architecture Deployment
    const handleGlobalUpdate = async () => {
        if (!window.confirm("CRITICAL: Deploy these changes to the global fee architecture? Transactions will be affected immediately.")) return;

        setIsUpdating(true);
        try {
            await api.put('/admin/settings/update', config);
            toast.success("Ecosystem Update: Global commission parameters locked! ✅");
        } catch (err) {
            toast.error("Protocol Error: Handshake failed.");
        } finally {
            setIsUpdating(false);
        }
    };

    // 3. 🏷️ Category Override Protocol
    const saveCategoryRate = async (id, newRate) => {
        try {
            const res = await api.put(`/admin/directories/shop-types/update/${id}`, { commissionRate: newRate });
            if (res.data.success) {
                toast.success("Sector rate synchronized.");
                fetchFinancialData(); // Background silent refresh
            }
        } catch (err) {
            toast.error("Update failed.");
        }
    };

    // --- 4. Predictive Financial Analytics ---
    const stats = useMemo(() => {
        const totalEarnings = categoryRates.reduce((sum, c) => sum + (c.totalEarnings || 0), 0);
        const avgRate = categoryRates.length > 0 
            ? (categoryRates.reduce((sum, c) => sum + (c.commissionRate || config.standardRate), 0) / categoryRates.length).toFixed(1)
            : config.standardRate;
        return { totalEarnings, avgRate };
    }, [categoryRates, config.standardRate]);

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Accessing Fiscal Registry...</p>
        </div>
    );

    return (
        <div style={containerS}>
            {/* --- [A] COMMAND HEADER & ACTIONS --- */}
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>📈 Revenue Architecture</h2>
                    <p style={subTitleS}>Strategic management of transaction facilitation fees and commission logic for {settings.siteName}.</p>
                </div>
                <div style={headerActions}>
                    <div style={syncStatus}>
                        <span className="pulse-dot"></span>
                        <small>Auto-Sync: {lastSynced}</small>
                    </div>
                    <button style={btnReport(themeColor)} onClick={() => window.print()}>📥 Generate Revenue Ledger</button>
                </div>
            </div>

            {/* --- [B] REAL-TIME ANALYTICS GRID --- */}
            <div style={grid3}>
                <div style={statCard('#10b981')}>
                    <div style={cardIcon}>💰</div>
                    <small style={statLab}>CUMULATIVE NETWORK ACCRUAL</small>
                    <h2 style={statVal}>₹{stats.totalEarnings.toLocaleString()}</h2>
                    <div style={trendUp}>● NET ECOSYSTEM PROFIT</div>
                </div>
                <div style={statCard(themeColor)}>
                    <div style={cardIcon}>📊</div>
                    <small style={statLab}>AVERAGE COMMISSION RATE</small>
                    <h2 style={statVal}>{stats.avgRate}%</h2>
                    <div style={trendStable(themeColor)}>Target Standard: {config.standardRate}%</div>
                </div>
                <div style={statCard('#f59e0b')}>
                    <div style={cardIcon}>🚀</div>
                    <small style={statLab}>PROJECTED QUARTERLY YIELD</small>
                    <h2 style={statVal}>₹{(stats.totalEarnings * 1.5).toLocaleString()}</h2>
                    <div style={trendUp}>Based on 15% Growth Node</div>
                </div>
            </div>

            <div style={contentGrid}>
                {/* --- [C] GLOBAL FEE CONFIGURATION MODULE --- */}
                <div style={configCard}>
                    <h3 style={cardTitle(themeColor)}>⚙️ Global Fee Protocol</h3>
                    <p style={nodeHint}>Parameters set here apply to all merchant hubs by default.</p>
                    
                    <div style={fieldGroup}>
                        <div style={inputField}>
                            <label style={labS}>Standard Facilitation Rate (%)</label>
                            <input 
                                type="number" 
                                value={config.standardRate} 
                                onChange={(e) => setConfig({...config, standardRate: Number(e.target.value)})}
                                style={inS} 
                            />
                        </div>
                        <div style={inputField}>
                            <label style={labS}>Fixed Infrastructure Surcharge (₹)</label>
                            <input 
                                type="number" 
                                value={config.fixedHandlingFee} 
                                onChange={(e) => setConfig({...config, fixedHandlingFee: Number(e.target.value)})}
                                style={inS} 
                            />
                        </div>
                        <div style={inputField}>
                            <label style={labS}>Tax on Facilitation (GST %)</label>
                            <input 
                                type="number" 
                                value={config.taxOnCommission} 
                                onChange={(e) => setConfig({...config, taxOnCommission: Number(e.target.value)})}
                                style={inS} 
                            />
                        </div>
                    </div>

                    <button 
                        style={isUpdating ? btnUpdating : saveBtn(themeColor)} 
                        onClick={handleGlobalUpdate} 
                        disabled={isUpdating}
                    >
                        {isUpdating ? 'SYNCHRONIZING CLUSTER...' : 'DEPLOY GLOBAL ARCHITECTURE'}
                    </button>
                    
                    <div style={securityWarning}>
                        🛡️ High-level administrative action. All changes are logged for auditing.
                    </div>
                </div>

                {/* --- [D] SECTOR-SPECIFIC EXCEPTIONS TABLE --- */}
                <div style={tableCard}>
                    <h3 style={cardTitle(themeColor)}>🏷️ Sector-Specific Overrides</h3>
                    <div style={{overflowX:'auto'}}>
                        <table style={tableS}>
                            <thead>
                                <tr style={thRow}>
                                    <th style={tdS}>Industrial Sector</th>
                                    <th style={tdS}>Active Rate %</th>
                                    <th style={tdS}>Sector Yield</th>
                                    <th style={tdS}>Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoryRates.map(cat => (
                                    <tr key={cat._id} style={trS}>
                                        <td style={nodeNameS}>{cat.name}</td>
                                        <td style={tdS}>
                                            <input 
                                                type="number" 
                                                defaultValue={cat.commissionRate || config.standardRate} 
                                                onBlur={(e) => saveCategoryRate(cat._id, Number(e.target.value))}
                                                style={tableIn(themeColor)} 
                                            />
                                        </td>
                                        <td style={tdS}>
                                            <div style={{fontWeight:'900', color:'#10b981'}}>₹{(cat.totalEarnings || 0).toLocaleString()}</div>
                                        </td>
                                        <td style={tdS}>
                                            <button style={btnUpdate(themeColor)}>Sync</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {categoryRates.length === 0 && <div style={noDataS}>Sector registry clean.</div>}
                </div>
            </div>

            <style>{`
                .spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; animation: pulse-anim 2s infinite; margin-right: 8px; }
                @keyframes pulse-anim { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Definitions ---

const containerS = { padding: '10px', minHeight: '100vh', animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin: 0, fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px' };
const subTitleS = { color: '#64748b', fontSize: '14px', marginTop: '5px', fontWeight: '500' };

const headerActions = { display: 'flex', gap: '15px', alignItems:'center' };
const syncStatus = { background:'#fff', padding:'10px 15px', borderRadius:'12px', border:'1px solid #f1f5f9', display:'flex', alignItems:'center', fontWeight:'800', fontSize:'11px', color:'#94a3b8' };
const btnReport = (color) => ({ background: '#fff', color: '#1e293b', border: '1.5px solid #f1f5f9', padding: '12px 25px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', fontSize:'13px', transition:'0.3s', boxShadow:'0 4px 10px rgba(0,0,0,0.02)' });

const grid3 = { display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' };
const statCard = (col) => ({ background: '#fff', padding: '30px', borderRadius: '35px', borderBottom: `6px solid ${col}`, boxShadow: '0 10px 30px rgba(0,0,0,0.02)', position: 'relative', border: '1px solid #f1f5f9' });
const cardIcon = { position: 'absolute', right: '30px', top: '30px', fontSize: '28px', opacity: '0.1' };
const statLab = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1.5px', textTransform:'uppercase' };
const statVal = { fontSize: '32px', fontWeight: '900', margin: '12px 0', color: '#0f172a', letterSpacing:'-1px' };
const trendUp = { color: '#10b981', fontSize: '11px', fontWeight: '900', textTransform:'uppercase', letterSpacing:'0.5px' };
const trendStable = (color) => ({ color: color, fontSize: '11px', fontWeight: '900', textTransform:'uppercase', letterSpacing:'0.5px' });

const contentGrid = { display: 'grid', gridTemplateColumns: window.innerWidth < 1200 ? '1fr' : '1fr 1.6fr', gap: '30px' };

const configCard = { background: '#fff', padding: '40px', borderRadius: '40px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' };
const cardTitle = (color) => ({ marginTop: 0, marginBottom: '25px', fontSize: '18px', color: '#0f172a', fontWeight: '900', letterSpacing:'-0.5px', borderLeft:`5px solid ${color}`, paddingLeft:'15px' });
const nodeHint = { fontSize:'12px', color:'#94a3b8', marginTop:'-15px', marginBottom:'30px', fontWeight:'600' };

const fieldGroup = { display: 'flex', flexDirection: 'column', gap: '25px', marginBottom: '35px' };
const inputField = { display: 'flex', flexDirection: 'column', gap: '10px' };
const labS = { fontSize: '11px', fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing:'1px' };
const inS = { padding: '16px', borderRadius: '16px', border: '1.5px solid #f1f5f9', fontSize: '15px', fontWeight: '700', outline: 'none', background: '#f8fafc', color:'#1e293b', transition:'0.3s' };

const saveBtn = (color) => ({ width: '100%', background: color, color: '#fff', border: 'none', padding: '18px', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', fontSize:'14px', letterSpacing:'0.5px', boxShadow:`0 10px 20px ${color}33`, transition: '0.3s' });
const btnUpdating = { ...saveBtn('#cbd5e1'), background:'#cbd5e1', cursor:'not-allowed', boxShadow:'none' };
const securityWarning = { fontSize: '10px', color: '#cbd5e1', marginTop: '20px', textAlign: 'center', fontWeight:'800', textTransform:'uppercase', letterSpacing:'1px' };

const tableCard = { background: '#fff', padding: '40px', borderRadius: '40px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' };
const tableS = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth:'600px' };
const thRow = { borderBottom: '2px solid #f8fafc' };
const tdS = { padding: '20px 15px', fontSize: '14px', borderBottom: '1px solid #f8fafc' };
const trS = { transition: '0.2s' };
const nodeNameS = { ...tdS, fontWeight:'800', color:'#334155', fontSize:'15px' };

const tableIn = (color) => ({ width: '90px', padding: '10px', borderRadius: '12px', border: '2px solid #f1f5f9', fontWeight: '900', textAlign: 'center', background:'#f8fafc', outline:'none', color: color });
const btnUpdate = (color) => ({ background: `${color}10`, color: color, border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '11px', textTransform:'uppercase' });

const loaderS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '60vh', background:'#f8fafc', gap:'20px' };
const noDataS = { padding: '80px 20px', textAlign: 'center', color: '#cbd5e1', fontSize: '16px', fontWeight: '800', letterSpacing:'1px' };

export default PlatformCommissions;