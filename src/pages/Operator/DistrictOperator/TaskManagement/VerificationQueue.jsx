import React from 'react';

const VerificationQueue = () => {
    return (
        <div style={cardS}>
            <div style={header}>
                <div>
                    <h2 style={{margin:0}}>Assigned Audit Queue</h2>
                    <p style={{color:'#64748b', fontSize:'13px'}}>Complete physical verification for these assigned nodes.</p>
                </div>
                <div style={badgeS}>TASK_LOAD: 08</div>
            </div>

            <div style={listS}>
                {/* Single Task Item */}
                <div style={taskItem}>
                    <div style={shopInfo}>
                        <span style={cat}>GROCERY</span>
                        <h4 style={{margin:'5px 0'}}>Sharma Supermarket</h4>
                        <small>📍 Sector 4, Block B, Jaipur</small>
                    </div>
                    <div style={dueBox}>
                        <small>DEADLINE</small>
                        <b style={{color:'#ef4444'}}>Today, 6:00 PM</b>
                    </div>
                    <button style={actionBtn}>START AUDIT</button>
                </div>
            </div>
        </div>
    );
};

const cardS = { background:'#fff', padding:'30px', borderRadius:'28px', border:'1px solid #f1f5f9' };
const header = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', borderBottom:'1px solid #f8fafc', paddingBottom:'20px' };
const badgeS = { background:'#f1f5f9', padding:'8px 15px', borderRadius:'10px', fontSize:'10px', fontWeight:'900', color:'#475569' };
const listS = { display:'flex', flexDirection:'column', gap:'15px' };
const taskItem = { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px', background:'#f8fafc', borderRadius:'20px', border:'1px solid #f1f5f9' };
const shopInfo = { display:'flex', flexDirection:'column' };
const cat = { fontSize:'9px', fontWeight:'900', color:'#0d9488', letterSpacing:'1px' };
const dueBox = { textAlign:'center' };
const actionBtn = { background:'#0f172a', color:'#fff', border:'none', padding:'12px 25px', borderRadius:'12px', fontWeight:'800', cursor:'pointer' };

export default VerificationQueue;