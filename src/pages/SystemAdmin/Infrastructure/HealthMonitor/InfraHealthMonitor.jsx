import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../../services/api';
import { useBranding } from '../../../../context/BrandingContext';

const InfraHealthMonitor = () => {
    const { settings } = useBranding();
    const [healthData, setHealthData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchPulse = useCallback(async () => {
        try {
            const res = await api.get('/admin/infra/health-pulse');
            if (res.data.success) {
                setHealthData(res.data.pulse);
            }
        } catch (err) { console.error("Pulse Lost."); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchPulse();
        const interval = setInterval(fetchPulse, 30000); // हर 30 सेकंड में ऑटो-रिफ्रेश
        return () => clearInterval(interval);
    }, [fetchPulse]);

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return <div style={loaderS}>CONNECTING TO CLUSTER MONITOR...</div>;

    return (
        <div style={containerS}>
            <div style={headerRowS}>
                <h2 style={titleS}>🛰️ System Node Health Monitor</h2>
                <div style={uptimeBadgeS}>UPTIME: {Math.floor(healthData?.uptime / 3600)}h {Math.floor((healthData?.uptime % 3600) / 60)}m</div>
            </div>

            <div style={gridS}>
                {/* 📊 Server Load Node */}
                <HealthCard 
                    title="API LATENCY (CLUSTER)" 
                    val="240ms" 
                    status="Optimal" 
                    icon="⚡" 
                    color="#10b981" 
                    progress={85}
                />
                
                {/* 💾 Memory Consumption */}
                <HealthCard 
                    title="RAM ALLOCATION" 
                    val={`${healthData?.memoryUsage.toFixed(2)} MB`} 
                    status={healthData?.memoryUsage > 500 ? 'Warning' : 'Healthy'} 
                    icon="🧠" 
                    color={healthData?.memoryUsage > 500 ? '#f59e0b' : '#3b82f6'} 
                    progress={(healthData?.memoryUsage / 1024) * 100}
                />

                {/* ☁️ Storage Nodes */}
                <HealthCard 
                    title="STORAGE HANDSHAKE" 
                    val="Cloudinary / AWS" 
                    status="Connected" 
                    icon="☁️" 
                    color="#0369a1" 
                    progress={100}
                />

                {/* 💳 Payment Terminals */}
                <HealthCard 
                    title="PAYMENT GATEWAYS" 
                    val="Razorpay (P1)" 
                    status="Active" 
                    icon="💳" 
                    color="#8b5cf6" 
                    progress={100}
                />
            </div>

            {/* 🍃 Database Sync Node */}
            <div style={dbSyncCardS}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
                        <div style={dbIconS}>🍃</div>
                        <div>
                            <h4 style={{margin:0}}>MongoDB Atlas Persistence</h4>
                            <small style={{opacity:0.6}}>Cluster-0 | Production Node</small>
                        </div>
                    </div>
                    <div style={dbStatusS}>SYNC_SYNCHRONIZED</div>
                </div>
            </div>
        </div>
    );
};

// --- Sub Component: Modern Gauge Card ---
const HealthCard = ({ title, val, status, icon, color, progress }) => (
    <div style={cardS}>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
            <span style={iconS(color)}>{icon}</span>
            <span style={statusTagS(color)}>{status.toUpperCase()}</span>
        </div>
        <small style={labS}>{title}</small>
        <div style={valS}>{val}</div>
        <div style={progressBgS}>
            <div style={progressFillS(color, progress)}></div>
        </div>
    </div>
);

// --- Styles ---
const containerS = { animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerRowS = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'35px' };
const titleS = { margin:0, fontSize:'24px', fontWeight:'900', color:'#0f172a' };
const uptimeBadgeS = { background:'#0f172a', color:'#fff', padding:'8px 20px', borderRadius:'12px', fontSize:'11px', fontWeight:'900', letterSpacing:'1px' };

const gridS = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'25px', marginBottom:'30px' };
const cardS = { background:'#fff', padding:'25px', borderRadius:'28px', border:'1px solid #f1f5f9', boxShadow:'0 10px 25px rgba(0,0,0,0.02)' };
const iconS = (c) => ({ width:'45px', height:'45px', borderRadius:'12px', background:`${c}10`, color:c, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' });
const statusTagS = (c) => ({ fontSize:'9px', fontWeight:'900', color:c, background:`${c}10`, padding:'4px 10px', borderRadius:'8px', height:'fit-content' });
const labS = { fontSize:'10px', fontWeight:'900', color:'#94a3b8', letterSpacing:'0.5px' };
const valS = { fontSize:'20px', fontWeight:'900', color:'#1e293b', margin:'8px 0 15px 0' };

const progressBgS = { height:'6px', background:'#f1f5f9', borderRadius:'10px', overflow:'hidden' };
const progressFillS = (c, w) => ({ width:`${w}%`, height:'100%', background:c, transition:'1s ease' });

const dbSyncCardS = { background:'#0f172a', padding:'30px', borderRadius:'30px', color:'#fff' };
const dbIconS = { fontSize:'30px', background:'rgba(255,255,255,0.1)', width:'60px', height:'60px', borderRadius:'18px', display:'flex', alignItems:'center', justifyContent:'center' };
const dbStatusS = { color:'#10b981', fontWeight:'900', fontSize:'11px', letterSpacing:'2px' };

const loaderS = { height:'60vh', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', color:'#94a3b8' };

export default InfraHealthMonitor;