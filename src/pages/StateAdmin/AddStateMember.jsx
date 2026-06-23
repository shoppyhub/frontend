import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useBranding } from '../../context/BrandingContext';
import { toast } from 'react-toastify';

const AddStateMember = ({ role, stateName, onBack }) => {
    const { settings } = useBranding();
    const [loading, setLoading] = useState(false);
    const [districts, setDistricts] = useState([]);
    
    const themeColor = settings?.themeColor || '#4f46e5';

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        password: '',
        assignedDistrict: '',
        department: role === 'StateOperator' ? 'Operations' : 'Administration',
        accessLevel: role === 'DistrictAdmin' ? 'District_Full' : 'State_Restricted'
    });

    // 1. Fetch Districts for the assigned State
    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                // Fetching districts dynamically based on the state name
                const res = await api.get(`/admin/directories/locations?state=${stateName}`);
                if (res.data.success && res.data.data[0]) {
                    setDistricts(res.data.data[0].districts.map(d => d.name));
                }
            } catch (err) {
                console.error("Location Sync Error");
                // Fallback for UI testing
                setDistricts(["Jaipur", "Jodhpur", "Kota", "Udaipur", "Ajmer", "Bikaner"]);
            }
        };
        fetchDistricts();
    }, [stateName]);

    // 2. Provisioning Logic (Submit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                role: role, // DistrictAdmin or StateOperator
                assignedState: stateName
            };

            const res = await api.post('/admin/hierarchy/provision-member', payload);
            
            if (res.data.success) {
                toast.success(`Success: ${role} Node provisioned for ${stateName}!`);
                onBack();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Provisioning Protocol Failed.");
        } finally {
            setLoading(false);
        }
    };

    const inputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <div style={containerS}>
            {/* Action Bar */}
            <div style={actionBar}>
                <button onClick={onBack} style={backBtn}>← ABORT & RETURN</button>
                <div style={nodeLabel}>
                    <span style={dot}></span> JURISDICTION: {stateName?.toUpperCase()}
                </div>
            </div>

            <div style={formCard}>
                <div style={formHeader(themeColor)}>
                    <h2 style={titleS}>➕ Provision New {role === 'DistrictAdmin' ? 'District Admin' : 'State Operator'}</h2>
                    <p style={subTitleS}>Deploy an authorized administrative node into the <b>{stateName}</b> regional cluster.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={gridForm}>
                        {/* Column 1: Personal Profile */}
                        <div style={sectionS}>
                            <h4 style={secHead}>👤 IDENTITY PROFILE</h4>
                            <div style={inputGroup}>
                                <label style={labS}>Full Legal Name *</label>
                                <input name="fullName" style={inS} onChange={inputChange} required placeholder="Enter full name" />
                            </div>
                            <div style={inputGroup}>
                                <label style={labS}>Mobile Identifier *</label>
                                <input name="mobile" maxLength="10" style={inS} onChange={inputChange} required placeholder="10-digit mobile" />
                            </div>
                            <div style={inputGroup}>
                                <label style={labS}>Departmental Unit</label>
                                <input name="department" value={formData.department} style={inS} onChange={inputChange} />
                            </div>
                        </div>

                        {/* Column 2: Access Credentials */}
                        <div style={sectionS}>
                            <h4 style={secHead}>🔐 ACCESS CREDENTIALS</h4>
                            <div style={inputGroup}>
                                <label style={labS}>Institutional Email (Login ID) *</label>
                                <input type="email" name="email" style={inS} onChange={inputChange} required placeholder="example@rkdmart.com" />
                            </div>
                            <div style={inputGroup}>
                                <label style={labS}>Secure Access Key (Password) *</label>
                                <input type="password" name="password" style={inS} onChange={inputChange} required placeholder="••••••••••••" />
                            </div>
                            
                            {role === 'DistrictAdmin' && (
                                <div style={inputGroup}>
                                    <label style={labS}>Assigned District Authority *</label>
                                    <select name="assignedDistrict" style={inS} onChange={inputChange} required>
                                        <option value="">-- SELECT DISTRICT --</option>
                                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Action Section */}
                    <div style={footerRow}>
                        <div style={noticeS}>
                            <b>Security Note:</b> Provisioning a new administrative node will grant system access 
                            immediately. Credentials will be logged under State Master Registry.
                        </div>
                        <button type="submit" disabled={loading} style={submitBtn(themeColor)}>
                            {loading ? "COMMITTING TO REGISTRY..." : `DEPLOY ${role.toUpperCase()} NODE`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Enterprise Style Definitions ---

const containerS = { animation: 'fadeIn 0.5s ease-out', maxWidth: '1000px', margin: '0 auto' };

const actionBar = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const backBtn = { background: '#0f172a', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '12px', letterSpacing: '1px' };
const nodeLabel = { background: '#f1f5f9', padding: '8px 15px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', color: '#64748b' };
const dot = { width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%', display: 'inline-block', marginRight: '8px' };

const formCard = { background: '#fff', borderRadius: '30px', border: '1px solid #f1f5f9', boxShadow: '0 20px 50px rgba(0,0,0,0.02)', overflow: 'hidden' };

const formHeader = (color) => ({ padding: '40px', background: `${color}05`, borderBottom: '1px solid #f1f5f9' });
const titleS = { margin: 0, color: '#0f172a', fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' };
const subTitleS = { color: '#64748b', margin: '8px 0 0 0', fontSize: '14px', lineHeight: '1.5' };

const gridForm = { 
    display: 'grid', 
    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', 
    gap: '40px', 
    padding: '40px' 
};

const sectionS = { display: 'flex', flexDirection: 'column', gap: '20px' };
const secHead = { fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1.5px', marginBottom: '10px', borderBottom: '1px solid #f8fafc', paddingBottom: '10px' };

const inputGroup = { display: 'flex', flexDirection: 'column', gap: '10px' };
const labS = { fontSize: '11px', fontWeight: '900', color: '#475569', textTransform: 'uppercase' };
const inS = { padding: '15px', borderRadius: '14px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '14px', fontWeight: '700', transition: '0.3s', background: '#f8fafc' };

const footerRow = { padding: '30px 40px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' };
const noticeS = { flex: 1, maxWidth: '500px', fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' };

const submitBtn = (color) => ({ 
    padding: '18px 40px', background: color, color: '#fff', border: 'none', 
    borderRadius: '16px', fontWeight: '900', fontSize: '14px', cursor: 'pointer',
    boxShadow: `0 10px 20px ${color}33`, transition: '0.3s' 
});

export default AddStateMember;