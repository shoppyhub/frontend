import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../../services/api'; 
import { useBranding } from '../../../../context/BrandingContext';

const SubAdminDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useBranding();
    
    // --- Core States ---
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);
    const [logs, setLogs] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({ approved: 0, rejected: 0, uptime: '100%' });
    const [internalNotes, setInternalNotes] = useState("");
    const [viewImage, setViewImage] = useState(null);

    // Directory States
    const [locationData, setLocationData] = useState([]);
    const [banks, setBanks] = useState([]);
    const [districts, setDistricts] = useState({ p: [], t: [], o: [] });
    const [blocks, setBlocks] = useState({ p: [], t: [], o: [] });

    const isFetching = useRef(false);

    // 1. 📡 डेटा सिंक्रोनाइज़ेशन
    const fetchEverything = useCallback(async (isSilent = false) => {
        if (isFetching.current) return;
        try {
            if (!isSilent) setLoading(true);
            isFetching.current = true;

            const [detailsRes, bankRes, locRes] = await Promise.all([
                api.get(`/admin/hierarchy/details/${id}`, { timeout: 120000 }),
                api.get('/admin/directories/banks'),
                api.get('/admin/directories/locations')
            ]);

            if (detailsRes.data.success) {
                const master = detailsRes.data.data;
                setFormData(master);
                setInternalNotes(master.internalNotes || "");
                setBanks(bankRes.data.data || []);
                const locs = locRes.data.data || [];
                setLocationData(locs);
                
                const getDists = (sName) => locs.find(s => s.state === sName)?.districts || [];
                const getBlks = (sName, dName) => getDists(sName).find(d => d.name === dName)?.blocks || [];

                setDistricts({
                    p: getDists(master.pState),
                    t: getDists(master.tState),
                    o: getDists(master.officeState)
                });
                setBlocks({
                    p: getBlks(master.pState, master.pDistrict),
                    t: getBlks(master.tState, master.tDistrict),
                    o: getBlks(master.officeState, master.officeDistrict)
                });
                
                setLoading(false);
                fetchSecondaryData();
            }
        } catch (err) {
            toast.error("Handshake failed. Backend too slow.");
        } finally {
            isFetching.current = false;
            setLoading(false);
        }
    }, [id]);

    const fetchSecondaryData = async () => {
        Promise.allSettled([
            api.get(`/admin/hierarchy/logs/${id}`),
            api.get(`/admin/hierarchy/tasks/${id}`),
            api.get(`/admin/hierarchy/performance/${id}`)
        ]).then(([l, t, s]) => {
            if (l.status === 'fulfilled') setLogs(l.value.data.data || []);
            if (t.status === 'fulfilled') setTasks(t.value.data.data || []);
            if (s.status === 'fulfilled') setStats(s.value.data.data || { approved: 0, rejected: 0, uptime: '99%' });
        });
    };

    useEffect(() => { fetchEverything(); }, [fetchEverything]);

    // 2. 🛡️ प्रशासनिक कमांड्स
    const handleUpdate = async () => {
        try {
            setLoading(true);
            const res = await api.put(`/admin/hierarchy/update/${id}`, { ...formData, internalNotes }, { timeout: 300000 });
            if (res.data.success) {
                toast.success("Identity Records Synchronized.");
                setIsEditing(false);
                fetchEverything(true);
            }
        } catch (err) { toast.error("Sync Failure."); }
        finally { setLoading(false); }
    };

    const handlePasswordReset = async () => {
        const newPass = window.prompt("SECURITY: Enter new Master Key:");
        if (!newPass) return;
        try {
            const res = await api.put(`/admin/users/reset-password/${id}`, { newPassword: newPass });
            if (res.data.success) toast.success("Security Key Rotated.");
            else toast.error("Reset failed.");
        } catch (err) { toast.error("API Protocol failure."); }
    };

    const handleToggleStatus = async () => {
        const action = formData.isActive ? 'SUSPEND' : 'ACTIVATE';
        if (!window.confirm(`Protocol: Confirm ${action}?`)) return;
        try {
            const res = await api.patch(`/admin/hierarchy/status/${id}`, { isActive: !formData.isActive });
            if (res.data.success) {
                setFormData(p => ({ ...p, isActive: !p.isActive }));
                toast.success(`Node successfully ${action}ED.`);
            }
        } catch (err) { toast.error("Status update failure."); }
    };

    const handlePurge = async () => {
        if (window.confirm("🚨 CRITICAL: Decommission node permanently?") && window.prompt("Type 'DELETE':") === 'DELETE') {
            try {
                await api.delete(`/admin/hierarchy/remove/${id}`);
                toast.error("Node successfully decommissioned.");
                navigate('/admin/subadmins');
            } catch (err) { toast.error("Purge Protocol Failed."); }
        }
    };

    const handleInstantPermissionToggle = async (permKey) => {
        const updatedPermissions = {
            ...formData.permissions,
            [permKey]: !formData.permissions[permKey]
        };
        setFormData(prev => ({ ...prev, permissions: updatedPermissions }));
        try {
            const res = await api.put(`/admin/hierarchy/update/${id}`, { permissions: updatedPermissions });
            if (res.data.success) toast.success(`${permKey} access modified.`);
        } catch (err) {
            toast.error("Permission sync failed.");
            fetchEverything(true);
        }
    };

    const handleDeviceAction = async (deviceId, currentAuth) => {
        try {
            await api.patch(`/admin/hierarchy/device-status/${id}`, { deviceId, authorized: !currentAuth });
            toast.success("Device access updated.");
            fetchEverything(true);
        } catch (err) { toast.error("Device Sync Failed."); }
    };

    // 3. 📝 एडिटिंग लॉजिक
    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) return toast.error("Security: File exceeds 1MB.");
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result }));
        }
    };

    const handleLocChange = (section, level, value) => {
        const pfx = section === 'p' ? 'p' : section === 't' ? 't' : 'office';
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

    const formatDate = (d) => {
        if (!d) return 'N/A';
        const date = new Date(d);
        return isNaN(date.getTime()) ? d : date.toLocaleDateString('en-GB'); 
    };

    if (loading && !formData) return <div style={loaderS}><div className="rkd-main-spinner"></div><p style={{marginTop:'15px', fontWeight:'900'}}>📡 LINKING TO INFRASTRUCTURE...</p></div>;

    const themeColor = settings?.themeColor || '#0f172a';
    const permIcons = { coreOperations: '📊', hierarchyControl: '🛡️', globalInventory: '🛒', governance: '⚖️', configuration: '⚙️', infrastructure: '🖥️' };

    return (
        <div style={containerS}>
            {/* --- HEADER --- */}
            <div style={headerS}>
                <button onClick={() => navigate('/admin/subadmins')} style={backBtnS}>← REGISTRY INDEX</button>
                <div style={{flex: 1, minWidth:'250px'}}>
                    <h2 style={{margin:0, color: themeColor}}>🛡️ NODE: {formData?.generatedId}</h2>
                    <div style={statusRowS}>
                        <span style={dotS(formData?.isActive)}></span>
                        <span style={roleTagS}>{formData?.role} UNIT • {formData?.department}</span>
                    </div>
                </div>
                <div style={actionGroupS}>
                    <button onClick={handlePasswordReset} style={secActionBtnS('#3b82f6')}>🔑 RESET PASS</button>
                    <button onClick={handleToggleStatus} style={secActionBtnS(formData?.isActive ? '#f59e0b' : '#10b981')}>
                        {formData?.isActive ? '🚫 SUSPEND' : '✅ ACTIVATE'}
                    </button>
                    <button onClick={handlePurge} style={secActionBtnS('#ef4444')}>🗑️ PURGE NODE</button>
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} style={primaryBtnS(themeColor)}>MODIFY RECORDS</button>
                    ) : (
                        <button onClick={handleUpdate} style={saveBtnS}>SAVE CHANGES</button>
                    )}
                </div>
            </div>

            {/* --- METRICS --- */}
            <div style={metricsBarS}>
                <MetricCard label="Approvals" val={stats.approved} icon="✅" color="#10b981" onClick={() => navigate('/admin/requests')} />
                <MetricCard label="Rejections" val={stats.rejected} icon="❌" color="#f43f5e" onClick={() => navigate('/admin/requests')} />
                <MetricCard label="Pending Tasks" val={tasks.length} icon="📋" color="#3b82f6" onClick={() => navigate('/admin/registration-queue')} />
                <MetricCard label="Health Index" val={stats.uptime} icon="⚡" color="#f59e0b" />
            </div>

            <div style={mainGridS}>
                {/* --- LEFT COL --- */}
                <div style={colS}>
                    <Section title="👤 PERSONNEL IDENTITY" color={themeColor}>
                        <div style={profileHeadS}>
                            <div style={{position:'relative', cursor:'zoom-in'}} onClick={() => !isEditing && setViewImage(formData?.adminPhoto)}>
                                <img src={formData?.adminPhoto || 'https://via.placeholder.com/150'} style={avatarS} alt="Admin" />
                                {isEditing && <input type="file" onChange={(e)=>handleFileChange(e, 'adminPhoto')} style={fileOverlayS} />}
                            </div>
                            <div style={{flex:1}}>
                                <Input label="Full Name" name="fullName" val={formData?.fullName} edit={isEditing} onChange={handleFieldChange} />
                                <div style={grid2}>
                                    <Input label="Mobile" val={formData?.mobile} />
                                    <Input label="WhatsApp" name="whatsapp" val={formData?.whatsapp} edit={isEditing} onChange={handleFieldChange} />
                                </div>
                            </div>
                        </div>
                        <div style={grid2}>
                            <Input label="Father's Name" name="fatherName" val={formData?.fatherName} edit={isEditing} onChange={handleFieldChange} />
                            <Input label="DOB" name="dob" val={isEditing ? formData?.dob?.split('T')[0] : formatDate(formData?.dob)} edit={isEditing} type={isEditing ? "date" : "text"} onChange={handleFieldChange} />
                            <Input label="Official Email" val={formData?.primaryEmail} />
                            <Input label="Gender" name="gender" val={formData?.gender} edit={isEditing} type="select" options={['Male','Female','Transgender']} onChange={handleFieldChange} />
                        </div>
                        <div style={subBorderS}>
                            <label style={subLabS}>EMERGENCY PROTOCOL</label>
                            <div style={grid2}>
                                <Input label="Contact Name" name="emergencyContactName" val={formData?.emergencyContactName} edit={isEditing} onChange={handleFieldChange} />
                                <Input label="Contact Mobile" name="emergencyContactNumber" val={formData?.emergencyContactNumber} edit={isEditing} onChange={handleFieldChange} />
                            </div>
                        </div>
                    </Section>

                    <Section title="📑 STATUTORY KYC & PROFESSIONAL" color="#e74c3c">
                        <div style={grid2}>
                            <Input label="Aadhaar UID" name="aadharNumber" val={formData?.aadharNumber} edit={isEditing} onChange={handleFieldChange} />
                            <Input label="PAN Identity" name="panNumber" val={formData?.panNumber} edit={isEditing} onChange={handleFieldChange} />
                        </div>
                        <div style={{...grid2, marginTop:'15px'}}>
                            <Input label="Qualification" name="qualification" val={formData?.qualification} edit={isEditing} type="select" options={['High School','Intermediate','Graduate','Post-Graduate','Doctorate']} onChange={handleFieldChange} />
                            <Input label="Exp (Yrs)" name="experienceYears" val={formData?.experienceYears} edit={isEditing} onChange={handleFieldChange} />
                        </div>
                        <Input label="Previous Org" name="previousOrg" val={formData?.previousOrg} edit={isEditing} onChange={handleFieldChange} />
                    </Section>

                    <Section title="💳 FINANCIAL HUB" color="#27ae60">
                        <div style={grid2}>
                            <Input label="Bank Partner" name="bankName" val={formData?.bankName} edit={isEditing} type="select" options={banks.map(b=>b.name)} onChange={handleFieldChange} />
                            <Input label="IFSC Code" name="bankIfsc" val={formData?.bankIfsc} edit={isEditing} onChange={handleFieldChange} />
                            <Input label="Account No" name="bankAcc" val={formData?.bankAcc} edit={isEditing} onChange={handleFieldChange} />
                        </div>
                    </Section>
                </div>

                {/* --- RIGHT COL --- */}
                <div style={colS}>
                    <Section title="🏠 ADDRESS HUB (3-LAYER)" color="#e67e22">
                        <AddressEdit label="PERMANENT" prefix="p" data={formData} edit={isEditing} locationData={locationData} districts={districts.p} blocks={blocks.p} onLocChange={handleLocChange} onFieldChange={handleFieldChange} />
                        <AddressEdit label="PRESENT (TEMP)" prefix="t" data={formData} edit={isEditing} locationData={locationData} districts={districts.t} blocks={blocks.t} onLocChange={handleLocChange} onFieldChange={handleFieldChange} />
                        <AddressEdit label="OFFICIAL OFFICE" prefix="office" data={formData} edit={isEditing} locationData={locationData} districts={districts.o} blocks={blocks.o} onLocChange={handleLocChange} onFieldChange={handleFieldChange} />
                    </Section>

                    <Section title="🔑 GOVERNANCE PRIVILEGES" color="#8e44ad">
                        <div style={permGridS}>
                            {formData?.permissions && Object.keys(formData.permissions).map(p => (
                                <div key={p} onClick={() => handleInstantPermissionToggle(p)} style={permNodeS(formData.permissions[p])}>
                                    <span style={{fontSize:'20px'}}>{formData.permissions[p] ? '🔓' : '🔒'}</span>
                                    <div style={{flex:1}}>
                                        <div style={{fontSize:'10px', fontWeight:'900'}}>{permIcons[p]} {p.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
                                        <div style={{fontSize:'8px', color: formData.permissions[p] ? '#10b981' : '#f43f5e', fontWeight:'700'}}>{formData.permissions[p] ? 'ACCESS GRANTED' : 'ACCESS LOCKED'}</div>
                                    </div>
                                    <div style={checkBallS(formData.permissions[p])}></div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section title="📱 LOGIN DEVICE MANAGEMENT" color="#64748b">
                        {formData?.authorizedDevices?.length > 0 ? formData.authorizedDevices.map((d, i) => (
                            <div key={i} style={listItemS}>
                                <div style={{flex:1}}><div style={listTitleS}>{d.deviceName}</div><div style={listSubS}>{d.ip} • Last: {formatDate(d.lastLogin)}</div></div>
                                <button onClick={()=>handleDeviceAction(d.deviceId, d.isAuthorized)} style={d.isAuthorized ? revokeBtnS : allowBtnS}>
                                    {d.isAuthorized ? 'REVOKE' : 'AUTHORIZE'}
                                </button>
                            </div>
                        )) : <div style={emptyS}>No devices bound yet.</div>}
                    </Section>

                    <Section title="📝 PRIVATE SYSTEM NOTES" color="#94a3b8">
                        <textarea style={notesInS} placeholder="Admin notes (Internal)..." value={internalNotes} onChange={(e)=>setInternalNotes(e.target.value)} />
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

            {/* --- DOCUMENT VAULT --- */}
            <Section title="📂 SECURITY DOCUMENT VAULT (LIVE VIEW)" color="#000">
                <div style={docVaultGridS}>
                    <DocPreview label="Aadhaar Scan" file={formData?.aadharFile} onUpdate={(e)=>setFormData({...formData, aadharFile: e})} edit={isEditing} onZoom={()=>setViewImage(formData?.aadharFile)} />
                    <DocPreview label="PAN Identity" file={formData?.panFile} onUpdate={(e)=>setFormData({...formData, panFile: e})} edit={isEditing} onZoom={()=>setViewImage(formData?.panFile)} />
                    <DocPreview label="Qualification" file={formData?.qualificationFile} onUpdate={(e)=>setFormData({...formData, qualificationFile: e})} edit={isEditing} onZoom={()=>setViewImage(formData?.qualificationFile)} />
                    <DocPreview label="Bank Evidence" file={formData?.bankFile} onUpdate={(e)=>setFormData({...formData, bankFile: e})} edit={isEditing} onZoom={()=>setViewImage(formData?.bankFile)} />
                </div>
            </Section>

            {/* --- IMAGE MODAL --- */}
            {viewImage && (
                <div style={modalOverlayS} onClick={() => setViewImage(null)}>
                    <div style={modalContentS}>
                        <button style={closeModalS}>CLOSE (X)</button>
                        {viewImage.startsWith('data:application/pdf') ? <iframe src={viewImage} style={{width:'85vw', height:'85vh', border:'none'}} title="v" /> : <img src={viewImage} style={{maxWidth:'95vw', maxHeight:'85vh', borderRadius:'10px'}} alt="z" />}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Strategic Helper Components & Styles ---
const Section = ({ title, color, children }) => (
    <div style={{background:'#fff', borderRadius:'25px', padding:'25px', borderLeft:`8px solid ${color}`, boxShadow:'0 5px 20px rgba(0,0,0,0.02)', marginBottom:'20px', borderRight:'1px solid #f1f5f9', borderBottom:'1px solid #f1f5f9'}}>
        <h3 style={{fontSize:'11px', fontWeight:'900', color:'#1e293b', marginBottom:'15px'}}>{title}</h3>
        {children}
    </div>
);

const Input = ({ label, name, val, edit, type, onChange, options }) => (
    <div style={{marginBottom:'12px'}}>
        <label style={labS}>{label}</label>
        {edit ? (
            type === 'select' ? (
                <select name={name} style={inS} value={val || ''} onChange={onChange}>
                    <option value="">-- Select --</option>
                    {options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : <input name={name} type={type||'text'} style={inS} value={val||''} onChange={onChange} />
        ) : <p style={valS}>{val || 'N/A'}</p>}
    </div>
);

const AddressEdit = ({ label, prefix, data, edit, locationData, districts, blocks, onLocChange, onFieldChange }) => {
    const pfx = prefix === 'office' ? 'office' : prefix;
    return (
        <div style={addrCardS}>
            <label style={labS}>{label} LOCATION</label>
            {edit ? <div style={{marginTop:'8px'}}>
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
                <textarea name={`${pfx}FullAddress`} style={{...inS, marginTop:'8px', height:'40px'}} value={data[`${pfx}FullAddress`] || ''} onChange={onFieldChange} placeholder="Address Line"/>
            </div> : <p style={valS}>{data[`${pfx}FullAddress`]}, {data[`${pfx}Block`]}, {data[`${pfx}District`]}, {data[`${pfx}State`]} - {data[`${pfx}Pin`]}</p>}
        </div>
    );
};

const MetricCard = ({ label, val, icon, color, onClick }) => (
    <div onClick={onClick} style={{background:'#fff', padding:'20px', borderRadius:'15px', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', border:'1px solid #f1f5f9'}}>
        <div style={{width:'40px', height:'40px', borderRadius:'12px', background:`${color}15`, color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'}}>{icon}</div>
        <div><div style={{fontSize:'16px', fontWeight:'900'}}>{val}</div><div style={{fontSize:'9px', color:'#94a3b8', textTransform:'uppercase'}}>{label}</div></div>
    </div>
);

const DocPreview = ({ label, file, edit, onUpdate, onZoom }) => (
    <div style={docCardS}>
        <label style={labS}>{label}</label>
        <div style={docFrameS} onClick={onZoom}>
            {file ? (file.startsWith('data:application/pdf') || file.endsWith('.pdf') ? <div style={{fontSize:'25px'}}>📄 PDF</div> : <img src={file} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="doc" />) : "Missing"}
        </div>
        {edit && <input type="file" onChange={(e)=>{
            const reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.onloadend = () => onUpdate(reader.result);
        }} style={{fontSize:'9px', marginTop:'5px', width:'100%'}} />}
    </div>
);

// --- Strategic Styles Section (FIXED ALL ERRORS) ---
const containerS = { padding:'25px', background:'#f1f5f9', minHeight:'100vh', fontFamily:"'Plus Jakarta Sans', sans-serif" };
const headerS = { display:'flex', alignItems:'center', gap:'15px', background:'#fff', padding:'20px', borderRadius:'25px', marginBottom:'25px', boxShadow:'0 10px 40px rgba(0,0,0,0.03)', flexWrap:'wrap' };
const avatarS = { width:'80px', height:'80px', borderRadius:'20px', objectFit:'cover', border:'3px solid #f1f5f9' };
const metricsBarS = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'15px', marginBottom:'25px' };
const mainGridS = { display:'grid', gridTemplateColumns: window.innerWidth < 1100 ? '1fr' : '1.2fr 1fr', gap:'25px' };
const colS = { display:'flex', flexDirection:'column' };
const grid2 = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px' };
const profileHeadS = { display:'flex', gap:'20px', marginBottom:'20px', alignItems:'center', flexWrap:'wrap' };
const inS = { width:'100%', padding:'8px', borderRadius:'8px', border:'1px solid #e2e8f0', outline:'none', fontWeight:'700', fontSize:'12px', background:'#fcfdfe' };
const labS = { fontSize:'9px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase', display:'block', marginBottom:'3px' };
const valS = { margin:0, fontWeight:'700', fontSize:'13px', color:'#1e293b' };
const docCardS = { background:'#f8fafc', padding:'12px', borderRadius:'15px', border:'1.5px dashed #ddd', flex:1, marginBottom:'10px' };
const docFrameS = { height:'110px', background:'#eee', borderRadius:'10px', overflow:'hidden', marginTop:'8px', cursor:'zoom-in', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'800' };
const docVaultGridS = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'15px', marginTop:'10px' };
const permGridS = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'10px' };
const permNodeS = (a) => ({ display:'flex', alignItems:'center', gap:'12px', padding:'15px', borderRadius:'18px', border:'1.5px solid', borderColor: a ? '#10b981' : '#e2e8f0', background: a ? '#ecfdf5' : '#fff', cursor:'pointer', transition:'0.3s' });
const checkBallS = (a) => ({ width:'10px', height:'10px', borderRadius:'50%', background: a ? '#10b981' : '#cbd5e1' });
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
const subBorderS = { borderTop:'1px solid #f1f5f9', marginTop:'15px', paddingTop:'15px' };
const subLabS = { fontSize:'9px', fontWeight:'900', color: '#64748b', display:'block', marginBottom:'10px' };
const addrCardS = { background:'#f8fafc', padding:'15px', borderRadius:'15px', border:'1px solid #f1f5f9', marginBottom:'15px' };
const modalOverlayS = { position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.9)', zIndex:10000, display:'flex', alignItems:'center', justifyContent:'center' };
const modalContentS = { textAlign:'center', position:'relative' };
const closeModalS = { position:'absolute', top:'-40px', right:0, color:'#fff', background:'none', border:'none', cursor:'pointer', fontWeight:'900' };
const fileOverlayS = { position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0, cursor:'pointer' };
const notesInS = { width:'100%', height:'80px', padding:'15px', borderRadius:'15px', border:'1.5px solid #e2e8f0', outline:'none', fontSize:'12px', fontWeight:'600', color:'#475569' };
const emptyS = { fontSize:'11px', color:'#cbd5e1', textAlign:'center', padding:'10px' };
const listTitleS = { fontSize:'12px', fontWeight:'800' };
const listSubS = { fontSize:'9px', color:'#94a3b8' };

export default SubAdminDetails;