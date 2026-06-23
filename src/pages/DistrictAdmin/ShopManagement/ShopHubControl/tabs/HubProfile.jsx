import React from 'react';

/**
 * RKD MART - HUB PROFILE TAB (ULTRA PRO)
 * दुकानदार और व्यवसाय का विस्तृत विवरण
 */
const HubProfile = ({ shop }) => {
    
    // तिथि को सही फॉर्मेट में दिखाने के लिए (e.g. 15 Aug 1995)
    const formatDate = (dateString) => {
        if (!dateString) return "---";
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <div style={gridS}>
            {/* --- LEFT: Visual Identity --- */}
            <div style={photoSectionS}>
                <div style={stickyS}>
                    <img 
                        src={shop.photo || 'https://via.placeholder.com/150'} 
                        style={pImgS} 
                        alt="Proprietor" 
                    />
                    <div style={badgeS}>VERIFIED PROPRIETOR</div>
                    <div style={idCardS}>
                        <small>Registry ID</small>
                        <div style={{fontWeight:'900', color:'#0d9488'}}>{shop.generatedId}</div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT: Information Matrix --- */}
            <div style={infoSectionS}>
                
                {/* Section 1: Personal Identity */}
                <div style={cardS}>
                    <h3 style={sectionTitleS}>👤 Personal Identity</h3>
                    <div style={dataGridS}>
                        <InfoRow label="Proprietor Name" val={shop.fullName} />
                        <InfoRow label="Father's Name" val={shop.fatherName} />
                        <InfoRow label="Date of Birth" val={formatDate(shop.dob)} />
                        <InfoRow label="Gender" val={shop.gender} />
                    </div>
                </div>

                {/* Section 2: Communication Nodes */}
                <div style={cardS}>
                    <h3 style={sectionTitleS}>📱 Communication & Digital</h3>
                    <div style={dataGridS}>
                        <InfoRow label="Mobile Number" val={shop.mobile} />
                        <InfoRow label="WhatsApp Number" val={shop.whatsapp || shop.mobile} isWhatsApp={!!shop.whatsapp} />
                        <InfoRow label="Official Email" val={shop.email} />
                        <InfoRow label="Alternative Contact" val={shop.alternateMobile || "N/A"} />
                    </div>
                </div>

                {/* Section 3: Business & Location */}
                <div style={cardS}>
                    <h3 style={sectionTitleS}>🏢 Hub & Geographic Location</h3>
                    <div style={dataGridS}>
                        <InfoRow label="Business Entity" val={shop.shopName} />
                        <InfoRow label="Hub Category" val={shop.shopType} />
                        <InfoRow label="Block / Zone" val={shop.shopBlock} />
                        <InfoRow label="Postal Pincode" val={shop.shopPin} />
                        <div style={{gridColumn: 'span 2'}}>
                            <InfoRow label="Physical Address (Full)" val={shop.shopFullAddress} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

/** --- Helper Component for Data Rows --- */
const InfoRow = ({ label, val, isWhatsApp }) => (
    <div style={rowS}>
        <small style={labS}>{label}</small>
        <div style={{...valS, color: isWhatsApp ? '#25D366' : '#1e293b'}}>
            {isWhatsApp && '💬 '}{val || "---"}
        </div>
    </div>
);

// --- STYLES (अल्ट्रा प्रो लेवल) ---
const gridS = { display:'grid', gridTemplateColumns:'280px 1fr', gap:'40px' };
const stickyS = { position: 'sticky', top: '20px' };
const pImgS = { width:'100%', height:'280px', borderRadius:'24px', objectFit:'cover', border:'5px solid #fff', boxShadow:'0 10px 30px rgba(0,0,0,0.05)' };
const badgeS = { textAlign:'center', marginTop:'15px', fontSize:'10px', fontWeight:'900', color:'#94a3b8', letterSpacing:'1px' };
const idCardS = { marginTop:'20px', background:'#fff', padding:'15px', borderRadius:'16px', border:'1px solid #f1f5f9', textAlign:'center', fontSize:'11px' };

const infoSectionS = { display:'flex', flexDirection:'column', gap:'25px' };
const cardS = { background:'#fcfdfe', padding:'25px', borderRadius:'20px', border:'1px solid #f1f5f9' };
const sectionTitleS = { margin:'0 0 20px 0', fontSize:'14px', fontWeight:'900', color:'#0f172a', textTransform:'uppercase', letterSpacing:'0.5px' };
const dataGridS = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' };

const rowS = { paddingBottom:'12px', borderBottom:'1px solid #f8fafc' };
const labS = { color:'#94a3b8', fontSize:'10px', fontWeight:'800', textTransform:'uppercase', display:'block' };
const valS = { fontSize:'14px', fontWeight:'700', color:'#1e293b', marginTop:'4px' };
const photoSectionS = {};

export default HubProfile;