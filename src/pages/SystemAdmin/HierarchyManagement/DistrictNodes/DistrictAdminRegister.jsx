// src/pages/SystemAdmin/DistrictAdminRegister.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../../services/api'; 
import { useBranding } from '../../../../context/BrandingContext';
import { toast } from 'react-toastify';

const DistrictAdminRegister = ({ onBack }) => {
    const { settings } = useBranding();
    const [loading, setLoading] = useState(false);
    const [banks, setBanks] = useState([]);
    const [locationData, setLocationData] = useState([]);

    // Administrative Overrides
    const [bypassVerification, setBypassVerification] = useState(false);
    const [isMobileVerified, setIsMobileVerified] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    // Location Dropdowns
    const [jurDistricts, setJurDistricts] = useState([]);
    const [pDistricts, setPDistricts] = useState([]);
    const [pBlocks, setPBlocks] = useState([]);
    const [tDistricts, setTDistricts] = useState([]);
    const [tBlocks, setTBlocks] = useState([]);
    const [oDistricts, setODistricts] = useState([]); // Office
    const [oBlocks, setOBlocks] = useState([]);       // Office

    const [formData, setFormData] = useState({
        fullName: '', fatherName: '', dob: '', gender: '',
        mobile: '', whatsapp: '', isSameAsMobile: false, altMobile: '',
        primaryEmail: '', 
        emergencyContactName: '', emergencyContactNumber: '',
        assignedState: '', assignedDistrict: '', 
        department: 'District Administration', adminPhoto: '',
        // KYC & Docs
        aadharNumber: '', aadharFile: '', panNumber: '', panFile: '', 
        qualification: '', qualificationFile: '',
        experienceYears: '', 
        // Addresses
        pState: '', pDistrict: '', pBlock: '', pPin: '', pFullAddress: '',
        isSameAsPermanent: false,
        tState: '', tDistrict: '', tBlock: '', tPin: '', tFullAddress: '',
        // 🏢 Office Address Node
        officeState: '', officeDistrict: '', officeBlock: '', officePin: '', officeFullAddress: '',
        // Banking
        bankName: '', bankAcc: '', confirmBankAcc: '', bankIfsc: '', bankFile: '',
        consent: false,
        role: 'DistrictAdmin',
        // 🛡️ Power & Permissions Node
        permissions: {
            localDashboard: true,
            shopAudit: true,
            inventoryCheck: false,
            deliveryLogistics: false,
            districtSupport: true,
            payoutVerification: false
        }
    });

    // 1. मास्टर डेटा लोड करना
    const fetchData = useCallback(async () => {
        try {
            const [bRes, lRes] = await Promise.all([
                api.get('/admin/directories/banks'),
                api.get('/admin/directories/locations')
            ]);
            setBanks(bRes.data.data || []);
            setLocationData(lRes.data.data || []);
        } catch (err) { 
            console.error("Critical directory synchronization failed."); 
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const formatToTitleCase = (str) => {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = type === 'checkbox' ? checked : value;
        const titleFields = ['fullName', 'fatherName', 'pFullAddress', 'tFullAddress', 'officeFullAddress', 'emergencyContactName'];
        if (titleFields.includes(name) && typeof finalValue === 'string') {
            finalValue = formatToTitleCase(finalValue);
        }
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handlePermissionChange = (permName) => {
        setFormData(prev => ({
            ...prev,
            permissions: { ...prev.permissions, [permName]: !prev.permissions[permName] }
        }));
    };

    // 2. Cascading Location Logic
    const handleLocChange = (section, level, value) => {
        const stateObj = locationData.find(s => s.state === value);
        const dists = stateObj ? stateObj.districts : [];

        if (level === 'state') {
            if (section === 'perm') { setPDistricts(dists); setPBlocks([]); setFormData(p=>({...p, pState:value, pDistrict:'', pBlock:''})); }
            else if (section === 'pres') { setTDistricts(dists); setTBlocks([]); setFormData(p=>({...p, tState:value, tDistrict:'', tBlock:''})); }
            else if (section === 'offi') { setODistricts(dists); setOBlocks([]); setFormData(p=>({...p, officeState:value, officeDistrict:'', officeBlock:''})); }
            else if (section === 'jur')  { setJurDistricts(dists); setFormData(p=>({...p, assignedState:value, assignedDistrict:''})); }
        } else if (level === 'district') {
            const currentDists = section === 'perm' ? pDistricts : section === 'pres' ? tDistricts : section === 'offi' ? oDistricts : jurDistricts;
            const distObj = currentDists.find(d => d.name === value);
            const blocks = distObj ? distObj.blocks : [];

            if (section === 'perm') { setPBlocks(blocks); setFormData(p=>({...p, pDistrict:value, pBlock:''})); }
            else if (section === 'pres') { setTBlocks(blocks); setFormData(p=>({...p, tDistrict:value, tBlock:''})); }
            else if (section === 'offi') { setOBlocks(blocks); setFormData(p=>({...p, officeDistrict:value, officeBlock:''})); }
            else if (section === 'jur')  { setFormData(p=>({...p, assignedDistrict:value})); }
        }
    };

    // Auto-sync for Present Address and WhatsApp
    useEffect(() => {
        if (formData.isSameAsMobile) setFormData(p => ({ ...p, whatsapp: p.mobile }));
        if (formData.isSameAsPermanent) {
            setTDistricts(pDistricts);
            setTBlocks(pBlocks);
            setFormData(p => ({ 
                ...p, tState: p.pState, tDistrict: p.pDistrict, tBlock: p.pBlock, 
                tPin: p.pPin, tFullAddress: p.pFullAddress 
            }));
        }
    }, [formData.isSameAsMobile, formData.mobile, formData.isSameAsPermanent, formData.pState, formData.pDistrict, formData.pBlock, formData.pPin, formData.pFullAddress, pDistricts, pBlocks]);

    const handleFile = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => setFormData(p => ({ ...p, [field]: reader.result }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!bypassVerification && (!isMobileVerified || !isEmailVerified)) {
            return toast.warning("Verification Error: Complete validation or enable Administrative Bypass.");
        }
        if (formData.bankAcc !== formData.confirmBankAcc) return toast.error("Data Mismatch: Bank account numbers do not match.");

        setLoading(true);
        try {
            const res = await api.post('/admin/hierarchy/add', formData);
            if (res.data.success) {
                toast.success(`District Admin Registered! ID: ${res.data.data?.loginId}`);
                onBack();
            }
        } catch (err) { 
            toast.error(err.response?.data?.message || "Internal Node Error"); 
        } finally {
            setLoading(false);
        }
    };

    const Star = () => <span style={{color:'#ef4444'}}>*</span>;
    const themeColor = settings?.themeColor || '#0f172a';

    return (
        <div style={containerS}>
            <div style={headerS}>
                <button onClick={onBack} style={backBtn}>← Back to Registry</button>
                <div style={{flex: 1}}>
                    <h2 style={{margin:0, color: themeColor, fontWeight:'900'}}>📍 Provision District Administrative Node</h2>
                    <p style={{margin: '4px 0 0', fontSize: '13px', color: '#64748b'}}>District-level command node for local merchant and logistics oversight.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* 00. ADMIN OVERRIDE */}
                <div style={overrideBox}>
                    <div style={{flex:1}}>
                        <h4 style={{margin:0, color:'#c2410c', fontWeight:'900'}}>🛡️ Administrative Trust Protocol (Bypass Verification)</h4>
                        <p style={{margin:'5px 0 0 0', fontSize:'12px', color:'#9a3412', fontWeight:'500'}}>Bypass manual handshake for pre-verified official personnel.</p>
                    </div>
                    <label style={switchLabel}>
                        <input type="checkbox" checked={bypassVerification} onChange={(e)=>setBypassVerification(e.target.checked)} style={{width:'22px', height:'22px', cursor:'pointer'}} />
                        <span style={{fontSize:'14px', fontWeight:'900', color: '#c2410c'}}>Enable Bypass</span>
                    </label>
                </div>

                {/* 01. JURISDICTION */}
                <div style={sectionBox('#e67e22', '#fffcf7')}>
                    <h3 style={secLabel}>📍 01. Local Jurisdiction Assignment</h3>
                    <div style={grid2}>
                        <div style={inputGroup}>
                            <label style={labS}>Controlling State <Star /></label>
                            <select style={inS} value={formData.assignedState} onChange={(e) => handleLocChange('jur', 'state', e.target.value)} required>
                                <option value="">-- Select State --</option>
                                {locationData.map((l, i) => <option key={i} value={l.state}>{l.state}</option>)}
                            </select>
                        </div>
                        <div style={inputGroup}>
                            <label style={labS}>Controlling District <Star /></label>
                            <select style={inS} value={formData.assignedDistrict} onChange={(e) => handleLocChange('jur', 'district', e.target.value)} required>
                                <option value="">-- Select District --</option>
                                {jurDistricts.map((d, i) => <option key={i} value={d.name}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <small style={hintS}>The admin will have localized control over merchants within this district.</small>
                </div>

                {/* 02. IDENTITY */}
                <div style={sectionBox(themeColor)}>
                    <h3 style={secLabel}>👤 02. Personnel Identity & Identity Ledger</h3>
                    <div style={grid2}>
                        <div style={inputGroup}><label style={labS}>Full Legal Name <Star/></label><input name="fullName" value={formData.fullName} required style={inS} onChange={handleChange} placeholder="As per official Aadhaar/Gov ID" /></div>
                        <div style={inputGroup}><label style={labS}>Father's/Guardian Name <Star/></label><input name="fatherName" value={formData.fatherName} required style={inS} onChange={handleChange} placeholder="Legal guardian name" /></div>
                        <div style={inputGroup}><label style={labS}>Date of Birth <Star/></label><input name="dob" type="date" required style={inS} onChange={handleChange} /></div>
                        <div style={inputGroup}><label style={labS}>Gender Identity <Star/></label>
                            <select name="gender" style={inS} value={formData.gender} onChange={handleChange} required>
                                <option value="" disabled>-- Select Gender --</option>
                                <option value="Male">Male</option><option value="Female">Female</option>
                            </select>
                        </div>
                        <div style={fileBox}>
                            <label style={labS}>District Admin Portrait <Star/></label>
                            <input type="file" accept="image/*" onChange={(e)=>handleFile(e, 'adminPhoto')} required style={{fontSize:'12px'}} />
                            {formData.adminPhoto && <img src={formData.adminPhoto} style={previewImg} alt="Preview" />}
                        </div>
                    </div>
                </div>

                {/* 03. CONTACT */}
                <div style={sectionBox('#3498db')}>
                    <h3 style={secLabel}>📱 03. Communication & Security Handshake</h3>
                    <div style={grid2}>
                        <div style={inputGroup}>
                            <label style={labS}>Official Mobile Number <Star/></label>
                            <div style={flexRow}>
                                <input name="mobile" maxLength="10" placeholder="10-digit primary mobile" style={inS} onChange={handleChange} required disabled={isMobileVerified && !bypassVerification} />
                                {!bypassVerification && !isMobileVerified && <button type="button" onClick={()=>setIsMobileVerified(true)} style={vBtn}>Handshake</button>}
                                {(isMobileVerified || bypassVerification) && <span style={checkV}>✓ Trusted</span>}
                            </div>
                        </div>
                        <div style={inputGroup}>
                            <label style={labS}>Official Email Address <Star/></label>
                            <div style={flexRow}>
                                <input name="primaryEmail" type="email" placeholder="admin.district@rkdmart.com" style={inS} onChange={handleChange} required disabled={isEmailVerified && !bypassVerification} />
                                {!bypassVerification && !isEmailVerified && <button type="button" onClick={()=>setIsEmailVerified(true)} style={vBtn}>Validate</button>}
                                {(isEmailVerified || bypassVerification) && <span style={checkV}>✓ Authenticated</span>}
                            </div>
                        </div>
                        <div style={inputGroup}>
                            <label style={labS}>WhatsApp Node Sync</label>
                            <input name="whatsapp" value={formData.whatsapp} maxLength="10" placeholder="WhatsApp number" style={inS} onChange={handleChange} disabled={formData.isSameAsMobile} required />
                            <label style={checkLabel}><input type="checkbox" name="isSameAsMobile" checked={formData.isSameAsMobile} onChange={handleChange} /> Use Mobile Number</label>
                        </div>
                        <div style={inputGroup}><label style={labS}>Emergency Contact Person <Star/></label><input name="emergencyContactName" placeholder="Name of contact" style={inS} onChange={handleChange} required /></div>
                        <div style={inputGroup}><label style={labS}>Emergency Mobile Node <Star/></label><input name="emergencyContactNumber" placeholder="Contact mobile" maxLength="10" style={inS} onChange={handleChange} required /></div>
                    </div>
                </div>

                {/* 04. KYC & DOCUMENTS */}
                <div style={sectionBox('#e74c3c')}>
                    <h3 style={secLabel}>📑 04. Statutory Compliance Records</h3>
                    <div style={grid2}>
                        <div style={inputGroup}><label style={labS}>Aadhaar UID <Star/></label><input name="aadharNumber" maxLength="12" style={inS} onChange={handleChange} required placeholder="12-digit Aadhaar number" /></div>
                        <div style={fileBox}><label style={labS}>Aadhaar Scan Portfolio</label><input type="file" accept="image/*,application/pdf" onChange={(e)=>handleFile(e, 'aadharFile')} required style={{fontSize:'12px'}} /></div>
                        <div style={inputGroup}><label style={labS}>PAN Tax Identity <Star/></label><input name="panNumber" maxLength="10" style={{...inS, textTransform:'uppercase'}} onChange={handleChange} required placeholder="10-character PAN" /></div>
                        <div style={fileBox}><label style={labS}>PAN Evidence Scan</label><input type="file" accept="image/*,application/pdf" onChange={(e)=>handleFile(e, 'panFile')} required style={{fontSize:'12px'}} /></div>
                    </div>
                </div>

                {/* 05. EDUCATION */}
                <div style={sectionBox('#f39c12')}>
                    <h3 style={secLabel}>🎓 05. Academic Qualification Profile</h3>
                    <div style={grid2}>
                        <div style={inputGroup}>
                            <label style={labS}>Highest Qualification <Star/></label>
                            <select name="qualification" style={inS} value={formData.qualification} onChange={handleChange} required>
                                <option value="" disabled>-- Select Highest Degree --</option>
                                <option value="Graduate">University Graduate</option>
                                <option value="Post-Graduate">Post-Graduate (Masters)</option>
                                <option value="Professional Diploma">Professional Diploma</option>
                            </select>
                        </div>
                        <div style={fileBox}><label style={labS}>Degree/Certificate Scan</label><input type="file" accept="image/*,application/pdf" onChange={(e)=>handleFile(e, 'qualificationFile')} required style={{fontSize:'12px'}} /></div>
                    </div>
                </div>

                {/* 06. RESIDENTIAL ADDRESS */}
                <div style={sectionBox('#e67e22')}>
                    <h3 style={secLabel}>🏠 06. Residential Address Ledger</h3>
                    <p style={subHeader}>PERMANENT HOME NODE</p>
                    <div style={grid3}>
                        <select style={inS} value={formData.pState} onChange={(e)=>handleLocChange('perm','state',e.target.value)} required>
                            <option value="" disabled>-- State --</option>
                            {locationData.map((l,i)=><option key={i} value={l.state}>{l.state}</option>)}
                        </select>
                        <select style={inS} value={formData.pDistrict} onChange={(e)=>handleLocChange('perm','district',e.target.value)} required>
                            <option value="" disabled>-- District --</option>
                            {pDistricts.map((d,i)=><option key={i} value={d.name}>{d.name}</option>)}
                        </select>
                        <select style={inS} value={formData.pBlock} onChange={handleChange} name="pBlock" required>
                            <option value="" disabled>-- Block --</option>
                            {pBlocks.map((b,i)=><option key={i} value={b}>{b}</option>)}
                        </select>
                        <input name="pPin" placeholder="6-digit PIN" maxLength="6" style={inS} onChange={handleChange} required />
                        <input name="pFullAddress" placeholder="Full house address with street/area" style={{...inS, gridColumn: window.innerWidth < 768 ? 'span 1' : 'span 2'}} value={formData.pFullAddress} onChange={handleChange} required />
                    </div>

                    <div style={syncBox}>
                        <label style={checkLabel}><input type="checkbox" name="isSameAsPermanent" checked={formData.isSameAsPermanent} onChange={handleChange} /> <b>CORRESPONDENCE ADDRESS</b> is same as above</label>
                    </div>

                    {!formData.isSameAsPermanent && (
                        <div style={grid3}>
                            <select style={inS} value={formData.tState} onChange={(e)=>handleLocChange('pres','state',e.target.value)} required>
                                <option value="" disabled>-- State --</option>
                                {locationData.map((l,i)=><option key={i} value={l.state}>{l.state}</option>)}
                            </select>
                            <select style={inS} value={formData.tDistrict} onChange={(e)=>handleLocChange('pres','district',e.target.value)} required>
                                <option value="" disabled>-- District --</option>
                                {tDistricts.map((d,i)=><option key={i} value={d.name}>{d.name}</option>)}
                            </select>
                            <select style={inS} value={formData.tBlock} onChange={handleChange} name="tBlock" required>
                                <option value="" disabled>-- Block --</option>
                                {tBlocks.map((b,i)=><option key={i} value={b}>{b}</option>)}
                            </select>
                            <input name="tPin" placeholder="6-digit PIN" maxLength="6" style={inS} value={formData.tPin} onChange={handleChange} required />
                            <input name="tFullAddress" placeholder="Full current address..." style={{...inS, gridColumn: window.innerWidth < 768 ? 'span 1' : 'span 2'}} value={formData.tFullAddress} onChange={handleChange} required />
                        </div>
                    )}
                </div>

                {/* 07. OFFICE ADDRESS */}
                <div style={sectionBox('#16a085', '#f0fff9')}>
                    <h3 style={secLabel}>🏢 07. Official District HQ Address Node</h3>
                    <div style={grid3}>
                        <select style={inS} value={formData.officeState} onChange={(e)=>handleLocChange('offi','state',e.target.value)} required>
                            <option value="" disabled>-- Office State --</option>
                            {locationData.map((l,i)=><option key={i} value={l.state}>{l.state}</option>)}
                        </select>
                        <select style={inS} value={formData.officeDistrict} onChange={(e)=>handleLocChange('offi','district',e.target.value)} required>
                            <option value="" disabled>-- Office District --</option>
                            {oDistricts.map((d,i)=><option key={i} value={d.name}>{d.name}</option>)}
                        </select>
                        <select style={inS} value={formData.officeBlock} onChange={handleChange} name="officeBlock" required>
                            <option value="" disabled>-- Office Block --</option>
                            {oBlocks.map((b,i)=><option key={i} value={b}>{b}</option>)}
                        </select>
                        <input name="officePin" placeholder="Office PIN" maxLength="6" style={inS} onChange={handleChange} required />
                        <input name="officeFullAddress" placeholder="HQ Full Address with Floor/Cabin No." style={{...inS, gridColumn: window.innerWidth < 768 ? 'span 1' : 'span 2'}} value={formData.officeFullAddress} onChange={handleChange} required />
                    </div>
                </div>

                {/* 08. BANKING */}
                <div style={sectionBox('#27ae60')}>
                    <h3 style={secLabel}>💳 08. Financial Settlement Node</h3>
                    <div style={grid2}>
                        <div style={inputGroup}><label style={labS}>Primary Bank Node <Star/></label>
                            <select name="bankName" style={inS} value={formData.bankName} onChange={handleChange} required>
                                <option value="" disabled>-- Select Institutional Bank --</option>
                                {banks.map((b,i)=><option key={i} value={b.name}>{b.name}</option>)}
                            </select>
                        </div>
                        <div style={inputGroup}><label style={labS}>Account Identifier <Star/></label><input name="bankAcc" type="password" style={inS} onChange={handleChange} required placeholder="Enter bank account number" /></div>
                        <div style={inputGroup}><label style={labS}>Confirm Account <Star/></label><input name="confirmBankAcc" style={inS} onChange={handleChange} required placeholder="Repeat for verification" /></div>
                        <div style={inputGroup}><label style={labS}>IFSC Protocol Code <Star/></label><input name="bankIfsc" style={{...inS, textTransform:'uppercase'}} onChange={handleChange} required placeholder="11-digit IFSC code" /></div>
                        <div style={{...fileBox, gridColumn: window.innerWidth < 768 ? 'span 1' : 'span 2'}}><label style={labS}>Upload Passbook / Bank Proof Copy <Star/></label><input type="file" accept="image/*,application/pdf" onChange={(e)=>handleFile(e, 'bankFile')} required style={{fontSize:'12px'}} /></div>
                    </div>
                </div>

                {/* 09. ACCESS CONTROLS & PERMISSIONS */}
                <div style={sectionBox('#8e44ad', '#fbf4ff')}>
                    <h3 style={secLabel}>🔑 09. Functional Privileges (Grant Powers)</h3>
                    <p style={{color:'#7f8c8d', fontSize:'13px', marginTop:'-15px', marginBottom:'25px', fontWeight:'600'}}>Authorize administrative module access for this District Admin node:</p>
                    
                    <div style={permGridS}>
                        <PermissionSwitch 
                            icon="📊"
                            label="Local Dashboard" 
                            desc="Monitor district-level analytics and growth reports."
                            checked={formData.permissions.localDashboard} 
                            onChange={() => handlePermissionChange('localDashboard')}
                            themeColor={themeColor}
                        />
                        <PermissionSwitch 
                            icon="🏪"
                            label="Merchant Hub Audit" 
                            desc="Authorize new shop registrations within the district."
                            checked={formData.permissions.shopAudit} 
                            onChange={() => handlePermissionChange('shopAudit')}
                            themeColor={themeColor}
                        />
                        <PermissionSwitch 
                            icon="📦"
                            label="Stock Protocol" 
                            desc="Audit merchant inventory and enforce regional price caps."
                            checked={formData.permissions.inventoryCheck} 
                            onChange={() => handlePermissionChange('inventoryCheck')}
                            themeColor={themeColor}
                        />
                        <PermissionSwitch 
                            icon="🚚"
                            label="Logistics Monitor" 
                            desc="Track real-time order deliveries and hub performance."
                            checked={formData.permissions.deliveryLogistics} 
                            onChange={() => handlePermissionChange('deliveryLogistics')}
                            themeColor={themeColor}
                        />
                        <PermissionSwitch 
                            icon="🎧"
                            label="Helpdesk Node" 
                            desc="Manage district-level customer grievances and tickets."
                            checked={formData.permissions.districtSupport} 
                            onChange={() => handlePermissionChange('districtSupport')}
                            themeColor={themeColor}
                        />
                        <PermissionSwitch 
                            icon="💳"
                            label="Payout Audit" 
                            desc="Verify and reconcile merchant payout requests."
                            checked={formData.permissions.payoutVerification} 
                            onChange={() => handlePermissionChange('payoutVerification')}
                            themeColor={themeColor}
                        />
                    </div>
                </div>

                <div style={consentBox}>
                    <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} required style={{width:'24px', height:'24px', cursor:'pointer'}} />
                    <span style={{fontSize:'14px', color:'#475569', fontWeight:'bold'}}>
                        I hereby declare that all information provided for this district-level administrative node is true and verified.
                    </span>
                </div>

                <button type="submit" style={loading ? disBtn : submitBtn(themeColor)} disabled={loading}>
                    {loading ? "ESTABLISHING NODE..." : "AUTHORIZE & REGISTER DISTRICT ADMIN"}
                </button>
            </form>
        </div>
    );
};

// --- Power Switch Helper Component ---
const PermissionSwitch = ({ icon, label, desc, checked, onChange, themeColor }) => (
    <div style={switchContainerS} onClick={onChange}>
        <div style={switchIconBox(themeColor)}>{icon}</div>
        <div style={{flex: 1}}>
            <h4 style={{margin: '0 0 4px 0', fontSize: '14px', color: '#1e293b', fontWeight: '800'}}>{label}</h4>
            <p style={{margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '500', lineHeight: '1.4'}}>{desc}</p>
        </div>
        <div style={{
                width: '44px', height: '22px', background: checked ? themeColor : '#e2e8f0',
                borderRadius: '20px', position: 'relative', transition: '0.3s'
            }}>
            <div style={{
                width: '16px', height: '16px', background: '#fff', borderRadius: '50%',
                position: 'absolute', top: '3px', left: checked ? '25px' : '3px', transition: '0.3s'
            }}></div>
        </div>
    </div>
);

// --- Strategic SaaS Aesthetics ---
const containerS = { padding: window.innerWidth < 768 ? '10px' : '20px', minHeight:'100vh', animation:'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerS = { display:'flex', alignItems:'center', gap:'25px', marginBottom:'45px', borderBottom:'1px solid #f1f5f9', paddingBottom:'30px', flexWrap: 'wrap' };
const backBtn = { background:'#fff', color:'#1e293b', border:'1.5px solid #e2e8f0', padding:'12px 24px', borderRadius:'12px', cursor:'pointer', fontWeight:'900', fontSize:'12px', transition:'0.3s' };
const overrideBox = { display:'flex', alignItems:'center', background:'#fff7ed', padding: '25px', borderRadius:'20px', border:'1px solid #ffedd5', marginBottom:'40px', flexWrap: 'wrap', gap: '15px' };
const switchLabel = { display:'flex', alignItems:'center', gap:'15px', cursor:'pointer' };
const sectionBox = (color, bg = '#fff') => ({ marginBottom:'40px', padding: window.innerWidth < 768 ? '25px' : '40px', background: bg, borderTop:`8px solid ${color}`, borderRadius:'30px', boxShadow:'0 10px 30px rgba(0,0,0,0.02)', borderLeft:'1px solid #f1f5f9', borderRight:'1px solid #f1f5f9', borderBottom:'1px solid #f1f5f9' });
const secLabel = { fontSize:'20px', fontWeight:'900', color:'#0f172a', marginBottom:'30px', letterSpacing:'-0.5px' };
const grid2 = { display:'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap:'30px' };
const grid3 = { display:'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)', gap:'20px' };
const inputGroup = { display:'flex', flexDirection:'column', gap:'10px' };
const labS = { fontSize:'11px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px' };
const inS = { padding:'16px', borderRadius:'16px', border:'1.5px solid #e2e8f0', background:'#f8fafc', outline:'none', fontSize:'14px', width:'100%', boxSizing:'border-box', transition:'0.3s', fontWeight:'700', color: '#1e293b' };
const flexRow = { display:'flex', gap:'10px', alignItems:'center' };
const vBtn = { background:'#0f172a', color:'#fff', border:'none', padding:'12px 20px', borderRadius:'12px', cursor:'pointer', fontWeight:'bold', fontSize:'11px' };
const checkV = { color:'#10b981', fontWeight:'900', fontSize:'12px' };
const fileBox = { background:'#fcfdfe', border:'2px dashed #e2e8f0', padding:'25px', borderRadius:'22px', textAlign:'center' };
const previewImg = { height:'90px', width:'90px', objectFit:'cover', borderRadius:'20px', margin:'15px auto 0', border:'4px solid #fff', boxShadow:'0 10px 20px rgba(0,0,0,0.1)' };
const checkLabel = { display:'flex', alignItems:'center', gap:'12px', fontSize:'13px', fontWeight:'bold', color:'#64748b', cursor:'pointer', marginTop:'10px' };
const syncBox = { margin:'25px 0', padding:'15px', background:'#f8fafc', borderRadius:'15px', border:'1px solid #f1f5f9' };
const subHeader = { fontSize:'11px', fontWeight:'900', color:'#e67e22', letterSpacing:'1px', marginBottom:'15px', textTransform:'uppercase' };
const consentBox = { display:'flex', alignItems:'center', gap:'20px', padding:'30px', background:'#f0f7ff', borderRadius:'25px', border:'1px solid #c3dafb', marginBottom:'30px' };
const submitBtn = (color) => ({ width:'100%', padding:'22px', background: color, color:'#fff', border:'none', borderRadius:'20px', fontSize:'16px', fontWeight:'900', cursor:'pointer', boxShadow:`0 15px 35px \${color}40`, transition:'0.3s', letterSpacing:'1px' });
const disBtn = { ...submitBtn('#cbd5e1'), background:'#cbd5e1', cursor:'not-allowed', boxShadow:'none' };

const permGridS = { display:'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1fr', gap:'20px' };
const switchContainerS = { display:'flex', alignItems:'center', gap:'15px', padding:'20px', background:'#fff', borderRadius:'20px', border:'1px solid #f1f5f9', cursor:'pointer', transition:'0.2s', ':hover': { borderColor:'#cbd5e1' } };
const switchIconBox = (color) => ({ width:'45px', height:'45px', background:`${color}08`, borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' });
const hintS = { fontSize: '10px', color: '#cbd5e1', marginTop: '5px', fontWeight: '700', textTransform: 'uppercase' };

export default DistrictAdminRegister;