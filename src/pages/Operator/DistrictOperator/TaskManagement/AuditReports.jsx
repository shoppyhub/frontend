import React from 'react';

const AuditReports = () => {
    return (
        <div style={cardS}>
            <div style={header}>
                <h2 style={{margin:0}}>Historical Audit Reports</h2>
                <button style={exportBtn}>Export CSV</button>
            </div>

            <table style={tableS}>
                <thead>
                    <tr style={thRow}>
                        <th style={tdS}>MERCHANT NAME</th>
                        <th style={tdS}>AUDIT DATE</th>
                        <th style={tdS}>DECISION</th>
                        <th style={tdS}>REMARK</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={trS}>
                        <td style={tdS}><b>Aman Stationery</b></td>
                        <td style={tdS}>Oct 24, 2023</td>
                        <td style={tdS}><span style={badge('#10b981')}>APPROVED</span></td>
                        <td style={tdS}>Physical docs verified.</td>
                    </tr>
                    <tr style={trS}>
                        <td style={tdS}><b>Quick Bites</b></td>
                        <td style={tdS}>Oct 22, 2023</td>
                        <td style={tdS}><span style={badge('#ef4444')}>REJECTED</span></td>
                        <td style={tdS}>Invalid GST Registration.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

const cardS = { background:'#fff', padding:'30px', borderRadius:'28px', border:'1px solid #f1f5f9' };
const header = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px' };
const exportBtn = { background:'#f1f5f9', border:'none', padding:'8px 15px', borderRadius:'10px', fontSize:'12px', fontWeight:'800', cursor:'pointer' };
const tableS = { width:'100%', borderCollapse:'collapse' };
const thRow = { textAlign:'left', borderBottom:'2px solid #f8fafc', color:'#94a3b8', fontSize:'11px', textTransform:'uppercase' };
const trS = { borderBottom:'1px solid #f8fafc' };
const tdS = { padding:'15px 10px', fontSize:'14px' };
const badge = (c) => ({ color:c, background:`${c}15`, padding:'4px 10px', borderRadius:'6px', fontWeight:'900', fontSize:'10px' });

export default AuditReports;