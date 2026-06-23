import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { useBranding } from '../../../context/BrandingContext';
import { toast } from 'react-toastify';

const StateBroadcast = ({ stateName }) => {
    const { settings } = useBranding();
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [formData, setFormData] = useState({
        message: '',
        target: 'all_merchants', // Default target
        priority: 'Normal'
    });

    const themeColor = settings?.themeColor || '#4f46e5';

    // 1. Fetch Previous Broadcast History
    const fetchHistory = useCallback(async () => {
        try {
            const res = await api.get('/admin/broadcast/history?scope=state');
            if (res.data.success) {
                setHistory(res.data.data);
            }
        } catch (err) {
            console.error("Broadcast History Sync Error");
            // Mock data for UI testing
            setHistory([
                { _id: '1', message: 'Technical maintenance scheduled for Sunday midnight.', target: 'All Nodes', date: '2023-10-25', priority: 'High' },
                { _id: '2', message: 'New commission policy for Diwali festive season active.', target: 'District Admins', date: '2023-10-22', priority: 'Normal' }
            ]);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // 2. Execute Statewide Broadcast
    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!formData.message.trim()) return toast.error("Communication payload cannot be empty.");

        setLoading(true);
        try {
            const payload = {
                ...formData,
                state: stateName,
                scope: 'State'
            };
            const res = await api.post('/admin/broadcast/send', payload);
            
            if (res.data.success) {
                toast.success("Broadcast Signal Dispatched Successfully! 📡");
                setFormData({ message: '', target: 'all_merchants', priority: 'Normal' });
                fetchHistory();
            }
        } catch (err) {
            toast.error("Transmission Error: Protocol rejected by System HQ.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={containerS}>
            {/* Header Module */}
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>📡 State Communications Hub</h2>
                    <p style={subS}>Dispatch synchronized alerts and policy updates across the <b>{stateName}</b> regional node.</p>
                </div>
                <div style={statusBadge}>
                    <span className="live-dot"></span> UPLINK_ESTABLISHED
                </div>
            </div>

            <div style={mainGrid}>
                {/* --- BROADCAST FORM --- */}
                <div style={formCard}>
                    <h3 style={cardHead}>🚀 Execute New Broadcast</h3>
                    <form onSubmit={handleBroadcast}>
                        <div style={fieldGrp}>
                            <label style={labS}>Communication Payload (Message)</label>
                            <textarea 
                                style={areaS} 
                                value={formData.message}
                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                                placeholder="Write official announcement here..."
                                required
                            ></textarea>
                        </div>

                        <div style={inputRow}>
                            <div style={fieldGrp}>
                                <label style={labS}>Target Audience Node</label>
                                <select 
                                    style={inS} 
                                    value={formData.target}
                                    onChange={(e) => setFormData({...formData, target: e.target.value})}
                                >
                                    <option value="all_merchants">All State Merchants</option>
                                    <option value="district_admins">District Administrators Only</option>
                                    <option value="state_operators">State Support Operators</option>
                                    <option value="all_nodes">Global State Infrastructure</option>
                                </select>
                            </div>
                            <div style={fieldGrp}>
                                <label style={labS}>Priority Level</label>
                                <select 
                                    style={inS}
                                    value={formData.priority}
                                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                >
                                    <option value="Normal">🟢 Normal</option>
                                    <option value="High">🟡 High (Alert)</option>
                                    <option value="Urgent">🔴 Urgent (Critical)</option>
                                </select>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            style={sendBtn(themeColor)}
                        >
                            {loading ? "TRANSMITTING..." : "DISPATCH BROADCAST SIGNAL"}
                        </button>
                    </form>
                </div>

                {/* --- RECENT HISTORY --- */}
                <div style={historyCard}>
                    <h3 style={cardHead}>📜 Dispatch History (Audit Trail)</h3>
                    <div className="custom-scroll" style={scrollBox}>
                        {history.length === 0 ? (
                            <p style={emptyTxt}>No past communications detected.</p>
                        ) : (
                            history.map((log) => (
                                <div key={log._id} style={logItem}>
                                    <div style={logTop}>
                                        <span style={logTarget}>{log.target?.toUpperCase()}</span>
                                        <small style={{color:'#94a3b8'}}>{new Date(log.date || Date.now()).toLocaleDateString()}</small>
                                    </div>
                                    <p style={logMsg}>"{log.message}"</p>
                                    <span style={prioBadge(log.priority)}>{log.priority}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .live-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; margin-right: 8px; box-shadow: 0 0 10px #10b981; animation: pulse 1.5s infinite; }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Architecture ---

const containerS = { animation: 'fadeIn 0.5s ease-out' };

const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' };
const titleS = { margin: 0, color: '#0f172a', fontSize: '26px', fontWeight: '900', letterSpacing: '-0.5px' };
const subS = { color: '#64748b', margin: '5px 0 0 0', fontSize: '14px', fontWeight: '500' };
const statusBadge = { background: '#f8fafc', padding: '8px 16px', borderRadius: '100px', fontSize: '10px', fontWeight: '900', color: '#64748b', border: '1px solid #e2e8f0', letterSpacing: '1px' };

const mainGrid = { display: 'grid', gridTemplateColumns: window.innerWidth < 1100 ? '1fr' : '1.5fr 1fr', gap: '30px' };

const formCard = { background: '#fff', padding: '35px', borderRadius: '30px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' };
const historyCard = { background: '#fff', padding: '35px', borderRadius: '30px', border: '1px solid #f1f5f9' };
const cardHead = { margin: '0 0 25px 0', fontSize: '17px', color: '#1e293b', fontWeight: '800' };

const fieldGrp = { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', flex: 1 };
const labS = { fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase' };
const areaS = { width: '100%', height: '120px', padding: '15px', borderRadius: '16px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '14px', fontWeight: '500', background: '#f8fafc', resize: 'none' };
const inputRow = { display: 'flex', gap: '20px', flexWrap: 'wrap' };
const inS = { width: '100%', padding: '15px', borderRadius: '14px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '13px', fontWeight: '700', background: '#f8fafc' };

const sendBtn = (color) => ({ width: '100%', padding: '18px', background: color, color: '#fff', border: 'none', borderRadius: '16px', fontSize: '15px', fontWeight: '900', cursor: 'pointer', boxShadow: `0 10px 20px ${color}33`, transition: '0.3s', marginTop: '10px' });

const scrollBox = { height: '450px', overflowY: 'auto', paddingRight: '10px' };
const emptyTxt = { textAlign: 'center', padding: '100px 0', color: '#94a3b8', fontWeight: '600' };

const logItem = { padding: '20px', background: '#f8fafc', borderRadius: '20px', marginBottom: '15px', border: '1px solid #f1f5f9' };
const logTop = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' };
const logTarget = { fontSize: '10px', fontWeight: '900', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 10px', borderRadius: '6px' };
const logMsg = { fontSize: '13px', color: '#475569', lineHeight: '1.5', fontStyle: 'italic', margin: '0 0 10px 0' };

const prioBadge = (p) => ({
    fontSize: '9px', fontWeight: '900', padding: '4px 10px', borderRadius: '100px',
    background: p === 'Urgent' ? '#fff1f2' : p === 'High' ? '#fffbeb' : '#f0fdf4',
    color: p === 'Urgent' ? '#e11d48' : p === 'High' ? '#d97706' : '#16a34a'
});

export default StateBroadcast;