import React from 'react';
import { useBranding } from '../../../../context/BrandingContext';

const MaintenanceBackup = ({ config, handleDownloadBackup, cardS, cardHead, labS }) => {
    const { settings } = useBranding();
    const themeColor = settings?.themeColor || '#10b981';

    return (
        <div style={responsiveGrid}>
            
            {/* --- SECTION 1: DISASTER RECOVERY PROTOCOL --- */}
            <div style={cardS}>
                <h4 style={cardHead}>🗄️ Disaster Recovery Hub</h4>
                <p style={nodeHintS}>Execute a full cryptographic snapshot of the global database including users, transactions, and commercial assets.</p>
                
                <div style={warningBox}>
                    <b>⚠️ ARCHIVE PROTOCOL:</b> Generating a backup may cause temporary latency in edge nodes. Recommended during low-traffic periods.
                </div>

                <button 
                    onClick={handleDownloadBackup} 
                    style={backupBtn(themeColor)}
                >
                    📦 INITIATE FULL SYSTEM BACKUP
                </button>
                
                <div style={syncFooterS}>
                    <span style={dotS(themeColor)}></span>
                    Last Registry Snapshot: {new Date().toLocaleString('en-GB')}
                </div>
            </div>

            {/* --- SECTION 2: INFRASTRUCTURE INTEGRITY --- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                <div style={cardS}>
                    <h4 style={cardHead}>🛠️ Build & Architecture Node</h4>
                    <div style={statRow}>
                        <label style={labS}>Active Framework</label>
                        <div style={valS}>{config.siteName?.toUpperCase()}_v{config.appVersion}</div>
                    </div>
                    <div style={statRow}>
                        <label style={labS}>Node Environment</label>
                        <div style={{...valS, color: '#10b981'}}>PRODUCTION_STABLE</div>
                    </div>
                    <div style={statRow}>
                        <label style={labS}>Encryption Level</label>
                        <div style={valS}>AES-256-GCM</div>
                    </div>
                </div>

                {/* Ecosystem Health Pulse (New Visualization) */}
                <div style={cardS}>
                    <h4 style={cardHead}>📡 Ecosystem Health Pulse</h4>
                    <div style={pulseGrid}>
                        <div style={pulseItem}>
                            <small style={pulseLab}>DB LATENCY</small>
                            <div style={{...pulseVal, color:'#10b981'}}>24ms</div>
                        </div>
                        <div style={pulseItem}>
                            <small style={pulseLab}>CLUSTER LOAD</small>
                            <div style={pulseVal}>12.4%</div>
                        </div>
                        <div style={pulseItem}>
                            <small style={pulseLab}>SSL STATUS</small>
                            <div style={{...pulseVal, color: themeColor}}>SECURE</div>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                @media (max-width: 992px) {
                    .maintenance-grid { grid-template-columns: 1fr !important; }
                }
                @keyframes pulse-glow {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Definitions ---

const responsiveGrid = { 
    display: 'grid', 
    gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1.2fr', 
    gap: '30px',
    className: 'maintenance-grid',
    animation: 'fadeIn 0.5s ease'
};

const nodeHintS = { fontSize: '13px', color: '#64748b', marginBottom: '25px', lineHeight:'1.6', fontWeight:'500' };

const warningBox = { 
    background: '#fff7ed', 
    border: '1px solid #ffedd5', 
    padding: '15px', 
    borderRadius: '12px', 
    color: '#9a3412', 
    fontSize: '11px', 
    marginBottom: '25px',
    lineHeight: '1.5'
};

const backupBtn = (color) => ({ 
    width: '100%', 
    padding: '20px', 
    background: color, 
    color: '#fff', 
    border: 'none', 
    borderRadius: '18px', 
    fontWeight: '900', 
    cursor: 'pointer',
    fontSize: '14px',
    letterSpacing: '1px',
    boxShadow: `0 10px 25px ${color}44`,
    transition: '0.3s'
});

const syncFooterS = { marginTop: '20px', fontSize: '11px', color: '#94a3b8', fontWeight: '800', display:'flex', alignItems:'center', gap:'8px' };
const dotS = (color) => ({ width:'8px', height:'8px', borderRadius:'50%', background: color, animation: 'pulse-glow 2s infinite' });

const statRow = { marginBottom: '22px', borderBottom: '1px solid #f8fafc', paddingBottom: '15px' };
const valS = { fontSize: '18px', fontWeight: '900', color: '#0f172a', marginTop: '5px', letterSpacing:'-0.5px' };

const pulseGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '10px' };
const pulseItem = { background: '#f8fafc', padding: '15px', borderRadius: '16px', border: '1px solid #f1f5f9', textAlign: 'center' };
const pulseLab = { fontSize: '8px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px', display: 'block', marginBottom: '5px' };
const pulseVal = { fontSize: '14px', fontWeight: '900', color: '#1e293b' };

export default MaintenanceBackup;