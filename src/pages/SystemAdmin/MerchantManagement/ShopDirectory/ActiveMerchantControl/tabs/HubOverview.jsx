import React from 'react';

const HubOverview = ({ merchant, theme }) => {
    
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

    return (
        <div style={containerS}>
            
            {/* --- TOP QUICK STATS ROW --- */}
            <div style={statsRowS}>
                <QuickStat icon="💰" label="Wallet Liquidity" val={`₹${merchant?.wallet?.balance?.toLocaleString() || 0}`} col="#10b981" />
                <QuickStat icon="📦" label="Total Traffic" val={`${merchant?.orderCount || 0} Orders`} col="#3b82f6" />
                <QuickStat icon="🛡️" label="KYC Status" val={merchant?.kycStatus || 'Pending'} col="#8b5cf6" />
                <QuickStat icon="📅" label="Member Since" val={formatDate(merchant?.createdAt)} col="#f59e0b" />
            </div>

            <div style={mainGridS}>
                {/* --- LEFT: PROPRIETOR IDENTITY --- */}
                <div style={leftColS}>
                    <div style={profileCardS}>
                        <div style={photoWrapperS}>
                            <img src={merchant?.photo || merchant?.ownerPhoto || 'https://via.placeholder.com/150'} style={ownerImgS} alt="Proprietor" />
                            <div style={statusDotS(merchant?.isActive)}></div>
                        </div>
                        {/* ✅ FIXED: identityInfoS defined below */}
                        <div style={identityInfoS}>
                            <h2 style={ownerNameS}>{merchant?.fullName || 'N/A'}</h2>
                            <span style={idBadgeS(theme)}>{merchant?.generatedId || 'PENDING_ID'}</span>
                            <div style={dividerS}></div>
                            <div style={quickContactS}>
                                <span>📱 {merchant?.mobile || 'N/A'}</span>
                                <span>📧 {merchant?.email || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div style={complianceBoxS}>
                        <h4 style={miniHeadS}>Compliance Snapshot</h4>
                        <div style={compRowS}>
                            <span>Aadhar Verification</span>
                            <b style={{color:'#10b981'}}>{merchant?.aadharNumber ? 'VERIFIED ✓' : 'MISSING'}</b>
                        </div>
                        <div style={compRowS}>
                            <span>PAN Tax Audit</span>
                            <b style={{color:'#10b981'}}>{merchant?.panNumber ? 'VERIFIED ✓' : 'MISSING'}</b>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: BUSINESS & GEOGRAPHIC HUB --- */}
                <div style={rightColS}>
                    
                    {/* Business Identity */}
                    <div style={dataCardS}>
                        <h3 style={secTitleS(theme)}>🏪 BUSINESS IDENTITY</h3>
                        <div style={infoGridS}>
                            <InfoNode icon="🏢" label="Trading Name" val={merchant?.shopName} />
                            <InfoNode icon="🎭" label="Business Type" val={merchant?.shopType} />
                            <InfoNode icon="🧾" label="GSTIN Identity" val={merchant?.gstNumber || 'UNREGISTERED'} />
                            <InfoNode icon="✉️" label="Official Email" val={merchant?.email} />
                        </div>
                    </div>

                    {/* Geographic Matrix */}
                    <div style={dataCardS}>
                        <h3 style={secTitleS('#e67e22')}>📍 GEOGRAPHIC MATRIX</h3>
                        <div style={infoGridS}>
                            <InfoNode icon="🏛️" label="Operational State" val={merchant?.shopState} />
                            <InfoNode icon="🏘️" label="Target District" val={merchant?.shopDistrict} />
                            <InfoNode icon="🚩" label="Block / Zone" val={merchant?.shopBlock || 'N/A'} />
                            <InfoNode icon="📮" label="Hub Pincode" val={merchant?.shopPin} />
                            <div style={{gridColumn:'1/-1', marginTop:'10px'}}>
                                <InfoNode icon="🏠" label="Full Physical Deployment Address" val={merchant?.shopFullAddress} />
                            </div>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div style={metaCardS}>
                        <div style={{display:'flex', gap:'20px'}}>
                            <div><small style={metaLabS}>REGISTRATION IP</small><div style={metaValS}>{merchant?.registeredIp || '192.168.1.1'}</div></div>
                            <div><small style={metaLabS}>SYSTEM VERSION</small><div style={metaValS}>V3.5.0-STABLE</div></div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// --- Atomic Professional Components ---

const QuickStat = ({ icon, label, val, col }) => (
    <div style={statBoxS}>
        <div style={statIconS(col)}>{icon}</div>
        <div>
            <div style={statValS}>{val}</div>
            <div style={statLabS}>{label}</div>
        </div>
    </div>
);

const InfoNode = ({ icon, label, val }) => (
    <div style={infoNodeS}>
        <div style={nodeIconS}>{icon}</div>
        <div>
            <small style={nodeLabS}>{label}</small>
            <div style={nodeValS}>{val || '---'}</div>
        </div>
    </div>
);

// --- Strategic Styles (SaaS Ultra Pro) ---

const containerS = { animation: 'fadeIn 0.5s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" };

const statsRowS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' };
const statBoxS = { background: '#fff', padding: '20px', borderRadius: '22px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' };
const statIconS = (c) => ({ width: '45px', height: '45px', borderRadius: '14px', background: `${c}10`, color: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' });
const statValS = { fontSize: '16px', fontWeight: '900', color: '#0f172a' };
const statLabS = { fontSize: '9px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' };

const mainGridS = { display: 'grid', gridTemplateColumns: window.innerWidth < 1100 ? '1fr' : '350px 1fr', gap: '30px' };

const leftColS = { display: 'flex', flexDirection: 'column', gap: '25px' };
const profileCardS = { background: '#fff', padding: '40px 30px', borderRadius: '35px', border: '1px solid #f1f5f9', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' };
const photoWrapperS = { position: 'relative', width: '160px', height: '160px', margin: '0 auto 25px' };
const ownerImgS = { width: '100%', height: '100%', borderRadius: '50px', objectFit: 'cover', border: '5px solid #fff', boxShadow: '0 15px 35px rgba(0,0,0,0.1)' };
const statusDotS = (active) => ({ position: 'absolute', bottom: '10px', right: '10px', width: '22px', height: '22px', background: active ? '#10b981' : '#ef4444', border: '4px solid #fff', borderRadius: '50%' });

// ✅ ADDED: identityInfoS definition
const identityInfoS = { display: 'flex', flexDirection: 'column', alignItems: 'center' };

const ownerNameS = { fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '0 0 10px 0', letterSpacing: '-0.5px' };
const idBadgeS = (c) => ({ background: c, color: '#fff', padding: '5px 15px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', letterSpacing: '1px' });
const dividerS = { height: '1px', background: '#f1f5f9', margin: '25px 0', width: '100%' };
const quickContactS = { display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', fontWeight: '700', color: '#475569' };

const complianceBoxS = { background: '#0f172a', padding: '25px', borderRadius: '25px', color: '#fff' };
const miniHeadS = { margin: '0 0 15px 0', fontSize: '10px', fontWeight: '900', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' };
const compRowS = { display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' };

const rightColS = { display: 'flex', flexDirection: 'column', gap: '25px' };
const dataCardS = { background: '#fff', padding: '30px', borderRadius: '30px', border: '1px solid #f1f5f9', boxShadow: '0 5px 20px rgba(0,0,0,0.02)' };
const secTitleS = (c) => ({ fontSize: '12px', fontWeight: '900', color: c, letterSpacing: '1.5px', marginBottom: '25px', borderLeft: `4px solid ${c}`, paddingLeft: '15px' });
const infoGridS = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' };

const infoNodeS = { display: 'flex', gap: '15px', alignItems: 'center' };
const nodeIconS = { width: '35px', height: '35px', background: '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' };
const nodeLabS = { fontSize: '9px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' };
const nodeValS = { fontSize: '14px', fontWeight: '700', color: '#1e293b', marginTop: '2px' };

const metaCardS = { background: '#f8fafc', padding: '20px 30px', borderRadius: '20px', border: '1px solid #e2e8f0' };
const metaLabS = { fontSize: '8px', fontWeight: '900', color: '#94a3b8' };
const metaValS = { fontSize: '11px', fontWeight: '800', color: '#64748b', fontFamily: 'monospace' };

export default HubOverview;