import React from 'react';

const OperatorWorkspace = () => {
    return (
        <div style={containerS}>
            <div style={row}>
                {/* Work Statistics */}
                <div style={statCard}>
                    <small>ESCALATIONS RESOLVED</small>
                    <h3>452</h3>
                    <p style={{color:'#10b981'}}>+12% efficiency increase</p>
                </div>
                
                {/* Active Sessions */}
                <div style={statCard}>
                    <small>ACTIVE DISTRICT NODES</small>
                    <h3>24 Districts</h3>
                    <p style={{color:'#64748b'}}>All systems operational</p>
                </div>
            </div>

            <div style={taskSection}>
                <h3 style={{marginBottom:'20px'}}>Current Operational Workflow</h3>
                <div style={taskItem}>
                    <div style={tInfo}>
                        <b>Update State Broadcast Policy</b>
                        <small>Pending Admin Approval</small>
                    </div>
                    <button style={tBtn}>Review</button>
                </div>
                <div style={taskItem}>
                    <div style={tInfo}>
                        <b>Audit Log Anomaly Detected: District_Jodhpur</b>
                        <small>Critical: Investigating multiple login failures</small>
                    </div>
                    <button style={{...tBtn, background:'#ef4444'}}>Investigate</button>
                </div>
            </div>
        </div>
    );
};

const containerS = { animation: 'fadeIn 0.5s' };
const row = { display:'flex', gap:'25px', marginBottom:'40px' };
const statCard = { flex:1, background:'#fff', padding:'30px', borderRadius:'28px', border:'1px solid #f1f5f9' };
const taskSection = { background:'#fff', padding:'35px', borderRadius:'30px', border:'1px solid #f1f5f9' };
const taskItem = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px', background:'#f8fafc', borderRadius:'20px', marginBottom:'15px' };
const tInfo = { display:'flex', flexDirection:'column', gap:'5px' };
const tBtn = { padding:'10px 25px', background:'#0f172a', color:'#fff', border:'none', borderRadius:'10px', fontWeight:'800', cursor:'pointer' };

export default OperatorWorkspace;