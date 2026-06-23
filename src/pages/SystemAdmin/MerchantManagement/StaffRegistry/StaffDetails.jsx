// src/pages/SystemAdmin/MerchantManagement/StaffRegistry/StaffDetails.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../../services/api'; 
import { useBranding } from '../../../../context/BrandingContext';

const StaffDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useBranding();
    
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);
    const [logs, setLogs] = useState([]);
    const [viewImage, setViewImage] = useState(null);
    const [locationData, setLocationData] = useState([]);
    const [banks, setBanks] = useState([]);
    
    const [districts, setDistricts] = useState({ p: [], t: [] });
    const [blocks, setBlocks] = useState({ p: [], t: [] });

    const fetchStaffData = useCallback(async () => {
        try {
            setLoading(true);
            const [detailsRes, locRes, bankRes, logsRes] = await Promise.all([
                api.get(`/admin/hierarchy/details/${id}`),
                api.get('/admin/directories/locations'),
                api.get('/admin/directories/banks'),
                api.get(`/admin/hierarchy/logs/${id}`)
            ]);

            if (detailsRes.data.success) {
                const master = detailsRes.data.data;
                setFormData(master);
                setLocationData(locRes.data.data || []);
                setBanks(bankRes.data.data || []);
                setLogs(logsRes.data.data || []);

                // Initialize Address Dropdowns
                const locs = locRes.data.data || [];
                const getDists = (sName) => locs.find(s => s.state === sName)?.districts || [];
                const getBlks = (sName, dName) => getDists(sName).find(d => d.name === dName)?.blocks || [];

                setDistricts({ p: getDists(master.pState), t: getDists(master.tState) });
                setBlocks({ p: getBlks(master.pState, master.pDistrict), t: getBlks(master.tState, master.tDistrict) });
            }
        } catch (err) {
            toast.error("Staff Node indexing failed.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchStaffData(); }, [fetchStaffData]);

    const handleUpdate = async () => {
        try {
            setLoading(true);
            const res = await api.put(`/admin/hierarchy/update/${id}`, formData);
            if (res.data.success) {
                toast.success("Staff profile updated.");
                setIsEditing(false);
                fetchStaffData();
            }
        } catch (err) { toast.error("Sync Failure."); }
        finally { setLoading(false); }
    };

    const handleToggleStatus = async () => {
        const action = formData.isActive ? 'SUSPEND' : 'ACTIVATE';
        if (!window.confirm(`Confirm ${action} for this staff?`)) return;
        try {
            await api.patch(`/admin/hierarchy/status/${id}`, { isActive: !formData.isActive });
            setFormData(p => ({ ...p, isActive: !p.isActive }));
            toast.success("Security status updated.");
        } catch (err) { toast.error("Status protocol failure."); }
    };

    const handlePasswordReset = async () => {
        const newPass = window.prompt("Enter New Password for Staff:");
        if (!newPass) return;
        try {
            await api.put(`/admin/users/reset-password/${id}`, { newPassword: newPass });
            toast.success("Password Updated.");
        } catch (err) { toast.error("Reset failed."); }
    };

    const handlePermissionToggle = async (permKey) => {
        const updatedPermissions = { ...formData.permissions, [permKey]: !formData.permissions[permKey] };
        setFormData(prev => ({ ...prev, permissions: updatedPermissions }));
        try {
            await api.put(`/admin/hierarchy/update/${id}`, { permissions: updatedPermissions });
            toast.success("Permission Synced.");
        } catch (err) { toast.error("Permission sync failed."); fetchStaffData(); }
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        let finalVal = value;
        if (['panNumber', 'bankIfsc'].includes(name)) finalVal = value.toUpperCase();
        setFormData(prev => ({ ...prev, [name]: finalVal }));
    };

    const handleLocChange = (section, level, value) => {
        if (level === 'state') {
            const dists = locationData.find(s => s.state === value)?.districts || [];
            setDistricts(prev => ({ ...prev, [section]: dists }));
            setFormData(prev => ({ ...prev, [`${section}State`]: value, [`${section}District`]: '', [`${section}Block`]: '' }));
        } else if (level === 'district') {
            const blks = districts[section].find(d => d.name === value)?.blocks || [];
            setBlocks(prev => ({ ...prev, [section]: blks }));
            setFormData(prev => ({ ...prev, [`${section}District`]: value, [`${section}Block`]: '' }));
        }
    };

    if (loading && !formData) return <div style={loaderS}>📡 SYNCING STAFF NODE...</div>;

    const themeColor = settings?.themeColor || '#0f172a';

    return (
        <div style={containerS}>
            {/* --- HEADER --- */}
            <div style={headerS}>
                <button onClick={() => navigate(-1)} style={backBtnS}>← BACK</button>
                <div style={{flex: 1}}>
                    <h2 style={{margin:0, color: themeColor}}>👥 STAFF: {formData?.fullName}</h2>
                    <p style={subTextS}>{formData?.generatedId} • Assigned to Hub ID: {formData?.shopId || 'N/A'}</p>
                </div>
                <div style={actionRowS}>
                    <button onClick={handlePasswordReset} style={secBtnS}>🔐 RESET PASS</button>
                    <button onClick={handleToggleStatus} style={formData?.isActive ? suspBtnS : actBtnS}>
                        {formData?.isActive ? 'SUSPEND' : 'ACTIVATE'}
                    </button>
                    {!isEditing ? 
                        <button onClick={() => setIsEditing(true)} style={primaryBtnS(themeColor)}>EDIT PROFILE</button> :
                        <button onClick={handleUpdate} style={saveBtnS}>SAVE CHANGES</button>
                    }
                </div>
            </div>

            <div style={mainGridS}>
                {/* --- LEFT COL: IDENTITY & KYC --- */}
                <div style={colS}>
                    <Section title="👤 PERSONAL IDENTITY" color={themeColor}>
                        <div style={profileHeadS}>
                            <img src={formData?.staffPhoto || formData?.photo || 'https://via.placeholder.com/100'} style={avatarS} alt="P" onClick={() => setViewImage(formData?.staffPhoto)} />
                            <div style={{flex: 1}}>
                                <Input label="Full Name" name="fullName" val={formData?.fullName} edit={isEditing} onChange={handleFieldChange} />
                                <div style={grid2}>
                                    <Input label="Mobile" val={formData?.mobile} />
                                    <Input label="Email" val={formData?.email} />
                                </div>
                            </div>
                        </div>
                        <div style={grid2}>
                            <Input label="Father's Name" name="fatherName" val={formData?.fatherName} edit={isEditing} onChange={handleFieldChange} />
                            <Input label="DOB" val={new Date(formData?.dob).toLocaleDateString()} />
                            <Input label="Gender" val={formData?.gender} />
                        </div>
                    </Section>

                    <Section title="💼 PROFESSIONAL ROLE" color="#9b59b6">
                        <div style={grid2}>
                            <Input label="Designation" name="roleInShop" val={formData?.roleInShop} edit={isEditing} onChange={handleFieldChange} />
                            <Input label="Joining Date" val={new Date(formData?.joiningDate).toLocaleDateString()} />
                            <Input label="Qualification" val={formData?.qualification} />
                            <Input label="Experience" val={`${formData?.experienceYears || 0} Years`} />
                        </div>
                    </Section>

                    <Section title="📑 KYC & BANKING" color="#16a085">
                        <div style={grid2}>
                            <Input label="Aadhaar Number" val={formData?.aadharNumber} />
                            <Input label="PAN Identity" val={formData?.panNumber} />
                            <Input label="Bank Name" val={formData?.bankName} />
                            <Input label="Account Number" val={formData?.bankAcc} />
                        </div>
                    </Section>
                </div>

                {/* --- RIGHT COL: ADDRESS & PERMISSIONS --- */}
                <div style={colS}>
                    <Section title="🏠 RESIDENTIAL JURISDICTION" color="#e67e22">
                        <AddressBox label="Permanent" prefix="p" data={formData} edit={isEditing} locationData={locationData} districts={districts.p} blocks={blocks.p} onLocChange={handleLocChange} onFieldChange={handleFieldChange} />
                        {!formData?.isSameAsPermanent && (
                            <AddressBox label="Temporary" prefix="t" data={formData} edit={isEditing} locationData={locationData} districts={districts.t} blocks={blocks.t} onLocChange={handleLocChange} onFieldChange={handleFieldChange} />
                        )}
                    </Section>

                    <Section title="🔑 OPERATIONAL PRIVILEGES" color="#f39c12">
                        <div style={permGridS}>
                            {formData?.permissions && Object.keys(formData.permissions).map(key => (
                                <div key={key} onClick={() => handlePermissionToggle(key)} style={permNodeS(formData.permissions[key])}>
                                    <div style={{flex: 1, fontSize: '11px', fontWeight: '800'}}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
                                    <div style={checkBallS(formData.permissions[key])}></div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section title="📜 RECENT ACTIVITY LOGS" color="#000">
                        <div style={logBoxS}>
                            {logs.slice(0, 5).map((log, i) => (
                                <div key={i} style={logItemS}>
                                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                                    <b>{log.action}</b>
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>
            </div>

            {/* --- IMAGE MODAL --- */}
            {viewImage && <div style={modalOverlayS} onClick={() => setViewImage(null)}><img src={viewImage} style={imgLargeS} alt="Full" /></div>}
        </div>
    );
};

// --- Sub Components ---
const Section = ({ title, color, children }) => (<div style={{...sectionS, borderLeft: `6px solid ${color}`}}><h4 style={secTitleS}>{title}</h4>{children}</div>);
const Input = ({ label, name, val, edit, onChange }) => (
    <div style={{marginBottom:'10px'}}>
        <label style={labS}>{label}</label>
        {edit ? <input name={name} style={inS} value={val || ''} onChange={onChange} /> : <p style={valS}>{val || 'N/A'}</p>}
    </div>
);
const AddressBox = ({ label, prefix, data, edit, locationData, districts, blocks, onLocChange, onFieldChange }) => (
    <div style={addrBoxS}>
        <small style={labS}>{label} Address</small>
        {edit ? (
            <div style={{display:'grid', gap:'5px', marginTop:'5px'}}>
                <select style={inS} value={data[`${prefix}State`]} onChange={(e) => onLocChange(prefix, 'state', e.target.value)}>
                    <option value="">State</option>{locationData.map(l => <option key={l.state} value={l.state}>{l.state}</option>)}
                </select>
                <select style={inS} value={data[`${prefix}District`]} onChange={(e) => onLocChange(prefix, 'district', e.target.value)}>
                    <option value="">District</option>{districts?.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                </select>
                <input name={`${prefix}FullAddress`} style={inS} value={data[`${prefix}FullAddress`]} onChange={onFieldChange} placeholder="Full Address" />
            </div>
        ) : (
            <p style={valS}>{data[`${prefix}FullAddress`]}, {data[`${prefix}District`]}, {data[`${prefix}State`]}</p>
        )}
    </div>
);

// --- STYLES ---
const containerS = { padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'inherit' };
const headerS = { display: 'flex', alignItems: 'center', gap: '20px', background: '#fff', padding: '20px', borderRadius: '15px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const mainGridS = { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' };
const colS = { display: 'flex', flexDirection: 'column', gap: '20px' };
const sectionS = { background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' };
const secTitleS = { margin: '0 0 15px 0', fontSize: '12px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' };
const profileHeadS = { display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' };
const avatarS = { width: '80px', height: '80px', borderRadius: '15px', objectFit: 'cover', border: '3px solid #f1f5f9', cursor: 'pointer' };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const labS = { fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' };
const valS = { margin: '2px 0 0 0', fontWeight: '700', fontSize: '14px', color: '#1e293b' };
const inS = { width: '100%', padding: '8px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontWeight: '700' };
const permGridS = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' };
const permNodeS = (a) => ({ display: 'flex', alignItems: 'center', padding: '12px', background: a ? '#ecfdf5' : '#f8fafc', borderRadius: '10px', border: '1px solid', borderColor: a ? '#10b981' : '#e2e8f0', cursor: 'pointer' });
const checkBallS = (a) => ({ width: '10px', height: '10px', borderRadius: '50%', background: a ? '#10b981' : '#cbd5e1' });
const logBoxS = { maxHeight: '150px', overflowY: 'auto' };
const logItemS = { display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #f1f5f9', fontSize: '11px' };
const backBtnS = { padding: '8px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: '800', cursor: 'pointer' };
const primaryBtnS = (c) => ({ padding: '10px 20px', borderRadius: '10px', border: 'none', background: c, color: '#fff', fontWeight: '900', cursor: 'pointer' });
const secBtnS = { padding: '10px 15px', borderRadius: '10px', border: '1.5px solid #3b82f6', color: '#3b82f6', background: '#fff', fontWeight: '800', cursor: 'pointer' };
const suspBtnS = { padding: '10px 15px', borderRadius: '10px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: '800', cursor: 'pointer' };
const actBtnS = { padding: '10px 15px', borderRadius: '10px', border: 'none', background: '#10b981', color: '#fff', fontWeight: '800', cursor: 'pointer' };
const saveBtnS = { padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#10b981', color: '#fff', fontWeight: '900', cursor: 'pointer' };
const actionRowS = { display: 'flex', gap: '10px' };
const subTextS = { fontSize: '12px', fontWeight: '700', color: '#94a3b8' };
const loaderS = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' };
const addrBoxS = { padding: '10px', background: '#f8fafc', borderRadius: '10px', marginBottom: '10px' };
const modalOverlayS = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const imgLargeS = { maxWidth: '90%', maxHeight: '90%', borderRadius: '10px' };

export default StaffDetails;