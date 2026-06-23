import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api'; 
import HomeHeader from '../../components/Customer/HomeHeader';
import CategoryBar from '../../components/Customer/CategoryBar';
import MobileBottomNav from '../../components/Customer/MobileBottomNav';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useBranding } from '../../context/BrandingContext'; // Added for White-labeling

const NearbyShops = () => {
    const navigate = useNavigate();
    const { settings } = useBranding(); // Access admin branding settings
    
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [pincode, setPincode] = useState(localStorage.getItem('userPincode') || "");

    // 1. 📡 Discovery Protocol: Automatic Background Sync
    const fetchShops = useCallback(async () => {
        const currentPin = localStorage.getItem('userPincode') || "";
        setPincode(currentPin);

        if (!currentPin) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const url = selectedCategory === 'All' 
                ? `/customer/discovery/shops?pinCode=${currentPin}`
                : `/customer/discovery/shops?pinCode=${currentPin}&category=${selectedCategory}`;

            const res = await api.get(url);
            if (res.data.success) {
                setShops(res.data.data || []);
            }
            // Dynamic Browser Title
            document.title = `Stores in ${currentPin} | ${settings.siteName}`;
        } catch (err) {
            console.error("Discovery Sync Error:", err);
            toast.error("Cluster connection failed. retrying...");
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, settings.siteName]);

    useEffect(() => {
        fetchShops();
        
        // Auto-refresh when user returns to the tab or storage updates
        const handleSync = () => fetchShops();
        window.addEventListener('storage', handleSync);
        window.addEventListener('focus', handleSync);
        
        return () => {
            window.removeEventListener('storage', handleSync);
            window.removeEventListener('focus', handleSync);
        };
    }, [fetchShops]);

    // --- Loading State View ---
    if (loading) return (
        <div style={loaderWrapper}>
            <div style={{...spinnerS, borderTopColor: settings.themeColor || '#2563eb'}}></div>
            <p style={loaderText}>Scanning {settings.siteName} Hubs...</p>
        </div>
    );

    return (
        <div style={pageBg}>
            <HomeHeader />
            
            <CategoryBar 
                onCategorySelect={(cat) => setSelectedCategory(cat)} 
                activeCategory={selectedCategory} 
            />

            <div style={contentArea}>
                {/* --- Dynamic Header Section --- */}
                <div style={headerRow}>
                    <div style={{flex:1}}>
                        <h1 style={titleS}>
                            {selectedCategory === 'All' ? `Partner Stores near ${pincode}` : `${selectedCategory} in ${pincode}`}
                        </h1>
                        <p style={subS}>Hyperlocal delivery network powered by {settings.siteName}.</p>
                    </div>
                    {pincode && (
                        <div style={pinBadge(settings.themeColor)}>
                            <span>ACTIVE PIN:</span> <b>{pincode}</b>
                        </div>
                    )}
                </div>

                {/* --- Discovery Results Logic --- */}
                {!pincode ? (
                    <div style={emptyCard}>
                        <div style={{fontSize:'80px', marginBottom:'20px'}}>📍</div>
                        <h2 style={emptyTitle}>Location Identification Required</h2>
                        <p style={emptyDesc}>Please set your delivery pincode in the top bar to explore merchants in your jurisdiction.</p>
                    </div>
                ) : shops.length === 0 ? (
                    <div style={emptyCard}>
                        <div style={{fontSize:'80px', marginBottom:'20px'}}>🏢</div>
                        <h2 style={emptyTitle}>Area Expansion in Progress</h2>
                        <p style={emptyDesc}>Currently, no {selectedCategory !== 'All' ? selectedCategory : ''} hubs are live in <b>{pincode}</b>. Stay tuned for updates!</p>
                        <button 
                            onClick={() => setSelectedCategory('All')} 
                            style={{...resetBtn, background: settings.themeColor || '#0f172a'}}
                        >
                            Explore All Categories
                        </button>
                    </div>
                ) : (
                    <div style={shopGrid}>
                        {shops.map(s => {
                            const isClosed = s.shopDetails?.holidayMode;
                            return (
                                <div 
                                    key={s._id} 
                                    style={{...shopCard, opacity: isClosed ? 0.75 : 1}} 
                                    onClick={() => !isClosed && navigate(`/shop/${s._id}`)}
                                >
                                    <div style={imgContainer}>
                                        <img 
                                            src={s.photo || s.logoUrl || 'https://via.placeholder.com/500x300?text=Verified+Hub'} 
                                            style={shopImg} 
                                            alt="Merchant" 
                                        />
                                        <div style={verifyBadge}>VERIFIED HUB ✓</div>
                                        {isClosed ? (
                                            <div style={closedOverlay}>HUB OFFLINE</div>
                                        ) : (
                                            <div style={timeTag}>⚡ FAST DELIVERY</div>
                                        )}
                                    </div>

                                    <div style={shopInfo}>
                                        <div style={nameRow}>
                                            <h3 style={shopName}>{s.shopDetails?.shopName}</h3>
                                            <div style={ratingBox}>⭐ 4.5</div>
                                        </div>
                                        <div style={metaRow}>
                                            <span style={catTag(settings.themeColor)}>{s.shopDetails?.shopType}</span>
                                            <span style={distanceS}>• Within 5 KM</span>
                                        </div>
                                        <p style={addrText}>📍 {s.shopDetails?.address?.locality || 'Main Market Sector'}</p>
                                        
                                        <div style={cardFooter}>
                                            <div style={trustText}>Trusted by {settings.siteName}</div>
                                            <button style={isClosed ? disabledBtn : visitBtn(settings.themeColor)}>
                                                {isClosed ? 'CLOSED' : 'VIEW STORE'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <MobileBottomNav />
        </div>
    );
};

// --- Enterprise SaaS Styles ---

const pageBg = { backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const contentArea = { padding: '40px 5%', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.5s ease' };

const headerRow = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'40px', flexWrap:'wrap', gap:'20px' };
const titleS = { margin: 0, fontSize: 'clamp(20px, 5vw, 32px)', fontWeight: '900', color: '#0f172a', letterSpacing: '-1.5px' };
const subS = { margin: '8px 0 0', color: '#64748b', fontSize: '15px', fontWeight: '500' };

const pinBadge = (color) => ({ 
    background: '#fff', padding: '12px 24px', borderRadius: '18px', border: `1.5px solid ${color}20`, 
    fontSize: '13px', color: '#0f172a', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display:'flex', gap:'8px' 
});

const shopGrid = { 
    display: 'grid', 
    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))', 
    gap: '30px' 
};

const shopCard = { 
    background: '#fff', borderRadius: '32px', overflow: 'hidden', cursor: 'pointer', 
    border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', transition: '0.3s' 
};

const imgContainer = { height: '220px', position: 'relative', background: '#f8fafc' };
const shopImg = { width: '100%', height: '100%', objectFit: 'cover' };

const verifyBadge = { position: 'absolute', top: '20px', left: '20px', background: 'rgba(255,255,255,0.95)', color: '#10b981', padding: '6px 14px', borderRadius: '12px', fontSize: '10px', fontWeight: '900', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' };
const timeTag = { position: 'absolute', bottom: '0', width: '100%', padding: '20px', background: 'linear-gradient(transparent, rgba(15, 23, 42, 0.8))', color: '#fff', fontSize: '11px', fontWeight: '800' };
const closedOverlay = { position: 'absolute', top:0, left:0, width:'100%', height:'100%', background:'rgba(15, 23, 42, 0.7)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'16px', letterSpacing:'1px' };

const shopInfo = { padding: '25px' };
const nameRow = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' };
const shopName = { margin: 0, fontSize: '20px', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px' };
const ratingBox = { background: '#ecfdf5', color: '#10b981', padding: '5px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '900' };

const metaRow = { display:'flex', alignItems:'center', gap:'12px', marginBottom:'18px' };
const catTag = (color) => ({ background: `${color}10` || '#eff6ff', color: color || '#2563eb', padding: '5px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' });
const distanceS = { fontSize: '12px', color: '#94a3b8', fontWeight: '700' };

const addrText = { fontSize: '14px', color: '#64748b', fontWeight: '500', lineHeight: '1.5', height: '42px', overflow: 'hidden' };

const cardFooter = { display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'25px', paddingTop:'20px', borderTop:'1.5px solid #f8fafc' };
const trustText = { fontSize: '10px', fontWeight: '800', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing:'0.5px' };
const visitBtn = (color) => ({ background: color || '#0f172a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', transition: '0.2s', boxShadow: `0 4px 12px ${color}33` });
const disabledBtn = { ...visitBtn('#cbd5e1'), cursor: 'not-allowed', boxShadow:'none' };

const emptyCard = { textAlign: 'center', padding: '100px 20px', background: '#fff', borderRadius: '40px', border: '1px solid #f1f5f9' };
const emptyTitle = { fontWeight: '900', color: '#0f172a', margin: '0 0 10px 0', fontSize:'24px' };
const emptyDesc = { color: '#64748b', fontSize: '15px', maxWidth: '400px', margin: '0 auto' };
const resetBtn = { marginTop: '30px', color: '#fff', border: 'none', padding: '18px 45px', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', fontSize:'14px' };

const loaderWrapper = { height: '100vh', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', background:'#f8fafc', gap:'20px' };
const spinnerS = { width: '45px', height: '45px', border: '5px solid #f1f5f9', borderRadius: '50%', animation: 'spin 1s linear infinite' };
const loaderText = { fontSize: '14px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' };

export default NearbyShops;