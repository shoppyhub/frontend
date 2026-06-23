import React from 'react';
import { useBranding } from '../../../../context/BrandingContext';

const LegalAssetManager = ({ assets, handleFileUpload, uploading, cardS, cardHead, labS, config }) => {
    const { settings } = useBranding();
    const themeColor = settings?.themeColor || '#0f172a';

    return (
        <div style={responsiveGrid}>
            
            {/* --- SECTION 1: AUTHORITY SIGNATURE NODE --- */}
            <div style={cardS}>
                <div style={cardHeaderFlex}>
                    <h4 style={cardHead}>🖋️ Principal Authority Signature</h4>
                    {assets.signature && <span style={badgeS(themeColor)}>SECURED</span>}
                </div>
                <p style={nodeHintS}>
                    This digital signature node will be cryptographically embedded in all official certificates and transactional invoices dispatched by {config.siteName || 'the system'}.
                </p>

                <div style={uploadZone(themeColor)}>
                    <input 
                        type="file" 
                        id="sign-up" 
                        hidden 
                        onChange={(e) => handleFileUpload(e, 'signature')} 
                        accept="image/*"
                    />
                    <label htmlFor="sign-up" style={uploadBtnS(themeColor)}>
                        {uploading === "signature" ? "📡 SYNCHRONIZING..." : "📤 UPLOAD MASTER SIGNATURE"}
                    </label>

                    <div style={documentPreviewS}>
                        <small style={previewLabelS}>Document Preview Area</small>
                        {assets.signature ? (
                            <div style={previewBox}>
                                <img src={assets.signature} style={assetImg} alt="Signature Node" />
                                <div style={statusTextS}>✓ IDENTITY VERIFIED & ANCHORED</div>
                            </div>
                        ) : (
                            <div style={emptyPreviewS}>
                                NO SIGNATURE DETECTED IN CLUSTER
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- SECTION 2: OFFICIAL SYSTEM SEAL (STAMP) --- */}
            <div style={cardS}>
                <div style={cardHeaderFlex}>
                    <h4 style={cardHead}>🛡️ Infrastructure Official Seal</h4>
                    {assets.stamp && <span style={badgeS(themeColor)}>ACTIVE</span>}
                </div>
                <p style={nodeHintS}>
                    The official {config.siteName} stamp used for validating business premises, legal hub deployments, and regulatory compliance documents.
                </p>

                <div style={uploadZone(themeColor)}>
                    <input 
                        type="file" 
                        id="stamp-up" 
                        hidden 
                        onChange={(e) => handleFileUpload(e, 'stamp')} 
                        accept="image/*"
                    />
                    <label htmlFor="stamp-up" style={uploadBtnS(themeColor)}>
                        {uploading === "stamp" ? "📡 SYNCHRONIZING..." : "📤 UPLOAD REGISTRY SEAL"}
                    </label>

                    <div style={documentPreviewS}>
                        <small style={previewLabelS}>Document Preview Area</small>
                        {assets.stamp ? (
                            <div style={previewBox}>
                                <img src={assets.stamp} style={assetImg} alt="System Seal" />
                                <div style={statusTextS}>✓ OFFICIAL SEAL SYNCHRONIZED</div>
                            </div>
                        ) : (
                            <div style={emptyPreviewS}>
                                NO REGISTRY SEAL DETECTED
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 992px) {
                    .legal-grid { grid-template-columns: 1fr !important; }
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
    animation: 'fadeIn 0.5s ease',
    className: 'legal-grid',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
};

const cardHeaderFlex = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' };
const badgeS = (color) => ({ background:`${color}15`, color: color, padding:'4px 12px', borderRadius:'8px', fontSize:'9px', fontWeight:'900', letterSpacing:'1px' });

const nodeHintS = { fontSize: '12px', color: '#94a3b8', marginBottom: '30px', lineHeight: '1.6', fontWeight:'500' };

const uploadZone = (color) => ({ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    gap: '25px', 
    padding: '35px', 
    background: '#f8fafc', 
    borderRadius: '25px', 
    border: `2px dashed #e2e8f0`,
    transition: '0.3s'
});

const uploadBtnS = (color) => ({ 
    background: color, 
    color: '#fff', 
    padding: '14px 28px', 
    borderRadius: '15px', 
    cursor: 'pointer', 
    fontWeight: '900', 
    fontSize: '11px', 
    letterSpacing: '0.5px',
    boxShadow: `0 8px 15px ${color}33`,
    transition: '0.3s'
});

const documentPreviewS = { 
    width: '100%', 
    padding: '20px', 
    background: '#fff', 
    borderRadius: '20px', 
    border: '1px solid #f1f5f9', 
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
};

const previewLabelS = { 
    display:'block', 
    marginBottom:'15px', 
    fontSize:'9px', 
    fontWeight:'900', 
    color:'#cbd5e1', 
    textTransform:'uppercase', 
    letterSpacing:'1.5px' 
};

const emptyPreviewS = { 
    padding: '40px 0', 
    fontSize: '10px', 
    color: '#cbd5e1', 
    fontWeight: '800', 
    letterSpacing: '1px',
    textTransform: 'uppercase'
};

const previewBox = { textAlign: 'center' };
const assetImg = { height: '80px', maxWidth: '220px', objectFit: 'contain', background: '#fff', padding: '10px' };
const statusTextS = { display: 'block', marginTop: '15px', color: '#10b981', fontWeight: '900', fontSize: '10px', letterSpacing: '0.5px' };

export default LegalAssetManager;