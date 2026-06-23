import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../../../services/api'; 
import { useBranding } from '../../../../context/BrandingContext';
import { toast } from 'react-toastify';

const PriceControl = () => {
    const { settings } = useBranding();
    const [regulations, setRegulations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

    // 1. 📡 Automatic Price Registry Synchronization (No Buttons)
    const fetchRegulations = useCallback(async () => {
        try {
            // Background update is silent, initial load shows high-end spinner
            const res = await api.get('/admin/inventory/price-regulations');
            if (res.data.success) {
                setRegulations(res.data.data || []);
                setError(null);
            }
            setLastSynced(new Date().toLocaleTimeString());
            document.title = `Price Protocol | ${settings.siteName}`;
        } catch (err) {
            console.error("Price Registry Handshake Failure.");
            setError("Connectivity Alert: Price protocol node unreachable.");
        } finally {
            setLoading(false);
        }
    }, [settings.siteName]);

    useEffect(() => {
        fetchRegulations();
        
        // Auto-refresh when admin returns to this window (SaaS Protocol)
        window.addEventListener('focus', fetchRegulations);
        return () => window.removeEventListener('focus', fetchRegulations);
    }, [fetchRegulations]);

    // 2. 📝 Input Modulation Handler
    const handleInputChange = (id, field, value) => {
        setRegulations(prev => prev.map(item => 
            item._id === id ? { ...item, [field]: Number(value) } : item
        ));
    };

    // 3. 🌍 Global Ecosystem Synchronization (Bulk Update)
    const handleGlobalSync = async () => {
        if (!window.confirm("CRITICAL PROTOCOL: Push updated price caps to all regional merchant nodes? This action is immutable.")) return;

        setIsSyncing(true);
        try {
            await api.put('/admin/inventory/price-update-bulk', { data: regulations });
            toast.success("Ecosystem Synchronized: Global Price Protocol Enforced! ✅");
            fetchRegulations();
        } catch (err) {
            toast.error("Handshake Failed: Cryptographic sync error.");
        } finally {
            setIsSyncing(false);
        }
    };

    // 4. 🔒 Specific Node Lockout Protocol
    const handleLock = async (item) => {
        try {
            await api.post(`/admin/inventory/price-lock`, { productId: item._id });
            toast.info(`Node Locked: Price protocol strictly enforced for ${item.name}.`);
        } catch (err) {
            toast.error("Action Interrupted.");
        }
    };

    // 5. 🔍 Intelligence Engine: Search & Filtering
    const filteredRegs = useMemo(() => {
        return regulations.filter(r => 
            (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
            (r.generatedId || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [regulations, searchTerm]);

    const getStatus = (variance) => {
        if (variance > 10) return { label: 'VOLATILE', color: '#f43f5e', bg: '#fff1f2' };
        if (variance > 5) return { label: 'WARNING', color: '#d97706', bg: '#fffbeb' };
        return { label: 'STABLE', color: '#10b981', bg: '#ecfdf5' };
    };

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Auditing Global Market Pulse...</p>
        </div>
    );

    return (
        <div style={containerS}>
            {/* --- [A] COMMAND HEADER & ANALYTICS --- */}
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>⚖️ Strategic Price Regulation</h2>
                    <p style={subTitleS}>Enterprise control center for market stability and anti-inflation protocols within {settings.siteName}.</p>
                </div>
                <div style={statsRow}>
                    <div style={statItem(themeColor)}>
                        <small style={statLab}>MARKET STABILITY</small>
                        <b style={{color:'#10b981', fontSize:'22px'}}>94.2%</b>
                    </div>
                    <div style={statItem(themeColor)}>
                        <small style={statLab}>REGULATED SKUs</small>
                        <b style={{fontSize:'22px'}}>{regulations.length} Nodes</b>
                    </div>
                    <div style={syncBadge}>
                        <span className="pulse-dot"></span>
                        <small>{lastSynced}</small>
                    </div>
                </div>
            </div>

            {/* --- [B] DISCOVERY & DEPLOYMENT TOOLBAR --- */}
            <div style={toolbarS}>
                <div style={searchBox}>
                    <span style={searchIcon}>🔍</span>
                    <input 
                        style={searchIn} 
                        placeholder="Search by Commodity Identity or Registry SKU..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    style={isSyncing ? btnDisabledS : btnGlobal(themeColor)} 
                    onClick={handleGlobalSync} 
                    disabled={isSyncing}
                >
                    {isSyncing ? '📡 SYNCHRONIZING CLUSTER...' : '🌍 DEPLOY GLOBAL SYNC'}
                </button>
            </div>

            {/* --- [C] PRICE REGULATION REGISTRY --- */}
            <div style={tableCard}>
                {error ? (
                    <div style={errorArea}>{error}</div>
                ) : (
                    <div style={{overflowX: 'auto'}}>
                        <table style={tableS}>
                            <thead>
                                <tr style={thRow}>
                                    <th style={tdS}>Commodity Identity</th>
                                    <th style={tdS}>Market Pulse (Avg)</th>
                                    <th style={tdS}>Min Floor (₹)</th>
                                    <th style={tdS}>Max Cap (₹)</th>
                                    <th style={tdS}>Variance %</th>
                                    <th style={tdS}>Node Status</th>
                                    <th style={tdS}>Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRegs.length === 0 ? (
                                    <tr><td colSpan="7" style={noData}>Registry Clean: No regulated assets found.</td></tr>
                                ) : (
                                    filteredRegs.map((r) => {
                                        const status = getStatus(r.variance || 0);
                                        return (
                                            <tr key={r._id} style={trS}>
                                                <td style={tdS}>
                                                    <div style={pName}>{r.name}</div>
                                                    <small style={pSku}>SKU_ID: {r.generatedId?.toUpperCase() || 'RKD-NODE'}</small>
                                                </td>
                                                <td style={tdS}>
                                                    <div style={avgP}>₹{(r.price || 0).toLocaleString()}</div>
                                                </td>
                                                <td style={tdS}>
                                                    <input 
                                                        type="number" 
                                                        value={r.minFloor || 0} 
                                                        onChange={(e) => handleInputChange(r._id, 'minFloor', e.target.value)}
                                                        style={tableIn} 
                                                    />
                                                </td>
                                                <td style={tdS}>
                                                    <input 
                                                        type="number" 
                                                        value={r.maxCap || 0} 
                                                        onChange={(e) => handleInputChange(r._id, 'maxCap', e.target.value)}
                                                        style={tableIn} 
                                                    />
                                                </td>
                                                <td style={tdS}>
                                                    <div style={vRow}>
                                                        <span style={{fontSize:'11px', fontWeight:'900', color: status.color}}>{r.variance || 0}%</span>
                                                        <div style={vBarBg}>
                                                            <div style={vBarFill(r.variance || 0, status.color)}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={tdS}>
                                                    <span style={{...statusBadge, background: status.bg, color: status.color}}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td style={tdS}>
                                                    <button style={lockBtn(themeColor)} onClick={() => handleLock(r)}>
                                                        Lock Node
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <div style={disclaimerS}>
                🛡️ <b>Operational Protocol:</b> Minimum Floor and Maximum Caps are enforced at the Edge-Point of Sale. Merchants are restricted from bypassing these parameters.
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
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '45px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin: 0, fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '900', color: '#0f172a', letterSpacing:'-1.5px' };
const subTitleS = { margin: '8px 0 0', color: '#64748b', fontSize: '14px', fontWeight: '500' };

const statsRow = { display: 'flex', gap: '15px', alignItems: 'center' };
const statItem = (color) => ({ background: '#fff', padding: '15px 25px', borderRadius: '24px', borderLeft: `6px solid ${color}`, textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', borderTop:'1px solid #f1f5f9', borderRight:'1px solid #f1f5f9', borderBottom:'1px solid #f1f5f9' });
const statLab = { display:'block', fontSize: '9px', fontWeight: '900', color: '#cbd5e1', letterSpacing: '1px', marginBottom:'5px', textTransform:'uppercase' };
const syncBadge = { display:'flex', alignItems:'center', background:'#fff', padding:'10px 18px', borderRadius:'14px', border:'1px solid #f1f5f9', color:'#94a3b8', fontSize:'11px', fontWeight:'800' };

const toolbarS = { display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '35px', background: '#fff', padding: '15px', borderRadius: '24px', border: '1px solid #f1f5f9', flexWrap:'wrap', alignItems:'center' };
const searchBox = { position: 'relative', flex: 1, minWidth: '300px' };
const searchIn = { width: '100%', padding: '14px 15px 14px 50px', borderRadius: '16px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '14px', background: '#f8fafc', fontWeight:'700', boxSizing:'border-box', color:'#1e293b' };
const searchIcon = { position: 'absolute', left: '18px', top: '16px', color: '#94a3b8', fontSize: '18px' };
const btnGlobal = (color) => ({ background: color, color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', fontSize: '13px', boxShadow:`0 8px 15px ${color}33`, transition:'0.3s' });
const btnDisabledS = { ...btnGlobal('#cbd5e1'), background:'#cbd5e1', cursor:'not-allowed', boxShadow:'none' };

const tableCard = { background: '#fff', borderRadius: '40px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' };
const tableS = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth:'1000px' };
const thRow = { backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' };
const tdS = { padding: '22px 25px', fontSize: '14px', borderBottom: '1px solid #f8fafc' };
const trS = { transition: '0.2s' };

const pName = { fontWeight: '900', color: '#1e293b', fontSize: '15px' };
const pSku = { color: '#cbd5e1', fontSize: '10px', fontWeight: '800', textTransform:'uppercase', marginTop:'3px', display:'block' };
const avgP = { fontWeight: '900', color: '#0f172a' };

const tableIn = { 
    width: '100px', padding: '10px 12px', borderRadius: '12px', 
    border: '2px solid #f1f5f9', textAlign: 'center', fontWeight: '900',
    color: '#1e293b', outline: 'none', background:'#f8fafc', transition:'0.3s'
};

const vRow = { display: 'flex', flexDirection: 'column', gap: '8px' };
const vBarBg = { height: '6px', width: '90px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', border:'1px solid #eef2f6' };
const vBarFill = (v, col) => ({
    height: '100%', width: `${Math.min(v * 4, 100)}%`,
    background: col, borderRadius: '10px', transition: '0.6s cubic-bezier(0.4, 0, 0.2, 1)'
});

const statusBadge = { padding: '6px 14px', borderRadius: '10px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' };

const lockBtn = (color) => ({ background: `${color}10`, color: color, border: 'none', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontSize: '11px', fontWeight: '900', textTransform:'uppercase', letterSpacing:'0.5px' });

const disclaimerS = { marginTop:'40px', fontSize:'11px', color:'#cbd5e1', textAlign:'center', fontWeight:'800', textTransform:'uppercase', letterSpacing:'1px' };
const noData = { padding: '120px 20px', textAlign: 'center', color: '#cbd5e1', fontSize: '18px', fontWeight: '800', textTransform:'uppercase', letterSpacing:'1px' };
const errorArea = { padding: '50px', textAlign: 'center', color: '#f43f5e', fontWeight: '800', background:'#fff1f2', fontSize:'14px' };
const loaderS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '60vh', background:'#f8fafc', gap:'20px' };

export default PriceControl;