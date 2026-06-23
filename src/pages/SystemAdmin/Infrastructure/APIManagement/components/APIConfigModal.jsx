import React, { useState, useEffect } from 'react';

const APIConfigModal = ({ isOpen, onClose, api, onSave, themeColor }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'payment_gateway',
    provider: '',
    description: '',
    api_url: '',
    api_key: '',
    secret_auth: '',
    priority: 1,
    status: 'active',
    mode: 'test',
    timeout_ms: 30000,
    custom_headers: {},
    enabled_for_roles: ['SystemAdmin']
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (api) {
      setFormData({ ...api });
    } else {
      setFormData({
        name: '',
        category: 'payment_gateway',
        provider: '',
        description: '',
        api_url: '',
        api_key: '',
        secret_auth: '',
        priority: 1,
        status: 'active',
        mode: 'test',
        timeout_ms: 30000,
        custom_headers: {},
        enabled_for_roles: ['SystemAdmin']
      });
    }
    setErrors({});
  }, [api, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.provider) newErrors.provider = 'Provider is required';
    if (!formData.api_url) newErrors.api_url = 'API URL is required';
    if (!formData.api_key) newErrors.api_key = 'API Key is required';
    if (!formData.secret_auth) newErrors.secret_auth = 'Secret is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={overlayS}>
      <div style={modalS}>
        <div style={headerS(themeColor)}>
          <h2 style={titleS}>{api ? '✏️ EDIT API' : '➕ CREATE NEW API'}</h2>
          <button onClick={onClose} style={closeBtnS}>✕</button>
        </div>

        <div style={bodyS}>
          {/* Basic Section */}
          <div style={sectionS}>
            <h3 style={sectionTitleS}>Basic Configuration</h3>
            <div style={formGridS}>
              <div style={formGroupS}>
                <label style={labelS}>API Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Production Razorpay"
                  style={inputS(errors.name)}
                />
                {errors.name && <span style={errorS}>{errors.name}</span>}
              </div>

              <div style={formGroupS}>
                <label style={labelS}>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  style={inputS()}
                >
                  <option value="payment_gateway">💳 Payment Gateway</option>
                  <option value="sms_otp">📱 SMS OTP</option>
                  <option value="email_otp">📧 Email SMTP</option>
                  <option value="cloud_storage">☁️ Cloud Storage</option>
                  <option value="gps_maps">📍 GPS Maps</option>
                  <option value="custom">🔧 Custom</option>
                </select>
              </div>

              <div style={formGroupS}>
                <label style={labelS}>Provider *</label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => handleChange('provider', e.target.value)}
                  placeholder="e.g., Razorpay, Twilio, AWS"
                  style={inputS(errors.provider)}
                />
                {errors.provider && <span style={errorS}>{errors.provider}</span>}
              </div>

              <div style={{ ...formGroupS, gridColumn: 'span 3' }}>
                <label style={labelS}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Optional description"
                  style={{ ...inputS(), minHeight: '60px', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Credentials Section */}
          <div style={sectionS}>
            <h3 style={sectionTitleS}>Credentials</h3>
            <div style={formGridS}>
              <div style={{ ...formGroupS, gridColumn: 'span 3' }}>
                <label style={labelS}>API URL / Endpoint *</label>
                <input
                  type="text"
                  value={formData.api_url}
                  onChange={(e) => handleChange('api_url', e.target.value)}
                  placeholder="https://api.provider.com/v1"
                  style={inputS(errors.api_url)}
                />
                {errors.api_url && <span style={errorS}>{errors.api_url}</span>}
              </div>

              <div style={{ ...formGroupS, gridColumn: 'span 3' }}>
                <label style={labelS}>API Key / Client ID *</label>
                <input
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => handleChange('api_key', e.target.value)}
                  placeholder="Your API key"
                  style={inputS(errors.api_key)}
                />
                {errors.api_key && <span style={errorS}>{errors.api_key}</span>}
              </div>

              <div style={{ ...formGroupS, gridColumn: 'span 3' }}>
                <label style={labelS}>Secret Token / Auth Token *</label>
                <input
                  type="password"
                  value={formData.secret_auth}
                  onChange={(e) => handleChange('secret_auth', e.target.value)}
                  placeholder="Your secret key"
                  style={inputS(errors.secret_auth)}
                />
                {errors.secret_auth && <span style={errorS}>{errors.secret_auth}</span>}
              </div>
            </div>
          </div>

          {/* Configuration Section */}
          <div style={sectionS}>
            <h3 style={sectionTitleS}>Configuration</h3>
            <div style={formGridS}>
              <div style={formGroupS}>
                <label style={labelS}>Priority (1=Primary)</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', parseInt(e.target.value))}
                  min="1"
                  max="10"
                  style={inputS()}
                />
              </div>

              <div style={formGroupS}>
                <label style={labelS}>Mode</label>
                <select
                  value={formData.mode}
                  onChange={(e) => handleChange('mode', e.target.value)}
                  style={inputS()}
                >
                  <option value="test">🧪 Test</option>
                  <option value="live">🚀 Live</option>
                </select>
              </div>

              <div style={formGroupS}>
                <label style={labelS}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  style={inputS()}
                >
                  <option value="active">✅ Active</option>
                  <option value="inactive">⏸️ Inactive</option>
                  <option value="maintenance">🔧 Maintenance</option>
                </select>
              </div>

              <div style={formGroupS}>
                <label style={labelS}>Timeout (ms)</label>
                <input
                  type="number"
                  value={formData.timeout_ms}
                  onChange={(e) => handleChange('timeout_ms', parseInt(e.target.value))}
                  min="1000"
                  step="1000"
                  style={inputS()}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={footerS}>
          <button onClick={onClose} style={cancelBtnS}>
            Cancel
          </button>
          <button onClick={handleSubmit} style={saveBtnS(themeColor)}>
            {api ? 'Update API' : 'Create API'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Styles
const overlayS = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' };
const modalS = { background: '#fff', borderRadius: '30px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' };
const headerS = (c) => ({ background: c, color: '#fff', padding: '30px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '30px 30px 0 0' });
const titleS = { margin: 0, fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px' };
const closeBtnS = { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' };

const bodyS = { padding: '40px' };
const sectionS = { marginBottom: '35px' };
const sectionTitleS = { fontSize: '14px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 20px' };

const formGridS = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' };
const formGroupS = { display: 'flex', flexDirection: 'column' };
const labelS = { fontSize: '12px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' };
const inputS = (hasError) => ({ padding: '12px 16px', border: `2px solid ${hasError ? '#ef4444' : '#e2e8f0'}`, borderRadius: '12px', fontSize: '14px', background: '#f8fafc', outline: 'none', fontFamily: 'inherit', transition: '0.2s' });
const errorS = { color: '#ef4444', fontSize: '11px', fontWeight: '700', marginTop: '4px' };

const footerS = { display: 'flex', gap: '15px', justifyContent: 'flex-end', padding: '30px 40px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '0 0 30px 30px' };
const cancelBtnS = { padding: '12px 28px', border: '2px solid #e2e8f0', borderRadius: '12px', background: '#fff', fontWeight: '900', fontSize: '13px', cursor: 'pointer', transition: '0.2s' };
const saveBtnS = (c) => ({ padding: '12px 40px', border: 'none', borderRadius: '12px', background: c, color: '#fff', fontWeight: '900', fontSize: '13px', cursor: 'pointer', boxShadow: `0 8px 20px ${c}40` });

export default APIConfigModal;
