// src/pages/SystemAdmin/SubAdminRegister.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../../services/api'; 
import { useBranding } from '../../../../context/BrandingContext';
import { toast } from 'react-toastify';

const SubAdminRegister = ({ onBack }) => {
    const { settings } = useBranding();
    const [loading, setLoading] = useState(false);
    const [banks, setBanks] = useState([]);
    const [locationData, setLocationData] = useState([]);

    // Administrative Overrides
    const [bypassVerification, setBypassVerification] = useState(false);
    const [isMobileVerified, setIsMobileVerified] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    // Location Dropdowns
    const [pDistricts, setPDistricts] = useState([]);
    const [pBlocks, setPBlocks] = useState([]);
    const [tDistricts, setTDistricts] = useState([]);
    const [tBlocks, setTBlocks] = useState([]);
    const [oDistricts, setODistricts] = useState([]); // Office Districts
    const [oBlocks, setOBlocks] = useState([]);       // Office Blocks

    const [formData, setFormData] = useState({
        fullName: '', fatherName: '', dob: '', gender: '',
        mobile: '', whatsapp: '', isSameAsMobile: false, altMobile: '',
        primaryEmail: '', 
        emergencyContactName: '', emergencyContactNumber: '',
        department: '', adminPhoto: '',
        // KYC & Education
        aadharNumber: '', aadharFile: '', 
        panNumber: '', panFile: '', 
        qualification: '', qualificationFile: '',
        experienceYears: '', previousOrg: '',
        // Permanent Address
        pState: '', pDistrict: '', pBlock: '', pPin: '', pFullAddress: '',
        // Present Address
        isSameAsPermanent: false,
        tState: '', tDistrict: '', tBlock: '', tPin: '', tFullAddress: '',
        // 🏢 NEW: Office Address
        officeState: '', officeDistrict: '', officeBlock: '', officePin: '', officeFullAddress: '',
        // Banking
        bankName: '', bankAcc: '', confirmBankAcc: '', bankIfsc: '', bankFile: '',
        consent: false,
        role: 'SubSystemAdmin',
        // 🛡️ Permissions Node
        permissions: {
            coreOperations: true,
            hierarchyControl: false,
            globalInventory: false,
            governance: false,
            configuration: false,
            infrastructure: false
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
            console.error("Critical synchronization failure."); 
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
        
        const titleFields = ['fullName', 'fatherName', 'pFullAddress', 'tFullAddress', 'officeFullAddress', 'emergencyContactName', 'previousOrg'];
        if (titleFields.includes(name) && typeof finalValue === 'string') {
            finalValue = formatToTitleCase(finalValue);
        }
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handlePermissionChange = (permName) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [permName]: !prev.permissions[permName]
            }
        }));
    };

    // 2. Cascading Location Logic (Permanent, Temporary, and Office)
    const handleLocChange = (section, level, value) => {
        const stateObj = locationData.find(s => s.state === value);
        const dists = stateObj ? stateObj.districts : [];

        if (level === 'state') {
            if (section === 'perm') { 
                setPDistricts(dists); setPBlocks([]); 
                setFormData(p=>({...p, pState:value, pDistrict:'', pBlock:''})); 
            } else if (section === 'temp') { 
                setTDistricts(dists); setTBlocks([]); 
                setFormData(p=>({...p, tState:value, tDistrict:'', tBlock:''})); 
            } else if (section === 'offi') {
                setODistricts(dists); setOBlocks([]);
                setFormData(p=>({...p, officeState:value, officeDistrict:'', officeBlock:''}));
            }
        } else if (level === 'district') {
            const currentDists = section === 'perm' ? pDistricts : section === 'temp' ? tDistricts : oDistricts;
            const distObj = currentDists.find(d => d.name === value);
            const blocks = distObj ? distObj.blocks : [];

            if (section === 'perm') { 
                setPBlocks(blocks); 
                setFormData(p=>({...p, pDistrict:value, pBlock:''})); 
            } else if (section === 'temp') { 
                setTBlocks(blocks); 
                setFormData(p=>({...p, tDistrict:value, tBlock:''})); 
            } else if (section === 'offi') {
                setOBlocks(blocks);
                setFormData(p=>({...p, officeDistrict:value, officeBlock:''}));
            }
        }
    };

    // Auto-Sync logic for Mobile and Addresses
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
        // 1MB = 1024 * 1024 bytes
        const maxSize = 1 * 1024 * 1024; 

        if (file.size > maxSize) {
            toast.error("Security Alert: File size must be under 1MB.");
            e.target.value = ""; // इनपुट खाली करें
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => setFormData(p => ({ ...p, [field]: reader.result }));
    }
};

    // 3. फॉर्म सबमिशन
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!bypassVerification && (!isMobileVerified || !isEmailVerified)) {
            return toast.warning("Identity Missing: Complete verification or use Admin Bypass.");
        }
        if (formData.bankAcc !== formData.confirmBankAcc) return toast.error("Data Error: Bank Account numbers Mismatch.");
        if (!formData.consent) return toast.warning("Compliance: You must certify the data integrity.");

        setLoading(true);
        try {
            const res = await api.post('/admin/hierarchy/add', formData);
            if (res.data.success) {
                toast.success(`Deployment Success! Node ID: ${res.data.data?.loginId}`);
                onBack();
            }
        } catch (err) { 
            toast.error(err.response?.data?.message || "Sync failure with global registry."); 
        } finally {
            setLoading(false);
        }
    };

    const Star = () => <span style={{color:'#ef4444'}}>*</span>;
    const themeColor = settings?.themeColor || '#0f172a';

    return (
        <div style={containerS}>
            <div style={headerS}>
                <button onClick={onBack} style={backBtn}>← EXIT HUB</button>
                <div style={{flex: 1}}>
                    <h2 style={{margin:0, color: themeColor, fontWeight:'900'}}>🛡️ Provision Sub-Admin Infrastructure Node</h2>
                    <p style={{margin: '4px 0 0', fontSize: '13px', color: '#64748b'}}>Passwords and unique SUAD IDs are cryptographically generated on deployment.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                
                {/* 00. ADMIN OVERRIDE */}
                <div style={overrideBox}>
                    <div style={{flex:1}}>
                        <h4 style={{margin:0, color:'#1e293b', fontWeight:'900'}}>🛡️ Administrative Trust Protocol (Bypass Verification)</h4>
                        <p style={{margin:'5px 0 0 0', fontSize:'12px', color:'#475569', fontWeight:'500'}}>Bypass manual identity handshake for authorized personnel nodes.</p>
                    </div>
                    <label style={switchLabel}>
                        <input type="checkbox" checked={bypassVerification} onChange={(e)=>setBypassVerification(e.target.checked)} style={{width:'22px', height:'22px', cursor:'pointer'}} />
                        <span style={{fontSize:'14px', fontWeight:'900', color: themeColor}}>Master Bypass</span>
                    </label>
                </div>

                {/* 01. PERSONAL IDENTITY */}
                <div style={sectionBox(themeColor)}>
                    <h3 style={secLabel}>👤 01. Personnel Identity Records</h3>
                    <div style={grid2}>
                        <div style={inputGroup}>
                            <label style={labS}>Legal Full Name <Star/></label>
                            <input name="fullName" value={formData.fullName} required style={inS} onChange={handleChange} placeholder="As printed on government identity documents" />
                        </div>
                        <div style={inputGroup}>
                            <label style={labS}>Father's/Guardian Name <Star/></label>
                            <input name="fatherName" value={formData.fatherName} required style={inS} onChange={handleChange} placeholder="Father or legal guardian's name" />
                        </div>
                        <div style={inputGroup}>
                            <label style={labS}>Date of Birth <Star/></label>
                            <input name="dob" type="date" required style={inS} onChange={handleChange} />
                        </div>
                        <div style={inputGroup}>
                            <label style={labS}>Gender Identity <Star/></label>
                            <select name="gender" value={formData.gender} style={inS} onChange={handleChange} required>
                                <option value="" disabled>-- Select Gender --</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Transgender">Transgender</option>
                            </select>
                        </div>
                        <div style={inputGroup}>
                            <label style={labS}>Mobile Node ID <Star/></label>
                            <div style={flexRow}>
                                <input name="mobile" maxLength="10" placeholder="Primary 10-digit mobile" style={inS} onChange={handleChange} required disabled={isMobileVerified && !bypassVerification} />
                                {!bypassVerification && !isMobileVerified && <button type="button" onClick={()=>setIsMobileVerified(true)} style={vBtn}>Handshake</button>}
                                {(isMobileVerified || bypassVerification) && <span style={checkV}>✓ Trusted</span>}
                            </div>
                        </div>
                        <div style={inputGroup}>
                            <label style={labS}>WhatsApp Node ID <Star/></label>
                            <input name="whatsapp" value={formData.whatsapp} placeholder="Enter WhatsApp number" maxLength="10" style={inS} onChange={handleChange} disabled={formData.isSameAsMobile} required />
                            <label style={checkLabel}><input type="checkbox" name="isSameAsMobile" checked={formData.isSameAsMobile} onChange={handleChange} /> Link to Mobile</label>
                        </div>
                        <div style={inputGroup}>
                            <label style={labS}>Official Infrastructure Email <Star/></label>
                            <div style={flexRow}>
                                <input name="primaryEmail" type="email" placeholder="official@rkdmart.com" style={inS} onChange={handleChange} required disabled={isEmailVerified && !bypassVerification} />
                                {!bypassVerification && !isEmailVerified && <button type="button" onClick={()=>setIsEmailVerified(true)} style={vBtn}>Validate</button>}
                                {(isEmailVerified || bypassVerification) && <span style={checkV}>✓ Authenticated</span>}
                            </div>
                        </div>
                        <div style={fileBox}>
                            <label style={labS}>Identity Portrait <Star/></label>
                            <input type="file" accept="image/*" onChange={(e)=>handleFile(e, 'adminPhoto')} required style={{fontSize:'12px'}} />
                            {formData.adminPhoto && <img src={formData.adminPhoto} style={previewImg} alt="Preview" />}
                        </div>
                    </div>
                </div>

                {/* 02. KYC & QUALIFICATION */}
                <div style={{...sectionBox('#16a085'), borderTopColor:'#16a085'}}>
                    <h3 style={secLabel}>📑 02. Statutory KYC & Professional Background</h3>
                    <div style={grid2}>
                        <div style={inputGroup}>
                            <label style={labS}>Aadhaar UID <Star/></label>
                            <input name="aadharNumber" maxLength="12" style={inS} onChange={handleChange} required placeholder="12-digit unique Aadhaar number" />
                        </div>
                        <div style={fileBox}><label style={labS}>Aadhaar Scan Portfolio</label><input type="file" accept="image/*,application/pdf" onChange={(e)=>handleFile(e, 'aadharFile')} required style={{fontSize:'12px'}} /></div>
                        <div style={inputGroup}>
                            <label style={labS}>PAN Tax Identity</label>
                            <input name="panNumber" maxLength="10" style={{...inS, textTransform:'uppercase'}} onChange={handleChange} placeholder="10-digit PAN alphanumeric code" />
                        </div>
                        <div style={fileBox}><label style={labS}>PAN Evidence Scan</label><input type="file" accept="image/*,application/pdf" onChange={(e)=>handleFile(e, 'panFile')} style={{fontSize:'12px'}} /></div>
                        <div style={inputGroup}>
                            <label style={labS}>Highest Academic Level <Star/></label>
                            <select name="qualification" style={inS} value={formData.qualification} onChange={handleChange} required>
                                <option value="" disabled>-- Select Highest Degree --</option>
                                <option value="High School">High School</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Graduate">University Graduate</option>
                                <option value="Post-Graduate">Post-Graduate (Masters)</option>
                                <option value="Doctorate">Doctorate (PhD)</option>
                            </select>
                        </div>
                        <div style={fileBox}><label style={labS}>Degree/Certificate Evidence</label><input type="file" accept="image/*,application/pdf" onChange={(e)=>handleFile(e, 'qualificationFile')} required style={{fontSize:'12px'}} /></div>
                    </div>
                </div>

                {/* 03. PERMANENT ADDRESS */}
                <div style={{...sectionBox('#e67e22'), borderTopColor:'#e67e22'}}>
                    <h3 style={secLabel}>🏠 03. Permanent Residential Node</h3>
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
                        <input name="pPin" placeholder="6-digit Pincode" maxLength="6" style={inS} onChange={handleChange} required />
                        <input name="pFullAddress" placeholder="Full house address with street and landmark" style={{...inS, gridColumn: window.innerWidth < 768 ? 'span 1' : 'span 2'}} value={formData.pFullAddress} onChange={handleChange} required />
                    </div>

                    <div style={syncBox}>
                        <label style={checkLabel}><input type="checkbox" name="isSameAsPermanent" checked={formData.isSameAsPermanent} onChange={handleChange} /> <b>CORRESPONDENCE ADDRESS</b> is same as Permanent</label>
                    </div>

                    {/* 04. TEMPORARY ADDRESS */}
                    {!formData.isSameAsPermanent && (
                        <div style={grid3}>
                            <select style={inS} value={formData.tState} onChange={(e)=>handleLocChange('temp','state',e.target.value)} required>
                                <option value="" disabled>-- State --</option>
                                {locationData.map((l,i)=><option key={i} value={l.state}>{l.state}</option>)}
                            </select>
                            <select style={inS} value={formData.tDistrict} onChange={(e)=>handleLocChange('temp','district',e.target.value)} required>
                                <option value="" disabled>-- District --</option>
                                {tDistricts.map((d,i)=><option key={i} value={d.name}>{d.name}</option>)}
                            </select>
                            <select style={inS} value={formData.tBlock} onChange={handleChange} name="tBlock" required>
                                <option value="" disabled>-- Block --</option>
                                {tBlocks.map((b,i)=><option key={i} value={b}>{b}</option>)}
                            </select>
                            <input name="tPin" placeholder="6-digit Pincode" maxLength="6" style={inS} value={formData.tPin} onChange={handleChange} required />
                            <input name="tFullAddress" placeholder="Full temporary residential address" style={{...inS, gridColumn: window.innerWidth < 768 ? 'span 1' : 'span 2'}} value={formData.tFullAddress} onChange={handleChange} required />
                        </div>
                    )}
                </div>

                {/* 05. NEW: OFFICE ADDRESS */}
                <div style={{...sectionBox('#3498db'), borderTopColor:'#3498db', background:'#f0f7ff'}}>
                    <h3 style={secLabel}>🏢 04. Official Workplace (Office) Node</h3>
                    <div style={grid3}>
                        <select style={inS} value={formData.officeState} onChange={(e)=>handleLocChange('offi','state',e.target.value)} required>
                            <option value="" disabled>-- State --</option>
                            {locationData.map((l,i)=><option key={i} value={l.state}>{l.state}</option>)}
                        </select>
                        <select style={inS} value={formData.officeDistrict} onChange={(e)=>handleLocChange('offi','district',e.target.value)} required>
                            <option value="" disabled>-- District --</option>
                            {oDistricts.map((d,i)=><option key={i} value={d.name}>{d.name}</option>)}
                        </select>
                        <select style={inS} value={formData.officeBlock} onChange={handleChange} name="officeBlock" required>
                            <option value="" disabled>-- Block --</option>
                            {oBlocks.map((b,i)=><option key={i} value={b}>{b}</option>)}
                        </select>
                        <input name="officePin" placeholder="Office Pincode" maxLength="6" style={inS} onChange={handleChange} required />
                        <input name="officeFullAddress" placeholder="Full office address with floor and room details" style={{...inS, gridColumn: window.innerWidth < 768 ? 'span 1' : 'span 2'}} value={formData.officeFullAddress} onChange={handleChange} required />
                    </div>
                </div>

                {/* 06. BANKING */}
                <div style={{...sectionBox('#27ae60'), borderTopColor:'#27ae60'}}>
                    <h3 style={secLabel}>💳 05. Financial Settlement Node</h3>
                    <div style={grid2}>
                        <div style={inputGroup}><label style={labS}>Primary Banking Partner <Star/></label>
                            <select name="bankName" style={inS} value={formData.bankName} onChange={handleChange} required>
                                <option value="" disabled>-- Select Financial Institution --</option>
                                {banks.map((b,i)=><option key={i} value={b.name}>{b.name}</option>)}
                            </select>
                        </div>
                        <div style={inputGroup}>
                            <label style={labS}>Account Number <Star/></label>
                            <input name="bankAcc" type="password" style={inS} onChange={handleChange} required placeholder="Full bank account number" />
                        </div>
                        <div style={inputGroup}>
                            <label style={labS}>Confirm Account <Star/></label>
                            <input name="confirmBankAcc" style={inS} onChange={handleChange} required placeholder="Repeat account number for verification" />
                        </div>
                        <div style={inputGroup}>
                            <label style={labS}>IFSC Protocol Code <Star/></label>
                            <input name="bankIfsc" style={{...inS, textTransform:'uppercase'}} onChange={handleChange} required placeholder="11-digit IFSC code (e.g. SBIN0001234)" />
                        </div>
                        <div style={{...fileBox, gridColumn: window.innerWidth < 768 ? 'span 1' : 'span 2'}}><label style={labS}>Passbook/Cheque Copy <Star/></label><input type="file" accept="image/*,application/pdf" onChange={(e)=>handleFile(e, 'bankFile')} required style={{fontSize:'12px'}} /></div>
                    </div>
                </div>

                {/* 07. ASSIGNMENT */}
                <div style={{...sectionBox('#1e293b'), borderTopColor:'#1e293b'}}>
                    <h3 style={secLabel}>🏛️ 06. Operational Deployment & Support</h3>
                    <div style={grid2}>
                        <div style={inputGroup}><label style={labS}>Authorized Department <Star/></label>
                            <select name="department" style={inS} value={formData.department} onChange={handleChange} required>
                                <option value="" disabled>-- Select Department --</option>
                                <option value="Operations">Operations Control</option>
                                <option value="KYC Audit">KYC & Compliance</option>
                                <option value="Finance">Finance & Settlement</option>
                                <option value="Technical">IT Support Node</option>
                                <option value="Marketing">Branding & SEO</option>
                            </select>
                        </div>
                        <div style={inputGroup}>
                            <label style={labS}>Emergency Point of Contact <Star/></label>
                            <input name="emergencyContactName" style={inS} onChange={handleChange} required placeholder="Legal name of emergency contact" />
                        </div>
                        <div style={inputGroup}>
                            <label style={labS}>Emergency Mobile Node <Star/></label>
                            <input name="emergencyContactNumber" maxLength="10" style={inS} onChange={handleChange} required placeholder="Primary mobile of emergency contact" />
                        </div>
                    </div>
                </div>

                {/* 08. ACCESS CONTROLS & PERMISSIONS */}
                <div style={{...sectionBox('#8e44ad'), borderTopColor:'#8e44ad'}}>
                    <h3 style={secLabel}>🔑 07. Functional Privileges (Grant Powers)</h3>
                    <p style={{color:'#7f8c8d', fontSize:'13px', marginTop:'-15px', marginBottom:'25px', fontWeight:'600'}}>Select module authority levels for this Sub-Admin node:</p>
                    
                    <div style={permGridS}>
                        <PermissionSwitch 
                            icon="📊"
                            label="Core Operations" 
                            desc="Monitor dashboard, manage registration queue and order flow."
                            checked={formData.permissions.coreOperations} 
                            onChange={() => handlePermissionChange('coreOperations')}
                            themeColor={themeColor}
                        />
                        <PermissionSwitch 
                            icon="🛡️"
                            label="Hierarchy Control" 
                            desc="Manage state/district hubs and subordinate personnel."
                            checked={formData.permissions.hierarchyControl} 
                            onChange={() => handlePermissionChange('hierarchyControl')}
                            themeColor={themeColor}
                        />
                        <PermissionSwitch 
                            icon="🛒"
                            label="Inventory Hub" 
                            desc="Manage master catalog, price controls and stock alerts."
                            checked={formData.permissions.globalInventory} 
                            onChange={() => handlePermissionChange('globalInventory')}
                            themeColor={themeColor}
                        />
                        <PermissionSwitch 
                            icon="⚖️"
                            label="Governance" 
                            desc="Administer branding, SEO settings, and legal policies."
                            checked={formData.permissions.governance} 
                            onChange={() => handlePermissionChange('governance')}
                            themeColor={themeColor}
                        />
                        <PermissionSwitch 
                            icon="⚙️"
                            label="Configuration" 
                            desc="Configure taxation, directories and infrastructure API keys."
                            checked={formData.permissions.configuration} 
                            onChange={() => handlePermissionChange('configuration')}
                            themeColor={themeColor}
                        />
                        <PermissionSwitch 
                            icon="🖥️"
                            label="Infrastructure" 
                            desc="Audit trails, broadcasts, complaints and system health."
                            checked={formData.permissions.infrastructure} 
                            onChange={() => handlePermissionChange('infrastructure')}
                            themeColor={themeColor}
                        />
                    </div>
                </div>

                <div style={consentBox}>
                    <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} required style={{width:'24px', height:'24px', cursor:'pointer'}} />
                    <span style={{fontSize:'14px', color:'#475569', fontWeight:'bold'}}>I certify that all personnel metadata and documentation provided are authentic and comply with platform security protocols.</span>
                </div>

                <button type="submit" style={loading ? disBtn : submitBtn(themeColor)} disabled={loading}>
                    {loading ? "📡 ESTABLISHING NODE..." : "🚀 AUTHORIZE & DEPLOY ADMINISTRATIVE NODE"}
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

// --- Strategic Style Architecture ---
const containerS = { padding: window.innerWidth < 768 ? '10px' : '20px', minHeight:'100vh', animation:'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerS = { display:'flex', alignItems:'center', gap:'25px', marginBottom:'45px', borderBottom:'1px solid #f1f5f9', paddingBottom:'30px', flexWrap: 'wrap' };
const backBtn = { background:'#fff', color:'#1e293b', border:'1.5px solid #e2e8f0', padding:'12px 24px', borderRadius:'12px', cursor:'pointer', fontWeight:'900', fontSize:'12px', transition:'0.3s' };
const overrideBox = { display:'flex', alignItems:'center', background:'#f8fafc', padding: '25px', borderRadius:'20px', border:'1px solid #e2e8f0', marginBottom:'40px', flexWrap: 'wrap', gap: '15px' };
const switchLabel = { display:'flex', alignItems:'center', gap:'15px', cursor:'pointer' };
const sectionBox = (color) => ({ marginBottom:'40px', padding: window.innerWidth < 768 ? '25px' : '40px', background:'#fff', borderTop:`8px solid ${color}`, borderRadius:'30px', boxShadow:'0 10px 30px rgba(0,0,0,0.02)', borderLeft:'1px solid #f1f5f9', borderRight:'1px solid #f1f5f9', borderBottom:'1px solid #f1f5f9' });
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
const subHead = { fontSize:'11px', fontWeight:'900', color:'#3498db', letterSpacing:'1px', marginBottom:'15px', textTransform:'uppercase' };
const consentBox = { display:'flex', alignItems:'center', gap:'20px', padding:'30px', background:'#f0f7ff', borderRadius:'25px', border:'1px solid #c3dafb', marginBottom:'30px' };
const submitBtn = (color) => ({ width:'100%', padding:'22px', background: color, color:'#fff', border:'none', borderRadius:'20px', fontSize:'16px', fontWeight:'900', cursor:'pointer', boxShadow:`0 15px 35px \${color}40`, transition:'0.3s', letterSpacing:'1px' });
const disBtn = { ...submitBtn('#cbd5e1'), background:'#cbd5e1', cursor:'not-allowed', boxShadow:'none' };

const permGridS = { display:'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1fr', gap:'20px' };
const switchContainerS = { display:'flex', alignItems:'center', gap:'15px', padding:'20px', background:'#fff', borderRadius:'20px', border:'1px solid #f1f5f9', cursor:'pointer', transition:'0.2s', ':hover': { borderColor:'#cbd5e1' } };
const switchIconBox = (color) => ({ width:'45px', height:'45px', background:`${color}08`, borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' });

export default SubAdminRegister;