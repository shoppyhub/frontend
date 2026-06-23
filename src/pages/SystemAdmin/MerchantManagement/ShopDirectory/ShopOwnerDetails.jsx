import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../../services/api'; 
import { useBranding } from '../../../../context/BrandingContext';

const ShopOwnerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useBranding();
    
    // --- Core States ---
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ orders: 0, revenue: 0, uptime: '100%' });
    const [internalNotes, setInternalNotes] = useState("");
    const [viewImage, setViewImage] = useState(null);
    const [imgRotation, setImgRotation] = useState(0);

    // Directory States
    const [locationData, setLocationData] = useState([]);
    const [banks, setBanks] = useState([]);
    const [shopTypes, setShopTypes] = useState([]);
    const [districts, setDistricts] = useState({ p: [], t: [], shop: [] });
    const [blocks, setBlocks] = useState({ p: [], t: [], shop: [] });

    const isFetching = useRef(false);

    // 1. 📡 डेटा सिंक्रोनाइज़ेशन
    const fetchEverything = useCallback(async (isSilent = false) => {
        if (isFetching.current) return;
        try {
            if (!isSilent) setLoading(true);
            isFetching.current = true;

            const [detailsRes, bankRes, locRes, typeRes] = await Promise.all([
                api.get(`/admin/hierarchy/details/${id}`, { timeout: 120000 }),
                api.get('/admin/directories/banks'),
                api.get('/admin/directories/locations'),
                api.get('/admin/directories/shop-types')
            ]);

            if (detailsRes.data.success) {
                const master = detailsRes.data.data;
                setFormData(master);
                setInternalNotes(master.internalNotes || "");
                setBanks(bankRes.data.data || []);
                setShopTypes(typeRes.data.data || []);
                const locs = locRes.data.data || [];
                setLocationData(locs);
                
                const getDists = (sName) => locs.find(s => s.state === sName)?.districts || [];
                const getBlks = (sName, dName) => getDists(sName).find(d => d.name === dName)?.blocks || [];

                setDistricts({
                    p: getDists(master.pState),
                    t: getDists(master.tState),
                    shop: getDists(master.shopState)
                });
                setBlocks({
                    p: getBlks(master.pState, master.pDistrict),
                    t: getBlks(master.tState, master.tDistrict),
                    shop: getBlks(master.shopState, master.shopDistrict)
                });
                
                setLoading(false);
                fetchSecondaryData();
            }
        } catch (err) {
            toast.error("Merchant Handshake Failed.");
        } finally {
            isFetching.current = false;
            setLoading(false);
        }
    }, [id]);

    const fetchSecondaryData = async () => {
        Promise.allSettled([
            api.get(`/admin/hierarchy/logs/${id}`),
            api.get(`/admin/hierarchy/performance/${id}`)
        ]).then(([l, s]) => {
            if (l.status === 'fulfilled') setLogs(l.value.data.data || []);
            if (s.status === 'fulfilled') setStats(s.value.data.data || { orders: 0, revenue: 0, uptime: '99%' });
        });
    };

    useEffect(() => { fetchEverything(); }, [fetchEverything]);

    // 2. 🛡️ प्रशासनिक कमांड्स
    const handleUpdate = async () => {
        try {
            setLoading(true);
            const res = await api.put(`/admin/hierarchy/update/${id}`, { ...formData, internalNotes });
            if (res.data.success) {
                toast.success("Merchant Identity Records Synchronized.");
                setIsEditing(false);
                fetchEverything(true);
            }
        } catch (err) { toast.error("Sync Failure."); }
        finally { setLoading(false); }
    };

    const handlePasswordReset = async () => {
        const newPass = window.prompt("🔐 SECURITY: Enter New Master Password for Merchant:");
        if (!newPass) return;
        try {
            await api.put(`/admin/users/reset-password/${id}`, { newPassword: newPass });
            toast.success("Password Updated Successfully.");
        } catch (err) { toast.error("Protocol Error."); }
    };

    const handleToggleStatus = async () => {
        const action = formData.isActive ? 'SUSPEND' : 'ACTIVATE';
        if (!window.confirm(`⚠️ Confirm: ${action} this Hub?`)) return;
        try {
            const res = await api.patch(`/admin/hierarchy/status/${id}`, { isActive: !formData.isActive });
            if (res.data.success) {
                setFormData(p => ({ ...p, isActive: !p.isActive }));
                toast.success(`Merchant hub status updated.`);
            }
        } catch (err) { toast.error("Status protocol failure."); }
    };

    const handlePurge = async () => {
        if (window.confirm("🚨 CRITICAL: Decommission merchant permanently?") && window.prompt("Type 'DELETE':") === 'DELETE') {
            try {
                await api.delete(`/admin/hierarchy/remove/${id}`);
                toast.error("Node purged successfully.");
                navigate('/admin/merchant-mgmt');
            } catch (err) { toast.error("Purge Protocol Failed."); }
        }
    };

    const handleDeviceAction = async (deviceId, currentAuth) => {
        try {
            await api.patch(`/admin/hierarchy/device-status/${id}`, { deviceId, authorized: !currentAuth });
            toast.success("Device access updated.");
            fetchEverything(true);
        } catch (err) { toast.error("Device Sync Failed."); }
    };

    // --- PRIVILEGES LOGIC ---
    const handleInstantPermissionToggle = async (permKey) => {
        const updatedPermissions = { ...formData.permissions, [permKey]: !formData.permissions[permKey] };
        setFormData(prev => ({ ...prev, permissions: updatedPermissions }));
        try {
            await api.put(`/admin/hierarchy/update/${id}`, { permissions: updatedPermissions });
            toast.success(`${permKey.toUpperCase()} updated.`);
        } catch (err) { toast.error("Sync Failed."); fetchEverything(true); }
    };

    const handleToggleAllPermissions = async () => {
        const keys = Object.keys(formData.permissions);
        const allActive = keys.every(k => formData.permissions[k]);
        const targetValue = !allActive;
        const updatedPermissions = {};
        keys.forEach(k => updatedPermissions[k] = targetValue);
        setFormData(prev => ({ ...prev, permissions: updatedPermissions }));
        try {
            await api.put(`/admin/hierarchy/update/${id}`, { permissions: updatedPermissions });
            toast.success(targetValue ? "ALL ACCESS GRANTED" : "ALL ACCESS REVOKED");
        } catch (err) { toast.error("Bulk sync failed."); fetchEverything(true); }
    };

    // 3. 📝 फॉर्म कंट्रोल
    const handleFieldChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = type === 'checkbox' ? checked : value;
        
        if (['panNumber', 'bankIfsc', 'gstNumber'].includes(name) && typeof finalValue === 'string') {
            finalValue = finalValue.toUpperCase();
        }
        
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleLocChange = (section, level, value) => {
        const pfx = section === 'shop' ? 'shop' : section;
        if (level === 'state') {
            const dists = locationData.find(s => s.state === value)?.districts || [];
            setDistricts(prev => ({ ...prev, [section]: dists }));
            setFormData(prev => ({ ...prev, [`${pfx}State`]: value, [`${pfx}District`]: '', [`${pfx}Block`]: '' }));
        } else if (level === 'district') {
            const blks = districts[section].find(d => d.name === value)?.blocks || [];
            setBlocks(prev => ({ ...prev, [section]: blks }));
            setFormData(prev => ({ ...prev, [`${pfx}District`]: value, [`${pfx}Block`]: '' }));
        }
    };

    const rotateImg = () => setImgRotation(prev => prev + 90);
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : 'N/A';

    if (loading && !formData) return <div style={loaderS}><div className="rkd-main-spinner"></div><p style={{marginTop:'15px', fontWeight:'900'}}>📡 SYNCING MERCHANT NODE...</p></div>;

    const themeColor = settings?.themeColor || '#0f172a';
    const permIcons = { orderManagement: '📦', inventoryControl: '🛒', staffCreation: '👥', payoutRequests: '💰', marketingTools: '🎨', supportAccess: '🎧' };
    const areAllPermsActive = formData?.permissions ? Object.keys(formData.permissions).every(k => formData.permissions[k]) : false;

    return (
        <div style={containerS}>
            {/* --- HEADER --- */}
            <div style={headerS}>
                <button onClick={() => navigate('/admin/merchant-mgmt')} style={backBtnS}>← REGISTRY INDEX</button>
                <div style={{flex: 1}}>
                    <h2 style={{margin:0, color: themeColor}}>🏪 MERCHANT: {formData?.shopDetails?.shopName || formData?.shopName}</h2>
                    <div style={statusRowS}>
                        <span style={dotS(formData?.isActive)}></span>
                        <span style={roleTagS}>{formData?.generatedId} • {formData?.shopType || formData?.shopDetails?.shopType} Hub</span>
                    </div>
                </div>
                <div style={actionGroupS}>
                    <button onClick={handlePasswordReset} style={secActionBtnS('#3b82f6')}>🔄 RESET PASSWORD</button>
                    <button onClick={handleToggleStatus} style={secActionBtnS(formData?.isActive ? '#f59e0b' : '#10b981')}>
                        {formData?.isActive ? '🚫 SUSPEND ACCESS' : '✅ ACTIVATE HUB'}
                    </button>
                    <button onClick={handlePurge} style={secActionBtnS('#ef4444')}>🗑️ PERMANENT DELETE</button>
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} style={primaryBtnS(themeColor)}>📝 EDIT HUB DATA</button>
                    ) : (
                        <button onClick={handleUpdate} style={saveBtnS}>💾 SAVE RECORDS</button>
                    )}
                </div>
            </div>

            {/* --- ANALYTICS --- */}
            <div style={metricsBarS}>
                <MetricCard label="Lifetime Orders" val={stats.orders} icon="📦" color="#3b82f6" />
                <MetricCard label="Hub Revenue" val={`₹${stats.revenue}`} icon="💰" color="#10b981" />
                <MetricCard label="Staff Strength" val={formData?.staffCount || 0} icon="👥" color="#8b5cf6" onClick={() => navigate('/admin/staff-registry')} />
                <MetricCard label="Compliance Status" val={formData?.isActive ? 'Active' : 'Locked'} icon="🛡️" color={formData?.isActive ? '#10b981' : '#ef4444'} />
            </div>

            <div style={mainGridS}>
                {/* --- LEFT COL --- */}
                <div style={colS}>
                    <Section title="🏪 BUSINESS IDENTITY" color="#3498db">
                        <div style={grid2}>
                            <Input label="Registered Shop Name" name="shopName" val={formData?.shopName || formData?.shopDetails?.shopName} edit={isEditing} onChange={handleFieldChange} />
                            <Input label="Business Type" name="shopType" val={formData?.shopType || formData?.shopDetails?.shopType} edit={isEditing} type="select" options={shopTypes.map(t=>t.name)} onChange={handleFieldChange} />
                            <Input label="GSTIN Identity" name="gstNumber" val={formData?.gstNumber?.toUpperCase()} edit={isEditing} onChange={handleFieldChange} />
                            <Input label="Merchant Email" val={formData?.email || formData?.primaryEmail} />
                        </div>
                    </Section>

                    <Section title="👤 PROPRIETOR IDENTITY" color={themeColor}>
                        <div style={profileHeadS}>
                            <div style={{position:'relative', cursor:'zoom-in'}} onClick={() => !isEditing && setViewImage(formData?.ownerPhoto)}>
                                <img src={formData?.ownerPhoto || 'https://via.placeholder.com/150'} style={avatarS} alt="P" />
                                {isEditing && <input type="file" onChange={(e)=>{const reader = new FileReader(); reader.readAsDataURL(e.target.files[0]); reader.onloadend = () => setFormData(p=>({...p, ownerPhoto: reader.result}));}} style={fileOverlayS} />}
                            </div>
                            <div style={{flex:1}}>
                                <Input label="Full Legal Name" name="fullName" val={formData?.fullName} edit={isEditing} onChange={handleFieldChange} />
                                <div style={grid2}>
                                    <Input label="Mobile" val={formData?.mobile} />
                                    <Input label="WhatsApp Node" name="whatsapp" val={formData?.whatsapp} edit={isEditing} onChange={handleFieldChange} />
                                </div>
                            </div>
                        </div>
                        <div style={grid2}>
                            <Input label="Father's Name" name="fatherName" val={formData?.fatherName} edit={isEditing} onChange={handleFieldChange} />
                            <Input label="DOB" name="dob" val={isEditing ? formData?.dob?.split('T')[0] : formatDate(formData?.dob)} edit={isEditing} type={isEditing ? "date" : "text"} onChange={handleFieldChange} />
                            <Input label="Gender" name="gender" val={formData?.gender} edit={isEditing} type="select" options={['Male','Female','Transgender']} onChange={handleFieldChange} />
                        </div>
                    </Section>

                    <Section title="📑 STATUTORY & KYC" color="#e74c3c">
                        <div style={grid2}>
                            <Input label="Aadhaar UID" name="aadharNumber" val={formData?.aadharNumber} edit={isEditing} onChange={handleFieldChange} />
                            <Input label="PAN Tax Identity" name="panNumber" val={formData?.panNumber?.toUpperCase()} edit={isEditing} onChange={handleFieldChange} />
                        </div>
                    </Section>

                    <Section title="💳 SETTLEMENT BANKING" color="#27ae60">
                        <div style={grid2}>
                            <Input label="Bank Partner" name="bankName" val={formData?.bankName} edit={isEditing} type="select" options={banks.map(b=>b.name)} onChange={handleFieldChange} />
                            <Input label="IFSC Code" name="bankIfsc" val={formData?.bankIfsc?.toUpperCase()} edit={isEditing} onChange={handleFieldChange} />
                            <Input label="Account Number" name="bankAcc" val={formData?.bankAcc} edit={isEditing} onChange={handleFieldChange} />
                        </div>
                    </Section>
                </div>

                {/* --- RIGHT COL --- */}
                <div style={colS}>
                    <Section title="🏠 MULTI-LAYER ADDRESS HUB" color="#e67e22">
                        <AddressBox label="SHOP Hub" prefix="shop" data={formData} edit={isEditing} locationData={locationData} districts={districts.shop} blocks={blocks.shop} onLocChange={handleLocChange} onFieldChange={handleFieldChange} />
                        <AddressBox label="PERMANENT Home" prefix="p" data={formData} edit={isEditing} locationData={locationData} districts={districts.p} blocks={blocks.p} onLocChange={handleLocChange} onFieldChange={handleFieldChange} />
                        {!formData?.isSameAsPermanent && (
                            <AddressBox label="CORRESPONDENCE" prefix="t" data={formData} edit={isEditing} locationData={locationData} districts={districts.t} blocks={blocks.t} onLocChange={handleLocChange} onFieldChange={handleFieldChange} />
                        )}
                    </Section>

                    <Section title="🔑 HUB PRIVILEGES" color="#8e44ad">
                        <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'10px'}}>
                            <button onClick={handleToggleAllPermissions} style={masterToggleBtnS(areAllPermsActive)}>
                                {areAllPermsActive ? '⛔ REVOKE ALL' : '🔓 GRANT ALL'}
                            </button>
                        </div>
                        <div style={permGridS}>
                            {formData?.permissions && Object.keys(formData.permissions).map(p => (
                                <div key={p} onClick={() => handleInstantPermissionToggle(p)} style={permNodeS(formData.permissions[p])}>
                                    <span style={{fontSize:'18px'}}>{formData.permissions[p] ? '🔓' : '🔒'}</span>
                                    <div style={{flex:1}}>
                                        <div style={{fontSize:'9px', fontWeight:'900'}}>{permIcons[p] || '🛡️'} {p.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
                                        <div style={{fontSize:'7px', color: formData.permissions[p] ? '#10b981' : '#f43f5e', fontWeight:'800'}}>{formData.permissions[p] ? 'GRANTED' : 'LOCKED'}</div>
                                    </div>
                                    <div style={checkBallS(formData.permissions[p])}></div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section title="📱 DEVICE SECURITY" color="#64748b">
                        {formData?.authorizedDevices?.length > 0 ? formData.authorizedDevices.map((d, i) => (
                            <div key={i} style={listItemS}>
                                <div style={{flex:1}}><div style={listTitleS}>{d.deviceName}</div><div style={listSubS}>{d.ip} • Last: {formatDate(d.lastLogin)}</div></div>
                                <button onClick={()=>handleDeviceAction(d.deviceId, d.isAuthorized)} style={d.isAuthorized ? revokeBtnS : allowBtnS}>
                                    {d.isAuthorized ? 'REVOKE' : 'AUTHORIZE'}
                                </button>
                            </div>
                        )) : <div style={emptyS}>No devices bound yet.</div>}
                    </Section>

                    <Section title="📝 INTERNAL AUDIT NOTES" color="#94a3b8">
                        <textarea style={notesInS} placeholder="Add private notes about this hub..." value={internalNotes} onChange={(e)=>setInternalNotes(e.target.value)} />
                    </Section>

                    <Section title="📜 ACTIVITY AUDIT LOGS" color="#000">
                        <div style={logBoxS}>
                            {logs.slice(0, 5).map((l, i) => (
                                <div key={i} style={logItemS}>
                                    <span>{formatDate(l.timestamp)}</span>
                                    <b style={{flex:1}}>{l.action}</b>
                                    <code>{l.ipAddress}</code>
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>
            </div>

            {/* --- DOCUMENTS --- */}
            <Section title="📂 SECURITY DOCUMENT VAULT" color="#000">
                <div style={docVaultGridS}>
                    <DocPreview label="Shop Interior" file={formData?.shopPhotoIn} onUpdate={(e)=>setFormData(prev => ({ ...prev, shopPhotoIn: e }))} edit={isEditing} onZoom={()=>setViewImage(formData?.shopPhotoIn)} />
                    <DocPreview label="Shop Exterior" file={formData?.shopPhotoOut} onUpdate={(e)=>setFormData(prev => ({ ...prev, shopPhotoOut: e }))} edit={isEditing} onZoom={()=>setViewImage(formData?.shopPhotoOut)} />
                    <DocPreview label="Aadhaar Scan" file={formData?.aadharFile} onUpdate={(e)=>setFormData(prev => ({ ...prev, aadharFile: e }))} edit={isEditing} onZoom={()=>setViewImage(formData?.aadharFile)} />
                    <DocPreview label="PAN Identity" file={formData?.panFile} onUpdate={(e)=>setFormData(prev => ({ ...prev, panFile: e }))} edit={isEditing} onZoom={()=>setViewImage(formData?.panFile)} />
                    <DocPreview label="Bank Evidence" file={formData?.bankFile} onUpdate={(e)=>setFormData(prev => ({ ...prev, bankFile: e }))} edit={isEditing} onZoom={()=>setViewImage(formData?.bankFile)} />
                </div>
            </Section>

            {/* --- MASTER IMAGE MODAL WITH ROTATION --- */}
            {viewImage && (
                <div style={modalOverlayS} onClick={() => { setViewImage(null); setImgRotation(0); }}>
                    <div style={modalContentS} onClick={(e)=>e.stopPropagation()}>
                        <div style={modalToolbarS}>
                            <button onClick={rotateImg} style={rotateBtnS}>🔄 ROTATE 90°</button>
                            <button onClick={() => { setViewImage(null); setImgRotation(0); }} style={closeModalS}>CLOSE (X)</button>
                        </div>
                        {viewImage.startsWith('data:application/pdf') ? <iframe src={viewImage} style={{width:'85vw', height:'80vh', border:'none'}} title="v" /> : <img src={viewImage} style={{...imgLargeS, transform:`rotate(${imgRotation}deg)`}} alt="z" />}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Helper UI Components ---
const masterToggleBtnS = (active) => ({ background: active ? '#fff1f2' : '#f0fdf4', color: active ? '#f43f5e' : '#16a34a', border: active ? '1.5px solid #fecaca' : '1.5px solid #bbf7d0', padding: '6px 12px', borderRadius: '8px', fontSize: '9px', fontWeight: '900', cursor: 'pointer' });
const Section = ({ title, color, children }) => (<div style={{background:'#fff', borderRadius:'25px', padding:'25px', borderLeft:`8px solid ${color}`, boxShadow:'0 5px 20px rgba(0,0,0,0.02)', marginBottom:'20px', borderRight:'1px solid #f1f5f9', borderBottom:'1px solid #f1f5f9'}}><h3 style={{fontSize:'11px', fontWeight:'900', color:'#1e293b', marginBottom:'15px'}}>{title}</h3>{children}</div>);
const Input = ({ label, name, val, edit, type, onChange, options }) => (<div style={{marginBottom:'12px'}}><label style={labS}>{label}</label>{edit ? (type === 'select' ? (<select name={name} style={inS} value={val || ''} onChange={onChange}><option value="">-- Select --</option>{options?.map(o => <option key={o} value={o}>{o}</option>)}</select>) : <input name={name} type={type||'text'} style={inS} value={val||''} onChange={onChange} />) : <p style={valS}>{val || 'N/A'}</p>}</div>);

// ✅ [CRITICAL FIX]: AddressBox Display logic fully standardized
const AddressBox = ({ label, prefix, data, edit, locationData, districts, blocks, onLocChange, onFieldChange }) => {
    const pfx = prefix === 'shop' ? 'shop' : prefix;
    
    // डेटा को सुरक्षित तरीके से प्राप्त करना (Root fields और Backend optimized fields)
    const state = data[`${pfx}State`] || "---";
    const district = data[`${pfx}District`] || "---";
    const block = data[`${pfx}Block`] || "---";
    const pin = data[`${pfx}Pin`] || "000000";
    const fullAddress = data[`${pfx}FullAddress`] || data[`${pfx}FullAddr`] || "Address Not Discovered";

    return (
        <div style={addrCardS}>
            <label style={labS}>{label} LOCATION</label>
            {edit ? (
                <div style={{marginTop:'8px'}}>
                    <div style={grid2}>
                        <select style={inS} value={data[`${pfx}State`] || ''} onChange={(e)=>onLocChange(prefix, 'state', e.target.value)}>
                            <option value="">State</option>{locationData.map(l => <option key={l.state} value={l.state}>{l.state}</option>)}
                        </select>
                        <select style={inS} value={data[`${pfx}District`] || ''} onChange={(e)=>onLocChange(prefix, 'district', e.target.value)}>
                            <option value="">Dist</option>{districts?.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                        </select>
                    </div>
                    <div style={{...grid2, marginTop:'8px'}}>
                        <select style={inS} value={data[`${pfx}Block`] || ''} name={`${pfx}Block`} onChange={onFieldChange}>
                            <option value="">Block</option>{blocks?.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <input name={`${pfx}Pin`} placeholder="Pin" style={inS} value={data[`${pfx}Pin`] || ''} onChange={onFieldChange} />
                    </div>
                    <textarea name={`${pfx}FullAddress`} style={{...inS, marginTop:'8px', height:'40px'}} value={data[`${pfx}FullAddress`] || ''} onChange={onFieldChange} placeholder="Full Address"/>
                </div>
            ) : (
                /* ✅ [FIXED]: Display Layout for All Adress Nodes */
                <p style={valS}>
                    {fullAddress}, {block}, {district}, {state} - <b>{pin}</b>
                </p>
            )}
        </div>
    );
};

const MetricCard = ({ label, val, icon, color, onClick }) => (<div onClick={onClick} style={{background:'#fff', padding:'20px', borderRadius:'15px', display:'flex', alignItems:'center', gap:'12px', border:'1px solid #f1f5f9', flex:1, cursor: onClick?'pointer':'default'}}><div style={{width:'40px', height:'40px', borderRadius:'12px', background:`${color}15`, color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'}}>{icon}</div><div><div style={{fontSize:'14px', fontWeight:'900'}}>{val}</div><div style={{fontSize:'9px', color:'#94a3b8', textTransform:'uppercase'}}>{label}</div></div></div>);
const DocPreview = ({ label, file, edit, onUpdate, onZoom }) => (<div style={docCardS}><label style={labS}>{label}</label><div style={docFrameS} onClick={onZoom}>{file ? <img src={file} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="doc" /> : "MISSING"}</div>{edit && <input type="file" onChange={(e)=>{const reader = new FileReader(); reader.readAsDataURL(e.target.files[0]); reader.onloadend = () => onUpdate(reader.result);}} style={{fontSize:'9px', marginTop:'5px', width:'100%'}} />}</div>);

// --- CSS STYLES ---
const containerS = { padding:'25px', background:'#f1f5f9', minHeight:'100vh', fontFamily:"'Plus Jakarta Sans', sans-serif" };
const headerS = { display:'flex', alignItems:'center', gap:'15px', background:'#fff', padding:'20px', borderRadius:'25px', marginBottom:'25px', boxShadow:'0 10px 40px rgba(0,0,0,0.03)', flexWrap:'wrap' };
const avatarS = { width:'80px', height:'80px', borderRadius:'20px', objectFit:'cover', border:'3px solid #f1f5f9' };
const metricsBarS = { display:'flex', gap:'15px', marginBottom:'25px', flexWrap:'wrap' };
const mainGridS = { display:'grid', gridTemplateColumns: window.innerWidth < 1100 ? '1fr' : '1.2fr 1fr', gap:'25px' };
const colS = { display:'flex', flexDirection:'column' };
const grid2 = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px' };
const profileHeadS = { display:'flex', gap:'20px', marginBottom:'20px', alignItems:'center', flexWrap:'wrap' };
const inS = { width:'100%', padding:'10px', borderRadius:'10px', border:'1px solid #e2e8f0', outline:'none', fontWeight:'700', fontSize:'12px', background:'#fcfdfe' };
const labS = { fontSize:'9px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase', display:'block', marginBottom:'3px' };
const valS = { margin:0, fontWeight:'700', fontSize:'13px', color:'#1e293b', lineHeight:'1.5' };
const docCardS = { background:'#f8fafc', padding:'12px', borderRadius:'15px', border:'1.5px dashed #ddd', flex:1, marginBottom:'10px' };
const docFrameS = { height:'110px', background:'#eee', borderRadius:'10px', overflow:'hidden', marginTop:'8px', cursor:'zoom-in', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'800' };
const docVaultGridS = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'15px', marginTop:'10px' };
const permGridS = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'10px' };
const permNodeS = (a) => ({ display:'flex', alignItems:'center', gap:'12px', padding:'12px', borderRadius:'15px', border:'1.5px solid', borderColor: a ? '#10b981' : '#e2e8f0', background: a ? '#ecfdf5' : '#fff', cursor:'pointer' });
const checkBallS = (a) => ({ width:'8px', height:'8px', borderRadius:'50%', background: a ? '#10b981' : '#cbd5e1' });
const listItemS = { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px', background:'#f8fafc', borderRadius:'15px', border:'1px solid #f1f5f9', marginBottom:'8px' };
const revokeBtnS = { background:'#fee2e2', color:'#ef4444', border:'none', padding:'6px 12px', borderRadius:'8px', fontSize:'9px', fontWeight:'900', cursor:'pointer' };
const allowBtnS = { background:'#dcfce7', color:'#10b981', border:'none', padding:'6px 12px', borderRadius:'8px', fontSize:'9px', fontWeight:'900', cursor:'pointer' };
const logBoxS = { maxHeight:'180px', overflowY:'auto' };
const logItemS = { display:'flex', justifyContent:'space-between', fontSize:'10px', padding:'8px', background:'#f8fafc', borderRadius:'10px', marginBottom:'5px' };
const loaderS = { height:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontWeight:'900', color:'#94a3b8' };
const backBtnS = { background:'#f8fafc', border:'1px solid #e2e8f0', padding:'10px 15px', borderRadius:'12px', fontWeight:'900', cursor:'pointer', fontSize:'10px' };
const primaryBtnS = (c) => ({ background:c, color:'#fff', border:'none', padding:'10px 20px', borderRadius:'12px', fontWeight:'900', cursor:'pointer', fontSize:'11px' });
const saveBtnS = { background:'#10b981', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'12px', fontWeight:'900', cursor:'pointer', fontSize:'11px' };
const secActionBtnS = (c) => ({ background:'#fff', color:c, border:`1.2px solid ${c}`, padding:'10px 18px', borderRadius:'14px', fontSize:'9px', fontWeight:'900', cursor:'pointer' });
const statusRowS = { display:'flex', alignItems:'center', gap:'6px' };
const dotS = (a) => ({ width:'10px', height:'10px', borderRadius:'50%', background: a ? '#10b981' : '#ef4444' });
const roleTagS = { fontSize:'10px', fontWeight:'900', color:'#64748b' };
const actionGroupS = { display:'flex', gap:'8px', flexWrap:'wrap' };
const addrCardS = { background:'#f8fafc', padding:'15px', borderRadius:'15px', border:'1px solid #f1f5f9', marginBottom:'15px' };
const modalOverlayS = { position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.9)', zIndex:10000, display:'flex', alignItems:'center', justifyContent:'center' };
const modalContentS = { textAlign:'center', position:'relative' };
const modalToolbarS = { position:'absolute', top:'-50px', right:0, display:'flex', gap:'15px' };
const rotateBtnS = { background:'#3b82f6', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer', fontWeight:'900', fontSize:'10px' };
const closeModalS = { background:'#ef4444', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer', fontWeight:'900', fontSize:'10px' };
const imgLargeS = { maxWidth:'90vw', maxHeight:'80vh', borderRadius:'10px', transition:'0.3s' };
const fileOverlayS = { position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0, cursor:'pointer' };
const notesInS = { width:'100%', height:'80px', padding:'15px', borderRadius:'15px', border:'1.5px solid #e2e8f0', outline:'none', fontSize:'12px', fontWeight:'600', color:'#475569' };
const emptyS = { fontSize:'11px', color:'#cbd5e1', textAlign:'center', padding:'10px' };
const listTitleS = { fontSize:'12px', fontWeight:'800' };
const listSubS = { fontSize:'9px', color:'#94a3b8' };

export default ShopOwnerDetails;