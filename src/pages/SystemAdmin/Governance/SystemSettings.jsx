import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useBranding } from '../../../context/BrandingContext';

/**
 * ⚙️ SYSTEM ADMIN - SYSTEM SETTINGS
 * Configure all platform-wide settings
 */

const SystemSettings = () => {
    const { settings } = useBranding();
    const [systemSettings, setSystemSettings] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    const themeColor = settings?.themeColor || '#0f172a';

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/global/settings');
            setSystemSettings(res.data.settings);
            setFormData(res.data.settings);
        } catch (err) {
            console.error('Error fetching settings:', err);
            setMessage({ type: 'error', text: 'Failed to load settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            await api.put('/admin/global/settings', { settings: formData });
            setMessage({ type: 'success', text: 'Settings updated successfully' });
            setEditMode(false);
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
            setMessage({ type: 'error', text: 'Failed to save settings' });
        }
    };

    if (loading) return <div style={styles.loader}>Loading settings...</div>;

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>⚙️ System Configuration</h1>
                    <p style={styles.subtitle}>Manage all platform-wide settings</p>
                </div>
                <button
                    onClick={() => editMode ? handleSaveSettings() : setEditMode(true)}
                    style={{...styles.mainButton, backgroundColor: themeColor}}
                >
                    {editMode ? '✅ Save Changes' : '✏️ Edit Settings'}
                </button>
            </div>

            {/* MESSAGE */}
            {message && (
                <div style={{
                    ...styles.message,
                    backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                    color: message.type === 'success' ? '#065f46' : '#991b1b'
                }}>
                    {message.text}
                </div>
            )}

            {/* SETTINGS SECTIONS */}
            {systemSettings && (
                <div style={styles.settingsSections}>
                    {/* PLATFORM */}
                    <SettingsSection
                        title="📱 Platform Configuration"
                        icon="📱"
                        settings={[
                            { label: 'Platform Name', key: 'platform.name', value: formData.platform?.name },
                            { label: 'Version', key: 'platform.version', value: formData.platform?.version, readOnly: true },
                            { label: 'Timezone', key: 'platform.timezone', value: formData.platform?.timezone, type: 'select', options: ['IST', 'UTC', 'EST'] },
                            { label: 'Default Language', key: 'platform.language', value: formData.platform?.language, type: 'select', options: ['hi', 'en'] }
                        ]}
                        onUpdate={(key, value) => updateNestedValue(key, value)}
                        editable={editMode}
                    />

                    {/* PAYMENT */}
                    <SettingsSection
                        title="💳 Payment Configuration"
                        icon="💳"
                        settings={[
                            { label: 'Payment Gateway', key: 'payment.gateway', value: formData.payment?.gateway },
                            { label: 'Commission % (0-100)', key: 'payment.commissionPercentage', value: formData.payment?.commissionPercentage, type: 'number' },
                            { label: 'Platform Fee % (0-100)', key: 'payment.platformFeePercentage', value: formData.payment?.platformFeePercentage, type: 'number' }
                        ]}
                        onUpdate={(key, value) => updateNestedValue(key, value)}
                        editable={editMode}
                    />

                    {/* EMAIL */}
                    <SettingsSection
                        title="📧 Email Settings"
                        icon="📧"
                        settings={[
                            { label: 'Email From', key: 'email.from', value: formData.email?.from },
                            { label: 'SMTP Host', key: 'email.host', value: formData.email?.host },
                            { label: 'SMTP Port', key: 'email.port', value: formData.email?.port, type: 'number' },
                            { label: 'Enable Notifications', key: 'email.enableNotifications', value: formData.email?.enableNotifications, type: 'checkbox' }
                        ]}
                        onUpdate={(key, value) => updateNestedValue(key, value)}
                        editable={editMode}
                    />

                    {/* SMS */}
                    <SettingsSection
                        title="📱 SMS Settings"
                        icon="📱"
                        settings={[
                            { label: 'SMS Provider', key: 'sms.provider', value: formData.sms?.provider, type: 'select', options: ['twilio', 'aws', 'custom'] },
                            { label: 'Enable Notifications', key: 'sms.enableNotifications', value: formData.sms?.enableNotifications, type: 'checkbox' }
                        ]}
                        onUpdate={(key, value) => updateNestedValue(key, value)}
                        editable={editMode}
                    />

                    {/* SECURITY */}
                    <SettingsSection
                        title="🔐 Security Settings"
                        icon="🔐"
                        settings={[
                            { label: 'Session Timeout (seconds)', key: 'security.sessionTimeout', value: formData.security?.sessionTimeout, type: 'number' },
                            { label: 'Min Password Length', key: 'security.passwordPolicy.minLength', value: formData.security?.passwordPolicy?.minLength, type: 'number' },
                            { label: 'Require Special Characters', key: 'security.passwordPolicy.requireSpecialChar', value: formData.security?.passwordPolicy?.requireSpecialChar, type: 'checkbox' },
                            { label: 'Require Numbers', key: 'security.passwordPolicy.requireNumbers', value: formData.security?.passwordPolicy?.requireNumbers, type: 'checkbox' },
                            { label: 'Require Uppercase', key: 'security.passwordPolicy.requireUpperCase', value: formData.security?.passwordPolicy?.requireUpperCase, type: 'checkbox' },
                            { label: 'MFA Required', key: 'security.mfaRequired', value: formData.security?.mfaRequired, type: 'checkbox' }
                        ]}
                        onUpdate={(key, value) => updateNestedValue(key, value)}
                        editable={editMode}
                    />

                    {/* LIMITS */}
                    <SettingsSection
                        title="⚡ Rate Limits & Restrictions"
                        icon="⚡"
                        settings={[
                            { label: 'Max Login Attempts', key: 'limits.maxLoginAttempts', value: formData.limits?.maxLoginAttempts, type: 'number' },
                            { label: 'Lockout Duration (minutes)', key: 'limits.lockoutDuration', value: formData.limits?.lockoutDuration, type: 'number' },
                            { label: 'Sessions Per User', key: 'limits.sessionPerUser', value: formData.limits?.sessionPerUser, type: 'number' }
                        ]}
                        onUpdate={(key, value) => updateNestedValue(key, value)}
                        editable={editMode}
                    />
                </div>
            )}

            {/* ACTION BUTTONS */}
            <div style={styles.actions}>
                <button
                    onClick={fetchSettings}
                    style={{...styles.button, backgroundColor: '#e2e8f0', color: '#0f172a'}}
                >
                    🔄 Refresh
                </button>
                {editMode && (
                    <button
                        onClick={() => {
                            setEditMode(false);
                            setFormData(systemSettings);
                        }}
                        style={{...styles.button, backgroundColor: '#f1f5f9', color: '#0f172a'}}
                    >
                        ❌ Cancel
                    </button>
                )}
            </div>
        </div>
    );

    function updateNestedValue(key, value) {
        const keys = key.split('.');
        const newFormData = JSON.parse(JSON.stringify(formData));
        let current = newFormData;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        setFormData(newFormData);
    }
};

const SettingsSection = ({ title, icon, settings, onUpdate, editable }) => (
    <div style={styles.section}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        <div style={styles.settingsGrid}>
            {settings.map((setting, idx) => (
                <SettingRow
                    key={idx}
                    {...setting}
                    onUpdate={onUpdate}
                    editable={editable}
                />
            ))}
        </div>
    </div>
);

const SettingRow = ({ label, key, value, type = 'text', options = [], readOnly = false, onUpdate, editable }) => (
    <div style={styles.settingRow}>
        <label style={styles.label}>{label}</label>
        {editable && !readOnly ? (
            type === 'text' ? (
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onUpdate(key, e.target.value)}
                    style={styles.input}
                />
            ) : type === 'number' ? (
                <input
                    type="number"
                    value={value || 0}
                    onChange={(e) => onUpdate(key, parseInt(e.target.value))}
                    style={styles.input}
                />
            ) : type === 'select' ? (
                <select
                    value={value || ''}
                    onChange={(e) => onUpdate(key, e.target.value)}
                    style={styles.input}
                >
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : type === 'checkbox' ? (
                <input
                    type="checkbox"
                    checked={value || false}
                    onChange={(e) => onUpdate(key, e.target.checked)}
                    style={styles.checkbox}
                />
            ) : null
        ) : (
            <div style={styles.value}>
                {type === 'checkbox' ? (value ? '✅ Yes' : '⚫ No') : value}
            </div>
        )}
    </div>
);

const styles = {
    container: {
        padding: '30px',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        backgroundColor: '#fff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    title: {
        fontSize: '28px',
        fontWeight: '900',
        color: '#0f172a',
        margin: 0,
    },
    subtitle: {
        fontSize: '14px',
        color: '#64748b',
        marginTop: '8px',
    },
    mainButton: {
        padding: '12px 25px',
        borderRadius: '8px',
        border: 'none',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
    },
    message: {
        padding: '15px 20px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontWeight: '600',
    },
    settingsSections: {
        display: 'grid',
        gap: '20px',
    },
    section: {
        backgroundColor: '#fff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#0f172a',
        margin: '0 0 20px 0',
    },
    settingsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
    },
    settingRow: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: '8px',
    },
    input: {
        padding: '10px 12px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        fontSize: '13px',
        fontFamily: 'inherit',
    },
    checkbox: {
        width: '20px',
        height: '20px',
        cursor: 'pointer',
    },
    value: {
        padding: '10px 12px',
        borderRadius: '6px',
        backgroundColor: '#f1f5f9',
        fontSize: '13px',
        color: '#475569',
    },
    actions: {
        display: 'flex',
        gap: '15px',
        marginTop: '30px',
    },
    button: {
        padding: '12px 25px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
    },
    loader: {
        textAlign: 'center',
        padding: '40px',
        color: '#64748b',
    }
};

export default SystemSettings;
