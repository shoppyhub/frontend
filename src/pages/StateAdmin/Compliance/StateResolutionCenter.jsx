import React from 'react';

const StateResolutionCenter = () => {
    return (
        <div style={cardS}>
            <div style={head}>
                <h2 style={{margin:0}}>⚖️ Regional Resolution Center</h2>
                <span style={badge}>STATE_ARBITRATION</span>
            </div>

            <div style={disputeList}>
                <div style={disputeItem}>
                    <div style={dMeta}>
                        <b>REFUND_DISPUTE_#8892</b>
                        <small>Oct 26, 2023</small>
                    </div>
                    <p style={dText}>Conflict between <b>Jaipur District</b> (Merchant) and <b>Kota District</b> (Customer). Delivery confirmed but payment escrowed.</p>
                    <div style={actionRow}>
                        <button style={btnS('#10b981')}>Release Payment</button>
                        <button style={btnS('#ef4444')}>Hold for Audit</button>
                        <button style={btnS('#64748b')}>Open Inquiry</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const cardS = { background:'#fff', padding:'35px', borderRadius:'30px', border:'1px solid #f1f5f9' };
const head = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px' };
const badge = { background:'#f8fafc', padding:'5px 12px', borderRadius:'100px', fontSize:'10px', fontWeight:'900', color:'#4f46e5', border:'1px solid #e0e7ff' };
const disputeItem = { padding:'25px', background:'#f8fafc', borderRadius:'20px', border:'1px solid #f1f5f9', marginBottom:'20px' };
const dMeta = { display:'flex', justifyContent:'space-between', marginBottom:'15px' };
const dText = { fontSize:'14px', color:'#475569', lineHeight:'1.6', marginBottom:'20px' };
const actionRow = { display:'flex', gap:'12px' };
const btnS = (c) => ({ padding:'10px 20px', borderRadius:'10px', border:'none', background:c, color:'#fff', fontSize:'12px', fontWeight:'800', cursor:'pointer' });

export default StateResolutionCenter;