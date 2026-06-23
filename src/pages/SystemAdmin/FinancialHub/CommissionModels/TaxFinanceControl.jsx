import React from 'react';
// ✅ सुधार: Aliases का उपयोग करें, यह ज्यादा सुरक्षित और आसान है
import { useBranding } from 'context/BrandingContext'; 

const TaxFinanceControl = ({ config, setConfig, cardS, cardHead, labS, inS, inputGroup }) => {
    const { settings } = useBranding();
    const themeColor = settings?.themeColor || '#0f172a';

    // 🔄 [FIXED] Logic: Safe update for Nested Registry Parameters
    const handleNestChange = (section, field, val) => {
        setConfig(prev => ({ 
            ...prev, 
            [section]: { 
                ...(prev[section] || {}), 
                [field]: val 
            } 
        }));
    };

    // 🔄 Logic: Update Root Level Parameters
    const handleFieldChange = (field, val) => {
        setConfig(prev => ({ ...prev, [field]: val }));
    };

    // --- Internal Styles ---
    const areaS = { 
        width: '100%', 
        padding: '16px', 
        borderRadius: '16px', 
        border: '1.5px solid #e2e8f0', 
        background: '#f8fafc', 
        outline: 'none', 
        fontSize: '14px', 
        fontWeight: '700', 
        color: '#1e293b', 
        resize: 'none', 
        lineHeight: '1.5' 
    };

    const hintS = { 
        fontSize: '10px', 
        color: '#cbd5e1', 
        marginTop: '6px', 
        display: 'block', 
        fontWeight: '700', 
        textTransform: 'uppercase' 
    };

    const nodeHintS = { 
        fontSize: '12px', 
        color: '#94a3b8', 
        marginTop: '-15px', 
        marginBottom: '25px', 
        fontWeight: '500' 
    };

    return (
        <div style={pageLayoutS}>
            
            {/* --- ROW 1: REVENUE & THRESHOLDS --- */}
            <div style={responsiveGrid}>
                
                {/* Platform Monetization Nodes */}
                <div style={cardS}>
                    <h4 style={cardHead}>💳 Platform Monetization & Fees</h4>
                    <p style={nodeHintS}>Configure the primary revenue streams for your infrastructure.</p>
                    
                    <div style={inputGroup}>
                        <label style={labS}>Merchant Registration Fee (₹)</label>
                        <input 
                            type="number" 
                            style={inS} 
                            value={config.registrationFeeAmount || 0} 
                            onChange={e => handleFieldChange('registrationFeeAmount', Number(e.target.value))} 
                        />
                        <small style={hintS}>One-time protocol fee charged during merchant onboarding.</small>
                    </div>

                    <div style={inputGroup}>
                        <label style={labS}>Facilitation Commission (%)</label>
                        <input 
                            type="number" 
                            style={inS} 
                            value={config.standardRate || 0} 
                            onChange={e => handleFieldChange('standardRate', Number(e.target.value))} 
                        />
                        <small style={hintS}>Global percentage deducted from every successful transaction.</small>
                    </div>

                    <div style={inputGroup}>
                        <label style={labS}>Promotion Slot Price (₹ / 7 Days)</label>
                        <input 
                            type="number" 
                            style={inS} 
                            value={config.featuredAdPrice || 0} 
                            onChange={e => handleFieldChange('featuredAdPrice', Number(e.target.value))} 
                        />
                        <small style={hintS}>Fee for boosting a merchant hub to the global priority feed.</small>
                    </div>

                    <div style={dividerS}></div>

                    {/* Transaction Thresholds */}
                    <div style={inputGroup}>
                        <label style={{...labS, color: themeColor}}>Minimum Transaction Value (₹)</label>
                        <input 
                            type="number" 
                            style={{...inS, borderLeft: `4px solid ${themeColor}`}} 
                            value={config.minOrderValue || 0} 
                            onChange={e => handleFieldChange('minOrderValue', Number(e.target.value))} 
                            placeholder="e.g. 500"
                        />
                        <small style={hintS}>Customers are restricted from checkout below this node threshold.</small>
                    </div>
                </div>

                {/* Digital Invoice Architecture */}
                <div style={cardS}>
                    <h4 style={cardHead}>🧾 Invoice & Billing Protocol</h4>
                    <p style={nodeHintS}>Customize the transactional documents dispatched to users.</p>
                    
                    <div style={inputGroup}>
                        <label style={labS}>Order ID / Invoice Prefix</label>
                        <input 
                            style={{...inS, textTransform: 'uppercase'}} 
                            value={config.invoiceConfig?.prefix || ''} 
                            onChange={e => handleNestChange('invoiceConfig', 'prefix', e.target.value.toUpperCase())} 
                            placeholder="e.g. RKD"
                            maxLength="6"
                        />
                        <small style={hintS}>Visible as {config.invoiceConfig?.prefix || 'INV'}-XXXXX on billing documents.</small>
                    </div>

                    <div style={inputGroup}>
                        <label style={labS}>Legal Footer / Terms Summary</label>
                        <textarea 
                            style={areaS} 
                            placeholder="Specify legal disclaimers or thank you notes..."
                            value={config.invoiceConfig?.footerNote || ''} 
                            onChange={e => handleNestChange('invoiceConfig', 'footerNote', e.target.value)} 
                        />
                        <small style={hintS}>Appears at the absolute bottom of PDF invoices.</small>
                    </div>
                </div>
            </div>

            {/* --- ROW 2: STATUTORY COMPLIANCE --- */}
            <div style={cardS}>
                <h4 style={cardHead}>⚖️ Statutory Compliance & Taxation</h4>
                <div style={statutoryGrid}>
                    <div style={inputGroup}>
                        <label style={labS}>Platform GSTIN Identification</label>
                        <input 
                            style={{...inS, textTransform: 'uppercase'}} 
                            value={config.taxConfig?.taxId || ''} 
                            onChange={e => handleNestChange('taxConfig', 'taxId', e.target.value.toUpperCase())} 
                            placeholder="Enter 15-digit GSTIN"
                            maxLength="15"
                        />
                        <small style={hintS}>Required for generating B2B compliant digital tax invoices.</small>
                    </div>
                    <div style={inputGroup}>
                        <label style={labS}>Standard GST Rate (%)</label>
                        <input 
                            type="number" 
                            style={inS} 
                            value={config.taxConfig?.defaultGstRate || 0} 
                            onChange={e => handleNestChange('taxConfig', 'defaultGstRate', Number(e.target.value))} 
                        />
                        <small style={hintS}>Applied tax percentage on the platform facilitation fee.</small>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 992px) {
                    .finance-grid { grid-template-columns: 1fr !important; }
                    .statutory-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
                }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Definitions ---
const pageLayoutS = { display: 'flex', flexDirection: 'column', gap: '30px', animation: 'fadeIn 0.5s ease' };
const responsiveGrid = { display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1.2fr', gap: '30px' };
const dividerS = { height:'1px', background:'#f1f5f9', margin:'25px 0' };
const statutoryGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' };

export default TaxFinanceControl;