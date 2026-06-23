// src/pages/SystemAdmin/ShopStaffRegister.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../../services/api'; 
import { useBranding } from '../../../../context/BrandingContext';
import { toast } from 'react-toastify';

const ShopStaffRegister = ({ onBack }) => {
    const { settings } = useBranding();
    const [loading, setLoading] = useState(false);
    const [banks, setBanks] = useState([]);
    const [locationData, setLocationData] = useState([]);

    // --- OTP & Verification Logic ---
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

    const [formData, setFormData] = useState({
        fullName: '', fatherName: '', dob: '', gender: '',
        mobile: '', whatsapp: '', isSameAsMobile: false, altMobile: '',
        email: '', staffPhoto: '', 
        shopId: '', roleInShop: '', joiningDate: '',
        // Academic
        qualification: '', fieldOfStudy: '', experienceYears: '', qualificationFile: '',
        // KYC
        aadharNumber: '', aadharFile: '', panNumber: '', panFile: '', 
        // Residential Address
        pState: '', pDistrict: '', pBlock: '', pPin: '', pFullAddress: '',
        isSameAsPermanent: false,
        tState: '', tDistrict: '', tBlock: '', tPin: '', tFullAddress: '',
        // Office Address (Automated via Shop ID)
        officeState: '', officeDistrict: '', officeBlock: '', officePin: '', officeFullAddress: '',
        // Emergency & Banking
        emergencyContactName: '', emergencyContactNumber: '',
        bankName: '', bankAcc: '', confirmBankAcc: '', bankIfsc: '', bankFile: '',
        consent: false, role: 'Staff',
        permissions: {
            orderProcessing: false, inventoryUpdate: false, customerSupport: false,
            deliveryAssignment: false, payoutViewing: false, shopAnalytics: false
        }
    });

    const hubPrivileges = [
        { key: 'orderProcessing', label: 'Order Processing', icon: '📦', desc: 'Accept, prepare and mark orders as ready.' },
        { key: 'inventoryUpdate', label: 'Inventory Hub', icon: '🛒', desc: 'Add new products and update real-time stock.' },
        { key: 'deliveryAssignment', label: 'Logistics Node', icon: '🛵', desc: 'Assign orders to delivery executives.' },
        { key: 'customerSupport', label: 'Support Access', icon: '🎧', desc: 'Direct access to hub-level helpdesk.' },
        { key: 'payoutViewing', label: 'Financial Audit', icon: '💰', desc: 'View sales reports and settlement status.' },
        { key: 'shopAnalytics', label: 'Hub Intelligence', icon: '📊', desc: 'Access to performance charts and growth data.' }
    ];

    // --- 🏠 Fix: Auto Populate Office Address from Shop ID (Sync Fix) ---
    const fetchShopAddress = async (id) => {
        if (!id || id.length !== 12) return; 
        try {
            const res = await api.get(`/admin/shops/details-by-id/${id}`);
            if (res.data.success) {
                const shop = res.data.data;
                setFormData(prev => ({
                    ...prev,
                    officeState: shop.shopState || 'N/A',
                    officeDistrict: shop.shopDistrict || 'N/A',
                    officeBlock: shop.shopBlock || 'N/A',
                    officePin: shop.shopPin || 'N/A',
                    officeFullAddress: shop.shopFullAddress || 'N/A' // ✅ Fixed: Correct Mapping
                }));
                toast.success("Office Location Data Synced.");
            }
        } catch (err) {
            toast.error("Hub ID not found in master registry.");
        }
    };

    const fetchData = useCallback(async () => {
        try {
            const [bRes, lRes] = await Promise.all([api.get('/admin/directories/banks'), api.get('/admin/directories/locations')]);
            setBanks(bRes.data.data || []);
            setLocationData(lRes.data.data || []);
        } catch (err) { console.error("Infrastructure lookup failed."); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Smart Formatting Logic
    const formatToTitleCase = (str) => str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = type === 'checkbox' ? checked : value;
        if (['panNumber', 'bankIfsc', 'shopId'].includes(name)) finalValue = finalValue.toUpperCase();
        const titleFields = ['fullName', 'fatherName', 'pFullAddress', 'tFullAddress', 'emergencyContactName', 'fieldOfStudy'];
        if (titleFields.includes(name) && typeof finalValue === 'string' && finalValue.length > 0) finalValue = formatToTitleCase(finalValue);
        
        setFormData(prev => ({ ...prev, [name]: finalValue }));
        if (name === 'shopId' && finalValue.length === 12) fetchShopAddress(finalValue);
    };

    const handleFile = (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1048576) { toast.error("Max 1MB allowed."); return; }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => setFormData(p => ({ ...p, [field]: reader.result }));
    };

    const handleLocChange = (section, level, value) => {
        const stateObj = locationData.find(s => s.state === value);
        const dists = stateObj ? stateObj.districts : [];
        if (level === 'state') {
            if (section === 'perm') { setPDistricts(dists); setPBlocks([]); setFormData(p=>({...p, pState:value, pDistrict:'', pBlock:''})); }
            else if (section === 'pres') { setTDistricts(dists); setTBlocks([]); setFormData(p=>({...p, tState:value, tDistrict:'', tBlock:''})); }
        } else if (level === 'district') {
            const currentDists = section === 'perm' ? pDistricts : tDistricts;
            const distObj = currentDists.find(d => d.name === value);
            const blocks = distObj ? distObj.blocks : [];
            if (section === 'perm') { setPBlocks(blocks); setFormData(p=>({...p, pDistrict:value, pBlock:''})); }
            else if (section === 'pres') { setTBlocks(blocks); setFormData(p=>({...p, tDistrict:value, tBlock:''})); }
        }
    };

    // Auto Sync Handlers
    useEffect(() => {
        if (formData.isSameAsPermanent) {
            setTDistricts(pDistricts); setTBlocks(pBlocks);
            setFormData(p => ({ ...p, tState: p.pState, tDistrict: p.pDistrict, tBlock: p.pBlock, tPin: p.pPin, tFullAddress: p.pFullAddress }));
        }
    }, [formData.isSameAsPermanent, formData.pState, formData.pDistrict, formData.pBlock, formData.pPin, formData.pFullAddress, pDistricts, pBlocks]);

    useEffect(() => { if (formData.isSameAsMobile) setFormData(p => ({ ...p, whatsapp: p.mobile })); }, [formData.isSameAsMobile, formData.mobile]);

    const handleSendOtp = async (type) => {
        const val = type === 'mobile' ? formData.mobile : formData.email;
        try {
            setVerifying(p => ({ ...p, [type]: true }));
            await api.post('/auth/security/request-otp', { [type]: val });
            setOtpSent(p => ({ ...p, [type]: true }));
            toast.info("Security code dispatched.");
        } catch (err) { toast.error("Gateway error."); }
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
                toast.success("Identity Handshake Successful.");
            }
        } catch (err) { toast.error("Invalid Code."); }
        finally { setVerifying(p => ({ ...p, [type]: false })); }
    };

    const handleSubmit = async (e) => {
        if(e) e.preventDefault();
        if (!bypassVerification && (!verified.mobile || !verified.email)) return toast.warning("Complete Mobile & Email handshakes.");
        if (!formData.fullName || !formData.mobile || !formData.shopId || !formData.pFullAddress || !formData.pPin) {
            return toast.error("Essential fields (*) are missing!");
        }

        setLoading(true);
        try {
            const res = await api.post('/admin/hierarchy/add', formData);
            if (res.data.success) {
                toast.success(`Staff ID ${res.data.data?.loginId} Deployed!`);
                onBack();
            }
        } catch (err) { toast.error(err.response?.data?.message || "Operational node deploy failure."); }
        finally { setLoading(false); }
    };

    const themeColor = settings?.themeColor || '#0f172a';
    const Star = () => <span style={{color:'#ef4444'}}>*</span>;

    const FileInput = ({ label, field, required = false }) => (
        <div style={inputGroup}>
            <label style={labS}>{label} {required && <Star/>}</label>
            <div style={fileBox}>
                <input type="file" onChange={(e)=>handleFile(e, field)} style={{fontSize:'11px', width:'100%'}} />
                <p style={fileInstr}>1MB LIMIT | JPG, PNG, PDF</p>
            </div>
            <div style={previewFrame}>{formData[field] ? <img src={formData[field].startsWith('data:image') ? formData[field] : 'https://cdn-icons-png.flaticon.com/512/337/337946.png'} style={previewImg} alt="P" /> : "Preview Ready"}</div>
        </div>
    );

    return (
        <div style={containerS}>
            <div style={headerS}>
                <button onClick={onBack} style={backBtn}>← EXIT HUB</button>
                <div style={{flex: 1}}>
                    <h2 style={{margin:0, color: themeColor, fontWeight:'900'}}>👥 Provision Shop Staff Infrastructure Node</h2>
                    <p style={{margin: '4px 0 0', fontSize: '13px', color: '#64748b'}}>Authorized staff onboarding wizard.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={overrideBox}>
                    <div style={{flex:1}}><h4 style={{margin:0, color:'#1e293b', fontWeight:'900'}}>🛡️ Security Bypass Protocol</h4><p style={{margin:'5px 0 0 0', fontSize:'12px', color:'#475569'}}>Skip identity handshakes for manual trusted entries.</p></div>
                    <label style={switchLabel}><input type="checkbox" checked={bypassVerification} onChange={(e)=>setBypassVerification(e.target.checked)} style={{width:'22px', height:'22px', cursor:'pointer'}} /><span style={{fontSize:'14px', fontWeight:'900', color: themeColor}}>MASTER BYPASS</span></label>
                </div>

                {/* 01. IDENTITY */}
                <div style={sectionBox(themeColor)}>
                    <h3 style={secLabel}>👤 01. Personnel Identity Registry</h3>
                    <div style={grid2}>
                        <div style={inputGroup}><label style={labS}>Full Legal Name <Star/></label><input name="fullName" style={inS} onChange={handleChange} placeholder="First Letter Capital" value={formData.fullName} /></div>
                        <div style={inputGroup}><label style={labS}>Father's Name</label><input name="fatherName" style={inS} onChange={handleChange} placeholder="Guardian legal name" value={formData.fatherName} /></div>
                        <div style={inputGroup}><label style={labS}>Date of Birth</label><input name="dob" type="date" style={inS} onChange={handleChange} value={formData.dob} /></div>
                        <div style={inputGroup}><label style={labS}>Gender</label><select name="gender" style={inS} onChange={handleChange} value={formData.gender}><option value="">-- Select --</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                        <div style={inputGroup}>
                            <label style={labS}>Mobile Node ID <Star/></label>
                            <div style={flexRow}>
                                <input name="mobile" value={formData.mobile} maxLength="10" placeholder="10-digit number" style={inS} onChange={handleChange} disabled={verified.mobile} />
                                {formData.mobile.length === 10 && !verified.mobile && !bypassVerification && <button type="button" onClick={()=>handleSendOtp('mobile')} disabled={verifying.mobile} style={vBtn}>{otpSent.mobile ? "RESEND" : "SEND OTP"}</button>}
                                {verified.mobile && <span style={checkV}>✓ Trusted</span>}
                            </div>
                            {otpSent.mobile && !verified.mobile && <div style={{...flexRow, marginTop:'10px'}}><input placeholder="OTP" style={otpInS} maxLength="6" onChange={(e)=>setEnteredOtp({...enteredOtp, mobile: e.target.value})} /><button type="button" onClick={()=>handleVerifyOtp('mobile')} style={verifyBtnS}>VERIFY</button></div>}
                        </div>
                        <div style={inputGroup}><label style={labS}>WhatsApp Node</label><input name="whatsapp" value={formData.whatsapp} maxLength="10" placeholder="WhatsApp" style={inS} onChange={handleChange} disabled={formData.isSameAsMobile} /><label style={checkLabel}><input type="checkbox" name="isSameAsMobile" checked={formData.isSameAsMobile} onChange={handleChange} /> Same as Mobile</label></div>
                        <div style={inputGroup}>
                            <label style={labS}>Official Email Node</label>
                            <div style={flexRow}>
                                <input name="email" value={formData.email} type="email" placeholder="example@rkdmart.com" style={inS} onChange={handleChange} disabled={verified.email} />
                                {formData.email.includes('@') && !verified.email && !bypassVerification && <button type="button" onClick={()=>handleSendOtp('email')} disabled={verifying.email} style={vBtn}>{otpSent.email ? "RESEND" : "SEND OTP"}</button>}
                                {verified.email && <span style={checkV}>✓ Verified</span>}
                            </div>
                            {otpSent.email && !verified.email && <div style={{...flexRow, marginTop:'10px'}}><input placeholder="OTP" style={otpInS} maxLength="6" onChange={(e)=>setEnteredOtp({...enteredOtp, email: e.target.value})} /><button type="button" onClick={()=>handleVerifyOtp('email')} style={verifyBtnS}>VERIFY</button></div>}
                        </div>
                        <FileInput label="Staff Portrait" field="staffPhoto" required={true} />
                    </div>
                </div>

                {/* 02. PROFESSIONAL ASSOCIATION */}
                <div style={sectionBox('#9b59b6', '#fdfbff')}>
                    <h3 style={secLabel}>🏢 02. Hub Assignment & Designation</h3>
                    <div style={grid2}>
                        <div style={inputGroup}><label style={labS}>Associated Hub ID (12 Digits) <Star/></label><input name="shopId" maxLength="12" style={inS} onChange={handleChange} placeholder="SHOPXXXXXXXX" value={formData.shopId} /></div>
                        <div style={inputGroup}><label style={labS}>Joining Date</label><input name="joiningDate" type="date" style={inS} onChange={handleChange} value={formData.joiningDate} /></div>
                        <div style={inputGroup}><label style={labS}>Designated Role</label><select name="roleInShop" style={inS} onChange={handleChange} value={formData.roleInShop}><option value="">-- Role --</option><option value="Manager">Manager</option><option value="Cashier">Cashier</option><option value="Delivery">Delivery Node</option></select></div>
                    </div>
                </div>

                {/* 03. ACADEMIC NODE */}
                <div style={sectionBox('#f39c12')}>
                    <h3 style={secLabel}>🎓 03. Academic Node & Experience</h3>
                    <div style={grid2}>
                        <div style={inputGroup}><label style={labS}>Highest Qualification</label><select name="qualification" style={inS} onChange={handleChange} value={formData.qualification}><option value="">-- Select Degree --</option><option value="Graduate">University Graduate</option><option value="Post-Graduate">Post-Graduate</option><option value="Undergraduate">Undergraduate</option></select></div>
                        <div style={inputGroup}><label style={labS}>Field of Study</label><input name="fieldOfStudy" style={inS} onChange={handleChange} placeholder="e.g. Commerce" value={formData.fieldOfStudy} /></div>
                        <div style={inputGroup}><label style={labS}>Experience (Years)</label><input name="experienceYears" type="number" style={inS} onChange={handleChange} placeholder="e.g. 2" value={formData.experienceYears} /></div>
                        <FileInput label="Academic Certificate" field="qualificationFile" />
                    </div>
                </div>

                {/* 04. KYC NODE */}
                <div style={sectionBox('#16a085')}>
                    <h3 style={secLabel}>📑 04. Statutory KYC Records</h3>
                    <div style={grid2}>
                        <div style={inputGroup}><label style={labS}>Aadhaar UID Number</label><input name="aadharNumber" maxLength="12" style={inS} onChange={handleChange} placeholder="12-digit UID" value={formData.aadharNumber} /></div>
                        <FileInput label="Aadhaar Scan Portfolio" field="aadharFile" />
                        <div style={inputGroup}><label style={labS}>PAN Identity Node</label><input name="panNumber" value={formData.panNumber} maxLength="10" style={inS} onChange={handleChange} placeholder="ABCDE1234F" /></div>
                        <FileInput label="PAN Evidence Scan" field="panFile" />
                    </div>
                </div>

                {/* 05. ADDRESS NODE */}
                <div style={sectionBox('#e67e22')}>
                    <h3 style={secLabel}>🏠 05. Residential Address Hub</h3>
                    <p style={subHead}>PERMANENT HOME ADDRESS <Star/></p>
                    <div style={grid3}>
                        <select style={inS} value={formData.pState} onChange={(e)=>handleLocChange('perm','state',e.target.value)}><option value="">State</option>{locationData.map((l,i)=><option key={i} value={l.state}>{l.state}</option>)}</select>
                        <select style={inS} value={formData.pDistrict} onChange={(e)=>handleLocChange('perm','district',e.target.value)}><option value="">District</option>{pDistricts.map((d,i)=><option key={i} value={d.name}>{d.name}</option>)}</select>
                        <select style={inS} name="pBlock" value={formData.pBlock} onChange={handleChange}><option value="">Block</option>{pBlocks.map((b,i)=><option key={i} value={b}>{b}</option>)}</select>
                        <input name="pPin" maxLength="6" placeholder="Pincode *" style={inS} onChange={handleChange} value={formData.pPin} />
                        <input name="pFullAddress" placeholder="Full Home Address *" style={{...inS, gridColumn: 'span 2'}} onChange={handleChange} value={formData.pFullAddress} />
                    </div>
                    <div style={syncBox}><label style={checkLabel}><input type="checkbox" name="isSameAsPermanent" checked={formData.isSameAsPermanent} onChange={handleChange} /> <b>TEMPORARY ADDRESS</b> is same as Permanent</label></div>
                    {!formData.isSameAsPermanent && (
                        <div style={{...grid3, marginTop:'15px'}}>
                            <select style={inS} value={formData.tState} onChange={(e)=>handleLocChange('pres','state',e.target.value)}><option value="">State</option>{locationData.map((l,i)=><option key={i} value={l.state}>{l.state}</option>)}</select>
                            <select style={inS} value={formData.tDistrict} onChange={(e)=>handleLocChange('pres','district',e.target.value)}><option value="">District</option>{tDistricts.map((d,i)=><option key={i} value={d.name}>{d.name}</option>)}</select>
                            <select style={inS} name="tBlock" value={formData.tBlock} onChange={handleChange}><option value="">Block</option>{tBlocks.map((b,i)=><option key={i} value={b}>{b}</option>)}</select>
                            <input name="tPin" maxLength="6" placeholder="Aasthai PIN" style={inS} onChange={handleChange} value={formData.tPin} />
                            <input name="tFullAddress" placeholder="Aasthai Full Address" style={{...inS, gridColumn: 'span 2'}} onChange={handleChange} value={formData.tFullAddress} />
                        </div>
                    )}
                </div>

                {/* 06. OFFICE NODE (Automated) */}
                <div style={sectionBox('#3498db', '#f0f7ff')}>
                    <h3 style={secLabel}>🏢 06. Official Workplace (Office) Node</h3>
                    <div style={grid3}>
                        <input placeholder="Locked State" style={lockedInS} value={formData.officeState} readOnly />
                        <input placeholder="Locked District" style={lockedInS} value={formData.officeDistrict} readOnly />
                        <input placeholder="Locked Block" style={lockedInS} value={formData.officeBlock} readOnly />
                        <input placeholder="Locked PIN" style={lockedInS} value={formData.officePin} readOnly />
                        <input placeholder="Workplace Location" style={{...lockedInS, gridColumn: 'span 2'}} value={formData.officeFullAddress} readOnly />
                    </div>
                </div>

                {/* 07. EMERGENCY NODE */}
                <div style={sectionBox('#e74c3c')}>
                    <h3 style={secLabel}>📱 07. Communication & Security Status</h3>
                    <div style={grid2}>
                        <div style={inputGroup}><label style={labS}>Emergency Contact Name</label><input name="emergencyContactName" style={inS} onChange={handleChange} placeholder="Full Name" value={formData.emergencyContactName} /></div>
                        <div style={inputGroup}><label style={labS}>Emergency Mobile Node</label><input name="emergencyContactNumber" maxLength="10" style={inS} onChange={handleChange} placeholder="10-digit number" value={formData.emergencyContactNumber} /></div>
                    </div>
                </div>

                {/* 08. BANKING NODE */}
                <div style={sectionBox('#27ae60')}>
                    <h3 style={secLabel}>💳 08. Financial Settlement Hub</h3>
                    <div style={grid2}>
                        <div style={inputGroup}><label style={labS}>Bank Institution</label><select name="bankName" style={inS} onChange={handleChange} value={formData.bankName}><option value="">Select Bank</option>{banks.map((b,i)=><option key={i} value={b.name}>{b.name}</option>)}</select></div>
                        <div style={inputGroup}><label style={labS}>IFSC Code</label><input name="bankIfsc" value={formData.bankIfsc} maxLength="11" style={inS} onChange={handleChange} placeholder="Uppercase" /></div>
                        <div style={inputGroup}><label style={labS}>Account Number</label><input name="bankAcc" type="password" style={inS} onChange={handleChange} placeholder="Enter ID" value={formData.bankAcc} /></div>
                        <div style={inputGroup}><label style={labS}>Confirm Account</label><input name="confirmBankAcc" style={inS} onChange={handleChange} placeholder="Verify ID" value={formData.confirmBankAcc} /></div>
                        <div style={{...inputGroup, gridColumn: 'span 2'}}><FileInput label="Passbook/Cheque Evidence" field="bankFile" /></div>
                    </div>
                </div>

                {/* 09. PRIVILEGES */}
                <div style={sectionBox('#8e44ad', '#fbf4ff')}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'35px'}}>
                        <h3 style={{...secLabel, margin:0}}>🔑 09. Functional Privileges</h3>
                        <button type="button" onClick={() => {
                            const keys = Object.keys(formData.permissions);
                            const updated = {}; keys.forEach(k => updated[k] = true);
                            setFormData(prev => ({ ...prev, permissions: updated }));
                        }} style={masterToggleBtn(themeColor)}>GRANT ALL</button>
                    </div>
                    <div style={permGridS}>
                        {hubPrivileges.map(priv => (
                            <div key={priv.key} onClick={()=>setFormData(p=>({...p, permissions:{...p.permissions, [priv.key]:!p.permissions[priv.key]}}))} style={pNodeS(formData.permissions[priv.key], themeColor)}>
                                <div style={switchIconBox(themeColor)}>{priv.icon}</div>
                                <div style={{flex: 1}}>
                                    <h4 style={{margin:'0 0 4px 0', fontSize:'14px', color:'#1e293b', fontWeight:'800'}}>{priv.label}</h4>
                                    <p style={{margin: 0, fontSize: '10px', color: '#94a3b8', lineHeight:'1.4'}}>{priv.desc}</p>
                                </div>
                                <div style={checkBallS(formData.permissions[priv.key])}></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={consentBox}>
                    <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} required style={{width:'24px', height:'24px'}} />
                    <span style={{fontSize:'14px', color:'#475569', fontWeight:'bold'}}>I certify that all personnel metadata provided is authentic.</span>
                </div>

                <button type="submit" style={loading ? disBtn : submitBtn(themeColor)} disabled={loading}>{loading ? "📡 DEPLOYING NODE..." : "🚀 AUTHORIZE & DEPLOY STAFF MEMBER"}</button>
            </form>
        </div>
    );
};

// --- Strategic Styles ---
const containerS = { padding: '25px', background:'#f1f5f9', minHeight:'100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerS = { display:'flex', alignItems:'center', gap:'25px', background:'#fff', padding:'25px', borderRadius:'25px', marginBottom:'45px', boxShadow:'0 10px 30px rgba(0,0,0,0.03)' };
const backBtn = { background:'#fff', color:'#1e293b', border:'1.5px solid #e2e8f0', padding:'12px 24px', borderRadius:'12px', cursor:'pointer', fontWeight:'900', fontSize:'12px' };
const overrideBox = { display:'flex', alignItems:'center', background:'#f8fafc', padding: '25px', borderRadius:'20px', border:'1px solid #e2e8f0', marginBottom:'40px', gap:'15px' };
const switchLabel = { display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' };
const sectionBox = (color, bg='#fff') => ({ marginBottom:'40px', padding: '40px', background:bg, borderTop:`8px solid ${color}`, borderRadius:'30px', boxShadow:'0 10px 30px rgba(0,0,0,0.02)', borderLeft:'1px solid #f1f5f9', borderRight:'1px solid #f1f5f9', borderBottom:'1px solid #f1f5f9' });
const secLabel = { fontSize:'18px', fontWeight:'900', color:'#0f172a', marginBottom:'30px' };
const grid2 = { display:'grid', gridTemplateColumns: '1fr 1fr', gap:'30px' };
const grid3 = { display:'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap:'20px' };
const inputGroup = { display:'flex', flexDirection:'column', gap:'10px' };
const labS = { fontSize:'11px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase' };
const inS = { padding:'16px', borderRadius:'14px', border:'1.5px solid #e2e8f0', background:'#f8fafc', outline:'none', fontSize:'14px', width:'100%', fontWeight:'700', color:'#1e293b' };
const lockedInS = { ...inS, background:'#f1f5f9', color:'#475569', cursor:'not-allowed', border:'1.5px dashed #cbd5e1' };
const flexRow = { display:'flex', gap:'10px', alignItems:'center' };
const vBtn = { background:'#0f172a', color:'#fff', border:'none', padding:'12px 20px', borderRadius:'12px', cursor:'pointer', fontWeight:'bold', fontSize:'11px' };
const checkV = { color:'#10b981', fontWeight:'900', fontSize:'12px' };
const fileBox = { background:'#fcfdfe', border:'1.5px dashed #e2e8f0', padding:'15px', borderRadius:'20px', textAlign:'center', position:'relative' };
const previewImg = { height:'80px', width:'80px', objectFit:'cover', borderRadius:'15px', marginTop:'15px', border:'3px solid #fff' };
const previewFrame = { height:'110px', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', borderRadius:'15px', border:'1.2px solid #f1f5f9', marginTop:'10px', fontSize:'10px', color:'#94a3b8', fontWeight:'700' };
const consentBox = { display:'flex', alignItems:'center', gap:'20px', padding:'30px', background:'#f0f7ff', borderRadius:'25px', border:'1px solid #c3dafb', marginBottom:'30px' };
const submitBtn = (color) => ({ width:'100%', padding:'22px', background: color, color:'#fff', border:'none', borderRadius:'20px', fontSize:'18px', fontWeight:'900', cursor:'pointer', boxShadow:`0 15px 35px \${color}40`, letterSpacing:'1px' });
const disBtn = { ...submitBtn('#cbd5e1'), background:'#cbd5e1', cursor:'not-allowed' };
const permGridS = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'20px' };
const pNodeS = (a, c) => ({ display:'flex', alignItems:'center', gap:'15px', padding:'20px', borderRadius:'20px', border:'1px solid', borderColor: a ? c : '#f1f5f9', background: '#fff', cursor:'pointer', transition:'0.3s' });
const checkBallS = (a) => ({ width:'20px', height:'20px', borderRadius:'50%', border:'2px solid #e2e8f0', background: a ? '#10b981' : '#fff', transition:'0.3s' });
const switchIconBox = (color) => ({ width:'50px', height:'50px', background:`${color}08`, borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' });
const otpInS = { ...inS, textAlign:'center', letterSpacing:'8px', width:'150px' };
const verifyBtnS = { background:'#10b981', color:'#fff', border:'none', padding:'15px 25px', borderRadius:'12px', fontWeight:'900', cursor:'pointer' };
const masterToggleBtn = (color) => ({ background:'transparent', border:`1.5px solid ${color}`, color:color, padding:'8px 16px', borderRadius:'10px', fontSize:'11px', fontWeight:'900', cursor:'pointer' });
const fileInstr = { fontSize:'9px', color:'#94a3b8', marginTop:'5px', fontWeight:'700', textTransform:'uppercase' };
const checkLabel = { display:'flex', alignItems:'center', gap:'12px', fontSize:'13px', fontWeight:'bold', color:'#64748b' };
const syncBox = { margin:'25px 0', padding:'15px', background:'#f8fafc', borderRadius:'15px', border:'1px solid #e2e8f0' };
const subHead = { fontSize:'11px', fontWeight:'900', color:'#3498db', marginBottom:'15px' };

export default ShopStaffRegister;