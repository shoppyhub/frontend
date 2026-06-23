import React, { useState } from 'react';
import { useBranding } from '../../../context/BrandingContext';

const SystemBroadcast = () => {
    const { settings } = useBranding();
    const [msg, setMsg] = useState("");

    return (
        <div style={cardS}>
            <h2 style={title}>📢 District Broadcast Center</h2>
            <p style={sub}>Send critical alerts, maintenance news, or policy updates to all local merchants.</p>

            <div style={formBox}>
                <label style={lab}>Broadcast Message (English Only)</label>
                <textarea 
                    style={area} 
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Enter official announcement..."
                ></textarea>
                
                <div style={targetRow}>
                    <span>Target: <b>All Active District Merchants</b></span>
                    <button style={sendBtn(settings.themeColor)}>EXECUTE BROADCAST</button>
                </div>
            </div>

            <div style={history}>
                <h4 style={{margin:'20px 0 15px 0'}}>Broadcast History</h4>
                <div style={histItem}>
                    <small>Oct 24, 2023</small>
                    <p>"New Sunday Operational Guidelines: Shops can remain open until 10 PM."</p>
                </div>
            </div>
        </div>
    );
};

const cardS = { background: '#fff', padding: '30px', borderRadius: '25px', border: '1px solid #f1f5f9' };
const title = { margin: 0, fontWeight: '900' };
const sub = { color: '#64748b', fontSize: '13px', marginTop: '5px', marginBottom: '30px' };
const formBox = { background: '#f8fafc', padding: '25px', borderRadius: '20px', border: '1px solid #f1f5f9' };
const lab = { fontSize: '11px', fontWeight: '900', color: '#94a3b8', display: 'block', marginBottom: '10px', textTransform: 'uppercase' };
const area = { width: '100%', height: '120px', padding: '15px', borderRadius: '15px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px', resize: 'none', boxSizing: 'border-box' };
const targetRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' };
const sendBtn = (color) => ({ background: color || '#0f172a', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' });
const history = { marginTop: '30px' };
const histItem = { padding: '15px', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', marginBottom: '10px' };

export default SystemBroadcast;