import React from 'react';
// सुधार: पाथ को ../../../../ से बदलकर ../../../ किया गया है ताकि यह src फोल्डर के अंदर रहे
import { useBranding } from '../../../context/BrandingContext';

// --- Chart.js Imports ---
import { Bar } from 'react-chartjs-2';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend 
} from 'chart.js';

// Chart.js components को रजिस्टर करना ज़रूरी है
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const OperatorOverview = () => {
    const { settings } = useBranding();
    const themeColor = settings?.themeColor || '#0d9488';

    const performanceData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
            label: 'Shops Verified',
            data: [12, 19, 10, 15, 8, 22],
            backgroundColor: themeColor,
            borderRadius: 8
        }]
    };

    return (
        <div style={containerS}>
            {/* Welcome Row */}
            <div style={welcomeRow}>
                <div>
                    <h2 style={titleS}>Operational Intelligence Overview</h2>
                    <p style={subS}>Track your daily verification targets and merchant support metrics.</p>
                </div>
                <div style={dateBadge}>{new Date().toDateString()}</div>
            </div>

            {/* Metrics Grid */}
            <div style={statsGrid}>
                <div style={statCard(themeColor)}>
                    <small style={statLab}>TODAY'S TARGET</small>
                    <h3 style={statVal}>20 Shops</h3>
                    <div style={progressBg}>
                        <div style={progressFill('65%', '#fff')}></div>
                    </div>
                </div>
                <div style={statCard('#3b82f6')}>
                    <small style={statLab}>PENDING AUDITS</small>
                    <h3 style={statVal}>08 Units</h3>
                </div>
                <div style={statCard('#f59e0b')}>
                    <small style={statLab}>OPEN TICKETS</small>
                    <h3 style={statVal}>03 Active</h3>
                </div>
                <div style={statCard('#10b981')}>
                    <small style={statLab}>SUCCESS RATE</small>
                    <h3 style={statVal}>98.2%</h3>
                </div>
            </div>

            <div style={mainGrid}>
                {/* Performance Chart */}
                <div style={chartCard}>
                    <h4 style={cardHead}>My Weekly Productivity</h4>
                    <div style={{height:'250px'}}>
                        <Bar 
                            data={performanceData} 
                            options={{ 
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } } 
                            }} 
                        />
                    </div>
                </div>

                {/* Live Activity Feed */}
                <div style={activityCard}>
                    <h4 style={cardHead}>Recent Actions Log</h4>
                    <div style={logItem}>
                        <span style={dot('#10b981')}></span>
                        <div>
                            <b style={logBold}>Verified:</b> "Global Mart" documents approved.
                            <small style={timeS}>12 mins ago</small>
                        </div>
                    </div>
                    <div style={logItem}>
                        <span style={dot('#ef4444')}></span>
                        <div>
                            <b style={logBold}>Rejected:</b> "City Cafe" - Invalid GST file.
                            <small style={timeS}>1 hour ago</small>
                        </div>
                    </div>
                    <div style={logItem}>
                        <span style={dot('#3b82f6')}></span>
                        <div>
                            <b style={logBold}>Pending:</b> "Vikas Stores" physical visit scheduled.
                            <small style={timeS}>3 hours ago</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Styles Node ---
const containerS = { animation: 'fadeIn 0.5s ease-out' };
const welcomeRow = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'35px' };
const titleS = { margin:0, fontSize:'24px', fontWeight:'900', color:'#0f172a', letterSpacing:'-0.5px' };
const subS = { margin:'5px 0 0', color:'#64748b', fontSize:'14px' };
const dateBadge = { background:'#fff', padding:'10px 20px', borderRadius:'12px', fontSize:'12px', fontWeight:'800', border:'1px solid #e2e8f0', color:'#1e293b' };

const statsGrid = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'20px', marginBottom:'35px' };
const statCard = (color) => ({ background:color, color:'#fff', padding:'25px', borderRadius:'24px', boxShadow:`0 10px 25px ${color}33`, transition:'0.3s' });
const statLab = { fontSize: '10px', fontWeight: '900', opacity: 0.8, letterSpacing: '1px' };
const statVal = { margin: '10px 0 0 0', fontSize: '24px', fontWeight: '900' };

const progressBg = { background:'rgba(255,255,255,0.2)', height:'6px', borderRadius:'10px', marginTop:'15px' };
const progressFill = (width, color) => ({ width, height:'100%', background:color, borderRadius:'10px' });

const mainGrid = { display:'grid', gridTemplateColumns: window.innerWidth < 1100 ? '1fr' : '1.8fr 1fr', gap:'30px' };
const chartCard = { background:'#fff', padding:'30px', borderRadius:'28px', border:'1px solid #f1f5f9', boxShadow:'0 4px 20px rgba(0,0,0,0.02)' };
const activityCard = { background:'#fff', padding:'30px', borderRadius:'28px', border:'1px solid #f1f5f9', boxShadow:'0 4px 20px rgba(0,0,0,0.02)' };
const cardHead = { margin:'0 0 25px 0', fontSize:'16px', fontWeight:'800', color:'#1e293b', borderBottom:'1px solid #f8fafc', paddingBottom:'15px' };

const logItem = { display:'flex', gap:'15px', marginBottom:'22px' };
const logBold = { fontSize: '13px', color: '#1e293b' };
const dot = (color) => ({ width:'10px', height:'10px', borderRadius:'50%', background:color, marginTop:'4px', flexShrink:0, boxShadow:`0 0 10px ${color}66` });
const timeS = { display:'block', fontSize:'11px', color:'#94a3b8', marginTop:'4px', fontWeight:'600' };

export default OperatorOverview;