// src/pages/Admin/SubAdmin/Infrastructure/PlatformHealth.js
import React from 'react';

const PlatformHealth = () => {
    return (
        <div style={containerS}>
            <div style={grid}>
                <HealthCard title="Main Cluster (AWS-MUM)" status="Stable" latency="14ms" uptime="99.9%" />
                <HealthCard title="Database Node" status="Optimized" latency="8ms" uptime="100%" />
                <HealthCard title="Storage (Cloudinary)" status="Synced" latency="120ms" uptime="99.8%" />
                <HealthCard title="SMS Gateway" status="Active" latency="2s" uptime="95.0%" />
            </div>
            
            <div style={activityLog}>
                <h4 style={{margin:'0 0 15px 0'}}>Recent Infrastructure Events</h4>
                <div style={logLine}>[10:42 AM] - Scheduled database indexing completed.</div>
                <div style={logLine}>[09:15 AM] - Cluster auto-scaled to 4 nodes due to traffic.</div>
            </div>
        </div>
    );
};

const HealthCard = ({title, status, latency, uptime}) => (
    <div style={card}>
        <div style={{fontWeight:'900', fontSize:'13px', marginBottom:'10px'}}>{title}</div>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
            <small>Status:</small>
            <b style={{color:'#10b981'}}>{status}</b>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
            <small>Latency:</small>
            <b>{latency}</b>
        </div>
        <div style={{display:'flex', justifyContent:'space-between'}}>
            <small>Uptime:</small>
            <b>{uptime}</b>
        </div>
    </div>
);

const containerS = { padding:'0px' };
const grid = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'20px' };
const card = { background:'#fff', padding:'20px', borderRadius:'20px', border:'1px solid #f1f5f9' };
const activityLog = { marginTop:'30px', background:'#020617', color:'#10b981', padding:'25px', borderRadius:'20px', fontFamily:'monospace', fontSize:'12px' };
const logLine = { marginBottom:'8px', borderBottom:'1px solid #ffffff10', paddingBottom:'4px' };

export default PlatformHealth;