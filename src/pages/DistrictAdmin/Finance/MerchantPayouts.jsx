import React from 'react';
import { useBranding } from '../../../context/BrandingContext';

const MerchantPayouts = () => {
    const { settings } = useBranding();
    const themeColor = settings?.themeColor || '#0d9488';

    return (
        <div style={cardS}>
            <h2 style={title}>💰 Financial Settlement Ledger</h2>
            <p style={sub}>Monitor merchant earnings and payout status across the district node.</p>

            <div style={statsGrid}>
                <div style={statBox}>
                    <small style={statLab}>TOTAL SALES VOLUME</small>
                    <h2 style={statVal}>₹8,42,000</h2>
                </div>
                <div style={statBox}>
                    <small style={statLab}>DISTRICT REVENUE (TAX)</small>
                    <h2 style={statVal}>₹42,100</h2>
                </div>
                <div style={statBox}>
                    <small style={statLab}>PENDING PAYOUTS</small>
                    <h2 style={{...statVal, color:'#f59e0b'}}>₹18,200</h2>
                </div>
            </div>

            <div style={tableArea}>
                <table style={tableS}>
                    <thead>
                        <tr style={thRow}>
                            <th style={thS}>MERCHANT HUB</th>
                            <th style={thS}>TOTAL SALES</th>
                            <th style={thS}>COMMISSION</th>
                            <th style={thS}>PAYABLE</th>
                            <th style={thS}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={trS}>
                            <td style={tdS}><b>Modern Grocery Store</b></td>
                            <td style={tdS}>₹45,000</td>
                            <td style={tdS}>₹2,250</td>
                            <td style={tdS}><b>₹42,750</b></td>
                            <td style={tdS}><button style={payBtn(themeColor)}>Process Settlement</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const cardS = { background: '#fff', padding: '30px', borderRadius: '25px', border: '1px solid #f1f5f9' };
const title = { margin: 0, fontSize: '22px', fontWeight: '900', color: '#0f172a' };
const sub = { color: '#64748b', fontSize: '13px', marginTop: '5px', marginBottom: '30px' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' };
const statBox = { padding: '25px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9' };
const statLab = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px' };
const statVal = { margin: '10px 0 0 0', color: '#1e293b', fontSize: '24px', fontWeight: '900' };
const tableArea = { overflowX: 'auto' };
const tableS = { width: '100%', borderCollapse: 'collapse' };
const thRow = { textAlign: 'left', borderBottom: '1px solid #f1f5f9' };
const thS = { padding: '15px', color: '#94a3b8', fontSize: '11px', fontWeight: '900' };
const trS = { borderBottom: '1px solid #f8fafc' };
const tdS = { padding: '18px 15px', fontSize: '14px' };
const payBtn = (color) => ({ background: color, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '12px' });

export default MerchantPayouts;