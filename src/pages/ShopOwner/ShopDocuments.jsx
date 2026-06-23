import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useBranding } from '../../context/BrandingContext'; // Added for White-labeling

const ShopDocuments = () => {
    const { settings } = useBranding();
    const [shop, setShop] = useState(null);
    const [adminAssets, setAdminAssets] = useState({ signature: '', stamp: '' });
    const [cms, setCms] = useState({ terms: '', privacy: '', merchantPolicy: '' });
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ show: false, title: '', content: '' });

    // 1. 📡 Automatic Vault Synchronization (No Buttons)
    const fetchVaultIntel = useCallback(async () => {
        try {
            // Initial sync displays loader, background syncs are silent
            const [profileRes, settingsRes] = await Promise.all([
                api.get('/auth/profile'),
                api.get('/customer/settings') 
            ]);

            if (profileRes.data.success) setShop(profileRes.data.data);
            if (settingsRes.data.success) {
                const data = settingsRes.data.data;
                setAdminAssets({
                    signature: data.signature || '',
                    stamp: data.stamp || ''
                });
                setCms({
                    terms: data.cms?.termsCondition || 'Standard infrastructure protocols active.',
                    privacy: data.cms?.privacyPolicy || 'Data encryption and privacy standards enforced.',
                    merchantPolicy: data.cms?.merchantAgreement || 'Merchant node operational guidelines.'
                });
            }
            document.title = `Compliance Vault | ${settings.siteName}`;
        } catch (err) {
            console.error("Vault Synchronization Error.");
        } finally {
            setLoading(false);
        }
    }, [settings.siteName]);

    useEffect(() => { 
        fetchVaultIntel(); 
        // Auto-refresh when user focuses back on the tab
        window.addEventListener('focus', fetchVaultIntel);
        return () => window.removeEventListener('focus', fetchVaultIntel);
    }, [fetchVaultIntel]);

    const themeColor = settings?.themeColor || '#0f172a';

    // --- 📜 DYNAMIC BUSINESS CERTIFICATE ---
    const printCertificate = () => {
        const win = window.open("", "_blank");
        const sig = adminAssets.signature || "";
        const stp = adminAssets.stamp || "";
        const siteName = settings.siteName || "System Hub";
        const logo = settings.logoUrl || "";

        win.document.write(`
            <html>
            <head><title>Business Certificate - ${shop?.shopDetails?.shopName}</title></head>
            <body style="margin:0; padding:40px; font-family:'serif'; background:#f8fafc; display:flex; justify-content:center;">
                <div style="width:1000px; padding:60px; border:20px double ${themeColor}; background:#fff; position:relative; text-align:center; box-sizing:border-box; box-shadow:0 0 50px rgba(0,0,0,0.1);">
                    <img src="${logo}" style="height:60px; margin-bottom:10px;"/>
                    <h1 style="font-size:52px; margin:0; color:${themeColor};">${siteName.toUpperCase()}</h1>
                    <p style="letter-spacing:10px; font-weight:bold; color:#94a3b8; font-size:14px; margin-top:10px;">OFFICIAL MERCHANT NETWORK</p>
                    <hr style="width:30%; border:1px solid ${themeColor}; margin:30px auto; opacity:0.3;"/>
                    
                    <h2 style="font-size:32px; margin-top:40px; color:#1e293b;">CERTIFICATE OF REGISTRATION</h2>
                    <p style="font-size:20px; color:#64748b; margin:30px 0;">This document formally certifies that the commercial establishment</p>
                    
                    <h1 style="color:${themeColor}; font-size:48px; margin:0; text-transform:uppercase;">${shop?.shopDetails?.shopName}</h1>
                    <div style="margin-top:20px;">
                        <p style="font-size:22px; margin:0;">Principal Proprietor: <b>${shop?.fullName}</b></p>
                        <p style="font-size:16px; color:#64748b; margin-top:10px;">Hub Address: ${shop?.shopDetails?.address?.fullAddress}, ${shop?.shopDetails?.address?.district}</p>
                    </div>
                    
                    <div style="margin-top:80px; display:flex; justify-content:space-between; align-items:flex-end; padding:0 50px;">
                        <div style="text-align:left; color:#475569;">
                            <p style="margin:5px 0;"><b>Merchant Node ID:</b> ${shop?.generatedId}</p>
                            <p style="margin:5px 0;"><b>Deployment Date:</b> ${new Date(shop?.createdAt).toLocaleDateString()}</p>
                            <p style="margin:5px 0;"><b>Status:</b> VERIFIED ACTIVE</p>
                        </div>
                        <div style="text-align:center; position:relative;">
                            ${stp ? `<img src="${stp}" style="position:absolute; width:130px; left:50%; transform:translateX(-50%); bottom:40px; opacity:0.2;"/>` : ""}
                            ${sig ? `<img src="${sig}" style="width:120px; border-bottom:2px solid ${themeColor};"/><br/>` : "____________________"}
                            <p style="font-weight:bold; font-size:13px; margin-top:10px; color:${themeColor};">Authorized Registry Authority</p>
                        </div>
                    </div>
                    <div style="margin-top:50px; font-size:10px; color:#cbd5e1;">© ${siteName} Cloud Infrastructure. This is a cryptographically signed document.</div>
                </div>
                <script>window.onload = () => { setTimeout(()=> { window.print(); window.close(); }, 700); }</script>
            </body>
            </html>
        `);
    };

    // --- 🪪 DYNAMIC MERCHANT IDENTITY CARD ---
    const printID = () => {
        const win = window.open("", "_blank");
        const sig = adminAssets.signature || "";
        const siteName = settings.siteName || "System Hub";
        const logo = settings.logoUrl || "";

        win.document.write(`
            <html>
            <head><title>Merchant ID - ${shop?.fullName}</title></head>
            <body style="display:flex; justify-content:center; align-items:center; height:100vh; background:#f1f5f9; font-family:sans-serif; margin:0;">
                <div style="width:350px; height:550px; background:#fff; border-radius:30px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 20px 40px rgba(0,0,0,0.1); position:relative;">
                    <div style="background:${themeColor}; color:#fff; padding:35px 20px; text-align:center;">
                        <img src="${logo}" style="height:35px; margin-bottom:10px; background:#fff; padding:5px; border-radius:8px;"/>
                        <h3 style="margin:0; letter-spacing:1px; font-size:18px;">${siteName.toUpperCase()}</h3>
                        <small style="opacity:0.8; font-weight:700; letter-spacing:2px;">HUB PROPRIETOR</small>
                    </div>
                    <div style="text-align:center; margin-top:-55px;">
                        <div style="width:130px; height:130px; border-radius:35px; border:6px solid #fff; display:inline-block; overflow:hidden; background:#f8fafc; box-shadow:0 10px 20px rgba(0,0,0,0.1);">
                            <img src="${shop?.photo || 'https://via.placeholder.com/130'}" style="width:100%; height:100%; object-fit:cover;"/>
                        </div>
                    </div>
                    <div style="padding:20px; text-align:center;">
                        <h2 style="margin:0; font-size:24px; color:#0f172a; letter-spacing:-0.5px;">${shop?.fullName}</h2>
                        <div style="margin-top:8px; display:inline-block; background:${themeColor}10; color:${themeColor}; padding:5px 15px; border-radius:10px; font-size:11px; font-weight:900;">VERIFIED MERCHANT</div>
                    </div>
                    <div style="padding:0 30px; margin-top:10px; font-size:12px; color:#475569; line-height:2.2;">
                        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f8fafc;"><span>ID Node:</span><b>${shop?.generatedId}</b></div>
                        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f8fafc;"><span>Sector:</span><b>${shop?.shopDetails?.shopType}</b></div>
                        <div style="display:flex; justify-content:space-between;"><span>Hub Name:</span><b>${shop?.shopDetails?.shopName}</b></div>
                    </div>
                    <div style="position:absolute; bottom:55px; width:100%; text-align:center;">
                         ${sig ? `<img src="${sig}" style="width:80px;"/>` : ""}
                         <p style="font-size:9px; font-weight:900; margin:0; color:#94a3b8;">REGISTRY SIGNATURE</p>
                    </div>
                    <div style="position:absolute; bottom:0; width:100%; background:${themeColor}; color:#fff; text-align:center; padding:12px 0; font-size:10px; font-weight:900; letter-spacing:1px;">
                        AUTHORIZED DIGITAL IDENTITY
                    </div>
                </div>
                <script>window.onload = () => { setTimeout(()=> { window.print(); window.close(); }, 700); }</script>
            </body>
            </html>
        `);
    };

    if (loading) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: themeColor}}></div>
            <p style={{marginTop:'15px'}}>Opening Secure Compliance Vault...</p>
        </div>
    );

    return (
        <div style={container}>
            {/* --- HEADER MODULE --- */}
            <div style={headerRow}>
                <div>
                    <h1 style={titleS}>📜 Business Compliance Vault</h1>
                    <p style={subTitleS}>Manage your official hub credentials and platform legal protocols.</p>
                </div>
            </div>

            {/* --- SECTION 1: OFFICIAL BUSINESS DOCUMENTS --- */}
            <div style={sectionHeader(themeColor)}>Authorized Credentials</div>
            <div style={docsGrid}>
                <DocCard 
                    icon="🎖️" 
                    title="Registration Certificate" 
                    desc="Authorized commercial license issued by central administration."
                    type="Registry Document"
                    onAction={printCertificate}
                    btnLabel="Generate & Print"
                    themeColor={themeColor}
                />
                <DocCard 
                    icon="🪪" 
                    title="Merchant Identity Card" 
                    desc="Official visual node identity for hyperlocal verification."
                    type="Personnel Node"
                    onAction={printID}
                    btnLabel="Generate ID"
                    themeColor={themeColor}
                />
            </div>

            {/* --- SECTION 2: PLATFORM POLICIES --- */}
            <div style={{...sectionHeader(themeColor), marginTop:'50px'}}>Policy Repository</div>
            <div style={docsGrid}>
                <DocCard 
                    icon="⚖️" 
                    title="Service Agreement" 
                    desc="Governance protocols for hub operations within the ecosystem."
                    type="Merchant Policy"
                    onAction={() => setModal({ show: true, title: 'Merchant Service Agreement', content: cms.merchantPolicy })}
                    btnLabel="Review Policy"
                    themeColor={themeColor}
                />
                <DocCard 
                    icon="🛡️" 
                    title="Privacy & Logistics" 
                    desc="Data encryption standards and asset return guidelines."
                    type="Data Compliance"
                    onAction={() => setModal({ show: true, title: 'Privacy & Logistics Policy', content: cms.privacy })}
                    btnLabel="Review Policy"
                    themeColor={themeColor}
                />
                <DocCard 
                    icon="📜" 
                    title="Ecosystem Terms" 
                    desc="General platform terms governing this commercial node."
                    type="Standard Terms"
                    onAction={() => setModal({ show: true, title: 'Platform Terms of Use', content: cms.terms })}
                    btnLabel="Review Terms"
                    themeColor={themeColor}
                />
            </div>

            {/* --- POLICY MODAL MODULE --- */}
            {modal.show && (
                <div style={modalOverlay} onClick={() => setModal({ show: false, title: '', content: '' })}>
                    <div style={modalContent} onClick={e => e.stopPropagation()}>
                        <div style={modalHeader(themeColor)}>
                            <h3 style={{margin:0, color:'#fff'}}>{modal.title}</h3>
                            <button onClick={() => setModal({ show: false, title: '', content: '' })} style={modalClose}>✕</button>
                        </div>
                        <div style={modalBody}>
                            {modal.content}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

// --- Atomic Component ---
const DocCard = ({ icon, title, desc, type, onAction, btnLabel, themeColor }) => (
    <div style={docCardS}>
        <div style={iconBoxS(themeColor)}>{icon}</div>
        <div style={{flex:1}}>
            <small style={typeTagS(themeColor)}>{type}</small>
            <h4 style={docTitleS}>{title}</h4>
            <p style={docDescS}>{desc}</p>
        </div>
        <button onClick={onAction} style={actionBtnS(themeColor)}>{btnLabel}</button>
    </div>
);

// --- Enterprise SaaS Design Definitions ---

const container = { padding: '10px', animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const headerRow = { marginBottom: '45px', borderBottom: '1px solid #f1f5f9', paddingBottom: '35px' };
const titleS = { margin: 0, fontWeight: '900', color: '#0f172a', fontSize: '28px', letterSpacing: '-1.5px' };
const subTitleS = { color: '#64748b', fontSize: '15px', marginTop: '8px', fontWeight:'500' };

const sectionHeader = (color) => ({ fontSize:'12px', fontWeight:'900', color: color, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'25px', display:'flex', alignItems:'center', gap:'12px', borderLeft:`4px solid ${color}`, paddingLeft:'15px' });

const docsGrid = { display:'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))', gap:'25px' };

const docCardS = { background:'#fff', padding:'30px', borderRadius:'40px', border:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:'25px', boxShadow:'0 10px 30px rgba(0,0,0,0.02)', transition:'0.3s' };
const iconBoxS = (color) => ({ width:'65px', height:'65px', background:`${color}08`, borderRadius:'22px', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'32px', border:`1px solid ${color}15` });

const typeTagS = (color) => ({ fontSize:'9px', fontWeight:'900', color: color, textTransform:'uppercase', letterSpacing:'0.5px' });
const docTitleS = { margin:'6px 0 8px 0', color:'#1e293b', fontSize:'18px', fontWeight:'800', letterSpacing:'-0.5px' };
const docDescS = { fontSize:'13px', color:'#94a3b8', margin:0, lineHeight:'1.6', fontWeight:'500' };

const actionBtnS = (color) => ({ background: color, color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', fontSize: '11px', boxShadow: `0 8px 15px ${color}33`, transition:'0.3s' });

// Modal System Styles
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(8px)' };
const modalContent = { width: '90%', maxWidth: '800px', maxHeight: '80vh', background: '#fff', borderRadius: '40px', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s ease' };
const modalHeader = (color) => ({ padding: '25px 40px', background: color, display: 'flex', justifyContent: 'space-between', alignItems: 'center' });
const modalClose = { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' };
const modalBody = { padding: '40px', overflowY: 'auto', fontSize: '15px', lineHeight: '1.8', color: '#475569', whiteSpace: 'pre-wrap' };

const loaderS = { display:'flex', flexDirection:'column', height: '60vh', justifyContent: 'center', alignItems: 'center', fontWeight: '900', color: '#94a3b8', fontSize: '14px', gap:'15px' };

export default ShopDocuments;