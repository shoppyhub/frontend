import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api'; 
import { toast } from 'react-toastify';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const StaffRegistrationForm = ({ onBack, editData }) => {
    const [loading, setLoading] = useState(false);
    const [banks, setBanks] = useState([]);
    const [locationData, setLocationData] = useState([]);
    const isEditMode = !!editData;

    // --- Window Size for Responsiveness ---
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const isMobile = windowWidth <= 768;

    // --- Map & GPS States ---
    const [coordinates, setCoordinates] = useState({ lat: 20.5937, lng: 78.9629 }); 
    const [showMap, setShowMap] = useState(false);
    const [locating, setLocating] = useState(false);

    // --- Verification States ---
    const [isMobileVerified, setIsMobileVerified] = useState(isEditMode);
    const [isEmailVerified, setIsEmailVerified] = useState(isEditMode);
    const [showOtpInput, setShowOtpInput] = useState({ mobile: false, email: false });

    // Location States
    const [pDistricts, setPDistricts] = useState([]);
    const [pBlocks, setPBlocks] = useState([]);
    const [tDistricts, setTDistricts] = useState([]);
    const [tBlocks, setTBlocks] = useState([]);

    const [formData, setFormData] = useState({
        fullName: '', fatherName: '', dob: '', gender: '',
        mobile: '', whatsapp: '', isSameAsMobile: false, email: '',
        password: '', staffPhoto: '', aadharNumber: '', aadharFile: '', 
        panNumber: '', panFile: '', qualification: '', qualificationFile: '',
        roleInShop: '', joiningDate: '',
        tState: '', tDistrict: '', tBlock: '', tPin: '', tFullAddress: '',
        isSameAsPermanent: false,
        pState: '', pDistrict: '', pBlock: '', pPin: '', pFullAddress: '',
        bankName: '', bankAcc: '', confirmBankAcc: '', bankIfsc: '', bankFile: ''
    });

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_MAPPLS_API_KEY
    });

    const initializeForm = useCallback(async () => {
        try {
            const [bRes, lRes] = await Promise.all([
                api.get('/admin/directories/banks'),
                api.get('/admin/directories/locations')
            ]);
            setBanks(bRes.data?.data || []);
            setLocationData(lRes.data?.data || []);

            if (isEditMode && editData) {
                setFormData({
                    ...editData,
                    dob: editData.dob ? editData.dob.split('T')[0] : '',
                    joiningDate: editData.staffDetails?.joiningDate ? editData.staffDetails.joiningDate.split('T')[0] : '',
                    bankAcc: editData.bankDetails?.accountNumber || '',
                    confirmBankAcc: editData.bankDetails?.accountNumber || '',
                    staffPhoto: editData.photo || ''
                });
                if (editData.locationCoords) setCoordinates(editData.locationCoords);
            }
        } catch (err) { console.error("Initialization Sync Error", err); }
    }, [isEditMode, editData]);

    useEffect(() => { initializeForm(); }, [initializeForm]);

    const handleAutoLocation = () => {
        setLocating(true);
        navigator.geolocation.getCurrentPosition((pos) => {
            setCoordinates({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setLocating(false);
            setShowMap(true);
            toast.success("GPS Node Captured! 📍");
        }, () => {
            toast.error("GPS access denied.");
            setLocating(false);
        });
    };

    const verifyOtp = (type) => {
        toast.success(`${type.toUpperCase()} Verified!`);
        if (type === 'mobile') setIsMobileVerified(true);
        else setIsEmailVerified(true);
        setShowOtpInput(prev => ({ ...prev, [type]: false }));
    };

    const sendOtp = (type) => {
        toast.info(`OTP Code: 1234 sent to your ${type}.`);
        setShowOtpInput(prev => ({ ...prev, [type]: true }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleLocChange = (section, level, value) => {
        const stateObj = locationData.find(s => s.state === value);
        const dists = stateObj ? stateObj.districts : [];
        if (level === 'state') {
            if (section === 'temp') { setTDistricts(dists); setTBlocks([]); setFormData(p => ({...p, tState:value, tDistrict:'', tBlock:''})); }
            else { setPDistricts(dists); setPBlocks([]); setFormData(p => ({...p, pState:value, pDistrict:'', pBlock:''})); }
        } else if (level === 'district') {
            const currentDists = section === 'temp' ? tDistricts : pDistricts;
            const blocks = currentDists.find(d => d.name === value)?.blocks || [];
            if (section === 'temp') { setTBlocks(blocks); setFormData(p => ({...p, tDistrict:value, tBlock:''})); }
            else { setPBlocks(blocks); setFormData(p => ({...p, pDistrict:value, pBlock:''})); }
        }
    };

    const handleFile = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.bankAcc !== formData.confirmBankAcc) return toast.error("Bank accounts mismatched!");
        if (!isMobileVerified) return toast.warning("Mobile node verification required.");

        setLoading(true);
        try {
            const payload = { ...formData, locationCoords: coordinates };
            const res = isEditMode ? await api.put(`/auth/staff/update/${editData._id}`, payload) : await api.post('/auth/staff/add', payload);
            if (res.data.success) { toast.success("Identity Deployed!"); onBack(); }
        } catch (err) { toast.error("Sync failed."); } finally { setLoading(false); }
    };

    const Star = () => <span style={{ color: '#ef4444' }}>*</span>;

    return (
        <div style={{...containerStyle, width: isMobile ? '95%' : '1150px'}}>
            <div style={headerStyle}>
                <button onClick={onBack} style={backBtn}>← Back</button>
                <h2 style={titleText}>{isEditMode ? "📝 Modify Staff Node" : "👥 New Staff Enrollment"}</h2>
            </div>

            <form onSubmit={handleSubmit}>
                {/* 01. PERSONAL IDENTITY */}
                <div style={{...sectionBox, borderTopColor: '#3b82f6'}}>
                    <h3 style={secTitle}>01. PERSONAL IDENTITY & AUTHENTICATION</h3>
                    <div style={isMobile ? grid1 : grid2}>
                        <div style={inputGroup}><label style={labelS}>FULL LEGAL NAME <Star/></label><input name="fullName" value={formData.fullName} required style={inputS} onChange={handleChange} placeholder="Enter full name as per Govt. ID" /></div>
                        <div style={inputGroup}><label style={labelS}>GUARDIAN/FATHER'S NAME <Star/></label><input name="fatherName" value={formData.fatherName} required style={inputS} onChange={handleChange} placeholder="Enter guardian name" /></div>
                        <div style={inputGroup}><label style={labelS}>DATE OF BIRTH <Star/></label><input name="dob" type="date" value={formData.dob} required style={inputS} onChange={handleChange} /></div>
                        <div style={inputGroup}><label style={labelS}>GENDER <Star/></label>
                            <select name="gender" value={formData.gender} style={inputS} required onChange={handleChange}>
                                <option value="">-- Choose Gender --</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                            </select>
                        </div>
                        <div style={inputGroup}>
                            <label style={labelS}>MOBILE NODE <Star/></label>
                            <div style={{display:'flex', gap:'8px'}}>
                                <input name="mobile" value={formData.mobile} maxLength="10" required style={inputS} onChange={handleChange} disabled={isMobileVerified} placeholder="10 Digit Mobile No." />
                                {!isMobileVerified && formData.mobile.length === 10 && <button type="button" onClick={()=>sendOtp('mobile')} style={verifyBtn}>Verify</button>}
                                {isMobileVerified && <span style={checkIcon}>Verified ✓</span>}
                            </div>
                            {showOtpInput.mobile && <div style={otpRow}><input placeholder="Enter OTP" style={otpInS}/><button type="button" onClick={()=>verifyOtp('mobile')} style={otpGo}>Ok</button></div>}
                        </div>
                        <div style={inputGroup}>
                            <label style={labelS}>EMAIL REGISTRY <Star/></label>
                            <div style={{display:'flex', gap:'8px'}}>
                                <input name="email" type="email" value={formData.email} required style={inputS} onChange={handleChange} disabled={isEmailVerified} placeholder="email@domain.com" />
                                {!isEmailVerified && formData.email.includes('@') && <button type="button" onClick={()=>sendOtp('email')} style={verifyBtn}>Verify</button>}
                            </div>
                            {showOtpInput.email && <div style={otpRow}><input placeholder="Enter OTP" style={otpInS}/><button type="button" onClick={()=>verifyOtp('email')} style={otpGo}>Ok</button></div>}
                        </div>
                        <div style={inputGroup}><label style={labelS}>SECURITY ACCESS KEY <Star/></label><input name="password" type="password" value={formData.password} required={!isEditMode} style={inputS} onChange={handleChange} placeholder="Create a strong password" /></div>
                        <div style={inputGroup}>
                            <label style={labelS}>WHATSAPP CONNECTIVITY</label>
                            <input name="whatsapp" value={formData.whatsapp} maxLength="10" style={inputS} onChange={handleChange} disabled={formData.isSameAsMobile} placeholder="Active WhatsApp No." />
                            <label style={checkLabel}><input type="checkbox" name="isSameAsMobile" checked={formData.isSameAsMobile} onChange={handleChange} /> Same as mobile node</label>
                        </div>
                    </div>
                    <div style={fileBoxDashed}>
                        <small style={fileBoxLabel}>OFFICIAL PHOTO UPLOAD <Star/></small>
                        <input type="file" accept="image/*" onChange={(e)=>handleFile(e, 'staffPhoto')} style={{marginTop:'15px'}} />
                        {formData.staffPhoto && <img src={formData.staffPhoto} style={thumbPreview} alt="p" />}
                    </div>
                </div>

                {/* 02. KYC & EDUCATION VAULT */}
                <div style={{...sectionBox, borderTopColor: '#10b981'}}>
                    <h3 style={secTitle}>02. KYC DOCUMENTATION & EDUCATIONAL HUB</h3>
                    <div style={isMobile ? grid1 : grid2}>
                        <div style={inputGroup}><label style={labelS}>AADHAR NUMBER <Star/></label><input name="aadharNumber" maxLength="12" value={formData.aadharNumber} required style={inputS} onChange={handleChange} placeholder="12 Digit Unique ID" /></div>
                        <div style={fileBoxInner}><small style={fileBoxLabel}>AADHAR CARD SCAN <Star/></small><input type="file" onChange={(e)=>handleFile(e, 'aadharFile')} /></div>
                        <div style={inputGroup}><label style={labelS}>PAN IDENTITY NODE <Star/></label><input name="panNumber" maxLength="10" value={formData.panNumber} style={{...inputS, textTransform:'uppercase'}} onChange={handleChange} placeholder="ABCDE1234F" required /></div>
                        <div style={fileBoxInner}><small style={fileBoxLabel}>PAN CARD SCAN <Star/></small><input type="file" onChange={(e)=>handleFile(e, 'panFile')} /></div>
                        
                        <div style={inputGroup}><label style={labelS}>HIGHEST QUALIFICATION</label>
                            <select name="qualification" value={formData.qualification} style={inputS} onChange={handleChange}>
                                <option value="">-- Choose Level (Optional) --</option>
                                <option value="8th">8th Pass</option><option value="10th">10th Pass</option><option value="12th">12th Pass</option><option value="Graduate">Graduate</option><option value="PostGraduate">Post Graduate</option>
                            </select>
                        </div>
                        <div style={fileBoxInner}><small style={fileBoxLabel}>CERTIFICATE / DEGREE PROOF</small><input type="file" onChange={(e)=>handleFile(e, 'qualificationFile')} /></div>
                    </div>
                </div>

                {/* 03. CORRESPONDENCE ADDRESS & MAP */}
                <div style={{...sectionBox, borderTopColor: '#6366f1'}}>
                    <h3 style={secTitle}>03. CORRESPONDENCE HUB & LIVE GPS <Star/></h3>
                    <div style={mapActionRow}>
                        <button type="button" onClick={handleAutoLocation} style={locBtn}>📍 {locating ? "Locating..." : "Auto Detect My GPS"}</button>
                        <button type="button" onClick={() => setShowMap(!showMap)} style={mapToggleBtn}>{showMap ? "Hide Map" : "Manual Map Pin Selection"}</button>
                    </div>
                    {showMap && isLoaded && (
                        <div style={mapWrap}>
                            <p style={mapHint}>Drag the Red Pin 📍 to the exact personnel residential doorstep.</p>
                            <GoogleMap mapContainerStyle={{width:'100%', height: isMobile ? '250px' : '350px'}} center={coordinates} zoom={15}>
                                <Marker position={coordinates} draggable onDragEnd={(e)=>setCoordinates({lat:e.latLng.lat(), lng:e.latLng.lng()})} />
                            </GoogleMap>
                            <div style={coordBadge}>Coordinates: {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}</div>
                        </div>
                    )}
                    <div style={isMobile ? grid1 : grid3}>
                        <select name="tState" value={formData.tState} style={inputS} onChange={(e)=>handleLocChange('temp', 'state', e.target.value)} required>
                            <option value="">-- Select State * --</option>
                            {locationData.map((l,i)=><option key={i} value={l.state}>{l.state}</option>)}
                        </select>
                        <select name="tDistrict" value={formData.tDistrict} style={inputS} onChange={(e)=>handleLocChange('temp', 'district', e.target.value)} required>
                            <option value="">-- Select District * --</option>
                            {tDistricts.map((d,i)=><option key={i} value={d.name}>{d.name}</option>)}
                        </select>
                        <select name="tBlock" value={formData.tBlock} style={inputS} onChange={handleChange} required>
                            <option value="">-- Select Block * --</option>
                            {tBlocks.map((b,i)=><option key={i} value={b}>{b}</option>)}
                        </select>
                        <input name="tPin" placeholder="Pincode *" maxLength="6" value={formData.tPin} style={inputS} onChange={handleChange} required />
                        <input name="tFullAddress" placeholder="Building No., Street, Landmark, Village *" style={{...inputS, gridColumn: isMobile ? 'span 1' : 'span 2'}} value={formData.tFullAddress} onChange={handleChange} required />
                    </div>
                </div>

                {/* 04. PERMANENT ADDRESS */}
                <div style={{...sectionBox, borderTopColor: '#f59e0b'}}>
                    <h3 style={secTitle}>04. PERMANENT RESIDENTIAL HUB <Star/></h3>
                    <label style={{...checkLabel, marginBottom:'15px'}}><input type="checkbox" name="isSameAsPermanent" checked={formData.isSameAsPermanent} onChange={handleChange} /> Permanent address same as correspondence</label>
                    {!formData.isSameAsPermanent && (
                        <div style={isMobile ? grid1 : grid3}>
                            <select name="pState" value={formData.pState} style={inputS} onChange={(e)=>handleLocChange('perm', 'state', e.target.value)} required>
                                <option value="">-- Select State * --</option>
                                {locationData.map((l,i)=><option key={i} value={l.state}>{l.state}</option>)}
                            </select>
                            <select name="pDistrict" value={formData.pDistrict} style={inputS} onChange={(e)=>handleLocChange('perm', 'district', e.target.value)} required>
                                <option value="">-- Select District * --</option>
                                {pDistricts.map((d,i)=><option key={i} value={d.name}>{d.name}</option>)}
                            </select>
                            <select name="pBlock" value={formData.pBlock} style={inputS} onChange={handleChange} required>
                                <option value="">-- Select Block * --</option>
                                {pBlocks.map((b,i)=><option key={i} value={b}>{b}</option>)}
                            </select>
                            <input name="pPin" placeholder="Pincode *" maxLength="6" value={formData.pPin} style={inputS} onChange={handleChange} required />
                            <input name="pFullAddress" placeholder="Full Permanent Home Address *" style={{...inputS, gridColumn: isMobile ? 'span 1' : 'span 2'}} value={formData.pFullAddress} onChange={handleChange} required />
                        </div>
                    )}
                </div>

                {/* 05. BANKING SETTLEMENT */}
                <div style={{...sectionBox, borderTopColor: '#22c55e'}}>
                    <h3 style={secTitle}>05. BANKING & FINANCIAL SETTLEMENT <Star/></h3>
                    <div style={isMobile ? grid1 : grid2}>
                        <div style={inputGroup}>
                            <label style={labelS}>INSTITUTION NAME <Star/></label>
                            <select name="bankName" value={formData.bankName} style={inputS} onChange={handleChange} required>
                                <option value="">-- Select Bank * --</option>
                                {banks.map((b,i)=><option key={i} value={b.name}>{b.name}</option>)}
                            </select>
                        </div>
                        <div style={inputGroup}><label style={labelS}>ACCOUNT NUMBER <Star/></label><input name="bankAcc" type="password" value={formData.bankAcc} required style={inputS} onChange={handleChange} placeholder="Enter Account Number" /></div>
                        <div style={inputGroup}><label style={labelS}>CONFIRM ACCOUNT NUMBER <Star/></label><input name="confirmBankAcc" value={formData.confirmBankAcc} required style={inputS} onChange={handleChange} placeholder="Confirm Account Number" /></div>
                        <div style={inputGroup}><label style={labelS}>IFSC PROTOCOL CODE <Star/></label><input name="bankIfsc" value={formData.bankIfsc} style={{...inputS, textTransform:'uppercase'}} required onChange={handleChange} placeholder="e.g. SBIN0001234" /></div>
                    </div>
                    <div style={fileBoxDashed}>
                        <small style={fileBoxLabel}>BANK PASSBOOK / CANCELLED CHEQUE SCAN <Star/></small>
                        <input type="file" onChange={(e)=>handleFile(e, 'bankFile')} style={{marginTop:'15px'}} required={!isEditMode} />
                    </div>
                </div>

                {/* 06. EMPLOYMENT DESIGNATION */}
                <div style={{...sectionBox, borderTopColor: '#8b5cf6'}}>
                    <h3 style={secTitle}>06. EMPLOYMENT & DESIGNATION DETAILS <Star/></h3>
                    <div style={isMobile ? grid1 : grid2}>
                        <div style={inputGroup}>
                            <label style={labelS}>ASSIGNED DESIGNATION <Star/></label>
                            <select name="roleInShop" value={formData.roleInShop} style={inputS} required onChange={handleChange}>
                                <option value="">-- Choose Designation * --</option>
                                <option value="Delivery Associate">Delivery Associate</option>
                                <option value="Logistics Partner">Logistics Partner</option>
                                <option value="Inventory Hub Manager">Inventory Hub Manager</option>
                                <option value="Billing & Cashier">Billing & Cashier</option>
                                <option value="Store Supervisor">Store Supervisor</option>
                                <option value="Quality Controller">Quality Controller</option>
                            </select>
                        </div>
                        <div style={inputGroup}><label style={labelS}>JOINING TIMESTAMP <Star/></label><input name="joiningDate" type="date" value={formData.joiningDate} required style={inputS} onChange={handleChange} /></div>
                    </div>
                </div>

                <button type="submit" style={submitBtn} disabled={loading}>
                    {loading ? "📡 SYNCHRONIZING WITH HUB..." : "DEPLOY STAFF HUB NODE"}
                </button>
            </form>
        </div>
    );
};

// --- Styles Matching Global SaaS Identity ---
const containerStyle = { background: '#fff', padding: '30px', borderRadius: '40px', boxShadow: '0 25px 70px rgba(0,0,0,0.06)', maxWidth: '1150px', margin: '30px auto', border: '1px solid #eef2f6', boxSizing: 'border-box' };
const headerStyle = { display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '25px', marginBottom: '35px' };
const backBtn = { background: '#0f172a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '14px', cursor: 'pointer', fontWeight: '900' };
const titleText = { margin: 0, color: '#0f172a', fontWeight: '900', fontSize: '22px' };
const sectionBox = { marginBottom: '35px', padding: '25px', background: '#f8fafc', border: '1px solid #eef2f6', borderTop: '6px solid', borderRadius: '32px' };
const secTitle = { margin: '0 0 25px 0', fontSize: '13px', fontWeight: '900', color: '#0f172a', borderLeft: '5px solid #0f172a', paddingLeft: '18px', letterSpacing: '1px' };
const grid1 = { display: 'grid', gridTemplateColumns: '1fr', gap: '20px' };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '20px' };
const grid3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelS = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' };
const inputS = { padding: '15px 18px', border: '1.5px solid #eef2f6', borderRadius: '16px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box', background: '#fff', fontWeight: '700', color: '#334155' };
const fileBoxDashed = { border: '2.5px dashed #cbd5e1', padding: '30px', borderRadius: '25px', textAlign: 'center', background: '#fff', marginTop: '20px' };
const fileBoxInner = { ...fileBoxDashed, padding: '15px', marginTop: '0' };
const fileBoxLabel = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' };
const checkLabel = { fontSize: '13px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', color: '#475569' };
const verifyBtn = { background: '#0f172a', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontSize: '11px', fontWeight: '900' };
const checkIcon = { color: '#10b981', fontSize: '12px', fontWeight: '900' };
const otpRow = { display: 'flex', gap: '8px', marginTop: '10px' };
const otpInS = { padding: '12px', width: '110px', border: '1.5px solid #eef2f6', borderRadius: '10px', textAlign: 'center', fontWeight: '900', fontSize: '16px' };
const otpGo = { background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', padding: '0 20px', cursor: 'pointer', fontWeight: '900' };
const mapActionRow = { display: 'flex', gap: '10px', marginBottom: '20px' };
const locBtn = { flex: 1, padding: '14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer' };
const mapToggleBtn = { flex: 1, padding: '14px', background: '#fff', border: '1.5px solid #e2e8f0', color: '#0f172a', fontWeight: '800', borderRadius: '14px', cursor: 'pointer' };
const mapWrap = { marginBottom: '25px', borderRadius: '28px', overflow: 'hidden', border: '2px solid #eef2f6', position: 'relative' };
const mapHint = { fontSize:'11px', color:'#ef4444', fontWeight:'900', padding:'12px', textAlign:'center', background:'#fff', borderBottom:'1px solid #f1f5f9' };
const coordBadge = { position:'absolute', bottom:'15px', left:'15px', background:'rgba(15, 23, 42, 0.85)', color:'#fff', padding:'8px 16px', borderRadius:'12px', fontSize:'11px', fontWeight:'700' };
const thumbPreview = { height: '80px', width: '80px', objectFit: 'cover', borderRadius: '18px', marginTop: '15px', border: '3px solid #fff', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' };
const submitBtn = { width: '100%', padding: '20px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', border: 'none', borderRadius: '24px', fontSize: '16px', fontWeight: '900', cursor: 'pointer', marginTop: '20px', boxShadow: '0 15px 30px rgba(15, 23, 42, 0.25)' };

export default StaffRegistrationForm;