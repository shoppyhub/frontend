import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../../services/api'; 
import { useBranding } from '../../../../context/BrandingContext'; 
import { toast } from 'react-toastify';

/**
 * RKD_MART - ULTIMATE INFRASTRUCTURE COMMAND CENTER
 * मैनेज करता है: Payments, SMS, Email, Storage & Map Cluster.
 */

// --- 🛡️ Sub-Component: Smart Provider Modal ---
const ProviderConfigModal = ({ isOpen, onClose, provider, onSave, themeColor }) => {
    const [config, setConfig] = useState({});
    const [isTesting, setIsTesting] = useState(false);

    useEffect(() => {
        if (provider) setConfig({ ...provider });
    }, [provider]);

    if (!isOpen || !provider) return null;

    const handleChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        try {
            // एक डमी पिंग कमांड आपके बैकएंड के लिए
            await api.post('/admin/infra/test-connection', { id: config._id });
            toast.success(`${config.provider_name} Handshake Successful!`);
        } catch (err) {
            toast.error("Handshake Failed: Check credentials or endpoint.");
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div style={modalOverlayS}>
            <div style={modalContentS}>
                <div style={modalHeaderS(themeColor)}>
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        <span style={{fontSize:'24px'}}>⚙️</span>
                        <h3 style={{ margin: 0, color: '#fff', letterSpacing:'0.5px' }}>{provider.provider_name.toUpperCase()} CONFIG</h3>
                    </div>
                    <button onClick={onClose} style={closeBtnS}>✕</button>
                </div>
                <div style={modalBodyS}>
                    <div style={protocolAlertS}>
                        <b>CORE PROTOCOL:</b> High-priority nodes (P1) are engaged first. Failover triggers automatically on timeout.
                    </div>

                    <div style={formGridS}>
                        <div style={inputGroup}>
                            <label style={labS}>Environment</label>
                            <select style={selectInS} value={config.mode} onChange={(e) => handleChange('mode', e.target.value)}>
                                <option value="test">🧪 SANDBOX / TEST</option>
                                <option value="live">🚀 PRODUCTION / LIVE</option>
                            </select>
                        </div>
                        <div style={inputGroup}>
                            <label style={labS}>Priority Ranking</label>
                            <input type="number" style={inS} value={config.priority} onChange={(e) => handleChange('priority', e.target.value)} placeholder="1, 2, 3..." />
                        </div>
                        <div style={{...inputGroup, gridColumn:'span 2'}}>
                            <label style={labS}>API URL / Endpoint</label>
                            <input style={inS} value={config.api_url} onChange={(e) => handleChange('api_url', e.target.value)} placeholder="https://api.provider.com/v1" />
                        </div>
                        <div style={{...inputGroup, gridColumn:'span 2'}}>
                            <label style={labS}>Client ID / API Key</label>
                            <input style={inS} type="password" value={config.api_key} onChange={(e) => handleChange('api_key', e.target.value)} />
                        </div>
                        <div style={{...inputGroup, gridColumn:'span 2'}}>
                            <label style={labS}>Secret Auth / Token</label>
                            <input style={inS} type="password" value={config.secret_auth} onChange={(e) => handleChange('secret_auth', e.target.value)} />
                        </div>
                    </div>
                    
                    <div style={modalFooterS}>
                        <button onClick={handleTestConnection} style={testBtnS} disabled={isTesting}>
                            {isTesting ? 'Testing...' : '⚡ Test Link'}
                        </button>
                        <div style={{display:'flex', gap:'10px'}}>
                            <button onClick={onClose} style={btnCancelS}>Abort</button>
                            <button onClick={() => onSave(config)} style={btnSaveS(themeColor)}>Sync Registry</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 🚀 Main Component ---
const APIIntegrations = () => {
    const { settings } = useBranding();
    const [loading, setLoading] = useState(true);
    const [credentials, setCredentials] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

    // 1. 📡 Registry Handshake (Fetching dynamic providers)
    const fetchRegistry = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/infra/credentials');
            if (res.data.success) {
                setCredentials(res.data.data || []);
                setLastSynced(new Date().toLocaleTimeString());
            }
        } catch (err) { toast.error("Infrastructure Handshake Failed."); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchRegistry(); }, [fetchRegistry]);

    const handleSave = async (updatedConfig) => {
        try {
            await api.put(`/admin/infra/update-credential`, updatedConfig);
            toast.success("Master Registry Synchronized.");
            setIsModalOpen(false);
            fetchRegistry();
        } catch (err) { toast.error("Update Denied by Cluster."); }
    };

    // 2. 🔍 Cluster Graphics Generator
    const renderCluster = (category, title, icon, color) => {
        const nodes = credentials.filter(c => c.category === category)
            .sort((a, b) => a.priority - b.priority);

        return (
            <div style={clusterCardS}>
                <div style={clusterHeaderS(color)}>
                    <span style={{fontSize:'22px'}}>{icon}</span>
                    <h3 style={{margin:0, fontSize:'14px', fontWeight:'900', letterSpacing:'1px'}}>{title.toUpperCase()}</h3>
                </div>
                <div style={nodeListS}>
                    {nodes.map(node => (
                        <div key={node._id} style={nodeItemS(node.status)}>
                            <div style={{flex:1}}>
                                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                    <b style={{fontSize:'13px', color:'#1e293b'}}>{node.provider_name}</b>
                                    <span style={prioBadgeS}>P{node.priority}</span>
                                    {node.mode === 'live' ? <span style={liveBadgeS}>LIVE</span> : <span style={testBadgeS}>TEST</span>}
                                </div>
                                <div style={{display:'flex', alignItems:'center', gap:'6px', marginTop:'6px'}}>
                                    <span style={statusDotS(node.status)}></span>
                                    <small style={statusTxtS(node.status)}>{node.status.replace('_', ' ').toUpperCase()}</small>
                                </div>
                            </div>
                            <button style={configBtnS} onClick={() => { setSelectedNode(node); setIsModalOpen(true); }}>CONFIG</button>
                        </div>
                    ))}
                    {nodes.length === 0 && <div style={emptyS}>No active nodes in this cluster.</div>}
                </div>
            </div>
        );
    };

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return (
        <div style={loaderS}>
            <div className="pro-spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px', fontWeight:'900', color:'#94a3b8', fontSize:'12px'}}>INITIALIZING INFRASTRUCTURE ENGINE...</p>
        </div>
    );

    return (
        <div style={containerS}>
            {/* --- [A] DYNAMIC COMMAND HEADER --- */}
            <div style={headerRowS}>
                <div>
                    <h2 style={titleS}>🏛️ Core Infrastructure Registry</h2>
                    <p style={subS}>Dynamic Failover Control for Payments, Auth, Assets & Maps.</p>
                </div>
                <div style={syncStatusS}>
                    <div style={{textAlign:'right'}}>
                        <small style={syncLabS}>LAST_HANDSHAKE</small>
                        <b style={{color: themeColor}}>{lastSynced}</b>
                    </div>
                    <div className="pulse-node"></div>
                </div>
            </div>

            {/* --- [B] INFRASTRUCTURE MATRIX --- */}
            <div style={infraGridS}>
                {renderCluster('payment_gateway', 'Payment Gateways', '💳', '#8b5cf6')}
                {renderCluster('sms_otp', 'SMS OTP Channels', '📱', '#3b82f6')}
                {renderCluster('email_otp', 'Email SMTP Nodes', '📧', '#f59e0b')}
                {renderCluster('cloud_storage', 'CDN & Cloud Storage', '☁️', '#0369a1')}
                {renderCluster('gps_maps', 'Geospatial Mapping', '📍', '#10b981')}
            </div>

            {/* --- [C] DATABASE GOVERNANCE --- */}
            <div style={dbCardS}>
                <div style={{display:'flex', gap:'30px', alignItems:'center'}}>
                    <div style={dbIconS}>🍃</div>
                    <div style={{flex:1}}>
                        <h4 style={{margin:0, fontSize:'16px'}}>MONGODB PRIMARY CONNECTION NODE</h4>
                        <p style={{margin:'5px 0 0', fontSize:'12px', opacity:0.6}}>Cluster connection string for real-time data persistence.</p>
                        <input style={dbInS} type="password" value="mongodb+srv://rkdmart_root_secure_node_2026" readOnly />
                    </div>
                    <button style={rotateBtnS(themeColor)}>ROTATE URI</button>
                </div>
            </div>

            {/* --- [D] FAILOVER TELEMETRY LOGS --- */}
            <div style={logCardS}>
                <div style={logHeadS}>
                    <h4 style={{margin:0, fontSize:'12px', fontWeight:'900'}}>🔴 REAL-TIME FAILOVER TELEMETRY</h4>
                    <span style={aiBadgeS}>AI_ROUTING_ACTIVE</span>
                </div>
                <div style={logBoxS}>
                    <div style={logItemS}><span style={timeS}>18:45:02</span> [PAY] <span style={{color:'#10b981'}}>Razorpay (P1) live.</span> Handshake verified.</div>
                    <div style={logItemS}><span style={timeS}>16:20:11</span> [SMS] <span style={{color:'#ef4444'}}>Fast2SMS Exhausted.</span> Automatically rerouted to Twilio (P2).</div>
                    <div style={logItemS}><span style={timeS}>09:12:45</span> [AUTH] Brute-force attempt detected on Admin Node. IP temporarily blacklisted.</div>
                </div>
            </div>

            <ProviderConfigModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                provider={selectedNode} 
                onSave={handleSave}
                themeColor={themeColor}
            />

            <style>{`
                .pro-spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-top-color: #0f172a; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes pulse { 0% { transform: scale(0.9); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.5; } 100% { transform: scale(0.9); opacity: 1; } }
                .pulse-node { width: 12px; height: 12px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite; box-shadow: 0 0 12px #10b981; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Definitions ---
const containerS = { padding: '20px', minHeight: '100vh', background:'#f8fafc', animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerRowS = { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'40px' };
const titleS = { margin:0, fontSize:'28px', fontWeight:'900', color:'#0f172a', letterSpacing:'-1.5px' };
const subS = { margin:'6px 0 0', color:'#64748b', fontSize:'14px', fontWeight:'500' };
const syncStatusS = { background:'#fff', padding:'15px 30px', borderRadius:'22px', border:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:'15px', boxShadow:'0 4px 15px rgba(0,0,0,0.02)' };
const syncLabS = { fontSize:'9px', fontWeight:'900', color:'#94a3b8', letterSpacing:'1px' };

const infraGridS = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(380px, 1fr))', gap:'30px', marginBottom:'40px' };
const clusterCardS = { background:'#fff', borderRadius:'35px', border:'1px solid #f1f5f9', overflow:'hidden', boxShadow:'0 15px 40px rgba(0,0,0,0.03)' };
const clusterHeaderS = (c) => ({ background: c, padding:'25px 35px', display:'flex', alignItems:'center', gap:'15px', color:'#fff', boxShadow:`0 10px 20px \${c}25` });

const nodeListS = { padding:'25px' };
const nodeItemS = (s) => ({ display:'flex', alignItems:'center', padding:'18px 22px', borderRadius:'22px', background: s === 'exhausted' ? '#fff1f2' : '#fcfdfe', border:'1.5px solid #f1f5f9', marginBottom:'15px', transition:'0.3s' });
const prioBadgeS = { background:'#f1f5f9', color:'#64748b', padding:'4px 10px', borderRadius:'8px', fontSize:'10px', fontWeight:'900' };
const liveBadgeS = { background:'#ecfdf5', color:'#10b981', padding:'4px 10px', borderRadius:'8px', fontSize:'9px', fontWeight:'900', border:'1px solid #d1fae5' };
const testBadgeS = { background:'#fff7ed', color:'#c2410c', padding:'4px 10px', borderRadius:'8px', fontSize:'9px', fontWeight:'900', border:'1px solid #ffedd5' };
const statusDotS = (s) => ({ width:'8px', height:'8px', borderRadius:'50%', background: s === 'active' ? '#10b981' : s === 'exhausted' ? '#ef4444' : '#94a3b8' });
const statusTxtS = (s) => ({ fontSize:'10px', fontWeight:'900', color: s === 'active' ? '#10b981' : s === 'exhausted' ? '#ef4444' : '#94a3b8' });
const configBtnS = { background:'#fff', border:'1.5px solid #e2e8f0', padding:'10px 18px', borderRadius:'14px', fontWeight:'900', fontSize:'11px', cursor:'pointer', transition:'0.2s' };

const dbCardS = { background:'#0f172a', padding:'40px', borderRadius:'40px', color:'#fff', marginBottom:'40px', boxShadow:'0 25px 60px rgba(15,23,42,0.3)', border:'1px solid rgba(255,255,255,0.05)' };
const dbIconS = { fontSize:'40px', background:'rgba(255,255,255,0.1)', width:'80px', height:'80px', borderRadius:'22px', display:'flex', alignItems:'center', justifyContent:'center' };
const dbInS = { flex:1, padding:'15px 25px', background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:'18px', color:'#fff', marginTop:'15px', outline:'none', fontSize:'16px', fontFamily:'monospace' };
const rotateBtnS = (c) => ({ background: c, color:'#fff', border:'none', padding:'18px 35px', borderRadius:'18px', fontWeight:'900', fontSize:'13px', cursor:'pointer', boxShadow:`0 10px 25px \${c}40` });

const logCardS = { background:'#fff', padding:'35px', borderRadius:'35px', border:'1px solid #f1f5f9' };
const logHeadS = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px', paddingBottom:'15px', borderBottom:'1px solid #f8fafc' };
const aiBadgeS = { fontSize:'9px', fontWeight:'900', color:'#10b981', letterSpacing:'1px' };
const logBoxS = { display:'flex', flexDirection:'column', gap:'12px' };
const logItemS = { fontSize:'12px', fontFamily:"'JetBrains Mono', monospace", color:'#475569', display:'flex', gap:'15px' };
const timeS = { color:'#94a3b8', fontWeight:'800' };

const modalOverlayS = { position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(15, 23, 42, 0.95)', zIndex:20000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(12px)' };
const modalContentS = { background:'#fff', width:'680px', maxWidth:'95%', borderRadius:'45px', overflow:'hidden', boxShadow:'0 50px 100px rgba(0,0,0,0.5)' };
const modalHeaderS = (c) => ({ padding:'35px 50px', background:c, display:'flex', justifyContent:'space-between', alignItems:'center' });
const closeBtnS = { background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', fontSize:'24px', cursor:'pointer', width:'45px', height:'45px', borderRadius:'50%' };
const modalBodyS = { padding:'45px' };
const protocolAlertS = { background:'#fffbeb', padding:'20px 25px', borderRadius:'20px', fontSize:'13px', color:'#92400e', border:'1px solid #fef3c7', marginBottom:'35px', lineHeight:'1.6' };
const formGridS = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'25px' };
const labS = { fontSize:'10px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase', display:'block', marginBottom:'10px', letterSpacing:'1.5px' };
const inS = { width:'100%', padding:'18px', borderRadius:'18px', border:'2.2px solid #f1f5f9', background:'#f8fafc', fontWeight:'700', outline:'none', fontSize:'14px', color:'#1e293b', transition:'0.3s' };
const selectInS = { ...inS, cursor:'pointer' };
const modalFooterS = { display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'45px' };
const testBtnS = { background:'#f1f5f9', color:'#475569', border:'none', padding:'15px 30px', borderRadius:'15px', fontWeight:'900', fontSize:'12px', cursor:'pointer' };
const btnSaveS = (c) => ({ padding:'18px 40px', borderRadius:'18px', border:'none', background:c, color:'#fff', fontWeight:'900', fontSize:'14px', cursor:'pointer', boxShadow:`0 15px 30px \${c}40` });
const btnCancelS = { padding:'18px 30px', borderRadius:'18px', border:'1.5px solid #f1f5f9', background:'#fff', fontWeight:'800', cursor:'pointer', color:'#64748b' };

const loaderS = { height:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontWeight:'900', color:'#94a3b8', gap:'20px' };
const emptyS = { textAlign:'center', color:'#cbd5e1', fontSize:'13px', padding:'40px', fontWeight:'800', border:'2px dashed #f1f5f9', borderRadius:'25px' };

export default APIIntegrations;