import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api'; 
import { useBranding } from '../../../context/BrandingContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler, RadialLinearScale } from 'chart.js';
import { Line, Bar, Doughnut, PolarArea } from 'react-chartjs-2';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler, RadialLinearScale);

const AdvancedAnalytics = () => {
    const { settings } = useBranding();
    const themeColor = settings?.themeColor || '#0f172a';
    
    // States
    const [analytics, setAnalytics] = useState({
        revenue: { daily: [], monthly: [], yearly: [] },
        orders: { status: [], trends: [], peakHours: [] },
        products: { topSelling: [], lowStock: [], categories: [] },
        customers: { demographics: [], retention: [], acquisition: [] },
        shops: { performance: [], rankings: [], growth: [] }
    });
    const [timeRange, setTimeRange] = useState('7d');
    const [loading, setLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState('revenue');

    // Fetch analytics data
    const fetchAnalytics = useCallback(async () => {
        try {
            const response = await api.get(`/admin/analytics/advanced?range=${timeRange}`);
            if (response.data?.success) {
                setAnalytics(response.data.data);
            }
        } catch (error) {
            console.error('Analytics fetch error:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(fetchAnalytics, 300000);
        return () => clearInterval(interval);
    }, [fetchAnalytics]);

    if (loading) {
        return (
            <div style={loaderStyle}>
                <div className="spinner" style={{ borderTopColor: themeColor }}></div>
                <p>Loading Advanced Analytics...</p>
            </div>
        );
    }

    // Chart configurations
    const revenueChart = {
        labels: analytics.revenue.daily.map(d => d.date) || [],
        datasets: [{
            label: 'Revenue (₹)',
            data: analytics.revenue.daily.map(d => d.amount) || [],
            borderColor: themeColor,
            backgroundColor: `${themeColor}15`,
            fill: true,
            tension: 0.4
        }]
    };

    const orderStatusChart = {
        labels: ['Pending', 'Accepted', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'],
        datasets: [{
            data: analytics.orders.status.map(s => s.count) || [0,0,0,0,0,0],
            backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#22c55e', '#ef4444']
        }]
    };

    const categoryPerformance = {
        labels: analytics.products.categories.map(c => c.name) || [],
        datasets: [{
            label: 'Products Sold',
            data: analytics.products.categories.map(c => c.sales) || [],
            backgroundColor: [
                '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
            ]
        }]
    };

    const customerRetention = {
        labels: ['New', 'Returning', 'Loyal', 'At Risk', 'Churned'],
        datasets: [{
            label: 'Customer Segments',
            data: analytics.customers.retention.map(r => r.count) || [0,0,0,0,0],
            backgroundColor: ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']
        }]
    };

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <div>
                    <h2 style={titleStyle}>📊 Advanced Analytics Hub</h2>
                    <p style={subtitleStyle}>AI-powered insights and real-time performance metrics</p>
                </div>
                <div style={controlsStyle}>
                    <select 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="1y">Last Year</option>
                    </select>
                    <button 
                        onClick={fetchAnalytics}
                        style={{...refreshBtn, backgroundColor: themeColor}}
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div style={metricsGrid}>
                <MetricCard 
                    title="Total Revenue" 
                    value={`₹${analytics.revenue.daily.reduce((a,b) => a + b.amount, 0).toLocaleString()}`}
                    change="+12.5%" 
                    trend="up"
                    color="#10b981"
                />
                <MetricCard 
                    title="Total Orders" 
                    value={analytics.orders.trends.reduce((a,b) => a + b.count, 0).toLocaleString()}
                    change="+8.2%" 
                    trend="up"
                    color="#3b82f6"
                />
                <MetricCard 
                    title="Active Customers" 
                    value={analytics.customers.demographics.length.toLocaleString()}
                    change="+15.3%" 
                    trend="up"
                    color="#8b5cf6"
                />
                <MetricCard 
                    title="Avg Order Value" 
                    value={`₹${Math.round(analytics.revenue.daily.reduce((a,b) => a + b.amount, 0) / analytics.orders.trends.reduce((a,b) => a + b.count, 1)).toLocaleString()}`}
                    change="-2.1%" 
                    trend="down"
                    color="#f59e0b"
                />
            </div>

            {/* Charts Grid */}
            <div style={chartsGrid}>
                {/* Revenue Trend */}
                <div style={chartCardStyle}>
                    <h3 style={chartTitle}>💰 Revenue Trend</h3>
                    <div style={chartContainer}>
                        <Line data={revenueChart} options={lineChartOptions} />
                    </div>
                </div>

                {/* Order Status Distribution */}
                <div style={chartCardStyle}>
                    <h3 style={chartTitle}>📦 Order Status</h3>
                    <div style={chartContainer}>
                        <Doughnut data={orderStatusChart} options={doughnutOptions} />
                    </div>
                </div>

                {/* Category Performance */}
                <div style={chartCardStyle}>
                    <h3 style={chartTitle}>🏷️ Category Performance</h3>
                    <div style={chartContainer}>
                        <Bar data={categoryPerformance} options={barChartOptions} />
                    </div>
                </div>

                {/* Customer Segments */}
                <div style={chartCardStyle}>
                    <h3 style={chartTitle}>👥 Customer Segments</h3>
                    <div style={chartContainer}>
                        <PolarArea data={customerRetention} options={polarOptions} />
                    </div>
                </div>
            </div>

            {/* Detailed Tables */}
            <div style={tablesSection}>
                <div style={tableCard}>
                    <h3 style={tableTitle}>🏆 Top Selling Products</h3>
                    <div style={tableContainer}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Product</th>
                                    <th style={thStyle}>Category</th>
                                    <th style={thStyle}>Sales</th>
                                    <th style={thStyle}>Revenue</th>
                                    <th style={thStyle}>Growth</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.products.topSelling.slice(0, 10).map((product, idx) => (
                                    <tr key={idx} style={trStyle}>
                                        <td style={tdStyle}>{product.name}</td>
                                        <td style={tdStyle}>{product.category}</td>
                                        <td style={tdStyle}>{product.sales}</td>
                                        <td style={tdStyle}>₹{product.revenue.toLocaleString()}</td>
                                        <td style={{...tdStyle, color: product.growth > 0 ? '#10b981' : '#ef4444'}}>
                                            {product.growth > 0 ? '↑' : '↓'} {Math.abs(product.growth)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={tableCard}>
                    <h3 style={tableTitle}>🏪 Shop Performance</h3>
                    <div style={tableContainer}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Shop Name</th>
                                    <th style={thStyle}>Orders</th>
                                    <th style={thStyle}>Revenue</th>
                                    <th style={thStyle}>Rating</th>
                                    <th style={thStyle}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.shops.performance.slice(0, 10).map((shop, idx) => (
                                    <tr key={idx} style={trStyle}>
                                        <td style={tdStyle}>{shop.name}</td>
                                        <td style={tdStyle}>{shop.orders}</td>
                                        <td style={tdStyle}>₹{shop.revenue.toLocaleString()}</td>
                                        <td style={tdStyle}>⭐ {shop.rating}</td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                ...statusBadge,
                                                backgroundColor: shop.status === 'Active' ? '#10b981' : '#f59e0b'
                                            }}>
                                                {shop.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                .spinner { 
                    width: 40px; height: 40px; border: 4px solid #f1f5f9; 
                    border-radius: 50%; animation: spin 1s linear infinite; 
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

// Helper Components
const MetricCard = ({ title, value, change, trend, color }) => (
    <div style={metricCardStyle}>
        <div style={metricHeader}>
            <span style={metricTitle}>{title}</span>
            <span style={{...metricChange, color: trend === 'up' ? '#10b981' : '#ef4444'}}>
                {trend === 'up' ? '↑' : '↓'} {change}
            </span>
        </div>
        <div style={{...metricValue, color}}>{value}</div>
    </div>
);

// Styles
const containerStyle = {
    padding: '20px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px'
};

const titleStyle = {
    fontSize: '28px',
    fontWeight: '900',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.5px'
};

const subtitleStyle = {
    color: '#64748b',
    fontSize: '14px',
    margin: '5px 0 0 0',
    fontWeight: '500'
};

const controlsStyle = {
    display: 'flex',
    gap: '15px',
    alignItems: 'center'
};

const selectStyle = {
    padding: '10px 15px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
};

const refreshBtn = {
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: '0.2s'
};

const loaderStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px',
    gap: '20px'
};

const metricsGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
};

const metricCardStyle = {
    background: '#fff',
    padding: '25px',
    borderRadius: '20px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
};

const metricHeader = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
};

const metricTitle = {
    fontSize: '12px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const metricChange = {
    fontSize: '12px',
    fontWeight: '700'
};

const metricValue = {
    fontSize: '24px',
    fontWeight: '900',
    color: '#0f172a'
};

const chartsGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '25px',
    marginBottom: '30px'
};

const chartCardStyle = {
    background: '#fff',
    padding: '25px',
    borderRadius: '20px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
};

const chartTitle = {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 20px 0'
};

const chartContainer = {
    height: '300px',
    position: 'relative'
};

const tablesSection = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '25px'
};

const tableCard = {
    background: '#fff',
    padding: '25px',
    borderRadius: '20px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
};

const tableTitle = {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 20px 0'
};

const tableContainer = {
    overflowX: 'auto'
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px'
};

const thStyle = {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '2px solid #f1f5f9',
    fontWeight: '700',
    color: '#64748b',
    fontSize: '12px',
    textTransform: 'uppercase'
};

const trStyle = {
    borderBottom: '1px solid #f8fafc'
};

const tdStyle = {
    padding: '12px',
    fontWeight: '600',
    color: '#1e293b'
};

const statusBadge = {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#fff'
};

// Chart options
const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { display: false } },
        y: { grid: { borderDash: [5, 5] } }
    }
};

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'bottom' }
    }
};

const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { display: false } },
        y: { grid: { borderDash: [5, 5] } }
    }
};

const polarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'bottom' }
    }
};

export default AdvancedAnalytics;
