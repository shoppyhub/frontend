import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import HomeHeader from '../components/Customer/HomeHeader';
import { useBranding } from '../context/BrandingContext';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const { settings } = useBranding();
    const themeColor = settings.themeColor || '#0f172a';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/password/forgot', { email });
            if (res.data.success) {
                setSent(true);
                toast.success(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <HomeHeader />
            <div style={{ maxWidth: '420px', margin: '60px auto', padding: '0 20px' }}>
                <div style={{ background: '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
                    <h2 style={{ marginBottom: '8px', color: '#0f172a' }}>Forgot Password</h2>
                    <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
                        Enter your registered email to receive a reset link.
                    </p>

                    {sent ? (
                        <p style={{ color: '#166534', background: '#dcfce7', padding: '16px', borderRadius: '10px' }}>
                            Check your email for the reset link. If email is not configured, check the backend console in dev mode.
                        </p>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={inputStyle}
                            />
                            <button type="submit" disabled={loading} style={{ ...btnStyle, background: themeColor }}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    )}

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

export default ForgotPassword;
