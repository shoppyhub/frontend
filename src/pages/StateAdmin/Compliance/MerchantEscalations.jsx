import React from 'react';

const MerchantEscalations = () => {
    return (
        <div style={containerS}>
            <div style={alertHeader}>
                <div style={iconBox}>⚠️</div>
                <div>
                    <h2 style={{margin:0, color:'#991b1b'}}>Escalated Verification Queue</h2>
                    <p style={{margin:0, color:'#b91c1c', fontSize:'14px'}}>Nodes pending beyond 48-hour SLA protocol.</p>
                </div>
            </div>

            <div style={tableCard}>
                <table style={tableS}>
                    <thead>
                        <tr style={thRow}>
                            <th style={tdS}>MERCHANT IDENTITY</th>
                            <th style={tdS}>JURISDICTION</th>
                            <th style={tdS}>STAGNATION PERIOD</th>
                            <th style={tdS}>RESPONSIBLE ADMIN</th>
                            <th style={tdS}>ENFORCEMENT</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={trS}>
                            <td style={tdS}><b>Suresh Electronics</b><br/><small>ID: REG-9921</small></td>
                            <td style={tdS}>Kota Central</td>
                            <td style={tdS}><span style={timerS}>74 Hours</span></td>
                            <td style={tdS}>Admin_Kota_04</td>
                            <td style={tdS}><button style={remindBtn}>Issue System Warning</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const containerS = { animation: 'fadeIn 0.5s' };
const alertHeader = { display:'flex', alignItems:'center', gap:'20px', background:'#fef2f2', padding:'25px', borderRadius:'24px', border:'1px solid #fee2e2', marginBottom:'30px' };
const iconBox = { fontSize:'30px' };
const tableCard = { background:'#fff', borderRadius:'28px', border:'1px solid #f1f5f9', overflow:'hidden' };
const tableS = { width:'100%', borderCollapse:'collapse' };
const thRow = { textAlign:'left', background:'#f8fafc', color:'#94a3b8', fontSize:'11px', textTransform:'uppercase' };
const tdS = { padding:'20px 15px', fontSize:'14px' };
const trS = { borderBottom:'1px solid #f8fafc' };
const timerS = { color:'#e11d48', fontWeight:'900', background:'#fff1f2', padding:'4px 10px', borderRadius:'6px' };
const remindBtn = { background:'#0f172a', color:'#fff', border:'none', padding:'10px 15px', borderRadius:'10px', fontSize:'11px', fontWeight:'800', cursor:'pointer' };

export default MerchantEscalations;