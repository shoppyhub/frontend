import React, { useState, useEffect, useCallback } from 'react';
import HomeHeader from '../../components/Customer/HomeHeader';
import MobileBottomNav from '../../components/Customer/MobileBottomNav';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useBranding } from '../../context/BrandingContext'; // Added for White-labeling

const AddressBook = () => {
    const { settings } = useBranding();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [locations, setLocations] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    
    const [formData, setFormData] = useState({
        type: 'Home',
        fullAddress: '',
        pincode: '',
        landmark: '',
        state: '',
        district: '',
        block: '',
        isDefault: false
    });

    // Fetch locations on mount
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await api.get('/customer/locations');
                if (res.data.success) {
                    setLocations(res.data.data || []);
                }
            } catch (err) {
                // Location fetch failed - dropdowns will be empty
            }
        };
        fetchLocations();
    }, []);

    const currentState = locations.find(s => s._id === selectedState);
    const currentDistricts = currentState?.districts || [];
    const currentDistrict = currentDistricts.find(d => d._id === selectedDistrict);
    const currentBlocks = currentDistrict?.blocks || [];

    // 1. 📡 Automatic Synchronization Protocol (No Buttons)
    const fetchAddresses = useCallback(async () => {
        try {
            const res = await api.get('/customer/addresses');
            if (res.data.success) {
                setAddresses(res.data.data || []);
            }
            // Dynamic Metadata Update
            document.title = `Address Registry | ${settings.siteName}`;
        } catch (err) {
            // Address sync failed silently
        } finally {
            setLoading(false);
        }
    }, [settings.siteName]);

    useEffect(() => {
        fetchAddresses();
        
        // Auto-sync when user returns to focus
        window.addEventListener('focus', fetchAddresses);
        return () => window.removeEventListener('focus', fetchAddresses);
    }, [fetchAddresses]);

    // 2. 📍 Smart Feature: Detect My Location (GPS Handshake)
    const detectMyLocation = () => {
        if (!navigator.geolocation) {
            return toast.error("Geolocation protocol is not supported by your browser.");
        }

        toast.info("Establishing Satellite Connection...");
        navigator.geolocation.getCurrentPosition(async (position) => {
            // Logic to reverse-geocode can be added here if needed
            toast.success("Geospatial coordinates locked. Please complete the street details.");
        }, () => {
            toast.error("Location access denied. Manual entry required.");
        });
    };

    // 3. 📝 Registry Write Protocol (Add/Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Security & Integrity Checks
        const sanitizedPin = formData.pincode.trim();
        if (sanitizedPin.length !== 6) return toast.warning("Invalid Pincode: Must be exactly 6 digits.");
        if (formData.fullAddress.trim().length < 10) return toast.warning("Detailed address is required for safe delivery.");

        setActionLoading(true);
        try {
            if (isEditing) {
                await api.put(`/customer/addresses/update/${isEditing}`, formData);
                toast.success("Logistics node updated successfully.");
            } else {
                await api.post('/customer/addresses/add', formData);
                toast.success("New delivery hub linked to your profile.");
            }
            closeForm();
            fetchAddresses(); // Silent background re-sync
        } catch (err) {
            toast.error(err.response?.data?.message || "Internal registry error.");
        } finally {
            setActionLoading(false);
        }
    };

    // 4. 🗑️ Node Decommission Protocol (Delete)
    const handleDelete = async (id) => {
        if (!window.confirm("CRITICAL: Permanently purge this delivery hub? This action is irreversible.")) return;
        try {
            await api.delete(`/customer/addresses/delete/${id}`);
            toast.info("Node decommissioned from registry.");
            fetchAddresses();
        } catch (err) {
            toast.error("Purge protocol handshake failed.");
        }
    };

    // 5. 🌟 Primary Node Assignment (Set Default)
    const handleSetDefault = async (id) => {
        try {
            await api.patch(`/customer/addresses/set-default/${id}`);
            toast.success("Primary delivery hub synchronized.");
            fetchAddresses();
        } catch (err) {
            toast.error("Failed to update default node.");
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setIsEditing(null);
        setSelectedState('');
        setSelectedDistrict('');
        setFormData({ type: 'Home', fullAddress: '', pincode: '', landmark: '', state: '', district: '', block: '', isDefault: false });
    };

    // --- Loading Architecture ---
    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: settings.themeColor || '#0f172a'}}></div>
            <p style={loaderText}>Establishing Secure Connection to {settings.siteName}...</p>
        </div>
    );

    return (
        <div style={pageWrapper}>
            <HomeHeader />
            
            <div style={container}>
                {/* --- [A] HEADER & DYNAMIC COMMAND BAR --- */}
                <div style={headerRow}>
                    <div>
                        <h1 style={titleS}>Address Registry</h1>
                        <p style={subS}>Manage your secure delivery hubs within {settings.siteName}.</p>
                    </div>
                    {!showForm && (
                        <button style={addBtnS(settings.themeColor)} onClick={() => setShowForm(true)}>
                            + REGISTER NEW HUB
                        </button>
                    )}
                </div>

                {/* --- [B] MODULAR FORM MODULE --- */}
                {showForm && (
                    <div style={formCard}>
                        <div style={formHeader}>
                            <h3 style={formTitle}>{isEditing ? 'MODIFY Hub Metadata' : 'LINK New Node'}</h3>
                            <button onClick={closeForm} style={closeIconBtn}>✕</button>
                        </div>
                        
                        <button type="button" onClick={detectMyLocation} style={detectBtn}>
                            📡 PINPOINT CURRENT GPS LOCATION
                        </button>

                        <form onSubmit={handleSubmit}>
                            <div style={inputGrid}>
                                <div style={inputGroup}>
                                    <label style={labS}>Sector Type</label>
                                    <select 
                                        style={inS} 
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    >
                                        <option value="Home">🏠 Personal Home</option>
                                        <option value="Office">🏢 Business Office</option>
                                        <option value="Other">📍 Alternative Node</option>
                                    </select>
                                </div>
                                <div style={inputGroup}>
                                    <label style={labS}>Area Pincode</label>
                                    <input 
                                        style={inS} 
                                        placeholder="6-digit PIN" 
                                        maxLength="6"
                                        value={formData.pincode}
                                        onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g,'')})}
                                        required 
                                    />
                                </div>
                            </div>

                            <div style={inputGrid}>
                                <div style={inputGroup}>
                                    <label style={labS}>State (राज्य)</label>
                                    <select 
                                        style={inS} 
                                        value={selectedState} 
                                        onChange={(e) => {
                                            setSelectedState(e.target.value);
                                            setSelectedDistrict('');
                                            setFormData({...formData, state: e.target.value, district: '', block: ''});
                                        }}
                                    >
                                        <option value="">Select State</option>
                                        {locations.map(s => (
                                            <option key={s._id} value={s._id}>{s.state}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={inputGroup}>
                                    <label style={labS}>District (जिला)</label>
                                    <select 
                                        style={inS} 
                                        value={selectedDistrict}
                                        onChange={(e) => {
                                            setSelectedDistrict(e.target.value);
                                            setFormData({...formData, district: e.target.value, block: ''});
                                        }}
                                        disabled={!selectedState}
                                    >
                                        <option value="">Select District</option>
                                        {currentDistricts.map(d => (
                                            <option key={d._id} value={d._id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={inputGrid}>
                                <div style={inputGroup}>
                                    <label style={labS}>Block (ब्लाक)</label>
                                    <select 
                                        style={inS} 
                                        value={formData.block}
                                        onChange={(e) => setFormData({...formData, block: e.target.value})}
                                        disabled={!selectedDistrict}
                                    >
                                        <option value="">Select Block</option>
                                        {currentBlocks.map((b, idx) => (
                                            <option key={idx} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={inputGroup}>
                                <label style={labS}>Detailed Street Identity (Building/Door/Street)</label>
                                <textarea 
                                    style={areaS} 
                                    placeholder="Enter precision details for accurate delivery..." 
                                    value={formData.fullAddress}
                                    onChange={(e) => setFormData({...formData, fullAddress: e.target.value})}
                                    required
                                />
                            </div>
                            <div style={inputGroup}>
                                <label style={labS}>Landmark (Optional Identifier)</label>
                                <input 
                                    style={inS} 
                                    placeholder="e.g. Near Technical Hub" 
                                    value={formData.landmark}
                                    onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                                />
                            </div>
                            
                            <div style={btnRow}>
                                <button type="button" style={cancelBtn} onClick={closeForm}>Discard</button>
                                <button type="submit" style={saveBtn(settings.themeColor)} disabled={actionLoading}>
                                    {actionLoading ? 'COMMITTING...' : 'AUTHORIZE & LINK'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* --- [C] LOGISTICS DATA GRID --- */}
                <div style={gridS}>
                    {addresses.length === 0 && !showForm ? (
                        <div style={emptyCard}>
                            <div style={{fontSize:'80px', marginBottom:'20px'}}>📍</div>
                            <h3 style={{color:'#0f172a'}}>No Active Nodes Linked</h3>
                            <p style={{color:'#64748b', fontSize:'15px'}}>Your logistics registry is empty. Link a location to start receiving deliveries.</p>
                            <button 
                                onClick={() => setShowForm(true)} 
                                style={{...addBtnS(settings.themeColor), marginTop:'25px'}}
                            >
                                Register Address Now
                            </button>
                        </div>
                    ) : (
                        addresses.map(a => (
                            <div key={a._id} style={a.isDefault ? activeAddrCard(settings.themeColor) : addrCardS}>
                                <div style={cardTop}>
                                    <span style={a.isDefault ? primaryTag(settings.themeColor) : tagS}>{a.type.toUpperCase()}</span>
                                    {a.isDefault && <span style={defaultBadge}>● PRIMARY HUB</span>}
                                </div>
                                
                                <div style={addressContent}>
                                    <p style={textS}>{a.fullAddress}</p>
                                    <div style={metaRow}>
                                        <span style={pinS}>PIN: {a.pincode}</span>
                                        {a.landmark && <span style={landmarkS}>• {a.landmark}</span>}
                                    </div>
                                </div>

                                <div style={actionsS}>
                                    <button style={actionBtn(settings.themeColor)} onClick={() => {
                                        setFormData(a);
                                        setIsEditing(a._id);
                                        setShowForm(true);
                                        window.scrollTo(0,0);
                                    }}>Modify</button>
                                    
                                    {!a.isDefault && (
                                        <button style={actionBtn(settings.themeColor)} onClick={() => handleSetDefault(a._id)}>Set Primary</button>
                                    )}
                                    
                                    <button style={remBtn} onClick={() => handleDelete(a._id)}>Purge</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            <MobileBottomNav />
        </div>
    );
};

// --- Enterprise Design Architecture ---

const pageWrapper = { background: '#f8fafc', minHeight: '100vh', paddingBottom: '120px', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const container = { width: '94%', maxWidth: '900px', margin: '30px auto' };

const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' };
const titleS = { margin: 0, fontSize: '28px', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px' };
const subS = { margin: '5px 0 0', color: '#64748b', fontSize: '15px', fontWeight: '500' };

const gridS = { display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' };

const addrCardS = { background: '#fff', padding: '30px', borderRadius: '35px', border: '1px solid #f1f5f9', transition: '0.3s', boxShadow: '0 10px 25px rgba(0,0,0,0.02)', position: 'relative' };
const activeAddrCard = (color) => ({ ...addrCardS, border: `2px solid ${color || '#2874f0'}`, background: '#fff' });

const cardTop = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const tagS = { background: '#f8fafc', color: '#64748b', padding: '6px 14px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' };
const primaryTag = (color) => ({ ...tagS, background: color || '#2874f0', color: '#fff' });
const defaultBadge = { fontSize: '9px', fontWeight: '900', color: '#10b981', letterSpacing: '0.5px' };

const addressContent = { marginBottom: '25px' };
const textS = { margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '15px', lineHeight: '1.6' };
const metaRow = { display:'flex', gap:'12px', marginTop:'12px', alignItems:'center' };
const pinS = { fontSize: '12px', color: '#94a3b8', fontWeight: '800' };
const landmarkS = { fontSize: '11px', color: '#cbd5e1', fontWeight: '600' };

const actionsS = { display: 'flex', gap: '20px', borderTop: '1.5px solid #f8fafc', paddingTop: '20px' };
const actionBtn = (color) => ({ background: 'none', border: 'none', color: color || '#2874f0', fontWeight: '800', fontSize: '11px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' });
const remBtn = { ...actionBtn('#f43f5e'), color:'#f43f5e' };

const addBtnS = (color) => ({ background: color || '#0f172a', color: '#fff', padding: '16px 25px', borderRadius: '16px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '12px', boxShadow: `0 10px 20px ${color}33` });

const formCard = { background: '#fff', padding: window.innerWidth < 768 ? '30px 20px' : '40px', borderRadius: '40px', marginBottom: '40px', border: '1px solid #f1f5f9', boxShadow: '0 25px 50px rgba(0,0,0,0.04)' };
const detectBtn = { width: '100%', padding: '15px', borderRadius: '15px', border: '2px dashed #cbd5e1', background: '#f8fafc', color: '#64748b', fontWeight: '800', fontSize: '12px', cursor: 'pointer', marginBottom: '25px' };

const formHeader = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px' };
const formTitle = { margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' };
const closeIconBtn = { background:'none', border:'none', fontSize:'18px', cursor:'pointer', color:'#cbd5e1' };

const inputGrid = { display: 'grid', gridTemplateColumns: window.innerWidth < 600 ? '1fr' : '1fr 1fr', gap: '25px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' };
const labS = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' };
const inS = { padding: '16px', borderRadius: '16px', border: '1.5px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontSize: '14px', fontWeight: '700', color: '#1e293b' };
const areaS = { ...inS, height: '100px', resize: 'none' };

const btnRow = { display: 'flex', gap: '15px', marginTop: '10px' };
const saveBtn = (color) => ({ flex: 2, background: color || '#0f172a', color: '#fff', border: 'none', padding: '18px', borderRadius: '18px', fontWeight: '900', cursor: 'pointer' });
const cancelBtn = { flex: 1, background: '#f8fafc', color: '#64748b', border: '1px solid #f1f5f9', padding: '18px', borderRadius: '18px', fontWeight: '800', cursor: 'pointer' };

const emptyCard = { textAlign: 'center', padding: '100px 30px', background: '#fff', borderRadius: '40px', border: '1px solid #f1f5f9' };
const loaderS = { display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '15px', background:'#f8fafc' };
const loaderText = { fontSize: '14px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' };

export default AddressBook;