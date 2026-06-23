import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import api from '../../services/api';

const TaskManagement = () => {
    const { user } = useAuth();
    const { settings } = useBranding();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedTo: '',
        department: '',
        priority: 'Medium',
        dueDate: ''
    });
    const [filter, setFilter] = useState('all');
    const [staff, setStaff] = useState([]);

    const themeColor = settings?.themeColor || '#0d9488';

    useEffect(() => {
        fetchTasks();
        fetchStaff();
    }, [filter]);

    const fetchTasks = async () => {
        try {
            const response = await api.get('/admin/enhanced/tasks', {
                params: { status: filter === 'all' ? 'all' : filter }
            });
            if (response.data.success) {
                setTasks(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const response = await api.get('/admin/enhanced/staff', {
                params: { limit: 100 }
            });
            if (response.data.success) {
                setStaff(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/admin/enhanced/tasks/create', formData);
            if (response.data.success) {
                alert('कार्य सफलतापूर्वक बनाया गया');
                setFormData({
                    title: '',
                    description: '',
                    assignedTo: '',
                    department: '',
                    priority: 'Medium',
                    dueDate: ''
                });
                setShowCreateForm(false);
                fetchTasks();
            }
        } catch (error) {
            alert('त्रुटि: ' + error.response?.data?.message || error.message);
        }
    };

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            const response = await api.put(`/admin/enhanced/tasks/${taskId}/status`, {
                status: newStatus
            });
            if (response.data.success) {
                fetchTasks();
                alert('कार्य स्थिति अद्यतन की गई');
            }
        } catch (error) {
            alert('त्रुटि: ' + error.message);
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>लोड हो रहा है...</div>;
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle(themeColor)}>
                <h1 style={{ margin: 0, fontSize: '24px' }}>✅ कार्य प्रबंधन</h1>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    style={btnStyle(themeColor)}
                >
                    {showCreateForm ? '✕ बंद करें' : '➕ नया कार्य'}
                </button>
            </div>

            {/* Create Task Form */}
            {showCreateForm && (
                <div style={formContainerStyle}>
                    <form onSubmit={handleCreateTask} style={formStyle}>
                        <div style={formGroupStyle}>
                            <label>कार्य शीर्षक *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                style={inputStyle}
                                placeholder="कार्य का नाम"
                            />
                        </div>

                        <div style={formGroupStyle}>
                            <label>विवरण</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                placeholder="कार्य का विवरण"
                            />
                        </div>

                        <div style={formRowStyle}>
                            <div style={{ flex: 1, marginRight: '10px' }}>
                                <label>कर्मचारी को असाइन करें *</label>
                                <select
                                    value={formData.assignedTo}
                                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                    required
                                    style={inputStyle}
                                >
                                    <option value="">-- चुनें --</option>
                                    {staff.map(s => (
                                        <option key={s._id} value={s._id}>
                                            {s.fullName} ({s.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ flex: 1, marginRight: '10px' }}>
                                <label>विभाग *</label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    required
                                    style={inputStyle}
                                >
                                    <option value="">-- चुनें --</option>
                                    <option value="ShopManagement">दुकान प्रबंधन</option>
                                    <option value="OrderManagement">आदेश प्रबंधन</option>
                                    <option value="Finance">वित्त</option>
                                    <option value="Support">सहायता</option>
                                    <option value="Inventory">भंडार</option>
                                </select>
                            </div>

                            <div style={{ flex: 1 }}>
                                <label>प्राथमिकता</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="Low">निम्न</option>
                                    <option value="Medium">मध्यम</option>
                                    <option value="High">उच्च</option>
                                </select>
                            </div>
                        </div>

                        <div style={formGroupStyle}>
                            <label>समय सीमा</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                style={inputStyle}
                            />
                        </div>

                        <button type="submit" style={{ ...btnStyle(themeColor), width: '100%' }}>
                            ✅ कार्य सृजित करें
                        </button>
                    </form>
                </div>
            )}

            {/* Filter Buttons */}
            <div style={filterStyle}>
                {['all', 'Assigned', 'Completed', 'InProgress'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        style={{
                            ...filterBtnStyle(themeColor),
                            backgroundColor: filter === status ? themeColor : '#f0f0f0',
                            color: filter === status ? 'white' : '#333'
                        }}
                    >
                        {status === 'all' ? 'सभी' : status === 'Assigned' ? 'निर्धारित' : status === 'Completed' ? 'पूर्ण' : 'प्रगति में'}
                    </button>
                ))}
            </div>

            {/* Tasks List */}
            <div style={tasksGridStyle}>
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            onStatusChange={handleUpdateStatus}
                            themeColor={themeColor}
                        />
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                        <p style={{ color: '#999' }}>कोई कार्य नहीं मिले</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const TaskCard = ({ task, onStatusChange, themeColor }) => {
    const priorityColors = {
        'Low': '#4CAF50',
        'Medium': '#FF9800',
        'High': '#f44336'
    };

    const statusBgColor = {
        'Assigned': '#e3f2fd',
        'InProgress': '#fff3e0',
        'Completed': '#e8f5e9'
    };

    return (
        <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, color: themeColor, fontSize: '16px' }}>
                    {task.details?.taskTitle}
                </h3>
                <span style={{ backgroundColor: priorityColors[task.details?.priority] || '#999', color: 'white', padding: '3px 8px', borderRadius: '3px', fontSize: '12px' }}>
                    {task.details?.priority}
                </span>
            </div>

            <p style={{ margin: '5px 0', color: '#666', fontSize: '13px' }}>
                {task.details?.taskDescription}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '10px', margin: '10px 0', fontSize: '12px' }}>
                <span>👤 असाइन किया गया: <strong>{task.details?.assignedTo}</strong></span>
                <span>📂 विभाग: <strong>{task.details?.department}</strong></span>
            </div>

            {task.details?.dueDate && (
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#ff6b6b' }}>
                    📅 समय सीमा: {new Date(task.details?.dueDate).toLocaleDateString('hi-IN')}
                </p>
            )}

            <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                {['Assigned', 'InProgress', 'Completed'].map(status => (
                    <button
                        key={status}
                        onClick={() => onStatusChange(task._id, status)}
                        style={{
                            ...smallBtnStyle,
                            backgroundColor: task.details?.status === status ? '#0d9488' : '#f0f0f0',
                            color: task.details?.status === status ? 'white' : '#333'
                        }}
                    >
                        {status === 'Assigned' ? 'निर्धारित' : status === 'InProgress' ? 'प्रगति' : 'पूर्ण'}
                    </button>
                ))}
            </div>
        </div>
    );
};

// ==================== STYLES ====================

const containerStyle = {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
};

const headerStyle = (themeColor) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: themeColor,
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px'
});

const btnStyle = (themeColor) => ({
    padding: '10px 20px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '2px solid white',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s'
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

const formRowStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px'
};

const inputStyle = {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    fontFamily: 'inherit'
};

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

const tasksGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
};

const cardStyle = {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0'
};

const smallBtnStyle = {
    padding: '5px 10px',
    border: '1px solid #ddd',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.3s'
};

export default TaskManagement;
