import React, { useState, useEffect } from 'react';
import api from "../../../../../services/api";
import { toast } from 'react-toastify';

/**
 * RKD MART - HUB REGISTRY MAINTENANCE (ULTRA PRO)
 * जिला एडमिन के लिए मास्टर डेटा संपादन केंद्र
 */
const EditHub = ({ shop, refresh, theme }) => {
    // फॉर्म डेटा को इनिशियलाइज़ करें
    const [data, setData] = useState({ ...shop });
    const [isSaving, setIsSaving] = useState(false);

    // यदि प्रॉप्स से शॉप डेटा बदलता है, तो लोकल स्टेट अपडेट करें
    useEffect(() => {
        setData({ ...shop });
    }, [shop]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!data.shopName || !data.mobile) {
            return toast.warn("Hub Name and Mobile are mandatory.");
        }

        setIsSaving(true);
        try {
            const res = await api.put(`/admin/hierarchy/update/${shop._id}`, data);
            if (res.data.success) {
                toast.success("Master Registry Successfully Synchronized.");
                refresh(); // मुख्य डेटा रिफ्रेश करें
            }
        } catch (err) {
            toast.error("Protocol Error: Registry Sync Failed.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={containerS}>
            <div style={headerS}>
                <h3 style={titleS}>🏢 HUB REGISTRY MAINTENANCE</h3>
                <p style={subS}>Modify node particulars carefully. All changes are logged for audit.</p>
            </div>

            <div style={formWrapperS}>
                
                {/* --- Section 1: Personal Particulars --- */}
                <SectionHeader icon="👤" title="Proprietor Identity" />
                <div style={formGridS}>
                    <FormInput label="Full Name" name="fullName" value={data.fullName} onChange={handleChange} />
                    <FormInput label="Father's Name" name="fatherName" value={data.fatherName} onChange={handleChange} />
                    <FormInput label="Date of Birth" name="dob" type="date" value={data.dob ? data.dob.split('T')[0] : ''} onChange={handleChange} />
                    <div style={itS}>
                        <label style={labS}>Gender</label>
                        <select name="gender" value={data.gender} onChange={handleChange} style={inS}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                {/* --- Section 2: Business Nodes --- */}
                <SectionHeader icon="💼" title="Business Node Details" />
                <div style={formGridS}>
                    <FormInput label="Hub Legal Name" name="shopName" value={data.shopName} onChange={handleChange} />
                    <FormInput label="GSTIN / License No." name="gstNumber" value={data.gstNumber} onChange={handleChange} />
                    <FormInput label="Business Type" name="shopType" value={data.shopType} onChange={handleChange} />
                    <FormInput label="Official Email" name="email" value={data.email} onChange={handleChange} />
                </div>

                {/* --- Section 3: Communication --- */}
                <SectionHeader icon="📱" title="Communication Nodes" />
                <div style={formGridS}>
                    <FormInput label="Primary Mobile" name="mobile" value={data.mobile} onChange={handleChange} />
                    <FormInput label="WhatsApp Number" name="whatsapp" value={data.whatsapp} onChange={handleChange} />
                    <FormInput label="Alternative Mobile" name="alternateMobile" value={data.alternateMobile} onChange={handleChange} />
                </div>

                {/* --- Section 4: Geographic Location --- */}
                <SectionHeader icon="📍" title="Geographic Matrix" />
                <div style={formGridS}>
                    <FormInput label="Block / Zone" name="shopBlock" value={data.shopBlock} onChange={handleChange} />
                    <FormInput label="Postal Pincode" name="shopPin" value={data.shopPin} onChange={handleChange} />
                    <div style={{gridColumn: 'span 2'}}>
                        <FormInput label="Full Physical Address" name="shopFullAddress" value={data.shopFullAddress} onChange={handleChange} />
                    </div>
                </div>

                {/* --- Action Area --- */}
                <div style={actionAreaS}>
                    <button 
                        style={saveBtnS(theme, isSaving)} 
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? "⚡ SYNCHRONIZING..." : "💾 COMMIT CHANGES TO MASTER REGISTRY"}
                    </button>
                    <p style={noteS}>※ Clicking save will propagate changes across all marketplace nodes.</p>
                </div>

            </div>
        </div>
    );
};

/** --- Mini Components --- */
const SectionHeader = ({ icon, title }) => (
    <div style={secHeadS}>
        <span style={{fontSize:'18px'}}>{icon}</span>
        <h4 style={{margin:0, fontSize:'14px', fontWeight:'800', color:'#475569'}}>{title}</h4>
    </div>
);

const FormInput = ({ label, name, value, onChange, type = "text" }) => (
    <div style={itS}>
        <label style={labS}>{label}</label>
        <input 
            type={type} 
            name={name} 
            value={value || ''} 
            onChange={onChange} 
            style={inS} 
            autoComplete="off"
        />
    </div>
);

// --- CSS STYLES (Ultra Pro SaaS Layout) ---
const containerS = { animation: 'fadeIn 0.5s ease' };
const headerS = { marginBottom:'30px', borderBottom:'1px solid #f1f5f9', paddingBottom:'15px' };
const titleS = { margin:0, fontSize:'18px', fontWeight:'900', color:'#0f172a' };
const subS = { margin:'5px 0 0 0', color:'#94a3b8', fontSize:'12px', fontWeight:'600' };

const formWrapperS = { display:'flex', flexDirection:'column', gap:'30px' };
const formGridS = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' };
const secHeadS = { display:'flex', alignItems:'center', gap:'10px', paddingBottom:'10px', borderBottom:'2px solid #f8fafc' };

const itS = { display:'flex', flexDirection:'column', gap:'6px' };
const labS = { fontSize:'10px', fontWeight:'800', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.5px' };
const inS = { padding:'12px 15px', borderRadius:'12px', border:'2px solid #e2e8f0', background:'#fff', fontWeight:'700', fontSize:'14px', color:'#1e293b', outline:'none', transition:'0.2s' };

const actionAreaS = { marginTop:'20px', textAlign:'center' };
const saveBtnS = (bg, loading) => ({ 
    width:'100%', padding:'18px', background: loading ? '#cbd5e1' : bg, 
    color:'#fff', border:'none', borderRadius:'16px', fontWeight:'900', 
    fontSize:'14px', cursor: loading ? 'not-allowed' : 'pointer', 
    boxShadow: loading ? 'none' : `0 10px 25px ${bg}40`, transition:'0.3s' 
});

const noteS = { fontSize:'11px', color:'#94a3b8', marginTop:'15px', fontStyle:'italic' };

export default EditHub;