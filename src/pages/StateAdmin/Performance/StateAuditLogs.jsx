import React from 'react';

const StateAuditLogs = () => {
    const logs = [
        { id: 1, user: 'Admin_Jaipur', action: 'AUTHORIZED_MERCHANT', target: 'Node_8812', time: '12 mins ago', status: 'SECURE' },
        { id: 2, user: 'State_Op_02', action: 'GLOBAL_BROADCAST', target: 'All_Merchants', time: '1 hour ago', status: 'DISPATCHED' },
        { id: 3, user: 'Admin_Kota', action: 'TERMINATED_STAFF', target: 'User_Op_99', time: '3 hours ago', status: 'REVOKED' },
    ];

    return (
        <div style={cardS}>
            <div style={head}>
                <h3 style={{margin:0}}>📜 Regional Audit Trail</h3>
                <p style={{color:'#64748b', fontSize:'13px'}}>Real-time immutable log of administrative actions within state node.</p>
            </div>

            <div style={listS}>
                {logs.map(log => (
                    <div key={log.id} style={logItem}>
                        <div style={logMeta}>
                            <b>{log.user}</b>
                            <span style={actionTag}>{log.action}</span>
                        </div>
                        <div style={logBody}>
                            Target Node: <code>{log.target}</code> | Result: <span style={{color:'#10b981', fontWeight:'800'}}>{log.status}</span>
                        </div>
                        <small style={{color:'#94a3b8'}}>{log.time} via Secure Uplink</small>
                    </div>
                ))}
            </div>
        </div>
    );
};

const cardS = { background:'#fff', padding:'35px', borderRadius:'30px', border:'1px solid #f1f5f9' };
const head = { marginBottom:'30px' };
const listS = { display:'flex', flexDirection:'column', gap:'15px' };
const logItem = { padding:'20px', background:'#f8fafc', borderRadius:'18px', borderLeft:'5px solid #0f172a' };
const logMeta = { display:'flex', justifyContent:'space-between', marginBottom:'10px' };
const actionTag = { background:'#0f172a', color:'#fff', fontSize:'9px', padding:'4px 8px', borderRadius:'5px', fontWeight:'900' };
const logBody = { fontSize:'14px', color:'#475569', marginBottom:'8px' };

export default StateAuditLogs;