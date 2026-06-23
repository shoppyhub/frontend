import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { useBranding } from '../../../context/BrandingContext';
import { toast } from 'react-toastify';

/**
 * RKD MART - REGIONAL PERFORMANCE ANALYSIS
 */
const DistrictPerformance = ({ stateName }) => {
    const { settings } = useBranding();
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true);

    const themeColor = settings?.themeColor || '#0f172a';

    const fetchRegionalPerformance = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/stats/global'); 
            if (res.data.success) {
                // यहाँ बैकएंड से आने वाले जिलों के डेटा को मैप किया गया है
                setDistricts(res.data.data?.districtMetrics || []);
            }
        } catch (err) {
            toast.error("Performance analytics unreachable.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRegionalPerformance();
    }, [fetchRegionalPerformance]);

    if (loading) return <div style={loaderArea}>📡 ANALYZING REGIONAL DATA...</div>;

    return (
        <div style={containerS}>
            <div style={header}>
                <h2 style={titleS}>📊 Regional Performance Benchmarks</h2>
                <p style={subS}>Comparative analysis for <b>{stateName}</b> districts.</p>
            </div>

            <div style={gridS}>
                {districts.length === 0 ? (
                    <div style={{padding: '40px', color: '#94a3b8'}}>No performance data available for current jurisdiction.</div>
                ) : (
                    districts.map((d, index) => (
                        <div key={index} style={cardS}>
                            <div style={cardHeader}>
                                <b style={{fontSize: '18px'}}>{d.name || d.district}</b>
                                <span style={rankBadge(d.efficiency || 0)}>{d.efficiency >= 85 ? 'TOP' : 'AUDIT'}</span>
                            </div>
                            <div style={metricsRow}>
                                <div style={mItem}>
                                    <small style={mLab}>REVENUE</small>
                                    <div style={mVal}>₹{(d.revenue || 0).toLocaleString()}</div>
                                </div>
                                <div style={mItem}>
                                    <small style={mLab}>SHOPS</small>
                                    <div style={mVal}>{d.shops || 0}</div>
                                </div>
                            </div>
                            <button style={inspectBtn(themeColor)}>INSPECT DISTRICT</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const loaderArea = { padding: '100px', textAlign: 'center', color: '#94a3b8', fontWeight: '800' };
const containerS = { padding: '10px' };
const header = { marginBottom: '30px' };
const titleS = { margin: 0, fontSize: '26px', fontWeight: '900', color: '#0f172a' };
const subS = { margin: '5px 0 0', color: '#64748b' };
const gridS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' };
const cardS = { background: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' };
const rankBadge = (eff) => ({ padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', background: eff >= 85 ? '#ecfdf5' : '#fff1f2', color: eff >= 85 ? '#059669' : '#e11d48' });
const metricsRow = { display: 'flex', gap: '15px', marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '15px' };
const mItem = { flex: 1 };
const mLab = { fontSize: '9px', color: '#94a3b8', fontWeight: '800' };
const mVal = { fontSize: '16px', fontWeight: '800', color: '#1e293b' };
const inspectBtn = (c) => ({ width: '100%', padding: '12px', background: 'none', border: `1px solid ${c}`, color: c, borderRadius: '10px', fontWeight: '800', cursor: 'pointer' });

export default DistrictPerformance;