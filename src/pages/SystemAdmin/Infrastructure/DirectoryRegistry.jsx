import React, { useState, useMemo } from 'react';
import { useBranding } from '../../../context/BrandingContext';

const DirectoryRegistry = ({ banks, shopTypes, handleAddItem, deleteItem, cardS, cardHead, inS }) => {
    const { settings } = useBranding();
    const themeColor = settings?.themeColor || '#0f172a';

    // Local Search States
    const [bankSearch, setBankSearch] = useState("");
    const [typeSearch, setTypeSearch] = useState("");
    
    // Local Input States
    const [bankInput, setBankInput] = useState("");
    const [typeInput, setTypeInput] = useState("");

    // 🔍 Sub-Component: Modular Registry Node List
    const RegistryBox = ({ title, data, onAdd, onDelete, value, setValue, search, setSearch, type, placeholder }) => {
        
        // Filtering & Sorting Logic
        const filteredData = useMemo(() => {
            return data
                .filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
                .sort((a, b) => a.name.localeCompare(b.name));
        }, [data, search]);

        return (
            <div style={cardS}>
                <div style={cardHeaderFlex}>
                    <h4 style={cardHead}>{title}</h4>
                    <span style={countBadge(themeColor)}>{data.length} Nodes</span>
                </div>
                <p style={nodeHintS}>Manage global directory nodes for the {settings.siteName} ecosystem.</p>

                {/* --- Input Console --- */}
                <div style={inputConsoleS}>
                    <input 
                        style={{ ...inS, flex: 1, margin: 0 }} 
                        value={value} 
                        onChange={e => setValue(e.target.value)} 
                        placeholder={placeholder} 
                    />
                    <button 
                        style={value.trim().length > 2 ? addBtn(themeColor) : addBtnDisabled} 
                        disabled={value.trim().length <= 2}
                        onClick={() => { onAdd(value); setValue(""); }}
                    >
                        + DEPLOY
                    </button>
                </div>

                {/* --- Search Interface --- */}
                <div style={searchWrapperS}>
                    <span style={searchIconS}>🔍</span>
                    <input 
                        style={searchInS} 
                        placeholder="Search registry..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {/* --- Scrollable Data Stream --- */}
                <div className="custom-scroll" style={scrollAreaS}>
                    {filteredData.length === 0 ? (
                        <div style={emptyS}>No records match your query.</div>
                    ) : (
                        filteredData.map(item => (
                            <div key={item._id} style={listItemS}>
                                <div style={itemContentS}>
                                    <span style={dotS(themeColor)}></span>
                                    <span style={itemNameS}>{item.name}</span>
                                </div>
                                <button 
                                    style={purgeBtnS} 
                                    onClick={() => onDelete(type, item._id)}
                                    title="Purge Node"
                                >
                                    PURGE
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={responsiveGrid}>
            <RegistryBox 
                title="Settlement Institutions" 
                data={banks} 
                onAdd={(v) => handleAddItem('banks', { name: v })} 
                onDelete={deleteItem} 
                value={bankInput} 
                setValue={setBankInput}
                search={bankSearch}
                setSearch={setBankSearch} 
                type="banks" 
                placeholder="Enter Bank Name..."
            />
            
            <RegistryBox 
                title="Commercial Sector Types" 
                data={shopTypes} 
                onAdd={(v) => handleAddItem('shop-types', { name: v })} 
                onDelete={deleteItem} 
                value={typeInput} 
                setValue={setTypeInput} 
                search={typeSearch}
                setSearch={setTypeSearch}
                type="shop-types" 
                placeholder="Enter Category..."
            />

            <style>{`
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-track { background: #f8fafc; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                @media (max-width: 992px) {
                    .registry-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Definitions ---

const responsiveGrid = { 
    display: 'grid', 
    gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1fr', 
    gap: '30px',
    className: 'registry-grid',
    animation: 'fadeIn 0.5s ease'
};

const cardHeaderFlex = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' };
const countBadge = (color) => ({ background: `${color}10`, color: color, padding: '4px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '900' });
const nodeHintS = { fontSize:'12px', color:'#94a3b8', marginBottom:'25px', fontWeight:'500' };

const inputConsoleS = { display: 'flex', gap: '12px', marginBottom: '20px', background: '#f8fafc', padding: '10px', borderRadius: '20px', border: '1px solid #f1f5f9' };
const addBtn = (color) => ({ background: color, color: '#fff', border: 'none', borderRadius: '14px', padding: '0 25px', fontWeight: '900', cursor: 'pointer', fontSize: '11px', boxShadow: `0 8px 15px ${color}33`, transition:'0.3s' });
const addBtnDisabled = { ...addBtn('#cbd5e1'), background: '#cbd5e1', cursor: 'not-allowed', boxShadow: 'none' };

const searchWrapperS = { position:'relative', marginBottom:'15px' };
const searchIconS = { position:'absolute', left:'15px', top:'10px', fontSize:'12px', opacity:0.4 };
const searchInS = { width:'100%', padding:'10px 15px 10px 40px', borderRadius:'12px', border:'1px solid #f1f5f9', background:'#fff', outline:'none', fontSize:'12px', fontWeight:'700', color:'#475569', boxSizing:'border-box' };

const scrollAreaS = { flex: 1, overflowY: 'auto', maxHeight: '350px', paddingRight: '8px' };

const listItemS = { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: '16px 0', 
    borderBottom: '1px solid #f8fafc', 
    transition: '0.2s' 
};

const itemContentS = { display:'flex', alignItems:'center', gap:'12px' };
const dotS = (color) => ({ width:'6px', height:'6px', borderRadius:'50%', background: color, opacity:0.3 });
const itemNameS = { fontSize: '14px', fontWeight: '700', color: '#1e293b' };

const purgeBtnS = { color: '#f43f5e', background: '#fff1f2', border: 'none', cursor: 'pointer', fontSize: '9px', fontWeight: '900', padding:'6px 12px', borderRadius:'8px', letterSpacing:'0.5px' };

const emptyS = { textAlign: 'center', padding: '40px 0', color: '#cbd5e1', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' };

export default DirectoryRegistry;