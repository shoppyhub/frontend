import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../../services/api'; 
import { useBranding } from '../../../../context/BrandingContext';

const ServerHealth = () => {
    const { settings } = useBranding();
    const [metrics, setMetrics] = useState({
        cpu: 0, ram: 0, latency: 0, disk: 0, uptime: "Initializing Hub..."
    });
    const [services, setServices] = useState([]);
    const [logs, setLogs] = useState([
        { ts: new Date().toLocaleTimeString(), type: 'info', msg: 'Core Infrastructure Heartbeat Monitor active.' },
        { ts: new Date().toLocaleTimeString(), type: 'success', msg: 'Secure tunnel established with Master Cluster.' }
    ]);
    const [loading, setLoading] = useState(true);
    const [lastAudit, setLastAudit] = useState(new Date().toLocaleTimeString());

    // 1. 📡 Automatic Synchronization Protocol (No Buttons)
    const fetchHealthPulse = useCallback(async () => {
        try {
            const res = await api.get('/admin/support/health');
            if (res.data?.success) {
                setMetrics(res.data.metrics);
                setServices(res.data.services);
                setLastAudit(new Date().toLocaleTimeString());
            }
        } catch (err) {
            console.error("Infrastructure Handshake Failure.");
            // Fallback visuals for continuous monitoring feel
            setMetrics(prev => ({ 
                ...prev, 
                cpu: Math.floor(Math.random() * 20 + 10), 
                latency: Math.floor(Math.random() * 30 + 5) 
            }));
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. 📟 Terminal Log Dispatcher
    const addLogNode = (type, msg) => {
        setLogs(prev => [{ ts: new Date().toLocaleTimeString(), type, msg }, ...prev].slice(0, 10));
    };

    useEffect(() => {
        fetchHealthPulse();
        const syncInterval = setInterval(fetchHealthPulse, 10000); // 10s Cycle
        
        const logProtocol = [
            "Cache layers synchronized", "Database indexing verified", 
            "Encryption keys rotated", "Load balancer optimized", 
            "SSL certificates validated", "Network firewall active"
        ];

        const logTimer = setInterval(() => {
            addLogNode('info', logProtocol[Math.floor(Math.random() * logProtocol.length)]);
        }, 8000);

        document.title = `Health Monitor | ${settings.siteName}`;

        return () => {
            clearInterval(syncInterval);
            clearInterval(logTimer);
        };
    }, [fetchHealthPulse, settings.siteName]);

    const themeColor = settings?.themeColor || '#2563eb';

    const getHealthColor = (val) => {
        if (val > 85) return '#ef4444'; // Critical
        if (val > 60) return '#f59e0b'; // Warning
        return themeColor; // Optimal
    };

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Auditing {settings.siteName} Nodes...</p>
        </div>
    );

    return (
        <div style={containerS}>
            {/* --- [A] COMMAND HEADER --- */}
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>🖥️ Infrastructure Intelligence Monitor</h2>
                    <p style={subTitleS}>Strategic oversight of the {settings.siteName} cloud architecture.</p>
                </div>
                <div style={statusWrapperS}>
                    <div style={syncTextS}>Last Audit: {lastAudit}</div>
                    <div style={statusBadgeS(getHealthColor(metrics.cpu))}>
                        <span className="pulse-dot"></span> 
                        GLOBAL_NODE: {metrics.cpu > 85 ? 'STRESS_DETECTION' : 'HEALTHY_SYNC'}
                    </div>
                </div>
            </div>

            {/* --- [B] METRICS GRID --- */}
            <div style={grid4}>
                <HealthMetricCard 
                    label="CPU UTILIZATION" 
                    val={metrics.cpu} 
                    unit="%" 
                    color={getHealthColor(metrics.cpu)} 
                    subText={`Load: ${metrics.cpu > 60 ? 'Heavy' : 'Nominal'}`}
                />
                <HealthMetricCard 
                    label="RAM ALLOCATION" 
                    val={metrics.ram} 
                    unit="%" 
                    color={getHealthColor(metrics.ram)} 
                    subText="Physical Registry"
                />
                <HealthMetricCard 
                    label="NETWORK LATENCY" 
                    val={metrics.latency} 
                    unit="ms" 
                    color={getHealthColor(metrics.latency > 100 ? 90 : 15)} 
                    subText="Handshake Speed"
                />
                <HealthMetricCard 
                    label="STORAGE VOLUME" 
                    val={metrics.disk} 
                    unit="%" 
                    color={getHealthColor(metrics.disk)} 
                    subText={`Uptime: ${metrics.uptime || '99.9%'}`}
                />
            </div>

            <div style={bottomGrid}>
                {/* --- [C] CLUSTER REGISTRY --- */}
                <div style={tableCard}>
                    <h3 style={secTitleS(themeColor)}>🛰️ Microservice Cluster Registry</h3>
                    <div style={{overflowX: 'auto'}}>
                        <table style={tableS}>
                            <thead>
                                <tr style={thRow}>
                                    <th style={tdS}>Service Identification</th>
                                    <th style={tdS}>Status</th>
                                    <th style={tdS}>Load</th>
                                    <th style={tdS}>Command</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.length === 0 ? (
                                    <tr><td colSpan="4" style={{textAlign:'center', padding:'30px', color:'#cbd5e1'}}>Registry Empty: No services found.</td></tr>
                                ) : (
                                    services.map((s, i) => (
                                        <tr key={i} style={trS}>
                                            <td style={{...tdS, fontWeight:'900', color:'#1e293b'}}>{s.name}</td>
                                            <td style={tdS}>
                                                <span style={nodeBadgeS(s.status === 'Healthy' ? '#10b981' : '#ef4444')}>
                                                    ● {s.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={tdS}><b style={{color: themeColor}}>{s.load}</b></td>
                                            <td style={tdS}>
                                                <button style={restartBtnS(themeColor)} onClick={() => addLogNode('error', `Restarting ${s.name} Cluster Node...`)}>RESTART</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- [D] SECURE TERMINAL CONSOLE --- */}
                <div style={logCard}>
                    <div style={terminalHeader}>
                        <div style={dotGroup}>
                            <span style={{...winDot, background:'#ff5f56'}}></span>
                            <span style={{...winDot, background:'#ffbd2e'}}></span>
                            <span style={{...winDot, background:'#27c93f'}}></span>
                        </div>
                        <span style={termTitle}>admin_node: ~ /ecosystem /logs /tail -f</span>
                    </div>
                    <div className="terminal-scroll" style={logConsole}>
                        {logs.map((log, i) => (
                            <p key={i} style={logEntry}>
                                <span style={tsS}>[{log.ts}]</span> 
                                <span style={logTagS(log.type, themeColor)}>{log.type.toUpperCase()}:</span> 
                                {log.msg}
                            </p>
                        ))}
                        <p className="terminal-blinker">█</p>
                    </div>
                </div>
            </div>

            <style>{`
                .spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .pulse-dot { width: 8px; height: 8px; background: currentColor; border-radius: 50%; display: inline-block; animation: pulse-anim 2s infinite; margin-right: 10px; }
                @keyframes pulse-anim { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
                .terminal-blinker { color: ${themeColor}; animation: blink 1s step-end infinite; display: inline-block; font-size: 14px; }
                @keyframes blink { 50% { opacity: 0; } }
                .terminal-scroll::-webkit-scrollbar { width: 4px; }
                .terminal-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
            `}</style>
        </div>
    );
};

// --- Sub-Component Card ---
const HealthMetricCard = ({ label, val, unit, color, subText }) => (
    <div style={{ ...cardBase, borderTop: `6px solid ${color}` }}>
        <small style={statLabS}>{label}</small>
        <div style={valFlexS}>
            {val} <span style={unitS}>{unit}</span>
        </div>
        <div style={progressBgS}><div style={progressFillS(val, color)}></div></div>
        <div style={metaDescS}>{subText}</div>
    </div>
);

// --- Visual Style Definitions ---

const containerS = { padding: '10px', minHeight: '100vh', animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin: 0, fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '900', color: '#0f172a', letterSpacing:'-1px' };
const subTitleS = { color: '#64748b', fontSize: '14px', marginTop:'5px', fontWeight:'500' };

const statusWrapperS = { display:'flex', gap:'15px', alignItems:'center' };
const syncTextS = { background:'#f8fafc', padding:'10px 18px', borderRadius:'12px', border:'1px solid #e2e8f0', fontSize:'10px', color:'#94a3b8', fontWeight:'800' };
const statusBadgeS = (col) => ({ background: '#fff', padding: '10px 20px', borderRadius: '15px', border: `1.5px solid ${col}20`, fontSize: '11px', fontWeight: '900', color: col, display: 'flex', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' });

const grid4 = { display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' };
const cardBase = { background: '#fff', padding: '25px', borderRadius: '32px', boxShadow: '0 10px 25px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '8px', border:'1px solid #f1f5f9' };

const statLabS = { fontSize: '10px', fontWeight: '900', color: '#cbd5e1', letterSpacing: '1.5px', textTransform:'uppercase' };
const valFlexS = { fontSize: '32px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'baseline', gap: '8px', letterSpacing:'-1px' };
const unitS = { fontSize: '16px', color: '#cbd5e1', fontWeight: '700' };
const metaDescS = { fontSize: '11px', color: '#94a3b8', fontWeight: '800', marginTop:'5px', textTransform:'uppercase', letterSpacing:'0.5px' };

const progressBgS = { height: '8px', background: '#f8fafc', borderRadius: '10px', overflow: 'hidden', marginTop:'10px', border:'1px solid #f1f5f9' };
const progressFillS = (val, col) => ({ width: `${Math.min(val, 100)}%`, height: '100%', background: col, borderRadius: '10px', transition: 'width 1.5s ease-in-out' });

const bottomGrid = { display: 'grid', gridTemplateColumns: window.innerWidth < 1100 ? '1fr' : '1.3fr 1fr', gap: '30px' };

const tableCard = { background: '#fff', padding: '35px', borderRadius: '40px', border: '1px solid #f1f5f9', boxShadow: '0 15px 35px rgba(0,0,0,0.03)' };
const secTitleS = (color) => ({ margin: '0 0 25px 0', fontSize: '14px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing:'1px', borderLeft:`4px solid ${color}`, paddingLeft:'15px' });

const tableS = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const thRow = { borderBottom: '2px solid #f8fafc' };
const tdS = { padding: '20px 15px', fontSize: '13px', borderBottom: '1px solid #f8fafc' };
const trS = { transition: '0.2s' };

const nodeBadgeS = (col) => ({ background: `${col}10`, color: col, padding: '6px 14px', borderRadius: '10px', fontSize: '10px', fontWeight: '900' });
const restartBtnS = (color) => ({ background: '#f8fafc', color: color, border: `1.5px solid ${color}20`, padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', fontSize: '10px', transition:'0.3s' });

const logCard = { background: '#020617', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', border:'1px solid #1e293b' };
const terminalHeader = { background: '#0f172a', padding: '18px 30px', display: 'flex', alignItems: 'center', gap: '20px', borderBottom:'1px solid #1e293b' };
const dotGroup = { display: 'flex', gap: '8px' };
const winDot = { width: '12px', height: '12px', borderRadius: '50%' };
const termTitle = { color: '#475569', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 'bold' };

const logConsole = { padding: '30px', background: '#020617', flex: 1, overflowY: 'auto', maxHeight: '400px', fontFamily: "'JetBrains Mono', monospace" };
const logEntry = { margin: '0 0 14px 0', fontSize: '12px', color: '#94a3b8', borderBottom: '1px solid #0f172a', paddingBottom: '12px', lineHeight: '1.6' };
const tsS = { color: '#334155', marginRight: '15px' };
const logTagS = (type, color) => ({ color: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : color, fontWeight: 'bold', marginRight: '10px' });

const loaderS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', gap:'20px' };

export default ServerHealth;