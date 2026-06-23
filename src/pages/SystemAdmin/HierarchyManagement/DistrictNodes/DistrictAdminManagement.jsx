import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../../services/api'; // आपकी API सर्विस
import { useNavigate } from 'react-router-dom';

const DistrictAdminManagement = () => {
    const navigate = useNavigate();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // 1. बैकएंड से डिस्ट्रिक्ट एडमिन्स की लिस्ट लाना
    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        try {
            // नोट: एंडपॉइंट आपके adminRoutes.js के हिसाब से है
            const res = await api.get('/admin/hierarchy/members?role=DistrictAdmin');
            setAdmins(res.data.data || []);
        } catch (err) {
            console.error("Hierarchy Sync Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    // 2. सर्च लॉजिक (Name, ID या District के आधार पर)
    const filteredAdmins = useMemo(() => {
        return admins.filter(admin => 
            (admin.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (admin.assignedDistrict || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (admin.generatedId || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [admins, searchTerm]);

    if (loading) return <div style={loaderS}><div style={spinnerS}></div> Synchronizing District Nodes...</div>;

    return (
        <div style={containerS}>
            {/* --- Header Area --- */}
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>🛡️ District Admin Directory</h2>
                    <p style={subTitleS}>Strategic oversight of district-level administrative controllers.</p>
                </div>
                <div style={{display:'flex', gap:'12px'}}>
                    <button onClick={fetchAdmins} style={refreshBtn}>🔄 Sync</button>
                    <button style={addBtn} onClick={() => navigate('/admin/hierarchy')}>+ Assign New Admin</button>
                </div>
            </div>

            {/* --- Stats Summary --- */}
            <div style={statsRow}>
                <div style={statBox}>
                    <small style={statLab}>TOTAL ADMINS</small>
                    <b style={statVal}>{admins.length}</b>
                </div>
                <div style={statBox}>
                    <small style={statLab}>ACTIVE DISTRICTS</small>
                    <b style={statVal}>{[...new Set(admins.map(a => a.assignedDistrict))].length}</b>
                </div>
            </div>

            {/* --- Toolbar --- */}
            <div style={toolbarS}>
                <div style={searchWrapper}>
                    <span>🔍</span>
                    <input 
                        style={inSearch} 
                        placeholder="Search by Name, System ID or District..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* --- Registry Table --- */}
            <div style={tableCard}>
                <table style={tableS}>
                    <thead>
                        <tr style={thRow}>
                            <th style={tdS}>Authorized Controller</th>
                            <th style={tdS}>System ID</th>
                            <th style={tdS}>Assigned District</th>
                            <th style={tdS}>Contact Channel</th>
                            <th style={tdS}>Status</th>
                            <th style={tdS}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAdmins.length === 0 ? (
                            <tr><td colSpan="6" style={noDataS}>No district administrative nodes found matching your query.</td></tr>
                        ) : (
                            filteredAdmins.map((admin) => (
                                <tr key={admin._id} style={trS}>
                                    <td style={tdS}>
                                        <div style={nameS}>{admin.fullName}</div>
                                        <small style={{color:'#64748b'}}>Joined: {new Date(admin.createdAt).toLocaleDateString()}</small>
                                    </td>
                                    <td style={tdS}>
                                        <span style={idBadge}>{admin.generatedId || 'RKD-DA-NODE'}</span>
                                    </td>
                                    <td style={tdS}>
                                        <div style={jurisS}>📍 {admin.assignedDistrict || 'Pending Assignment'}</div>
                                        <small style={{color:'#3b82f6', fontWeight:'700'}}>{admin.assignedState}</small>
                                    </td>
                                    <td style={tdS}>
                                        <div style={{fontWeight:'600'}}>{admin.mobile}</div>
                                        <div style={{fontSize:'11px', color:'#94a3b8'}}>{admin.email}</div>
                                    </td>
                                    <td style={tdS}>
                                        <span style={admin.isActive ? badgeActive : badgeSuspended}>
                                            {admin.isActive ? '● Online' : '● Inactive'}
                                        </span>
                                    </td>
                                    <td style={tdS}>
                                        <button 
                                            style={editBtn} 
                                            onClick={() => navigate(`/admin/member-details/${admin._id}`)}
                                        >
                                            View Reports
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div style={footerS}>Total Node Count: {filteredAdmins.length}</div>
        </div>
    );
};

// --- Enterprise Style Definitions ---

const containerS = { padding: '10px', minHeight: '100vh', animation: 'fadeIn 0.5s ease' };
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const titleS = { margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a' };
const subTitleS = { margin: '4px 0 0', color: '#64748b', fontSize: '14px' };

const statsRow = { display:'flex', gap:'20px', marginBottom:'25px' };
const statBox = { background:'#fff', padding:'15px 25px', borderRadius:'15px', border:'1px solid #e2e8f0', minWidth:'150px' };
const statLab = { fontSize:'10px', fontWeight:'800', color:'#94a3b8', letterSpacing:'1px' };
const statVal = { fontSize:'22px', fontWeight:'900', color:'#1e293b', display:'block', marginTop:'5px' };

const toolbarS = { marginBottom:'25px', background:'#fff', padding:'15px', borderRadius:'18px', border:'1px solid #e2e8f0' };
const searchWrapper = { display:'flex', alignItems:'center', gap:'12px', background:'#f8fafc', padding:'0 15px', borderRadius:'12px', border:'1.5px solid #e2e8f0' };
const inSearch = { border:'none', width:'100%', padding:'12px 0', outline:'none', fontSize:'14px', background:'transparent', fontWeight:'600' };

const tableCard = { background: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' };
const tableS = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const thRow = { backgroundColor: '#f8fafc', borderBottom: '2px solid #f1f5f9' };
const tdS = { padding: '18px 20px', fontSize: '14px', borderBottom: '1px solid #f1f5f9' };
const trS = { transition: '0.2s', ':hover': { backgroundColor: '#fcfdfe' } };

const nameS = { fontWeight: '800', color: '#1e293b', fontSize: '15px' };
const idBadge = { background:'#1e293b', color:'#fff', padding:'5px 10px', borderRadius:'8px', fontSize:'10px', fontWeight:'900' };
const jurisS = { fontWeight:'800', color:'#334155', fontSize:'13px' };

const badgeActive = { color:'#10b981', background:'#f0fdf4', padding:'5px 12px', borderRadius:'20px', fontWeight:'900', fontSize:'11px' };
const badgeSuspended = { color:'#ef4444', background:'#fef2f2', padding:'5px 12px', borderRadius:'20px', fontWeight:'900', fontSize:'11px' };

const addBtn = { background: '#1e293b', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize:'13px' };
const refreshBtn = { background:'#fff', border:'1.5px solid #e2e8f0', padding:'10px 20px', borderRadius:'12px', cursor:'pointer', fontWeight:'bold' };
const editBtn = { background: '#eff6ff', color:'#2563eb', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight:'800', fontSize:'12px' };

const noDataS = { padding:'80px', textAlign:'center', color:'#94a3b8', fontSize:'16px', fontWeight:'700' };
const footerS = { marginTop: '20px', fontSize: '11px', color: '#94a3b8', textAlign: 'right', fontWeight: '800' };
const loaderS = { display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'60vh', fontWeight:'800', color:'#64748b', gap:'15px' };
const spinnerS = { width: '35px', height: '35px', border: '4px solid #f3f3f3', borderTop: '4px solid #1e293b', borderRadius: '50%', animation: 'spin 1s linear infinite' };

export default DistrictAdminManagement;