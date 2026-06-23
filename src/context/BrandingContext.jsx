// src/context/BrandingContext.jsx

import React, { createContext, useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import api from '../services/api';

const BrandingContext = createContext();

const defaultBrandingSettings = {
    siteName: 'RKD MART',
    logoUrl: '',
    siteLogo: '',
    siteFavicon: '',
    faviconUrl: '',
    themeColor: '#0f172a',
    headerTextColor: '#ffffff',
    loading: true,
    referralEnabled: true,
    emailVerificationEnabled: true,
    mobileVerificationEnabled: true
};

const getSafeBrandingCache = () => {
    try {
        const cached = localStorage.getItem('rkd_branding_registry');
        if (!cached) return { ...defaultBrandingSettings };
        const parsed = JSON.parse(cached);
        if (!parsed || typeof parsed !== 'object') return { ...defaultBrandingSettings };
        return { ...defaultBrandingSettings, ...parsed, loading: false };
    } catch (error) {
        return { ...defaultBrandingSettings };
    }
};

/**
 * RKD_MART - Strategic Branding & UI Sync Provider
 * Manages global identity, aesthetics, and real-time white-labeling.
 */
export const BrandingProvider = ({ children }) => {
    const [settings, setSettings] = useState(getSafeBrandingCache);
    const [lastThemeChange, setLastThemeChange] = useState(0);

    // 🛡️ [OPTIMIZATION REFS]: रिक्वेस्ट फ्लडिंग रोकने के लिए
    const isFetchingRef = useRef(false);
    const lastSyncRef = useRef(0);

    // 1. 🛡️ Visual Infrastructure Controller (CSS Variables Sync)
    const updateEcosystemAesthetics = useCallback((bgColor, textColor) => {
        const root = document.documentElement;
        if (bgColor) {
            root.style.setProperty('--primary-theme', bgColor);
            root.style.setProperty('--primary-theme-soft', `${bgColor}20`);

            let themeMeta = document.querySelector('meta[name="theme-color"]');
            if (!themeMeta) {
                themeMeta = document.createElement('meta');
                themeMeta.name = "theme-color";
                document.getElementsByTagName('head')[0].appendChild(themeMeta);
            }
            themeMeta.content = bgColor;
        }

        if (textColor) {
            root.style.setProperty('--header-text-color', textColor);
        }
    }, []);

    // 2. 📡 Remote Registry Handshake (Fetch with Throttling)
    const fetchBranding = useCallback(async (force = false) => {
        // 🛑 [LOCK]: अगर पहले से रिक्वेस्ट चल रही है, तो दूसरी न भेजें
        if (isFetchingRef.current) return;

        // ⏱️ [THROTTLE]: अगर पिछला सिंक 1 मिनट से कम समय पहले हुआ है, तो नेटवर्क रिक्वेस्ट न करें
        const now = Date.now();
        if (!force && now - lastSyncRef.current < 60000 && settings.siteName !== 'RKD MART') {
            return;
        }

        // सुरक्षा: एडमिन द्वारा हाल ही में किए गए बदलावों को ओवरराइट न करें
        if ((now - lastThemeChange) < 10000) return;
        
        try {
            isFetchingRef.current = true;
            const res = await api.get('/customer/settings');
            
            if (res.data.success) {
                const data = res.data.data;
                const updatedConfig = { 
                    ...data, 
                    loading: false,
                    logoUrl: data.siteLogo || data.logoUrl || '',
                    faviconUrl: data.siteFavicon || data.faviconUrl || '',
                    themeColor: data.themeColor || '#0f172a',
                    headerTextColor: data.headerTextColor || '#ffffff'
                };

                setSettings(updatedConfig);
                localStorage.setItem('rkd_branding_registry', JSON.stringify(updatedConfig));
                lastSyncRef.current = Date.now();

                // UI एस्थेटिक्स सिंक करें
                if (data.siteName) document.title = data.siteName;
                updateEcosystemAesthetics(updatedConfig.themeColor, updatedConfig.headerTextColor);

                // Favicon सिंक
                if (updatedConfig.faviconUrl) {
                    let link = document.querySelector("link[rel~='icon']");
                    if (!link) {
                        link = document.createElement('link');
                        link.rel = 'icon';
                        document.head.appendChild(link);
                    }
                    link.href = updatedConfig.faviconUrl;
                }
            }
        } catch (err) {
            console.error("Infrastructure Handshake Failed: Setting fallbacks.");
            setSettings(prev => ({ ...prev, loading: false }));
        } finally {
            isFetchingRef.current = false;
        }
    }, [lastThemeChange, updateEcosystemAesthetics, settings.siteName]);

    // 3. ⚡ Listeners: Focus, Storage, and Lifecycle
    useEffect(() => {
        fetchBranding();

        const handleStorageSync = (e) => {
            if (e.key === 'rkd_branding_registry' && e.newValue) {
                const newSettings = getSafeBrandingCache();
                setSettings(newSettings);
                updateEcosystemAesthetics(newSettings.themeColor, newSettings.headerTextColor);
            }
        };

        // टैब फोकस होने पर डेटा पुराना होने पर ही सिंक करें
        const handleFocus = () => fetchBranding();

        window.addEventListener('focus', handleFocus);
        window.addEventListener('storage', handleStorageSync);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('storage', handleStorageSync);
        };
    }, [fetchBranding, updateEcosystemAesthetics]);

    // 4. 🎯 Tactical Protocol: Live Identity Preview (For Admin Panel)
    const updateSettingsImmediate = useCallback((newChanges) => {
        setLastThemeChange(Date.now());
        
        setSettings(prev => {
            const merged = { ...prev, ...newChanges, loading: false };
            if (newChanges.siteLogo) merged.logoUrl = newChanges.siteLogo;
            if (newChanges.siteFavicon) merged.faviconUrl = newChanges.siteFavicon;

            updateEcosystemAesthetics(merged.themeColor, merged.headerTextColor);
            if (merged.siteName) document.title = merged.siteName;

            localStorage.setItem('rkd_branding_registry', JSON.stringify(merged));
            return merged;
        });
    }, [updateEcosystemAesthetics]);

    const contextValue = useMemo(() => ({
        settings,
        refreshBranding: () => fetchBranding(true), // Force refresh helper
        updateSettingsImmediate
    }), [settings, fetchBranding, updateSettingsImmediate]);

    return (
        <BrandingContext.Provider value={contextValue}>
            <div 
                className="rkd-branding-shell"
                style={{ 
                    '--primary-theme': settings.themeColor, 
                    '--header-text-color': settings.headerTextColor,
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {children}
            </div>
        </BrandingContext.Provider>
    );
};

export const useBranding = () => {
    const context = useContext(BrandingContext);
    if (!context) {
        throw new Error("useBranding must be used within a BrandingProvider");
    }
    return context;
};