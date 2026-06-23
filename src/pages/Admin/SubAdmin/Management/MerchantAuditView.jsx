// src/pages/Admin/SubAdmin/Management/MerchantAuditView.jsx

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBranding } from '../../../../context/BrandingContext';
import api from '../../../../services/api';
import useFetch from '../../../../hooks/useFetch';
import { toast } from 'react-toastify';

/**
 * RKD MART - SUB ADMIN ULTIMATE AUDIT CONSOLE
 * मर्चेंट के सभी विवरणों (Personal, KYC, Bank, Business) की सूक्ष्म जांच के लिए।
 */
const MerchantAuditView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useBranding();
    const themeColor = settings?.themeColor || '#0f172a';

    // --- Core States ---
    const { data: merchant, loading, refetch } = useFetch(`/admin/shops/audit/${id}`);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    
    // --- UI States ---
    const [viewImage, setViewImage] = useState(null);
    const [rejectionMsg, setRejectionMsg] = useState("");
    const [actionType, setActionType] = useState(null); 

    // 1. ✅ Final Activation (Generates LIVE ID)
    const handleFinalActivation = async () => {
        if (!isConfirmed) return toast.warning("Check the verification box first.");
        if (!window.confirm("CONFIRM: Activate this Merchant Node and generate credentials?")) return;

        setIsProcessing(true);
        try {
            const res = await api.put(`/admin/shops/approve/${id}`);
            if (res.data.success) {
                toast.success("SUCCESS: Merchant activated successfully.");
                refetch();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Activation Failed.");
        } finally { setIsProcessing(false); }
    };

    // 2. ❌ Rejection/Correction Logic
    const handleDecisionSubmit = async () => {
        if (!rejectionMsg.trim()) return toast.error("Reason is required.");
        setIsProcessing(true);
        try {
            const endpoint = actionType === 'reject' ? 'reject' : 'correction';
            const res = await api.put(`/admin/shops/${endpoint}/${id}`, { 
                [actionType === 'reject' ? 'reason' : 'message']: rejectionMsg 
            });
            if (res.data.success) {
                toast.info(`Action Synced: ${actionType.toUpperCase()}`);
                navigate('/sub-admin/shops-queue');
            }
        } catch (err) { toast.error("Handshake failed."); }
        finally { setIsProcessing(false); setActionType(null); }
    };

    if (loading) return <div style={loaderAreaS}>📡 ESTABLISHING SECURE AUDIT LINK...</div>;
    if (!merchant) return <div style={loaderAreaS}>⚠️ NODE NOT DISCOVERED</div>;

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '---';

    return (
        <div style={containerS} className="fade-in">
            
            {/* --- TOP HUD BAR --- */}
            <div style={headerHUD}>
                <button onClick={() => navigate(-1)} style={backBtnS}>← BACK</button>
                <div style={headerCenter}>
                    <h2 style={titleS}>MERCHANT COMMAND AUDIT</h2>
                    <small style={idTagS}>TRACKING_ID: {merchant.trackingId} • REG_DATE: {formatDate(merchant.createdAt)}</small>
                </div>
                <div style={statusPill(merchant.shopDetails?.status)}>
                    {merchant.shopDetails?.status?.toUpperCase()}
                </div>
            </div>

            <div style={mainContentS}>
                <div style={auditGridS}>
                    
                    {/* --- COLUMN 1: PERSONAL & STATUTORY --- */}
                    <div style={columnS}>
                        
                        {/* 👤 Section: Personal Registry */}
                        <AuditSection title="Personnel Identity Registry" icon="👤" color={themeColor}>
                            <div style={profileHead}>
                                <div style={avatarFrame} onClick={() => setViewImage(merchant.photo || merchant.ownerPhoto)}>
                                    <img src={merchant.photo || merchant.ownerPhoto || 'https://via.placeholder.com/150'} style={imgFull} alt="Owner" />
                                    <div style={zoomTag}>AUDIT</div>
                                </div>
                                <div style={{flex:1}}>
                                    <DataRow label="Full Legal Name" val={merchant.fullName} />
                                    <DataRow label="Father/Guardian" val={merchant.fatherName} />
                                    <div style={grid2}>
                                        <DataRow label="Date of Birth" val={formatDate(merchant.dob)} />
                                        <DataRow label="Gender" val={merchant.gender} />
                                    </div>
                                </div>
                            </div>
                            <div style={{...grid2, marginTop: 15}}>
                                <DataRow label="Primary Mobile" val={merchant.mobile} />
                                <DataRow label="WhatsApp Node" val={merchant.whatsapp || merchant.mobile} />
                                <DataRow label="Alternate Contact" val={merchant.altMobile || merchant.alternateMobile || 'None'} />
                                <DataRow label="Email Identifier" val={merchant.email || merchant.primaryEmail} />
                            </div>
                        </AuditSection>

                        {/* 🛡️ Section: KYC Vault */}
                        <AuditSection title="Statutory Compliance Vault" icon="🛡️" color="#e74c3c">
                            <div style={grid2}>
                                <DataRow label="Statutory Aadhaar" val={merchant.aadharNumber} />
                                <DataRow label="Statutory PAN" val={merchant.panNumber} />
                            </div>
                            <div style={docRow}>
                                <FileBox label="Aadhaar Evidence" url={merchant.aadharFile} onOpen={() => setViewImage(merchant.aadharFile)} />
                                <FileBox label="PAN Identity File" url={merchant.panFile} onOpen={() => setViewImage(merchant.panFile)} />
                            </div>
                        </AuditSection>

                        {/* 🏠 Section: Permanent Residence */}
                        <AuditSection title="Permanent Residential Node" icon="🏠" color="#f39c12">
                            <AddressBox 
                                label="RESIDENTIAL ADDRESS"
                                addr={merchant.pFullAddress || merchant.permanentAddress?.fullAddress} 
                                meta={`${merchant.pBlock || 'N/A'}, ${merchant.pDistrict || 'N/A'}, ${merchant.pState || 'N/A'} - ${merchant.pPin || '000000'}`} 
                            />
                        </AuditSection>

                    </div>

                    {/* --- COLUMN 2: BUSINESS & BANKING --- */}
                    <div style={columnS}>
                        
                        {/* 🏪 Section: Commercial Hub */}
                        <AuditSection title="Commercial Hub Configuration" icon="🏪" color="#3498db">
                            <div style={grid2}>
                                <DataRow label="Trading Name" val={merchant.shopName} />
                                <DataRow label="Hub Category" val={merchant.shopType} />
                                <DataRow label="GSTIN Registry" val={merchant.gstNumber || 'NOT PROVIDED'} />
                                <DataRow label="Dept. Node" val={merchant.department || 'Retail'} />
                            </div>
                            <AddressBox 
                                label="HUB PHYSICAL LOCATION"
                                addr={merchant.shopFullAddress || merchant.shopDetails?.address?.fullAddress} 
                                meta={`${merchant.shopBlock}, ${merchant.shopDistrict}, ${merchant.shopState} - ${merchant.shopPin}`} 
                            />
                            <div style={docRow}>
                                <FileBox label="Hub Interior" url={merchant.shopPhotoIn} onOpen={() => setViewImage(merchant.shopPhotoIn)} />
                                <FileBox label="Hub Exterior" url={merchant.shopPhotoOut} onOpen={() => setViewImage(merchant.shopPhotoOut)} />
                            </div>
                        </AuditSection>

                        {/* 💳 Section: Financial Settlement */}
                        <AuditSection title="Financial Settlement Node" icon="💳" color="#27ae60">
                            <div style={grid2}>
                                <DataRow label="Bank Institution" val={merchant.bankName} />
                                <DataRow label="A/C Number" val={merchant.bankAcc} />
                                <DataRow label="IFSC Protocol" val={merchant.bankIfsc} />
                                <FileBox label="Evidence (Passbook/Cheque)" url={merchant.bankFile} onOpen={() => setViewImage(merchant.bankFile)} />
                            </div>
                        </AuditSection>

                    </div>
                </div>

                {/* --- FINAL ACTION TERMINAL --- */}
                <div style={actionTerminal}>
                    {merchant.shopDetails?.status === 'Approved' ? (
                        <div style={finalStatusBox}>
                            <h2 style={{margin:0}}>✅ MASTER NODE SYNCHRONIZED</h2>
                            <p style={{margin:'8px 0', fontSize: '15px'}}>Merchant is Active on Network. Generated ID: <b>{merchant.generatedId}</b></p>
                            <small style={{opacity:0.7}}>Activation Timestamp: {formatDate(merchant.approvedAt)}</small>
                            <div style={{marginTop: 15}}>
                                <button onClick={() => window.print()} style={printBtn}>Print Certificate</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={checkRow}>
                                <input type="checkbox" id="verifyCheck" checked={isConfirmed} onChange={(e)=>setIsConfirmed(e.target.checked)} style={checkS} />
                                <label htmlFor="verifyCheck" style={checkLab}>
                                    I confirm that I have verified all <b>Personnel, KYC, Location and Banking</b> data strings at my level.
                                </label>
                            </div>

                            <div style={btnGrid}>
                                <button onClick={() => setActionType('correction')} style={subBtnS('#fffbeb', '#b45309')}>🔄 REQUEST CORRECTION</button>
                                <button onClick={() => setActionType('reject')} style={subBtnS('#fff1f2', '#be123c')}>❌ PERMANENT PURGE</button>
                                <button 
                                    onClick={handleFinalActivation} 
                                    disabled={!isConfirmed || isProcessing} 
                                    style={mainActionBtn(isConfirmed ? themeColor : '#cbd5e1')}
                                >
                                    {isProcessing ? 'SYNCHRONIZING...' : '✅ VERIFY & ACTIVATE HUB'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* --- DECISION MODAL --- */}
            {actionType && (
                <div style={modalOverlay}>
                    <div style={modalBox}>
                        <h3 style={{margin:0, color: actionType === 'reject' ? '#e11d48' : '#d97706'}}>
                            {actionType === 'reject' ? 'Confirm Permanent Rejection' : 'Request Data Correction'}
                        </h3>
                        <p style={{fontSize: 12, color: '#64748b', marginTop: 5}}>Instructions will be dispatched to the merchant via SMS/Dashboard.</p>
                        <textarea 
                            style={inputS} 
                            placeholder="Specify details (e.g. Upload clear Aadhaar back side)..." 
                            value={rejectionMsg}
                            onChange={(e)=>setRejectionMsg(e.target.value)}
                        />
                        <div style={modalBtns}>
                            <button onClick={handleDecisionSubmit} disabled={isProcessing} style={modalOkBtn(actionType === 'reject' ? '#ef4444' : '#f59e0b')}>
                                {isProcessing ? 'Processing...' : 'CONFIRM PROTOCOL'}
                            </button>
                            <button onClick={()=>setActionType(null)} style={modalCancelBtn}>CANCEL</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- LIGHTBOX (IMAGE VIEWER) --- */}
            {viewImage && (
                <div style={lightboxOverlay} onClick={() => setViewImage(null)}>
                    <div style={lightboxTool}>VIEWING ASSET • CLICK ANYWHERE TO CLOSE</div>
                    <img src={viewImage} style={imgLarge} alt="Audit Preview" />
                </div>
            )}
        </div>
    );
};

// --- MICRO UI COMPONENTS ---

const AuditSection = ({ title, icon, color, children }) => (
    <div style={{...sectionS, borderTop: `4px solid ${color}`}}>
        <div style={sectionHead}><span style={{marginRight:8}}>{icon}</span> {title}</div>
        {children}
    </div>
);

const DataRow = ({ label, val }) => (
    <div style={{marginBottom:12}}>
        <label style={labelS}>{label}</label>
        <div style={valueS}>{val || '---'}</div>
    </div>
);

const FileBox = ({ label, url, onOpen }) => (
    <div style={{flex:1}}>
        <label style={labelS}>{label}</label>
        <div style={fileFrame} onClick={onOpen}>
            {url ? <img src={url} style={imgFull} alt="Doc" /> : <div style={noFile}>FILE_MISSING</div>}
        </div>
    </div>
);

const AddressBox = ({ label, addr, meta }) => (
    <div style={addrBoxS}>
        {label && <label style={labelS}>{label}</label>}
        <div style={{fontSize:13, fontWeight:700, color:'#1e293b', lineHeight:1.5}}>{addr || 'Address string missing.'}</div>
        <div style={{fontSize:11, fontWeight:700, color: 'var(--primary-theme)', marginTop:5, opacity: 0.8}}>{meta}</div>
    </div>
);

// --- ENTERPRISE STYLES ---

const containerS = { background: '#f8fafc', minHeight: '100vh', paddingBottom: 40 };
const headerHUD = { display: 'flex', alignItems: 'center', background: '#fff', padding: '15px 30px', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' };
const backBtnS = { background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: 11 };
const headerCenter = { flex: 1, textAlign: 'center' };
const titleS = { margin: 0, fontSize: 15, fontWeight: 900, color: '#0f172a', letterSpacing: '0.5px' };
const idTagS = { fontSize: 10, fontWeight: 800, color: '#94a3b8' };
const statusPill = (s) => ({ background: s === 'Approved' ? '#ecfdf5' : '#fff7ed', color: s === 'Approved' ? '#059669' : '#c2410c', padding: '5px 15px', borderRadius: 100, fontSize: 10, fontWeight: 900, border: '1px solid currentColor' });

const mainContentS = { padding: '25px', maxWidth: '1350px', margin: '0 auto' };
const auditGridS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '25px' };
const columnS = { display: 'flex', flexDirection: 'column', gap: '25px' };

const sectionS = { background: '#fff', padding: '22px', borderRadius: '22px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' };
const sectionHead = { fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 18, letterSpacing: 1.2 };

const profileHead = { display: 'flex', gap: '22px', alignItems: 'center', background: '#f8fafc', padding: 18, borderRadius: 18, border: '1px solid #f1f5f9' };
const avatarFrame = { width: 100, height: 100, borderRadius: 15, overflow: 'hidden', border: '4px solid #fff', position: 'relative', cursor: 'zoom-in', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' };
const imgFull = { width: '100%', height: '100%', objectFit: 'cover' };
const zoomTag = { position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 8, textAlign: 'center', padding: 3, fontWeight: 900 };

const labelS = { fontSize: 9, fontWeight: 900, color: '#cbd5e1', textTransform: 'uppercase', display: 'block', marginBottom: 3, letterSpacing: 0.5 };
const valueS = { fontSize: 13, fontWeight: 700, color: '#334155' };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 };
const docRow = { display: 'flex', gap: 15, marginTop: 15 };
const fileFrame = { height: 110, background: '#f1f5f9', borderRadius: 12, overflow: 'hidden', border: '1.5px dashed #cbd5e1', cursor: 'zoom-in' };
const noFile = { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#cbd5e1', fontWeight: 800 };
const addrBoxS = { background: '#f8fafc', padding: 15, borderRadius: 15, border: '1px solid #f1f5f9' };

const actionTerminal = { marginTop: 35, background: '#fff', padding: '35px', borderRadius: 28, border: '1px solid #e2e8f0', boxShadow: '0 15px 50px rgba(0,0,0,0.05)' };
const checkRow = { display: 'flex', gap: 15, alignItems: 'center', background: '#f0fdf4', padding: 20, borderRadius: 18, marginBottom: 30, border: '1px solid #dcfce7' };
const checkS = { width: 22, height: 22, cursor: 'pointer' };
const checkLab = { fontSize: 14, fontWeight: 700, color: '#166534', lineHeight: 1.4 };
const btnGrid = { display: 'flex', gap: 15, flexWrap: 'wrap' };
const subBtnS = (bg, c) => ({ background: bg, color: c, border: '1px solid transparent', padding: '16px 25px', borderRadius: 14, fontWeight: 800, fontSize: 11, cursor: 'pointer', transition: '0.2s' });
const mainActionBtn = (c) => ({ flex: 1, background: c, color: '#fff', border: 'none', padding: '16px 35px', borderRadius: 14, fontWeight: 900, cursor: 'pointer', boxShadow: `0 10px 25px ${c}40`, transition: '0.3s' });

const finalStatusBox = { textAlign: 'center', background: '#ecfdf5', color: '#059669', padding: 35, borderRadius: 24, border: '1px solid #d1fae5' };
const printBtn = { background: '#059669', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 };

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' };
const modalBox = { background: '#fff', padding: 35, borderRadius: 28, width: '95%', maxWidth: 480, boxShadow: '0 30px 60px rgba(0,0,0,0.3)' };
const inputS = { width: '100%', height: 120, marginTop: 20, borderRadius: 15, border: '1.5px solid #e2e8f0', padding: 15, outline: 'none', fontSize: 14, fontFamily: 'inherit' };
const modalBtns = { display: 'flex', gap: 12, marginTop: 25 };
const modalOkBtn = (c) => ({ flex: 1, background: c, color: '#fff', border: 'none', padding: 14, borderRadius: 12, fontWeight: 800, cursor: 'pointer' });
const modalCancelBtn = { flex: 1, background: '#f1f5f9', border: 'none', padding: 14, borderRadius: 12, fontWeight: 800, cursor: 'pointer' };

const lightboxOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' };
const lightboxTool = { position: 'absolute', top: 30, color: '#fff', fontSize: 11, fontWeight: 900, letterSpacing: 2, background: 'rgba(255,255,255,0.1)', padding: '8px 20px', borderRadius: 100 };
const imgLarge = { maxWidth: '92vw', maxHeight: '85vh', borderRadius: 12, boxShadow: '0 0 50px rgba(0,0,0,0.8)' };
const loaderAreaS = { height: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#94a3b8', letterSpacing: 2, fontSize: 12 };

export default MerchantAuditView;