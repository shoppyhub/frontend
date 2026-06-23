import React from 'react';

const DistrictOperatorFooter = () => (
    <footer style={footS}>
        <span>© {new Date().getFullYear()} Administrative Infrastructure Node</span>
        <div style={statusS}>
            <span style={dot}></span> Node Status: Secure & Synchronized
        </div>
    </footer>
);

const footS = { padding:'20px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff', borderTop:'1px solid #f1f5f9', color:'#94a3b8', fontSize:'11px', fontWeight:'700' };
const statusS = { display:'flex', alignItems:'center', gap:'8px', textTransform:'uppercase', letterSpacing:'1px' };
const dot = { width:'6px', height:'6px', background:'#10b981', borderRadius:'50%', boxShadow:'0 0 8px #10b981' };

export default DistrictOperatorFooter;