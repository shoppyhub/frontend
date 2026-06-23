import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from 'services/api'; 
import { useBranding } from 'context/BrandingContext';
import { useAuth } from 'context/AuthContext';

const AllAdminNodes = () => {
    const navigate = useNavigate();
    const { settings } = useBranding();
    const { user: currentUser } = useAuth(); // स्वयं सिस्टम एडमिन की जानकारी के लिए
    const [allNodes, setAllNodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    // 📡 मास्टर डेटा सिंक्रोनाइजेशन (Admins + Customers)
    const fetchMasterRegistry = useCallback(async () => {
        try {
            setLoading(true);
            
            // दोनों डेटा को एक साथ मँगाना (Hierarchy + Customers)
            const [adminRes, customerRes] = await Promise.all([
                api.get('/admin/hierarchy/members'),
                api.get('/admin/users/all')
            ]);

            let combinedData = [];
            if (adminRes.data.success) combinedData = [...adminRes.data.data];
            if (customerRes.data.success) combinedData = [...combinedData, ...customerRes.data.data];

            setAllNodes(combinedData);
        } catch (err) {
            console.error("Registry Sync Error:", err);
            toast.error("Handshake Failed: Could not load complete node registry.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMasterRegistry();
    }, [fetchMasterRegistry]);

    // 🔐 स्टेटस कंट्रोल प्रोटोकॉल
    const handleToggleStatus = async (id, currentStatus, role) => {
        if (role === 'SystemAdmin') {
            toast.error("Access Denied: Root nodes are immutable.");
            return;
        }

        const action = currentStatus ? 'SUSPEND' : 'ACTIVATE';
        if (!window.confirm(`CONFIRM: ${action} this identity node?`)) return;

        try {
            // रोल के हिसाब से अलग एंडपॉइंट (ग्राहकों के लिए अलग लॉजिक हो सकता है)
            const endpoint = role === 'Customer' ? `/admin/users/update/${id}` : `/admin/hierarchy/status/${id}`;
            await api.patch(endpoint, { isActive: !currentStatus });
            
            toast.success(`Node ${action}ED successfully.`);
            fetchMasterRegistry();
        } catch (err) { 
            toast.error("Protocol Error: Status modulation failed."); 
        }
    };

    // 🔍 डिस्कवरी इंजन (फिल्टरिंग)
    const filteredNodes = useMemo(() => {
        return allNodes.filter(n => {
            const matchesSearch = `${n.fullName} ${n.generatedId || ''} ${n.mobile} ${n.assignedDistrict || n.shopDistrict || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === "all" || n.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [allNodes, searchTerm, roleFilter]);

    const themeColor = settings?.themeColor || '#0f172a';

    if (loading) return (
        <div style={loaderWrapper}>
            <div className="rkd-spinner-master"></div>
            <p style={{marginTop:'20px', fontWeight:'800', color:'#94a3b8', letterSpacing:'1px'}}>LINKING GLOBAL REGISTRY...</p>
        </div>
    );

    return (
        <div style={{padding: '25px', animation: 'fadeIn 0.5s ease', background:'#f8fafc', minHeight:'100vh'}}>
            {/* Header */}
            <div style={headerSection}>
                <div>
                    <h2 style={titleStyle}>🌐 Universal Node Registry</h2>
                    <p style={subtitleStyle}>Master control for all Administrative, Merchant, and Customer identities.</p>
                </div>
                <div style={statsBadge}>
                    <b>TOTAL NODES: {allNodes.length}</b>
                </div>
            </div>

            {/* Toolbar */}
            <div style={toolbarStyle}>
                <div style={searchWrapper}>
                    <span style={{opacity:0.5}}>🔍</span>
                    <input 
                        placeholder="Search by Name, Mobile, ID, or District..." 
                        style={inputStyle} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select style={selectStyle} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="all">View All Identities</option>
                    <option value="SystemAdmin">Root Admins (System)</option>
                    <option value="SubSystemAdmin">Central Admins (Sub)</option>
                    <option value="StateAdmin">State Authorities</option>
                    <option value="DistrictAdmin">District Hubs</option>
                    <option value="Customer">General Customers</option>
                </select>
                <button onClick={fetchMasterRegistry} style={refreshBtn(themeColor)}>🔄 Sync Registry</button>
            </div>

            {/* Table */}
            <div style={tableContainer}>
                <table style={mainTable}>
                    <thead>
                        <tr style={tableHeaderRow}>
                            <th style={thStyle}>Identity & Profile</th>
                            <th style={thStyle}>Designation / Role</th>
                            <th style={thStyle}>Territory / Jurisdiction</th>
                            <th style={thStyle}>Unique ID</th>
                            <th style={thStyle}>Security Status</th>
                            <th style={thStyle}>Command Hub</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredNodes.map(n => (
                            <tr key={n._id} style={trStyle}>
                                <td style={tdStyle}>
                                    <div style={identityCell}>
                                        {n.displayPhoto || n.adminPhoto || n.photo ? (
                                            <img src={n.displayPhoto || n.adminPhoto || n.photo} alt="User" style={avatarStyle} />
                                        ) : (
                                            <div style={initialsAvatar(themeColor)}>{n.fullName?.charAt(0)}</div>
                                        )}
                                        <div>
                                            <div style={nameTxt}>{n.fullName} {n._id === currentUser?.id && <small style={selfTag}>(YOU)</small>}</div>
                                            <div style={mobileTxt}>📱 {n.mobile}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={tdStyle}><span style={roleBadgeStyle(n.role)}>{n.role}</span></td>
                                <td style={tdStyle}>
                                    <div style={jurisdictionTxt}>
                                        📍 {n.assignedDistrict || n.shopDistrict || n.assignedState || 'Global Cluster'}
                                    </div>
                                </td>
                                <td style={tdStyle}><code style={idBadge}>{n.generatedId || 'CUST-NODE'}</code></td>
                                <td style={tdStyle}>
                                    <button 
                                        disabled={n.role === 'SystemAdmin'} 
                                        onClick={() => handleToggleStatus(n._id, n.isActive, n.role)}
                                        style={statusBtnStyle(n.isActive, n.role === 'SystemAdmin')}
                                    >
                                        <span style={dotS(n.isActive)}></span>
                                        {n.isActive ? 'OPERATIONAL' : 'SUSPENDED'}
                                    </button>
                                </td>
                                <td style={tdStyle}>
                                    {n.role === 'SystemAdmin' ? (
                                        <span style={immutableLabel}>IMMUTABLE NODE</span>
                                    ) : (
                                        <button 
                                            style={manageBtn(themeColor)}
                                            onClick={() => navigate(getDetailLink(n.role, n._id))}
                                        >
                                            Audit Details
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredNodes.length === 0 && <div style={noDataTxt}>No registry nodes matching your search criteria.</div>}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .rkd-spinner-master { width: 50px; height: 50px; border: 5px solid #e2e8f0; border-top: 5px solid ${themeColor}; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

// --- Specialized Styling ---

const headerSection = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px' };
const titleStyle = { margin:0, fontWeight:'900', fontSize:'28px', color:'#0f172a', letterSpacing:'-1px' };
const subtitleStyle = { color:'#64748b', margin:'5px 0 0 0', fontSize:'14px' };
const statsBadge = { background:'#fff', padding:'10px 20px', borderRadius:'14px', border:'1.5px solid #e2e8f0', color:'#475569', fontWeight:'800', fontSize:'13px' };

const toolbarStyle = { display:'flex', gap:'15px', marginBottom:'25px', flexWrap:'wrap' };
const searchWrapper = { display:'flex', alignItems:'center', gap:'12px', background:'#fff', padding:'0 18px', borderRadius:'15px', border:'1.5px solid #e2e8f0', flex:1 };
const inputStyle = { border:'none', padding:'14px 0', outline:'none', fontSize:'14px', width:'100%', fontWeight:'600', background:'transparent' };
const selectStyle = { padding:'14px 20px', borderRadius:'15px', border:'1.5px solid #e2e8f0', background:'#fff', fontWeight:'700', color:'#475569', outline:'none', cursor:'pointer' };
const refreshBtn = (col) => ({ padding:'14px 20px', borderRadius:'15px', border:'none', background:`${col}10`, color:col, fontWeight:'800', cursor:'pointer', fontSize:'13px' });

const tableContainer = { background:'#fff', borderRadius:'25px', border:'1px solid #e2e8f0', overflowX:'auto', boxShadow:'0 15px 40px rgba(0,0,0,0.03)' };
const mainTable = { width:'100%', borderCollapse:'collapse', textAlign:'left' };
const tableHeaderRow = { background:'#f8fafc', borderBottom:'2px solid #f1f5f9' };
const thStyle = { padding:'20px', fontSize:'11px', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:'850' };
const tdStyle = { padding:'18px 20px', fontSize:'14px', borderBottom:'1px solid #f8fafc' };
const trStyle = { transition:'0.2s ease' };

const identityCell = { display:'flex', alignItems:'center', gap:'15px' };
const avatarStyle = { width:'45px', height:'45px', borderRadius:'15px', objectFit:'cover', border:'2.5px solid #f1f5f9' };
const initialsAvatar = (col) => ({ width:'45px', height:'45px', borderRadius:'15px', background:`${col}10`, color:col, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'18px', border:`2px solid ${col}20` });
const nameTxt = { fontWeight:'800', color:'#1e293b', fontSize:'15px' };
const mobileTxt = { fontSize:'12px', color:'#64748b', marginTop:'2px', fontWeight:'600' };
const selfTag = { background:'#fef3c7', color:'#d97706', padding:'2px 6px', borderRadius:'6px', fontSize:'9px', marginLeft:'8px' };

const roleBadgeStyle = (role) => {
    const config = {
        SystemAdmin: { bg:'#fff1f2', txt:'#f43f5e' },
        SubSystemAdmin: { bg:'#f5f3ff', txt:'#8b5cf6' },
        StateAdmin: { bg:'#eff6ff', txt:'#2563eb' },
        DistrictAdmin: { bg:'#ecfdf5', txt:'#10b981' },
        Customer: { bg:'#f1f5f9', txt:'#475569' }
    }[role] || { bg:'#f8fafc', txt:'#94a3b8' };

    return { padding:'6px 12px', borderRadius:'10px', fontSize:'10px', fontWeight:'900', background:config.bg, color:config.txt, textTransform:'uppercase' };
};

const idBadge = { background:'#f8fafc', padding:'6px 10px', borderRadius:'8px', fontWeight:'700', color:'#475569', fontSize:'11px', border:'1px solid #eef2f6' };
const jurisdictionTxt = { fontWeight:'700', color:'#64748b', fontSize:'12px' };

const statusBtnStyle = (active, isRoot) => ({
    border: 'none',
    background: isRoot ? '#f1f5f9' : (active ? '#ecfdf5' : '#fff1f2'),
    color: isRoot ? '#94a3b8' : (active ? '#10b981' : '#ef4444'),
    padding: '8px 14px',
    borderRadius: '12px',
    cursor: isRoot ? 'not-allowed' : 'pointer',
    fontWeight: '800',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    opacity: isRoot ? 0.6 : 1
});

const dotS = (active) => ({ width:'7px', height:'7px', borderRadius:'50%', background: active ? '#10b981':'#ef4444' });

const manageBtn = (col) => ({ 
    background: col, color: '#fff', border: 'none', padding: '10px 18px', 
    borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: '800',
    boxShadow: `0 6px 15px ${col}30`
});

const immutableLabel = { fontSize:'10px', fontWeight:'900', color:'#94a3b8', letterSpacing:'1px' };
const noDataTxt = { padding:'100px', textAlign:'center', color:'#cbd5e1', fontWeight:'800', fontSize:'18px' };
const loaderWrapper = { height:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' };

const getDetailLink = (role, id) => {
    if (role === 'StateAdmin') return `/admin/stateadmin-details/${id}`;
    if (role === 'DistrictAdmin') return `/admin/district-admin-details/${id}`;
    if (role === 'Customer') return `/admin/users`; // ग्राहकों के लिए मुख्य कस्टमर पेज पर भेजें
    return `/admin/subadmin-details/${id}`;
};

export default AllAdminNodes;