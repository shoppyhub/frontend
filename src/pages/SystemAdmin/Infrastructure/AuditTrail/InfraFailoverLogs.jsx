import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../../services/api';
import { useBranding } from '../../../../context/BrandingContext';
import { toast } from 'react-toastify';

/**
 * RKD_MART - INFRASTRUCTURE FAILOVER AUDIT TRAIL
 * यह पेज सिस्टम के ऑटो-स्विचिंग इतिहास को टाइमलाइन के रूप में दिखाता है।
 */

const InfraFailoverLogs = () => {
    const { settings } = useBranding();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    // 1. 📡 डेटा लोड (Failover Telemetry)
    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/infra/failover-logs');
            if (res.data.success) {
                setLogs(res.data.data || []);
            }
        } catch (err) {
            toast.error("Failed to fetch telemetry logs.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // 2. 📊 इंटेलिजेंस: रीयल-टाइम स्टेट्स की गणना
    const stats = useMemo(() => {
        const total = logs.length;
        const critical = logs.filter(l => l.severity === 'critical').length;
        const reliability = total === 0 ? 100 : Math.max(0, 100 - (critical * 5));
        return { total, critical, reliability };
    }, [logs]);

    // 3. 🔍 फ़िल्टरिंग लॉजिक
    const filteredLogs = useMemo(() => {
        if (filter === 'all') return logs;
        return logs.filter(l => l.severity === filter);
    }, [logs, filter]);

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return <div style={loaderS}>DECRYPTING FAILOVER TELEMETRY...</div>;

    return (
        <div style={containerS}>
            {/* --- [A] AUDIT HEADER --- */}
            <div style={headerRowS}>
                <div>
                    <h2 style={titleS}>📜 Infrastructure Failover Audit</h2>
                    <p style={subS}>Comprehensive timeline of automated node transitions and security alerts.</p>
                </div>
                <div style={statsRowS}>
                    <div style={statItemS}>
                        <small>INCIDENTS</small>
                        <b>{stats.total}</b>
                    </div>
                    <div style={statItemS}>
                        <small>CRITICAL</small>
                        <b style={{color:'#ef4444'}}>{stats.critical}</b>
                    </div>
                    <div style={statItemS}>
                        <small>RELIABILITY</small>
                        <b style={{color:'#10b981'}}>{stats.reliability}%</b>
                    </div>
                </div>
            </div>

            {/* --- [B] CONTROL BAR --- */}
            <div style={toolbarS}>
                <div style={{display:'flex', gap:'10px'}}>
                    <button onClick={() => setFilter('all')} style={filterBtnS(filter === 'all', '#64748b')}>ALL LOGS</button>
                    <button onClick={() => setFilter('critical')} style={filterBtnS(filter === 'critical', '#ef4444')}>CRITICAL ONLY</button>
                </div>
                <button onClick={fetchLogs} style={refreshBtnS}>🔄 RE-SYNC</button>
            </div>

            {/* --- [C] TIMELINE VIEW --- */}
            <div style={timelineWrapperS}>
                {filteredLogs.length === 0 ? (
                    <div style={emptyS}>Registry Clean: No failover incidents recorded.</div>
                ) : (
                    filteredLogs.map((log, index) => (
                        <div key={log._id} style={timelineItemS}>
                            {/* Left: Time & Icon */}
                            <div style={timeColS}>
                                <div style={timeS}>{new Date(log.createdAt).toLocaleTimeString()}</div>
                                <div style={dateS}>{new Date(log.createdAt).toLocaleDateString()}</div>
                                <div style={lineS(index === filteredLogs.length - 1)}>
                                    <div style={dotS(log.severity)}></div>
                                </div>
                            </div>

                            {/* Right: Content Card */}
                            <div style={logCardS(log.severity)}>
                                <div style={cardHeaderS}>
                                    <span style={typeTagS(log.severity)}>{log.actionType}</span>
                                    <span style={targetTagS}>{log.targetName}</span>
                                </div>
                                <h4 style={logDescS}>{log.actionDescription}</h4>
                                {log.remarks && <div style={remarksBoxS}>REMARKS: {log.remarks}</div>}
                                
                                <div style={metaFooterS}>
                                    <span>IP: {log.ipAddress || 'Internal_Core'}</span>
                                    <span>NODE_ID: {log.targetId?.slice(-6).toUpperCase()}</span>
                                    <span style={{color: log.status === 'Success' ? '#10b981' : '#f59e0b'}}>
                                        {log.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- Strategic SaaS Styles ---
const containerS = { padding: '10px', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background:'#f8fafc', animation:'fadeIn 0.5s ease' };
const headerRowS = { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'40px' };
const titleS = { margin:0, fontSize:'24px', fontWeight:'900', color:'#0f172a' };
const subS = { margin:'5px 0 0', color:'#64748b', fontSize:'13px', fontWeight:'500' };

const statsRowS = { display:'flex', background:'#fff', borderRadius:'18px', border:'1px solid #f1f5f9', overflow:'hidden' };
const statItemS = { padding:'15px 25px', textAlign:'center', borderRight:'1px solid #f1f5f9' };

const toolbarS = { display:'flex', justifyContent:'space-between', marginBottom:'30px' };
const filterBtnS = (active, color) => ({ 
    padding:'10px 20px', borderRadius:'10px', border:'none', 
    background: active ? color : '#fff', color: active ? '#fff' : '#64748b',
    fontSize:'11px', fontWeight:'800', cursor:'pointer', border: active ? 'none' : '1px solid #e2e8f0', transition:'0.3s'
});
const refreshBtnS = { background:'#0f172a', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'10px', fontWeight:'900', fontSize:'11px', cursor:'pointer' };

const timelineWrapperS = { display:'flex', flexDirection:'column', gap:'0px', paddingLeft:'20px' };
const timelineItemS = { display:'flex', gap:'30px', position:'relative' };

const timeColS = { width:'100px', textAlign:'right', paddingRight:'20px', position:'relative' };
const timeS = { fontSize:'14px', fontWeight:'900', color:'#0f172a' };
const dateS = { fontSize:'10px', fontWeight:'700', color:'#94a3b8', marginTop:'3px' };

const lineS = (isLast) => ({
    position:'absolute', right:'-2px', top:'25px', bottom: isLast ? 'auto' : '-30px',
    width:'3px', background:'#e2e8f0', height: isLast ? '0' : 'auto'
});
const dotS = (severity) => ({
    position:'absolute', top:'0', right:'-7px', width:'13px', height:'13px', borderRadius:'50%',
    background: severity === 'critical' ? '#ef4444' : severity === 'high' ? '#f59e0b' : '#3b82f6',
    border:'3px solid #fff', boxShadow:'0 0 10px rgba(0,0,0,0.1)'
});

const logCardS = (severity) => ({
    flex:1, background:'#fff', padding:'25px', borderRadius:'22px', border:'1px solid #f1f5f9',
    marginBottom:'30px', borderLeft:`6px solid ${severity === 'critical' ? '#ef4444' : severity === 'high' ? '#f59e0b' : '#3b82f6'}`,
    boxShadow:'0 10px 25px rgba(0,0,0,0.02)'
});

const cardHeaderS = { display:'flex', gap:'10px', marginBottom:'15px' };
const typeTagS = (severity) => ({ 
    fontSize:'9px', fontWeight:'900', padding:'4px 10px', borderRadius:'6px',
    background: severity === 'critical' ? '#fff1f2' : '#f1f5f9',
    color: severity === 'critical' ? '#ef4444' : '#64748b'
});
const targetTagS = { fontSize:'9px', fontWeight:'900', background:'#f8fafc', color:'#94a3b8', padding:'4px 10px', borderRadius:'6px', border:'1px solid #e2e8f0' };

const logDescS = { margin:0, fontSize:'15px', fontWeight:'700', color:'#1e293b', lineHeight:'1.5' };
const remarksBoxS = { marginTop:'12px', padding:'12px', background:'#f8fafc', borderRadius:'10px', fontSize:'12px', color:'#64748b', borderLeft:'3px solid #cbd5e1' };

const metaFooterS = { display:'flex', gap:'20px', marginTop:'20px', paddingTop:'15px', borderTop:'1px solid #f8fafc', fontSize:'10px', fontWeight:'800', color:'#cbd5e1', textTransform:'uppercase' };

const loaderS = { height:'60vh', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', color:'#94a3b8', fontSize:'14px' };
const emptyS = { textAlign:'center', padding:'100px', color:'#cbd5e1', fontWeight:'900', fontSize:'14px' };

export default InfraFailoverLogs;