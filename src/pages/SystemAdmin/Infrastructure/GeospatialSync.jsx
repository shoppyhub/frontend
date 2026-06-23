import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import { useBranding } from '../../../context/BrandingContext';

const GeospatialSync = ({ locations, handleExcelUpload, uploading, fetchData }) => {
    const { settings } = useBranding();
    const [selectedState, setSelectedState] = useState(null); 
    const [newItem, setNewItem] = useState({ type: 'state', name: '', parentId: '' });
    const [isActionLoading, setIsActionLoading] = useState(false);
    
    // States for Inline Additions
    const [activeBlockInput, setActiveBlockInput] = useState(null); 
    const [blockName, setBlockName] = useState("");
    const [stateSearch, setStateSearch] = useState("");

    // --- 📡 Automatic Background Sync Protocol ---
    useEffect(() => {
        document.title = `Geospatial Registry | ${settings.siteName}`;
        
        const handleFocusSync = () => fetchData();
        window.addEventListener('focus', handleFocusSync);
        return () => window.removeEventListener('focus', handleFocusSync);
    }, [fetchData, settings.siteName]);

    // Filtered States for the Left Pane
    const filteredStates = useMemo(() => {
        return locations.filter(l => l.state.toLowerCase().includes(stateSearch.toLowerCase()));
    }, [locations, stateSearch]);

    // --- 1. Manual Node Addition Logic ---
    const handleManualAdd = async (type, name, parentId = null) => {
        if (!name?.trim()) return toast.warning("Protocol Alert: Node identity name required.");
        
        setIsActionLoading(true);
        try {
            let res;
            if (type === 'state') {
                res = await api.post('/admin/directories/locations/state/add', { state: name });
            } else if (type === 'district') {
                res = await api.post(`/admin/directories/locations/district/add/${selectedState._id}`, { name: name });
            } else if (type === 'block') {
                res = await api.post(`/admin/directories/locations/block/add/${selectedState._id}/${parentId}`, { name: name });
            }

            if (res.data.success) {
                toast.success(`${type.toUpperCase()} node synchronized successfully!`);
                setNewItem({ type: 'state', name: '', parentId: '' });
                setBlockName("");
                setActiveBlockInput(null);
                fetchData(); 
            }
        } catch (err) { 
            toast.error(err.response?.data?.message || "Protocol Error: Handshake failed."); 
        } finally { 
            setIsActionLoading(false); 
        }
    };

    // --- 2. Node Removal Protocol (Purge) ---
    const handleRemove = async (id, distId = null) => {
        const confirmMsg = distId 
            ? "CRITICAL: Purging this District node will affect all linked commercial hubs. Proceed?"
            : "SECURITY ALERT: Deleting a State node is a structural change. Proceed?";
        
        if (!window.confirm(confirmMsg)) return;

        setIsActionLoading(true);
        try {
            const url = distId 
                ? `/admin/directories/locations/district/delete/${id}/${distId}` 
                : `/admin/directories/locations/state/delete/${id}`;
            await api.delete(url);
            toast.info("Registry Updated: Geographic node decommissioned.");
            fetchData();
            if(!distId) setSelectedState(null);
        } catch (err) { 
            toast.error("Security Violation: Deletion failed."); 
        } finally {
            setIsActionLoading(false);
        }
    };

    const themeColor = settings?.themeColor || '#0f172a';

    return (
        <div style={container}>
            {/* --- [A] TOP BANNER: BULK LOGISTICS SYNC --- */}
            <div style={bulkCard}>
                <div style={{ flex: 1 }}>
                    <h3 style={mainTitleS}>📍 Geospatial Hierarchy Registry</h3>
                    <p style={subTitleS}>Strategic management of operational coverage areas for {settings.siteName}.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems:'center' }}>
                    <input type="file" id="xl" hidden onChange={handleExcelUpload} disabled={uploading === "excel" || isActionLoading} />
                    <label htmlFor="xl" style={uploading === "excel" ? xlLabelDisabled : xlLabel(themeColor)}>
                        {uploading === "excel" ? "SYNCING CLUSTER..." : "📤 BULK REGISTRY IMPORT"}
                    </label>
                </div>
            </div>

            <div style={layoutGrid}>
                {/* --- [B] LEFT: STATE DIRECTORY --- */}
                <div style={paneS}>
                    <div style={paneHeader(themeColor)}>
                        <h4 style={paneTitleS}>State Nodes ({locations.length})</h4>
                        <div style={inputGroupSmall}>
                            <input 
                                placeholder="Add State..." 
                                style={miniIn} 
                                value={newItem.type === 'state' ? newItem.name : ''} 
                                onChange={e => setNewItem({ type: 'state', name: e.target.value })}
                                disabled={isActionLoading}
                            />
                            <button onClick={() => handleManualAdd('state', newItem.name)} style={miniAdd(themeColor)} disabled={isActionLoading}>
                                {isActionLoading && newItem.type === 'state' ? '...' : '+'}
                            </button>
                        </div>
                    </div>
                    
                    {/* State Search */}
                    <div style={searchWrapper}>
                        <input 
                            placeholder="Search states..." 
                            style={searchInS} 
                            value={stateSearch} 
                            onChange={(e) => setStateSearch(e.target.value)} 
                        />
                    </div>

                    <div className="custom-scroll" style={scrollList}>
                        {filteredStates.map(loc => (
                            <div key={loc._id} style={selectedState?._id === loc._id ? activeItem(themeColor) : listItem} onClick={() => setSelectedState(loc)}>
                                <div>
                                    <div style={nodeNameS}>{loc.state}</div>
                                    <small style={nodeMetaS}>{loc.districts?.length || 0} Districts Active</small>
                                </div>
                                <button style={delBtn} onClick={(e) => { e.stopPropagation(); handleRemove(loc._id); }} disabled={isActionLoading}>✕</button>
                            </div>
                        ))}
                        {filteredStates.length === 0 && <div style={noDataTxt}>No states discovered.</div>}
                    </div>
                </div>

                {/* --- [C] RIGHT: DISTRICT & BLOCK EXPLORER --- */}
                <div style={paneS}>
                    {selectedState ? (
                        <>
                            <div style={paneHeader(themeColor)}>
                                <h4 style={paneTitleS}>📍 Districts in {selectedState.state}</h4>
                                <div style={inputGroupSmall}>
                                    <input 
                                        placeholder="Add District..." 
                                        style={miniIn} 
                                        value={newItem.type === 'district' ? newItem.name : ''} 
                                        onChange={e => setNewItem({ type: 'district', name: e.target.value })}
                                        disabled={isActionLoading}
                                    />
                                    <button onClick={() => handleManualAdd('district', newItem.name)} style={miniAdd(themeColor)} disabled={isActionLoading}>
                                        {isActionLoading && newItem.type === 'district' ? '...' : '+'}
                                    </button>
                                </div>
                            </div>
                            <div className="custom-scroll" style={scrollList}>
                                {selectedState.districts?.map(dist => (
                                    <div key={dist._id} style={distCard}>
                                        <div style={distRow}>
                                            <div>
                                                <b style={distNameS}>{dist.name}</b>
                                                <small style={blockCountLab}>{dist.blocks?.length || 0} Blocks linked</small>
                                            </div>
                                            <button style={delBtn} onClick={() => handleRemove(selectedState._id, dist._id)} disabled={isActionLoading}>✕</button>
                                        </div>
                                        <div style={blockCloud}>
                                            {dist.blocks?.map((blk, bi) => (
                                                <span key={bi} style={blockBadge}>{blk}</span>
                                            ))}
                                            
                                            {activeBlockInput === dist._id ? (
                                                <div style={inlineFormS}>
                                                    <input 
                                                        autoFocus
                                                        style={inlineIn}
                                                        placeholder="Block Name"
                                                        value={blockName}
                                                        onChange={(e) => setBlockName(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleManualAdd('block', blockName, dist._id)}
                                                    />
                                                    <button onClick={() => handleManualAdd('block', blockName, dist._id)} style={inlineAddBtn(themeColor)}>OK</button>
                                                    <button onClick={() => setActiveBlockInput(null)} style={inlineCancelBtn}>✕</button>
                                                </div>
                                            ) : (
                                                <button 
                                                    style={addBlockBtn(themeColor)} 
                                                    disabled={isActionLoading}
                                                    onClick={() => setActiveBlockInput(dist._id)}
                                                >
                                                    + Link Block
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {selectedState.districts?.length === 0 && <div style={noDataTxt}>No district nodes registered for this state.</div>}
                            </div>
                        </>
                    ) : (
                        <div style={emptyState}>
                            <div style={{fontSize:'70px', marginBottom:'25px'}}>🌐</div>
                            <h3 style={{margin:0, color:'#0f172a'}}>Registry Selection Required</h3>
                            <p style={{maxWidth:'320px', marginTop:'10px', color:'#94a3b8', fontWeight:'500'}}>Select a State node from the left directory to audit and manage its jurisdictional hierarchy.</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @media (max-width: 1100px) {
                    .geo-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Definitions ---

const container = { animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const bulkCard = { background: '#fff', padding: '30px', borderRadius: '35px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', marginBottom: '35px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', flexWrap:'wrap', gap:'20px' };
const mainTitleS = { margin: 0, color: '#0f172a', fontWeight:'900', fontSize:'22px', letterSpacing:'-0.5px' };
const subTitleS = { margin: '5px 0 0', fontSize: '13px', color: '#64748b', fontWeight:'500' };

const xlLabel = (color) => ({ background: color, color: '#fff', padding: '14px 28px', borderRadius: '15px', cursor: 'pointer', fontWeight: '900', fontSize: '12px', boxShadow:`0 10px 20px ${color}33`, transition:'0.3s' });
const xlLabelDisabled = { background: '#f1f5f9', color: '#cbd5e1', padding: '14px 28px', borderRadius: '15px', cursor: 'not-allowed', fontWeight: '900', fontSize: '12px' };

const layoutGrid = { display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '30px', className:'geo-grid' };
const paneS = { background: '#fff', borderRadius: '40px', border: '1px solid #f1f5f9', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '650px', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' };

const paneHeader = (color) => ({ padding: '25px', borderBottom: '1.5px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderTop: `6px solid ${color}` });
const paneTitleS = { margin: 0, fontSize:'14px', fontWeight:'900', color:'#0f172a', textTransform:'uppercase', letterSpacing:'1px' };

const searchWrapper = { padding: '15px 25px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' };
const searchInS = { width: '100%', padding: '10px 15px', borderRadius: '12px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '13px', fontWeight: '600' };

const scrollList = { flex: 1, overflowY: 'auto', padding: '20px' };
const listItem = { padding: '20px', borderRadius: '22px', marginBottom: '12px', border: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.3s', background:'#f8fafc' };
const activeItem = (color) => ({ ...listItem, background: `${color}08`, borderColor: color });

const nodeNameS = { fontWeight: '900', color:'#1e293b', fontSize:'15px' };
const nodeMetaS = { color:'#94a3b8', fontWeight:'700', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.5px' };

const distCard = { background: '#fff', padding: '25px', borderRadius: '30px', marginBottom: '20px', border: '1.5px solid #f1f5f9', boxShadow:'0 4px 12px rgba(0,0,0,0.02)' };
const distRow = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems:'center' };
const distNameS = { color: '#0f172a', fontSize:'16px', fontWeight:'900', letterSpacing:'-0.5px', display:'block' };
const blockCountLab = { fontSize:'10px', color: '#94a3b8', fontWeight:'800', textTransform:'uppercase' };

const blockCloud = { display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems:'center' };
const blockBadge = { background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', color: '#475569' };

const addBlockBtn = (color) => ({ 
    background: `${color}08`, 
    border: `1.5px dashed ${color}44`, 
    color: color, 
    padding: '8px 16px', 
    borderRadius: '12px', 
    fontSize: '11px', 
    fontWeight: '900', 
    cursor: 'pointer', 
    transition:'0.2s' 
});

const inlineFormS = { display:'flex', alignItems:'center', gap:'8px', background:'#f8fafc', padding:'5px', borderRadius:'12px', border:'1px solid #e2e8f0' };
const inlineIn = { border:'none', background:'transparent', outline:'none', fontSize:'12px', fontWeight:'800', padding:'5px', width:'100px', color:'#1e293b' };
const inlineAddBtn = (color) => ({ background: color, color:'#fff', border:'none', borderRadius:'8px', padding:'5px 12px', fontSize:'10px', fontWeight:'900', cursor:'pointer' });
const inlineCancelBtn = { background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontWeight:'bold' };

const inputGroupSmall = { display: 'flex', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' };
const miniIn = { border: 'none', padding: '10px 15px', outline: 'none', fontSize: '12px', width: '120px', background:'transparent', fontWeight:'700', color:'#1e293b' };
const miniAdd = (color) => ({ background: color, color: '#fff', border: 'none', padding: '0 15px', cursor: 'pointer', fontWeight: '900' });

const delBtn = { background: 'rgba(244, 63, 94, 0.05)', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '14px', width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold' };
const emptyState = { display: 'flex', flexDirection:'column', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px', fontWeight: '700', padding:'40px', textAlign:'center', animation:'fadeIn 0.5s ease' };
const noDataTxt = { textAlign:'center', padding:'20px', color:'#cbd5e1', fontWeight:'800', fontSize:'12px', textTransform:'uppercase' };

export default GeospatialSync;