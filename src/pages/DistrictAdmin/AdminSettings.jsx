import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import api from '../../services/api';

const AdminSettings = () => {
    const { user } = useAuth();
    const { settings } = useBranding();
    const [adminSettings, setAdminSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        preferences: {}
    });

    const themeColor = settings?.themeColor || '#0d9488';

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/admin/enhanced/settings');
            if (response.data.success) {
                setAdminSettings(response.data.data);
                setFormData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/admin/enhanced/settings/update', {
                preferences: formData.preferences
            });
            if (response.data.success) {
                alert('सेटिंग्स सफलतापूर्वक सहेजी गई');
                setEditing(false);
                fetchSettings();
            }
        } catch (error) {
            alert('त्रुटि: ' + error.message);
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>लोड हो रहा है...</div>;
    }

    if (!adminSettings) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>सेटिंग्स उपलब्ध नहीं</div>;
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle(themeColor)}>
                <h1 style={{ margin: 0, fontSize: '24px' }}>⚙️ प्रशासन सेटिंग्स</h1>
                <button
                    onClick={() => setEditing(!editing)}
                    style={{ ...btnStyle(themeColor), color: 'white' }}
                >
                    {editing ? '✕ रद्द करें' : '✏️ संपादित करें'}
                </button>
            </div>

            {/* Profile Information */}
            <div style={sectionStyle}>
                <h2 style={{ marginTop: 0, color: themeColor }}>👤 प्रोफ़ाइल जानकारी</h2>
                <div style={infoGridStyle}>
                    <InfoItem label="नाम" value={user?.fullName} />
                    <InfoItem label="ईमेल" value={user?.email} />
                    <InfoItem label="भूमिका" value={adminSettings.role} />
                    <InfoItem label="विभाग" value={adminSettings.department || 'सामान्य'} />
                    <InfoItem 
                        label="अधिकार क्षेत्र" 
                        value={adminSettings.jurisdiction} 
                    />
                    <InfoItem label="अनुमतियां" value={Object.keys(adminSettings.permissions || {}).length} />
                </div>
            </div>

            {/* Permissions Overview */}
            <div style={sectionStyle}>
                <h2 style={{ marginTop: 0, color: themeColor }}>🔐 अनुमतियां</h2>
                <div style={permissionGridStyle}>
                    {Object.entries(adminSettings.permissions || {}).map(([key, value]) => (
                        <PermissionItem
                            key={key}
                            name={key}
                            enabled={value}
                            themeColor={themeColor}
                        />
                    ))}
                    {Object.keys(adminSettings.permissions || {}).length === 0 && (
                        <p style={{ color: '#999' }}>कोई अनुमति नहीं मिली</p>
                    )}
                </div>
            </div>

            {/* Preferences */}
            <div style={sectionStyle}>
                <h2 style={{ marginTop: 0, color: themeColor }}>🎨 प्राथमिकताएं</h2>
                
                {editing ? (
                    <form onSubmit={handleSaveSettings} style={formStyle}>
                        <div style={formGroupStyle}>
                            <label>डैशबोर्ड लेआउट</label>
                            <select
                                value={formData.preferences?.dashboardLayout || 'compact'}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    preferences: {
                                        ...formData.preferences,
                                        dashboardLayout: e.target.value
                                    }
                                })}
                                style={selectStyle}
                            >
                                <option value="compact">कॉम्पैक्ट</option>
                                <option value="expanded">विस्तृत</option>
                                <option value="minimal">न्यूनतम</option>
                            </select>
                        </div>

                        <div style={formGroupStyle}>
                            <label>ऑटो-रिफ्रेश अंतराल (सेकंड)</label>
                            <input
                                type="number"
                                value={formData.preferences?.autoRefreshInterval || 120}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    preferences: {
                                        ...formData.preferences,
                                        autoRefreshInterval: parseInt(e.target.value)
                                    }
                                })}
                                style={inputStyle}
                                min="30"
                                max="600"
                            />
                        </div>

                        <div style={checkboxGroupStyle}>
                            <h3 style={{ marginTop: 0 }}>📬 सूचना सेटिंग्स</h3>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.preferences?.notificationSettings?.emailNotifications !== false}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        preferences: {
                                            ...formData.preferences,
                                            notificationSettings: {
                                                ...formData.preferences?.notificationSettings,
                                                emailNotifications: e.target.checked
                                            }
                                        }
                                    })}
                                />
                                ईमेल सूचनाएं सक्षम करें
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.preferences?.notificationSettings?.smsNotifications === true}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        preferences: {
                                            ...formData.preferences,
                                            notificationSettings: {
                                                ...formData.preferences?.notificationSettings,
                                                smsNotifications: e.target.checked
                                            }
                                        }
                                    })}
                                />
                                SMS सूचनाएं सक्षम करें
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.preferences?.notificationSettings?.pushNotifications !== false}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        preferences: {
                                            ...formData.preferences,
                                            notificationSettings: {
                                                ...formData.preferences?.notificationSettings,
                                                pushNotifications: e.target.checked
                                            }
                                        }
                                    })}
                                />
                                पुश सूचनाएं सक्षम करें
                            </label>
                        </div>

                        <div style={formGroupStyle}>
                            <label>भाषा</label>
                            <select
                                value={formData.preferences?.language || 'hi'}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    preferences: {
                                        ...formData.preferences,
                                        language: e.target.value
                                    }
                                })}
                                style={selectStyle}
                            >
                                <option value="hi">हिंदी</option>
                                <option value="en">English</option>
                            </select>
                        </div>

                        <button type="submit" style={{ ...btnStyle(themeColor), width: '100%', marginTop: '15px' }}>
                            ✅ परिवर्तन सहेजें
                        </button>
                    </form>
                ) : (
                    <div style={preferencesDisplayStyle}>
                        <PreferenceRow 
                            label="डैशबोर्ड लेआउट"
                            value={adminSettings.preferences?.dashboardLayout || 'कॉम्पैक्ट'}
                        />
                        <PreferenceRow
                            label="ऑटो-रिफ्रेश अंतराल"
                            value={`${adminSettings.preferences?.autoRefreshInterval || 120} सेकंड`}
                        />
                        <PreferenceRow
                            label="ईमेल सूचनाएं"
                            value={adminSettings.preferences?.notificationSettings?.emailNotifications !== false ? 'सक्षम' : 'अक्षम'}
                        />
                        <PreferenceRow
                            label="भाषा"
                            value={adminSettings.preferences?.language === 'en' ? 'English' : 'हिंदी'}
                        />
                    </div>
                )}
            </div>

            {/* Security Section */}
            <div style={sectionStyle}>
                <h2 style={{ marginTop: 0, color: themeColor }}>🔒 सुरक्षा</h2>
                <div style={securityGridStyle}>
                    <SecurityItem
                        icon="🔐"
                        label="पासवर्ड बदलें"
                        description="अपना पासवर्ड अपडेट करें"
                        action="बदलें"
                        themeColor={themeColor}
                    />
                    <SecurityItem
                        icon="📱"
                        label="डिवाइस प्रबंधन"
                        description="अधिकृत डिवाइस देखें"
                        action="प्रबंधित करें"
                        themeColor={themeColor}
                    />
                    <SecurityItem
                        icon="📋"
                        label="लॉगिन इतिहास"
                        description="हाल की लॉगिन गतिविधि"
                        action="देखें"
                        themeColor={themeColor}
                    />
                </div>
            </div>

            {/* About Section */}
            <div style={sectionStyle}>
                <h2 style={{ marginTop: 0, color: themeColor }}>ℹ️ जानकारी</h2>
                <div style={aboutStyle}>
                    <p>
                        <strong>संस्करण:</strong> 1.0.0
                    </p>
                    <p>
                        <strong>अंतिम अपडेट:</strong> {new Date().toLocaleDateString('hi-IN')}
                    </p>
                    <p style={{ fontSize: '13px', color: '#666' }}>
                        यह प्रशासन सेटिंग्स पैनल आपको अपने खाते और प्राथमिकताओं को प्रबंधित करने की अनुमति देता है।
                    </p>
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div style={infoItemStyle}>
        <span style={{ color: '#666', fontSize: '12px' }}>{label}</span>
        <p style={{ margin: '5px 0 0 0', fontSize: '16px', fontWeight: '600' }}>
            {value || 'N/A'}
        </p>
    </div>
);

const PermissionItem = ({ name, enabled, themeColor }) => (
    <div style={{
        ...permissionItemStyle,
        borderColor: enabled ? themeColor : '#ccc',
        backgroundColor: enabled ? themeColor + '10' : '#f5f5f5'
    }}>
        <span style={{ fontSize: '18px' }}>
            {enabled ? '✅' : '⭕'}
        </span>
        <p style={{ margin: '5px 0 0 0', fontWeight: '600', color: enabled ? themeColor : '#666' }}>
            {name}
        </p>
    </div>
);

const PreferenceRow = ({ label, value }) => (
    <div style={preferenceRowStyle}>
        <span style={{ color: '#666' }}>{label}</span>
        <span style={{ fontWeight: '600', color: '#333' }}>{value}</span>
    </div>
);

const SecurityItem = ({ icon, label, description, action, themeColor }) => (
    <div style={securityItemStyle}>
        <span style={{ fontSize: '24px' }}>{icon}</span>
        <div style={{ flex: 1, marginLeft: '15px' }}>
            <h4 style={{ margin: '0 0 5px 0' }}>{label}</h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{description}</p>
        </div>
        <button style={{ ...securityActionBtnStyle(themeColor) }}>
            {action}
        </button>
    </div>
);

// ==================== STYLES ====================

const containerStyle = {
    padding: '20px',
    maxWidth: '1200px',
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

const btnStyle = (color) => ({
    padding: '10px 20px',
    backgroundColor: color,
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
});

const sectionStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const infoGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px'
};

const infoItemStyle = {
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '5px'
};

const permissionGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px'
};

const permissionItemStyle = {
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid',
    textAlign: 'center'
};

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
};

const formGroupStyle = {
    display: 'flex',
    flexDirection: 'column'
};

const selectStyle = {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    fontFamily: 'inherit'
};

const inputStyle = {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    fontFamily: 'inherit'
};

const checkboxGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
};

const preferencesDisplayStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
};

const preferenceRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '5px'
};

const securityGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '15px'
};

const securityItemStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px'
};

const securityActionBtnStyle = (themeColor) => ({
    padding: '8px 16px',
    backgroundColor: themeColor,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    marginLeft: '10px'
});

const aboutStyle = {
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px'
};

export default AdminSettings;
