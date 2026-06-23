import React from 'react';

const LogisticsMonitor = () => {
    return (
        <div style={cardS}>
            <div style={header}>
                <h3 style={{margin:0}}>District Logistics Flow</h3>
                <div style={pulseBox}><span className="pulse"></span> LIVE MONITOR</div>
            </div>

            <div style={flowList}>
                <div style={flowItem}>
                    <div style={dotS('#3b82f6')}></div>
                    <div style={flowText}>
                        <b>Order #ORD-5521</b>
                        <small style={{display:'block'}}>Modern Grocery ➔ Customer Home</small>
                    </div>
                    <span style={statusS('#3b82f6')}>IN-TRANSIT</span>
                </div>
                {/* More items... */}
            </div>

            <style>{`
                .pulse { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; display: inline-block; margin-right: 10px; animation: blink 1s infinite; }
                @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
            `}</style>
        </div>
    );
};

const cardS = { background:'#fff', padding:'30px', borderRadius:'28px', border:'1px solid #f1f5f9' };
const header = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px' };
const pulseBox = { fontSize:'10px', fontWeight:'900', color:'#ef4444' };
const flowList = { display:'flex', flexDirection:'column', gap:'15px' };
const flowItem = { display:'flex', alignItems:'center', gap:'20px', padding:'15px', background:'#f8fafc', borderRadius:'15px' };
const dotS = (c) => ({ width:'10px', height:'10px', borderRadius:'50%', background:c });
const flowText = { flex:1, fontSize:'14px' };
const statusS = (c) => ({ fontSize:'10px', fontWeight:'900', color:c });

export default LogisticsMonitor;