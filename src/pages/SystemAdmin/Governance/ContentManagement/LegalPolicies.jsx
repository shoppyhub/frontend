import React from 'react';
import { useBranding } from '../../../../context/BrandingContext';

const LegalPolicies = ({ config, setConfig, cardS, cardHead, inS, labS }) => {
    const { settings } = useBranding();
    const themeColor = settings?.themeColor || '#0f172a';

    const handleCmsChange = (field, val) => {
        setConfig({ ...config, cms: { ...config.cms, [field]: val } });
    };

    // Sub-component for Bilingual Inputs
    const BilingualInput = ({ title, fieldEng, fieldHindi, height = '250px' }) => (
        <div style={sectionWrapperS}>
            <h4 style={cardHead}>{title}</h4>
            <div style={responsiveFlex}>
                {/* English Version */}
                <div style={flexCol}>
                    <label style={labS}>English Version (Primary)</label>
                    <textarea 
                        style={{ ...areaS, height }} 
                        value={config.cms?.[fieldEng]} 
                        onChange={e => handleCmsChange(fieldEng, e.target.value)} 
                        placeholder={`Enter ${title} in English...`} 
                    />
                </div>
                {/* Hindi Version */}
                <div style={flexCol}>
                    <label style={labS}>Hindi Translation (हिन्दी अनुवाद)</label>
                    <textarea 
                        style={{ ...areaS, height, borderLeft: `4px solid ${themeColor}44` }} 
                        value={config.cms?.[fieldHindi]} 
                        onChange={e => handleCmsChange(fieldHindi, e.target.value)} 
                        placeholder={`${title} का हिन्दी अनुवाद यहाँ लिखें...`} 
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div style={containerS}>
            <div style={cardS}>
                <div style={introS}>
                    <h3 style={{margin:0, color: themeColor}}>⚖️ Global Governance Registry</h3>
                    <p style={{fontSize:'12px', color:'#94a3b8', marginTop:'5px'}}>
                        Configure the legal framework and operational protocols for {config.siteName}.
                    </p>
                </div>

                {/* 1. Terms & Conditions Node */}
                <BilingualInput 
                    title="Terms & Conditions (नियम और शर्तें)" 
                    fieldEng="termsCondition" 
                    fieldHindi="termsConditionHindi"
                    height="400px"
                />

                <div style={dividerS}></div>

                {/* 2. Privacy Policy Node */}
                <BilingualInput 
                    title="Privacy Policy (गोपनीयता नीति)" 
                    fieldEng="privacyPolicy" 
                    fieldHindi="privacyPolicyHindi"
                />

                <div style={dividerS}></div>

                {/* 3. Return & Refund Protocol */}
                <BilingualInput 
                    title="Return & Refund Policy (वापसी नीति)" 
                    fieldEng="returnPolicy" 
                    fieldHindi="returnPolicyHindi"
                />

                <div style={dividerS}></div>

                {/* 4. Merchant Agreement Node (For Shop Registration) */}
                <BilingualInput 
                    title="Merchant Service Agreement (दुकानदार समझौता)" 
                    fieldEng="merchantAgreement" 
                    fieldHindi="merchantAgreementHindi"
                />
            </div>

            <style>{`
                @media (max-width: 992px) {
                    .policy-flex { flex-direction: column !important; gap: 20px !important; }
                }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Definitions ---

const containerS = { animation: 'fadeIn 0.5s ease' };
const introS = { marginBottom: '40px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' };

const sectionWrapperS = { marginBottom: '50px' };
const responsiveFlex = { display: 'flex', gap: '30px', className: 'policy-flex' };
const flexCol = { flex: 1, display: 'flex', flexDirection: 'column' };

const areaS = { 
    width: '100%', 
    padding: '20px', 
    borderRadius: '16px', 
    border: '1.5px solid #e2e8f0', 
    background: '#f8fafc', 
    outline: 'none', 
    fontSize: '14px', 
    fontWeight: '600', 
    lineHeight: '1.6', 
    color: '#334155', 
    resize: 'none', 
    transition: '0.3s',
    boxSizing: 'border-box'
};

const dividerS = { height: '1px', background: '#f1f5f9', margin: '40px 0' };

export default LegalPolicies;