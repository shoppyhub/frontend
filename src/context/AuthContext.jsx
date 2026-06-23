// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // 🛡️ [OPTIMIZATION]: ये Refs रिक्वेस्ट फ्लडिंग को रोकते हैं
    const isFetchingRef = useRef(false);
    const lastFetchTimeRef = useRef(0);

    /**
     * 🛠️ Helper: User Data Normalizer
     * डेटा को सभी लेयर्स के लिए एक समान (Uniform) बनाना।
     */
    const normalizeUserData = useCallback((rawData) => {
        if (!rawData) return null;
        return {
            ...rawData,
            photo: rawData.photo || rawData.adminPhoto || rawData.ownerPhoto || rawData.profilePicture || '',
            assignedDistrict: rawData.assignedDistrict || 
                              rawData.shopDistrict || 
                              rawData.shopDetails?.address?.district ||
                              rawData.pDistrict || 
                              rawData.officeDistrict || 
                              'N/A',
            assignedState: rawData.assignedState || 
                           rawData.shopState || 
                           rawData.shopDetails?.address?.state ||
                           rawData.pState || 
                           'N/A',
            roleLabel: rawData.role ? rawData.role.replace(/([A-Z])/g, ' $1').trim() : ''
        };
    }, []);

    /**
     * 🔄 Optimized Identity Synchronization
     * इसे इस तरह सुधारा गया है कि यह सर्वर को ओवरलोड न करे।
     */
    const refreshUser = useCallback(async (force = false) => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        // 🛑 [LOCK]: अगर पहले से रिक्वेस्ट चल रही है, तो दूसरी शुरू न करें
        if (isFetchingRef.current) return;

        // ⏱️ [THROTTLE]: अगर पिछला फेच 10 सेकंड पहले ही हुआ है, तो दोबारा न करें (जब तक force न हो)
        const now = Date.now();
        if (!force && now - lastFetchTimeRef.current < 10000) {
            setLoading(false);
            return;
        }

        try {
            isFetchingRef.current = true;
            const res = await api.get('/auth/profile');
            
            if (res.data.success) {
                const normalized = normalizeUserData(res.data.data);
                setUser(normalized);
                lastFetchTimeRef.current = Date.now(); // टाइमस्टैम्प अपडेट करें
            } else {
                handleSessionExpiry();
            }
        } catch (err) {
            console.error("🔒 Security Handshake Error.");
            if (err.response?.status === 401) {
                handleSessionExpiry();
            }
        } finally {
            isFetchingRef.current = false;
            setLoading(false);
        }
    }, [normalizeUserData]);

    // सत्र समाप्ति हैंडलर
    const handleSessionExpiry = () => {
        localStorage.clear();
        setUser(null);
        setLoading(false);
        if (window.location.pathname !== '/login') {
            window.location.href = '/login?status=session_expired';
        }
    };

    // ⚡ स्मार्ट सिंक्रोनाइज़ेशन (Smart Listeners)
    useEffect(() => {
        // पहली बार लोड होने पर
        refreshUser();

        const handleStorageChange = (e) => {
            if (e.key === 'token') {
                if (!e.newValue) handleSessionExpiry();
                else refreshUser(true); // टोकन बदलने पर फोर्स रिफ्रेश
            }
        };

        const handleFocusSync = () => {
            // विंडो फोकस होने पर सिर्फ तभी रिफ्रेश करें जब डेटा बहुत पुराना हो
            if (localStorage.getItem('token')) {
                refreshUser();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', handleFocusSync);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocusSync);
        };
    }, [refreshUser]);

    /**
     * 🔑 Secure Login Protocol
     * लॉगिन के तुरंत बाद डेटा सिंक करना।
     */
    const login = (resData) => {
        const token = resData.token;
        const rawUser = resData.user || resData;

        // 1. डेटा स्टोर करें
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', rawUser.role);
        localStorage.setItem('userId', rawUser.id || rawUser._id);
        
        // 2. तुरंत UI अपडेट करें (बिना सर्वर का इंतज़ार किए)
        const immediateUser = normalizeUserData(rawUser);
        setUser(immediateUser);
        setLoading(false);
        
        // 3. बैकग्राउंड में फुल प्रोफाइल सिंक करें (KYC डेटा के लिए)
        setTimeout(() => refreshUser(true), 500); 
    };

    // 🚪 Secure Session Termination
    const logout = () => {
        localStorage.clear();
        setUser(null);
        window.location.href = '/login';
    };

    const contextValue = {
        user,
        login,
        logout,
        loading,
        refreshUser,
        isAuthenticated: !!user,
        userRole: user?.role || localStorage.getItem('userRole')
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);