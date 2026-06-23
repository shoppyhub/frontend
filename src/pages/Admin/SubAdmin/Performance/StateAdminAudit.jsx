import React from 'react';

const StateAdminAudit = () => {
    return (
        <div style={cardS}>
            <h3 style={{marginTop:0}}>🏛️ Regional Node SLA Audit</h3>
            <div style={reportList}>
                <div style={rItem}>
                    <div style={rInfo}>
                        <b>Rajasthan State Node</b>
                        <small>Admin: Vikram Singh</small>
                    </div>
                    <div style={rMetrics}>
                        <div style={mBox}>Avg Approval: <b>14 Hours</b></div>
                        <div style={mBox}>Disputes Resolved: <b>98%</b></div>
                    </div>
                    <div style={rating}>Score: <b style={{color:'#10b981'}}>A+</b></div>
                </div>
                {/* More states... */}
            </div>
        </div>
    );
};

const cardS = { background:'#fff', padding:'30px', borderRadius:'30px', border:'1px solid #f1f5f9' };
const reportList = { marginTop:'20px' };
const rItem = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px', background:'#f8fafc', borderRadius:'20px', marginBottom:'15px' };
const rInfo = { display:'flex', flexDirection:'column', gap:'5px' };
const rMetrics = { display:'flex', gap:'30px', fontSize:'13px' };
const mBox = { color:'#64748b' };
const rating = { background:'#fff', padding:'10px 20px', borderRadius:'12px', border:'1px solid #e2e8f0', fontSize:'14px' };

export default StateAdminAudit;