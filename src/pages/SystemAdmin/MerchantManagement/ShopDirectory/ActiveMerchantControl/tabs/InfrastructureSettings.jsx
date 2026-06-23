import React, { useState, useEffect, useMemo } from 'react';
import api from 'services/api';
import { toast } from 'react-toastify';

const InfrastructureSettings = ({ merchant, refresh }) => {
    // --- States ---
    const [locations, setLocations] = useState([]);
    const [selectedState, setSelectedState] = useState(merchant.shopState || "");
    const [selectedDist, setSelectedDist] = useState(merchant.shopDistrict || "");
    const [isProcessing, setIsProcessing] = useState(false);

    // 1. 📡 डेटा लोड (Locations Master Registry)
    useEffect(() => {
        api.get('/admin/directories/locations').then(res => setLocations(res.data.data));
    }, []);

    // 2. 🛡️ ऑपरेशनल कमांड्स (Node Movement)
    const handleNodeMove = async () => {
        if (!selectedState || !selectedDist) return toast.warn("Specify full geographic coordinates.");
        if (!window.confirm("🚨 CRITICAL: Re-routing Hub Jurisdiction? This will affect hyperlocal discovery.")) return;

        setIsProcessing(true);
        try {
            const res = await api.put(`/admin/hierarchy/update/${merchant._id}`, {
                shopState: selectedState,
                shopDistrict: selectedDist
            });
            if (res.data.success) {
                toast.success("Node Re-routed Successfully.");
                refresh();
            }
        } catch (err) { toast.error("Transfer Interrupted."); }
        finally { setIsProcessing(false); }
    };

    // 3. ⭐ प्रमोशन कंट्रोल
    const toggleFeatured = async () => {
        try {
            await api.patch(`/admin/shops/promote/${merchant._id}`, { isFeatured: !merchant.isFeatured });
            toast.info(`Marketplace visibility: ${!merchant.isFeatured ? 'BOOSTED' : 'STANDARD'}`);
            refresh();
        } catch (err) { toast.error("Protocol Error."); }
    };

    // 🔍 जिलों की लिस्ट फिल्टर करें
    const districtOptions = useMemo(() => {
        const stateData = locations.find(l => l.state === selectedState);
        return stateData ? stateData.districts : [];
    }, [locations, selectedState]);

    return (
        <div style={containerS}>
            <div style={gridS}>
                
                {/* --- LEFT: JURISDICTION OVERRIDE --- */}
                <div style={colS}>
                    <div style={cardS}>
                        <div style={cardHeadS}>
                            <h3 style={titleS}>🗺️ JURISDICTIONAL NODE OVERRIDE</h3>
                            <span style={tagS}>CRITICAL_ACCESS</span>
                        </div>
                        <p style={descS}>Move this hub to a different geographic cluster. All linked orders and delivery executives will be reassigned to the new zone.</p>
                        
                        <div style={alertBoxS}>
                            <b>⚠️ ATTENTION:</b> Changing the node location affects the "Nearby Shops" discovery algorithm instantly.
                        </div>

                        <div style={formRowS}>
                            <div style={inGrpS}>
                                <label style={labS}>TARGET STATE</label>
                                <select style={selectS} value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedDist(""); }}>
                                    <option value="">-- Select State --</option>
                                    {locations.map(l => <option key={l._id} value={l.state}>{l.state}</option>)}
                                </select>
                            </div>

                            <div style={inGrpS}>
                                <label style={labS}>TARGET DISTRICT</label>
                                <select style={selectS} value={selectedDist} onChange={e => setSelectedDist(e.target.value)} disabled={!selectedState}>
                                    <option value="">-- Select District --</option>
                                    {districtOptions.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <button 
                            onClick={handleNodeMove} 
                            style={moveBtnS(isProcessing)} 
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'SYNCHRONIZING...' : '🚀 INITIATE NODE TRANSFER'}
                        </button>
                    </div>
                </div>

                {/* --- RIGHT: MARKETPLACE GOVERNANCE --- */}
                <div style={colS}>
                    <div style={cardS}>
                        <h3 style={titleS}>🌟 MARKETPLACE POSITIONING</h3>
                        <p style={descS}>Featured hubs receive priority indexing and appear at the top of the consumer marketplace.</p>
                        
                        <div style={featuredCardS(merchant.isFeatured)}>
                            <div style={featIconS}>🏆</div>
                            <div style={{flex:1}}>
                                <div style={{fontWeight:'900', fontSize:'14px'}}>{merchant.isFeatured ? 'CURRENTLY FEATURED' : 'STANDARD VISIBILITY'}</div>
                                <div style={{fontSize:'10px', opacity:0.7}}>{merchant.isFeatured ? 'Active on landing page boost' : 'Default marketplace rank'}</div>
                            </div>
                            <button onClick={toggleFeatured} style={featToggleS(merchant.isFeatured)}>
                                {merchant.isFeatured ? 'REVOKE' : 'BOOST HUB'}
                            </button>
                        </div>
                    </div>

                    <div style={cardS}>
                        <h3 style={titleS}>🧾 FISCAL PROTOCOL</h3>
                        <div style={rowBetweenS}>
                            <div>
                                <div style={{fontWeight:'800', fontSize:'12px'}}>Global Commission Rate</div>
                                <div style={{fontSize:'10px', color:'#94a3b8'}}>Platform Standard Fee</div>
                            </div>
                            <b style={{fontSize:'18px', color: '#10b981'}}>5.0%</b>
                        </div>
                        <button style={customBtnS} onClick={() => toast.info("Custom commission coming soon.")}>
                            ⚙️ OVERRIDE FEE MODEL
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

// --- Strategic SaaS Styles ---

const containerS = { animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const gridS = { display:'grid', gridTemplateColumns: window.innerWidth < 1100 ? '1fr' : '1.3fr 1fr', gap:'30px' };
const colS = { display:'flex', flexDirection:'column', gap:'25px' };

const cardS = { background:'#fff', padding:'30px', borderRadius:'30px', border:'1px solid #f1f5f9', boxShadow:'0 10px 30px rgba(0,0,0,0.02)' };
const cardHeadS = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px' };
const titleS = { margin:0, fontSize:'13px', fontWeight:'900', color:'#0f172a', letterSpacing:'0.5px' };
const tagS = { background:'#fff1f2', color:'#ef4444', fontSize:'9px', fontWeight:'900', padding:'4px 10px', borderRadius:'6px' };

const descS = { fontSize:'12px', color:'#64748b', lineHeight:'1.6', marginBottom:'20px' };
const alertBoxS = { background:'#fffbeb', border:'1px solid #fef3c7', padding:'15px', borderRadius:'15px', color:'#92400e', fontSize:'11px', marginBottom:'25px' };

const formRowS = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'25px' };
const inGrpS = { display:'flex', flexDirection:'column', gap:'8px' };
const labS = { fontSize:'9px', fontWeight:'900', color:'#94a3b8', letterSpacing:'1px' };
const selectS = { padding:'15px', borderRadius:'15px', border:'2.5px solid #f1f5f9', background:'#fcfdfe', outline:'none', fontWeight:'700', fontSize:'13px', cursor:'pointer' };

const moveBtnS = (loading) => ({ width:'100%', padding:'18px', borderRadius:'18px', background: loading ? '#cbd5e1' : '#0f172a', color:'#fff', border:'none', fontWeight:'900', fontSize:'12px', cursor:'pointer', boxShadow:'0 10px 25px rgba(15,23,42,0.2)', transition:'0.3s' });

const featuredCardS = (active) => ({ display:'flex', alignItems:'center', gap:'20px', padding:'20px', borderRadius:'22px', background: active ? '#fffbeb' : '#f8fafc', border: `1.5px solid ${active ? '#f59e0b' : '#f1f5f9'}`, marginTop:'10px' });
const featIconS = { width:'45px', height:'45px', background:'#fff', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)' };
const featToggleS = (active) => ({ padding:'8px 15px', borderRadius:'10px', border: active ? '1.5px solid #f59e0b' : 'none', background: active ? 'transparent' : '#f59e0b', color: active ? '#f59e0b' : '#fff', fontWeight:'900', fontSize:'10px', cursor:'pointer' });

const rowBetweenS = { display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f8fafc', padding:'20px', borderRadius:'20px', margin:'15px 0' };
const customBtnS = { width:'100%', padding:'12px', borderRadius:'12px', background:'transparent', border:'1.5px solid #e2e8f0', color:'#475569', fontWeight:'900', fontSize:'10px', cursor:'pointer' };

export default InfrastructureSettings;