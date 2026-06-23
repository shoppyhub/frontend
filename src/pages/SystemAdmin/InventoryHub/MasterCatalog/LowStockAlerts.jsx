import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../../services/api'; 
import { toast } from 'react-toastify';
import { useBranding } from '../../../../context/BrandingContext'; // Added for White-labeling

const LowStockAlerts = () => {
    const { settings } = useBranding();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifying, setNotifying] = useState(null); 
    const [error, setError] = useState(null);
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

    // 1. 📡 Automatic Synchronization Protocol (No Buttons)
    const fetchAlerts = useCallback(async () => {
        try {
            // Initial load displays spinner, subsequent syncs are silent
            const res = await api.get('/admin/inventory/low-stock'); 
            if (res.data.success) {
                setAlerts(res.data.data || []);
                setError(null);
            }
            setLastSynced(new Date().toLocaleTimeString());
            document.title = `Stock Alerts | ${settings.siteName}`;
        } catch (err) {
            console.error("Critical Alerts Sync Failure.");
            setError("Connectivity Alert: Inventory registry unreachable.");
        } finally {
            setLoading(false);
        }
    }, [settings.siteName]);

    useEffect(() => {
        fetchAlerts();

        // Auto-refresh when admin returns to this window (SaaS Protocol)
        window.addEventListener('focus', fetchAlerts);
        return () => window.removeEventListener('focus', fetchAlerts);
    }, [fetchAlerts]);

    // 2. 🚀 Restock Protocol Dispatch (Merchant Notification)
    const sendWarning = async (shopId, productName) => {
        setNotifying(shopId + productName); 
        try {
            await api.post(`/admin/inventory/notify-restock`, { shopId, productName });
            toast.success(`Protocol Executed: Merchant notified for ${productName}. ✅`);
        } catch (err) {
            toast.error("Notification Dispatch Failed. Check cluster logs.");
        } finally {
            setNotifying(null);
        }
    };

    // 3. 📈 Operational Threat Intelligence
    const stats = useMemo(() => ({
        critical: alerts.filter(a => a.stock <= 2).length,
        urgent: alerts.filter(a => a.stock > 2 && a.stock <= 8).length,
    }), [alerts]);

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Scanning Network for Stock Depletion...</p>
        </div>
    );

    return (
        <div style={containerS}>
            {/* --- [A] COMMAND HEADER & ALERT SUMMARY --- */}
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>⚠️ Critical Stock Depletion Alerts</h2>
                    <p style={subTitleS}>Strategic real-time monitoring of commercial assets across the {settings.siteName} ecosystem.</p>
                </div>
                <div style={statsRow}>
                    <div style={miniStat('#f43f5e')}>
                        <small style={statLab}>CRITICAL NODE (0-2)</small>
                        <b style={{fontSize:'22px', color:'#f43f5e'}}>{stats.critical} Units</b>
                    </div>
                    <div style={miniStat('#f59e0b')}>
                        <small style={statLab}>URGENT DEPLETION (3-8)</small>
                        <b style={{fontSize:'22px', color:'#f59e0b'}}>{stats.urgent} Units</b>
                    </div>
                    <div style={syncBadge}>
                        <span className="pulse-dot"></span>
                        <small>{lastSynced}</small>
                    </div>
                </div>
            </div>

            {/* --- [B] ALERTS REGISTRY MODULE --- */}
            <div style={tableCard}>
                {error ? (
                    <div style={errorArea}>{error}</div>
                ) : (
                    <div style={{overflowX: 'auto'}}>
                        <table style={tableS}>
                            <thead>
                                <tr style={thRow}>
                                    <th style={tdS}>Asset Identity</th>
                                    <th style={tdS}>Origin Merchant Hub</th>
                                    <th style={tdS}>Inventory Level</th>
                                    <th style={tdS}>Threat Status</th>
                                    <th style={tdS}>Operational Command</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.length === 0 ? (
                                    <tr><td colSpan="5" style={noData}>✅ ECOSYSTEM_STABLE: All inventory nodes reporting optimal levels.</td></tr>
                                ) : (
                                    alerts.map((item, i) => (
                                        <tr key={item._id || i} style={trS}>
                                            <td style={tdS}>
                                                <div style={prodInfo}>
                                                    <div style={prodThumb}>{item.name?.charAt(0)}</div>
                                                    <div>
                                                        <div style={pName}>{item.name}</div>
                                                        <small style={pCat}>{item.category} • SKU: {item._id?.slice(-8).toUpperCase()}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={tdS}>
                                                <div style={shopN}>{item.shopId?.shopDetails?.shopName || 'Partner Hub'}</div>
                                                <div style={shopLoc}>📍 {item.shopId?.shopDetails?.address?.district?.toUpperCase()}</div>
                                                <a href={`https://wa.me/91${item.shopId?.mobile}`} target="_blank" rel="noreferrer" style={waLink}>
                                                    💬 OPEN SECURE CHAT
                                                </a>
                                            </td>
                                            <td style={tdS}>
                                                <div style={stockVal(item.stock)}>
                                                    {item.stock === 0 ? '🚫 EXHAUSTED' : `${item.stock} Units Online`}
                                                </div>
                                                <div style={stockBarBg}>
                                                    <div style={stockBarFill(item.stock)}></div>
                                                </div>
                                            </td>
                                            <td style={tdS}>
                                                <span style={priorityBadge(item.stock)}>
                                                    {item.stock <= 2 ? '⚡ CRITICAL_ALERT' : '🟠 URGENT_REFILL'}
                                                </span>
                                            </td>
                                            <td style={tdS}>
                                                <button 
                                                    onClick={() => sendWarning(item.shopId?._id, item.name)} 
                                                    style={notifyBtn(notifying === (item.shopId?._id + item.name), themeColor)}
                                                    disabled={notifying === (item.shopId?._id + item.name)}
                                                >
                                                    {notifying === (item.shopId?._id + item.name) ? 'DISPATCHING...' : '🚀 NOTIFY HUB'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <div style={footerAuditS}>
                🛡️ <b>Registry Note:</b> Stock levels are audited in real-time. Hub owners receive terminal & SMS alerts on manual notification dispatch.
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
const titleS = { margin: 0, color: '#0f172a', fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '900', letterSpacing:'-1px' };
const subTitleS = { margin: '5px 0 0', color: '#64748b', fontSize: '14px', fontWeight:'500' };

const statsRow = { display: 'flex', gap: '15px', alignItems: 'center' };
const miniStat = (color) => ({
    background: '#fff', padding: '15px 25px', borderRadius: '24px', 
    border: `1px solid #f1f5f9`, borderTop: `5px solid ${color}`,
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', textAlign: 'center', minWidth: '150px'
});
const statLab = { display:'block', fontSize: '9px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1.5px', marginBottom:'8px', textTransform:'uppercase' };

const syncBadge = { display:'flex', alignItems:'center', background:'#fff', padding:'10px 18px', borderRadius:'14px', border:'1px solid #f1f5f9', color:'#cbd5e1', fontSize:'11px', fontWeight:'800' };

const tableCard = { background: '#fff', borderRadius: '40px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' };
const tableS = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth:'900px' };
const thRow = { backgroundColor: '#f8fafc', borderBottom: '1.5px solid #f1f5f9' };
const tdS = { padding: '22px 30px', fontSize: '14px', borderBottom: '1px solid #f8fafc' };
const trS = { transition: '0.2s' };

const prodInfo = { display: 'flex', alignItems: 'center', gap: '18px' };
const prodThumb = { width: '45px', height: '45px', borderRadius: '14px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#cbd5e1', border: '1px solid #f1f5f9' };
const pName = { fontWeight: '900', color: '#1e293b', fontSize: '15px' };
const pCat = { color: '#94a3b8', fontSize: '11px', fontWeight: '800', textTransform:'uppercase', letterSpacing:'0.5px' };

const shopN = { fontWeight: '800', color: '#0f172a', fontSize: '14px' };
const shopLoc = { fontSize: '11px', color: '#64748b', fontWeight:'700', marginTop: '3px', textTransform:'uppercase' };
const waLink = { fontSize: '10px', color: '#22c55e', fontWeight: '900', textDecoration: 'none', display:'inline-block', marginTop:'10px', letterSpacing:'0.5px' };

const stockVal = (qty) => ({
    fontWeight: '900', fontSize: '12px', marginBottom: '8px',
    color: qty <= 2 ? '#f43f5e' : '#f59e0b'
});

const stockBarBg = { height: '6px', width: '120px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', border:'1px solid #eef2f6' };
const stockBarFill = (qty) => ({
    height: '100%',
    width: `${Math.max((qty / 10) * 100, 8)}%`, 
    background: qty <= 2 ? '#f43f5e' : '#f59e0b',
    borderRadius: '10px', transition: '0.6s cubic-bezier(0.4, 0, 0.2, 1)'
});

const priorityBadge = (qty) => ({
    background: qty <= 2 ? '#fff1f2' : '#fffbeb',
    color: qty <= 2 ? '#f43f5e' : '#d97706',
    padding: '6px 14px', borderRadius: '10px', fontSize: '9px', fontWeight: '900', letterSpacing: '1px', textTransform:'uppercase'
});

const notifyBtn = (loading, color) => ({
    background: loading ? '#cbd5e1' : color,
    color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '12px',
    cursor: loading ? 'not-allowed' : 'pointer', fontSize: '10px', fontWeight: '900',
    transition: '0.3s', boxShadow: loading ? 'none' : `0 4px 12px \${color}33`, letterSpacing:'0.5px'
});

const errorArea = { padding:'50px', textAlign:'center', color:'#f43f5e', fontWeight:'800', background:'#fff1f2', fontSize:'14px' };
const noData = { padding: '120px 20px', textAlign: 'center', color: '#10b981', fontWeight: '900', fontSize: '18px', letterSpacing:'1px', textTransform:'uppercase' };
const loaderS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '60vh', background:'#f8fafc', gap:'20px' };
const footerAuditS = { marginTop: '30px', fontSize: '11px', color: '#cbd5e1', textAlign: 'left', fontWeight: '900', borderTop:'1.5px solid #f8fafc', paddingTop:'20px', textTransform:'uppercase', letterSpacing:'1px' };

export default LowStockAlerts;