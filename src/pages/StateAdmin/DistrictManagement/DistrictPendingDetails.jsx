import React, { useState, useEffect, useCallback } from 'react';
import { useBranding } from '../../../context/BrandingContext';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { toast } from 'react-toastify';

/**
 * RKD MART - DISTRICT PENDING MONITORING PANEL (FOR STATE ADMIN)
 * जिला स्तर पर पेंडिंग आवेदनों की विस्तृत निगरानी के लिए।
 */
const DistrictPendingDetails = ({ shopId, onBack }) => {
    const { settings } = useBranding();
    const { user } = useAuth(); 
    const themeColor = settings?.themeColor || '#0f172a';

    // --- Core States ---
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewImage, setViewImage] = useState(null);
    const [imgRotation, setImgRotation] = useState(0);

    // 1. 📡 डेटा लोड करना
    const fetchFullProfile = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/shops/audit/${shopId}`);
            if (res.data.success) {
                setShop(res.data.data);
            }
        } catch (err) {
            toast.error("Registry Sync Error: Node unreachable.");
            onBack();
        } finally {
            setLoading(false);
        }
    }, [shopId, onBack]);

    useEffect(() => {
        if (shopId) fetchFullProfile();
    }, [shopId, fetchFullProfile]);

    // हेल्पर: तारीख फॉर्मेट
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (loading) return <div style={loaderS}>📡 SYNCHRONIZING DISTRICT NODE FOR MONITORING...</div>;
    if (!shop) return null;

    const rotateImg = (e) => { e.stopPropagation(); setImgRotation(prev => prev + 90); };

    return (
        <div style={containerS}>
            {/* --- HEADER HUD --- */}
            <div style={headerS}>
                <button onClick={onBack} style={backBtnS}>← BACK TO INDEX</button>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <h2 style={{ margin: 0, color: themeColor, fontSize: '18px', fontWeight:'900' }}>
                        MONITORING AUDIT: {shop.shopName?.toUpperCase()}
                    </h2>
                    <small style={idTagS}>TRACKING ID: {shop.trackingId} • DISTRICT: {shop.shopDistrict}</small>
                </div>
                <div style={statusBadgeS}>DISTRICT PENDING</div>
            </div>

            <div style={contentWrapperS}>
                <div style={mainGridS}>
                    {/* --- LEFT COL: IDENTITY & KYC --- */}
                    <div style={colS}>
                        <Section title="👤 Personnel Identity Registry" color={themeColor}>
                            <div style={profileHeadS}>
                                <div style={{position:'relative', cursor:'zoom-in'}} onClick={() => setViewImage(shop.photo || shop.ownerPhoto)}>
                                    <img src={shop.photo || shop.ownerPhoto || 'https://via.placeholder.com/150'} style={avatarS} alt="Owner" />
                                    <div style={zoomIcon}>🔍</div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <DetailItem label="Full Legal Name" val={shop.fullName} />
                                    <DetailItem label="Father's Name" val={shop.fatherName} />
                                </div>
                            </div>
                            <div style={grid2}>
                                <DetailItem label="Date of Birth" val={formatDate(shop.dob)} />
                                <DetailItem label="Gender" val={shop.gender} />
                                <DetailItem label="Mobile Identifier" val={shop.mobile} />
                                <DetailItem label="WhatsApp Node" val={shop.whatsapp || shop.mobile} />
                                <DetailItem label="Email Identifier" val={shop.email || shop.primaryEmail} />
                                <DetailItem label="Department" val={shop.department || 'Retail Hub'} />
                            </div>
                        </Section>

                        <Section title="📑 Statutory Compliance Vault (KYC)" color="#e74c3c">
                            <div style={grid2}>
                                <DetailItem label="Statutory Aadhaar" val={shop.aadharNumber || shop.kycDetails?.aadharNumber} />
                                <DetailItem label="Statutory PAN" val={shop.panNumber || shop.kycDetails?.panNumber} />
                            </div>
                            <div style={docRowS}>
                                <DocPreview label="Aadhaar Scan" file={shop.aadharFile || shop.kycDetails?.aadharCardFile} onZoom={() => setViewImage(shop.aadharFile || shop.kycDetails?.aadharCardFile)} />
                                <DocPreview label="PAN Identity" file={shop.panFile || shop.kycDetails?.panCardFile} onZoom={() => setViewImage(shop.panFile || shop.kycDetails?.panCardFile)} />
                            </div>
                        </Section>

                        <Section title="🏠 Permanent Residential Hub" color="#e67e22">
                            <AddressDisplay 
                                label="RESIDENTIAL ADDRESS" 
                                addr={shop.pFullAddress || shop.permanentAddress?.fullAddress} 
                                block={shop.pBlock || shop.permanentAddress?.block} 
                                dist={shop.pDistrict || shop.permanentAddress?.district} 
                                state={shop.pState || shop.permanentAddress?.state} 
                                pin={shop.pPin || shop.permanentAddress?.pinCode} 
                            />
                        </Section>
                    </div>

                    {/* --- RIGHT COL: BUSINESS & BANKING --- */}
                    <div style={colS}>
                        <Section title="🏪 Commercial Hub Configuration" color="#3498db">
                            <div style={grid2}>
                                <DetailItem label="Trading Name" val={shop.shopName || shop.shopDetails?.shopName} />
                                <DetailItem label="Sector / Type" val={shop.shopType || shop.shopDetails?.shopType} />
                                <DetailItem label="GSTIN Identity" val={shop.gstNumber || shop.kycDetails?.gstNumber || 'NOT PROVIDED'} />
                            </div>
                            <AddressDisplay 
                                label="HUB PHYSICAL LOCATION" 
                                addr={shop.shopFullAddress || shop.shopDetails?.address?.fullAddress} 
                                block={shop.shopBlock || shop.shopDetails?.address?.block} 
                                dist={shop.shopDistrict || shop.shopDetails?.address?.district} 
                                state={shop.shopState || shop.shopDetails?.address?.state} 
                                pin={shop.shopPin || shop.shopDetails?.address?.pinCode} 
                            />
                            <div style={docRowS}>
                                <DocPreview label="Hub Interior" file={shop.shopPhotoIn} onZoom={() => setViewImage(shop.shopPhotoIn)} />
                                <DocPreview label="Hub Exterior" file={shop.shopPhotoOut} onZoom={() => setViewImage(shop.shopPhotoOut)} />
                            </div>
                        </Section>

                        <Section title="💳 Financial Settlement Node" color="#27ae60">
                            <div style={grid2}>
                                <DetailItem label="Bank Institution" val={shop.bankName || shop.bankDetails?.bankName} />
                                <DetailItem label="Account Number" val={shop.bankAcc || shop.bankDetails?.accountNumber} />
                                <DetailItem label="IFSC Protocol" val={shop.bankIfsc || shop.bankDetails?.ifscCode} />
                                <DocPreview label="Evidence (Passbook/Cheque)" file={shop.bankFile || shop.bankDetails?.passbookPhoto} onZoom={() => setViewImage(shop.bankFile || shop.bankDetails?.passbookPhoto)} />
                            </div>
                        </Section>

                        {/* --- MONITORING INFO BOX --- */}
                        <div style={monitorBoxS}>
                            <h4 style={{margin:'0 0 10px 0', color:'#0369a1'}}>ℹ️ SYSTEM MONITORING NOTICE</h4>
                            <p style={{margin:0, fontSize:'13px', lineHeight:1.5}}>
                                This application is currently being reviewed by the <b>{shop.shopDistrict} District Admin</b>. 
                                As a State Admin, you can monitor all details, but final verification/forwarding actions must be initiated at the District level first.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- IMAGE VIEWER --- */}
            {viewImage && (
                <div style={imgOverlayS} onClick={() => { setViewImage(null); setImgRotation(0); }}>
                    <div style={modalToolbar}>
                        <button onClick={rotateImg} style={rotateBtnS}>🔄 ROTATE 90°</button>
                        <button style={rotateBtnS}>CLOSE (X)</button>
                    </div>
                    <img src={viewImage} style={{...imgLargeS, transform: `rotate(${imgRotation}deg)`}} alt="Preview" />
                </div>
            )}
        </div>
    );
};

// --- Helper UI Components ---
const Section = ({ title, color, children }) => (
    <div style={{ background: '#fff', borderRadius: '24px', padding: '25px', borderTop: `6px solid ${color}`, marginBottom: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border:'1px solid #f1f5f9' }}>
        <h3 style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', marginBottom: '20px', textTransform: 'uppercase', letterSpacing:'1px' }}>{title}</h3>
        {children}
    </div>
);

const DetailItem = ({ label, val }) => (
    <div style={{ marginBottom: '15px' }}>
        <label style={labS}>{label}</label>
        <p style={valS}>{val || '---'}</p>
    </div>
);

const DocPreview = ({ label, file, onZoom }) => (
    <div style={{ flex: 1 }}>
        <label style={labS}>{label}</label>
        <div style={docFrameS} onClick={onZoom}>
            {file ? <img src={file} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Doc" /> : <span style={{fontSize:9, opacity:0.5}}>NO FILE</span>}
        </div>
    </div>
);

const AddressDisplay = ({ label, addr, block, dist, state, pin }) => (
    <div style={addressBoxS}>
        <small style={labS}>{label}</small>
        <p style={{...valS, fontSize:'13px', marginTop:'5px'}}>{addr || 'Details missing.'}</p>
        <p style={{margin:0, fontSize:'11px', color:'#64748b', fontWeight:'700', marginTop:'5px'}}>
            {block || 'N/A'} • {dist || 'N/A'} • {state || 'N/A'} - <b>{pin || '000000'}</b>
        </p>
    </div>
);

// --- CSS Styles ---
const containerS = { background: '#f8fafc', minHeight: '100vh', paddingBottom:'50px' };
const headerS = { display: 'flex', alignItems: 'center', background: '#fff', padding: '15px 25px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 15px rgba(0,0,0,0.05)' };
const contentWrapperS = { padding: '30px', maxWidth: '1400px', margin: '0 auto' };
const backBtnS = { background: '#f1f5f9', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '11px' };
const idTagS = { fontSize: '10px', color: '#94a3b8', fontWeight: '800' };
const statusBadgeS = { background: '#fffbeb', color: '#d97706', padding: '6px 15px', borderRadius: '10px', fontSize: '10px', fontWeight: '900' };
const mainGridS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' };
const colS = { display: 'flex', flexDirection: 'column' };
const profileHeadS = { display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '20px' };
const avatarS = { width: '100px', height: '100px', borderRadius: '15px', objectFit: 'cover', border:'4px solid #fff' };
const zoomIcon = { position:'absolute', bottom:5, right:5, background:'#fff', borderRadius:'50%', width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, boxShadow:'0 2px 5px rgba(0,0,0,0.1)' };
const labS = { fontSize: '9px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase' };
const valS = { margin: 0, fontWeight: '700', fontSize: '14px', color: '#1e293b' };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const addressBoxS = { background: '#f8fafc', padding: '15px', borderRadius: '15px', marginBottom: '15px' };
const docRowS = { display: 'flex', gap: '15px', marginTop: '10px' };
const docFrameS = { height: '100px', background: '#f1f5f9', borderRadius: '12px', overflow: 'hidden', cursor: 'zoom-in', border:'1px dashed #cbd5e1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#94a3b8' };

const monitorBoxS = { background:'#e0f2fe', padding:'25px', borderRadius:'24px', border:'1px solid #bae6fd', color:'#0369a1', marginTop:'20px' };
const imgOverlayS = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalToolbar = { position:'absolute', top:20, right:20, display:'flex', gap:10 };
const imgLargeS = { maxWidth: '90vw', maxHeight: '80vh', borderRadius: '10px', transition: '0.3s ease' };
const rotateBtnS = { background: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' };
const loaderS = { height:'80vh', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', color:'#94a3b8' };

export default DistrictPendingDetails;