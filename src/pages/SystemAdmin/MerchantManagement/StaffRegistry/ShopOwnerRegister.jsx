// src/pages/SystemAdmin/ShopOwnerRegister.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../../services/api'; 
import { useBranding } from '../../../../context/BrandingContext';
import { toast } from 'react-toastify';

const ShopOwnerRegister = ({ onBack }) => {
    const { settings } = useBranding();
    const [loading, setLoading] = useState(false);
    const [banks, setBanks] = useState([]);
    const [shopTypes, setShopTypes] = useState([]);
    const [locationData, setLocationData] = useState([]);

    // OTP & Verification Logic
    const [otpSent, setOtpSent] = useState({ mobile: false, email: false });
    const [enteredOtp, setEnteredOtp] = useState({ mobile: '', email: '' });
    const [verifying, setVerifying] = useState({ mobile: false, email: false });
    const [verified, setVerified] = useState({ mobile: false, email: false });

    const [bypassVerification, setBypassVerification] = useState(false);

    // Dropdowns
    const [pDistricts, setPDistricts] = useState([]); 
    const [pBlocks, setPBlocks] = useState([]); 
    const [tDistricts, setTDistricts] = useState([]); 
    const [tBlocks, setTBlocks] = useState([]);
    const [sDistricts, setSDistricts] = useState([]); 
    const [sBlocks, setSBlocks] = useState([]);       

    const [formData, setFormData] = useState({
        fullName: '', fatherName: '', dob: '', gender: '',
        mobile: '', whatsapp: '', isSameAsMobile: false,
        email: '', ownerPhoto: '', 
        aadharNumber: '', aadharFile: '', panNumber: '', panFile: '', 
        pState: '', pDistrict: '', pBlock: '', pPin: '', pFullAddress: '',
        isSameAsPermanent: false,
        tState: '', tDistrict: '', tBlock: '', tPin: '', tFullAddress: '',
        shopName: '', shopType: '', gstNumber: '',
        shopState: '', shopDistrict: '', shopBlock: '', shopPin: '', shopFullAddress: '',
        shopPhotoIn: '', shopPhotoOut: '',
        bankName: '', bankAcc: '', confirmBankAcc: '', bankIfsc: '', bankFile: '',
        consent: false, role: 'ShopOwner',
        permissions: {
            orderManagement: false, inventoryControl: false, staffCreation: false,
            payoutRequests: false, marketingTools: false, supportAccess: false
        }
    });

    const hubPrivileges = [
        { key: 'orderManagement', label: 'Order Pipeline', icon: '📦', desc: 'Monitor global inbound orders.' },
        { key: 'inventoryControl', label: 'Inventory Hub', icon: '🛒', desc: 'Modify commercial assets/stock.' },
        { key: 'staffCreation', label: 'Staff Deployment', icon: '👥', desc: 'Authorize and create hub sub-staff.' },
        { key: 'payoutRequests', label: 'Finance Hub', icon: '💰', desc: 'Audit revenue and payout analytics.' },
        { key: 'marketingTools', label: 'Marketing Tools', icon: '🎨', desc: 'Boost products to Featured priority.' },
        { key: 'supportAccess', label: 'Support Access', icon: '🎧', desc: 'Direct платфор helpdesk access.' }
    ];

    const fetchData = useCallback(async () => {
        try {
            const [bRes, sRes, lRes] = await Promise.all([
                api.get('/admin/directories/banks'),
                api.get('/admin/directories/shop-types'),
                api.get('/admin/directories/locations')
            ]);
            setBanks(bRes.data.data || []);
            setShopTypes(sRes.data.data || []);
            setLocationData(lRes.data.data || []);
        } catch (err) { toast.error("Critical: Master Data Sync Failed."); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // 🚩 FORMATTING HELPERS
    const formatTitleCase = (str) => str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = type === 'checkbox' ? checked : value;
        
        if (['panNumber', 'bankIfsc', 'gstNumber'].includes(name)) finalValue = finalValue.toUpperCase();
        
        const titleFields = ['fullName', 'fatherName', 'pFullAddress', 'tFullAddress', 'shopFullAddress', 'shopName'];
        if (titleFields.includes(name) && typeof finalValue === 'string' && finalValue.length > 0) {
            finalValue = formatTitleCase(finalValue);
        }
        
        setFormData(prev => {
            const updated = { ...prev, [name]: finalValue };
            if (name === 'isSameAsMobile' && checked) updated.whatsapp = prev.mobile;
            return updated;
        });
    };

    // 📁 INSTANT FILE PREVIEW & VALIDATION
    const handleFile = (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
            toast.error("Format Denied! Use JPG, PNG or PDF.");
            e.target.value = ""; return;
        }

        if (file.size > 1048576) {
            toast.error("File size exceeds 1MB limit.");
            e.target.value = ""; return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setFormData(prev => ({ ...prev, [field]: reader.result }));
        };
    };

    const handleLocChange = (section, level, value) => {
        const stateObj = locationData.find(s => s.state === value);
        const dists = stateObj ? stateObj.districts : [];
        if (level === 'state') {
            if (section === 'perm') { setPDistricts(dists); setPBlocks([]); setFormData(p=>({...p, pState:value, pDistrict:'', pBlock:''})); }
            else if (section === 'pres') { setTDistricts(dists); setTBlocks([]); setFormData(p=>({...p, tState:value, tDistrict:'', tBlock:''})); }
            else if (section === 'shop') { setSDistricts(dists); setSBlocks([]); setFormData(p=>({...p, shopState:value, shopDistrict:'', shopBlock:''})); }
        } else if (level === 'district') {
            const currentDists = section === 'perm' ? pDistricts : section === 'pres' ? tDistricts : sDistricts;
            const distObj = currentDists.find(d => d.name === value);
            const blocks = distObj ? distObj.blocks : [];
            if (section === 'perm') { setPBlocks(blocks); setFormData(p=>({...p, pDistrict:value, pBlock:''})); }
            else if (section === 'pres') { setTBlocks(blocks); setFormData(p=>({...p, tDistrict:value, tBlock:''})); }
            else if (section === 'shop') { setSBlocks(blocks); setFormData(p=>({...p, shopDistrict:value, shopBlock:''})); }
        }
    };

    useEffect(() => {
        if (formData.isSameAsPermanent) {
            setTDistricts(pDistricts); setTBlocks(pBlocks);
            setFormData(p => ({ ...p, tState: p.pState, tDistrict: p.pDistrict, tBlock: p.pBlock, tPin: p.pPin, tFullAddress: p.pFullAddress }));
        }
    }, [formData.isSameAsPermanent, formData.pState, formData.pDistrict, formData.pBlock, formData.pPin, formData.pFullAddress, pDistricts, pBlocks]);

    const handleSendOtp = async (type) => {
        const val = type === 'mobile' ? formData.mobile : formData.email;
        try {
            setVerifying(p => ({ ...p, [type]: true }));
            await api.post('/auth/security/request-otp', { [type]: val });
            setOtpSent(p => ({ ...p, [type]: true }));
            toast.info(`${type.toUpperCase()} OTP Dispatched.`);
        } catch (err) { toast.error("OTP Handshake Failed."); }
        finally { setVerifying(p => ({ ...p, [type]: false })); }
    };

    const handleVerifyOtp = async (type) => {
        const val = type === 'mobile' ? formData.mobile : formData.email;
        try {
            setVerifying(p => ({ ...p, [type]: true }));
            const res = await api.put('/auth/security/verify-otp', { [type]: val, otp: enteredOtp[type] });
            if (res.data.success) {
                setVerified(p => ({ ...p, [type]: true }));
                setOtpSent(p => ({ ...p, [type]: false }));
                toast.success(`${type} Verified.`);
            }
        } catch (err) { toast.error("Invalid Code."); }
        finally { setVerifying(p => ({ ...p, [type]: false })); }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        if (!bypassVerification && (!verified.mobile || !verified.email)) {
            toast.warning("Access Locked: Complete Handshakes first.");
            return;
        }
        if (formData.bankAcc !== formData.confirmBankAcc) return toast.error("Bank Account Mismatch.");
        if (!formData.consent) return toast.error("Accept the certification.");

        setLoading(true);

        // ✅ [UPDATE]: डेटा सिंक सुनिश्चित करने के लिए पे-लोड को मैप करें
        const payload = {
            ...formData,
            // शॉप/हब एड्रेस डेटा
            shopState: formData.shopState,
            shopDistrict: formData.shopDistrict,
            shopBlock: formData.shopBlock,
            shopPin: formData.shopPin,
            shopFullAddress: formData.shopFullAddress,
            // परमानेंट एड्रेस डेटा
            pState: formData.pState,
            pDistrict: formData.pDistrict,
            pBlock: formData.pBlock,
            pPin: formData.pPin,
            pFullAddress: formData.pFullAddress,
            // टेम्परेरी एड्रेस डेटा
            tState: formData.tState,
            tDistrict: formData.tDistrict,
            tBlock: formData.tBlock,
            tPin: formData.tPin,
            tFullAddress: formData.tFullAddress,
            // बैंकिंग डेटा सिंक
            bankIfsc: formData.bankIfsc
        };

        try {
            const res = await api.post('/admin/hierarchy/add', payload);
            if (res.data.success) {
                toast.success("Merchant Hub Deployed Successfully!");
                onBack();
            }
        } catch (err) { 
            const msg = err.response?.data?.message || "Operational hub failure.";
            toast.error(msg);
            console.error("Deploy Error:", err.response);
        } finally { setLoading(false); }
    };

    const themeColor = settings?.themeColor || '#0f172a';
    const Star = () => <span style={{color:'#ef4444'}}>*</span>;

    // Component for File Input
    const FileInput = ({ label, field, required = false }) => (
        <div style={inputGroup}>
            <label style={labS}>{label} {required && <Star/>}</label>
            <div style={fileBox}>
                <input type="file" onChange={(e)=>handleFile(e, field)} style={{fontSize:'11px', width:'100%'}} />
                <p style={fileInstr}>1MB LIMIT | JPG, PNG, PDF</p>
            </div>
            <div style={previewFrame}>
                {formData[field] ? (
                    <img src={formData[field].startsWith('data:image') ? formData[field] : 'https://cdn-icons-png.flaticon.com/512/337/337946.png'} style={previewImg} alt="Preview" />
                ) : <span style={{fontSize:'10px', color:'#94a3b8'}}>Preview Ready</span>}
            </div>
        </div>
    );

    return (
        <div style={containerS}>
            <div style={headerS}>
                <button onClick={onBack} style={backBtn}>← EXIT WIZARD</button>
                <div style={{flex: 1}}>
                    <h2 style={{margin:0, color: themeColor, fontWeight:'900'}}>🏪 Register Enterprise Merchant Hub</h2>
                    <p style={{margin: '4px 0 0', fontSize: '13px', color: '#64748b'}}> neural node establishing wizard.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={overrideBox}>
                    <div style={{flex:1}}><h4 style={{margin:0, color:'#1e293b', fontWeight:'900'}}>🛡️ Master Trust Protocol (Bypass Verification)</h4><p style={{margin:'5px 0 0 0', fontSize:'12px', color:'#475569'}}>Skip handshakes for manual trusted entries.</p></div>
                    <label style={switchLabel}><input type="checkbox" checked={bypassVerification} onChange={(e)=>setBypassVerification(e.target.checked)} style={{width:'22px', height:'22px'}} /><span style={{fontSize:'14px', fontWeight:'900', color: themeColor}}>MASTER BYPASS</span></label>
                </div>

                <div style={sectionBox(themeColor)}>
                    <h3 style={secLabel}>👤 01. Proprietor Identity Registry</h3>
                    <div style={grid2}>
                        <div style={inputGroup}><label style={labS}>Full Legal Name <Star/></label><input name="fullName" style={inS} onChange={handleChange} placeholder="First Letter Capital" value={formData.fullName} /></div>
                        <div style={inputGroup}><label style={labS}>Father's Name <Star/></label><input name="fatherName" style={inS} onChange={handleChange} placeholder="Guardian's Name" value={formData.fatherName} /></div>
                        <div style={inputGroup}><label style={labS}>Date of Birth <Star/></label><input name="dob" type="date" style={inS} onChange={handleChange} value={formData.dob} /></div>
                        <div style={inputGroup}><label style={labS}>Gender Identity <Star/></label><select name="gender" style={inS} onChange={handleChange} value={formData.gender}><option value="">-- Select --</option><option value="Male">Male</option><option value="Female">Female</option><option value="Transgender">Transgender</option></select></div>
                        <div style={inputGroup}>
                            <label style={labS}>Mobile Node <Star/></label>
                            <div style={flexRow}>
                                <input name="mobile" value={formData.mobile} maxLength="10" placeholder="10-digit mobile" style={inS} onChange={handleChange} disabled={verified.mobile} />
                                {formData.mobile.length === 10 && !verified.mobile && !bypassVerification && <button type="button" onClick={()=>handleSendOtp('mobile')} disabled={verifying.mobile} style={vBtn}>{otpSent.mobile ? "RESEND" : "SEND OTP"}</button>}
                                {verified.mobile && <span style={checkV}>✓ Trusted</span>}
                            </div>
                            {otpSent.mobile && !verified.mobile && <div style={{...flexRow, marginTop:'10px'}}><input placeholder="OTP" style={otpInS} maxLength="6" onChange={(e)=>setEnteredOtp({...enteredOtp, mobile: e.target.value})} /><button type="button" onClick={()=>handleVerifyOtp('mobile')} style={verifyBtnS}>VERIFY</button></div>}
                        </div>
                        <div style={inputGroup}><label style={labS}>WhatsApp Node</label><input name="whatsapp" value={formData.whatsapp} maxLength="10" placeholder="WhatsApp Number" style={inS} onChange={handleChange} disabled={formData.isSameAsMobile} /><label style={checkLabel}><input type="checkbox" name="isSameAsMobile" checked={formData.isSameAsMobile} onChange={handleChange} /> Same as Mobile</label></div>
                        <div style={inputGroup}>
                            <label style={labS}>Official Email <Star/></label>
                            <div style={flexRow}>
                                <input name="email" value={formData.email} type="email" placeholder="example@gmail.com" style={inS} onChange={handleChange} disabled={verified.email} />
                                {formData.email.includes('@') && !verified.email && !bypassVerification && <button type="button" onClick={()=>handleSendOtp('email')} disabled={verifying.email} style={vBtn}>{otpSent.email ? "RESEND" : "SEND OTP"}</button>}
                                {verified.email && <span style={checkV}>✓ Verified</span>}
                            </div>
                            {otpSent.email && !verified.email && <div style={{...flexRow, marginTop:'10px'}}><input placeholder="OTP" style={otpInS} maxLength="6" onChange={(e)=>setEnteredOtp({...enteredOtp, email: e.target.value})} /><button type="button" onClick={()=>handleVerifyOtp('email')} style={verifyBtnS}>VERIFY</button></div>}
                        </div>
                        <FileInput label="Proprietor Portrait" field="ownerPhoto" required={true} />
                    </div>
                </div>

                <div style={sectionBox('#16a085')}>
                    <h3 style={secLabel}>📑 02. Statutory KYC & Compliance</h3>
                    <div style={grid2}>
                        <div style={inputGroup}><label style={labS}>Aadhaar UID <Star/></label><input name="aadharNumber" maxLength="12" style={inS} onChange={handleChange} placeholder="12-digit UID" value={formData.aadharNumber} /></div>
                        <FileInput label="Aadhaar Scan" field="aadharFile" required={true} />
                        <div style={inputGroup}><label style={labS}>PAN Tax ID <Star/></label><input name="panNumber" maxLength="10" style={inS} onChange={handleChange} placeholder="ABCDE1234F" value={formData.panNumber} /></div>
                        <FileInput label="PAN Evidence Scan" field="panFile" required={true} />
                    </div>
                </div>

                <div style={sectionBox('#e67e22')}>
                    <h3 style={secLabel}>🏠 03. Residential Registry Details</h3>
                    <p style={subHead}>PERMANENT HOME ADDRESS</p>
                    <div style={grid3}>
                        <select style={inS} value={formData.pState} onChange={(e)=>handleLocChange('perm','state',e.target.value)}><option value="">State</option>{locationData.map((l,i)=><option key={i} value={l.state}>{l.state}</option>)}</select>
                        <select style={inS} value={formData.pDistrict} onChange={(e)=>handleLocChange('perm','district',e.target.value)}><option value="">District</option>{pDistricts.map((d,i)=><option key={i} value={d.name}>{d.name}</option>)}</select>
                        <select style={inS} name="pBlock" value={formData.pBlock} onChange={handleChange}><option value="">Block</option>{pBlocks.map((b,i)=><option key={i} value={b}>{b}</option>)}</select>
                        <input name="pPin" maxLength="6" placeholder="PIN" style={inS} onChange={handleChange} value={formData.pPin} />
                        <input name="pFullAddress" placeholder="Full Address" style={{...inS, gridColumn: 'span 2'}} onChange={handleChange} value={formData.pFullAddress} />
                    </div>
                    <label style={{...checkLabel, marginTop:'15px'}}><input type="checkbox" name="isSameAsPermanent" checked={formData.isSameAsPermanent} onChange={handleChange} /> <b>CORRESPONDENCE</b> is same as Permanent</label>
                    
                    {!formData.isSameAsPermanent && (
                        <div style={{...grid3, marginTop:'15px'}}>
                            <select style={inS} value={formData.tState} onChange={(e)=>handleLocChange('pres','state',e.target.value)}><option value="">State</option>{locationData.map((l,i)=><option key={i} value={l.state}>{l.state}</option>)}</select>
                            <select style={inS} value={formData.tDistrict} onChange={(e)=>handleLocChange('pres','district',e.target.value)}><option value="">District</option>{tDistricts.map((d,i)=><option key={i} value={d.name}>{d.name}</option>)}</select>
                            <select style={inS} name="tBlock" value={formData.tBlock} onChange={handleChange}><option value="">Block</option>{tBlocks.map((b,i)=><option key={i} value={b}>{b}</option>)}</select>
                            <input name="tPin" maxLength="6" placeholder="PIN" style={inS} onChange={handleChange} value={formData.tPin} />
                            <input name="tFullAddress" placeholder="Aasthai Full Address" style={{...inS, gridColumn: 'span 2'}} onChange={handleChange} value={formData.tFullAddress} />
                        </div>
                    )}
                </div>

                <div style={sectionBox('#3498db', '#f0f7ff')}>
                    <h3 style={secLabel}>⚙️ 04. Global Business Configuration</h3>
                    <div style={grid2}>
                        <div style={inputGroup}><label style={labS}>Registered Shop Name <Star/></label><input name="shopName" style={inS} onChange={handleChange} placeholder="Trading Name" value={formData.shopName} /></div>
                        <div style={inputGroup}><label style={labS}>Sector <Star/></label><select name="shopType" style={inS} onChange={handleChange} value={formData.shopType}><option value="">Select Category</option>{shopTypes.map((t,i)=><option key={i} value={t.name}>{t.name}</option>)}</select></div>
                        <div style={{...inputGroup, gridColumn: 'span 2'}}><label style={labS}>GSTIN Identification</label><input name="gstNumber" maxLength="15" style={inS} onChange={handleChange} placeholder="15-digit GST code" value={formData.gstNumber} /></div>
                    </div>
                </div>

                <div style={sectionBox('#9b59b6')}>
                    <h3 style={secLabel}>🏬 05. Hub Location Node</h3>
                    <div style={grid3}>
                        <select style={inS} value={formData.shopState} onChange={(e)=>handleLocChange('shop','state',e.target.value)}><option value="">State</option>{locationData.map((l,i)=><option key={i} value={l.state}>{l.state}</option>)}</select>
                        <select style={inS} value={formData.shopDistrict} onChange={(e)=>handleLocChange('shop','district',e.target.value)}><option value="">District</option>{sDistricts.map((d,i)=><option key={i} value={d.name}>{d.name}</option>)}</select>
                        <select style={inS} name="shopBlock" value={formData.shopBlock} onChange={handleChange}><option value="">Hub Block</option>{sBlocks.map((b,i)=><option key={i} value={b}>{b}</option>)}</select>
                        <input name="shopPin" maxLength="6" placeholder="PIN" style={inS} onChange={handleChange} value={formData.shopPin} />
                        <input name="shopFullAddress" placeholder="Exact Location" style={{...inS, gridColumn: 'span 2'}} onChange={handleChange} value={formData.shopFullAddress} />
                    </div>
                    <div style={{...grid2, marginTop:'20px'}}>
                        <FileInput label="Hub Interior Portrait" field="shopPhotoIn" required={true} />
                        <FileInput label="Hub Exterior Portrait" field="shopPhotoOut" required={true} />
                    </div>
                </div>

                <div style={sectionBox('#27ae60')}>
                    <h3 style={secLabel}>💳 06. Settlement Hub</h3>
                    <div style={grid2}>
                        <div style={inputGroup}><label style={labS}>Bank <Star/></label><select name="bankName" style={inS} onChange={handleChange} value={formData.bankName}><option value="">Select Bank</option>{banks.map((b,i)=><option key={i} value={b.name}>{b.name}</option>)}</select></div>
                        <div style={inputGroup}><label style={labS}>IFSC Code <Star/></label><input name="bankIfsc" maxLength="11" style={inS} onChange={handleChange} placeholder="SBIN0001234" value={formData.bankIfsc} /></div>
                        <div style={inputGroup}><label style={labS}>Account No <Star/></label><input name="bankAcc" type="password" placeholder="Account Number" style={inS} onChange={handleChange} value={formData.bankAcc} /></div>
                        <div style={inputGroup}><label style={labS}>Confirm No <Star/></label><input name="confirmBankAcc" placeholder="Repeat Number" style={inS} onChange={handleChange} value={formData.confirmBankAcc} /></div>
                        <div style={{...inputGroup, gridColumn: 'span 2'}}><FileInput label="Passbook/Cheque Evidence" field="bankFile" required={true} /></div>
                    </div>
                </div>

                <div style={sectionBox('#8e44ad', '#fbf4ff')}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'35px'}}>
                        <h3 style={{...secLabel, margin:0}}>🔑 07. Functional Privileges (Hub Powers)</h3>
                        <button type="button" onClick={() => {
                            const keys = Object.keys(formData.permissions);
                            const anyOff = keys.some(k => !formData.permissions[k]);
                            const updated = {}; keys.forEach(k => updated[k] = anyOff);
                            setFormData(prev => ({ ...prev, permissions: updated }));
                        }} style={masterToggleBtn(themeColor)}>{Object.values(formData.permissions).every(v=>v) ? "REVOKE ALL" : "GRANT ALL ACCESS"}</button>
                    </div>
                    <div style={permGridS}>
                        {hubPrivileges.map(priv => (
                            <div key={priv.key} onClick={()=>setFormData(p=>({...p, permissions:{...p.permissions, [priv.key]:!p.permissions[priv.key]}}))} style={pNodeS(formData.permissions[priv.key], themeColor)}>
                                <div style={switchIconBox(themeColor)}>{priv.icon}</div>
                                <div style={{flex: 1}}><h4 style={{margin:'0 0 4px 0', fontSize:'14px', color:'#1e293b', fontWeight:'800'}}>{priv.label}</h4><p style={{margin:0, fontSize:'10px', color:'#94a3b8', lineHeight:'1.4'}}>{priv.desc}</p></div>
                                <div style={checkBallS(formData.permissions[priv.key])}></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={consentBox}>
                    <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} required style={{width:'24px', height:'24px'}} />
                    <span style={{fontSize:'14px', color:'#475569', fontWeight:'bold'}}>I certify that all personnel metadata and documentation provided are authentic.</span>
                </div>

                <button type="submit" style={loading ? disBtn : submitBtn(themeColor)} disabled={loading}>{loading ? "📡 ESTABLISHING NODE..." : "🚀 AUTHORIZE & DEPLOY MERCHANT HUB"}</button>
            </form>
        </div>
    );
};

// --- Strategic SaaS Styles ---
const containerS = { padding: '25px', background:'#f1f5f9', minHeight:'100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerS = { display:'flex', alignItems:'center', gap:'25px', background:'#fff', padding:'25px', borderRadius:'25px', marginBottom:'45px', boxShadow:'0 10px 30px rgba(0,0,0,0.03)' };
const backBtn = { background:'#fff', color:'#1e293b', border:'1.5px solid #e2e8f0', padding:'12px 24px', borderRadius:'12px', cursor:'pointer', fontWeight:'900' };
const overrideBox = { display:'flex', alignItems:'center', background:'#f8fafc', padding: '25px', borderRadius:'20px', border:'1px solid #e2e8f0', marginBottom:'40px', gap:'15px' };
const switchLabel = { display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' };
const sectionBox = (color, bg='#fff') => ({ marginBottom:'40px', padding: '40px', background:bg, borderTop:`8px solid ${color}`, borderRadius:'30px', boxShadow:'0 10px 30px rgba(0,0,0,0.02)', borderLeft:'1.2px solid #f1f5f9', borderRight:'1.2px solid #f1f5f9', borderBottom:'1.2px solid #f1f5f9' });
const secLabel = { fontSize:'18px', fontWeight:'900', color:'#0f172a', marginBottom:'30px' };
const grid2 = { display:'grid', gridTemplateColumns: '1fr 1fr', gap:'30px' };
const grid3 = { display:'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap:'20px' };
const inputGroup = { display:'flex', flexDirection:'column', gap:'10px' };
const labS = { fontSize:'11px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase' };
const inS = { padding:'16px', borderRadius:'14px', border:'1.5px solid #e2e8f0', background:'#f8fafc', outline:'none', fontSize:'14px', width:'100%', fontWeight:'700', color:'#1e293b' };
const flexRow = { display:'flex', gap:'10px', alignItems:'center' };
const vBtn = { background:'#0f172a', color:'#fff', border:'none', padding:'12px 20px', borderRadius:'12px', cursor:'pointer', fontWeight:'bold', fontSize:'11px' };
const checkV = { color:'#10b981', fontWeight:'900', fontSize:'12px' };
const fileBox = { background:'#fcfdfe', border:'1.5px dashed #e2e8f0', padding:'15px', borderRadius:'20px', textAlign:'center', position:'relative' };
const previewImg = { height:'80px', width:'80px', objectFit:'cover', borderRadius:'15px', marginTop:'10px', border:'3px solid #fff' };
const previewFrame = { height:'110px', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', borderRadius:'15px', border:'1.2px solid #f1f5f9', marginTop:'10px' };
const consentBox = { display:'flex', alignItems:'center', gap:'20px', padding:'30px', background:'#f0f7ff', borderRadius:'25px', border:'1px solid #c3dafb', marginBottom:'30px' };
const submitBtn = (color) => ({ width:'100%', padding:'22px', background: color, color:'#fff', border:'none', borderRadius:'20px', fontSize:'18px', fontWeight:'900', cursor:'pointer', boxShadow:`0 15px 35px \${color}40`, letterSpacing:'1px' });
const disBtn = { ...submitBtn('#cbd5e1'), background:'#cbd5e1', cursor:'not-allowed' };
const permGridS = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'20px' };
const pNodeS = (a, c) => ({ display:'flex', alignItems:'center', gap:'15px', padding:'20px', borderRadius:'20px', border:'1.5px solid', borderColor: a ? c : '#f1f5f9', background: '#fff', cursor:'pointer', transition:'0.3s' });
const checkBallS = (a) => ({ width:'20px', height:'20px', borderRadius:'50%', border:'2px solid #e2e8f0', background: a ? '#10b981' : '#fff', transition:'0.3s' });
const switchIconBox = (color) => ({ width:'50px', height:'50px', background:`${color}08`, borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' });
const otpInS = { ...inS, textAlign:'center', letterSpacing:'8px', width:'150px' };
const verifyBtnS = { background:'#10b981', color:'#fff', border:'none', padding:'15px 25px', borderRadius:'12px', fontWeight:'900', cursor:'pointer' };
const masterToggleBtn = (color) => ({ background:'transparent', border:`1.5px solid ${color}`, color:color, padding:'8px 16px', borderRadius:'10px', fontSize:'11px', fontWeight:'900', cursor:'pointer' });
const fileInstr = { fontSize:'9px', color:'#94a3b8', marginTop:'5px', fontWeight:'700', textTransform:'uppercase' };
const checkLabel = { display:'flex', alignItems:'center', gap:'12px', fontSize:'13px', fontWeight:'bold', color:'#64748b' };
const syncBox = { margin:'25px 0', padding:'15px', background:'#f8fafc', borderRadius:'15px', border:'1px solid #e2e8f0' };
const subHead = { fontSize:'11px', fontWeight:'900', color:'#3498db', marginBottom:'15px' };

export default ShopOwnerRegister;