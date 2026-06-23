import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api'; 
import { useBranding } from '../../context/BrandingContext';
import { toast } from 'react-toastify';

/**
 * RKD_MART - DISTRICT HIERARCHY MANAGEMENT
 * ✅ FIXED: District-Specific Operator Registration Path Linked
 */
import DistOperatorRegister from './DistOperator/DistOperatorRegister'; 

const DistrictHierarchy = () => {
    const { settings } = useBranding();
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState(null); // Tracking status updates

    const themeColor = settings?.themeColor || '#0d9488';

    // 1. Fetch District Operators registry
    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            // डिस्ट्रिक्ट एडमिन के लिए ऑपरेटरों की सूची (Backend token-based filtering करेगा)
            const res = await api.get(`/admin/hierarchy/members?role=DistrictOperator`);
            if (res.data.success) {
                setMembers(res.data.data || []);
            }
        } catch (err) {
            console.error("Infrastructure Sync Failure:", err);
            toast.error("Failed to synchronize operator node registry.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    // 2. Toggle Node Status (Active / Suspended)
    const toggleStatus = async (id, currentStatus) => {
        setTogglingId(id);
        try {
            const res = await api.patch(`/admin/hierarchy/status/${id}`, { 
                isActive: !currentStatus 
            });
            if (res.data.success) {
                toast.success(`Security Protocol: Node status updated.`);
                // Local state update for smooth UX
                setMembers(prev => prev.map(m => m._id === id ? { ...m, isActive: !currentStatus } : m));
            }
        } catch (err) {
            toast.error("Status update failed.");
        } finally {
            setTogglingId(null);
        }
    };

    // 3. Remove Operator Node (Terminate Access)
    const handleDelete = async (id, name) => {
        if (!window.confirm(`CRITICAL WARNING: Permanently terminate all system access for "${name}"? This action is irreversible.`)) return;
        
        try {
            const res = await api.delete(`/admin/hierarchy/remove/${id}`);
            if (res.data.success) {
                toast.success(`Access Revoked: ${name} purged from district node.`);
                fetchMembers();
            }
        } catch (err) {
            toast.error("Termination protocol failed.");
        }
    };

    // --- SUB-MODULE: REGISTRATION FORM ---
    if (view === 'form') {
        return (
            <DistOperatorRegister 
                onBack={() => { 
                    setView('list'); 
                    fetchMembers(); 
                }} 
            />
        );
    }

    // --- MAIN MODULE: OPERATOR LIST ---
    return (
        <div style={containerS}>
            {/* Header HUD */}
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>🎧 District Operators Registry</h2>
                    <p style={subTitleS}>Managing secure operational nodes for support and verification.</p>
                </div>
                <button onClick={() => setView('form')} style={addBtn(themeColor)}>
                    + Provision New Operator Node
                </button>
            </div>

            {/* Main Table Interface */}
            <div style={tableCard}>
                <div style={{ overflowX: 'auto' }}> 
                    {loading ? (
                        <div style={loadingArea}>
                            <div className="spinner-small" style={{borderTopColor: themeColor}}></div>
                            <p>Scoping Infrastructure Registry...</p>
                        </div>
                    ) : (
                        <table style={tableS}>
                            <thead>
                                <tr style={thRow}>
                                    <th style={thS}>Operator Identity</th>
                                    <th style={thS}>System ID</th>
                                    <th style={thS}>Assigned Block</th>
                                    <th style={thS}>Security Status</th>
                                    <th style={thS}>Operational Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={emptyMsg}>
                                            <div style={{fontSize:'30px', marginBottom:'10px'}}>📡</div>
                                            No active operator nodes detected in this district jurisdiction.
                                        </td>
                                    </tr>
                                ) : (
                                    members.map(m => (
                                        <tr key={m._id} style={trS}>
                                            <td style={tdS}>
                                                <div style={identityFlex}>
                                                    <img 
                                                        src={m.photo || m.displayPhoto || m.operatorPhoto || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                                                        alt="Profile" 
                                                        style={avatarS} 
                                                    />
                                                    <div>
                                                        <div style={nameTxt}>{m.fullName}</div>
                                                        <small style={emailTxt}>{m.email}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={tdS}>
                                                <span style={idBadge}>{m.generatedId || 'PENDING'}</span>
                                            </td>
                                            <td style={tdS}>
                                                <span style={deptTag}>{m.assignedBlock || m.department || 'District HQ'}</span>
                                            </td>
                                            <td style={tdS}>
                                                <div 
                                                    style={statusToggle(m.isActive)} 
                                                    onClick={() => togglingId !== m._id && toggleStatus(m._id, m.isActive)}
                                                >
                                                    <div style={toggleCircle(m.isActive)}></div>
                                                    <span style={statusLabel}>{m.isActive ? 'ACTIVE' : 'SUSPENDED'}</span>
                                                </div>
                                            </td>
                                            <td style={tdS}>
                                                <button 
                                                    onClick={() => handleDelete(m._id, m.fullName)} 
                                                    style={terminateBtn}
                                                >
                                                    Terminate
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
                .spinner-small { width: 30px; height: 30px; border: 3px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Definitions (SaaS Aesthetic) ---

const containerS = { animation: 'fadeIn 0.5s ease-out', padding: window.innerWidth < 768 ? '10px' : '0' };

const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', flexWrap: 'wrap', gap: '20px' };
const titleS = { margin: 0, color: '#0f172a', fontSize: '26px', fontWeight: '900', letterSpacing: '-0.5px' };
const subTitleS = { color: '#64748b', margin: '5px 0 0 0', fontSize: '14px', fontWeight: '500' };

const addBtn = (color) => ({ 
    background: color, color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '14px', 
    cursor: 'pointer', fontWeight: '800', fontSize: '14px', boxShadow: `0 8px 20px ${color}33`, transition: '0.3s'
});

const tableCard = { background: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 15px 40px rgba(0,0,0,0.02)' };
const tableS = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' };
const thRow = { backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' };
const thS = { padding: '20px', fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' };

const trS = { transition: '0.2s', borderBottom: '1px solid #f8fafc' };
const tdS = { padding: '18px 20px', verticalAlign: 'middle' };

const identityFlex = { display: 'flex', alignItems: 'center', gap: '15px' };
const avatarS = { width: '42px', height: '42px', borderRadius: '12px', objectFit: 'cover', background: '#f1f5f9', border: '1px solid #e2e8f0' };
const nameTxt = { fontWeight: '800', color: '#1e293b', fontSize: '15px' };
const emailTxt = { color: '#64748b', fontSize: '12px', fontWeight: '500' };

const idBadge = { background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', color: '#475569', border: '1px solid #e2e8f0' };
const deptTag = { color: '#0d9488', fontWeight: '700', fontSize: '13px', background: '#f0fdfa', padding: '4px 10px', borderRadius: '6px' };

const statusToggle = (active) => ({
    width: '100px', padding: '4px', background: active ? '#ecfdf5' : '#fff1f2',
    borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px',
    cursor: 'pointer', border: `1px solid ${active ? '#d1fae5' : '#fee2e2'}`,
    transition: '0.3s'
});
const toggleCircle = (active) => ({
    width: '12px', height: '12px', background: active ? '#10b981' : '#f43f5e',
    borderRadius: '50%', boxShadow: `0 0 8px ${active ? '#10b981' : '#f43f5e'}`
});
const statusLabel = { fontSize: '9px', fontWeight: '900', letterSpacing: '0.5px' };

const terminateBtn = { 
    background: 'none', color: '#94a3b8', border: '1px solid #e2e8f0', padding: '8px 15px', 
    borderRadius: '10px', cursor: 'pointer', fontSize: '11px', fontWeight: '800', transition: '0.3s' 
};

const loadingArea = { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px' };
const emptyMsg = { textAlign: 'center', padding: '80px', color: '#94a3b8', fontSize: '14px', fontWeight: '600' };

export default DistrictHierarchy;