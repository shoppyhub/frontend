import React from 'react';
import { useAuth } from '../../../../context/AuthContext';

const OperatorProfile = () => {
    const { user } = useAuth();

    return (
        <div style={profileCard}>
            <div style={banner}></div>
            <div style={content}>
                <div style={avatar}>{user?.fullName?.charAt(0)}</div>
                <h2 style={{margin:'15px 0 5px 0'}}>{user?.fullName}</h2>
                <span style={roleTag}>Authorized District Operator</span>
                
                <div style={detailsGrid}>
                    <div style={detailBox}>
                        <small>NODE ID</small>
                        <p>{user?.generatedId || 'OP-JAIPUR-001'}</p>
                    </div>
                    <div style={detailBox}>
                        <small>CONTACT</small>
                        <p>{user?.mobile}</p>
                    </div>
                    <div style={detailBox}>
                        <small>ACCESS LEVEL</small>
                        <p>District Level - Restricted</p>
                    </div>
                </div>

                <button style={secBtn}>Update Security Credentials</button>
            </div>
        </div>
    );
};

const profileCard = { background:'#fff', borderRadius:'30px', overflow:'hidden', border:'1px solid #f1f5f9', maxWidth:'600px', margin:'0 auto' };
const banner = { height:'120px', background:'linear-gradient(45deg, #0f172a, #1e293b)' };
const content = { padding:'0 30px 40px', textAlign:'center', marginTop:'-50px' };
const avatar = { width:'100px', height:'100px', background:'#0d9488', borderRadius:'50%', border:'5px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px', fontWeight:'900', color:'#fff', margin:'0 auto' };
const roleTag = { background:'#f0fdfa', color:'#0d9488', padding:'5px 15px', borderRadius:'20px', fontSize:'11px', fontWeight:'800' };
const detailsGrid = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginTop:'30px', textAlign:'left' };
const detailBox = { padding:'15px', background:'#f8fafc', borderRadius:'15px' };
const secBtn = { marginTop:'30px', width:'100%', padding:'15px', borderRadius:'15px', border:'1px solid #e2e8f0', background:'#fff', fontWeight:'800', cursor:'pointer' };

export default OperatorProfile;