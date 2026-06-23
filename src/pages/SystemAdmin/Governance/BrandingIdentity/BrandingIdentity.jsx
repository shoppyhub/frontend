import React from 'react';
import { useBranding } from '../../../../context/BrandingContext';

const BrandingIdentity = ({ config, setConfig, handleFileUpload, uploading, labS, inS, cardS, cardHead, inputGroup }) => {
    
    const { updateSettingsImmediate } = useBranding();
    
    // Default Values logic
    const themeColor = config.themeColor || '#0f172a';
    const headerTextColor = config.headerTextColor || '#ffffff';

    // --- 🎯 THE SUPER CONTROL: LIVE UI SYNC ---
    const handleColorChange = (field, value) => {
        // 1. Local state update for the form
        setConfig({ ...config, [field]: value });
        // 2. Immediate Global update for Live Preview
        updateSettingsImmediate({ [field]: value });
    };

    const handleNameChange = (e) => {
        const newName = e.target.value;
        setConfig({ ...config, siteName: newName });
        updateSettingsImmediate({ siteName: newName });
    };

    return (
        <div style={responsiveGrid}>
            {/* --- SECTION 1: PLATFORM METADATA & AESTHETICS --- */}
            <div style={cardS}>
                <h4 style={cardHead}>🏢 Platform Identity & Aesthetics</h4>
                <p style={subHintS}>Configure the core identification and visual protocols of your digital infrastructure.</p>
                
                <div style={inputGroup}>
                    <label style={labS}>Site Display Name</label>
                    <input 
                        style={inS} 
                        placeholder="e.g. RKD MART"
                        value={config.siteName} 
                        onChange={handleNameChange} 
                    />
                    <small style={metaHint}>Changes Browser Title, Invoices, and Emails instantly.</small>
                </div>

                <div style={inputGroup}>
                    <label style={labS}>Support Gateway Email</label>
                    <input 
                        style={inS} 
                        placeholder="support@domain.com"
                        value={config.supportEmail} 
                        onChange={e => setConfig({ ...config, supportEmail: e.target.value })} 
                    />
                </div>

                <div style={divider}></div>

                {/* --- 🎨 DYNAMIC THEME CONTROL HUB --- */}
                <h4 style={{...cardHead, marginTop:'10px', borderLeft:'5px solid ' + themeColor}}>🎨 Global Theme Configuration</h4>
                
                <div style={colorControlsGrid}>
                    {/* Background Color Control */}
                    <div style={{flex: 1}}>
                        <label style={labS}>Header & Sidebar Background</label>
                        <div style={colorPickerRow}>
                            <input 
                                type="color" 
                                style={colorPicker} 
                                value={themeColor} 
                                onChange={(e) => handleColorChange('themeColor', e.target.value)} 
                            />
                            <input 
                                style={{...miniInS, fontFamily: 'monospace'}} 
                                value={themeColor.toUpperCase()} 
                                onChange={(e) => handleColorChange('themeColor', e.target.value)} 
                            />
                        </div>
                    </div>

                    {/* Text Color Control */}
                    <div style={{flex: 1}}>
                        <label style={labS}>Header & Sidebar Text Color</label>
                        <div style={colorPickerRow}>
                            <input 
                                type="color" 
                                style={colorPicker} 
                                value={headerTextColor} 
                                onChange={(e) => handleColorChange('headerTextColor', e.target.value)} 
                            />
                            <input 
                                style={{...miniInS, fontFamily: 'monospace'}} 
                                value={headerTextColor.toUpperCase()} 
                                onChange={(e) => handleColorChange('headerTextColor', e.target.value)} 
                            />
                        </div>
                    </div>
                </div>
                <small style={{...metaHint, marginTop: '15px'}}>Pro-tip: Use high contrast (e.g., Light text on Dark background) for better visibility.</small>
            </div>

            {/* --- SECTION 2: BRAND MEDIA & LIVE PREVIEW --- */}
            <div style={cardS}>
                <h4 style={cardHead}>🖼️ Visual Identity Vault</h4>
                <p style={subHintS}>Deploy high-fidelity graphical assets for global brand recognition.</p>
                
                <FileUploadBox 
                    label="Master Platform Logo" 
                    currentImg={config.siteLogo} 
                    onFileChange={(e) => handleFileUpload(e, 'siteLogo')} 
                    isUploading={uploading === "siteLogo"} 
                    labS={labS} 
                    themeColor={themeColor}
                />

                <FileUploadBox 
                    label="Browser Favicon (1:1 Ratio)" 
                    currentImg={config.siteFavicon} 
                    onFileChange={(e) => handleFileUpload(e, 'siteFavicon')} 
                    isUploading={uploading === "siteFavicon"} 
                    labS={labS} 
                    themeColor={themeColor}
                />

                {/* --- 📱 REAL-TIME IDENTITY PREVIEW --- */}
                <div style={previewBox(themeColor, headerTextColor)}>
                    <div style={{fontWeight:'900', fontSize:'10px', color: headerTextColor, marginBottom:'15px', textTransform:'uppercase', opacity: 0.8}}>Live Identity Preview (Header)</div>
                    <div style={previewContent}>
                        {config.siteLogo ? (
                            <img src={config.siteLogo} style={{height:'35px', objectFit:'contain'}} alt="Logo" />
                        ) : (
                            <div style={{width:'35px', height:'35px', background: headerTextColor, opacity: 0.2, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color: headerTextColor, fontWeight:'bold'}}>M</div>
                        )}
                        <span style={{fontWeight:'900', color: headerTextColor, fontSize:'20px', letterSpacing:'-0.5px'}}>{config.siteName || 'RKD MART'}</span>
                    </div>
                    <div style={previewSearchMock}>
                        <div style={{width:'100%', height:'30px', background:'#fff', borderRadius:'8px', opacity: 0.9, display:'flex', alignItems:'center', padding:'0 10px', fontSize:'10px', color:'#94a3b8'}}>🔍 Search Products...</div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .branding-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

// --- Sub Component: High-End File Upload Box ---
const FileUploadBox = ({ label, currentImg, onFileChange, isUploading, labS, themeColor }) => (
    <div style={{ marginBottom: '25px' }}>
        <label style={labS}>{label}</label>
        <div style={uploadBoxS}>
            <div style={fileInputWrapper}>
                <input type="file" accept="image/*" onChange={onFileChange} style={fileInputS} />
                <div style={customFileBtn(themeColor)}>{isUploading ? "📡 SYNCING..." : "UPLOAD ASSET"}</div>
            </div>
            <div style={imagePreviewContainer}>
                {currentImg ? <img src={currentImg} style={{maxHeight:'100%', maxWidth:'100%', objectFit:'contain'}} alt="preview" /> : <small style={{fontSize:'8px', color:'#cbd5e1', fontWeight:'800'}}>NO DATA</small>}
            </div>
        </div>
    </div>
);

// --- Strategic Style Definitions ---
const responsiveGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', className: 'branding-grid' };
const subHintS = { fontSize:'12px', color:'#94a3b8', marginTop:'-15px', marginBottom:'25px', fontWeight: '500' };
const metaHint = { fontSize:'10px', color:'#cbd5e1', marginTop:'8px', display:'block', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.5px' };
const divider = { height:'1.5px', background:'#f1f5f9', margin:'25px 0' };

const colorControlsGrid = { display:'flex', gap:'20px', flexWrap:'wrap' };
const colorPickerRow = { display:'flex', alignItems:'center', gap:'12px', background:'#f8fafc', padding:'10px', borderRadius:'14px', border:'1.5px solid #f1f5f9', marginTop:'8px' };
const colorPicker = { width:'45px', height:'45px', padding:'0', border:'none', borderRadius:'10px', cursor:'pointer', background:'none' };
const miniInS = { border:'none', background:'none', width:'70px', fontSize:'12px', fontWeight:'900', color:'#1e293b', outline:'none' };

const uploadBoxS = { display: 'flex', alignItems: 'center', gap: '20px', background: '#f8fafc', padding: '15px', borderRadius: '18px', border: '1.5px dashed #cbd5e1' };
const fileInputWrapper = { position:'relative', flex: 1 };
const fileInputS = { position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0, cursor:'pointer', zIndex: 2 };
const customFileBtn = (color) => ({ background: color, color: '#fff', padding: '12px', borderRadius: '12px', textAlign: 'center', fontSize: '11px', fontWeight: '900', boxShadow:`0 4px 12px \${color}33` });

const imagePreviewContainer = { width:'60px', height:'45px', background:'#fff', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', border:'1px solid #eee' };

const previewBox = (bg, text) => ({ 
    marginTop:'30px', 
    padding:'30px', 
    borderRadius:'30px', 
    background: bg, 
    color: text, 
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
});
const previewContent = { display:'flex', alignItems:'center', gap:'15px', marginBottom:'20px' };
const previewSearchMock = { borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'20px' };

export default BrandingIdentity;