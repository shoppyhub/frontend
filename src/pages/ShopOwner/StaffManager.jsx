import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../services/api'; 
import { toast } from 'react-toastify';
import StaffRegistrationForm from './StaffRegistrationForm';
import StaffAuditView from './StaffAuditView'; 
import { useJsApiLoader } from '@react-google-maps/api';
import { useBranding } from '../../context/BrandingContext'; // For White-labeling

const StaffManager = ({ shop }) => {
    const { settings } = useBranding();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    
    // --- 🛡️ Component States ---
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); 
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Google Maps Loader for Logistics Tracking
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_MAPPLS_API_KEY
    });

    // 1. 📡 Automatic Synchronization Protocol (No Buttons)
    const fetchStaffRegistry = useCallback(async () => {
        try {
            // Background sync is silent, initial load shows spinner
            const res = await api.get('/auth/staff/list');
            if (res.data?.success) {
                setStaffList(res.data.data);
            }
            document.title = `Personnel Hub | ${settings.siteName}`;
        } catch (err) { 
            console.error("Staff Handshake Error");
        } finally { 
            setLoading(false); 
        }
    }, [settings.siteName]);

    useEffect(() => { 
        fetchStaffRegistry(); 
        
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);

        // Auto-refresh when returns to tab
        window.addEventListener('focus', fetchStaffRegistry);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('focus', fetchStaffRegistry);
        };
    }, [fetchStaffRegistry]);

    // 2. 🔍 Discovery Filter
    const filteredStaff = useMemo(() => {
        return staffList.filter(s => 
            s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.generatedId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.mobile.includes(searchTerm)
        );
    }, [searchTerm, staffList]);

    // 3. ⚙️ Operation Handlers
    const toggleStatus = async (id) => {
        if(!window.confirm("Protocol: Change authorization status for this personnel node?")) return;
        try {
            const res = await api.patch(`/auth/user/status/${id}`);
            toast.success(res.data.message);
            fetchStaffRegistry();
            setView('list');
        } catch (err) { toast.error("Handshake error."); }
    };

    const resetKey = async (id) => {
        if(!window.confirm("Authorize administrative access key reset?")) return;
        try {
            const res = await api.put(`/auth/staff/reset-password/${id}`);
            alert(`✅ SECURE ACCESS KEY GENERATED: ${res.data.newPassword}`);
        } catch (err) { toast.error("Key generation failed."); }
    };

    const deleteStaff = async (id) => {
        if (!window.confirm("CRITICAL: Permanently purge this node from ecosystem?")) return;
        try {
            await api.delete(`/auth/staff/delete/${id}`);
            toast.info("Personnel node decommissioned.");
            fetchStaffRegistry();
            setView('list');
        } catch (err) { toast.error("Purge protocol aborted."); }
    };

    const printID = (s) => {
        if (!s) return;
        const win = window.open("", "_blank");
        const themeColor = settings.themeColor || "#0f172a";
        const siteLogo = settings.logoUrl || "";
        const siteName = settings.siteName || "System Hub";

        win.document.write(`
            <html><body style="font-family:'Plus Jakarta Sans', sans-serif; text-align:center; padding:40px; background:#f8fafc;">
                <div style="width:350px; background:#fff; border:1px solid #eef2f6; padding:40px; border-radius:40px; margin:auto; box-shadow:0 20px 50px rgba(0,0,0,0.1); position:relative; overflow:hidden;">
                    <div style="position:absolute; top:0; left:0; width:100%; height:8px; background:${themeColor};"></div>
                    <img src="${siteLogo}" style="height:40px; margin-bottom:20px; object-fit:contain;"/>
                    <div style="width:140px; height:140px; border-radius:35px; border:4px solid ${themeColor}20; margin:15px auto; overflow:hidden;">
                        <img src="${s.photo || 'https://via.placeholder.com/140'}" style="width:100%; height:100%; object-fit:cover;"/>
                    </div>
                    <h2 style="margin:15px 0 5px 0; color:#0f172a; font-size:24px;">${s.fullName}</h2>
                    <span style="background:${themeColor}10; color:${themeColor}; padding:6px 15px; border-radius:10px; font-weight:800; font-size:11px; text-transform:uppercase;">${s.staffDetails?.roleInShop}</span>
                    <div style="margin-top:25px; padding:15px; background:#f8fafc; border-radius:20px;">
                        <small style="color:#94a3b8; font-weight:900; display:block; margin-bottom:5px;">NODE IDENTITY ID</small>
                        <b style="font-size:18px; color:#1e293b; letter-spacing:1px;">${s.generatedId}</b>
                    </div>
                    <p style="font-size:10px; color:#cbd5e1; margin-top:30px; font-weight:700;">Verified Infrastructure Node: ${siteName}</p>
                </div>
                <script>window.onload = () => { window.print(); window.close(); }</script>
            </body></html>
        `);
    };

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Accessing Personnel Ledger...</p>
        </div>
    );

    if (view === 'add' || view === 'edit') {
        return <StaffRegistrationForm onBack={() => { setView('list'); setSelectedStaff(null); fetchStaffRegistry(); }} editData={selectedStaff} />;
    }

    if (view === 'manage' && selectedStaff) {
        return (
            <StaffAuditView 
                s={selectedStaff} 
                shop={shop}
                isLoaded={isLoaded}
                onBack={() => setView('list')}
                onEdit={() => setView('edit')}
                onToggleStatus={toggleStatus}
                onResetKey={resetKey}
                onPrintID={printID}
                onDelete={deleteStaff}
                themeColor={themeColor}
            />
        );
    }

    return (
        <div style={container}>
            {/* --- [A] DYNAMIC ANALYTICS HEADER --- */}
            <div style={{...metricsRow, flexDirection: isMobile ? 'column' : 'row'}}>
                <div style={metricCard}>
                    <small style={mLabel}>REGISTERED NODES</small>
                    <div style={mValue}>{staffList.length} Personnel</div>
                </div>
                <div style={metricCard}>
                    <small style={mLabel}>OPERATIONAL STATUS</small>
                    <div style={{...mValue, color:'#10b981'}}>{staffList.filter(s => s.isActive !== false).length} Active</div>
                </div>
                <button onClick={() => setView('add')} style={addBtnLarge(themeColor)}>
                    + ENROLL NEW PERSONNEL
                </button>
            </div>

            {/* --- [B] DISCOVERY TOOLBAR --- */}
            <div style={controlBar}>
                <div style={searchBox}>
                    <span>🔍</span>
                    <input 
                        placeholder="Search by Name, Node ID or Mobile Identifier..." 
                        style={searchIn} 
                        value={searchTerm} 
                        onChange={(e)=>setSearchTerm(e.target.value)} 
                    />
                </div>
            </div>

            {/* --- [C] ADAPTIVE PERSONNEL REGISTRY --- */}
            <div style={tableWrapper}>
                {isMobile ? (
                    <div style={mobileGrid}>
                        {filteredStaff.map(s => (
                            <div key={s._id} style={mCard} onClick={() => { setSelectedStaff(s); setView('manage'); }}>
                                <div style={mCardTop}>
                                    <img src={s.photo || 'https://via.placeholder.com/60'} alt="avatar" style={mAvatar} />
                                    <div style={{flex:1}}>
                                        <div style={{fontWeight:'900', color:'#0f172a', fontSize:'16px'}}>{s.fullName}</div>
                                        <small style={{color: themeColor, fontWeight:'800'}}>{s.generatedId}</small>
                                    </div>
                                    <span style={{...dotS, background: s.isActive !== false ? '#10b981' : '#ef4444'}}></span>
                                </div>
                                <div style={mCardInfo}>
                                    <div style={infoRow}><span>Primary Mobile:</span> <b>{s.mobile}</b></div>
                                    <div style={infoRow}><span>Position:</span> <b>{s.staffDetails?.roleInShop}</b></div>
                                </div>
                                <div style={mCardFooter}>
                                    <span style={roleBadge(themeColor)}>{s.staffDetails?.roleInShop}</span>
                                    <div style={{fontSize:'11px', color: themeColor, fontWeight:'900'}}>AUDIT NODE →</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <table style={tableS}>
                        <thead>
                            <tr style={thRow}>
                                <th style={thS}>Authorized Node</th>
                                <th style={thS}>Guardian Name</th>
                                <th style={thS}>Contact Hub</th>
                                <th style={thS}>Designation</th>
                                <th style={thS}>Enrollment</th>
                                <th style={thS}>Compliance</th>
                                <th style={thS}>Audit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStaff.map(s => (
                                <tr key={s._id} style={trS}>
                                    <td style={tdS}>
                                        <div style={staffInfoBox}>
                                            <img src={s.photo || 'https://via.placeholder.com/45'} alt="p" style={staffImgS} />
                                            <div>
                                                <div style={{fontWeight:'900', color:'#1e293b'}}>{s.fullName}</div>
                                                <small style={{color: themeColor, fontWeight:'900'}}>{s.generatedId}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tdS}><b>{s.fatherName || 'N/A'}</b></td>
                                    <td style={tdS}>
                                        <div style={{fontWeight:'700'}}>{s.mobile}</div>
                                        <small style={{color:'#94a3b8', fontWeight:'600'}}>{s.email}</small>
                                    </td>
                                    <td style={tdS}><span style={roleBadge(themeColor)}>{s.staffDetails?.roleInShop}</span></td>
                                    <td style={tdS}>{s.staffDetails?.joiningDate ? new Date(s.staffDetails.joiningDate).toLocaleDateString('en-GB') : 'N/A'}</td>
                                    <td style={tdS}>
                                        <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'11px', fontWeight:'900', color: s.isActive !== false ? '#10b981' : '#ef4444'}}>
                                            <span style={{...dotS, background: s.isActive !== false ? '#10b981' : '#ef4444'}}></span>
                                            {s.isActive !== false ? "VERIFIED" : "BLOCKED"}
                                        </div>
                                    </td>
                                    <td style={tdS}>
                                        <button onClick={() => { setSelectedStaff(s); setView('manage'); }} style={manageBtn}>
                                            View Logs
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {filteredStaff.length === 0 && (
                <div style={noDataCard}>
                    <div style={{fontSize:'50px', marginBottom:'15px'}}>📋</div>
                    <h3>Personnel Registry Clean</h3>
                    <p>No active staff nodes discovered in current registry.</p>
                </div>
            )}

            <style>{`
                .spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

// --- Enterprise Visual Definitions ---

const container = { padding: '10px', animation:'fadeIn 0.4s ease', fontFamily:"'Plus Jakarta Sans', sans-serif" };
const metricsRow = { display:'flex', gap:'20px', marginBottom:'40px' };
const metricCard = { flex:1, background:'#fff', padding:'25px', borderRadius:'28px', border:'1px solid #f1f5f9', boxShadow:'0 4px 15px rgba(0,0,0,0.02)' };
const mLabel = { fontSize:'10px', fontWeight:'900', color:'#94a3b8', letterSpacing:'1.5px', textTransform:'uppercase' };
const mValue = { fontSize:'24px', fontWeight:'900', color:'#0f172a', marginTop:'8px' };
const addBtnLarge = (color) => ({ background: color, color: '#fff', border: 'none', borderRadius: '18px', cursor: 'pointer', padding: '0 35px', fontWeight: '900', fontSize: '13px', boxShadow: `0 10px 20px ${color}33` });

const controlBar = { marginBottom:'35px' };
const searchBox = { display:'flex', alignItems:'center', gap:'15px', background:'#fff', padding:'15px 25px', borderRadius:'24px', border:'1px solid #f1f5f9', boxShadow:'0 10px 30px rgba(0,0,0,0.02)' };
const searchIn = { border:'none', outline:'none', width:'100%', fontSize:'15px', fontWeight:'700', color:'#1e293b' };

const tableWrapper = { background:'#fff', borderRadius:'40px', border:'1px solid #f1f5f9', overflowX:'auto', boxShadow:'0 20px 50px rgba(0,0,0,0.03)' };
const tableS = { width: '100%', borderCollapse: 'collapse', textAlign:'left', minWidth:'1100px' };
const thRow = { background:'#f8fafc', borderBottom:'1.5px solid #f1f5f9' };
const thS = { padding:'22px 30px', fontSize:'10px', fontWeight:'900', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px' };
const tdS = { padding:'22px 30px', borderBottom:'1px solid #f8fafc', fontSize:'14px' };
const trS = { transition: '0.2s' };

const staffInfoBox = { display:'flex', alignItems:'center', gap:'18px' };
const staffImgS = { width:'50px', height:'50px', borderRadius:'16px', objectFit:'cover', border:'2px solid #fff', boxShadow:'0 4px 10px rgba(0,0,0,0.1)', background:'#f8fafc' };
const roleBadge = (color) => ({ background:`${color}10`, color: color, padding:'6px 14px', borderRadius:'10px', fontSize:'10px', fontWeight:'900', textTransform:'uppercase' });
const manageBtn = { background: '#f1f5f9', color: '#0f172a', border: 'none', padding: '10px 22px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '11px' };

const mobileGrid = { display:'flex', flexDirection:'column', gap:'20px', padding:'20px' };
const mCard = { background:'#fff', padding:'25px', borderRadius:'35px', border:'1px solid #f1f5f9', boxShadow:'0 10px 25px rgba(0,0,0,0.03)' };
const mCardTop = { display:'flex', alignItems:'center', gap:'15px', marginBottom:'20px' };
const mAvatar = { width:'65px', height:'65px', borderRadius:'20px', objectFit:'cover', background:'#f8fafc' };
const mCardInfo = { padding:'15px 0', borderTop:'1.5px solid #f8fafc', borderBottom:'1.5px solid #f8fafc', marginBottom:'15px' };
const infoRow = { display:'flex', justifyContent:'space-between', fontSize:'13px', marginBottom:'8px' };
const mCardFooter = { display:'flex', justifyContent:'space-between', alignItems:'center' };

const dotS = { width:'10px', height:'10px', borderRadius:'50%', display:'inline-block', boxShadow:'0 0 8px rgba(0,0,0,0.1)' };
const noDataCard = { textAlign:'center', padding:'100px 30px', color:'#cbd5e1', background:'#fff', borderRadius:'40px', border:'1px dashed #e2e8f0', marginTop:'20px' };
const loaderS = { display:'flex', flexDirection:'column', height: '60vh', justifyContent: 'center', alignItems: 'center', fontWeight: '900', color: '#94a3b8', fontSize: '14px', gap:'15px' };

export default StaffManager;