import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../../services/api';
import { toast } from 'react-toastify';
import { useBranding } from '../../../../context/BrandingContext';

const DeviceManagement = () => {
    const { settings } = useBranding();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const themeColor = settings?.themeColor || '#0f172a';

    const fetchDevices = useCallback(async () => {
        try {
            setLoading(true);
            const params = roleFilter !== 'All' ? { role: roleFilter } : {};
            const res = await api.get('/admin/devices/all', { params });
            if (res.data.success) setDevices(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load device registry.');
        } finally {
            setLoading(false);
        }
    }, [roleFilter]);

    useEffect(() => { fetchDevices(); }, [fetchDevices]);

    const filtered = useMemo(() => {
        if (!search) return devices;
        const term = search.toLowerCase();
        return devices.filter(d =>
            d.fullName?.toLowerCase().includes(term) ||
            d.generatedId?.toLowerCase().includes(term) ||
            d.deviceName?.toLowerCase().includes(term) ||
            d.ip?.includes(term)
        );
    }, [devices, search]);

    const toggleDevice = async (userId, deviceId, currentAuth) => {
        try {
            await api.patch(`/admin/hierarchy/device-status/${userId}`, { deviceId, authorized: !currentAuth });
            toast.success(currentAuth ? 'Device access revoked.' : 'Device authorized.');
            fetchDevices();
        } catch (err) {
            toast.error('Device update failed.');
        }
    };

    const revokeAll = async (userId, name) => {
        if (!window.confirm(`Revoke all devices for ${name}?`)) return;
        try {
            await api.patch(`/admin/devices/revoke-all/${userId}`);
            toast.success('All devices revoked.');
            fetchDevices();
        } catch (err) {
            toast.error('Revoke operation failed.');
        }
    };

    if (loading) return <div style={loaderS}>Loading device registry...</div>;

    return (
        <div style={pageS}>
            <div style={headerS}>
                <div>
                    <h2 style={titleS}>Device Management</h2>
                    <p style={subS}>Monitor and control authorized login devices across all user nodes.</p>
                </div>
                <div style={statS(themeColor)}>
                    <small>TOTAL DEVICES</small>
                    <b>{filtered.length}</b>
                </div>
            </div>

            <div style={toolbarS}>
                <input
                    style={searchIn}
                    placeholder="Search by name, ID, device or IP..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select style={selectS} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                    <option value="All">All Roles</option>
                    <option value="ShopOwner">Shop Owners</option>
                    <option value="Staff">Staff</option>
                    <option value="DistrictAdmin">District Admins</option>
                    <option value="StateAdmin">State Admins</option>
                    <option value="SubSystemAdmin">Sub Admins</option>
                    <option value="Customer">Customers</option>
                </select>
                <button onClick={fetchDevices} style={refreshBtn(themeColor)}>Refresh</button>
            </div>

            <div style={tableWrap}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={tableS}>
                        <thead>
                            <tr style={thS}>
                                <th style={tdS}>User</th>
                                <th style={tdS}>Role</th>
                                <th style={tdS}>Device</th>
                                <th style={tdS}>IP Address</th>
                                <th style={tdS}>Last Login</th>
                                <th style={tdS}>Status</th>
                                <th style={tdS}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((d, i) => (
                                <tr key={`${d.userId}-${d.deviceId}-${i}`} style={trS}>
                                    <td style={tdS}>
                                        <div style={nameS}>{d.fullName}</div>
                                        <small style={metaS}>{d.generatedId || 'N/A'}</small>
                                    </td>
                                    <td style={tdS}><span style={roleBadge(themeColor)}>{d.role}</span></td>
                                    <td style={tdS}>{d.deviceName || 'Unknown'}</td>
                                    <td style={tdS}><code>{d.ip || 'N/A'}</code></td>
                                    <td style={tdS}>{d.lastLogin ? new Date(d.lastLogin).toLocaleString() : 'N/A'}</td>
                                    <td style={tdS}>
                                        <span style={statusBadge(d.isAuthorized !== false)}>
                                            {d.isAuthorized !== false ? 'Authorized' : 'Revoked'}
                                        </span>
                                    </td>
                                    <td style={tdS}>
                                        <button
                                            onClick={() => toggleDevice(d.userId, d.deviceId, d.isAuthorized !== false)}
                                            style={d.isAuthorized !== false ? revokeBtn : allowBtn}
                                        >
                                            {d.isAuthorized !== false ? 'Revoke' : 'Allow'}
                                        </button>
                                        <button onClick={() => revokeAll(d.userId, d.fullName)} style={revokeAllBtn}>Revoke All</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && <div style={emptyS}>No devices registered yet.</div>}
            </div>
        </div>
    );
};

const pageS = { padding: '15px', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerS = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' };
const titleS = { margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a' };
const subS = { color: '#64748b', fontSize: '13px', marginTop: '4px' };
const statS = (c) => ({ background: '#fff', padding: '15px 25px', borderRadius: '16px', borderLeft: `5px solid ${c}` });
const toolbarS = { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' };
const searchIn = { flex: 1, minWidth: '220px', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #f1f5f9', fontWeight: '600' };
const selectS = { padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #f1f5f9', fontWeight: '700' };
const refreshBtn = (c) => ({ padding: '12px 20px', background: c, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' });
const tableWrap = { background: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9', overflow: 'hidden' };
const tableS = { width: '100%', borderCollapse: 'collapse', minWidth: '800px' };
const thS = { background: '#f8fafc' };
const tdS = { padding: '16px 20px', fontSize: '13px', borderBottom: '1px solid #f8fafc', textAlign: 'left' };
const trS = { transition: '0.2s' };
const nameS = { fontWeight: '800', color: '#1e293b' };
const metaS = { color: '#94a3b8', fontSize: '11px' };
const roleBadge = (c) => ({ background: `${c}15`, color: c, padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '900' });
const statusBadge = (ok) => ({ padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '900', background: ok ? '#ecfdf5' : '#fff1f2', color: ok ? '#10b981' : '#f43f5e' });
const revokeBtn = { padding: '6px 12px', background: '#fff1f2', color: '#f43f5e', border: '1px solid #fee2e2', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '11px', marginRight: '6px' };
const allowBtn = { padding: '6px 12px', background: '#ecfdf5', color: '#10b981', border: '1px solid #d1fae5', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '11px', marginRight: '6px' };
const revokeAllBtn = { padding: '6px 12px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '11px' };
const loaderS = { padding: '80px', textAlign: 'center', fontWeight: '800', color: '#94a3b8' };
const emptyS = { padding: '60px', textAlign: 'center', color: '#cbd5e1', fontWeight: '700' };

export default DeviceManagement;
