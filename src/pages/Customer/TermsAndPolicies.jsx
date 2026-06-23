import React, { useState, useEffect, useCallback } from 'react';
import HomeHeader from '../../components/Customer/HomeHeader';
import MobileBottomNav from '../../components/Customer/MobileBottomNav';
import api from '../../services/api';
import { useBranding } from '../../context/BrandingContext';

const TermsAndPolicies = () => {
    const { settings } = useBranding();
    const [cms, setCms] = useState({ 
        termsCondition: '', 
        privacyPolicy: '', 
        returnPolicy: '',
        termsConditionHindi: '', // मान लीजिए बैकएंड में हिन्दी का अलग फील्ड है
        privacyPolicyHindi: '',
        returnPolicyHindi: ''
    });
    const [loading, setLoading] = useState(true);

    // 1. 📡 Automatic Background Sync (No Buttons)
    const fetchPolicies = useCallback(async () => {
        try {
            const res = await api.get('/customer/settings');
            if (res.data.success) {
                // यहाँ cms डेटा सेट कर रहे हैं। 
                // नोट: यदि बैकएंड में हिन्दी के लिए अलग फील्ड नहीं है, तो एडमिन एक ही बॉक्स में दोनों भाषाएँ लिख सकता है।
                setCms(res.data.data.cms || {});
                document.title = `Policies | ${res.data.data.siteName}`;
            }
        } catch (err) {
            console.error("Infrastructure Sync Error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPolicies();
        // Auto-refresh when user focuses back
        window.addEventListener('focus', fetchPolicies);
        return () => window.removeEventListener('focus', fetchPolicies);
    }, [fetchPolicies]);

    if (loading) return (
        <div style={loaderS}>
            <div className="policy-spinner" style={{borderTopColor: settings.themeColor}}></div>
            <p>Syncing Legal Framework...</p>
        </div>
    );

    return (
        <div style={pageWrapperS}>
            <HomeHeader />
            
            <div style={containerS}>
                <div style={headerBoxS}>
                    <h1 style={mainTitleS}>Legal & Policies</h1>
                    <p style={subTitleS}>
                        Registry managed by {settings.siteName} Hub • 
                        Last Synced: {new Date().toLocaleDateString()}
                    </p>
                </div>

                {/* Terms & Conditions Section */}
                <PolicySection title="Terms & Conditions" content={cms.termsCondition} themeColor={settings.themeColor} />
                <PolicySection title="Privacy Policy" content={cms.privacyPolicy} themeColor={settings.themeColor} />
                <PolicySection title="Return & Refund Policy" content={cms.returnPolicy} themeColor={settings.themeColor} />
                
                <div style={footerNoteS}>
                    By accessing this platform, you agree to follow the above-mentioned policies.
                </div>
            </div>

            <MobileBottomNav />
            
            <style>{`
                .policy-spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom:15px; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

const PolicySection = ({ title, content, themeColor }) => (
    <div style={sectionCardS}>
        <div style={titleWrapperS(themeColor)}>
            <h3 style={sectionTitleS}>{title}</h3>
        </div>
        <div style={contentS}>
            {content || "The system administrator has not provided this documentation yet."}
        </div>
    </div>
);

// --- Modern Enterprise SaaS Styles ---

const pageWrapperS = { background: '#f8fafc', minHeight: '100vh', paddingBottom: '120px', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const containerS = { width: '92%', maxWidth: '900px', margin: '40px auto', animation: 'fadeIn 0.5s ease' };

const headerBoxS = { marginBottom: '40px', borderLeft: '6px solid #0f172a', paddingLeft: '25px' };
const mainTitleS = { fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-1px' };
const subTitleS = { color: '#94a3b8', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' };

const sectionCardS = { background: '#fff', padding: window.innerWidth < 768 ? '25px' : '40px', borderRadius: '35px', border: '1px solid #f1f5f9', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' };

const titleWrapperS = (color) => ({ marginBottom: '30px', paddingBottom: '15px', borderBottom: `2px solid ${color}15` });
const sectionTitleS = { margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a' };
const sectionTitleHindiS = { margin: '5px 0 0', fontSize: '18px', fontWeight: '800', color: '#64748b' };

const langBadgeS = { display: 'inline-block', background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '900', marginBottom: '15px' };
const langBadgeHindiS = { ...langBadgeS, background: '#eff6ff', color: '#2563eb' };

const contentS = { color: '#334155', lineHeight: '1.8', fontSize: '15px', whiteSpace: 'pre-wrap', marginBottom: '25px' };
const dividerS = { height: '1px', background: '#f1f5f9', margin: '30px 0' };

const footerNoteS = { textAlign: 'center', color: '#cbd5e1', fontSize: '13px', marginTop: '50px', fontWeight: '700', lineHeight: '1.6' };

const loaderS = { display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', fontWeight: '900', color: '#94a3b8', background: '#f8fafc', fontSize: '14px' };

export default TermsAndPolicies;