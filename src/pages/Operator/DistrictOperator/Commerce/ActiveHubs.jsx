import React from 'react';

const ActiveHubs = () => {
    return (
        <div style={containerS}>
            <h2 style={titleS}>Verified District Merchant Hubs</h2>
            <div style={gridS}>
                {/* Hub Card */}
                {[1, 2, 3].map(item => (
                    <div key={item} style={hubCard}>
                        <div style={statusDot}>LIVE</div>
                        <h4 style={{margin:'10px 0'}}>RK Supermarket</h4>
                        <p style={hubDetail}>Sector 12, Jaipur</p>
                        <div style={hubStats}>
                            <div><small>ORDERS</small><br/><b>142</b></div>
                            <div><small>RATING</small><br/><b>4.8 ⭐</b></div>
                        </div>
                        <button style={viewBtn}>Inspect Hub</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const containerS = { animation:'fadeIn 0.5s' };
const titleS = { marginBottom:'30px', fontWeight:'900' };
const gridS = { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'25px' };
const hubCard = { background:'#fff', padding:'25px', borderRadius:'24px', border:'1px solid #f1f5f9', position:'relative' };
const statusDot = { background:'#f0fdf4', color:'#16a34a', fontSize:'9px', fontWeight:'900', padding:'4px 10px', borderRadius:'20px', display:'inline-block' };
const hubDetail = { fontSize:'13px', color:'#64748b', marginBottom:'20px' };
const hubStats = { display:'flex', justifyContent:'space-between', borderTop:'1px solid #f8fafc', paddingTop:'15px', marginBottom:'20px' };
const viewBtn = { width:'100%', padding:'12px', background:'#f8fafc', border:'none', borderRadius:'12px', color:'#475569', fontWeight:'800', cursor:'pointer' };

export default ActiveHubs;