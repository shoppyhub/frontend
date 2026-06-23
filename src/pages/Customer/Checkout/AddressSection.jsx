import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import api from '../../../services/api';

const AddressSection = ({
    addresses, selectedAddrId, onSelect, isNew, setIsNew,
    customer, setCustomer, isLoaded, coords, setCoords, onAutoGPS, user
}) => {
    const [locations, setLocations] = useState([]);
    const [selectedState, setSelectedState] = useState(customer.state || '');
    const [selectedDistrict, setSelectedDistrict] = useState(customer.district || '');
    const [selectedBlock, setSelectedBlock] = useState(customer.block || '');

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

    // Reset selectors when customer address values change externally
    useEffect(() => {
        setSelectedState(customer.state || '');
        setSelectedDistrict(customer.district || '');
        setSelectedBlock(customer.block || '');
    }, [customer.state, customer.district, customer.block]);

    // Update customer object when location changes
    useEffect(() => {
        setCustomer(prev => ({
            ...prev,
            state: selectedState,
            district: selectedDistrict,
            block: selectedBlock
        }));
    }, [selectedState, selectedDistrict, selectedBlock, setCustomer]);

    const currentState = locations.find(s => s.state === selectedState);
    const currentDistricts = currentState?.districts || [];
    const currentDistrict = currentDistricts.find(d => d.name === selectedDistrict);
    const currentBlocks = currentDistrict?.blocks || [];
    return (
        <div style={cardS}>
            <div style={cardHeader}>
                <span style={stepNum}>1</span>
                <div style={{flex:1}}><h3 style={cardTitle}>DELIVERY ADDRESS</h3></div>
                {!isNew && addresses.length > 0 && <button onClick={() => setIsNew(true)} style={editBtn}>+ Add New Address</button>}
            </div>

            <div style={innerPadding}>
                {!isNew && addresses.length > 0 ? (
                    <>
                        <div style={userProfileBadge}>
                            <span style={{fontSize:'13px', fontWeight:'800', color:'#1e293b'}}>📝 Delivery to: {user?.fullName || customer.name} | {user?.mobile || customer.mobile}</span>
                            <small style={{color:'#64748b', fontSize:'11px'}}>From your saved profile</small>
                        </div>
                        <div style={addressGrid}>
                            {addresses.map(a => (
                                <div
                                    key={a._id}
                                    style={selectedAddrId === a._id ? activeAddr : addrItem}
                                    onClick={() => onSelect(a)}
                                >
                                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                                        <span style={tagS}>{a.type.toUpperCase()}</span>
                                        {selectedAddrId === a._id && <span style={checkIcon}>✓ SELECTED</span>}
                                    </div>
                                    <p style={addrTextS}>{a.fullAddress}</p>
                                    <small style={pinS}>📍 Area PIN: {a.pincode}</small>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div style={formWrapper}>
                        {addresses.length > 0 && (
                            <button onClick={() => setIsNew(false)} style={backToSaved}>← Back to Saved Addresses</button>
                        )}

                        <div style={userInfoBox}>
                            <small style={{color:'#64748b', fontWeight:'700'}}>📌 YOUR DELIVERY DETAILS</small>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginTop:'12px'}}>
                                <div style={userInfoField}>
                                    <label style={labS}>Name</label>
                                    <div style={{...inS, background:'#f0f9ff', borderColor:'#bfdbfe', color:'#1e293b', padding:'12px 14px', borderRadius:'10px'}}>{user?.fullName || customer.name || '—'}</div>
                                </div>
                                <div style={userInfoField}>
                                    <label style={labS}>Mobile</label>
                                    <div style={{...inS, background:'#f0f9ff', borderColor:'#bfdbfe', color:'#1e293b', padding:'12px 14px', borderRadius:'10px'}}>{user?.mobile || customer.mobile || '—'}</div>
                                </div>
                            </div>
                            <small style={{color:'#64748b', fontSize:'10px', marginTop:'8px', display:'block'}}>✓ Fetched from your profile (not editable here)</small>
                        </div>

                        <div style={mapSection}>
                            <button type="button" onClick={onAutoGPS} style={gpsBtn}>📡 PINPOINT CURRENT GPS LOCATION</button>
                            {isLoaded && (
                                <div style={mapWrapper}>
                                    <GoogleMap mapContainerStyle={{width:'100%', height:'100%'}} center={coords} zoom={16}>
                                        <Marker
                                            position={coords}
                                            draggable
                                            onDragEnd={(e) => setCoords({lat: e.latLng.lat(), lng: e.latLng.lng()})}
                                        />
                                    </GoogleMap>
                                </div>
                            )}
                        </div>

                        <div style={formGrid}>
                            <div style={inGrp}>
                                <label style={labS}>State</label>
                                <select 
                                    style={inS} 
                                    value={selectedState} 
                                    onChange={(e) => {
                                        setSelectedState(e.target.value);
                                        setSelectedDistrict('');
                                        setSelectedBlock('');
                                    }}
                                >
                                    <option value="">Select State</option>
                                    {locations.map(s => (
                                        <option key={s._id} value={s.state}>{s.state}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={inGrp}>
                                <label style={labS}>District</label>
                                <select 
                                    style={inS} 
                                    value={selectedDistrict}
                                    onChange={(e) => {
                                        setSelectedDistrict(e.target.value);
                                        setSelectedBlock('');
                                    }}
                                    disabled={!selectedState}
                                >
                                    <option value="">Select District</option>
                                    {currentDistricts.map(d => (
                                        <option key={d._id} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={inGrp}>
                                <label style={labS}>Block</label>
                                <select 
                                    style={inS} 
                                    value={selectedBlock}
                                    onChange={(e) => setSelectedBlock(e.target.value)}
                                    disabled={!selectedDistrict}
                                >
                                    <option value="">Select Block</option>
                                    {currentBlocks.map((b, idx) => (
                                        <option key={idx} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={inGrp}><label style={labS}>Area Pincode</label><input style={inS} value={customer.pincode} onChange={(e)=>setCustomer({...customer, pincode: e.target.value})} placeholder="6-digit PIN" /></div>
                            <div style={inGrp}><label style={labS}>Nearby Landmark</label><input style={inS} value={customer.locality} onChange={(e)=>setCustomer({...customer, locality: e.target.value})} placeholder="e.g. Near Mall" /></div>
                            <div style={{...inGrp, gridColumn:'span 2'}}><label style={labS}>Detailed Street Address</label><textarea style={areaS} value={customer.address} onChange={(e)=>setCustomer({...customer, address: e.target.value})} placeholder="Building, Floor, Street details..." /></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Styles (Condensed for brevity, same as previous but cleaner)
const cardS = { background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom:'0px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' };
const cardHeader = { padding: '22px 28px', background: '#fff', borderBottom: '1px solid #f1f5f9', display:'flex', alignItems:'center', gap:'16px' };
const stepNum = { background: '#0f172a', color: '#fff', width:'38px', height:'38px', borderRadius: '12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize: '14px', fontWeight: '900' };
const cardTitle = { margin: 0, fontSize: '14px', fontWeight: '900', color: '#0f172a', letterSpacing: '0.8px' };
const editBtn = { marginLeft: 'auto', background:'#2563eb', color:'#fff', border:'none', fontWeight:'800', cursor:'pointer', fontSize:'12px', padding:'10px 16px', borderRadius:'10px', transition:'0.2s' };
const innerPadding = { padding: '28px' };
const userProfileBadge = { background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1.5px solid #7dd3fc', padding: '16px 18px', borderRadius: '16px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '6px' };
const addressGrid = { display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)', gap: '18px', marginTop: '16px' };
const addrItem = { padding: '20px', borderRadius: '16px', border: '1.5px solid #f1f5f9', cursor: 'pointer', transition:'0.3s', background: '#fff', hover: { borderColor: '#bfdbfe' } };
const activeAddr = { ...addrItem, borderColor: '#2563eb', background: '#eff6ff', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)' };
const tagS = { background: '#1e293b', color: '#fff', padding: '5px 12px', borderRadius: '8px', fontSize: '9px', fontWeight: '800', width: 'fit-content' };
const checkIcon = { fontSize:'12px', color:'#2563eb', fontWeight:'900' };
const addrTextS = { fontSize: '14px', fontWeight: '700', color: '#1e293b', lineHeight: '1.6', margin:'8px 0 12px 0' };
const pinS = { fontSize: '12px', color: '#64748b', fontWeight: '600' };
const backToSaved = { background:'none', border:'none', color:'#2563eb', fontWeight:'800', cursor:'pointer', marginBottom:'20px', padding:'0', fontSize:'13px', transition: '0.2s' };
const mapSection = { marginBottom: '28px' };
const mapWrapper = { height: '280px', borderRadius: '16px', overflow: 'hidden', marginTop:'16px', border: '1.5px solid #e2e8f0' };
const gpsBtn = { width:'100%', padding:'16px', borderRadius:'14px', border:'2.5px dashed #2563eb', background:'#f0f9ff', color:'#2563eb', fontWeight:'800', cursor:'pointer', fontSize:'13px', transition: '0.2s' };
const formGrid = { display: 'grid', gridTemplateColumns: window.innerWidth < 600 ? '1fr' : window.innerWidth < 900 ? '1fr 1fr' : '1fr 1fr 1fr', gap: '16px' };
const inGrp = { display: 'flex', flexDirection: 'column', gap: '8px' };
const userInfoBox = { background: 'linear-gradient(135deg, #faf8ff 0%, #f3e8ff 100%)', border: '1.5px solid #e9d5ff', padding: '18px 20px', borderRadius: '16px', marginBottom: '24px' };
const userInfoField = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labS = { fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing:'0.6px' };
const inS = { padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontWeight: '600', color:'#1e293b', fontSize: '14px' };
const areaS = { ...inS, height: '100px', resize: 'none' };
const formWrapper = { animation: 'fadeIn 0.3s ease' };

export default AddressSection;