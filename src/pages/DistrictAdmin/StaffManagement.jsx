import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import api from '../../services/api';

const StaffManagement = () => {
    const { user } = useAuth();
    const { settings } = useBranding();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [assignData, setAssignData] = useState({
        department: '',
        permissions: {}
    });

    const themeColor = settings?.themeColor || '#0d9488';

    useEffect(() => {
        fetchStaff();
    }, [filter]);

    const fetchStaff = async () => {
        try {
            const response = await api.get('/admin/enhanced/staff', {
                params: { 
                    status: filter === 'all' ? 'all' : filter,
                    limit: 100
                }
            });
            if (response.data.success) {
                setStaff(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignDepartment = async (e) => {
        e.preventDefault();
        if (!selectedStaff || !assignData.department) {
            alert('विभाग चुनें');
            return;
        }

        try {
            const response = await api.put(
                `/admin/enhanced/staff/${selectedStaff._id}/department`,
                assignData
            );
            if (response.data.success) {
                alert('विभाग सफलतापूर्वक असाइन किया गया');
                setShowAssignForm(false);
                setSelectedStaff(null);
                fetchStaff();
            }
        } catch (error) {
            alert('त्रुटि: ' + error.message);
        }
    };

    const getStaffByStatus = () => {
        if (filter === 'all') return staff;
        return staff.filter(s => (s.isActive ? 'active' : 'inactive') === filter);
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>लोड हो रहा है...</div>;
    }

    const filteredStaff = getStaffByStatus();

    return (
        <div style={containerStyle}>
            <div style={headerStyle(themeColor)}>
                <h1 style={{ margin: 0, fontSize: '24px' }}>👥 कर्मचारी प्रबंधन</h1>
            </div>

            {/* Assign Department Form */}
            {showAssignForm && selectedStaff && (
                <div style={formContainerStyle}>
                    <form onSubmit={handleAssignDepartment} style={formStyle}>
                        <h3>{selectedStaff.fullName} को विभाग असाइन करें</h3>

                        <div style={formGroupStyle}>
                            <label>विभाग चुनें *</label>
                            <select
                                value={assignData.department}
                                onChange={(e) => setAssignData({ ...assignData, department: e.target.value })}
                                required
                                style={inputStyle}
                            >
                                <option value="">-- चुनें --</option>
                                <option value="ShopManagement">🏬 दुकान प्रबंधन</option>
                                <option value="OrderManagement">📦 आदेश प्रबंधन</option>
                                <option value="Finance">💰 वित्त</option>
                                <option value="Support">📞 ग्राहक सहायता</option>
                                <option value="Inventory">🛒 भंडार प्रबंधन</option>
                            </select>
                        </div>

                        <div style={permissionCheckboxStyle}>
                            <label>अनुमतियां (वैकल्पिक)</label>
                            <div>
                                {['read_data', 'create_data', 'update_data', 'delete_data'].map(perm => (
                                    <label key={perm} style={{ display: 'block', margin: '5px 0' }}>
                                        <input
                                            type="checkbox"
                                            checked={assignData.permissions[perm] || false}
                                            onChange={(e) => setAssignData({
                                                ...assignData,
                                                permissions: {
                                                    ...assignData.permissions,
                                                    [perm]: e.target.checked
                                                }
                                            })}
                                        />
                                        {perm}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={btnGroupStyle}>
                            <button type="submit" style={{ ...btnStyle(themeColor), flex: 1 }}>
                                ✅ असाइन करें
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAssignForm(false);
                                    setSelectedStaff(null);
                                }}
                                style={{ ...btnStyle('#999'), flex: 1 }}
                            >
                                ✕ रद्द करें
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter Buttons */}
            <div style={filterStyle}>
                {['all', 'active', 'inactive'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        style={{
                            ...filterBtnStyle(themeColor),
                            backgroundColor: filter === status ? themeColor : '#f0f0f0',
                            color: filter === status ? 'white' : '#333'
                        }}
                    >
                        {status === 'all' ? 'सभी' : status === 'active' ? 'सक्रिय' : 'निष्क्रिय'}
                    </button>
                ))}
            </div>

            {/* Staff Table */}
            <div style={tableContainerStyle}>
                <table style={tableStyle}>
                    <thead style={tableHeadStyle(themeColor)}>
                        <tr>
                            <th>नाम</th>
                            <th>भूमिका</th>
                            <th>विभाग</th>
                            <th>स्थिति</th>
                            <th>जॉइन तारीख</th>
                            <th>कार्रवाई</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStaff.length > 0 ? (
                            filteredStaff.map((s, idx) => (
                                <tr key={s._id} style={tableRowStyle(idx)}>
                                    <td>
                                        <strong>{s.fullName}</strong>
                                        <p style={{ margin: '3px 0', color: '#999', fontSize: '12px' }}>
                                            {s.email}
                                        </p>
                                    </td>
                                    <td>{s.role}</td>
                                    <td>
                                        <span style={badgeStyle(themeColor)}>
                                            {s.department || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            backgroundColor: s.isActive ? '#4CAF50' : '#f44336',
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '3px',
                                            fontSize: '12px'
                                        }}>
                                            {s.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                                        </span>
                                    </td>
                                    <td>{new Date(s.createdAt).toLocaleDateString('hi-IN')}</td>
                                    <td>
                                        <button
                                            onClick={() => {
                                                setSelectedStaff(s);
                                                setShowAssignForm(true);
                                            }}
                                            style={actionBtnStyle(themeColor)}
                                        >
                                            📝 विभाग
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                    कोई कर्मचारी नहीं मिले
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Stats */}
            <div style={statsGridStyle}>
                <StatCard 
                    title="कुल कर्मचारी"
                    value={staff.length}
                    icon="👥"
                    themeColor={themeColor}
                />
                <StatCard
                    title="सक्रिय"
                    value={staff.filter(s => s.isActive).length}
                    icon="✅"
                    themeColor={themeColor}
                />
                <StatCard
                    title="विभाग असाइन किए गए"
                    value={staff.filter(s => s.department).length}
                    icon="📂"
                    themeColor={themeColor}
                />
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, themeColor }) => (
    <div style={statCardStyle(themeColor)}>
        <span style={{ fontSize: '28px' }}>{icon}</span>
        <p style={{ margin: '10px 0 5px 0', color: '#666' }}>{title}</p>
        <h2 style={{ margin: 0, color: themeColor, fontSize: '24px' }}>{value}</h2>
    </div>
);

// ==================== STYLES ====================

const containerStyle = {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto'
};

const headerStyle = (themeColor) => ({
    backgroundColor: themeColor,
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px'
});

const formContainerStyle = {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #e0e0e0'
};

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
};

const formGroupStyle = {
    display: 'flex',
    flexDirection: 'column'
};

const inputStyle = {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    fontFamily: 'inherit'
};

const permissionCheckboxStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
};

const btnGroupStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
};

const btnStyle = (color) => ({
    padding: '10px 20px',
    backgroundColor: color,
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
});

const filterStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap'
};

const filterBtnStyle = (themeColor) => ({
    padding: '8px 16px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.3s'
});

const tableContainerStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'auto',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
};

const tableHeadStyle = (themeColor) => ({
    backgroundColor: themeColor,
    color: 'white',
    fontWeight: '600'
});

const tableRowStyle = (idx) => ({
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9f9f9',
    padding: '12px'
});

const badgeStyle = (themeColor) => ({
    backgroundColor: themeColor + '20',
    color: themeColor,
    padding: '4px 8px',
    borderRadius: '3px',
    fontSize: '12px',
    fontWeight: '600'
});

const actionBtnStyle = (themeColor) => ({
    padding: '6px 12px',
    backgroundColor: themeColor,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
});

const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginTop: '20px'
};

const statCardStyle = (themeColor) => ({
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    borderLeft: `5px solid ${themeColor}`,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center'
});

export default StaffManagement;
