import React from 'react';
import { useBranding } from '../../context/BrandingContext';

const ShopFooter = () => {
    const { settings } = useBranding();
    const currentYear = new Date().getFullYear();

    return (
        <footer style={footerStyle}>
            <div style={contentWrapper}>
                <div style={leftS}>
                    © {currentYear} <b>{settings.siteName || 'System Hub'}</b> 
                    <span style={divider}>|</span> 
                    Merchant Administrative Console
                </div>
                
                <div style={rightS}>
                    <span style={statusDot}></span> 
                    Infrastructure Node: Stable
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .footer-content {
                        flex-direction: column;
                        gap: 10px;
                        text-align: center;
                    }
                }
            `}</style>
        </footer>
    );
};

// --- Enterprise Style Definitions ---

const footerStyle = {
    padding: '25px 30px',
    background: '#f8fafc',
    borderTop: '1px solid #eef2f6',
    marginTop: 'auto', // Ensures it stays at bottom of the main area
    fontFamily: "'Plus Jakarta Sans', sans-serif"
};

const contentWrapper = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1400px',
    margin: '0 auto',
    className: 'footer-content' // For media queries
};

const leftS = {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
    letterSpacing: '0.3px'
};

const divider = {
    margin: '0 10px',
    color: '#cbd5e1'
};

const rightS = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '1px'
};

const statusDot = {
    width: '6px',
    height: '6px',
    background: '#10b981',
    borderRadius: '50%',
    boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)'
};

export default ShopFooter;