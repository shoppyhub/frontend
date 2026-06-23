import React from 'react';

const LoadingState = ({ message = "SYNCHRONIZING SECURE NODE...", color = '#0f172a', fullPage = true }) => {
    const containerStyle = fullPage
        ? { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }
        : { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' };

    return (
        <div style={containerStyle}>
            <div style={loaderWrapperS}>
                <div style={spinnerS(color)}></div>
                <p style={messageS}>{message}</p>
            </div>
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
            `}</style>
        </div>
    );
};

const loaderWrapperS = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    gap: '20px'
};

const spinnerS = (color) => ({
    width: '50px',
    height: '50px',
    border: '4px solid #f1f5f9',
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
});

const messageS = {
    margin: 0,
    fontWeight: '800',
    color: '#94a3b8',
    fontSize: '12px',
    letterSpacing: '1px',
    textTransform: 'uppercase'
};

export default LoadingState;
