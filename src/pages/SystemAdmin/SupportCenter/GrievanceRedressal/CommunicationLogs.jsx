import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../../services/api';
import { useBranding } from '../../../../context/BrandingContext';

const CommunicationLogs = () => {
    const { settings } = useBranding();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [channelFilter, setChannelFilter] = useState("All");
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

    // 1. 📡 Automatic Communication Synchronization Protocol (No Buttons)
    const fetchCommLogs = useCallback(async () => {
        try {
            // Initial sync shows loader, background refreshes are silent
            const res = await api.get('/admin/support/comm-logs');
            if (res.data.success) {
                setLogs(res.data.data || []);
            }
            setLastSynced(new Date().toLocaleTimeString());
            document.title = `Communication Logs | ${settings.siteName}`;
        } catch (err) { 
            console.error("Communication Registry Sync Failure.");
        } finally { 
            setLoading(false); 
        }
    }, [settings.siteName]);

    useEffect(() => {
        fetchCommLogs();
        
        // Auto-refresh when admin returns to this window (SaaS Audit Protocol)
        window.addEventListener('focus', fetchCommLogs);
        return () => window.removeEventListener('focus', fetchCommLogs);
    }, [fetchCommLogs]);

    // 2. 🔍 Discovery & Filtering Logic
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesChannel = channelFilter === "All" || log.channel === channelFilter;
            const searchStr = `${log.recipient} ${log.message} ${log.channel}`.toLowerCase();
            return matchesChannel && searchStr.includes(searchTerm.toLowerCase());
        });
    }, [logs, searchTerm, channelFilter]);

    // 3. 📈 Real-time Transmission Stats
    const stats = useMemo(() => ({
        sms: logs.filter(l => l.channel === 'SMS').length,
        email: logs.filter(l => l.channel === 'Email').length,
        broadcast: logs.filter(l => l.channel === 'Broadcast').length,
    }), [logs]);

    const themeColor = settings?.themeColor || '#0f172a';

    const getIcon = (channel) => {
        if(channel === 'SMS') return '📱';
        if(channel === 'Email') return '📧';
        if(channel === 'Broadcast') return '📢';
        return '💬';
    };

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Connecting to Communication Hub...</p>
        </div>
    );

    return (
        <div style={containerS}>
            {/* --- [A] COMMAND HEADER & ANALYTICS --- */}
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>📱 Global Communication Registry</h2>
                    <p style={subS}>Audit all outbound SMS, Email, and Push notifications dispatched via the {settings.siteName} cluster.</p>
                </div>
                <div style={syncBadge}>
                    <span className="pulse-dot"></span>
                    <small>Real-time Sync: {lastSynced}</small>
                </div>
            </div>

            {/* --- [B] TRANSMISSION METRICS --- */}
            <div style={statsRow}>
                <div style={statCard(themeColor)}>
                    <small style={statLab}>SMS GATEWAY</small>
                    <div style={statVal}>{stats.sms} Dispatched</div>
                </div>
                <div style={statCard(themeColor)}>
                    <small style={statLab}>EMAIL NODES</small>
                    <div style={statVal}>{stats.email} Sent</div>
                </div>
                <div style={statCard(themeColor)}>
                    <small style={statLab}>GLOBAL BROADCASTS</small>
                    <div style={statVal}>{stats.broadcast} Pushed</div>
                </div>
            </div>

            {/* --- [C] DISCOVERY TOOLBAR --- */}
            <div style={toolbarS}>
                <div style={searchBox}>
                    <span>🔍</span>
                    <input 
                        style={inS} 
                        placeholder="Filter by Recipient identity or Message content..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select style={selS} value={channelFilter} onChange={e => setChannelFilter(e.target.value)}>
                    <option value="All">All Channels</option>
                    <option value="SMS">SMS Gateway</option>
                    <option value="Email">Email SMTP</option>
                    <option value="Broadcast">Global Broadcast</option>
                </select>
            </div>

            {/* --- [D] MASTER LOG REGISTRY --- */}
            <div style={tableCard}>
                <div style={{overflowX: 'auto'}}>
                    <table style={tableS}>
                        <thead>
                            <tr style={thRow}>
                                <th style={tdS}>Event Timestamp</th>
                                <th style={tdS}>Channel Node</th>
                                <th style={tdS}>Authorized Recipient</th>
                                <th style={tdS}>Message Content</th>
                                <th style={tdS}>Transmission Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length === 0 ? (
                                <tr><td colSpan="5" style={noDataS}>Registry Clean: No communication logs discovered.</td></tr>
                            ) : (
                                [...filteredLogs].reverse().map(log => (
                                    <tr key={log._id} style={trS}>
                                        <td style={tdS}>
                                            <div style={timeS}>{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                            <small style={dateS}>{new Date(log.timestamp).toLocaleDateString('en-GB')}</small>
                                        </td>
                                        <td style={tdS}>
                                            <span style={channelBadge(themeColor)}>
                                                {getIcon(log.channel)} {log.channel.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={tdS}>
                                            <div style={recipientS}>{log.recipient}</div>
                                        </td>
                                        <td style={tdS}>
                                            <div style={msgS} title={log.message}>
                                                {log.message.length > 60 ? log.message.substring(0, 60) + "..." : log.message}
                                            </div>
                                        </td>
                                        <td style={tdS}>
                                            <span style={log.status === 'Sent' ? successBadge : failBadge}>
                                                ● {log.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={footerAuditS}>
                🛡️ All system communications are encrypted and logged for security compliance. Infrastructure Node: Stable.
            </div>

            <style>{`
                .spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; animation: pulse-anim 2s infinite; margin-right: 10px; }
                @keyframes pulse-anim { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Definitions ---

const containerS = { padding: '10px', minHeight: '100vh', animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerFlex = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'40px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin: 0, fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '900', color: '#0f172a', letterSpacing: '-1.5px' };
const subS = { margin:'5px 0 0', color:'#64748b', fontSize:'14px', fontWeight:'500' };

const syncBadge = { display:'flex', alignItems:'center', background:'#fff', padding:'10px 18px', borderRadius:'14px', border:'1px solid #f1f5f9', color:'#94a3b8', fontSize:'11px', fontWeight:'800' };

const statsRow = { display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)', gap: '20px', marginBottom: '35px' };
const statCard = (color) => ({ background: '#fff', padding: '25px', borderRadius: '28px', borderLeft: `6px solid ${color}`, boxShadow: '0 4px 15px rgba(0,0,0,0.02)', borderTop:'1px solid #f1f5f9', borderRight:'1px solid #f1f5f9', borderBottom:'1px solid #f1f5f9' });
const statLab = { fontSize: '9px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1.5px', textTransform:'uppercase' };
const statVal = { fontSize: '20px', fontWeight: '900', color: '#0f172a', marginTop: '8px' };

const toolbarS = { display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '30px', flexWrap: 'wrap', alignItems:'center' };
const searchBox = { position: 'relative', flex: 1, minWidth: '300px' };
const inS = { width: '100%', padding:'16px 20px 16px 50px', borderRadius:'18px', border:'1.5px solid #f1f5f9', background:'#fff', outline:'none', fontSize:'14px', fontWeight:'700', color:'#1e293b', boxSizing:'border-box', boxShadow:'0 4px 15px rgba(0,0,0,0.02)' };
const selS = { padding:'12px 25px', borderRadius:'16px', border:'1.5px solid #f1f5f9', background:'#fff', fontWeight:'800', fontSize:'12px', color:'#475569', outline:'none', cursor:'pointer' };

const tableCard = { background: '#fff', borderRadius: '40px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' };
const tableS = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' };
const thRow = { backgroundColor: '#f8fafc', borderBottom: '1.5px solid #f1f5f9' };
const tdS = { padding: '22px 30px', fontSize: '14px', borderBottom: '1px solid #f8fafc' };
const trS = { transition: '0.2s' };

const timeS = { fontWeight: '900', color: '#0f172a', fontSize: '13px' };
const dateS = { color: '#cbd5e1', fontSize: '10px', fontWeight: '800', textTransform:'uppercase', marginTop:'3px', display:'block' };

const channelBadge = (color) => ({ background: `${color}10`, color: color, padding: '6px 14px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', letterSpacing:'0.5px' });

const recipientS = { fontWeight: '800', color: '#1e293b', fontSize: '13px' };
const msgS = { color: '#64748b', fontSize: '13px', fontWeight: '500', maxWidth:'400px' };

const successBadge = { color: '#10b981', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', letterSpacing:'0.5px' };
const failBadge = { color: '#f43f5e', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', letterSpacing:'0.5px' };

const footerAuditS = { marginTop: '30px', fontSize: '10px', color: '#cbd5e1', textAlign: 'center', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' };
const noDataS = { padding: '100px 40px', textAlign: 'center', color: '#cbd5e1', fontSize: '18px', fontWeight: '800', textTransform:'uppercase', letterSpacing:'1px' };

const loaderS = { display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '60vh', background:'#f8fafc', gap:'20px' };

export default CommunicationLogs;