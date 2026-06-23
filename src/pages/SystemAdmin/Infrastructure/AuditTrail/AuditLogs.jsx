import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../../../services/api'; 
import * as XLSX from 'xlsx';
import { useBranding } from '../../../../context/BrandingContext'; // For White-labeling
import { toast } from 'react-toastify';

const AuditLogs = () => {
    const { settings } = useBranding();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [severityFilter, setSeverityFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState("");
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

    // 1. 📡 Automatic Security Synchronization Protocol (No Buttons)
    const fetchAuditLogs = useCallback(async () => {
        try {
            // Initial sync shows loader, background refreshes are silent
            const res = await api.get('/admin/support/logs'); 
            if (res.data.success) {
                setLogs(res.data.data || []);
            }
            setLastSynced(new Date().toLocaleTimeString());
            document.title = `Audit Trail | ${settings.siteName}`;
        } catch (err) {
            console.error("Audit Trail Protocol Interrupted.");
        } finally {
            setLoading(false);
        }
    }, [settings.siteName]);

    useEffect(() => {
        fetchAuditLogs();

        // Auto-refresh when admin returns to this window (SaaS Security Protocol)
        window.addEventListener('focus', fetchAuditLogs);
        return () => window.removeEventListener('focus', fetchAuditLogs);
    }, [fetchAuditLogs]);

    // 2. 🔍 Intelligence Filtering Logic
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = 
                (log.user || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.action || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.ip || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.target || "").toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesSeverity = severityFilter === "All" || log.status === severityFilter;
            const matchesDate = dateFilter === "" || (log.time && log.time.includes(dateFilter));

            return matchesSearch && matchesSeverity && matchesDate;
        });
    }, [searchTerm, severityFilter, dateFilter, logs]);

    // 3. 📈 Real-time Security Statistics
    const stats = useMemo(() => ({
        total: filteredLogs.length,
        critical: filteredLogs.filter(l => l.status === 'Critical').length,
        alerts: filteredLogs.filter(l => l.status === 'Alert').length
    }), [filteredLogs]);

    // 4. 📥 Professional Dataset Export Protocol
    const exportLogs = () => {
        if (filteredLogs.length === 0) return toast.warning("Export Aborted: No logs found.");

        const exportData = filteredLogs.map(l => ({
            "Event Timestamp": new Date(l.time).toLocaleString(),
            "Administrator": l.user,
            "System Role": l.role,
            "Action Performed": l.action,
            "Target Node": l.target,
            "Severity Level": l.status,
            "Origin IP": l.ip
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Security_Audit_Trail");
        XLSX.writeFile(wb, `${settings.siteName}_Audit_Registry_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success("Security Report Exported successfully! 📂");
    };

    const themeColor = settings?.themeColor || '#0f172a';

    const renderStatus = (s) => {
        const colors = {
            'Critical': { bg: '#fff1f2', text: '#f43f5e', border: '#fecaca' },
            'Alert': { bg: '#fffbeb', text: '#d97706', border: '#fef3c7' },
            'Success': { bg: '#ecfdf5', text: '#10b981', border: '#d1fae5' },
            'Routine': { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' }
        };
        const style = colors[s] || colors['Routine'];
        return (
            <span style={{ 
                background: style.bg, color: style.text, border: `1px solid ${style.border}`,
                padding: '5px 12px', borderRadius: '10px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing:'0.5px'
            }}>
                ● {s}
            </span>
        );
    };

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Accessing Secure Security Cluster...</p>
        </div>
    );

    return (
        <div style={containerS}>
            {/* --- [A] COMMAND HEADER --- */}
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>📜 System Security Audit Trail</h2>
                    <p style={subTitleS}>Immutable registry of administrative interactions within the {settings.siteName} network.</p>
                </div>
                <div style={headerActions}>
                    <div style={syncBadge}>
                        <span className="pulse-dot"></span>
                        <small>Auto-Sync: {lastSynced}</small>
                    </div>
                    <button onClick={exportLogs} style={exportBtn(themeColor)}>📥 Export Dataset</button>
                </div>
            </div>

            {/* --- [B] SECURITY METRICS --- */}
            <div style={statsGrid}>
                <div style={statCard(themeColor)}>
                    <small style={statLab}>TOTAL EVENTS</small>
                    <h2 style={statValS}>{stats.total} Logs</h2>
                    <div style={trendS}>Stable System Stream</div>
                </div>
                <div style={statCard('#f43f5e')}>
                    <small style={statLab}>CRITICAL OVERRIDES</small>
                    <h2 style={{...statValS, color:'#f43f5e'}}>{stats.critical} Alerts</h2>
                    <div style={{...trendS, color:'#f43f5e'}}>Immediate Review Required</div>
                </div>
                <div style={statCard('#d97706')}>
                    <small style={statLab}>SYSTEM ALERTS</small>
                    <h2 style={{...statValS, color:'#d97706'}}>{stats.alerts} Active</h2>
                    <div style={{...trendS, color:'#d97706'}}>Audit Protocol Notified</div>
                </div>
            </div>

            {/* --- [C] ADVANCED DISCOVERY TOOLBAR --- */}
            <div style={toolbarS}>
                <div style={searchBox}>
                    <span>🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search user, action, target hub or IP address..." 
                        style={inSearch}
                        value={searchTerm}
                        onChange={(e)=>setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={filterClusterS}>
                    <input 
                        type="date" 
                        style={dateInputS} 
                        value={dateFilter} 
                        onChange={(e)=>setDateFilter(e.target.value)} 
                    />
                    <select style={selectS} value={severityFilter} onChange={(e)=>setSeverityFilter(e.target.value)}>
                        <option value="All">All Severity Levels</option>
                        <option value="Critical">Critical Only</option>
                        <option value="Alert">Alerts Only</option>
                        <option value="Success">Success Records</option>
                        <option value="Routine">Routine Operations</option>
                    </select>
                </div>
            </div>

            {/* --- [D] IMMUTABLE LOG REGISTRY --- */}
            <div style={tableCard}>
                <div style={{overflowX: 'auto'}}>
                    <table style={tableS}>
                        <thead>
                            <tr style={thRow}>
                                <th style={tdS}>Session Timestamp</th>
                                <th style={tdS}>Authorized Identity</th>
                                <th style={tdS}>Action Protocol</th>
                                <th style={tdS}>Target Node</th>
                                <th style={tdS}>Status</th>
                                <th style={tdS}>Origin Node (IP)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length === 0 ? (
                                <tr><td colSpan="6" style={emptyS}>No security logs match the current query in the registry.</td></tr>
                            ) : (
                                [...filteredLogs].reverse().map(log => (
                                    <tr key={log.id || log._id} style={trS}>
                                        <td style={tdS}>
                                            <div style={timeS}>{new Date(log.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                            <small style={refS}>{new Date(log.time).toLocaleDateString('en-GB')}</small>
                                        </td>
                                        <td style={tdS}>
                                            <div style={userRow}>
                                                <div style={avatar(themeColor, log.role)}>{(log.user || "A").charAt(0)}</div>
                                                <div>
                                                    <div style={userName}>{log.user}</div>
                                                    <small style={userRole}>{log.role}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tdS}>
                                            <span style={actionTag}>{log.action}</span>
                                        </td>
                                        <td style={tdS}>
                                            <code style={targetCode}>{log.target}</code>
                                        </td>
                                        <td style={tdS}>{renderStatus(log.status)}</td>
                                        <td style={tdS}>
                                            <div style={ipBadge}>{log.ip}</div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={disclaimerBox(themeColor)}>
                🛡️ <b>Cryptographic Integrity Handshake Active:</b> All session logs are digitally signed by {settings.siteName}. 
                Any unauthorized tampering will trigger a <b>Global System Lockout</b> and notification to the Master Registry.
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
const titleS = { margin: 0, fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '900', color: '#0f172a', letterSpacing: '-1.5px' };
const subTitleS = { margin: '5px 0 0', color: '#64748b', fontSize: '14px', fontWeight: '500' };

const headerActions = { display: 'flex', gap: '15px', alignItems:'center' };
const syncBadge = { display:'flex', alignItems:'center', background:'#fff', padding:'10px 18px', borderRadius:'14px', border:'1px solid #f1f5f9', color:'#94a3b8', fontSize:'11px', fontWeight:'800' };
const exportBtn = (color) => ({ background: color, color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', fontSize: '12px', boxShadow: `0 8px 15px ${color}33`, transition:'0.3s' });

const statsGrid = { display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' };
const statCard = (col) => ({ background: '#fff', padding: '30px', borderRadius: '40px', borderLeft: `6px solid ${col}`, boxShadow: '0 10px 30px rgba(0,0,0,0.02)', borderTop:'1px solid #f1f5f9', borderRight:'1px solid #f1f5f9', borderBottom:'1px solid #f1f5f9' });
const statLab = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1.5px', textTransform:'uppercase' };
const statValS = { margin: '12px 0 6px 0', fontSize: '28px', fontWeight: '900', color: '#0f172a', letterSpacing:'-1px' };
const trendS = { fontSize: '11px', color: '#cbd5e1', fontWeight: '700' };

const toolbarS = { display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '30px', background: '#fff', padding: '15px', borderRadius: '24px', border: '1px solid #f1f5f9', flexWrap:'wrap', alignItems:'center' };
const searchBox = { flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', background:'#f8fafc', padding:'0 15px', borderRadius:'16px', border:'1px solid #e2e8f0' };
const inSearch = { border: 'none', width: '100%', padding: '14px 0', outline: 'none', fontSize: '14px', background: 'transparent', fontWeight:'700', color:'#1e293b' };
const filterClusterS = { display:'flex', gap:'12px', alignItems:'center' };
const dateInputS = { padding: '12px 15px', borderRadius: '14px', border: '1.5px solid #f1f5f9', color: '#475569', fontWeight: '800', outline:'none', fontSize:'12px' };
const selectS = { padding: '12px 20px', borderRadius: '14px', border: '1.5px solid #f1f5f9', background: '#fff', fontWeight: '800', color: '#475569', cursor: 'pointer', outline:'none', fontSize:'12px' };

const tableCard = { background: '#fff', borderRadius: '40px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' };
const tableS = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' };
const thRow = { backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' };
const tdS = { padding: '22px 30px', fontSize: '14px', borderBottom: '1px solid #f8fafc' };
const trS = { transition: '0.2s' };

const timeS = { fontWeight: '900', color: '#0f172a', fontSize: '13px' };
const refS = { color: '#cbd5e1', fontSize: '10px', fontWeight: '800', textTransform:'uppercase', marginTop:'3px', display:'block' };

const userRow = { display: 'flex', alignItems: 'center', gap: '15px' };
const avatar = (color, role) => ({
    width: '40px', height: '40px', borderRadius: '14px',
    background: role?.includes('Admin') ? `${color}15` : '#f1f5f9',
    color: role?.includes('Admin') ? color : '#64748b',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '16px', border:`1px solid ${color}10`
});
const userName = { fontWeight: '800', color: '#1e293b', fontSize: '14px' };
const userRole = { color: '#94a3b8', fontSize: '10px', fontWeight: '800', textTransform:'uppercase', letterSpacing:'0.5px' };

const actionTag = { background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', color: '#475569', border:'1px solid #f1f5f9', letterSpacing:'0.5px' };
const targetCode = { color: '#3b82f6', background: '#eff6ff', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', fontFamily: "'JetBrains Mono', monospace" };
const ipBadge = { color: '#cbd5e1', fontSize: '11px', fontWeight: '800', fontFamily: "'JetBrains Mono', monospace" };

const disclaimerBox = (color) => ({ marginTop: '40px', padding: '25px', background: '#0f172a', borderRadius: '25px', color: '#64748b', fontSize: '12px', textAlign: 'center', lineHeight: '1.8', borderLeft:`8px solid ${color}` });
const emptyS = { padding: '120px 20px', textAlign: 'center', color: '#cbd5e1', fontSize: '18px', fontWeight: '800', textTransform:'uppercase', letterSpacing:'1px' };
const loaderS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap:'20px', background:'#f8fafc' };

export default AuditLogs;