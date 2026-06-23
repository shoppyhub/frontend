// src/components/Shared/Loader.jsx
import React from 'react';

const Loader = ({ message = "Synchronizing..." }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            width: '100%'
        }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '15px', fontSize: '12px', fontWeight: '800', color: '#94a3b8', letterSpacing: '1px' }}>
                {message.toUpperCase()}
            </p>
            <style>{`
                .spinner {
                    width: 30px;
                    height: 30px;
                    border: 3px solid #f1f5f9;
                    border-top: 3px solid var(--primary-theme, #0f172a);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Loader;