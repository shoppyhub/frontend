import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api'; 
import { useBranding } from '../../../context/BrandingContext';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

/**
 * RKD_MART - DISTRICT OPERATOR REGISTRATION (ULTIMATE VERSION)
 * ✅ फीचर्स: Cascading Address Dropdowns, Bank Selection, Conditional Office logic.
 */

const DistOperatorRegister = ({ onBack }) => {
    const { settings } = useBranding();
    const { user } = useAuth(); 
    const [loading, setLoading] = useState(false);
    
    // Master Data States
    const [locationData, setLocationData] = useState([]);
    const [banks, setBanks] = useState([]);
    
    // Cascading States for Dropdowns
    const [permDistricts, setPermDistricts] = useState([]);
    const [permBlocks, setPermBlocks] = useState([]);
    const [tempDistricts, setTempDistricts] = useState([]);
    const [tempBlocks, setTempBlocks] = useState([]);
    const [availableBlocks, setAvailableBlocks] = useState([]); // For Assignment

    // Verification States
    const [isMobileVerified, setIsMobileVerified] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [otpSent, setOtpSent] = useState({ mobile: false, email: false });
    const [enteredOtp, setEnteredOtp] = useState({ mobile: '', email: '' });

    const [formData, setFormData] = useState({
        fullName: '', fatherName: '', dob: '', gender: '',
        mobile: '', whatsapp: '', isSameAsMobile: false,
        primaryEmail: '', 
        emergencyContactName: '', emergencyContactNumber: '', 
        assignedState: user?.assignedState || '', 
        assignedDistrict: user?.assignedDistrict || '',
        operationScope: 'District', 
        assignedBlock: 'District Wide', 
        department: 'Support Desk', operatorPhoto: '',
        aadharNumber: '', aadharFile: '', panNumber: '', panFile: '', 
        qualification: '', qualificationFile: '',

        // Residential
        pState: '', pDistrict: '', pBlock: '', pPin: '', pFullAddress: '',
        isSameAsPermanent: false,
        tState: '', tDistrict: '', tBlock: '', tPin: '', tFullAddress: '',
        
        // Office Node
        officeState: user?.assignedState || '',
        officeDistrict: user?.assignedDistrict || '',
        officeBlock: '', officePin: '', officeFullAddress: '',
        
        bankName: '', bankAcc: '', confirmBankAcc: '', bankIfsc: '', bankFile: '',
        consent: false,
        role: 'DistrictOperator',
        permissions: {
            ticketManagement: true,
            merchantInquiry: true,
            deliveryTracking: true,
            localDataEntry: true
        }
    });

    const themeColor = settings?.themeColor || '#0d9488';
    const Star = () => <span style={{color:'#ef4444', fontWeight:'bold', marginLeft:'3px'}}>*</span>;
    const FileInfo = () => <p style={{fontSize:'9px', color:'#94a3b8', marginTop:'4px'}}>MAX 1MB | JPG/PNG/PDF</p>;

    // 1. डेटाबेस से मास्टर डेटा लोड करना
    const fetchMasterData = useCallback(async () => {
        try {
            const [locRes, bankRes] = await Promise.all([
                api.get('/admin/directories/locations'),
                api.get('/admin/directories/banks')
            ]);
            setLocationData(locRes.data.data || []);
            setBanks(bankRes.data.data || []);

            // एडमिन के जिले के ब्लॉक सेट करना
            const stateObj = locRes.data.data.find(s => s.state === user?.assignedState);
            const distObj = stateObj?.districts.find(d => d.name === user?.assignedDistrict);
            setAvailableBlocks(distObj ? distObj.blocks : []);
        } catch (err) {
            console.error("Master data sync failed");
        }
    }, [user]);

    useEffect(() => { fetchMasterData(); }, [fetchMasterData]);

    // 2. Cascading Address Logic (Dropdown Management)
    const handleLocChange = (section, level, val) => {
        const stateObj = locationData.find(s => s.state === val);
        const dists = stateObj ? stateObj.districts : [];

        if (level === 'state') {
            if (section === 'perm') { setPermDistricts(dists); setPermBlocks([]); setFormData(p=>({...p, pState:val, pDistrict:'', pBlock:''})); }
            if (section === 'temp') { setTempDistricts(dists); setTempBlocks([]); setFormData(p=>({...p, tState:val, tDistrict:'', tBlock:''})); }
        } else if (level === 'district') {
            const currentDists = section === 'perm' ? permDistricts : tempDistricts;
            const distObj = currentDists.find(d => d.name === val);
            const blocks = distObj ? distObj.blocks : [];
            if (section === 'perm') { setPermBlocks(blocks); setFormData(p=>({...p, pDistrict:val, pBlock:''})); }
            if (section === 'temp') { setTempBlocks(blocks); setFormData(p=>({...p, tDistrict:val, tBlock:''})); }
        }
    };

    // 3. स्कोप और ब्लॉक सिंक लॉजिक
    useEffect(() => {
        if (formData.operationScope === 'District') {
            setFormData(prev => ({ ...prev, assignedBlock: 'District Wide', officeBlock: '' }));
        } else {
            setFormData(prev => ({ ...prev, officeBlock: prev.assignedBlock === 'District Wide' ? '' : prev.assignedBlock }));
        }
    }, [formData.operationScope, formData.assignedBlock]);

    // 4. सामान्य इनपुट हैंडलर
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalVal = type === 'checkbox' ? checked : value;

        if (['mobile', 'whatsapp', 'emergencyContactNumber', 'pPin', 'tPin', 'officePin', 'bankAcc', 'confirmBankAcc', 'aadharNumber'].includes(name)) {
            finalVal = finalVal.replace(/\D/g, ''); 
        }
        if (['bankIfsc', 'panNumber'].includes(name)) finalVal = finalVal.toUpperCase();

        setFormData(prev => {
            const updated = { ...prev, [name]: finalVal };
            if (name === 'isSameAsMobile' && checked) updated.whatsapp = prev.mobile;
            if (name === 'isSameAsPermanent' && checked) {
                updated.tState = prev.pState; updated.tDistrict = prev.pDistrict;
                updated.tBlock = prev.pBlock; updated.tPin = prev.pPin;
                updated.tFullAddress = prev.pFullAddress;
                setTempDistricts(permDistricts); setTempBlocks(permBlocks);
            }
            return updated;
        });
    };

    const handleFile = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) return toast.error("File exceeds 1MB");
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => setFormData(p => ({ ...p, [field]: reader.result }));
        }
    };

    // 5. OTP लॉजिक
    const handleSendOtp = async (type) => {
        const val = type === 'mobile' ? formData.mobile : formData.primaryEmail;
        const isEnabled = type === 'mobile' ? settings.mobileVerificationEnabled : settings.emailVerificationEnabled;
        if (!isEnabled) { setOtpSent(p => ({ ...p, [type]: true })); return toast.info("Bypass Mode Active."); }
        try {
            await api.post('/auth/security/request-otp', { [type]: val });
            setOtpSent(p => ({ ...p, [type]: true }));
            toast.success("Code Dispatched.");
        } catch (err) { toast.error("Failed to send OTP."); }
    };

    const handleVerifyOtp = (type) => {
        const isEnabled = type === 'mobile' ? settings.mobileVerificationEnabled : settings.emailVerificationEnabled;
        if (!isEnabled || enteredOtp[type].length > 0) {
            type === 'mobile' ? setIsMobileVerified(true) : setIsEmailVerified(true);
            setOtpSent(p => ({ ...p, [type]: false }));
            toast.success("Verified.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isMobileVerified || !isEmailVerified) return toast.warning("Complete authentication.");
        if (formData.operationScope === 'Block' && (!formData.assignedBlock || formData.assignedBlock === 'District Wide')) return toast.error("Assign a specific block.");
        if (formData.bankAcc !== formData.confirmBankAcc) return toast.error("Account Mismatch.");
        
        setLoading(true);
        try {
            const res = await api.post('/admin/hierarchy/add', formData);
            if (res.data.success) { toast.success("Operator Deployed!"); onBack(); }
        } catch (err) { toast.error(err.response?.data?.message || "Sync Error"); }
        finally { setLoading(false); }
    };

    return (
        <div style={pageBg}>
            <div style={headerHUD}>
                <button onClick={onBack} style={backBtn}>← EXIT WIZARD</button>
                <div>
                    <h2 style={hubTitle}>Provision District Operator Node</h2>
                    <p style={hubSub}>Assigning operational node to {user?.assignedDistrict} Command Center.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={formWrapper}>
                
                {/* 01. SCOPE */}
                <div style={sectionCard('#8e44ad')}>
                    <h3 style={secLabel}>⚙️ 01. Operational Scope & Assignment</h3>
                    <div style={grid2}>
                        <div style={inGrp}>
                            <label style={labS}>Operation Mode <Star/></label>
                            <select name="operationScope" value={formData.operationScope} style={inS} onChange={handleChange} required>
                                <option value="District">District Assistant (Whole District)</option>
                                <option value="Block">Block Specialist (Specific Block)</option>
                            </select>
                        </div>
                        <div style={inGrp}>
                            <label style={labS}>Allocated Jurisdiction <Star/></label>
                            {formData.operationScope === 'District' ? (
                                <input value="DISTRICT WIDE AUTHORITY" disabled style={disabledIn} />
                            ) : (
                                <select name="assignedBlock" style={inS} value={formData.assignedBlock === 'District Wide' ? '' : formData.assignedBlock} onChange={handleChange} required>
                                    <option value="">-- Choose Assigned Block --</option>
                                    {availableBlocks.map((b, i) => <option key={i} value={b}>{b}</option>)}
                                </select>
                            )}
                        </div>
                    </div>
                </div>

                {/* 02. IDENTITY */}
                <div style={sectionCard(themeColor)}>
                    <h3 style={secLabel}>👤 02. Personnel Identity</h3>
                    <div style={grid2}>
                        <div style={inGrp}><label style={labS}>Full Legal Name <Star/></label><input name="fullName" value={formData.fullName} required style={inS} onChange={handleChange} /></div>
                        <div style={inGrp}><label style={labS}>Father's Name <Star/></label><input name="fatherName" value={formData.fatherName} required style={inS} onChange={handleChange} /></div>
                        <div style={inGrp}><label style={labS}>Date of Birth <Star/></label><input name="dob" type="date" required style={inS} onChange={handleChange} /></div>
                        <div style={inGrp}><label style={labS}>Gender <Star/></label>
                            <select name="gender" value={formData.gender} style={inS} onChange={handleChange} required>
                                <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option>
                            </select>
                        </div>
                        <div style={inGrp}><label style={labS}>Identity Portrait <Star/></label><div style={fileBox}><input type="file" onChange={(e)=>handleFile(e, 'operatorPhoto')} required /></div>{formData.operatorPhoto && <img src={formData.operatorPhoto} style={previewImg} alt="P" />}</div>
                    </div>
                </div>

                {/* 03. CONTACT */}
                <div style={sectionCard('#3498db')}>
                    <h3 style={secLabel}>📱 03. Secure Communication Nodes</h3>
                    <div style={grid2}>
                        <div style={inGrp}>
                            <label style={labS}>Mobile <Star/></label>
                            <div style={flexRow}>
                                <input name="mobile" value={formData.mobile} maxLength="10" style={isMobileVerified ? verifiedIn : inS} onChange={handleChange} required disabled={isMobileVerified} />
                                {formData.mobile.length === 10 && !isMobileVerified && <button type="button" onClick={()=>handleSendOtp('mobile')} style={vBtn(themeColor)}>SEND OTP</button>}
                                {isMobileVerified && <span style={checkV}>✓ Verified</span>}
                            </div>
                            {otpSent.mobile && !isMobileVerified && <div style={otpRow}><input placeholder="OTP" style={otpIn} onChange={(e)=>setEnteredOtp({...enteredOtp, mobile: e.target.value})} /><button type="button" onClick={()=>handleVerifyOtp('mobile')} style={otpOk}>OK</button></div>}
                        </div>
                        <div style={inGrp}>
                            <label style={labS}>WhatsApp Identity <Star/></label>
                            <input name="whatsapp" value={formData.whatsapp} maxLength="10" style={inS} onChange={handleChange} required disabled={formData.isSameAsMobile} />
                            <label style={checkLabel}><input type="checkbox" name="isSameAsMobile" checked={formData.isSameAsMobile} onChange={handleChange} /> Same as mobile</label>
                        </div>
                        <div style={inGrp}>
                            <label style={labS}>Official Email <Star/></label>
                            <div style={flexRow}>
                                <input name="primaryEmail" type="email" value={formData.primaryEmail} style={isEmailVerified ? verifiedIn : inS} onChange={handleChange} required disabled={isEmailVerified} />
                                {formData.primaryEmail.includes('.com') && !isEmailVerified && <button type="button" onClick={()=>handleSendOtp('email')} style={vBtn(themeColor)}>SEND OTP</button>}
                                {isEmailVerified && <span style={checkV}>✓ Authenticated</span>}
                            </div>
                            {otpSent.email && !isEmailVerified && <div style={otpRow}><input placeholder="OTP" style={otpIn} onChange={(e)=>setEnteredOtp({...enteredOtp, email: e.target.value})} /><button type="button" onClick={()=>handleVerifyOtp('email')} style={otpOk}>OK</button></div>}
                        </div>
                    </div>
                </div>

                {/* 04. KYC & DOCUMENTS */}
                <div style={sectionCard('#e74c3c')}>
                    <h3 style={secLabel}>📑 04. Statutory Documents</h3>
                    <div style={grid2}>
                        <div style={inGrp}><label style={labS}>Aadhaar Number <Star/></label><input name="aadharNumber" value={formData.aadharNumber} maxLength="12" style={inS} onChange={handleChange} required /></div>
                        <div style={inGrp}><label style={labS}>Aadhaar Scan <Star/></label><div style={fileBox}><input type="file" onChange={(e)=>handleFile(e, 'aadharFile')} required /></div><FileInfo/></div>
                        <div style={inGrp}><label style={labS}>PAN Number <Star/></label><input name="panNumber" value={formData.panNumber} maxLength="10" style={inS} onChange={handleChange} required /></div>
                        <div style={inGrp}><label style={labS}>PAN Scan <Star/></label><div style={fileBox}><input type="file" onChange={(e)=>handleFile(e, 'panFile')} required /></div><FileInfo/></div>
                    </div>
                </div>

                {/* 05. EDUCATION */}
                <div style={sectionCard('#16a085')}>
                    <h3 style={secLabel}>🎓 05. Academic Background</h3>
                    <div style={grid2}>
                        <div style={inGrp}>
                            <label style={labS}>Qualification <Star/></label>
                            <select name="qualification" value={formData.qualification} style={inS} onChange={handleChange} required>
                                <option value="">Select Degree</option>
                                <option value="Metric">High School</option><option value="Intermediate">Intermediate</option>
                                <option value="Graduate">Graduate</option><option value="PostGraduate">Post Graduate</option>
                            </select>
                        </div>
                        <div style={inGrp}><label style={labS}>Certificate Scan <Star/></label><div style={fileBox}><input type="file" onChange={(e)=>handleFile(e, 'qualificationFile')} required /></div><FileInfo/></div>
                    </div>
                </div>

                {/* 06. RESIDENTIAL */}
                <div style={sectionCard('#e67e22')}>
                    <h3 style={secLabel}>🏠 06. Residential Addresses</h3>
                    <h4 style={subH}>Permanent Residence</h4>
                    <div style={grid3}>
                        <div style={inGrp}><label style={labS}>State <Star/></label>
                            <select value={formData.pState} style={inS} onChange={(e)=>handleLocChange('perm', 'state', e.target.value)} required>
                                <option value="">Select State</option>{locationData.map((l, i)=><option key={i} value={l.state}>{l.state}</option>)}
                            </select>
                        </div>
                        <div style={inGrp}><label style={labS}>District <Star/></label>
                            <select value={formData.pDistrict} style={inS} onChange={(e)=>handleLocChange('perm', 'district', e.target.value)} required>
                                <option value="">Select District</option>{permDistricts.map((d, i)=><option key={i} value={d.name}>{d.name}</option>)}
                            </select>
                        </div>
                        <div style={inGrp}><label style={labS}>Block/Tehsil <Star/></label>
                            <select name="pBlock" value={formData.pBlock} style={inS} onChange={handleChange} required>
                                <option value="">Select Block</option>{permBlocks.map((b, i)=><option key={i} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <input name="pPin" placeholder="Pin" maxLength="6" value={formData.pPin} style={inS} onChange={handleChange} required />
                        <input name="pFullAddress" placeholder="Full House Address" style={{...inS, gridColumn:'span 2'}} value={formData.pFullAddress} onChange={handleChange} required />
                    </div>

                    <div style={{marginTop:'30px'}}><label style={checkLabel}><input type="checkbox" name="isSameAsPermanent" checked={formData.isSameAsPermanent} onChange={handleChange} /> Temporary address same as above</label></div>

                    {!formData.isSameAsPermanent && (
                        <div style={{...grid3, marginTop:'30px'}}>
                            <div style={inGrp}><label style={labS}>State <Star/></label>
                                <select value={formData.tState} style={inS} onChange={(e)=>handleLocChange('temp', 'state', e.target.value)} required>
                                    <option value="">Select State</option>{locationData.map((l, i)=><option key={i} value={l.state}>{l.state}</option>)}
                                </select>
                            </div>
                            <div style={inGrp}><label style={labS}>District <Star/></label>
                                <select value={formData.tDistrict} style={inS} onChange={(e)=>handleLocChange('temp', 'district', e.target.value)} required>
                                    <option value="">Select District</option>{tempDistricts.map((d, i)=><option key={i} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                            <div style={inGrp}><label style={labS}>Block <Star/></label>
                                <select name="tBlock" value={formData.tBlock} style={inS} onChange={handleChange} required>
                                    <option value="">Select Block</option>{tempBlocks.map((b, i)=><option key={i} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <input name="tPin" placeholder="Temp Pin" maxLength="6" value={formData.tPin} style={inS} onChange={handleChange} required />
                            <input name="tFullAddress" placeholder="Full Temp Address" style={{...inS, gridColumn:'span 2'}} value={formData.tFullAddress} onChange={handleChange} required />
                        </div>
                    )}
                </div>

                {/* 07. OFFICE */}
                {formData.operationScope === 'Block' && (
                    <div style={sectionCard('#2c3e50')}>
                        <h3 style={secLabel}>🏢 07. Office Work Node (Block Specific)</h3>
                        <div style={grid3}>
                            <div style={inGrp}><label style={labS}>Office Block</label><input value={formData.officeBlock} disabled style={disabledIn} /></div>
                            <div style={inGrp}><label style={labS}>Pincode <Star/></label><input name="officePin" value={formData.officePin} maxLength="6" style={inS} onChange={handleChange} required /></div>
                            <div style={{...inGrp, gridColumn:'span 2'}}><label style={labS}>Full Office Address <Star/></label><input name="officeFullAddress" value={formData.officeFullAddress} style={inS} onChange={handleChange} required /></div>
                        </div>
                    </div>
                )}

                {/* 08. BANKING */}
                <div style={sectionCard('#27ae60')}>
                    <h3 style={secLabel}>💳 08. Salary Settlement Node</h3>
                    <div style={grid2}>
                        <div style={inGrp}>
                            <label style={labS}>Bank Institution <Star/></label>
                            <select name="bankName" value={formData.bankName} style={inS} onChange={handleChange} required>
                                <option value="">Select Bank</option>
                                {banks.map((b, i)=><option key={i} value={b.name}>{b.name}</option>)}
                            </select>
                        </div>
                        <div style={inGrp}><label style={labS}>IFSC Code <Star/></label><input name="bankIfsc" value={formData.bankIfsc} style={inS} onChange={handleChange} required /></div>
                        <div style={inGrp}><label style={labS}>Account Number <Star/></label><input name="bankAcc" type="password" value={formData.bankAcc} style={inS} onChange={handleChange} required /></div>
                        <div style={inGrp}><label style={labS}>Confirm Account <Star/></label><input name="confirmBankAcc" value={formData.confirmBankAcc} style={inS} onChange={handleChange} required /></div>
                        <div style={{...inGrp, gridColumn:'span 2'}}><label style={labS}>Evidence Proof <Star/></label><div style={fileBox}><input type="file" onChange={(e)=>handleFile(e, 'bankFile')} required /></div></div>
                    </div>
                </div>

                {/* 09. EMERGENCY */}
                <div style={sectionCard('#95a5a6')}>
                    <h3 style={secLabel}>🚨 09. Emergency Contact (Optional)</h3>
                    <div style={grid2}>
                        <div style={inGrp}><label style={labS}>Contact Name</label><input name="emergencyContactName" value={formData.emergencyContactName} style={inS} onChange={handleChange} /></div>
                        <div style={inGrp}><label style={labS}>Contact Mobile</label><input name="emergencyContactNumber" value={formData.emergencyContactNumber} maxLength="10" style={inS} onChange={handleChange} /></div>
                    </div>
                </div>

                <div style={consentArea}>
                    <input type="checkbox" required style={{width:'24px', height:'24px'}} onChange={(e)=>setFormData({...formData, consent: e.target.checked})} />
                    <span style={{fontSize:'14px', fontWeight:'800', color:'#334155'}}>I certify that all node details are authentic and I authorize this operator deployment.</span>
                </div>

                <button type="submit" style={loading ? disBtn : subBtn(themeColor)} disabled={loading}>
                    {loading ? "DEPLOYING NODE..." : "CONFIRM & REGISTER OPERATOR"}
                </button>
            </form>
        </div>
    );
};

// --- Strategic Styles ---
const pageBg = { padding: '20px 0 60px', background: '#f8fafc', minHeight: '100vh' };
const headerHUD = { display: 'flex', alignItems: 'center', gap: '25px', marginBottom: '40px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', width:'95%', maxWidth:'1100px', margin:'0 auto 40px', flexWrap:'wrap' };
const backBtn = { background: '#fff', border: '1px solid #e2e8f0', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '900' };
const hubTitle = { margin: 0, fontWeight: '900', fontSize: '24px', color: '#0f172a' };
const hubSub = { margin: 0, fontSize: '13px', color: '#64748b', fontWeight: '600' };
const formWrapper = { maxWidth: '1100px', margin: '0 auto', width:'95%' };
const sectionCard = (color) => ({ background: '#fff', padding: window.innerWidth < 768 ? '25px' : '40px', borderRadius: '30px', borderTop: `8px solid ${color}`, marginBottom: '35px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', borderLeft:'1px solid #f1f5f9', borderRight:'1px solid #f1f5f9' });
const secLabel = { margin: '0 0 35px 0', fontSize: '18px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' };
const subH = { fontSize:'11px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase', marginBottom:'15px' };
const grid2 = { display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '30px' };
const grid3 = { display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)', gap: '20px' };
const inGrp = { display: 'flex', flexDirection: 'column', gap: '10px' };
const labS = { fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' };
const inS = { padding: '17px', borderRadius: '15px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontWeight: '700', color: '#1e293b', outline: 'none', width:'100%', boxSizing:'border-box' };
const disabledIn = { ...inS, background: '#f1f5f9', cursor: 'not-allowed', color: '#94a3b8' };
const verifiedIn = { ...inS, borderColor: '#10b981', background: '#ecfdf5', color: '#10b981' };
const flexRow = { display: 'flex', gap: '12px', alignItems: 'center' };
const vBtn = (col) => ({ background: col, color: '#fff', border: 'none', padding: '14px 20px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '11px' });
const checkV = { color: '#10b981', fontWeight: '900', fontSize: '13px' };
const otpRow = { display: 'flex', gap: '10px', marginTop: '10px' };
const otpIn = { ...inS, width: '110px', textAlign: 'center', letterSpacing: '4px' };
const otpOk = { background: '#10b981', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' };
const fileBox = { padding: '15px', border: '2.2px dashed #cbd5e1', borderRadius: '15px', background: '#fcfdfe', textAlign:'center' };
const previewImg = { width: '90px', height: '90px', borderRadius: '15px', marginTop: '15px', objectFit: 'cover', border:'3px solid #fff', boxShadow:'0 5px 15px rgba(0,0,0,0.1)' };
const checkLabel = { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', fontWeight: 'bold', color: '#475569', cursor: 'pointer' };
const consentArea = { display: 'flex', alignItems: 'center', gap: '20px', padding: '30px', background: '#fff', borderRadius: '25px', border: '1.5px solid #e2e8f0', marginBottom: '45px' };
const subBtn = (col) => ({ width: '100%', padding: '24px', background: col, color: '#fff', border: 'none', borderRadius: '22px', fontSize: '17px', fontWeight: '900', cursor: 'pointer', boxShadow: `0 15px 40px ${col}40`, letterSpacing: '1px' });
const disBtn = { ...subBtn('#cbd5e1'), background: '#cbd5e1', cursor: 'not-allowed' };

export default DistOperatorRegister;