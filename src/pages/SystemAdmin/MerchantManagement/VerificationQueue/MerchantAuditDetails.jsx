import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from 'services/api';

const MerchantAuditDetails = ({ shop, onBack, onActionComplete, themeColor }) => {
    // --- 🛠️ EXACT DATA MAPPING (डेटाबेस के अनुसार) ---
    const initialData = useMemo(() => {
        if (!shop) return {};
        return {
            ...shop,
            // पर्सनल विवरण
            fullName: shop.fullName || '---',
            fatherName: shop.fatherName || '---',
            dob: shop.dob?.$date || shop.dob || null,
            gender: shop.gender || '---',
            mobile: shop.mobile || '---',
            whatsapp: shop.whatsapp || '---',
            email: shop.email || '---',
            
            // शॉप विवरण (Nested & Root)
            shopName: shop.shopName || shop.shopDetails?.shopName || '---',
            shopType: shop.shopType || shop.shopDetails?.shopType || '---',
            shopPin: shop.shopPin || shop.shopDetails?.address?.pinCode || '---',
            shopFullAddress: shop.shopFullAddress || shop.shopDetails?.address?.fullAddress || '---',
            shopDistrict: shop.shopDistrict || shop.shopDetails?.address?.district || '---',
            shopState: shop.shopState || shop.shopDetails?.address?.state || '---',
            shopBlock: shop.shopBlock || shop.shopDetails?.address?.block || '---',
            
            // पते (Permanent - 'p' prefix as per your DB)
            pFullAddress: shop.pFullAddress || '---',
            pState: shop.pState || '---',
            pDistrict: shop.pDistrict || '---',
            pBlock: shop.pBlock || '---',
            pPin: shop.pPin || '---',

            // पते (Temporary/Correspondence - 't' prefix as per your DB)
            tFullAddress: shop.tFullAddress || '---',
            tState: shop.tState || '---',
            tDistrict: shop.tDistrict || '---',
            tBlock: shop.tBlock || '---',
            tPin: shop.tPin || '---',

            // बैंक और केवाईसी
            aadharNumber: shop.aadharNumber || '---',
            panNumber: shop.panNumber || '---',
            gstNumber: shop.gstNumber || '---',
            bankName: shop.bankName || '---',
            bankIfsc: shop.bankIfsc || '---',
            bankAcc: shop.bankAcc || '---',

            // इमेज/फाइल्स
            ownerPhoto: shop.ownerPhoto || shop.photo || '',
            shopPhotoIn: shop.shopPhotoIn || '',
            shopPhotoOut: shop.shopPhotoOut || '',
            aadharFile: shop.aadharFile || '',
            panFile: shop.panFile || '',
            bankFile: shop.bankFile || ''
        };
    }, [shop]);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(initialData);
    const [actionLoading, setActionLoading] = useState(false);
    const [remarks, setRemarks] = useState("");
    
    // Viewer States
    const [viewImage, setViewImage] = useState(null);
    const [imgRotation, setImgRotation] = useState(0);
    const [imgScale, setImgScale] = useState(1);

    // Master Data
    const [locationData, setLocationData] = useState([]);
    const [banks, setBanks] = useState([]);
    const [shopTypes, setShopTypes] = useState([]);

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [bRes, sRes, lRes] = await Promise.all([
                    api.get('/admin/directories/banks'),
                    api.get('/admin/directories/shop-types'),
                    api.get('/admin/directories/locations')
                ]);
                setBanks(bRes.data.data || []);
                setShopTypes(sRes.data.data || []);
                setLocationData(lRes.data.data || []);
            } catch (err) { console.error("Meta sync failed"); }
        };
        fetchMeta();
    }, []);

    const appAging = useMemo(() => {
        const start = new Date(shop.createdAt?.$date || shop.createdAt);
        const now = new Date();
        return Math.ceil(Math.abs(now - start) / (1000 * 60 * 60 * 24));
    }, [shop.createdAt]);

    const currentLevel = useMemo(() => {
        const s = shop.shopDetails?.status || shop.status;
        if (s === 'Pending') return { step: 1, label: 'District Admin', color: '#7c3aed' };
        if (s === 'DistrictApproved') return { step: 2, label: 'State Admin', color: '#0891b2' };
        if (s === 'StateApproved') return { step: 3, label: 'System Admin (Final)', color: '#10b981' };
        return { step: 0, label: s, color: '#94a3b8' };
    }, [shop]);

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdits = async () => {
        setActionLoading(true);
        try {
            await api.put(`/admin/hierarchy/update/${shop._id}`, formData);
            toast.success("Merchant records updated.");
            setIsEditing(false);
        } catch (err) { toast.error("Save failed."); }
        finally { setActionLoading(false); }
    };

    const handleAction = async (action, label, targetLevel = null) => {
        if (!window.confirm(`SECURITY CONFIRMATION: ${label}`)) return;
        setActionLoading(true);
        try {
            await api.put(`/admin/shops/approve/${shop._id}`, { action, remarks, approvalLevel: targetLevel });
            toast.success("Action synchronized.");
            onActionComplete();
        } catch (err) { toast.error("Action failed."); }
        finally { setActionLoading(false); }
    };

    const handleReject = async () => {
        const reason = window.prompt("Reason for rejection:");
        if (!reason) return;
        setActionLoading(true);
        try {
            await api.put(`/admin/shops/reject/${shop._id}`, { reason });
            toast.info("Node decommissioned.");
            onActionComplete();
        } catch (err) { toast.error("Reject failed."); }
        finally { setActionLoading(false); }
    };

    const downloadMedia = (url) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `Doc_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatDt = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '---';

    return (
        <div style={masterWrapperS}>
            
            {/* --- 1. HEADER --- */}
            <div style={headerS(themeColor)}>
                <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
                    <button onClick={onBack} style={backBtnS}>← HUB REGISTRY</button>
                    <div>
                        <h2 style={brandTitleS}>AUDIT: {formData.shopName}</h2>
                        <div style={statusRowS}>
                            <span style={dotS(currentLevel.color)}></span>
                            <span style={roleTagS}>{formData.trackingId} • {appAging} DAYS ELAPSED</span>
                        </div>
                    </div>
                </div>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} style={editBtnS}>📝 EDIT HUB DATA</button>
                ) : (
                    <button onClick={handleSaveEdits} style={saveBtnTopS}>💾 SAVE RECORDS</button>
                )}
            </div>

            {/* --- 2. PIPELINE GRAPH --- */}
            <div style={pipelineAreaS}>
                <h3 style={sectionLabelS(themeColor)}>00. Deployment Path</h3>
                <div style={stepperS}>
                    <Step active={true} label="Applied" sub="Merchant" />
                    <Connector active={currentLevel.step >= 1} />
                    <Step active={currentLevel.step >= 1} current={currentLevel.step === 1} label="District Node" sub="Verification" />
                    <Connector active={currentLevel.step >= 2} />
                    <Step active={currentLevel.step >= 2} current={currentLevel.step === 2} label="State Node" sub="Authorization" />
                    <Connector active={currentLevel.step >= 3} />
                    <Step active={currentLevel.step === 3} current={currentLevel.step === 3} label="Deployment" sub="Live Hub" />
                </div>
            </div>

            {/* --- 3. MAIN CONTENT --- */}
            <div style={contentPaddingS}>
                <div style={mainGridS}>
                    {/* LEFT COLUMN */}
                    <div style={colS}>
                        <Section title="01. Personnel Identity Ledger" theme={themeColor}>
                            <div style={identityBlockS}>
                                <div style={photoContainerS}>
                                    <label style={labS}>Proprietor</label>
                                    <div style={pBoxS} onClick={() => setViewImage(formData.ownerPhoto)}>
                                        {formData.ownerPhoto ? <img src={formData.ownerPhoto} style={ownerImgS} alt="P" /> : "NO IMAGE"}
                                        <div style={zoomLabelS}>Expand</div>
                                    </div>
                                </div>
                                <div style={{flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                                    <InputField label="Full Legal Name" name="fullName" val={formData.fullName} edit={isEditing} onChange={handleFieldChange} />
                                    <InputField label="Father's Name" name="fatherName" val={formData.fatherName} edit={isEditing} onChange={handleFieldChange} />
                                    <InputField label="Date of Birth" name="dob" val={formData.dob} type="date" edit={isEditing} onChange={handleFieldChange} />
                                    <InputField label="Gender" name="gender" val={formData.gender} edit={isEditing} type="select" options={['Male','Female','Other']} onChange={handleFieldChange} />
                                </div>
                            </div>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'15px'}}>
                                <InputField label="Mobile" name="mobile" val={formData.mobile} edit={isEditing} onChange={handleFieldChange} />
                                <InputField label="WhatsApp" name="whatsapp" val={formData.whatsapp} edit={isEditing} onChange={handleFieldChange} />
                                <InputField label="Official Email" name="email" val={formData.email} edit={isEditing} onChange={handleFieldChange} />
                            </div>
                        </Section>

                        <Section title="02. Compliance & KYC" theme="#16a085">
                            <div style={dataGridS}>
                                <InputField label="Aadhaar UID" name="aadharNumber" val={formData.aadharNumber} edit={isEditing} onChange={handleFieldChange} />
                                <InputField label="PAN Identity" name="panNumber" val={formData.panNumber} edit={isEditing} onChange={handleFieldChange} />
                                <InputField label="GST Number" name="gstNumber" val={formData.gstNumber} edit={isEditing} onChange={handleFieldChange} />
                            </div>
                        </Section>

                        <Section title="03. Financial Node" theme="#27ae60">
                            <div style={dataGridS}>
                                <InputField label="Bank Name" name="bankName" val={formData.bankName} edit={isEditing} type="select" options={banks.map(b=>b.name)} onChange={handleFieldChange} />
                                <InputField label="IFSC Code" name="bankIfsc" val={formData.bankIfsc} edit={isEditing} onChange={handleFieldChange} />
                                <InputField label="Account Number" name="bankAcc" val={formData.bankAcc} edit={isEditing} onChange={handleFieldChange} />
                            </div>
                        </Section>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={colS}>
                        <Section title="04. Commercial Hub Configuration" theme="#3498db">
                            <div style={dataGridS}>
                                <InputField label="Trading Name" name="shopName" val={formData.shopName} edit={isEditing} onChange={handleFieldChange} />
                                <InputField label="Sector" name="shopType" val={formData.shopType} edit={isEditing} type="select" options={shopTypes.map(t=>t.name)} onChange={handleFieldChange} />
                                <InputField label="Hub Pincode" name="shopPin" val={formData.shopPin} edit={isEditing} onChange={handleFieldChange} />
                                <InputField label="GPS Coords" val={`${formData.shopCoords?.lat || 0}, ${formData.shopCoords?.lng || 0}`} />
                                <InputField label="Full Hub Address" name="shopFullAddress" val={formData.shopFullAddress} edit={isEditing} span={2} type="textarea" onChange={handleFieldChange} />
                            </div>
                        </Section>

                        <Section title="05. Jurisdictional Registry" theme="#e67e22">
                            <div style={addressStackS}>
                                <AddressBlock label="Correspondence" addr={formData.tFullAddress} block={formData.tBlock} dist={formData.tDistrict} state={formData.tState} pin={formData.tPin} />
                                <AddressBlock label="Permanent Residential" addr={formData.pFullAddress} block={formData.pBlock} dist={formData.pDistrict} state={formData.pState} pin={formData.pPin} />
                            </div>
                        </Section>

                        <Section title="06. Documentary Portfolio" theme="#000">
                            <div style={evidenceGridS}>
                                <DocThumb label="Shop Outer" src={formData.shopPhotoOut} onZoom={setViewImage} />
                                <DocThumb label="Shop Inner" src={formData.shopPhotoIn} onZoom={setViewImage} />
                                <DocThumb label="Aadhaar Scan" src={formData.aadharFile} onZoom={setViewImage} />
                                <DocThumb label="PAN Identity" src={formData.panFile} onZoom={setViewImage} />
                                <DocThumb label="Bank Passbook" src={formData.bankFile} onZoom={setViewImage} />
                            </div>
                        </Section>
                    </div>
                </div>

                {/* --- 📝 REMARKS & ACTIONS --- */}
                <Section title="📝 ADMINISTRATIVE ACTIONS" theme="#ef4444">
                    <textarea 
                        style={remarksAreaS} 
                        placeholder="Log observations here..." 
                        value={remarks}
                        onChange={(e)=>setRemarks(e.target.value)}
                    />
                    
                    <div style={actionRowS}>
                        <button onClick={handleReject} style={rejBtnS}>❌ REJECT</button>
                        <button onClick={() => handleAction('correction', 'Send for correction?')} style={corBtnS}>🔄 CORRECTION</button>
                        <div style={divLineS}></div>
                        <button onClick={() => handleAction('district', 'Verify District?')} style={stepBtnS('#7c3aed')}>VERIFY DISTRICT</button>
                        <button onClick={() => handleAction('state', 'Verify State?')} style={stepBtnS('#0891b2')}>VERIFY STATE</button>
                        <button 
                            onClick={() => handleAction('finalize', 'Deploy Hub?')} 
                            style={finalBtnS(themeColor)}
                            disabled={actionLoading}
                        >
                            {actionLoading ? 'DEPLOYING...' : '✅ FINALIZE & DEPLOY ID'}
                        </button>
                    </div>
                </Section>
            </div>

            {/* --- IMAGE VIEWER MODAL --- */}
            {viewImage && (
                <div style={modalOverlayS} onClick={() => { setViewImage(null); setImgScale(1); setImgRotation(0); }}>
                    <div style={modalContentS} onClick={e=>e.stopPropagation()}>
                        <div style={modalToolbarS}>
                            <button onClick={()=>setImgRotation(r=>r+90)} style={toolB}>ROTATE 🔄</button>
                            <button onClick={()=>setImgScale(s=>Math.min(s+0.2, 3))} style={toolB}>ZOOM +</button>
                            <button onClick={()=>setImgScale(s=>Math.max(s-0.2, 0.5))} style={toolB}>ZOOM -</button>
                            <button onClick={()=>downloadMedia(viewImage)} style={toolB}>DOWNLOAD ⬇️</button>
                            <button onClick={()=>setViewImage(null)} style={closeB}>CLOSE ✕</button>
                        </div>
                        <div style={imgFrameS}>
                            <img src={viewImage} style={{ maxWidth:'85vw', maxHeight:'75vh', transition:'0.3s', transform:`rotate(${imgRotation}deg) scale(${imgScale})` }} alt="Evidence" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Atomic Components ---
const Section = ({ title, theme, children }) => (
    <div style={sectionCardS(theme)}>
        <h4 style={sectionTitleS(theme)}>{title}</h4>
        {children}
    </div>
);

const InputField = ({ label, name, val, edit, type, onChange, options, span=1 }) => (
    <div style={{ gridColumn: `span ${span}`, marginBottom:'10px' }}>
        <small style={labS}>{label}</small>
        {edit ? (
            type === 'select' ? (
                <select name={name} style={inS} value={val} onChange={onChange}>
                    <option value="">Select</option>
                    {options?.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
            ) : type === 'textarea' ? (
                <textarea name={name} style={areaS} value={val} onChange={onChange} />
            ) : (
                <input name={name} type={type||'text'} style={inS} value={val} onChange={onChange} />
            )
        ) : (
            <p style={valS}>{(val === '---' || !val) ? '---' : val}</p>
        )}
    </div>
);

const AddressBlock = ({ label, addr, block, dist, state, pin }) => (
    <div style={addrBoxS}>
        <small style={labS}>{label} HUB</small>
        <p style={valS}>
            {addr === '---' ? 'Address missing' : `${addr}, ${block}, ${dist}, ${state} - ${pin}`}
        </p>
    </div>
);

const DocThumb = ({ label, src, onZoom }) => (
    <div style={docItemS}>
        <div style={docFrameS} onClick={() => src && onZoom(src)}>
            {src ? <img src={src} style={docImgS} alt="Evidence" /> : 'MISSING'}
        </div>
        <small style={labS}>{label}</small>
    </div>
);

const Step = ({ active, current, label, sub }) => (
    <div style={stepWrapS}>
        <div style={stepCircleS(active, current)}>{active ? '✓' : ''}</div>
        <div style={{width:'100px'}}>
            <div style={{fontSize:'10px', fontWeight:'900', color: active?'#1e293b':'#94a3b8'}}>{label}</div>
            <div style={{fontSize:'8px', color:'#94a3b8'}}>{sub}</div>
        </div>
    </div>
);

const Connector = ({ active }) => <div style={connectorS(active)}></div>;

// --- MASTER STYLES ---
const masterWrapperS = { background:'#f1f5f9', minHeight:'100vh', margin:0, padding:0, fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerS = (col) => ({ background:'#fff', padding:'20px 30px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom: `1px solid #e2e8f0` });
const brandTitleS = { margin:0, fontSize:'20px', fontWeight:'900', color:'#0f172a' };
const statusRowS = { display:'flex', alignItems:'center', gap:'8px' };
const dotS = (c) => ({ width:'8px', height:'8px', borderRadius:'50%', background:c });
const roleTagS = { fontSize:'9px', fontWeight:'900', color:'#94a3b8', letterSpacing:'1px' };
const backBtnS = { background:'#f8fafc', border:'1px solid #e2e8f0', padding:'8px 15px', borderRadius:'10px', fontWeight:'800', fontSize:'10px', cursor:'pointer' };
const editBtnS = { background:'#3b82f6', color:'#fff', border:'none', padding:'8px 18px', borderRadius:'10px', fontWeight:'900', fontSize:'10px', cursor:'pointer' };
const saveBtnTopS = { background:'#10b981', color:'#fff', border:'none', padding:'8px 18px', borderRadius:'10px', fontWeight:'900', fontSize:'10px', cursor:'pointer' };
const pipelineAreaS = { background:'#fff', padding:'25px 40px', borderBottom:'1px solid #e2e8f0', marginBottom:'20px' };
const sectionLabelS = (c) => ({ fontSize:'10px', fontWeight:'900', color:c, textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px' });
const stepperS = { display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:'800px', margin:'0 auto' };
const contentPaddingS = { padding:'0 20px 40px 20px' };
const mainGridS = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' };
const colS = { display:'flex', flexDirection:'column', gap:'20px' };
const sectionCardS = (col) => ({ background:'#fff', padding:'25px', borderRadius:'20px', borderLeft:`6px solid ${col}`, boxShadow:'0 5px 15px rgba(0,0,0,0.02)', border:'1px solid #f1f5f9', borderLeftWidth:'6px' });
const sectionTitleS = (col) => ({ margin:'0 0 15px 0', fontSize:'11px', fontWeight:'900', color:col, textTransform:'uppercase' });
const dataGridS = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px' };
const labS = { fontSize:'8px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase', display:'block', marginBottom:'2px' };
const valS = { margin:0, fontWeight:'700', fontSize:'13px', color:'#1e293b' };
const identityBlockS = { display:'flex', gap:'25px', alignItems:'flex-start', borderBottom:'1px solid #f1f5f9', paddingBottom:'15px', marginBottom:'15px' };
const photoContainerS = { textAlign:'center' };
const pBoxS = { width:'110px', height:'130px', background:'#f8fafc', borderRadius:'15px', border:'1px solid #e2e8f0', overflow:'hidden', cursor:'zoom-in', position:'relative' };
const ownerImgS = { width:'100%', height:'100%', objectFit:'cover' };
const zoomLabelS = { position:'absolute', bottom:0, width:'100%', background:'rgba(0,0,0,0.5)', color:'#fff', fontSize:'8px', fontWeight:'800', padding:'4px 0' };
const inS = { width:'100%', padding:'8px', borderRadius:'8px', border:'1.5px solid #e2e8f0', fontSize:'12px', fontWeight:'700', outline:'none', background:'#fcfdfe' };
const areaS = { ...inS, height:'60px', resize:'none' };
const addressStackS = { display:'flex', flexDirection:'column', gap:'12px' };
const addrBoxS = { background:'#fcfdfe', padding:'12px', borderRadius:'12px', border:'1px solid #f1f5f9' };
const evidenceGridS = { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px' };
const docItemS = { textAlign:'center' };
const docFrameS = { height:'70px', background:'#f8fafc', borderRadius:'10px', border:'1px solid #e2e8f0', overflow:'hidden', marginBottom:'5px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'zoom-in' };
const docImgS = { width:'100%', height:'100%', objectFit:'cover' };
const remarksAreaS = { width:'100%', height:'80px', padding:'15px', borderRadius:'18px', border:'1.5px solid #f1f5f9', fontSize:'13px', fontWeight:'600', color:'#475569', outline:'none', background:'#fcfdfe', marginBottom:'20px' };
const actionRowS = { display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap', justifyContent:'center' };
const divLineS = { width:'1.5px', height:'30px', background:'#e2e8f0' };
const btnBase = { border:'none', padding:'12px 25px', borderRadius:'12px', fontWeight:'900', fontSize:'11px', cursor:'pointer', transition:'0.2s' };
const rejBtnS = { ...btnBase, background:'#fff1f2', color:'#e11d48' };
const corBtnS = { ...btnBase, background:'#fffbeb', color:'#d97706' };
const stepBtnS = (c) => ({ ...btnBase, background:`${c}15`, color:c });
const finalBtnS = (c) => ({ ...btnBase, background:c, color:'#fff', padding:'14px 35px', boxShadow:`0 10px 20px ${c}40` });
const stepWrapS = { textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:'5px', position:'relative', zIndex:2 };
const stepCircleS = (a, c) => ({ width:'28px', height:'28px', borderRadius:'50%', background: c ? '#fff' : (a ? '#10b981' : '#f1f5f9'), border: `2.5px solid ${c ? '#7c3aed' : (a ? '#10b981' : '#e2e8f0')}`, display:'flex', alignItems:'center', justifyContent:'center', color: a ? '#fff' : '#94a3b8', fontWeight:'900', fontSize:'12px' });
const connectorS = (a) => ({ flex: 1, height: '3px', background: a ? '#10b981' : '#f1f5f9', margin: '0 -30px 25px' });
const modalOverlayS = { position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(15,23,42,0.98)', zIndex:10001, display:'flex', alignItems:'center', justifyContent:'center' };
const modalContentS = { textAlign:'center' };
const modalToolbarS = { display:'flex', gap:'10px', justifyContent:'center', marginBottom:'15px', flexWrap:'wrap' };
const imgFrameS = { overflow:'hidden', borderRadius:'12px', background:'#000', display:'flex', alignItems:'center', justifyContent:'center' };
const toolB = { background:'rgba(255,255,255,0.1)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', padding:'8px 15px', borderRadius:'8px', cursor:'pointer', fontWeight:'800', fontSize:'10px' };
const closeB = { ...toolB, background:'#ef4444', border:'none' };

export default MerchantAuditDetails;