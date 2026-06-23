import React, { useState } from 'react';
import api from '../services/api';
import CustomerHeader from '../components/Customer/HomeHeader';
import CustomerFooter from '../components/Customer/CustomerFooter';

const TrackApplication = () => {
    const [trackId, setTrackId] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await api.get(`/customer/track/${trackId}`);
            if (res.data.success) setResult(res.data.data);
            else setError(res.data.message || "Application not found");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid Track ID or Server Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
            <CustomerHeader />
            <div style={{ paddingTop: '120px', paddingBottom: '60px', maxWidth: '600px', margin: '0 auto', padding: '0 20px' }}>
                <div style={cardStyle}>
                    <h2 style={{ textAlign: 'center', color: '#1a1a2e' }}>Track Your Application</h2>
                    <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Enter your 12-digit Registration ID</p>

                    <form onSubmit={handleTrack} style={{ marginTop: '20px' }}>
                        <input 
                            type="text" 
                            placeholder="e.g. 259104617890" 
                            maxLength="12"
                            value={trackId}
                            onChange={(e) => setTrackId(e.target.value)}
                            required
                            style={inputStyle}
                        />
                        <button type="submit" style={btnStyle} disabled={loading}>
                            {loading ? "Searching..." : "Track Status"}
                        </button>
                    </form>

                    {error && <p style={{ color: '#e74c3c', textAlign: 'center', marginTop: '15px' }}>{error}</p>}

                    {result && (
                        <div style={resultBox}>
                            <h4 style={{ margin: '0 0 10px 0' }}>Application Details:</h4>
                            <p><b>Shop Name:</b> {result.shopName}</p>
                            <p><b>Owner:</b> {result.ownerName}</p>
                            <div style={{ marginTop: '15px', padding: '10px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', 
                                backgroundColor: result.status === 'Approved' ? '#dcfce7' : '#fff4e5', 
                                color: result.status === 'Approved' ? '#166534' : '#d35400' 
                            }}>
                                Current Status: {result.status}
                            </div>
                            {result.status === 'Approved' && (
                                <p style={{ fontSize: '12px', color: '#27ae60', marginTop: '10px', textAlign: 'center' }}>
                                    Check your registered email/SMS for Login ID & Password.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <CustomerFooter />
        </div>
    );
};

// Styles
const cardStyle = { backgroundColor: '#fff', padding: '40px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' };
const inputStyle = { width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box', textAlign: 'center', fontSize: '18px', letterSpacing: '2px', outline: 'none' };
const btnStyle = { width: '100%', padding: '15px', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' };
const resultBox = { marginTop: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '15px', backgroundColor: '#fafafa' };

export default TrackApplication;