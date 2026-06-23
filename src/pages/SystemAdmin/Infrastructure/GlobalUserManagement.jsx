import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { useBranding } from '../../../context/BrandingContext';

/**
 * 👥 SYSTEM ADMIN - GLOBAL USER MANAGEMENT
 * Manage all users across the platform
 */

const GlobalUserManagement = () => {
    const { settings } = useBranding();
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({
        role: 'all',
        status: 'all',
        searchText: ''
    });
    const [loading, setLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [bulkAction, setBulkAction] = useState(null);

    const themeColor = settings?.themeColor || '#0f172a';

    const fetchUsers = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page,
                limit: 20,
                ...filters
            });
            const res = await api.get(`/admin/global/users?${params}`);
            setUsers(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleBulkUpdateStatus = async (status) => {
        if (selectedUsers.length === 0) return;
        try {
            await api.put('/admin/global/users/status/bulk', {
                userIds: selectedUsers,
                status,
                reason: `Bulk update by ${settings?.adminName || 'System'}`
            });
            setSelectedUsers([]);
            fetchUsers();
        } catch (err) {
            console.error('Error updating user status:', err);
        }
    };

    const roleColors = {
        'SystemAdmin': '#0f172a',
        'SubSystemAdmin': '#3b82f6',
        'StateAdmin': '#8b5cf6',
        'DistrictAdmin': '#ec4899',
        'ShopOwner': '#f59e0b',
        'Customer': '#10b981',
        'Staff': '#06b6d4'
    };

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>👥 Global User Management</h1>
                    <p style={styles.subtitle}>Manage all users across the platform</p>
                </div>
                <div style={styles.controls}>
                    <input
                        type="text"
                        placeholder="Search by name, email, mobile..."
                        value={filters.searchText}
                        onChange={(e) => setFilters({...filters, searchText: e.target.value})}
                        style={styles.input}
                    />
                </div>
            </div>

            {/* FILTERS */}
            <div style={styles.filterBar}>
                <select
                    value={filters.role}
                    onChange={(e) => setFilters({...filters, role: e.target.value})}
                    style={styles.select}
                >
                    <option value="all">All Roles</option>
                    <option value="SystemAdmin">System Admin</option>
                    <option value="StateAdmin">State Admin</option>
                    <option value="DistrictAdmin">District Admin</option>
                    <option value="ShopOwner">Shop Owner</option>
                    <option value="Customer">Customer</option>
                </select>

                <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    style={styles.select}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>

                {selectedUsers.length > 0 && (
                    <div style={styles.bulkActions}>
                        <span>{selectedUsers.length} selected</span>
                        <button
                            onClick={() => handleBulkUpdateStatus('active')}
                            style={{...styles.bulkButton, backgroundColor: '#10b981'}}
                        >
                            ✅ Activate
                        </button>
                        <button
                            onClick={() => handleBulkUpdateStatus('inactive')}
                            style={{...styles.bulkButton, backgroundColor: '#ef4444'}}
                        >
                            🚫 Deactivate
                        </button>
                    </div>
                )}
            </div>

            {/* USERS TABLE */}
            {loading ? (
                <div style={styles.loader}>Loading users...</div>
            ) : (
                <>
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.headerRow}>
                                    <th style={styles.checkboxCell}>
                                        <input
                                            type="checkbox"
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedUsers(users.map(u => u._id));
                                                } else {
                                                    setSelectedUsers([]);
                                                }
                                            }}
                                            checked={selectedUsers.length === users.length}
                                        />
                                    </th>
                                    <th style={styles.headerCell}>User Info</th>
                                    <th style={styles.headerCell}>Role</th>
                                    <th style={styles.headerCell}>Status</th>
                                    <th style={styles.headerCell}>KYC</th>
                                    <th style={styles.headerCell}>Joined</th>
                                    <th style={styles.headerCell}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id} style={styles.dataRow}>
                                        <td style={styles.checkboxCell}>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedUsers([...selectedUsers, user._id]);
                                                    } else {
                                                        setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td style={styles.dataCell}>
                                            <div style={styles.userInfo}>
                                                <div style={styles.userName}>{user.fullName}</div>
                                                <div style={styles.userEmail}>{user.email}</div>
                                                <div style={styles.userMobile}>{user.mobile}</div>
                                            </div>
                                        </td>
                                        <td style={styles.dataCell}>
                                            <span style={{
                                                ...styles.roleBadge,
                                                backgroundColor: roleColors[user.role] + '15',
                                                color: roleColors[user.role]
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={styles.dataCell}>
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: user.isActive ? '#10b98115' : '#ef444415',
                                                color: user.isActive ? '#10b981' : '#ef4444'
                                            }}>
                                                {user.isActive ? '🟢 Active' : '⚫ Inactive'}
                                            </span>
                                        </td>
                                        <td style={styles.dataCell}>
                                            <span style={{
                                                ...styles.kycBadge,
                                                backgroundColor: user.kycStatus === 'Verified' ? '#10b98115' : '#f59e0b15',
                                                color: user.kycStatus === 'Verified' ? '#10b981' : '#f59e0b'
                                            }}>
                                                {user.kycStatus}
                                            </span>
                                        </td>
                                        <td style={styles.dataCell}>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={styles.dataCell}>
                                            <button
                                                onClick={() => window.location.href = `/system-admin/users/${user._id}`}
                                                style={{...styles.actionBtn, color: themeColor}}
                                            >
                                                👁️ View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {pagination.pages > 1 && (
                        <div style={styles.pagination}>
                            {Array.from({length: pagination.pages}, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => fetchUsers(page)}
                                    style={{
                                        ...styles.pageButton,
                                        backgroundColor: page === pagination.page ? themeColor : '#e2e8f0',
                                        color: page === pagination.page ? '#fff' : '#0f172a'
                                    }}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* STATS */}
            <div style={styles.statsContainer}>
                <StatCard label="Total Users" value={pagination.total} icon="👥" />
                <StatCard label="Admins" value={users.filter(u => u.role.includes('Admin')).length} icon="👑" />
                <StatCard label="Shops" value={users.filter(u => u.role === 'ShopOwner').length} icon="🏪" />
                <StatCard label="Customers" value={users.filter(u => u.role === 'Customer').length} icon="👤" />
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon }) => (
    <div style={styles.statCard}>
        <div style={styles.statIcon}>{icon}</div>
        <div style={styles.statContent}>
            <div style={styles.statValue}>{value}</div>
            <div style={styles.statLabel}>{label}</div>
        </div>
    </div>
);

const styles = {
    container: {
        padding: '30px',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        backgroundColor: '#fff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    title: {
        fontSize: '28px',
        fontWeight: '900',
        color: '#0f172a',
        margin: 0,
    },
    subtitle: {
        fontSize: '14px',
        color: '#64748b',
        marginTop: '8px',
    },
    controls: {
        flex: 1,
        marginLeft: '30px',
    },
    input: {
        width: '100%',
        maxWidth: '300px',
        padding: '10px 15px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '14px',
    },
    filterBar: {
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        marginBottom: '20px',
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '8px',
    },
    select: {
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        fontSize: '14px',
        cursor: 'pointer',
    },
    bulkActions: {
        marginLeft: 'auto',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        paddingLeft: '20px',
        borderLeft: '2px solid #e2e8f0',
    },
    bulkButton: {
        padding: '8px 15px',
        borderRadius: '6px',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '700',
    },
    tableWrapper: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    headerRow: {
        backgroundColor: '#f8fafc',
        borderBottom: '2px solid #e2e8f0',
    },
    headerCell: {
        padding: '15px',
        textAlign: 'left',
        fontWeight: '700',
        color: '#0f172a',
        fontSize: '13px',
    },
    checkboxCell: {
        width: '50px',
        textAlign: 'center',
    },
    dataRow: {
        borderBottom: '1px solid #e2e8f0',
        ':hover': {
            backgroundColor: '#f8fafc',
        }
    },
    dataCell: {
        padding: '15px',
        fontSize: '13px',
        color: '#475569',
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    userName: {
        fontWeight: '700',
        color: '#0f172a',
    },
    userEmail: {
        fontSize: '12px',
        color: '#64748b',
    },
    userMobile: {
        fontSize: '12px',
        color: '#94a3b8',
    },
    roleBadge: {
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '700',
    },
    statusBadge: {
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '700',
    },
    kycBadge: {
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '700',
    },
    actionBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '700',
        fontSize: '13px',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
    },
    pageButton: {
        padding: '8px 12px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '700',
        fontSize: '13px',
    },
    statsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginTop: '30px',
    },
    statCard: {
        display: 'flex',
        gap: '15px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    statIcon: {
        fontSize: '32px',
    },
    statContent: {
        flex: 1,
    },
    statValue: {
        fontSize: '24px',
        fontWeight: '900',
        color: '#0f172a',
    },
    statLabel: {
        fontSize: '12px',
        color: '#64748b',
        marginTop: '4px',
    },
    loader: {
        textAlign: 'center',
        padding: '40px',
        color: '#64748b',
    }
};

export default GlobalUserManagement;
