import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import HomeHeader from '../components/Customer/HomeHeader';
import { useBranding } from '../context/BrandingContext';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const { settings } = useBranding();
    const themeColor = settings.themeColor || '#0f172a';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) return toast.error('Passwords do not match');
        if (password.length < 6) return toast.error('Password must be at least 6 characters');

        setLoading(true);
        try {
            const res = await api.put(`/auth/password/reset/${token}`, { password });
            if (res.data.success) {
                toast.success('Password updated! Please login.');
                navigate('/login');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <HomeHeader />
            <div style={{ maxWidth: '420px', margin: '60px auto', padding: '0 20px' }}>
                <div style={{ background: '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
                    <h2 style={{ marginBottom: '8px', color: '#0f172a' }}>Reset Password</h2>
                    <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>Enter your new password below.</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <input
                            type="password"
                            placeholder="New password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={inputStyle}
                        />
                        <input
                            type="password"
                            placeholder="Confirm password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                            style={inputStyle}
                        />
                        <button type="submit" disabled={loading} style={{ ...btnStyle, background: themeColor }}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>

                    <p style={{ marginTop: '20px', textAlign: 'center' }}>
                        <Link to="/login" style={{ color: themeColor, fontWeight: '600', textDecoration: 'none' }}>Back to Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

const inputStyle = { width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '15px', boxSizing: 'border-box' };
const btnStyle = { padding: '14px', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' };

export default ResetPassword;
