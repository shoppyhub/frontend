import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { useBranding } from '../../../../context/BrandingContext';
import { toast } from 'react-toastify';

const UrgentTickets = () => {
    const { settings } = useBranding();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const themeColor = settings?.themeColor || '#0d9488';

    // 1. Fetch High Priority Tickets
    useEffect(() => {
        const fetchUrgentTickets = async () => {
            try {
                // Fetching only 'High' priority and 'Open' status tickets
                const res = await api.get('/admin/support/tickets?priority=High&status=Open');
                if (res.data.success) {
                    setTickets(res.data.data || []);
                }
            } catch (err) {
                console.error("Support Node Sync Error");
                // Mock data for initial testing
                setTickets([
                    { _id: '1', ticketId: 'TK-8812', merchantName: 'RK Supermarket', issue: 'Payment not reflecting in wallet after successful order.', category: 'FINANCE', time: '15 mins ago' },
                    { _id: '2', ticketId: 'TK-8815', merchantName: 'Modern Grocers', issue: 'App crashing during product image upload.', category: 'TECHNICAL', time: '1 hour ago' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchUrgentTickets();
    }, []);

    // 2. Action: Resolve Ticket Protocol
    const resolveTicket = async (id, ticketId) => {
        if (!window.confirm(`CONFIRM: Have you resolved Ticket ${ticketId}?`)) return;
        
        try {
            const res = await api.put(`/admin/support/resolve/${id}`);
            if (res.data.success) {
                toast.success(`Success: Ticket ${ticketId} marked as RESOLVED.`);
                setTickets(tickets.filter(t => t._id !== id));
            }
        } catch (err) {
            toast.error("Handshake Failed: Could not update ticket status.");
        }
    };

    return (
        <div style={containerS}>
            <div style={headerFlex}>
                <div>
                    <h2 style={titleS}>🚨 Critical Support Queue</h2>
                    <p style={subS}>Immediate attention required for high-priority merchant grievances.</p>
                </div>
                <div style={countBadge}>PENDING: {tickets.length}</div>
            </div>

            {loading ? (
                <div style={loadingBox}>Scanning for Emergency Tickets...</div>
            ) : (
                <div style={gridS}>
                    {tickets.length === 0 ? (
                        <div style={emptyS}>
                            <div style={{fontSize:'50px'}}>✅</div>
                            <h3>Clean Slate</h3>
                            <p>No urgent merchant tickets detected in this district node.</p>
                        </div>
                    ) : (
                        tickets.map((ticket) => (
                            <div key={ticket._id} style={tCard}>
                                <div style={tHeader}>
                                    <span style={tId}>{ticket.ticketId}</span>
                                    <span style={categoryS}>{ticket.category}</span>
                                </div>
                                <div style={tBody}>
                                    <h4 style={mName}>{ticket.merchantName}</h4>
                                    <p style={issueTxt}>"{ticket.issue}"</p>
                                    <div style={timeRow}>
                                        <span className="pulse-dot"></span>
                                        <small>Received: {ticket.time}</small>
                                    </div>
                                </div>
                                <div style={tFooter}>
                                    <button style={chatBtn}>Communicate</button>
                                    <button 
                                        style={resolveBtn(themeColor)}
                                        onClick={() => resolveTicket(ticket._id, ticket.ticketId)}
                                    >
                                        Mark as Resolved
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <style>{`
                .pulse-dot { width: 6px; height: 6px; background: #ef4444; border-radius: 50%; display: inline-block; margin-right: 8px; animation: pulse-red 1.5s infinite; }
                @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
            `}</style>
        </div>
    );
};

// --- Professional UI Style Definitions ---

const containerS = { animation: 'fadeIn 0.5s ease' };
const headerFlex = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', flexWrap: 'wrap', gap: '15px' };
const titleS = { margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a' };
const subS = { margin: '5px 0 0', color: '#64748b', fontSize: '14px' };
const countBadge = { background: '#fff1f2', color: '#e11d48', padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: '900', border: '1px solid #ffe4e6' };

const gridS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' };

const tCard = { background: '#fff', borderRadius: '24px', padding: '25px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(225, 29, 72, 0.05)', display: 'flex', flexDirection: 'column', transition: '0.3s' };
const tHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const tId = { fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px' };
const categoryS = { background: '#f8fafc', color: '#475569', fontSize: '10px', fontWeight: '900', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' };

const tBody = { flex: 1, marginBottom: '20px' };
const mName = { margin: '0 0 10px 0', fontSize: '17px', fontWeight: '800', color: '#1e293b' };
const issueTxt = { fontSize: '14px', color: '#475569', lineHeight: '1.6', fontStyle: 'italic', background: '#f8fafc', padding: '15px', borderRadius: '15px' };
const timeRow = { display: 'flex', alignItems: 'center', marginTop: '15px', color: '#94a3b8', fontWeight: '700' };

const tFooter = { display: 'flex', gap: '10px', borderTop: '1px solid #f8fafc', paddingTop: '20px' };
const chatBtn = { flex: 1, background: '#f1f5f9', border: 'none', padding: '12px', borderRadius: '12px', color: '#475569', fontWeight: '800', cursor: 'pointer', fontSize: '13px' };
const resolveBtn = (color) => ({ flex: 2, background: color, color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '13px', boxShadow: `0 8px 15px ${color}33` });

const loadingBox = { textAlign: 'center', padding: '100px', color: '#94a3b8', fontWeight: '800' };
const emptyS = { gridColumn: '1/-1', textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '30px', border: '1px solid #f1f5f9' };

export default UrgentTickets;