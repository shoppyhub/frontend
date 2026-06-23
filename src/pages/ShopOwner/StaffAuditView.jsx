import React from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const StaffAuditView = ({ s, shop, isLoaded, onBack, onEdit, onToggleStatus, onResetKey, onPrintID, onDelete }) => {
    // Geospatial Coordinates for the Map
    const staffLocation = s.locationCoords || { lat: 20.5937, lng: 78.9629 };

    return (
        <div style={mContainer}>
            {/* --- 🏷️ HEADER SECTION --- */}
            <div style={mHeader}>
                <button onClick={onBack} style={backBtn}>← RETURN TO REGISTRY</button>
                <div>
                    <h2 style={titleText}>Personnel Hub Node Audit</h2>
                    <p style={subText}>Deep auditing of identity: <b>{s.fullName}</b></p>
                </div>
            </div>
            
            <div style={manageGrid}>
                
                {/* --- 👤 SIDEBAR: IDENTITY & PERFORMANCE --- */}
                <div style={profileSidebar}>
                    <div style={imageCard}>
                        <img src={s.photo || 'https://via.placeholder.com/200'} alt="Staff" style={largeImg} />
                        <div style={idTag}>{s.generatedId}</div>
                        <small style={roleTag}>{s.staffDetails?.roleInShop || 'Field Executive'}</small>
                    </div>

                    <div style={statusBoxS(s.isActive !== false)}>
                        {s.isActive !== false ? "● AUTHORIZED ACTIVE" : "● HUB SUSPENDED"}
                    </div>

                    <div style={performanceCard}>
                        <small style={pLabelS}>OPERATIONAL PERFORMANCE</small>
                        <div style={pValS}>4.8 ⭐</div>
                        <p style={pDescS}>Protocol Compliance: 99.2%</p>
                    </div>
                </div>

                {/* --- 📝 MAIN CONTENT: DATA LEDGERS --- */}
                <div style={profileDetailsContainer}>
                    
                    {/* 1. PERSONAL LEDGER */}
                    <div style={infoCard}>
                        <h4 style={secHead}>Personal Identity Ledger</h4>
                        <div style={detailGrid}>
                            <DataRow label="Full Legal Name" val={s.fullName} />
                            <DataRow label="Guardian Name" val={s.fatherName} />
                            <DataRow label="Registry Mobile" val={s.mobile} />
                            <DataRow label="Email Identity" val={s.email} />
                            <DataRow label="Date of Birth" val={s.dob ? new Date(s.dob).toLocaleDateString('en-GB') : 'N/A'} />
                            <DataRow label="Gender Node" val={s.gender} />
                            <DataRow label="Joining Timestamp" val={s.staffDetails?.joiningDate ? new Date(s.staffDetails.joiningDate).toLocaleDateString() : 'N/A'} />
                            <DataRow label="Last Node Sync" val={new Date(s.updatedAt).toLocaleString()} />
                        </div>
                    </div>

                    {/* 2. KYC DOCUMENTATION VAULT */}
                    <div style={infoCard}>
                        <h4 style={secHead}>KYC Documentation Vault</h4>
                        <div style={docGrid}>
                            <DocItem 
                                label="Aadhar Card" 
                                idNum={s.kycDetails?.aadharNumber} 
                                file={s.kycDetails?.aadharCardFile} 
                                icon="🆔"
                            />
                            <DocItem 
                                label="PAN Identity" 
                                idNum={s.kycDetails?.panNumber} 
                                file={s.kycDetails?.panCardFile} 
                                icon="💳"
                            />
                            <DocItem 
                                label="Qualification" 
                                idNum={s.qualification || "Educational Registry"} 
                                file={s.qualificationFile} 
                                icon="🎓"
                            />
                        </div>
                    </div>

                    {/* 3. BANKING & SETTLEMENT NODE */}
                    <div style={bankCardS}>
                        <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'20px'}}>
                            <div style={bankIcon}>🏦</div>
                            <h4 style={{margin:0, color:'#fff', letterSpacing:'1px'}}>BANKING & SETTLEMENT NODE</h4>
                        </div>
                        <div style={detailGrid}>
                            <div style={bankRow}><small>Institution:</small> <b>{s.bankDetails?.bankName}</b></div>
                            <div style={bankRow}><small>Account Number:</small> <b>{s.bankDetails?.accountNumber}</b></div>
                            <div style={bankRow}><small>IFSC Protocol:</small> <b>{s.bankDetails?.ifscCode}</b></div>
                            <div style={bankRow}>
                                <small>Passbook Proof:</small> 
                                {s.bankDetails?.passbookPhoto ? (
                                    <a href={s.bankDetails.passbookPhoto} target="_blank" rel="noreferrer" style={linkWhite}>View Document →</a>
                                ) : <b>Not Provided</b>}
                            </div>
                        </div>
                    </div>

                    {/* 4. GEOSPATIAL TRACKING & ADDRESS */}
                    <div style={infoCard}>
                        <h4 style={secHead}>Geospatial Logistics Node</h4>
                        {isLoaded ? (
                            <div style={mapBoxS}>
                                <GoogleMap
                                    mapContainerStyle={{ width: '100%', height: '300px' }}
                                    center={staffLocation}
                                    zoom={15}
                                >
                                    <Marker position={staffLocation} label={{text: s.fullName.charAt(0), color:'white'}} />
                                </GoogleMap>
                                <div style={mapCaptionS}>GPS Node: {staffLocation.lat.toFixed(5)}, {staffLocation.lng.toFixed(5)}</div>
                            </div>
                        ) : <div style={loaderMini}>Initializing Tracking Engine...</div>}

                        <div style={addressRow}>
                            <div style={addrBox}>
                                <small style={dLab}>CORRESPONDENCE HUB</small>
                                <p style={addrText}>{s.temporaryAddress?.fullAddress}, {s.temporaryAddress?.district}, {s.temporaryAddress?.state} - {s.temporaryAddress?.pinCode}</p>
                            </div>
                            <div style={addrBox}>
                                <small style={dLab}>PERMANENT RESIDENTIAL</small>
                                <p style={addrText}>{s.permanentAddress?.fullAddress}, {s.permanentAddress?.district}, {s.permanentAddress?.state} - {s.permanentAddress?.pinCode}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 🛠️ ACTION COMMAND BAR --- */}
            <div style={actionFooter}>
                <ControlBtn icon="✏️" label="Edit Node" col="#3b82f6" onClick={onEdit} />
                <ControlBtn icon={s.isActive !== false ? "🚫" : "✅"} label={s.isActive !== false ? "Suspend" : "Activate"} col={s.isActive !== false ? "#f59e0b" : "#10b981"} onClick={() => onToggleStatus(s._id)} />
                <ControlBtn icon="🔑" label="Reset Key" col="#8b5cf6" onClick={() => onResetKey(s._id)} />
                <ControlBtn icon="🪪" label="Print ID" col="#0f172a" onClick={() => onPrintID(s)} />
                <ControlBtn icon="🗑️" label="Purge" col="#ef4444" onClick={() => onDelete(s._id)} />
            </div>
        </div>
    );
};

// --- Atomic Helper Components ---
const DataRow = ({ label, val }) => (
    <div style={dRow}><small style={dLab}>{label}</small><div style={dVal}>{val || 'DATA_PENDING'}</div></div>
);

const DocItem = ({ label, idNum, file, icon }) => (
    <div style={docItemS}>
        <div style={{fontSize:'24px'}}>{icon}</div>
        <div style={{flex:1}}>
            <small style={dLab}>{label}</small>
            <div style={{fontWeight:'800', color:'#1e293b', fontSize:'13px', margin:'2px 0'}}>{idNum || 'N/A'}</div>
            {file ? <a href={file} target="_blank" rel="noreferrer" style={linkBlue}>View Original File →</a> : <small style={{color:'#ef4444'}}>No scan uploaded</small>}
        </div>
    </div>
);

const ControlBtn = ({ icon, label, col, onClick }) => (
    <div style={btnBox} onClick={onClick}>
        <div style={{...roundBtn, background: col}}>{icon}</div>
        <span style={{fontSize:'10px', fontWeight:'900', color:'#475569', marginTop:'10px', letterSpacing:'1px'}}>{label.toUpperCase()}</span>
    </div>
);

// --- 🎨 Professional SaaS Styles ---
const mContainer = { background:'#fff', borderRadius:'45px', border:'1px solid #eef2f6', padding:'40px', animation: 'fadeIn 0.5s ease', fontFamily: "'Inter', sans-serif" };
const mHeader = { display:'flex', alignItems:'center', borderBottom:'1.5px solid #f1f5f9', paddingBottom:'35px', marginBottom:'40px', gap:'30px' };
const backBtn = { background:'#f8fafc', color:'#64748b', border:'1px solid #e2e8f0', padding:'12px 25px', borderRadius:'14px', cursor:'pointer', fontWeight:'900', fontSize:'11px' };
const titleText = { margin:0, color:'#0f172a', fontWeight:'900', fontSize:'24px', letterSpacing:'-1px' };
const subText = { margin:'5px 0 0', color:'#64748b', fontSize:'14px', fontWeight:'600' };

const manageGrid = { display:'grid', gridTemplateColumns:'280px 1fr', gap:'50px' };
const profileSidebar = { textAlign:'center', position:'sticky', top:'100px', height:'fit-content' };
const imageCard = { background:'#f8fafc', padding:'25px', borderRadius:'40px', border:'1px solid #eef2f6', display:'flex', flexDirection:'column', alignItems:'center' };
const largeImg = { width:'180px', height:'180px', borderRadius:'35px', objectFit:'cover', boxShadow:'0 15px 30px rgba(0,0,0,0.1)', border:'5px solid #fff' };
const idTag = { marginTop:'20px', fontSize:'18px', fontWeight:'900', color:'#2874f0', letterSpacing:'1px' };
const roleTag = { fontSize:'11px', fontWeight:'800', color:'#94a3b8', textTransform:'uppercase', marginTop:'5px' };

const statusBoxS = (active) => ({ padding:'12px', borderRadius:'15px', background: active ? '#ecfdf5' : '#fef2f2', color: active ? '#10b981' : '#ef4444', fontSize:'10px', fontWeight:'900', marginTop:'20px', border:`1px solid ${active ? '#d1fae5' : '#fee2e2'}` });

const performanceCard = { marginTop:'25px', padding:'20px', background:'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius:'25px', color:'#fff' };
const pLabelS = { fontSize:'8px', fontWeight:'900', color:'rgba(255,255,255,0.5)', letterSpacing:'1px' };
const pValS = { fontSize:'24px', fontWeight:'900', marginTop:'5px' };
const pDescS = { fontSize:'10px', opacity:0.7, margin:'5px 0 0' };

const profileDetailsContainer = { display:'flex', flexDirection:'column', gap:'30px' };
const infoCard = { background:'#fff', padding:'35px', borderRadius:'35px', border:'1px solid #eef2f6', boxShadow:'0 10px 30px rgba(0,0,0,0.02)' };
const secHead = { margin:'0 0 25px 0', fontSize:'12px', fontWeight:'900', color:'#2874f0', borderLeft:'4px solid #2874f0', paddingLeft:'18px', textTransform:'uppercase', letterSpacing:'1px' };

const detailGrid = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px' };
const docGrid = { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'20px' };

const dRow = { display:'flex', flexDirection:'column', gap:'6px' };
const dLab = { fontSize:'9px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.5px' };
const dVal = { fontSize:'15px', fontWeight:'700', color:'#334155' };

const docItemS = { background:'#f8fafc', padding:'20px', borderRadius:'20px', border:'1px solid #f1f5f9', display:'flex', gap:'15px', alignItems:'center' };
const linkBlue = { color:'#2874f0', fontSize:'11px', fontWeight:'800', textDecoration:'none' };

const bankCardS = { background:'#0f172a', padding:'35px', borderRadius:'35px', color:'#fff', boxShadow:'0 20px 40px rgba(15, 23, 42, 0.1)' };
const bankIcon = { width:'45px', height:'45px', background:'rgba(255,255,255,0.1)', borderRadius:'12px', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'24px' };
const bankRow = { display:'flex', flexDirection:'column', gap:'4px' };
const linkWhite = { color:'#10b981', fontSize:'12px', fontWeight:'800', textDecoration:'none' };

const mapBoxS = { marginBottom:'30px', borderRadius:'25px', overflow:'hidden', border:'1px solid #eef2f6' };
const mapCaptionS = { padding:'10px', fontSize:'10px', color:'#94a3b8', textAlign:'center', fontWeight:'700', background:'#f8fafc' };

const addressRow = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'25px' };
const addrBox = { padding:'20px', background:'#fcfdfe', borderRadius:'20px', border:'1px solid #f1f5f9' };
const addrText = { fontSize:'13px', color:'#475569', lineHeight:'1.6', margin:'10px 0 0', fontWeight:'600' };

const actionFooter = { marginTop:'50px', paddingTop:'40px', borderTop:'1.5px solid #f8fafc', display:'flex', justifyContent:'center', gap:'50px' };
const btnBox = { display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer', transition:'0.3s' };
const roundBtn = { width:'60px', height:'60px', borderRadius:'20px', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'24px', color:'#fff', boxShadow:'0 10px 20px rgba(0,0,0,0.1)' };
const loaderMini = { padding:'40px', textAlign:'center', color:'#2874f0', fontWeight:'800' };

export default StaffAuditView;