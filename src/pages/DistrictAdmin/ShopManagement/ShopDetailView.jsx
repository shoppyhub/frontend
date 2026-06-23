import React, { useState, useEffect } from 'react';
import { useBranding } from '../../../context/BrandingContext';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { toast } from 'react-toastify';

/**
 * RKD MART - MASTER MERCHANT AUDIT PANEL
 * Displays all registration details for District/State verification.
 */
const ShopDetailView = ({ shopData: initialData, onBack, onAction }) => {
    const { settings } = useBranding();
    const { user } = useAuth(); 
    const themeColor = settings?.themeColor || '#0d9488';
    const userRole = user?.role || 'DistrictAdmin';

    // --- Core States ---
    const [formData, setFormData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [viewImage, setViewImage] = useState(null);
    const [imgRotation, setImgRotation] = useState(0);
    const [correctionMsg, setCorrectionMsg] = useState("");
    const [showCorrectionModal, setShowCorrectionModal] = useState(false);

    // 1. 📡 Detailed Data Sync Logic
    useEffect(() => {
        const fetchFullProfile = async (id) => {
            try {
                setLoading(true);
                const res = await api.get(`/admin/shops/audit/${id}`);
                if (res.data.success) {
                    setFormData(res.data.data);
                } else {
                    setFormData(initialData);
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setFormData(initialData);
                toast.error("Detailed records could not be synchronized.");
            } finally {
                setLoading(false);
            }
        };
        if (initialData?._id) fetchFullProfile(initialData._id);
    }, [initialData]);

    if (loading) return <div style={loaderS}>📡 SYNCHRONIZING MERCHANT NODE...</div>;
    if (!formData) return <div style={loaderS}>Node Not Found. <button onClick={onBack}>Return</button></div>;

    // Helper: Date Format
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const rotateImg = (e) => { e.stopPropagation(); setImgRotation(prev => prev + 90); };

    const handleCorrectionDispatch = async () => {
        if (!correctionMsg.trim()) return toast.error("Please enter correction instructions.");
        try {
            await api.put(`/admin/shops/correction/${formData._id}`, { message: correctionMsg });
            toast.success("Correction request sent to merchant.");
            setShowCorrectionModal(false);
            setCorrectionMsg("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send correction request.");
        }
    };

    return (
        <div style={containerS}>
            {/* --- HEADER HUD --- */}
            <div style={headerS}>
                <button onClick={onBack} style={backBtnS}>← REGISTRY INDEX</button>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <h2 style={{ margin: 0, color: themeColor, fontSize: '18px', fontWeight:'900' }}>
                        MERCHANT AUDIT: {formData.fullName?.toUpperCase()}
                    </h2>
                    <small style={idTagS}>TRACKING: {formData.trackingId} • REG_DATE: {formatDate(formData.createdAt)}</small>
                </div>
                <div style={statusBadgeS(formData.shopDetails?.status)}>
                    {formData.shopDetails?.status?.toUpperCase() || 'PENDING'}
                </div>
            </div>

            <div style={contentWrapperS}>
                <div style={mainGridS}>
                    {/* --- LEFT COL: IDENTITY & ADDRESSES --- */}
                    <div style={colS}>
                        <Section title="👤 PERSONNEL IDENTITY REGISTRY" color={themeColor}>
                            <div style={profileHeadS}>
                                <div style={{position:'relative', cursor:'zoom-in'}} onClick={() => setViewImage(formData.ownerPhoto || formData.photo)}>
                                    <img src={formData.ownerPhoto || formData.photo || 'https://via.placeholder.com/150'} style={avatarS} alt="P" />
                                    <div style={zoomIcon}>🔍</div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Input label="Full Legal Name" val={formData.fullName} />
                                    <Input label="Father's Name" val={formData.fatherName} />
                                </div>
                            </div>
                            <div style={grid2}>
                                <Input label="Date of Birth" val={formatDate(formData.dob)} />
                                <Input label="Gender" val={formData.gender} />
                                <Input label="Primary Mobile" val={formData.mobile} />
                                <Input label="WhatsApp Node" val={formData.whatsapp || formData.mobile} />
                                <Input label="Email Identifier" val={formData.email} />
                                <Input label="Department" val={formData.department || 'General'} />
                            </div>
                        </Section>

                        <Section title="🏠 GEOGRAPHIC ADDRESS HUB" color="#e67e22">
                            {/* Correspondence Address (Temporary) */}
                            <AddressDisplay 
                                label="CORRESPONDENCE / TEMP" 
                                addr={formData.tFullAddress || formData.temporaryAddress?.fullAddress} 
                                block={formData.tBlock || formData.temporaryAddress?.block}
                                dist={formData.tDistrict || formData.temporaryAddress?.district}
                                state={formData.tState || formData.temporaryAddress?.state}
                                pin={formData.tPin || formData.temporaryAddress?.pinCode}
                            />
                            {/* Permanent Address */}
                            <AddressDisplay 
                                label="PERMANENT RESIDENTIAL" 
                                addr={formData.pFullAddress || formData.permanentAddress?.fullAddress} 
                                block={formData.pBlock || formData.permanentAddress?.block}
                                dist={formData.pDistrict || formData.permanentAddress?.district}
                                state={formData.pState || formData.permanentAddress?.state}
                                pin={formData.pPin || formData.permanentAddress?.pinCode}
                            />
                        </Section>
                    </div>

                    {/* --- RIGHT COL: BUSINESS, BANKING, KYC --- */}
                    <div style={colS}>
                        <Section title="🏪 COMMERCIAL HUB CONFIGURATION" color="#3498db">
                            <div style={grid2}>
                                <Input label="Trading Name" val={formData.shopName || formData.shopDetails?.shopName} />
                                <Input label="Sector / Type" val={formData.shopType || formData.shopDetails?.shopType} />
                                <Input label="GSTIN Identification" val={formData.gstNumber || 'NOT PROVIDED'} />
                            </div>
                            {/* Shop Physical Address */}
                            <AddressDisplay 
                                label="HUB PHYSICAL LOCATION" 
                                addr={formData.shopFullAddress || formData.shopDetails?.address?.fullAddress} 
                                block={formData.shopBlock || formData.shopDetails?.address?.block}
                                dist={formData.shopDistrict || formData.shopDetails?.address?.district}
                                state={formData.shopState || formData.shopDetails?.address?.state}
                                pin={formData.shopPin || formData.shopDetails?.address?.pinCode}
                            />
                            <div style={docRowS}>
                                <DocPreview label="Hub Interior" file={formData.shopPhotoIn} onZoom={() => setViewImage(formData.shopPhotoIn)} />
                                <DocPreview label="Hub Exterior" file={formData.shopPhotoOut} onZoom={() => setViewImage(formData.shopPhotoOut)} />
                            </div>
                        </Section>

                        <Section title="💳 FINANCIAL SETTLEMENT NODE" color="#27ae60">
                            <div style={grid2}>
                                <Input label="Bank Institution" val={formData.bankName} />
                                <Input label="IFSC Protocol" val={formData.bankIfsc} />
                                <Input label="Account Number" val={formData.bankAcc} />
                                <DocPreview label="Evidence (Passbook/Cheque)" file={formData.bankFile} onZoom={() => setViewImage(formData.bankFile)} />
                            </div>
                        </Section>

                        <Section title="📑 STATUTORY COMPLIANCE VAULT" color="#e74c3c">
                            <div style={grid2}>
                                <Input label="Aadhaar UID" val={formData.aadharNumber} />
                                <Input label="PAN Identity" val={formData.panNumber} />
                            </div>
                            <div style={docRowS}>
                                <DocPreview label="Aadhaar Scan" file={formData.aadharFile} onZoom={() => setViewImage(formData.aadharFile)} />
                                <DocPreview label="PAN Identity Port" file={formData.panFile} onZoom={() => setViewImage(formData.panFile)} />
                            </div>
                        </Section>
                    </div>
                </div>

                {/* --- ADMINISTRATIVE ACTION PANEL (INTEGRATED) --- */}
                <div style={controlPanelS}>
                    <button onClick={() => setIsEditing(!isEditing)} style={actionBtnS('#f0f9ff', '#0369a1', '#bae6fd')}>
                        {isEditing ? "💾 CANCEL EDIT" : "📝 EDIT RECORDS"}
                    </button>
                    <button onClick={() => setShowCorrectionModal(true)} style={actionBtnS('#fffbeb', '#b45309', '#fde68a')}>🔄 SEND FOR CORRECTION</button>
                    <button onClick={() => onAction(formData._id, 'Rejected', formData.shopName)} style={actionBtnS('#fff1f2', '#be123c', '#fecaca')}>❌ REJECT HUB</button>
                    
                    <button onClick={() => onAction(formData._id, 'Approved', formData.shopName)} style={forwardBtnS(themeColor)}>
                        {userRole === 'DistrictAdmin' ? "✅ VERIFY & FORWARD TO STATE" : "🚀 AUTHORIZE FOR PRODUCTION"}
                    </button>
                </div>
            </div>

            {/* CORRECTION MODAL */}
            {showCorrectionModal && (
                <div style={modalOverlayS}>
                    <div style={modalBoxS}>
                        <h3 style={{marginTop:0, fontWeight:'900'}}>CORRECTION INSTRUCTIONS</h3>
                        <textarea style={textAreaS} value={correctionMsg} onChange={(e)=>setCorrectionMsg(e.target.value)} placeholder="Type instructions for merchant hub update..." />
                        <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                            <button onClick={handleCorrectionDispatch} style={{...saveBtnS, flex:1, background:themeColor}}>DISPATCH</button>
                            <button onClick={()=>setShowCorrectionModal(false)} style={{...cancelBtnS, flex:1}}>CANCEL</button>
                        </div>
                    </div>
                </div>
            )}

            {/* IMAGE VIEWER */}
            {viewImage && (
                <div style={imgOverlayS} onClick={() => { setViewImage(null); setImgRotation(0); }}>
                    <div style={modalToolbar}>
                        <button onClick={rotateImg} style={rotateBtnS}>🔄 ROTATE 90°</button>
                        <button style={rotateBtnS}>CLOSE (X)</button>
                    </div>
                    <img src={viewImage} style={{...imgLargeS, transform: `rotate(${imgRotation}deg)`}} alt="Audit Preview" />
                </div>
            )}
        </div>
    );
};

// --- Helper UI Components ---
const Section = ({ title, color, children }) => (
    <div style={{ background: '#fff', borderRadius: '20px', padding: '25px', borderTop: `6px solid ${color}`, marginBottom: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', borderBottom:'1px solid #f1f5f9' }}>
        <h3 style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', marginBottom: '20px', textTransform: 'uppercase', letterSpacing:'1px' }}>{title}</h3>
        {children}
    </div>
);

const Input = ({ label, val }) => (
    <div style={{ marginBottom: '15px' }}>
        <label style={labS}>{label}</label>
        <p style={valS}>{val || '---'}</p>
    </div>
);

const DocPreview = ({ label, file, onZoom }) => (
    <div style={{ flex: 1 }}>
        <label style={labS}>{label}</label>
        <div style={docFrameS} onClick={onZoom}>
            {file ? <img src={file} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Document" /> : <span style={{opacity:0.4, fontSize:'9px'}}>NO IMAGE</span>}
        </div>
    </div>
);

const AddressDisplay = ({ label, addr, block, dist, state, pin }) => (
    <div style={addressBoxS}>
        <small style={labS}>{label}</small>
        <p style={{...valS, fontSize:'13px', marginTop:'5px', lineHeight:'1.5'}}>{addr || 'Address details missing.'}</p>
        <p style={{margin:0, fontSize:'11px', color:'#64748b', fontWeight:'800', marginTop:'5px'}}>
            {block || 'N/A'} • {dist || 'N/A'} • {state || 'N/A'} - <b style={{color:'#1e293b'}}>{pin || '000000'}</b>
        </p>
    </div>
);

// --- CSS Architecture ---
const containerS = { background: '#f8fafc', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerS = { display: 'flex', alignItems: 'center', background: '#fff', padding: '18px 25px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 20px rgba(0,0,0,0.05)' };
const contentWrapperS = { padding: '30px', maxWidth: '1450px', margin: '0 auto' };
const backBtnS = { background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '10px', color: '#475569' };
const idTagS = { fontSize: '10px', color: '#94a3b8', fontWeight: '900', letterSpacing: '1px' };
const statusBadgeS = (s) => ({ background: '#fffbeb', color: '#d97706', padding: '8px 18px', borderRadius: '12px', fontSize: '10px', fontWeight: '900', border: '1px solid #fef3c7' });
const mainGridS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '30px' };
const colS = { display: 'flex', flexDirection: 'column' };
const profileHeadS = { display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '25px', background: '#f8fafc', padding: '20px', borderRadius: '22px', border:'1px solid #f1f5f9' };
const avatarS = { width: '110px', height: '110px', borderRadius: '20px', objectFit: 'cover', border:'5px solid #fff', boxShadow: '0 15px 30px rgba(0,0,0,0.08)' };
const zoomIcon = { position:'absolute', bottom:'8px', right:'8px', background:'#fff', borderRadius:'50%', width:'26px', height:'24px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', boxShadow:'0 4px 8px rgba(0,0,0,0.1)' };
const labS = { fontSize: '9px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', marginBottom:'5px', display:'block', letterSpacing:'0.5px' };
const valS = { margin: 0, fontWeight: '800', fontSize: '15px', color: '#1e293b' };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const addressBoxS = { background: '#f8fafc', padding: '18px', borderRadius: '18px', marginBottom: '20px', border:'1.5px solid #f1f5f9' };
const docRowS = { display: 'flex', gap: '20px', marginTop: '15px' };
const docFrameS = { height: '115px', background: '#f1f5f9', borderRadius: '15px', border: '2px dashed #cbd5e1', overflow: 'hidden', cursor: 'zoom-in', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight:'900', color:'#94a3b8' };
const controlPanelS = { marginTop: '40px', background: '#fff', padding: '30px', borderRadius: '30px', boxShadow:'0 15px 50px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' };
const actionBtnS = (bg, col, border) => ({ background: bg, color: col, border: `1.5px solid ${border}`, padding: '14px 28px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', fontSize: '11px', transition:'0.3s ease' });
const forwardBtnS = (c) => ({ background: c, color: '#fff', border: 'none', padding: '14px 45px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', fontSize:'12px', boxShadow: `0 15px 35px ${c}44`, transition:'0.3s ease' });
const imgOverlayS = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.95)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter:'blur(10px)' };
const modalToolbar = { position:'absolute', top:25, right:25, display:'flex', gap:15 };
const imgLargeS = { maxWidth: '95vw', maxHeight: '85vh', borderRadius: '15px', boxShadow:'0 0 60px rgba(0,0,0,0.6)', transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)' };
const rotateBtnS = { background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 22px', borderRadius: '12px', cursor: 'pointer', fontSize:'11px', fontWeight:'900', backdropFilter:'blur(5px)' };
const loaderS = { height:'80vh', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', color:'#94a3b8', fontSize:'13px', letterSpacing:'2px' };
const textAreaS = { width: '100%', height: '150px', marginTop: '20px', padding: '20px', borderRadius: '20px', border: '1.5px solid #e2e8f0', resize: 'none', fontWeight: '600', fontSize:'14px', outline:'none', background:'#fcfdfe' };
const cancelBtnS = { background: '#f1f5f9', color: '#475569', border: 'none', padding: '14px 25px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' };
const saveBtnS = { color: '#fff', border: 'none', padding: '14px 25px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' };

export default ShopDetailView;