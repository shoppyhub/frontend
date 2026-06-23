import React from 'react';
import { useBranding } from '../../../context/BrandingContext';

const InfrastructureControl = ({ config, setConfig, labS, inS, cardS, cardHead, inputGroup }) => {
    const { settings } = useBranding();
    const themeColor = settings?.themeColor || '#0f172a';

    // Logic: Modern Toggle Component
    const ToggleRow = ({ label, val, onToggle, desc }) => (
        <div style={toggleRowS}>
            <div style={{ flex: 1 }}>
                <span style={toggleLabelS}>{label}</span>
                {desc && <small style={toggleDescS}>{desc}</small>}
            </div>
            <button 
                type="button"
                style={val ? toggleBtnOn(themeColor) : toggleBtnOff} 
                onClick={onToggle}
            >
                {val ? '● ENABLED' : '○ DISABLED'}
            </button>
        </div>
    );

    return (
        <div style={responsiveGrid}>
            
            {/* --- SECTION 1: GLOBAL ACCESS SWITCHES --- */}
            <div style={cardS}>
                <h4 style={cardHead}>🔐 Infrastructure Access Switches</h4>
                <p style={nodeHintS}>Manage critical system-wide availability and payment protocols.</p>
                
                <ToggleRow 
                    label="🛠️Maintenance Mode" 
                    desc="Take the entire platform offline for technical audits."
                    val={config.maintenanceMode} 
                    onToggle={() => setConfig({ ...config, maintenanceMode: !config.maintenanceMode })} 
                />
                
                <ToggleRow 
                    label="📦Cash on Delivery (COD)" 
                    desc="Allow customers to pay at the delivery node."
                    val={config.codEnabled} 
                    onToggle={() => setConfig({ ...config, codEnabled: !config.codEnabled })} 
                />
                
                <ToggleRow 
                    label="💳Online Payment Gateway" 
                    desc="Enable Razorpay/Digital transaction protocols."
                    val={config.onlinePayEnabled} 
                    onToggle={() => setConfig({ ...config, onlinePayEnabled: !config.onlinePayEnabled })} 
                />

                <div style={{marginTop: '25px'}}>
                    <label style={labS}>Transaction Threshold (Minimum Order Value ₹)</label>
                    <input 
                        type="number" 
                        style={inS} 
                        value={config.minOrderValue} 
                        onChange={e => setConfig({ ...config, minOrderValue: Number(e.target.value) })} 
                        placeholder="e.g. 500"
                    />
                    <small style={metaHint}>Customers cannot checkout if the cart value is below this node threshold.</small>
                </div>
            </div>

            {/* --- SECTION 2: IDENTITY & VERSION CONTROL --- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
         {/* IDENTITY VERIFICATION PROTOCOLS */}
<div style={cardS}>
    <h4 style={cardHead}>🆔 Registration Verification Protocols</h4>
    <p style={nodeHintS}>Control the 'Verify' button visibility and OTP requirements.</p>
    
    <ToggleRow 
        label="📧Email Identity Verification" 
        desc="Mandatory OTP handshake for all email registrations."
        val={config.emailVerificationEnabled} 
        onToggle={() => setConfig({ ...config, emailVerificationEnabled: !config.emailVerificationEnabled })} 
    />

    <ToggleRow 
        label="📱Mobile Node Verification" 
        desc="Mandatory SMS OTP handshake for all mobile identities."
        val={config.mobileVerificationEnabled} 
        onToggle={() => setConfig({ ...config, mobileVerificationEnabled: !config.mobileVerificationEnabled })} 
    />

    {/* --- 🚩 यह नया हिस्सा यहाँ जोड़ें --- */}
    <ToggleRow 
        label="🗺️Merchant Hub Geolocation (Maps)" 
        desc="Enable Google/Mappls map pinpointing during merchant registration."
        val={config.enableMerchantMap} 
        onToggle={() => setConfig({ ...config, enableMerchantMap: !config.enableMerchantMap })} 
    />
</div>

                {/* BUILD & UPDATES */}
                <div style={cardS}>
                    <h4 style={cardHead}>📱 Build & Ecosystem Update</h4>
                    <div style={inputGroup}>
                        <label style={labS}>Active Build Version</label>
                        <input 
                            style={inS} 
                            placeholder="e.g. 3.1.2"
                            value={config.appVersion} 
                            onChange={e => setConfig({ ...config, appVersion: e.target.value })} 
                        />
                    </div>
                    
                    <ToggleRow 
                        label="🔄Enforce Critical Update" 
                        desc="Force all users to sync with the latest build version."
                        val={config.forceUpdate} 
                        onToggle={() => setConfig({ ...config, forceUpdate: !config.forceUpdate })} 
                    />
                </div>
            </div>

            <style>{`
                @media (max-width: 992px) {
                    .infra-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Definitions ---

const responsiveGrid = { 
    display: 'grid', 
    gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1fr', 
    gap: '30px',
    className: 'infra-grid'
};

const nodeHintS = { fontSize:'12px', color:'#94a3b8', marginTop:'-15px', marginBottom:'25px', fontWeight:'500' };
const metaHint = { fontSize:'10px', color:'#cbd5e1', marginTop:'8px', display:'block', fontWeight:'600', textTransform:'uppercase' };

const toggleRowS = { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '18px 20px', 
    background: '#f8fafc', 
    borderRadius: '18px', 
    marginBottom: '15px',
    border: '1px solid #f1f5f9' 
};

const toggleLabelS = { fontSize: '13px', fontWeight: '800', color: '#1e293b', display:'block' };
const toggleDescS = { fontSize: '11px', color: '#94a3b8', fontWeight: '600', marginTop: '2px', display:'block' };

const toggleBtnOn = (color) => ({ 
    background: `${color}15`, 
    color: color, 
    border: `1.5px solid ${color}44`, 
    padding: '8px 18px', 
    borderRadius: '10px', 
    fontWeight: '900', 
    cursor: 'pointer',
    fontSize: '10px',
    letterSpacing: '0.5px'
});

const toggleBtnOff = { 
    background: '#f1f5f9', 
    color: '#94a3b8', 
    border: '1.5px solid #e2e8f0', 
    padding: '8px 18px', 
    borderRadius: '10px', 
    fontWeight: '900', 
    cursor: 'pointer',
    fontSize: '10px',
    letterSpacing: '0.5px'
};

export default InfrastructureControl;