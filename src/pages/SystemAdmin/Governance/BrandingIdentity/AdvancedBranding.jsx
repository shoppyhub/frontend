import React from 'react';

const AdvancedBranding = ({ config, setConfig, cardS, cardHead, labS, inS, inputGroup }) => {
    
    // Logic: Precision mapping for nested state updates
    const handleNestedChange = (section, field, value) => {
        setConfig({
            ...config,
            [section]: { ...config[section], [field]: value }
        });
    };

    const primaryColor = config.appearance?.primaryColor || '#0f172a';

    return (
        <div style={responsiveGrid}>
            
            {/* --- [A] SEO & DISCOVERY ARCHITECTURE --- */}
            <div style={cardS}>
                <h4 style={cardHead}>🔍 Search Engine Optimization (SEO)</h4>
                <p style={nodeHintS}>Configure how {config.siteName} manifests on Google and Social Media.</p>
                
                <div style={inputGroup}>
                    <label style={labS}>Global Meta Title</label>
                    <input 
                        style={inS} 
                        placeholder="e.g. Best Local Marketplace in India"
                        value={config.seo?.metaTitle} 
                        onChange={e => handleNestedChange('seo', 'metaTitle', e.target.value)} 
                    />
                    <small style={seoTipS}>Recommended length: 50-60 characters.</small>
                </div>

                <div style={inputGroup}>
                    <label style={labS}>Meta Description (Global Index)</label>
                    <textarea 
                        style={areaS} 
                        placeholder="Describe your ecosystem for search engines..."
                        value={config.seo?.metaDescription} 
                        onChange={e => handleNestedChange('seo', 'metaDescription', e.target.value)} 
                    />
                    <small style={seoTipS}>Recommended length: 150-160 characters.</small>
                </div>

                <div style={inputGroup}>
                    <label style={labS}>Discovery Keywords (Comma Separated)</label>
                    <input 
                        style={inS} 
                        placeholder="grocery, electronics, local delivery, etc."
                        value={config.seo?.metaKeywords} 
                        onChange={e => handleNestedChange('seo', 'metaKeywords', e.target.value)} 
                    />
                </div>
            </div>

            {/* --- [B] AESTHETICS & SOCIAL CONNECT --- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* Visual Theme Module */}
                <div style={cardS}>
                    <h4 style={cardHead}>🎨 Infrastructure Aesthetics</h4>
                    <div style={themeFlex}>
                        <div style={{ flex: 1 }}>
                            <label style={labS}>Primary Accent</label>
                            <div style={colorPickerRow}>
                                <input 
                                    type="color" 
                                    value={config.appearance?.primaryColor} 
                                    onChange={e => handleNestedChange('appearance', 'primaryColor', e.target.value)} 
                                    style={colorIn} 
                                />
                                <span style={colorHex}>{config.appearance?.primaryColor?.toUpperCase()}</span>
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labS}>Border Curvature (px)</label>
                            <input 
                                type="number" 
                                style={inS} 
                                placeholder="12"
                                value={config.appearance?.borderRadius?.replace('px','')} 
                                onChange={e => handleNestedChange('appearance', 'borderRadius', e.target.value + 'px')} 
                            />
                        </div>
                    </div>

                    {/* Live Preview Element */}
                    <div style={previewNode(config.appearance?.primaryColor, config.appearance?.borderRadius)}>
                        <small style={previewLabel(config.appearance?.primaryColor)}>UI PREVIEW</small>
                        <button style={sampleBtn(config.appearance?.primaryColor, config.appearance?.borderRadius)}>
                            Sample Action Button
                        </button>
                    </div>
                </div>

                {/* Social Integration Module */}
                <div style={cardS}>
                    <h4 style={cardHead}>🌐 Social Network Integration</h4>
                    <p style={nodeHintS}>Link your official community handles.</p>
                    <div style={socialGrid}>
                        <div style={socialRow}>
                            <span style={socialIcon}>Facebook</span>
                            <input style={socialIn} placeholder="https://facebook.com/..." value={config.socialLinks?.facebook} onChange={e => handleNestedChange('socialLinks', 'facebook', e.target.value)} />
                        </div>
                        <div style={socialRow}>
                            <span style={socialIcon}>Instagram</span>
                            <input style={socialIn} placeholder="https://instagram.com/..." value={config.socialLinks?.instagram} onChange={e => handleNestedChange('socialLinks', 'instagram', e.target.value)} />
                        </div>
                        <div style={socialRow}>
                            <span style={socialIcon}>YouTube</span>
                            <input style={socialIn} placeholder="https://youtube.com/c/..." value={config.socialLinks?.youtube} onChange={e => handleNestedChange('socialLinks', 'youtube', e.target.value)} />
                        </div>
                        <div style={socialRow}>
                            <span style={socialIcon}>Twitter / X</span>
                            <input style={socialIn} placeholder="https://twitter.com/..." value={config.socialLinks?.twitter} onChange={e => handleNestedChange('socialLinks', 'twitter', e.target.value)} />
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                @media (max-width: 992px) {
                    .advanced-branding-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

// --- Enterprise SaaS Style Definitions ---

const responsiveGrid = { 
    display: 'grid', 
    gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1fr', 
    gap: '30px',
    className: 'advanced-branding-grid' 
};

const nodeHintS = { fontSize:'12px', color:'#94a3b8', marginTop:'-15px', marginBottom:'25px', fontWeight:'500' };
const seoTipS = { fontSize:'10px', color:'#cbd5e1', marginTop:'5px', display:'block', fontWeight:'700', textTransform:'uppercase' };
const areaS = { width:'100%', padding:'16px', borderRadius:'16px', border:'1.5px solid #e2e8f0', background:'#f8fafc', outline:'none', fontSize:'14px', fontWeight:'700', boxSizing:'border-box', height:'100px', resize:'none', color:'#1e293b' };

const themeFlex = { display: 'flex', gap: '25px', marginBottom:'25px', flexWrap:'wrap' };
const colorPickerRow = { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '5px', background:'#f8fafc', padding:'8px 15px', borderRadius:'14px', border:'1.5px solid #e2e8f0' };
const colorIn = { border: 'none', width: '35px', height: '35px', cursor: 'pointer', background: 'none', borderRadius:'50%' };
const colorHex = { fontSize: '13px', fontWeight: '900', color: '#1e293b', fontFamily: "'JetBrains Mono', monospace" };

const previewNode = (color, radius) => ({ marginTop:'10px', padding:'25px', borderRadius: radius || '12px', background:`${color}08`, border:`1px dashed ${color}44`, textAlign:'center' });
const previewLabel = (color) => ({ fontSize:'9px', fontWeight:'900', color: color, display:'block', marginBottom:'15px', letterSpacing:'1.5px' });
const sampleBtn = (color, radius) => ({ background: color, color: '#fff', border: 'none', padding: '12px 25px', borderRadius: radius || '12px', fontWeight: '900', fontSize: '12px', boxShadow: `0 8px 15px ${color}33` });

const socialGrid = { display: 'flex', flexDirection:'column', gap: '12px' };
const socialRow = { display:'flex', alignItems:'center', background:'#f8fafc', borderRadius:'14px', border:'1.5px solid #e2e8f0', overflow:'hidden' };
const socialIcon = { padding:'12px 15px', background:'#fff', fontSize:'11px', fontWeight:'900', color:'#94a3b8', borderRight:'1.5px solid #e2e8f0', width:'90px', textAlign:'center' };
const socialIn = { flex:1, border:'none', background:'transparent', padding:'12px 15px', outline:'none', fontSize:'13px', fontWeight:'700', color:'#1e293b' };

export default AdvancedBranding;