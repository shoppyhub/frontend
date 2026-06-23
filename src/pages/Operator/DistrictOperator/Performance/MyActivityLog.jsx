import React from 'react';

/**
 * RKD_MART - District Operator Activity Log
 * Strategic audit trail for operational nodes.
 */
const MyActivityLog = () => {
    // Mock Data: Real-world operational actions
    const logs = [
        { id: 1, action: 'SHOP_VERIFIED', target: 'Modern Grocers', time: '10:15 AM', date: 'Oct 24', status: 'SUCCESS' },
        { id: 2, action: 'DOC_REJECTION', target: 'City Electronics', time: '09:45 AM', date: 'Oct 24', status: 'ALERT' },
        { id: 3, action: 'SYSTEM_LOGIN', target: 'Node_Jaipur_04', time: '09:00 AM', date: 'Oct 24', status: 'SECURE' },
        { id: 4, action: 'KYC_PENDING', target: 'Rahul General Store', time: '08:30 PM', date: 'Oct 23', status: 'WAITING' },
    ];

    return (
        <div style={cardS}>
            {/* Header Section */}
            <div style={headerRowS}>
                <div>
                    <h3 style={titleS}>🛡️ My System Activity Log</h3>
                    <p style={subS}>Comprehensive audit trail of your actions within the district node.</p>
                </div>
                <div style={syncBadgeS}>
                    <span className="pulse-dot"></span> REAL-TIME FEED
                </div>
            </div>
            
            {/* Log Table Container */}
            <div style={logTable}>
                {logs.map((log, index) => (
                    <div key={log.id} style={{
                        ...logRow,
                        backgroundColor: index % 2 === 0 ? '#fff' : '#fcfdfe' // Alternating colors
                    }}>
                        <div style={timeBox}>
                            <span style={timeS}>{log.time}</span>
                            <small style={dateS}>{log.date}</small>
                        </div>
                        
                        <div style={actionBox}>
                            <div style={actionFlex}>
                                <b style={actionTitleS}>{log.action.replace('_', ' ')}</b>
                                <span style={targetBadge(log.status)}>{log.status}</span>
                            </div>
                            <small style={targetTextS}>NODE_TARGET: {log.target}</small>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Note */}
            <div style={footerNoteS}>
                * All actions are cryptographically logged and synchronized with the Master Registry.
            </div>

            <style>{`
                .pulse-dot {
                    width: 6px; height: 6px; background: #10b981; border-radius: 50%;
                    display: inline-block; animation: pulse-anim 2s infinite; margin-right: 8px;
                }
                @keyframes pulse-anim { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
            `}</style>
        </div>
    );
};

// --- Enterprise Visual Definitions (Styles) ---

const cardS = { 
    background: '#fff', 
    padding: window.innerWidth < 768 ? '20px' : '35px', 
    borderRadius: '32px', 
    border: '1px solid #f1f5f9', 
    boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
    fontFamily: "'Plus Jakarta Sans', sans-serif" 
};

const headerRowS = { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '15px'
};

const titleS = { margin: 0, fontWeight: '900', color: '#0f172a', fontSize: '18px', letterSpacing: '-0.5px' };
const subS = { color: '#64748b', fontSize: '13px', marginTop: '5px' };

const syncBadgeS = { 
    background: '#ecfdf5', 
    color: '#10b981', 
    padding: '6px 14px', 
    borderRadius: '12px', 
    fontSize: '10px', 
    fontWeight: '900', 
    display: 'flex', 
    alignItems: 'center' 
};

const logTable = { 
    width: '100%', 
    borderRadius: '20px', 
    overflow: 'hidden', 
    border: '1.5px solid #f8fafc' 
};

const logRow = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '20px', 
    padding: '18px 20px', 
    borderBottom: '1px solid #f8fafc',
    transition: '0.2s ease'
};

const timeBox = { 
    width: '85px', 
    display: 'flex', 
    flexDirection: 'column' 
};

const timeS = { fontSize: '12px', fontWeight: '800', color: '#1e293b' };
const dateS = { fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' };

const actionBox = { flex: 1 };
const actionFlex = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' };
const actionTitleS = { fontSize: '13px', color: '#0f172a', letterSpacing: '0.3px' };

const targetTextS = { display: 'block', color: '#94a3b8', fontSize: '11px', fontWeight: '600' };

const targetBadge = (s) => {
    const colors = {
        SUCCESS: { bg: '#ecfdf5', col: '#10b981' },
        ALERT: { bg: '#fff1f2', col: '#f43f5e' },
        SECURE: { bg: '#eff6ff', col: '#3b82f6' },
        WAITING: { bg: '#fffbeb', col: '#d97706' }
    };
    const style = colors[s] || { bg: '#f8fafc', col: '#64748b' };
    return {
        padding: '3px 10px',
        borderRadius: '8px',
        fontSize: '9px',
        fontWeight: '900',
        background: style.bg,
        color: style.col,
        border: `1px solid \${style.col}15`
    };
};

const footerNoteS = { 
    marginTop: '25px', 
    fontSize: '11px', 
    color: '#cbd5e1', 
    fontWeight: '600', 
    textAlign: 'center',
    fontStyle: 'italic'
};

export default MyActivityLog;