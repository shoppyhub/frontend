import React, { useEffect } from 'react';
import { useBranding } from '../context/BrandingContext';
import HomeHeader from '../components/Customer/HomeHeader';

const MerchantRegSummary = ({ data, regId }) => {
    const { settings } = useBranding();
    const themeColor = settings.themeColor || '#0f172a';

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = `Merchant_Application_${regId}`;
    }, [regId]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={pageWrapperS} className="reg-summary-container">
            {/* --- वेबसाइट हेडर (प्रिंट में नहीं दिखेगा) --- */}
            <div className="no-print">
                <HomeHeader />
            </div>

            {/* --- TOP CONTROL BAR --- */}
            <div className="no-print" style={controlBarS}>
                <div style={controlInnerS}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#10b981'}}></div>
                        <span style={{fontWeight:'800', fontSize:'14px', color:'#475569'}}>✓ Application Deployment Summary</span>
                    </div>
                    <div style={{display:'flex', gap:'15px'}}>
                        <button onClick={handlePrint} style={printActionBtn(themeColor)}>📄 Download / Print PDF Summary</button>
                    </div>
                </div>
            </div>

            {/* --- MAIN DOCUMENT START --- */}
            <div id="printable-summary" className="printable-content" style={documentShellS}>
                
                {/* --- HEADER --- */}
                <div style={docHeaderS(themeColor)}>
                    <div style={{flex: 1}}>
                        {settings.siteLogo && <img src={settings.siteLogo} alt="Logo" style={logoS} />}
                        <h1 style={brandNameS}>{settings.siteName}</h1>
                        <p style={docTypeS}>OFFICIAL MERCHANT INFRASTRUCTURE REGISTRATION</p>
                    </div>
                    <div style={regMetaS}>
                        <div style={statusTagS}>APPLICATION RECEIVED</div>
                        <p style={{margin:'10px 0 0 0', fontSize:'12px', color:'#94a3b8'}}>TRACKING ID</p>
                        <h2 style={{margin:0, color: themeColor, fontSize:'22px', letterSpacing:'1px'}}>{regId}</h2>
                        <p style={{margin:'5px 0 0 0', fontSize:'11px', fontWeight:'700'}}>DATE: {new Date().toLocaleDateString('en-GB')}</p>
                    </div>
                </div>

                {/* --- SECTION 1: PERSONAL IDENTITY --- */}
                <div style={sectionTitleS(themeColor)}>01. Personnel Identity Ledger</div>
                <div style={flexRowS}>
                    <div style={profilePhotoWrapS}>
                        <img src={data.ownerPhoto} alt="Owner" style={ownerImgS} />
                        <div style={photoLabelS}>AUTHORIZED SIGNATORY</div>
                    </div>
                    <div style={dataGridS}>
                        <DataField label="Full Name" value={data.fullName} />
                        <DataField label="Father's/Guardian Name" value={data.fatherName} />
                        <DataField label="Date of Birth" value={data.dob} />
                        <DataField label="Gender Identity" value={data.gender} />
                        <DataField label="Primary Mobile" value={data.mobile} />
                        <DataField label="WhatsApp Node" value={data.whatsapp} />
                        <DataField label="Identity Email" value={data.email} />
                    </div>
                </div>

                {/* --- SECTION 2: REGULATORY & KYC --- */}
                <div style={sectionTitleS(themeColor)}>02. Regulatory Documentation (KYC)</div>
                <div style={dataGridS}>
                    <DataField label="Aadhaar Number" value={data.aadharNumber} />
                    <DataField label="PAN Card Identity" value={data.panNumber?.toUpperCase()} />
                    <DataField label="GSTIN (Tax ID)" value={data.gstNumber || "NOT PROVIDED"} />
                </div>

                {/* --- SECTION 3: JURISDICTION & ADDRESS --- */}
                <div style={sectionTitleS(themeColor)}>03. Jurisdiction & Address Registry</div>
                <div style={addressGridS}>
                    <div style={addressBlockS}>
                        <h4 style={addressHeaderS}>Correspondence Address</h4>
                        <div style={dataGridS}>
                            <DataField label="State" value={data.tempState} />
                            <DataField label="District" value={data.tempDistrict} />
                            <DataField label="Block" value={data.tempBlock} />
                            <DataField label="Pincode" value={data.tempPin} />
                            <DataField label="Full Address" value={data.tempFullAddress} span={2} />
                        </div>
                    </div>
                    <div style={addressBlockS}>
                        <h4 style={addressHeaderS}>Permanent Residential Hub</h4>
                        <div style={dataGridS}>
                            <DataField label="State" value={data.permState} />
                            <DataField label="District" value={data.permDistrict} />
                            <DataField label="Block" value={data.permBlock} />
                            <DataField label="Pincode" value={data.permPin} />
                            <DataField label="Full Address" value={data.permFullAddress} span={2} />
                        </div>
                    </div>
                </div>

                {/* --- SECTION 4: COMMERCIAL HUB --- */}
                <div style={sectionTitleS(themeColor)}>04. Commercial Hub Configuration (Shop)</div>
                <div style={dataGridS}>
                    <DataField label="Hub Trading Name" value={data.shopName} />
                    <DataField label="Sector/Category" value={data.shopType} />
                    <DataField label="Operational State" value={data.shopState} />
                    <DataField label="Operational District" value={data.shopDistrict} />
                    <DataField label="Operational Block" value={data.shopBlock} />
                    <DataField label="Hub Pincode" value={data.shopPin} />
                    <DataField label="Detailed Hub Address" value={data.shopFullAddress} span={2} />
                    <DataField label="GPS Coordinates" value={data.shopCoords ? `${data.shopCoords.lat?.toFixed(6)}, ${data.shopCoords.lng?.toFixed(6)}` : 'N/A'} />
                </div>

                {/* --- SECTION 5: FINANCIAL SETTLEMENT --- */}
                <div style={sectionTitleS(themeColor)}>05. Financial Settlement Node (Bank)</div>
                <div style={dataGridS}>
                    <DataField label="Settlement Institution" value={data.bankName} />
                    <DataField label="Account Identifier" value={data.bankAcc} />
                    <DataField label="IFSC Protocol Code" value={(data.bankIfsc || data.ifsc)?.toUpperCase()} />
                </div>

                {/* --- SECTION 6: DOCUMENTARY EVIDENCE --- */}
                <div style={sectionTitleS(themeColor)}>06. Documentary Evidence Portfolio</div>
                <div style={evidenceGridS}>
                    <EvidenceItem src={data.shopPhotoIn} label="Hub Interior View" />
                    <EvidenceItem src={data.shopPhotoOut} label="Hub Exterior View" />
                    <EvidenceItem src={data.aadharFile} label="Aadhaar Document" />
                    <EvidenceItem src={data.panFile} label="PAN Card Identity" />
                    <EvidenceItem src={data.bankFile} label="Financial Proof" />
                </div>

                {/* --- FOOTER --- */}
                <div style={docFooterS}>
                    <p>Generated by <b>{settings.siteName} System Node</b>. This is a system-generated summary for application reference.</p>
                    <p>© {new Date().getFullYear()} {settings.siteName}. All Rights Reserved.</p>
                </div>
            </div>

            <style>{`
                @media print {
                    /* 1. index.css और App.css की ऊँचाई और ओवरफ्लो को फिक्स करना */
                    html, body, #root, .rkd-main-shell, main {
                        height: auto !important;
                        overflow: visible !important;
                        min-height: 0 !important;
                        background: white !important;
                    }

                    /* 2. App.css के padding-top को हटाना (Top space fix) */
                    .public-mode {
                        padding-top: 0 !important;
                        margin-top: 0 !important;
                    }

                    /* 3. प्रिंट के लिए आवश्यक सेटिंग्स */
                    .no-print, header, footer, nav { 
                        display: none !important; 
                    }
                    
                    @page { 
                        size: A4; 
                        margin: 10mm 15mm; 
                    }

                    #printable-summary { 
                        box-shadow: none !important; 
                        border: none !important; 
                        width: 100% !important; 
                        margin: 0 !important; 
                        padding: 5mm !important; 
                        display: block !important;
                        position: relative !important;
                    }

                    /* 4. कंटेंट को पेज पर कटने से बचाना (Page break fix) */
                    div { 
                        page-break-inside: avoid; 
                    }
                    h1, h2, h3, h4 { 
                        page-break-after: avoid; 
                    }
                }
            `}</style>
        </div>
    );
};

// --- Atomic Components ---
const DataField = ({ label, value, span = 1 }) => (
    <div style={{ gridColumn: `span ${span}`, marginBottom: '15px' }}>
        <p style={labelS}>{label}</p>
        <p style={valueS}>{value || '---'}</p>
    </div>
);

const EvidenceItem = ({ src, label }) => (
    <div style={evidenceCardS}>
        <div style={imgContainerS}>
            {src ? <img src={src} alt={label} style={evidenceImgS} /> : <div style={missingImgS}>MISSING</div>}
        </div>
        <p style={evidenceLabelS}>{label}</p>
    </div>
);

// --- CSS Styles ---
const pageWrapperS = { background: '#f1f5f9', minHeight: '100vh', padding: '0px 0px 40px 0px', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const controlBarS = { background: '#fff', maxWidth: '1000px', margin: '20px auto', padding: '15px 30px', borderRadius: '15px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const controlInnerS = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' };
const documentShellS = { background: '#fff', maxWidth: '1000px', margin: '0 auto', padding: '50px', borderRadius: '2px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' };
const docHeaderS = (color) => ({ display: 'flex', justifyContent: 'space-between', borderBottom: `5px solid ${color}`, paddingBottom: '30px', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' });
const logoS = { height: '60px', marginBottom: '10px', objectFit:'contain' };
const brandNameS = { margin: 0, fontSize: '28px', color: '#0f172a', fontWeight: '900' };
const docTypeS = { margin: '5px 0 0', fontSize: '11px', letterSpacing: '2px', color: '#94a3b8', fontWeight: '700' };
const regMetaS = { textAlign: 'right' };
const statusTagS = { background: '#ecfdf5', color: '#10b981', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', border: '1px solid #d1fae5' };
const sectionTitleS = (color) => ({ background: '#f8fafc', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: '900', color: color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '25px', marginTop: '30px', borderLeft: `4px solid ${color}` });
const flexRowS = { display: 'flex', gap: '40px', marginBottom: '20px', flexWrap: 'wrap' };
const profilePhotoWrapS = { width: '150px', textAlign: 'center' };
const ownerImgS = { width: '150px', height: '180px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #e2e8f0' };
const photoLabelS = { fontSize: '9px', fontWeight: '900', color: '#94a3b8', marginTop: '10px' };
const dataGridS = { flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', width: '100%' };
const labelS = { margin: 0, fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' };
const valueS = { margin: '4px 0 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' };
const addressGridS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' };
const addressBlockS = { background: '#fcfdfe', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9' };
const addressHeaderS = { margin: '0 0 20px 0', fontSize: '13px', color: '#64748b', fontWeight: '800' };
const evidenceGridS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' };
const evidenceCardS = { textAlign: 'center' };
const imgContainerS = { background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const evidenceImgS = { width: '100%', height: '100%', objectFit: 'contain' };
const missingImgS = { fontSize: '10px', color: '#cbd5e1', fontWeight: '800' };
const evidenceLabelS = { fontSize: '10px', fontWeight: '800', color: '#64748b', marginTop: '8px' };
const docFooterS = { borderTop: '2px solid #f1f5f9', marginTop: '50px', paddingTop: '30px', textAlign: 'center', fontSize: '11px', color: '#94a3b8' };
const printActionBtn = (color) => ({ background: color, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' });

export default MerchantRegSummary;