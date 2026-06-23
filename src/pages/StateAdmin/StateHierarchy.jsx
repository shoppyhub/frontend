import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useBranding } from '../../context/BrandingContext';
import { toast } from 'react-toastify';
import AddStateMember from './AddStateMember';

const StateHierarchy = ({ targetTab, stateName }) => {
    const { settings } = useBranding();
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const themeColor = settings?.themeColor || '#4f46e5';

    // 1. Role Identification
    const roleMapping = {
        'districts': 'DistrictAdmin',
        'operators': 'StateOperator'
    };
    const currentRole = roleMapping[targetTab] || 'DistrictAdmin';

    // 2. Fetch Data
    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/hierarchy/members?role=${currentRole}`);
            if (res.data.success) {
                setMembers(res.data.data || []);
            }
        } catch (err) {
            console.error("Sync Error");
            toast.error("Registry synchronization failed.");
        } finally {
            setLoading(false);
        }
    }, [currentRole]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    // 3. Excel Export Logic (Pending Reports)
    const downloadExcelReport = () => {
        if (members.length === 0) return toast.info("No data available to export.");
        
        // CSV Header
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Admin ID,Name,Father Name,Designation,Mobile,Email,Status,Jurisdiction\n";

        // Row Mapping
        members.forEach(m => {
            const row = [
                m.generatedId || 'N/A',
                m.fullName,
                m.fatherName || 'N/A',
                currentRole,
                m.mobile,
                m.email,
                m.isActive ? 'Active' : 'Suspended',
                m.assignedDistrict || stateName
            ].join(",");
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Pending_Report_${stateName}_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Excel Report Generated Successfully!");
    };

    if (view === 'form') {
        return (
            <AddStateMember 
                role={currentRole} 
                stateName={stateName} 
                onBack={() => { setView('list'); fetchMembers(); }} 
            />
        );
    }

    return (
        <div style={containerS}>
            {/* Header Module */}
            <div style={headerFlex}>
                <div style={headTxt}>
                    <h2 style={titleS}>📋 {currentRole.replace('Admin', ' Admin')} Command Registry</h2>
                    <p style={subS}>Administrative oversight for <b>{stateName}</b> regional nodes.</p>
                </div>
                
                <div style={actionRow}>
                    <div style={searchWrapper}>
                        <span>🔍</span>
                        <input 
                            style={searchIn} 
                            placeholder="Search Admin or ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {/* Excel Download Button */}
                    <button onClick={downloadExcelReport} style={excelBtn}>
                        📊 Download Pending Report
                    </button>

                    <button onClick={() => setView('form')} style={addBtn(themeColor)}>
                        + Provision New {currentRole === 'DistrictAdmin' ? 'District Admin' : 'Operator'}
                    </button>
                </div>
            </div>

            {/* Registry Table */}
            <div style={tableCard}>
                <div style={{ overflowX: 'auto' }}> 
                    {loading ? (
                        <div style={loadingArea}>
                            <div className="spinner-small"></div>
                            <p>Loading Regional Registry...</p>
                        </div>
                    ) : (
                        <table style={tableS}>
                            <thead>
                                <tr style={thRow}>
                                    <th style={thS}>ADMIN IDENTITY</th>
                                    <th style={thS}>ADMIN ID</th>
                                    <th style={thS}>DESIGNATION</th>
                                    <th style={thS}>CONTACT IDENTIFIER</th>
                                    <th style={thS}>STATUS</th>
                                    <th style={thS}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.length === 0 ? (
                                    <tr><td colSpan="6" style={emptyMsg}>No nodes discovered.</td></tr>
                                ) : (
                                    members.filter(m => 
                                        m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        m.generatedId?.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map((m) => (
                                        <tr key={m._id} style={trS}>
                                            {/* Column 1: Profile */}
                                            <td style={tdS}>
                                                <div style={profileBox}>
                                                    <img 
                                                        src={m.photo || m.adminPhoto || 'https://via.placeholder.com/40'} 
                                                        alt="Admin" 
                                                        style={avatarS} 
                                                    />
                                                    <div>
                                                        <div style={uNameTxt}>{m.fullName}</div>
                                                        <small style={fatherTxt}>S/O: {m.fatherName || 'Not Provided'}</small>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Column 2: ID */}
                                            <td style={tdS}>
                                                <span style={idBadge}>{m.generatedId || 'PENDING'}</span>
                                            </td>

                                            {/* Column 3: Designation */}
                                            <td style={tdS}>
                                                <div style={desigBox(themeColor)}>
                                                    {currentRole === 'DistrictAdmin' ? `📍 ${m.assignedDistrict}` : '🏢 STATE_OPERATOR'}
                                                </div>
                                            </td>

                                            {/* Column 4: Contact */}
                                            <td style={tdS}>
                                                <div style={contactBox}>
                                                    <div style={mobileS}>📞 {m.mobile}</div>
                                                    <div style={emailS}>✉️ {m.email}</div>
                                                </div>
                                            </td>

                                            {/* Column 5: Status */}
                                            <td style={tdS}>
                                                <div style={statusRow}>
                                                    <span className={m.isActive ? "online-dot" : "offline-dot"}></span>
                                                    <span style={statusTxt}>{m.isActive ? 'ACTIVE' : 'SUSPENDED'}</span>
                                                </div>
                                            </td>

                                            {/* Column 6: Action */}
                                            <td style={tdS}>
                                                <button style={manageBtn(themeColor)} onClick={() => toast.info("Opening Admin Console...")}>
                                                    ⚙️ Manage Admin
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <style>{`
                .spinner-small { width: 25px; height: 25px; border: 3px solid #f1f5f9; border-top: 3px solid ${themeColor}; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 10px; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .online-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; margin-right: 8px; box-shadow: 0 0 10px #10b981; }
                .offline-dot { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; display: inline-block; margin-right: 8px; }
            `}</style>
        </div>
    );
};

// --- Styles ---

const containerS = { animation: 'fadeIn 0.5s ease' };
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '35px', flexWrap: 'wrap', gap: '20px' };
const headTxt = { flex: 1 };
const titleS = { margin: 0, color: '#0f172a', fontSize: '26px', fontWeight: '900', letterSpacing: '-0.5px' };
const subS = { color: '#64748b', margin: '5px 0 0 0', fontSize: '14px' };

const actionRow = { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' };
const searchWrapper = { display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '0 15px', borderRadius: '12px', border: '1.5px solid #f1f5f9' };
const searchIn = { border: 'none', padding: '12px', outline: 'none', fontSize: '13px', fontWeight: '600', width: '180px' };

const excelBtn = { background: '#fff', color: '#10b981', border: '1.5px solid #10b981', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '13px' };
const addBtn = (color) => ({ background: color, color: '#fff', border: 'none', padding: '13px 22px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '13px', boxShadow: `0 8px 20px ${color}33` });

const tableCard = { background: '#fff', borderRadius: '25px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' };
const tableS = { width: '100%', borderCollapse: 'collapse', minWidth: '1000px' };
const thRow = { backgroundColor: '#f8fafc' };
const thS = { padding: '20px', textAlign: 'left', color: '#94a3b8', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' };
const trS = { borderBottom: '1px solid #f8fafc', transition: '0.2s' };
const tdS = { padding: '15px 20px', verticalAlign: 'middle' };

const profileBox = { display: 'flex', alignItems: 'center', gap: '12px' };
const avatarS = { width: '45px', height: '45px', borderRadius: '12px', objectFit: 'cover', background: '#f1f5f9' };
const uNameTxt = { color: '#1e293b', fontWeight: '800', fontSize: '14px' };
const fatherTxt = { color: '#94a3b8', fontSize: '11px', fontWeight: '600' };

const idBadge = { background: '#f1f5f9', color: '#475569', padding: '5px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '11px', fontFamily: 'monospace' };
const desigBox = (c) => ({ color: c, fontWeight: '800', fontSize: '12px', background: `${c}10`, padding: '6px 12px', borderRadius: '8px', display: 'inline-block' });

const contactBox = { display: 'flex', flexDirection: 'column', gap: '4px' };
const mobileS = { fontSize: '13px', fontWeight: '700', color: '#475569' };
const emailS = { fontSize: '12px', color: '#94a3b8', fontWeight: '600' };

const statusRow = { display: 'flex', alignItems: 'center' };
const statusTxt = { color: '#475569', fontWeight: '800', fontSize: '11px' };

const manageBtn = (c) => ({ background: '#0f172a', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '12px', transition: '0.3s' });

const loadingArea = { padding: '60px', textAlign: 'center', color: '#94a3b8' };
const emptyMsg = { padding: '60px', textAlign: 'center', color: '#94a3b8' };

export default StateHierarchy;