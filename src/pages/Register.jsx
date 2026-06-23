import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api'; 
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import HomeHeader from '../components/Customer/HomeHeader';
import { useBranding } from '../context/BrandingContext';
import MerchantRegSummary from './MerchantRegSummary';

// --- Razorpay SDK Loader Helper ---
const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const Register = () => {
    const { settings } = useBranding();
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [regId, setRegId] = useState('');
    const [paidPaymentId, setPaidPaymentId] = useState(null); // ✅ पेमेंट आईडी सुरक्षित रखने के लिए
    
    const mapInstance = useRef(null);
    const markerInstance = useRef(null);
    const [mapplsReady, setMapplsReady] = useState(false);

    const [isMobileVerified, setIsMobileVerified] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [otpSent, setOtpSent] = useState({ mobile: false, email: false });
    const [enteredOtp, setEnteredOtp] = useState({ mobile: '', email: '' });
    const [verifying, setVerifying] = useState({ mobile: false, email: false });

    const [banks, setBanks] = useState([]);
    const [shopTypes, setShopTypes] = useState([]);
    const [locationData, setLocationData] = useState([]);
    
    const [tempDistricts, setTempDistricts] = useState([]);
    const [tempBlocks, setTempBlocks] = useState([]);
    const [permDistricts, setPermDistricts] = useState([]);
    const [permBlocks, setPermBlocks] = useState([]);
    const [shopDistricts, setShopDistricts] = useState([]);
    const [shopBlocks, setShopBlocks] = useState([]);

    const [formData, setFormData] = useState({
        fullName: '', fatherName: '', dob: '', gender: '', 
        mobile: '', whatsapp: '', email: '', 
        isSameAsMobile: false, ownerPhoto: '',
        aadharNumber: '', aadharFile: '', panNumber: '', panFile: '', gstNumber: '',
        tempState: '', tempDistrict: '', tempBlock: '', tempPin: '', tempFullAddress: '',
        isSameAsTemp: false,
        permState: '', permDistrict: '', permBlock: '', permPin: '', permFullAddress: '',
        shopName: '', shopType: '', shopState: '', shopDistrict: '', shopBlock: '', shopPin: '', shopFullAddress: '',
        shopPhotoIn: '', shopPhotoOut: '',
        shopCoords: { lat: 28.6139, lng: 77.2090 }, 
        bankName: '', bankAcc: '', confirmAcc: '', bankIfsc: '', bankFile: '',
        consent: false
    });

    const themeColor = settings.themeColor || '#0f172a';
    const Star = () => <span style={{color:'#ef4444', fontWeight:'bold', marginLeft:'3px'}}>*</span>;
    const FileInfo = () => <p style={fileInstrS}>Max Size: 1MB | Formats: JPG  only</p>;

    const getMaxDOB = () => {
        const today = new Date();
        const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        return eighteenYearsAgo.toISOString().split('T')[0];
    };

    // 1. मास्टर डेटा सिंक्रोनाइज़ेशन
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
        } catch (err) { console.error("Registry load failure."); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // 2. माप्लस एकीकरण
    useEffect(() => {
        if (settings?.enableMerchantMap && settings?.mapplsKey) {
            const key = settings?.mapplsKey;
            if (!window.mappls) {
                const script = document.createElement('script');
                script.src = `https://apis.mappls.com/advancedmaps/api/${key}/map_sdk?v=3.0&layer=vector`;
                script.async = true;
                script.onload = () => setMapplsReady(true);
                document.head.appendChild(script);
            } else setMapplsReady(true);
        }
    }, [settings?.mapplsKey, settings?.enableMerchantMap]);

    useEffect(() => {
        if (mapplsReady && settings?.enableMerchantMap && !mapInstance.current) {
            const map = new window.mappls.Map('mappls-map', { center: [formData.shopCoords.lat, formData.shopCoords.lng], zoom: 15 });
            map.addListener('load', () => {
                const marker = new window.mappls.Marker({ map, position: formData.shopCoords, draggable: true });
                marker.addListener('dragend', () => {
                    const pos = marker.getPosition();
                    setFormData(p => ({ ...p, shopCoords: { lat: pos.lat, lng: pos.lng } }));
                });
                markerInstance.current = marker;
            });
            mapInstance.current = map;
        }
    }, [mapplsReady, settings?.enableMerchantMap, formData.shopCoords.lat, formData.shopCoords.lng]);

    // --- [3. स्मार्ट इनपुट रिस्ट्रिक्शन लॉजिक] ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalVal = type === 'checkbox' ? checked : value;

        // ✅ संख्या प्रतिबंध (Numbers Only)
        if (['mobile', 'whatsapp', 'tempPin', 'permPin', 'shopPin', 'bankAcc', 'confirmAcc', 'aadharNumber'].includes(name)) {
            finalVal = finalVal.replace(/\D/g, ''); 
        }
        // ✅ अक्षर प्रतिबंध (Letters Only)
        if (['fullName', 'fatherName'].includes(name)) {
            finalVal = finalVal.replace(/[^a-zA-Z\s]/g, ''); 
        }
        // ✅ ऑटो-कैपिटल
        if (['bankIfsc', 'panNumber', 'gstNumber'].includes(name)) {
            finalVal = finalVal.toUpperCase();
        }

        const titleFields = ['fullName', 'fatherName', 'shopName'];
        if (titleFields.includes(name) && typeof finalVal === 'string') {
            finalVal = finalVal.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }

        setFormData(prev => {
            const updated = { ...prev, [name]: finalVal };
            if (name === 'isSameAsMobile' && checked) updated.whatsapp = prev.mobile;
            if (name === 'isSameAsTemp' && checked) {
                updated.permState = prev.tempState; updated.permDistrict = prev.tempDistrict;
                updated.permBlock = prev.tempBlock; updated.permPin = prev.tempPin;
                updated.permFullAddress = prev.tempFullAddress;
                setPermDistricts(tempDistricts); setPermBlocks(tempBlocks);
            }
            return updated;
        });
    };

    const handleLocChange = (section, level, val) => {
        const stateObj = locationData.find(s => s.state === val);
        const dists = stateObj ? stateObj.districts : [];
        if (level === 'state') {
            if (section === 'temp') { setTempDistricts(dists); setTempBlocks([]); setFormData(p=>({...p, tempState:val, tempDistrict:'', tempBlock:''})); }
            if (section === 'perm') { setPermDistricts(dists); setPermBlocks([]); setFormData(p=>({...p, permState:val, permDistrict:'', permBlock:''})); }
            if (section === 'shop') { setShopDistricts(dists); setShopBlocks([]); setFormData(p=>({...p, shopState:val, shopDistrict:'', shopBlock:''})); }
        } else if (level === 'district') {
            const currentDists = section === 'temp' ? tempDistricts : section === 'perm' ? permDistricts : shopDistricts;
            const distObj = currentDists.find(d => d.name === val);
            const blocks = distObj ? distObj.blocks : [];
            if (section === 'temp') { setTempBlocks(blocks); setFormData(p=>({...p, tempDistrict:val, tempBlock:''})); }
            if (section === 'perm') { setPermBlocks(blocks); setFormData(p=>({...p, permDistrict:val, permBlock:''})); }
            if (section === 'shop') { setShopBlocks(blocks); setFormData(p=>({...p, shopDistrict:val, shopBlock:''})); }
        }
    };

    const handleFile = (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1048576) { toast.error("File size exceeds 1MB."); e.target.value = ""; return; }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result }));
    };

    const handleSendOtp = async (type) => {
        const val = type === 'mobile' ? formData.mobile : formData.email;
        if (!val) return toast.error(`Enter ${type}`);
        const isEnabled = type === 'mobile' ? settings.mobileVerificationEnabled : settings.emailVerificationEnabled;
        if (!isEnabled) { setOtpSent(p => ({ ...p, [type]: true })); toast.info(`Verification bypassed.`); return; }
        try {
            setVerifying(p => ({ ...p, [type]: true }));
            await api.post('/auth/security/request-otp', { [type]: val });
            setOtpSent(p => ({ ...p, [type]: true }));
            toast.info(`OTP Sent!`);
        } catch (err) { toast.error("OTP Dispatch Failed."); } 
        finally { setVerifying(p => ({ ...p, [type]: false })); }
    };

    const handleVerifyOtp = async (type) => {
        const isEnabled = type === 'mobile' ? settings.mobileVerificationEnabled : settings.emailVerificationEnabled;
        if (!isEnabled) { type === 'mobile' ? setIsMobileVerified(true) : setIsEmailVerified(true); setOtpSent(p => ({ ...p, [type]: false })); return; }
        try {
            setVerifying(p => ({ ...p, [type]: true }));
            const res = await api.put('/auth/security/verify-otp', { [type]: type === 'mobile' ? formData.mobile : formData.email, otp: enteredOtp[type] });
            if (res.data.success) { type === 'mobile' ? setIsMobileVerified(true) : setIsEmailVerified(true); setOtpSent(p => ({ ...p, [type]: false })); toast.success(`${type} Verified.`); }
        } catch (err) { toast.error("Invalid Code."); }
        finally { setVerifying(p => ({ ...p, [type]: false })); }
    };

    // --- [4. मुख्य सबमिट: DOUBLE PAYMENT PROTECTION & PROCESSING FIX] ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (settings.mobileVerificationEnabled && !isMobileVerified) return toast.warning("Verify Mobile.");
        if (settings.emailVerificationEnabled && !isEmailVerified) return toast.warning("Verify Email.");
        if (formData.bankAcc !== formData.confirmAcc) return toast.error("Account Mismatch.");
        
        // ✅ पेमेंट प्रोटेक्शन: अगर पहले ही पे हो चुका है, तो दोबारा Razorpay न खोलें
        if (paidPaymentId) {
            toast.info("Resubmitting application with confirmed payment...");
            completeRegistration(paidPaymentId);
            return;
        }

        const fee = settings?.registrationFeeAmount || 0;
        const isGatewayLive = settings?.onlinePayEnabled;
        const rzpKey = settings?.apiConfig?.razorpay?.KEY_ID;

        if (fee > 0 && isGatewayLive) {
            if (!rzpKey) return toast.error("System Error: Razorpay Key missing.");
            const razorLoaded = await loadRazorpay();
            if (!razorLoaded) return toast.error("Gateway load failed.");

            try {
                setLoading(true);
                const orderRes = await api.post('/payments/razorpay/create-order', { amount: fee });
               const options = {
    key: rzpKey,
    amount: orderRes.data.amount,
    currency: "INR",
    name: settings.siteName,
    description: "Merchant Registration Fee",
    order_id: orderRes.data.order_id,
    
    // ✅ इसे अपडेट किया गया: अब यह फॉर्म में भरा हुआ नंबर और ईमेल उठाएगा
    prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.mobile 
    },

    handler: (res) => {
        setPaidPaymentId(res.razorpay_payment_id);
        completeRegistration(res.razorpay_payment_id);
    },
    theme: { color: themeColor },
    modal: { ondismiss: () => setLoading(false) }
};
 new window.Razorpay(options).open();
            } catch (err) { 
                toast.error("Payment Initiation Failed."); 
                setLoading(false); 
            }
        } else {
            completeRegistration('FREE_BYPASS_OR_DISABLED');
        }
    };

const completeRegistration = async (paymentId) => {
    // अगर पहले से लोडिंग है तो रुकें
    if (loading) return; 

    setLoading(true);
    
    // डेटा मैपिंग (सुनिश्चित करें कि कोई फील्ड undefined न हो)
    const payload = {
        ...formData,
        email: formData.email.toLowerCase().trim(),
        primaryEmail: formData.email.toLowerCase().trim(),  
        paymentId: paymentId || 'BYPASS',
        shopFullAddress: formData.shopFullAddress || '',
        shopPin: formData.shopPin || '',
        pState: formData.permState || '',
        pDistrict: formData.permDistrict || '',
        pBlock: formData.permBlock || '',
        pPin: formData.permPin || '',
        pFullAddress: formData.permFullAddress || '',
        tState: formData.tempState || '',
        tDistrict: formData.tempDistrict || '',
        tBlock: formData.tempBlock || '',
        tPin: formData.tempPin || '',
        tFullAddress: formData.tempFullAddress || ''
    };

    try {
        // API कॉल - टाइमआउट (api.js वाला) यहाँ काम करेगा
        const res = await api.post('/auth/register/merchant', payload);
        
        if (res.data.success) {
            toast.success("Registration Successful!");
            setPaidPaymentId(null); // सफलता के बाद क्लियर करें
            setRegId(res.data.trackingId);
            setIsSubmitted(true);
            window.scrollTo(0, 0);
        }
    } catch (err) {
        // 🚩 ERROR HANDLING (बटन को वापस लाने के लिए)
        const errorMsg = err.response?.data?.message || err.message || "Internal Registry Sync Error";
        console.error("SUBMISSION_ERROR:", errorMsg);
        
        toast.error(`Error: ${errorMsg}`, {
            position: "top-right",
            autoClose: 10000, // १० सेकंड तक एरर दिखेगा
        });

        if (paidPaymentId) {
            toast.warning("NOTE: Your payment is confirmed. Please fix the file/data error and click Submit again.", {
                autoClose: false // यह तब तक नहीं हटेगा जब तक यूजर इसे बंद न करे
            });
        }
    } finally {
        // ✅ यह बटन को हर हाल में "Submit" की स्थिति में वापस लाएगा
        setLoading(false); 
    }
};
    if (isSubmitted) return <MerchantRegSummary data={formData} regId={regId} />;

    return (
        <div style={pageBg}>
            <HomeHeader />
            <div style={containerS}>
                <div style={mainFormCard}>
                    {/* ✅ लोगो और हेडर सेंटर अलाइनमेंट */}
                    <div style={formHeader}>
                        {settings.logoUrl ? (
                            <img src={settings.logoUrl} alt="Logo" style={logoImgS} />
                        ) : (
                            <div style={logoPlaceholderS(themeColor)}>M</div>
                        )}
                        <h1 style={mainTitle}>{settings.siteName} Merchant Onboarding</h1>
                        <p style={subTitle}>Global Hyperlocal Hub Deployment Protocol.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* SECTION 01: IDENTITY */}
                        <div style={sectionBox(themeColor)}>
                            <h3 style={secLabel}>👤 01. Personnel Identity Registry</h3>
                            <div style={grid2}>
                                <div style={inGrp}><label style={labS}>Full Legal Name <Star/></label><input name="fullName" value={formData.fullName} required style={inputS} onChange={handleChange} placeholder="Name" /></div>
                                <div style={inGrp}><label style={labS}>Father's Name <Star/></label><input name="fatherName" value={formData.fatherName} required style={inputS} onChange={handleChange} placeholder="Father's Name" /></div>
                                <div style={inGrp}>
                                    <label style={labS}>Date of Birth (18+) <Star/></label>
                                    <input name="dob" type="date" max={getMaxDOB()} value={formData.dob} required style={inputS} onChange={handleChange} />
                                </div>
                                <div style={inGrp}><label style={labS}>Gender <Star/></label>
                                    <select name="gender" value={formData.gender} style={inputS} onChange={handleChange} required>
                                        <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                                    </select>
                                </div>
                                <div style={inGrp}>
                                    <label style={labS}>Primary Mobile <Star/></label>
                                    <div style={flexRow}>
                                        <input name="mobile" value={formData.mobile} maxLength="10" style={isMobileVerified ? verifiedIn : inputS} onChange={handleChange} required disabled={isMobileVerified} placeholder="10 digits only" />
                                        {!isMobileVerified && formData.mobile.length === 10 && (
                                            <button type="button" onClick={()=>handleSendOtp('mobile')} style={vBtn(themeColor)} disabled={verifying.mobile}>
                                                {settings.mobileVerificationEnabled ? "Send OTP" : "Send OTP"}
                                            </button>
                                        )}
                                        {isMobileVerified && <span style={checkV}>✓Verify</span>}
                                    </div>
                                    {otpSent.mobile && !isMobileVerified && (
                                        <div style={otpRow}>
                                            <input placeholder="OTP" style={otpInS} maxLength="6" onChange={(e)=>setEnteredOtp({...enteredOtp, mobile: e.target.value})} />
                                            <button type="button" onClick={()=>handleVerifyOtp('mobile')} style={otpOk}>Verify</button>
                                        </div>
                                    )}
                                </div>
                                <div style={inGrp}>
                                    <label style={labS}>WhatsApp Identity <Star/></label>
                                    <input name="whatsapp" value={formData.whatsapp} maxLength="10" style={inputS} onChange={handleChange} required placeholder="Numbers 123.." disabled={formData.isSameAsMobile} />
                                    <label style={checkLabel}><input type="checkbox" name="isSameAsMobile" checked={formData.isSameAsMobile} onChange={handleChange} /> Same as Mobile</label>
                                </div>
                                <div style={inGrp}>
                                    <label style={labS}>Official Email <Star/></label>
                                    <div style={flexRow}>
                                        <input name="email" value={formData.email} type="email" style={isEmailVerified ? verifiedIn : inputS} onChange={handleChange} required disabled={isEmailVerified} placeholder="Email ID" />
                                        {!isEmailVerified && formData.email.includes('.com') && (
                                            <button type="button" onClick={()=>handleSendOtp('email')} style={vBtn(themeColor)} disabled={verifying.email}>
                                                {settings.emailVerificationEnabled ? "Send OTP" : "Send OTP"}
                                            </button>
                                        )}
                                        {isEmailVerified && <span style={checkV}>✓ Verified</span>}
                                    </div>
                                    {otpSent.email && !isEmailVerified && (
                                        <div style={otpRow}>
                                            <input placeholder="OTP" style={otpInS} maxLength="6" onChange={(e)=>setEnteredOtp({...enteredOtp, email: e.target.value})} />
                                            <button type="button" onClick={()=>handleVerifyOtp('email')} style={otpOk}>Verify</button>
                                        </div>
                                    )}
                                </div>
                                <div style={inGrp}>
                                    <label style={labS}>Identity Portrait <Star/></label>
                                    <div style={fileBox}><input type="file" onChange={(e)=>handleFile(e, 'ownerPhoto')} required style={{fontSize:'11px'}} /><FileInfo />
                                        {formData.ownerPhoto && <img src={formData.ownerPhoto} style={previewImg} alt="P" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 02: KYC */}
                        <div style={sectionBox('#16a085')}>
                            <h3 style={secLabel}>📑 02. Statutory Compliance Portfolio</h3>
                            <div style={grid2}>
                                <div style={inGrp}><label style={labS}>Aadhaar UID🆔 <Star/></label><input name="aadharNumber" value={formData.aadharNumber} maxLength="12" style={inputS} onChange={handleChange} required placeholder="Numbers 123.." /></div>
                                <div style={inGrp}><label style={labS}>Aadhaar Scan Port <Star/></label><input type="file" onChange={(e)=>handleFile(e, 'aadharFile')} required /><FileInfo /></div>
                                <div style={inGrp}><label style={labS}>PAN ID 🪪<Star/></label><input name="panNumber" value={formData.panNumber} maxLength="10" style={inputS} onChange={handleChange} required placeholder="ABCDE1234F" /></div>
                                <div style={inGrp}><label style={labS}>PAN Scan Port <Star/></label><input type="file" onChange={(e)=>handleFile(e, 'panFile')} required /><FileInfo /></div>
                            </div>
                        </div>

                        {/* SECTION 03: ADDRESS */}
                        <div style={sectionBox('#e67e22')}>
                            <h3 style={secLabel}>🏠 03. Correspondence Address Hub</h3>
                            <div style={grid3}>
                                <div style={inGrp}><label style={labS}>State <Star/></label>
                                    <select value={formData.tempState} style={inputS} onChange={(e)=>handleLocChange('temp', 'state', e.target.value)} required>
                                        <option value="">Select</option>{locationData.map((l, i)=><option key={i} value={l.state}>{l.state}</option>)}
                                    </select>
                                </div>
                                <div style={inGrp}><label style={labS}>District <Star/></label>
                                    <select value={formData.tempDistrict} style={inputS} onChange={(e)=>handleLocChange('temp', 'district', e.target.value)} required>
                                        <option value="">Select</option>{tempDistricts.map((d, i)=><option key={i} value={d.name}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div style={inGrp}><label style={labS}>Block <Star/></label>
                                    <select name="tempBlock" value={formData.tempBlock} style={inputS} onChange={handleChange} required>
                                        <option value="">Select</option>{tempBlocks.map((b, i)=><option key={i} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div style={inGrp}><label style={labS}>Pincode <Star/></label><input name="tempPin" value={formData.tempPin} maxLength="6" style={inputS} onChange={handleChange} required placeholder="Numbers 123.." /></div>
                                <div style={{...inGrp, gridColumn:'span 2'}}><label style={labS}>Full House Address <Star/></label><input name="tempFullAddress" value={formData.tempFullAddress} style={inputS} onChange={handleChange} required placeholder="Street, Landmark, Area" /></div>
                            </div>

                            <hr style={{margin:'40px 0', border:'none', borderTop:'1px solid #f1f5f9'}} />

                            <h3 style={secLabel}>📍 04. Permanent Residential Registry</h3>
                            <label style={checkLabel}><input type="checkbox" name="isSameAsTemp" checked={formData.isSameAsTemp} onChange={handleChange} /> Same as Correspondence</label>
                            {!formData.isSameAsTemp && (
                                <div style={{...grid3, marginTop:'20px'}}>
                                    <div style={inGrp}><label style={labS}>State <Star/></label>
                                        <select value={formData.permState} style={inputS} onChange={(e)=>handleLocChange('perm', 'state', e.target.value)} required>
                                            <option value="">Select</option>{locationData.map((l, i)=><option key={i} value={l.state}>{l.state}</option>)}
                                        </select>
                                    </div>
                                    <div style={inGrp}><label style={labS}>District <Star/></label>
                                        <select value={formData.permDistrict} style={inputS} onChange={(e)=>handleLocChange('perm', 'district', e.target.value)} required>
                                            <option value="">Select</option>{permDistricts.map((d, i)=><option key={i} value={d.name}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div style={inGrp}><label style={labS}>Block <Star/></label>
                                        <select name="permBlock" value={formData.permBlock} style={inputS} onChange={handleChange} required>
                                            <option value="">Select</option>{permBlocks.map((b, i)=><option key={i} value={b}>{b}</option>)}
                                        </select>
                                    </div>
                                    <div style={inGrp}><label style={labS}>Pincode <Star/></label><input name="permPin" value={formData.permPin} maxLength="6" style={inputS} onChange={handleChange} required placeholder="Numbers 123.." /></div>
                                    <div style={{...inGrp, gridColumn:'span 2'}}><label style={labS}>Permanent Address <Star/></label><input name="permFullAddress" value={formData.permFullAddress} style={inputS} onChange={handleChange} required /></div>
                                </div>
                            )}
                        </div>

                        {/* SECTION 05: COMMERCIAL HUB */}
                        <div style={sectionBox('#3498db')}>
                            <h3 style={secLabel}>🏪 05. Commercial Hub Configuration</h3>
                            <div style={grid2}>
                                <div style={inGrp}><label style={labS}>Trading Name <Star/></label><input name="shopName" value={formData.shopName} style={inputS} onChange={handleChange} required placeholder="Business Name" /></div>
                                <div style={inGrp}><label style={labS}>Sector <Star/></label>
                                    <select name="shopType" value={formData.shopType} style={inputS} onChange={handleChange} required>
                                        <option value="">Select</option>{shopTypes.map((t, i)=><option key={i} value={t.name}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div style={{...inGrp, gridColumn:'span 2'}}><label style={labS}>GSTIN Identification (Optional)</label><input name="gstNumber" value={formData.gstNumber} maxLength="15" style={inputS} onChange={handleChange} placeholder="15-digit GST Code" /></div>
                                <div style={inGrp}><label style={labS}>Shop State <Star/></label>
                                    <select value={formData.shopState} style={inputS} onChange={(e)=>handleLocChange('shop', 'state', e.target.value)} required>
                                        <option value="">Select</option>{locationData.map((l, i)=><option key={i} value={l.state}>{l.state}</option>)}
                                    </select>
                                </div>
                                <div style={inGrp}><label style={labS}>Shop District <Star/></label>
                                    <select value={formData.shopDistrict} style={inputS} onChange={(e)=>handleLocChange('shop', 'district', e.target.value)} required>
                                        <option value="">Select</option>{shopDistricts.map((d, i)=><option key={i} value={d.name}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div style={inGrp}><label style={labS}>Shop Block <Star/></label>
                                    <select name="shopBlock" value={formData.shopBlock} style={inputS} onChange={handleChange} required>
                                        <option value="">Select</option>{shopBlocks.map((b, i)=><option key={i} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div style={inGrp}><label style={labS}>Shop Pincode <Star/></label><input name="shopPin" value={formData.shopPin} maxLength="6" style={inputS} onChange={handleChange} required placeholder="6 Digits only" /></div>
                                <div style={inGrp}><label style={labS}>Hub Interior Portrait <Star/></label><input type="file" onChange={(e)=>handleFile(e, 'shopPhotoIn')} required /><FileInfo /></div>
                                <div style={inGrp}><label style={labS}>Hub Exterior Portrait <Star/></label><input type="file" onChange={(e)=>handleFile(e, 'shopPhotoOut')} required /><FileInfo /></div>
                                <div style={{...inGrp, gridColumn:'span 2'}}><label style={labS}>Full Hub Address <Star/></label><textarea name="shopFullAddress" value={formData.shopFullAddress} style={areaS} onChange={handleChange} required placeholder="Detailed shop address"></textarea></div>
                            </div>
                            {settings.enableMerchantMap && (
                                <div style={mapWrap}>
                                    <label style={labS}>📍 PINPOINT HUB GEOLOCATION (DRAG MARKER) <Star/></label>
                                    <div id="mappls-map" style={mapBox}>{!mapplsReady && <div className="spinner">Connecting Map Cluster...</div>}</div>
                                    <small style={coordS}>GPS LAT: {formData.shopCoords.lat.toFixed(6)} | LNG: {formData.shopCoords.lng.toFixed(6)}</small>
                                </div>
                            )}
                        </div>

                        {/* SECTION 06: FINANCIAL SETTLEMENT */}
                        <div style={sectionBox('#27ae60')}>
                            <h3 style={secLabel}>💳 06. Financial Settlement Node</h3>
                            <div style={grid2}>
                                <div style={inGrp}><label style={labS}>Bank Institution <Star/></label>
                                    <select name="bankName" value={formData.bankName} style={inputS} onChange={handleChange} required>
                                        <option value="">Select Bank</option>{banks.map((b, i)=><option key={i} value={b.name}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div style={inGrp}><label style={labS}>IFSC Code <Star/></label><input name="bankIfsc" value={formData.bankIfsc} maxLength="11" style={inputS} onChange={handleChange} required placeholder="SBIN000XXXX" /></div>
                                <div style={inGrp}><label style={labS}>Account Number <Star/></label><input name="bankAcc" value={formData.bankAcc} type="password" style={inputS} onChange={handleChange} required placeholder="Account Number" /></div>
                                <div style={inGrp}><label style={labS}>Confirm Account <Star/></label><input name="confirmAcc" value={formData.confirmAcc} style={inputS} onChange={handleChange} required placeholder="Re-enter Account No" /></div>
                                <div style={{...inGrp, gridColumn:'span 2'}}><label style={labS}>Evidence (Passbook/Cheque) <Star/></label><input type="file" onChange={(e)=>handleFile(e, 'bankFile')} required /><FileInfo /></div>
                            </div>
                        </div>

                        <div style={consentArea}>
                            <input type="checkbox" name="consent" checked={formData.consent} required style={{width:'24px', height:'24px'}} onChange={handleChange} />
                            <span style={{fontSize:'14px', color:'#475569', fontWeight:'800'}}>I certify all details are correct and comply with the <Link to="/terms" style={{color:themeColor}}>Merchant Governance Policy</Link>.</span>
                        </div>

                        <button type="submit" style={loading ? disBtn : subBtn(themeColor)} disabled={loading}>
                            {loading ? "Processing Hub Registration..." : (paidPaymentId ? "Submit Application (Payment Confirmed)" : "Pay Fee & Submit Application")}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- Styles ---
const pageBg = { background: '#f1f5f9', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const containerS = { width: '95%', maxWidth: '1100px', margin: '0 auto', padding: '20px 0 60px' };
const mainFormCard = { background: '#fff', borderRadius: '40px', padding: window.innerWidth < 768 ? '25px' : '45px', boxShadow: '0 25px 60px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' };
const formHeader = { textAlign: 'center', marginBottom: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
const logoImgS = { height: '80px', marginBottom: '20px', display:'block', objectFit:'contain' };
const logoPlaceholderS = (color) => ({ width:'80px', height:'80px', background:color, borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'40px', fontWeight:'900', marginBottom:'20px' });
const mainTitle = { fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: '900', color: '#0f172a', letterSpacing: '-1.5px', margin: '0 0 10px 0' };
const subTitle = { color: '#64748b', fontSize: '15px', marginTop: '0px', fontWeight: '500' };
const sectionBox = (color) => ({ marginBottom: '40px', padding: '40px', background: '#fff', borderTop: `8px solid ${color}`, borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' });
const secLabel = { fontSize: '17px', fontWeight: '900', color: '#0f172a', marginBottom: '35px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const grid2 = { display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '30px' };
const grid3 = { display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)', gap: '25px' };
const inGrp = { display: 'flex', flexDirection: 'column', gap: '10px' };
const labS = { fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' };
const inputS = { padding: '17px', borderRadius: '15px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', fontWeight: '700', outline: 'none', color: '#1e293b', width:'100%', boxSizing:'border-box' };
const areaS = { ...inputS, height: '110px', resize: 'none' };
const fileInstrS = { fontSize: '9px', color: '#5d6f8e', fontWeight: '800', marginTop: '4px', textTransform: 'uppercase' };
const flexRow = { display: 'flex', gap: '12px', alignItems: 'center' };
const vBtn = (color) => ({ background: color, color: '#fff', border: 'none', padding: '12px 22px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '11px', whiteSpace:'nowrap' });
const checkV = { color: '#10b981', fontWeight: '900', fontSize: '13px', whiteSpace:'nowrap' };
const otpRow = { display: 'flex', gap: '12px', marginTop: '12px' };
const otpInS = { ...inputS, width: '130px', textAlign: 'center', letterSpacing: '4px', border: '2px solid #3498db' };
const otpOk = { background: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', padding: '0 25px', fontWeight: '900', cursor: 'pointer' };
const fileBox = { background: '#f8fafc', padding: '18px', borderRadius: '18px', border: '1.5px dashed #cbd5e1', textAlign: 'center' };
const previewImg = { height: '85px', width: '85px', borderRadius: '12px', marginTop: '12px', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' };
const verifiedIn = { ...inputS, borderColor: '#10b981', background: '#ecfdf5', color: '#10b981' };
const checkLabel = { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', fontWeight: '800', color: '#64748b' };
const mapWrap = { marginTop: '35px', paddingTop: '25px', borderTop: '1px solid #f1f5f9' };
const mapBox = { height: '420px', borderRadius: '25px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const coordS = { display: 'block', textAlign: 'center', marginTop: '10px', fontSize: '10px', color: '#94a3b8', fontWeight: '900' };
const consentArea = { display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', background: '#f8fafc', borderRadius: '22px', marginBottom: '45px', border: '1px solid #e2e8f0' };
const subBtn = (color) => ({ width: '100%', padding: '24px', background: color, color: '#fff', border: 'none', borderRadius: '22px', fontSize: '18px', fontWeight: '900', cursor: 'pointer', boxShadow: `0 15px 40px ${color}40`, letterSpacing: '1px' });
const disBtn = { ...subBtn('#e1cbcb'), background: '#cbd5e1', cursor: 'not-allowed' };

export default Register;