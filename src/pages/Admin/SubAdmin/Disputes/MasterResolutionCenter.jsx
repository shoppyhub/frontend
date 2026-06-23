// src/pages/Admin/SubAdmin/Disputes/MasterResolutionCenter.jsx

import React, { useState } from 'react';
import useFetch from "../../../../hooks/useFetch";
import api from "../../../../services/api";
import { toast } from 'react-toastify';
import { useBranding } from '../../../../context/BrandingContext';

/**
 * RKD MART - MASTER ARBITRATION DESK
 * सब-एडमिन के लिए विवादों को सुलझाने का अंतिम केंद्र।
 */
const MasterResolutionCenter = () => {
    const { settings } = useBranding();
    const { data: disputes, loading, refetch } = useFetch('/admin/disputes');
    const [processingId, setProcessingId] = useState(null);
    const themeColor = settings?.themeColor || '#0f172a';

    /**
     * ⚖️ Action: Resolve Dispute Protocol
     * @param {String} disputeId - केस आईडी
     * @param {String} resolution - 'Refund' (ग्राहक को) या 'Release' (मर्चेंट को)
     */
    const handleVerdict = async (disputeId, resolution) => {
        const confirmMsg = resolution === 'Refund' 
            ? "CRITICAL: Refund full amount to Customer? This action is irreversible." 
            : "CONFIRM: Release funds to Merchant Hub?";
            
        if (!window.confirm(confirmMsg)) return;

        setProcessingId(disputeId);
        try {
            const res = await api.put(`/admin/disputes/status/${disputeId}`, {
                status: 'Resolved',
                resolution: resolution, // 'Refund' or 'Release'
                adminNotes: `Verdict reached by Sub-Admin Cluster. Action: ${resolution}`
            });

            if (res.data.success) {
                toast.success(`VERDICT_SYNCED: Case closed as ${resolution}.`);
                refetch(); // लिस्ट रिफ्रेश करें
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Arbitration Protocol Interrupted.");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div style={loadS}>📡 SYNCHRONIZING ARBITRATION DATA...</div>;

    return (
        <div style={containerS} className="fade-in">
            {/* --- 1. HEADER SECTION --- */}
            <div style={head}>
                <h2 style={{margin:0, fontWeight:'900', color:'#0f172a'}}>⚖️ Master Arbitration Desk</h2>
                <div style={alertBox}>
                    {disputes?.data?.disputes?.length || 0} ESCALATIONS REQUIRE VERDICT
                </div>
            </div>

            {/* --- 2. DISPUTE GRID --- */}
            <div style={disputeGrid}>
                {disputes?.data?.disputes && disputes.data.disputes.length > 0 ? (
                    disputes.data.disputes.map((caseItem) => (
                        <div key={caseItem.id} style={dCard}>
                            {/* Card Header */}
                            <div style={dTop}>
                                <span style={prioTag(caseItem.priority)}>LEVEL_{caseItem.priority?.toUpperCase()}</span>
                                <small style={idTag}>CASE_ID: #{caseItem.id?.substring(0, 8).toUpperCase()}</small>
                            </div>

                            {/* Dispute Content */}
                            <h4 style={dTitle}>{caseItem.reason}</h4>
                            <p style={dBody}>{caseItem.description}</p>

                            {/* Disputing Parties */}
                            <div style={partyRow}>
                                <div style={partyBox}>
                                    <small style={labS}>CUSTOMER</small>
                                    <div style={pName}>{caseItem.customerName}</div>
                                </div>
                                <div style={vs}>VS</div>
                                <div style={partyBox}>
                                    <small style={labS}>MERCHANT HUB</small>
                                    <div style={pName}>{caseItem.vendorName}</div>
                                </div>
                            </div>

                            {/* Evidence & Order Stats */}
                            <div style={evidenceRow}>
                                <div style={evItem}>💰 Amt: ₹{caseItem.orderAmount}</div>
                                <div style={evItem}>📅 Date: {new Date(caseItem.orderDate).toLocaleDateString()}</div>
                                <div style={evItem}>📦 Order: {caseItem.orderId?.substring(0, 8)}</div>
                            </div>

                            {/* Decision Buttons */}
                            <div style={actionRow}>
                                <button 
                                    disabled={processingId === caseItem.id}
                                    onClick={() => handleVerdict(caseItem.id, 'Refund')} 
                                    style={btnS('#ef4444')}
                                >
                                    {processingId === caseItem.id ? 'PROCESSING...' : 'REFUND CUSTOMER'}
                                </button>
                                <button 
                                    disabled={processingId === caseItem.id}
                                    onClick={() => handleVerdict(caseItem.id, 'Release')} 
                                    style={btnS('#10b981')}
                                >
                                    RELEASE TO SHOP
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={emptyS}>
                        <div style={{fontSize:'40px', marginBottom:'15px'}}>✨</div>
                        <h3 style={{margin:0}}>Registry Clear</h3>
                        <p style={{color:'#94a3b8', fontSize:'13px'}}>No active disputes require sub-admin intervention.</p>
                    </div>
                )}
            </div>
            
            <style>{`
                .fade-in { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

// --- ENTERPRISE STYLES ---

const containerS = { width:'100%', padding:'0px' };
const head = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'35px', flexWrap:'wrap', gap:'20px' };

const alertBox = { 
    background:'#fff1f2', color:'#e11d48', padding:'10px 22px', borderRadius:'100px', 
    fontSize:'11px', fontWeight:'900', border:'1.5px solid #ffe4e6', letterSpacing:'0.5px' 
};

const disputeGrid = { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(420px, 1fr))', gap:'25px' };

const dCard = { 
    background:'#fff', padding:'30px', borderRadius:'28px', border:'1px solid #f1f5f9', 
    boxShadow:'0 10px 30px rgba(0,0,0,0.03)', transition:'0.3s ease' 
};

const dTop = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' };

const prioTag = (p) => ({ 
    background: p === 'High' || p === 'Critical' ? '#ef4444' : '#64748b', 
    color:'#fff', padding:'5px 12px', borderRadius:'8px', fontSize:'10px', fontWeight:'900' 
});

const idTag = { color:'#94a3b8', fontWeight:'800', fontSize:'10px', fontFamily:'monospace' };

const dTitle = { margin:'0 0 12px 0', fontSize:'18px', color:'#1e293b', fontWeight:'800', letterSpacing:'-0.3px' };
const dBody = { fontSize:'14px', color:'#64748b', lineHeight:'1.6', marginBottom:'22px' };

const partyRow = { 
    display:'flex', alignItems:'center', gap:'10px', background:'#f8fafc', 
    padding:'18px', borderRadius:'18px', marginBottom:'22px', border:'1px solid #f1f5f9' 
};
const partyBox = { flex:1, textAlign:'center' };
const vs = { fontWeight:'900', color:'#cbd5e1', fontSize:'11px', background:'#fff', padding:'4px 8px', borderRadius:'50%', border:'1px solid #f1f5f9' };
const labS = { fontSize:'9px', fontWeight:'900', color:'#94a3b8', letterSpacing:'1px', display:'block', marginBottom:'5px' };
const pName = { fontSize:'14px', fontWeight:'800', color:'#1e293b' };

const evidenceRow = { display:'flex', flexWrap:'wrap', gap:'10px', marginBottom:'30px' };
const evItem = { 
    padding:'8px 15px', background:'#fcfdfe', borderRadius:'10px', fontSize:'11px', 
    fontWeight:'700', border:'1.5px solid #f1f5f9', color:'#475569' 
};

const actionRow = { display:'flex', gap:'12px' };
const btnS = (c) => ({ 
    flex:1, padding:'15px', border:'none', background:c, color:'#fff', 
    borderRadius:'14px', fontSize:'12px', fontWeight:'900', cursor:'pointer', 
    boxShadow:`0 8px 20px ${c}25`, transition:'0.3s' 
});

const emptyS = { 
    gridColumn: '1/-1', padding: '100px 20px', textAlign: 'center', 
    background:'#fff', borderRadius:'30px', border:'2px dashed #f1f5f9', color:'#cbd5e1' 
};

const loadS = { padding: '100px', textAlign: 'center', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px', fontSize:'12px' };

export default MasterResolutionCenter;