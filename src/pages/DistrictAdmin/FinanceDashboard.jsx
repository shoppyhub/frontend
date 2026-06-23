import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import api from '../../services/api';

const FinanceDashboard = () => {
    const { user } = useAuth();
    const { settings } = useBranding();
    const [financialData, setFinancialData] = useState({
        revenue: { totalRevenue: 0, commission: 0, platformFee: 0 },
        orders: [],
        payoutsProcessed: 0
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30days');
    const [showPayoutForm, setShowPayoutForm] = useState(false);
    const [payoutData, setPayoutData] = useState({
        shopOwnerId: '',
        amount: '',
        settlementPeriod: '',
        remarks: ''
    });

    const themeColor = settings?.themeColor || '#0d9488';

    useEffect(() => {
        fetchFinanceData();
    }, [timeRange]);

    const fetchFinanceData = async () => {
        try {
            const response = await api.get('/admin/enhanced/finance/dashboard', {
                params: { timeRange }
            });
            if (response.data.success) {
                setFinancialData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching finance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayout = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/admin/enhanced/finance/payout', payoutData);
            if (response.data.success) {
                alert('पेआउट सफलतापूर्वक संसाधित किया गया');
                setPayoutData({
                    shopOwnerId: '',
                    amount: '',
                    settlementPeriod: '',
                    remarks: ''
                });
                setShowPayoutForm(false);
                fetchFinanceData();
            }
        } catch (error) {
            alert('त्रुटि: ' + error.response?.data?.message || error.message);
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>लोड हो रहा है...</div>;
    }

    const totalRevenue = financialData.revenue?.totalRevenue || 0;
    const commission = financialData.revenue?.commission || 0;
    const platformFee = financialData.revenue?.platformFee || 0;

    return (
        <div style={containerStyle}>
            <div style={headerStyle(themeColor)}>
                <h1 style={{ margin: 0, fontSize: '24px' }}>💰 वित्त प्रबंधन</h1>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="7days">पिछले 7 दिन</option>
                        <option value="30days">पिछले 30 दिन</option>
                        <option value="90days">पिछले 90 दिन</option>
                    </select>
                    <button
                        onClick={() => setShowPayoutForm(!showPayoutForm)}
                        style={{ ...btnStyle(themeColor), color: 'white' }}
                    >
                        {showPayoutForm ? '✕' : '➕ पेआउट'}
                    </button>
                </div>
            </div>

            {/* Payout Form */}
            {showPayoutForm && (
                <div style={formContainerStyle}>
                    <form onSubmit={handleProcessPayout} style={formStyle}>
                        <h3>व्यापारी पेआउट प्रक्रिया</h3>

                        <div style={formRowStyle}>
                            <div style={{ flex: 1, marginRight: '10px' }}>
                                <label>व्यापारी ID *</label>
                                <input
                                    type="text"
                                    value={payoutData.shopOwnerId}
                                    onChange={(e) => setPayoutData({ ...payoutData, shopOwnerId: e.target.value })}
                                    required
                                    style={inputStyle}
                                    placeholder="व्यापारी ID"
                                />
                            </div>

                            <div style={{ flex: 1 }}>
                                <label>राशि (₹) *</label>
                                <input
                                    type="number"
                                    value={payoutData.amount}
                                    onChange={(e) => setPayoutData({ ...payoutData, amount: e.target.value })}
                                    required
                                    style={inputStyle}
                                    placeholder="राशि"
                                />
                            </div>
                        </div>

                        <div style={formRowStyle}>
                            <div style={{ flex: 1, marginRight: '10px' }}>
                                <label>निपटान अवधि</label>
                                <select
                                    value={payoutData.settlementPeriod}
                                    onChange={(e) => setPayoutData({ ...payoutData, settlementPeriod: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="">-- चुनें --</option>
                                    <option value="Weekly">साप्ताहिक</option>
                                    <option value="Monthly">मासिक</option>
                                    <option value="Quarterly">त्रैमासिक</option>
                                </select>
                            </div>

                            <div style={{ flex: 1 }}>
                                <label>टिप्पणी</label>
                                <input
                                    type="text"
                                    value={payoutData.remarks}
                                    onChange={(e) => setPayoutData({ ...payoutData, remarks: e.target.value })}
                                    style={inputStyle}
                                    placeholder="टिप्पणी (वैकल्पिक)"
                                />
                            </div>
                        </div>

                        <div style={btnGroupStyle}>
                            <button type="submit" style={{ ...btnStyle(themeColor), flex: 1 }}>
                                ✅ पेआउट प्रक्रिया करें
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowPayoutForm(false)}
                                style={{ ...btnStyle('#999'), flex: 1 }}
                            >
                                ✕ रद्द करें
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Financial Overview */}
            <div style={metricsGridStyle}>
                <MetricCard
                    title="कुल राजस्व"
                    value={`₹${totalRevenue.toLocaleString()}`}
                    icon="💰"
                    color="#4CAF50"
                />
                <MetricCard
                    title="कमीशन"
                    value={`₹${commission.toLocaleString()}`}
                    icon="📊"
                    color="#FF9800"
                />
                <MetricCard
                    title="प्लेटफॉर्म शुल्क"
                    value={`₹${platformFee.toLocaleString()}`}
                    icon="💳"
                    color="#2196F3"
                />
                <MetricCard
                    title="पेआउट प्रसंस्कृत"
                    value={financialData.payoutsProcessed || 0}
                    icon="✅"
                    color="#9C27B0"
                />
            </div>

            {/* Order Status Breakdown */}
            <div style={statusSectionStyle}>
                <h2 style={{ marginTop: 0, color: themeColor }}>📦 आदेश विश्लेषण</h2>
                <div style={statusGridStyle}>
                    {financialData.orders && financialData.orders.length > 0 ? (
                        financialData.orders.map((order, idx) => (
                            <StatusCard
                                key={idx}
                                status={order._id}
                                count={order.count}
                                themeColor={themeColor}
                            />
                        ))
                    ) : (
                        <p style={{ color: '#999' }}>कोई डेटा उपलब्ध नहीं</p>
                    )}
                </div>
            </div>

            {/* Summary */}
            <div style={summaryStyle}>
                <h2 style={{ marginTop: 0, color: themeColor }}>📋 सारांश</h2>
                <div style={summaryGridStyle}>
                    <SummaryItem
                        label="कुल राजस्व"
                        value={`₹${totalRevenue.toLocaleString()}`}
                        trend="+12%"
                        icon="📈"
                    />
                    <SummaryItem
                        label="शुद्ध आय"
                        value={`₹${(totalRevenue - commission - platformFee).toLocaleString()}`}
                        trend="+8%"
                        icon="📊"
                    />
                    <SummaryItem
                        label="औसत ऑर्डर मूल्य"
                        value={`₹${financialData.orders?.length > 0 ? Math.round(totalRevenue / financialData.orders.reduce((a, o) => a + o.count, 0)) : 0}`}
                        trend="+5%"
                        icon="💵"
                    />
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon, color }) => (
    <div style={metricCardStyle(color)}>
        <span style={{ fontSize: '32px', marginBottom: '10px' }}>{icon}</span>
        <p style={{ margin: '10px 0', color: '#666', fontSize: '13px' }}>{title}</p>
        <h2 style={{ margin: 0, color: color, fontSize: '22px' }}>{value}</h2>
    </div>
);

const StatusCard = ({ status, count, themeColor }) => {
    const statusColors = {
        'Pending': '#FFC107',
        'Processing': '#2196F3',
        'Delivered': '#4CAF50',
        'Cancelled': '#f44336'
    };

    return (
        <div style={{ ...statusCardStyle, backgroundColor: statusColors[status] + '20', borderLeft: `4px solid ${statusColors[status]}` }}>
            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '12px' }}>{status}</p>
            <h3 style={{ margin: 0, color: statusColors[status], fontSize: '24px' }}>{count}</h3>
        </div>
    );
};

const SummaryItem = ({ label, value, trend, icon }) => (
    <div style={summaryItemStyle}>
        <span style={{ fontSize: '28px' }}>{icon}</span>
        <div style={{ marginLeft: '15px' }}>
            <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '12px' }}>{label}</p>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>{value}</h3>
            <span style={{ color: '#4CAF50', fontSize: '12px', fontWeight: '600' }}>{trend}</span>
        </div>
    </div>
);

// ==================== STYLES ====================

const containerStyle = {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto'
};

const headerStyle = (themeColor) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: themeColor,
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px'
});

const selectStyle = {
    padding: '10px',
    border: '1px solid white',
    borderRadius: '5px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer'
};

const btnStyle = (color) => ({
    padding: '10px 20px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    border: '2px solid white',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white'
});

const formContainerStyle = {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #e0e0e0'
};

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
};

const formRowStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px'
};

const inputStyle = {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    fontFamily: 'inherit'
};

const btnGroupStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
};

const metricsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
};

const metricCardStyle = (color) => ({
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    borderTop: `4px solid ${color}`,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
});

const statusSectionStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const statusGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
};

const statusCardStyle = {
    padding: '15px',
    borderRadius: '8px'
};

const summaryStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const summaryGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
};

const summaryItemStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px'
};

export default FinanceDashboard;
