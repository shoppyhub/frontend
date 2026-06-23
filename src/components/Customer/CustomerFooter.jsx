import React from 'react';

const CustomerFooter = () => (
    <footer style={footerStyle}>
        <div style={footerGrid}>
            <div>
                <h3 style={{color: '#27ae60'}}>RKD_MART</h3>
                <p>Your hyperlocal marketplace for everything.</p>
            </div>
            <div>
                <h4>Categories</h4>
                <p>Grocery | Electrical | Fruits</p>
            </div>
            <div>
                <h4>Contact</h4>
                <p>Email: help@rkdmart.com</p>
            </div>
        </div>
        <hr style={{opacity: 0.1, margin: '20px 0'}} />
        <p>© 2026 RKD_MART. All Rights Reserved.</p>
    </footer>
);

const footerStyle = { backgroundColor: '#1a1a2e', color: '#fff', padding: '40px 5%', textAlign: 'center' };
const footerGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'left' };

export default CustomerFooter;