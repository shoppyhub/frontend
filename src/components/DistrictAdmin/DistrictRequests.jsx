import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api'; // Centralized API Gateway
import { useBranding } from '../../context/BrandingContext';
import { toast } from 'react-toastify';

const DistrictRequests = () => {
    const { settings } = useBranding();
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const themeColor = settings?.themeColor || '#0d9488';

    // 1. Fetch District-Specific Merchant Requests
    const fetchDistrictShops = useCallback(async () => {
        setLoading(true);
        try {
            // API filtered by District Node automatically via Backend Auth
            const res = await api.get('/admin/district-shops');
            if (res.data.success) {
                setShops(res.data.data || []);
            }
        } catch (err) {
            console.error("Infrastructure Sync Error:", err);
            toast.error("Failed to sync district merchant nodes.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDistrictShops();
    }, [fetchDistrictShops]);

    // 2. Action: Forward to System Admin or Reject Node
    const handleAction = async (id, action, shopName) => {
        const confirmMsg = action === 'forward' 
            ? `Are you sure you want to FORWARD ${shopName} to System Admin for final ID generation?` 
            : `Are you sure you want to REJECT ${shopName}? This action is permanent.`;

        if (!window.confirm(confirmMsg)) return;

        try {
            // Logic: Forward means District Admin has physically verified the shop
            const endpoint = action === 'forward' ? `/admin/forward-shop/${id}` : `/admin/reject-shop/${id}`;
            const res = await api.put(endpoint);

            if (res.data.success) {
                toast.success(`Protocol Success: ${shopName} ${action === 'forward' ? 'forwarded for activation' : 'rejected'}.`);
                fetchDistrictShops();
            }
        } catch (err) {
            toast.error("Handshake Failed: Action could not be authorized.");
        }
    };

    // Filter Logic for Search
    const filteredShops = shops.filter(s => 
        s.shopDetails.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={containerS}>
            {/* Header Module */}
            <div style={headerSection}>
                <div style={headTxt}>
                    <h2 style={titleS}>📑 Verification Pipeline</h2>
                    <p style={subS}>Physical audit queue: Forward verified merchants to System HQ for activation.</p>
                </div>
                <div style={searchBox}>
                    <span style={{opacity:0.5}}>🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search queue..." 
                        style={inS}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Module */}
            <div style={cardS}>
                <div style={{ overflowX: 'auto' }}> {/* Mobile scroll safety */}
                    {loading ? (
                        <div style={loadingArea}>
                            <div className="shimmer-line"></div>
                            <p>Synchronizing Global Registry...</p>
                        </div>
                    ) : (
                        <table style={tableS}>
                            <thead>
                                <tr style={thRow}>
                                    <th style={thS}>MERCHANT NODE / OWNER</th>
                                    <th style={thS}>LOCATION (BLOCK/ZONE)</th>
                                    <th style={thS}>CONTACT IDENTIFIER</th>
                                    <th style={thS}>DOCS</th>
                                    <th style={thS}>ADMIN PROTOCOL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredShops.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={emptyMsg}>
                                            Infrastructure Note: No pending verification requests in this district hub.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredShops.map(s => (
                                        <tr key={s._id} style={trS}>
                                            <td style={tdS}>
                                                <div style={shopNameTxt}>{s.shopDetails.shopName}</div>
                                                <small style={ownerTxt}>Owner: {s.fullName}</small>
                                            </td>
                                            <td style={tdS}>
                                                <span style={blockBadge}>{s.shopDetails.block || 'N/A'}</span>
                                            </td>
                                            <td style={tdS}>
                                                <div style={mobileTxt}>{s.mobile}</div>
                                                <small style={{color:'#94a3b8'}}>{s.email}</small>
                                            </td>
                                            <td style={tdS}>
                                                <button style={docBtn} onClick={() => window.open(s.shopDetails.documents, '_blank')}>📄 View</button>
                                            </td>
                                            <td style={tdS}>
                                                <div style={actionGroup}>
                                                    <button 
                                                        onClick={() => handleAction(s._id, 'forward', s.shopDetails.shopName)} 
                                                        style={fwdBtn(themeColor)}
                                                    >
                                                        ✅ FORWARD
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAction(s._id, 'reject', s.shopDetails.shopName)} 
                                                        style={rejBtn}
                                                    >
                                                        ❌ REJECT
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes shimmer { 0% { background-position: -468px 0; } 100% { background-position: 468px 0; } }
                .shimmer-line { height: 4px; width: 100%; background: #f6f7f8; background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%); background-repeat: no-repeat; background-size: 800px 104px; display: inline-block; position: relative; animation: shimmer 1.5s infinite linear; border-radius: 10px; margin-bottom: 10px; }
            `}</style>
        </div>
    );
};

// --- Professional UI Architecture ---

const containerS = { animation: 'fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)' };

const headerSection = { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', 
    marginBottom: '35px', flexWrap: 'wrap', gap: '20px' 
};

const headTxt = { flex: 1 };
const titleS = { margin: 0, color: '#0f172a', fontSize: '26px', fontWeight: '900', letterSpacing: '-0.5px' };
const subS = { color: '#64748b', margin: '5px 0 0 0', fontSize: '14px', fontWeight: '500' };

const searchBox = { 
    display: 'flex', alignItems: 'center', background: '#fff', 
    border: '1.5px solid #e2e8f0', borderRadius: '14px', 
    padding: '0 15px', width: window.innerWidth < 600 ? '100%' : '300px' 
};
const inS = { border: 'none', padding: '12px', outline: 'none', fontSize: '13px', fontWeight: '600', flex: 1 };

const cardS = { 
    backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', 
    border: '1px solid #f1f5f9', boxShadow: '0 15px 40px rgba(0,0,0,0.02)' 
};

const tableS = { width: '100%', borderCollapse: 'collapse', minWidth: '900px' };

const thRow = { backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' };
const thS = { padding: '20px', textAlign: 'left', color: '#94a3b8', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' };

const trS = { borderBottom: '1px solid #f8fafc', transition: '0.2s' };
const tdS = { padding: '20px', verticalAlign: 'middle' };

const shopNameTxt = { color: '#1e293b', fontWeight: '800', fontSize: '15px' };
const ownerTxt = { color: '#64748b', fontWeight: '600', fontSize: '12px' };

const blockBadge = { background: '#f1f5f9', color: '#475569', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', border: '1px solid #e2e8f0' };

const mobileTxt = { color: '#1e293b', fontWeight: '700', fontSize: '14px' };

const docBtn = { background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', color: '#475569' };

const actionGroup = { display: 'flex', gap: '8px' };

const fwdBtn = (color) => ({ 
    background: color, color: '#fff', border: 'none', padding: '10px 18px', 
    borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer',
    boxShadow: `0 4px 12px ${color}33`, transition: '0.3s'
});

const rejBtn = { 
    background: '#fff1f2', color: '#e11d48', border: '1px solid #ffe4e6', 
    padding: '10px 18px', borderRadius: '12px', fontSize: '12px', 
    fontWeight: '800', cursor: 'pointer', transition: '0.3s' 
};

const loadingArea = { padding: '60px', textAlign: 'center', color: '#94a3b8', fontWeight: '600' };
const emptyMsg = { textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '14px', fontWeight: '600', fontStyle: 'italic' };

export default DistrictRequests;