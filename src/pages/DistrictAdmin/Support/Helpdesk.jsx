import React from 'react';

const Helpdesk = () => {
    return (
        <div style={cardS}>
            <div style={header}>
                <h2 style={title}>🎧 Merchant Helpdesk</h2>
                <button style={btnS}>Grievance Protocol</button>
            </div>

            <div style={ticketList}>
                {/* Single Ticket Example */}
                <div style={ticketCard}>
                    <div style={tHead}>
                        <span style={tId}>#TK-9022</span>
                        <span style={priority('High')}>HIGH PRIORITY</span>
                    </div>
                    <h4 style={tSubject}>Payment Settlement Issue</h4>
                    <p style={tMsg}>"Amount for Order #7712 not reflected in wallet." - <b>RK Supermart</b></p>
                    <div style={tFooter}>
                        <small>2 Hours Ago</small>
                        <button style={solveBtn}>Solve Ticket</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const cardS = { background: '#fff', padding: '30px', borderRadius: '25px', border: '1px solid #f1f5f9' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const title = { margin: 0, fontWeight: '900' };
const btnS = { padding: '10px 20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800' };
const ticketList = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' };
const ticketCard = { padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' };
const tHead = { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' };
const tId = { fontSize: '11px', fontWeight: '900', color: '#94a3b8' };
const priority = (type) => ({ fontSize: '9px', fontWeight: '900', color: '#ef4444', background: '#fef2f2', padding: '4px 8px', borderRadius: '5px' });
const tSubject = { margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800', color: '#1e293b' };
const tMsg = { fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: '0 0 15px 0' };
const tFooter = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '15px' };
const solveBtn = { background: 'none', border: 'none', color: '#3b82f6', fontWeight: '800', cursor: 'pointer', fontSize: '13px' };

export default Helpdesk;