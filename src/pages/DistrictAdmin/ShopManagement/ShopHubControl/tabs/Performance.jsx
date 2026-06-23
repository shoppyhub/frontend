import React from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend, 
    ArcElement, 
    Filler 
} from 'chart.js';

// Registering ChartJS Modules
ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, 
    BarElement, Title, Tooltip, Legend, ArcElement, Filler
);

/**
 * RKD MART - PERFORMANCE & ANALYTICS TAB (ULTRA PRO)
 * दुकानदार की बिक्री, ऑर्डर्स और सर्विस क्वालिटी का विज़ुअल डेटा
 */
const Performance = ({ stats, theme }) => {

    // --- 1. रिवेन्यू ट्रेंड डेटा (Line Chart) ---
    const revenueTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Revenue (₹)',
            data: [4500, 7800, 12000, 9500, 15000, stats?.totalSales || 18000],
            borderColor: theme,
            backgroundColor: theme + '20',
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 8
        }]
    };

    // --- 2. ऑर्डर स्टेटस डिस्ट्रीब्यूशन (Doughnut Chart) ---
    const orderStatusData = {
        labels: ['Delivered', 'Pending', 'Cancelled'],
        datasets: [{
            data: [stats?.completedOrders || 85, 10, 5],
            backgroundColor: [theme, '#f59e0b', '#f43f5e'],
            borderWidth: 0,
            hoverOffset: 10
        }]
    };

    return (
        <div style={containerS}>
            {/* --- TOP METRICS GRID --- */}
            <div style={metricsGridS}>
                <MetricCard 
                    icon="💰" 
                    label="Gross Revenue" 
                    val={`₹${(stats?.totalSales || 0).toLocaleString('en-IN')}`} 
                    sub="Lifetime Earnings" 
                    col={theme} 
                />
                <MetricCard 
                    icon="🛒" 
                    label="Total Orders" 
                    val={stats?.totalOrders || 0} 
                    sub="Completed Units" 
                    col="#6366f1" 
                />
                <MetricCard 
                    icon="⭐" 
                    label="Service Rating" 
                    val={`${stats?.avgRating || '4.8'} / 5`} 
                    sub="Customer Feedback" 
                    col="#f59e0b" 
                />
                <MetricCard 
                    icon="👥" 
                    label="Active Customers" 
                    val={stats?.uniqueCustomers || 0} 
                    sub="Loyal Base" 
                    col="#10b981" 
                />
            </div>

            {/* --- ANALYTICS CHARTS SECTION --- */}
            <div style={chartsGridS}>
                {/* Revenue Growth Chart */}
                <div style={chartCardS}>
                    <div style={chartHeaderS}>
                        <h4 style={chartTitleS}>📈 REVENUE PROJECTION</h4>
                        <small style={chartSubS}>Last 6 months telemetry</small>
                    </div>
                    <div style={{height:'300px'}}>
                        <Line data={revenueTrendData} options={chartOptions} />
                    </div>
                </div>

                {/* Order Composition Chart */}
                <div style={chartCardS}>
                    <div style={chartHeaderS}>
                        <h4 style={chartTitleS}>📦 ORDER LIFECYCLE</h4>
                        <small style={chartSubS}>Fulfillment distribution</small>
                    </div>
                    <div style={{height:'240px', display:'flex', justifyContent:'center'}}>
                        <Doughnut data={orderStatusData} options={{ maintainAspectRatio: false, cutout: '70%' }} />
                    </div>
                    <div style={legendGridS}>
                        <LegendItem label="Delivered" col={theme} />
                        <LegendItem label="Pending" col="#f59e0b" />
                        <LegendItem label="Cancelled" col="#f43f5e" />
                    </div>
                </div>
            </div>

            {/* --- BOTTOM PERFORMANCE INSIGHTS --- */}
            <div style={insightsCardS}>
                <h4 style={chartTitleS}>💡 OPERATIONAL INSIGHTS</h4>
                <div style={insightListS}>
                    <InsightRow label="Conversion Rate" val={`${stats?.conversionRate || '12'}%`} />
                    <InsightRow label="Avg. Order Value" val={`₹${Math.round((stats?.totalSales || 0) / (stats?.totalOrders || 1))}`} />
                    <InsightRow label="Return Rate" val="2.4%" />
                    <InsightRow label="Store Health" val="Excellent" isSuccess />
                </div>
            </div>
        </div>
    );
};

// --- Reusable Mini Components ---

const MetricCard = ({ icon, label, val, sub, col }) => (
    <div style={metCardS(col)}>
        <div style={metIconS(col)}>{icon}</div>
        <div>
            <div style={metValS}>{val}</div>
            <div style={metLabS}>{label}</div>
            <div style={metSubS}>{sub}</div>
        </div>
    </div>
);

const LegendItem = ({ label, col }) => (
    <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
        <div style={{width:'10px', height:'10px', borderRadius:'50%', background: col}}></div>
        <span style={{fontSize:'11px', fontWeight:'700', color:'#64748b'}}>{label}</span>
    </div>
);

const InsightRow = ({ label, val, isSuccess }) => (
    <div style={insRowS}>
        <span style={{color:'#64748b', fontWeight:'600'}}>{label}</span>
        <b style={{color: isSuccess ? '#10b981' : '#1e293b'}}>{val}</b>
    </div>
);

// --- Chart Configuration ---
const chartOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
        x: { grid: { display: false } }
    }
};

// --- CSS STYLES (अल्ट्रा प्रो लेवल) ---
const containerS = { animation: 'fadeIn 0.5s ease' };
const metricsGridS = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'20px', marginBottom:'30px' };

const metCardS = (col) => ({ background:'#fff', padding:'25px', borderRadius:'24px', border:`1px solid #f1f5f9`, borderLeft:`6px solid ${col}`, display:'flex', alignItems:'center', gap:'20px', boxShadow:'0 4px 15px rgba(0,0,0,0.02)' });
const metIconS = (col) => ({ width:'55px', height:'55px', borderRadius:'16px', background: col + '10', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'24px' });
const metValS = { fontSize:'22px', fontWeight:'900', color:'#1e293b' };
const metLabS = { fontSize:'11px', fontWeight:'850', color:'#94a3b8', textTransform:'uppercase', marginTop:'2px' };
const metSubS = { fontSize:'10px', color:'#cbd5e1', marginTop:'2px' };

const chartsGridS = { display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'25px', marginBottom:'30px' };
const chartCardS = { background:'#fff', padding:'30px', borderRadius:'32px', border:'1px solid #f1f5f9', boxShadow:'0 10px 30px rgba(0,0,0,0.02)' };
const chartHeaderS = { marginBottom:'25px' };
const chartTitleS = { margin:0, fontSize:'15px', fontWeight:'900', color:'#0f172a', letterSpacing:'0.5px' };
const chartSubS = { color:'#94a3b8', fontSize:'11px', fontWeight:'600' };

const legendGridS = { display:'flex', justifyContent:'center', gap:'20px', marginTop:'20px' };

const insightsCardS = { background:'#f8fafc', padding:'30px', borderRadius:'24px', border:'1px solid #e2e8f0' };
const insightListS = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'30px', marginTop:'20px' };
const insRowS = { display:'flex', justifyContent:'space-between', paddingBottom:'10px', borderBottom:'1px solid #e2e8f0', fontSize:'13px' };

export default Performance;