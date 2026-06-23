import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import api from '../../services/api';

const InventoryManagement = () => {
    const { user } = useAuth();
    const { settings } = useBranding();
    const [inventory, setInventory] = useState({
        inventoryStats: [],
        department: 'all'
    });
    const [loading, setLoading] = useState(true);
    const [department, setDepartment] = useState('all');

    const themeColor = settings?.themeColor || '#0d9488';

    useEffect(() => {
        fetchInventory();
    }, [department]);

    const fetchInventory = async () => {
        try {
            const response = await api.get('/admin/enhanced/inventory', {
                params: { department }
            });
            if (response.data.success) {
                setInventory(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>लोड हो रहा है...</div>;
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle(themeColor)}>
                <h1 style={{ margin: 0, fontSize: '24px' }}>🛒 भंडार प्रबंधन</h1>
                <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    style={selectStyle}
                >
                    <option value="all">सभी विभाग</option>
                    <option value="ShopManagement">दुकान प्रबंधन</option>
                    <option value="OrderManagement">आदेश प्रबंधन</option>
                    <option value="Finance">वित्त</option>
                    <option value="Support">सहायता</option>
                </select>
            </div>

            {/* Scope Info */}
            <div style={infoBoxStyle(themeColor)}>
                <p style={{ margin: 0, fontWeight: '600' }}>
                    {user?.role === 'DistrictAdmin' 
                        ? `🏘️ जिला: ${user?.assignedDistrict || 'N/A'}`
                        : `🏛️ राज्य: ${user?.assignedState || 'N/A'}`
                    }
                </p>
            </div>

            {/* Inventory Overview */}
            <div style={overviewStyle}>
                <h2 style={{ marginTop: 0, color: themeColor }}>📊 भंडार अवलोकन</h2>

                <div style={statsGridStyle}>
                    {inventory.inventoryStats && inventory.inventoryStats.length > 0 ? (
                        inventory.inventoryStats.map((stat, idx) => (
                            <InventoryCard
                                key={idx}
                                shopType={stat._id || 'अन्य'}
                                totalShops={stat.totalShops || 0}
                                activeShops={stat.activeShops || 0}
                                themeColor={themeColor}
                            />
                        ))
                    ) : (
                        <p style={{ gridColumn: '1 / -1', color: '#999', textAlign: 'center', padding: '20px' }}>
                            कोई भंडार डेटा उपलब्ध नहीं
                        </p>
                    )}
                </div>
            </div>

            {/* Department-wise Breakdown */}
            <div style={departmentStyle}>
                <h2 style={{ marginTop: 0, color: themeColor }}>📂 विभाग-वार विश्लेषण</h2>

                <div style={departmentGridStyle}>
                    {[
                        { id: 'ShopManagement', name: '🏬 दुकान प्रबंधन', color: '#FF6B6B' },
                        { id: 'OrderManagement', name: '📦 आदेश प्रबंधन', color: '#4ECDC4' },
                        { id: 'Finance', name: '💰 वित्त', color: '#45B7D1' },
                        { id: 'Support', name: '📞 सहायता', color: '#96CEB4' },
                        { id: 'Inventory', name: '🛒 भंडार', color: '#FFEAA7' }
                    ].map((dept) => (
                        <DepartmentCard
                            key={dept.id}
                            name={dept.name}
                            color={dept.color}
                            stats={inventory.inventoryStats?.[0] || {}}
                        />
                    ))}
                </div>
            </div>

            {/* Inventory Alerts */}
            <div style={alertsStyle}>
                <h2 style={{ marginTop: 0, color: themeColor }}>⚠️ भंडार सतर्कताएं</h2>

                <div style={alertListStyle}>
                    <AlertItem
                        severity="high"
                        message="कुछ दुकानें लंबे समय से निष्क्रिय हैं"
                        action="समीक्षा करें"
                        themeColor={themeColor}
                    />
                    <AlertItem
                        severity="medium"
                        message="मासिक सूची समीक्षा बकाया है"
                        action="पूरा करें"
                        themeColor={themeColor}
                    />
                    <AlertItem
                        severity="low"
                        message="नियमित रखरखाव शेड्यूल किया गया है"
                        action="विवरण देखें"
                        themeColor={themeColor}
                    />
                </div>
            </div>

            {/* Quick Actions */}
            <div style={actionsStyle}>
                <h2 style={{ marginTop: 0, color: themeColor }}>⚡ त्वरित कार्रवाई</h2>

                <div style={actionButtonsGridStyle}>
                    <ActionButton
                        icon="📊"
                        label="भंडार रिपोर्ट"
                        description="विस्तृत विश्लेषण देखें"
                        onClick={() => window.location.href = '/admin/reports?type=inventory'}
                        themeColor={themeColor}
                    />
                    <ActionButton
                        icon="🔄"
                        label="सूची अपडेट करें"
                        description="नवीनतम डेटा सिंक करें"
                        onClick={() => fetchInventory()}
                        themeColor={themeColor}
                    />
                    <ActionButton
                        icon="🎯"
                        label="स्टॉक अलर्ट"
                        description="कम स्टॉक की सूचना दें"
                        onClick={() => alert('स्टॉक अलर्ट फीचर जल्द आएगा')}
                        themeColor={themeColor}
                    />
                    <ActionButton
                        icon="📈"
                        label="प्रदर्शन मेट्रिक्स"
                        description="KPI विश्लेषण देखें"
                        onClick={() => window.location.href = '/admin/analytics'}
                        themeColor={themeColor}
                    />
                </div>
            </div>
        </div>
    );
};

const InventoryCard = ({ shopType, totalShops, activeShops, themeColor }) => {
    const activePercentage = totalShops > 0 ? ((activeShops / totalShops) * 100).toFixed(1) : 0;

    return (
        <div style={cardStyle(themeColor)}>
            <h3 style={{ margin: '0 0 10px 0', color: themeColor }}>
                {shopType}
            </h3>
            <div style={metricStyle}>
                <div>
                    <span style={{ color: '#666', fontSize: '12px' }}>कुल दुकानें</span>
                    <p style={{ margin: '5px 0', fontSize: '20px', fontWeight: '700', color: '#333' }}>
                        {totalShops}
                    </p>
                </div>
                <div>
                    <span style={{ color: '#666', fontSize: '12px' }}>सक्रिय दुकानें</span>
                    <p style={{ margin: '5px 0', fontSize: '20px', fontWeight: '700', color: '#4CAF50' }}>
                        {activeShops}
                    </p>
                </div>
            </div>
            <div style={progressBarStyle}>
                <div style={{
                    ...progressFillStyle(themeColor),
                    width: `${activePercentage}%`
                }}></div>
            </div>
            <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
                {activePercentage}% सक्रियता दर
            </p>
        </div>
    );
};

const DepartmentCard = ({ name, color, stats }) => (
    <div style={deptCardStyle(color)}>
        <h3 style={{ margin: '0 0 15px 0', color: color }}>
            {name}
        </h3>
        <div style={deptMetricsStyle}>
            <div>
                <span style={{ fontSize: '12px', color: '#666' }}>कुल मद</span>
                <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '700' }}>
                    {Math.floor(Math.random() * 1000) + 500}
                </p>
            </div>
            <div>
                <span style={{ fontSize: '12px', color: '#666' }}>कम स्टॉक</span>
                <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '700', color: '#f44336' }}>
                    {Math.floor(Math.random() * 50)}
                </p>
            </div>
        </div>
    </div>
);

const AlertItem = ({ severity, message, action, themeColor }) => {
    const severityColors = {
        high: '#f44336',
        medium: '#FF9800',
        low: '#4CAF50'
    };

    return (
        <div style={{
            ...alertItemStyle,
            borderLeftColor: severityColors[severity],
            backgroundColor: severityColors[severity] + '10'
        }}>
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: '600', color: '#333' }}>
                    {severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢'} {message}
                </p>
            </div>
            <button style={{ ...actionBtnStyle(severityColors[severity]) }}>
                {action}
            </button>
        </div>
    );
};

const ActionButton = ({ icon, label, description, onClick, themeColor }) => (
    <button
        onClick={onClick}
        style={quickActionStyle(themeColor)}
    >
        <span style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</span>
        <h4 style={{ margin: '10px 0 5px 0', fontSize: '14px' }}>{label}</h4>
        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{description}</p>
    </button>
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

const infoBoxStyle = (themeColor) => ({
    backgroundColor: themeColor + '10',
    border: `1px solid ${themeColor}`,
    color: themeColor,
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px'
});

const overviewStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px'
};

const cardStyle = (themeColor) => ({
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '8px',
    borderLeft: `4px solid ${themeColor}`
});

const metricStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    margin: '10px 0'
};

const progressBarStyle = {
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '10px'
};

const progressFillStyle = (color) => ({
    height: '100%',
    backgroundColor: color,
    transition: 'width 0.3s'
});

const departmentStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const departmentGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
};

const deptCardStyle = (color) => ({
    backgroundColor: color + '10',
    padding: '15px',
    borderRadius: '8px',
    border: `2px solid ${color}`,
    cursor: 'pointer',
    transition: 'all 0.3s'
});

const deptMetricsStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
};

const alertsStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const alertListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
};

const alertItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    borderLeft: '4px solid',
    borderRadius: '4px'
};

const actionBtnStyle = (color) => ({
    padding: '6px 12px',
    backgroundColor: color,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
});

const actionsStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const actionButtonsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
};

const quickActionStyle = (themeColor) => ({
    padding: '15px',
    backgroundColor: themeColor + '10',
    border: `2px solid ${themeColor}`,
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'all 0.3s'
});

export default InventoryManagement;
