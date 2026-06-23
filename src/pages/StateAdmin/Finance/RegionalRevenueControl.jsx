import React, { useState } from 'react';
import { useBranding } from '../../../context/BrandingContext';

const RegionalRevenueControl = () => {
    const { settings } = useBranding();
    const themeColor = settings?.themeColor || '#4f46e5';

    return (
        <div style={containerS}>
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>🏛️ State Fiscal Control Panel</h2>
                    <p style={subS}>Global tax override and regional commission distribution settings.</p>
                </div>
                <div style={actionRow}>
                    <button style={exportBtn}>Generate GST Report</button>
                    <button style={saveBtn(themeColor)}>Apply Fiscal Changes</button>
                </div>
            </div>

            <div style={gridS}>
                {/* Tax Configuration */}
                <div style={configCard}>
                    <h4 style={cardHead}>State Commission Override</h4>
                    <div style={inputGroup}>
                        <label style={labS}>Standard Platform Fee (%)</label>
                        <input type="number" defaultValue="5.00" style={inS} />
                    </div>
                    <div style={inputGroup}>
                        <label style={labS}>State Welfare Tax (%)</label>
                        <input type="number" defaultValue="1.50" style={inS} />
                    </div>
                    <p style={noteS}>*These values affect all 24 districts in your jurisdiction.</p>
                </div>

                {/* Sales Velocity */}
                <div style={configCard}>
                    <h4 style={cardHead}>Regional Settlement Cycle</h4>
                    <div style={inputGroup}>
                        <label style={labS}>Merchant Payout Delay (Days)</label>
                        <select style={inS}>
                            <option>T + 2 Days</option>
                            <option>T + 4 Days</option>
                            <option>Weekly (Sat)</option>
                        </select>
                    </div>
                    <div style={statusRow}>
                        <span>Settlement Node: <b style={{color:'#10b981'}}>STABLE</b></span>
                        <span>Gateway: <b style={{color:themeColor}}>ENABLED</b></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const containerS = { animation: 'slideUp 0.5s ease' };
const headerFlex = { display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'40px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin:0, fontWeight:'900', color:'#0f172a', fontSize:'26px' };
const subS = { margin:'5px 0 0', color:'#64748b', fontSize:'14px' };
const actionRow = { display:'flex', gap:'15px' };

const gridS = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(350px, 1fr))', gap:'25px' };
const configCard = { background:'#fff', padding:'35px', borderRadius:'28px', border:'1px solid #f1f5f9', boxShadow:'0 10px 30px rgba(0,0,0,0.02)' };
const cardHead = { margin:'0 0 25px 0', fontSize:'16px', fontWeight:'800', color:'#1e293b', borderBottom:'1px solid #f8fafc', paddingBottom:'15px' };

const inputGroup = { marginBottom:'20px' };
const labS = { display:'block', fontSize:'11px', fontWeight:'900', color:'#94a3b8', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'1px' };
const inS = { width:'100%', padding:'15px', borderRadius:'14px', border:'1.5px solid #e2e8f0', outline:'none', fontSize:'15px', fontWeight:'700', boxSizing:'border-box' };

const saveBtn = (c) => ({ background:c, color:'#fff', border:'none', padding:'15px 30px', borderRadius:'14px', fontWeight:'800', cursor:'pointer' });
const exportBtn = { background:'#fff', color:'#0f172a', border:'1.5px solid #e2e8f0', padding:'15px 30px', borderRadius:'14px', fontWeight:'800', cursor:'pointer' };
const noteS = { fontSize:'11px', color:'#94a3b8', fontStyle:'italic' };
const statusRow = { display:'flex', justifyContent:'space-between', marginTop:'30px', fontSize:'12px', fontWeight:'700', color:'#64748b' };

export default RegionalRevenueControl;