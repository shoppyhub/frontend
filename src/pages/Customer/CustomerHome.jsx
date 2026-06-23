import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import HomeHeader from '../../components/Customer/HomeHeader';
import CategoryBar from '../../components/Customer/CategoryBar';
import PincodeModal from '../../components/Customer/PincodeModal';
import HomeBannerCarousel, { HomeBannerGrid } from '../../components/SystemAdmin/HomeBannerCarousel';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCustomer } from '../../context/CustomerContext';
import { useBranding } from '../../context/BrandingContext'; // Added for White-labeling

const CustomerHome = () => {
    const navigate = useNavigate();
    const { addToCart, pincode, setPincode } = useCustomer();
    const { settings } = useBranding(); // Access admin settings

    // --- States ---
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showPincodeModal, setShowPincodeModal] = useState(false);
    const [hasTopBanner, setHasTopBanner] = useState(false);

    // 1. 📡 Data Synchronization from Cluster (White-labeled)
    const fetchHomeData = useCallback(async () => {
        const currentPincode = localStorage.getItem('userPincode') || pincode || "";
        setLoading(true);
        
        try {
            // Parallel API calls for performance
            // Banners are now fetched directly by HomeBannerCarousel component
            const [prodRes, shopRes] = await Promise.all([
                api.get(`/customer/marketplace/products?category=${selectedCategory}&pinCode=${currentPincode}`),
                api.get(`/customer/discovery/shops?pinCode=${currentPincode}`)
            ]);

            setProducts(prodRes.data.data || []);
            setShops(shopRes.data.data || []);
            
            // Sync metadata
            document.title = `${settings.siteName || 'Home'} | Local Market`;
        } catch (err) {
            console.error("Infrastructure Sync Error:", err);
            toast.error("Failed to sync area inventory. Please check your connection.");
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, pincode, settings.siteName]);

    useEffect(() => {
        fetchHomeData();

        // Auto-refresh data on window focus
        window.addEventListener('focus', fetchHomeData);
        return () => window.removeEventListener('focus', fetchHomeData);
    }, [fetchHomeData]);

    // Check if pincode is set on component mount
    useEffect(() => {
        const currentPincode = localStorage.getItem('userPincode') || pincode;
        if (!currentPincode) {
            setShowPincodeModal(true);
        }
    }, []);

    // 2. 🛒 Smart Cart Action
    const handleAddClick = (e, product) => {
        e.stopPropagation(); 
        addToCart({
            ...product,
            shopId: product.shopId?._id || product.shopId 
        });
        // Success toast is already handled inside CustomerContext for consistency
    };

    return (
        <div style={pageBg}>
            <HomeHeader />

            <PincodeModal isOpen={showPincodeModal} onClose={() => setShowPincodeModal(false)} />

            <CategoryBar 
                onCategorySelect={(cat) => setSelectedCategory(cat)} 
                activeCategory={selectedCategory} 
            />

            {/* --- [A] HERO SECTION (Dynamic Branding) --- */}
            {!hasTopBanner && (
                <div style={heroSection(settings.themeColor)}>
                    <div style={heroOverlay}>
                        <h1 style={heroTitle}>
                            Your Local Market, <br/> 
                            <span style={{color: '#f1c40f'}}>Digitally Delivered by {settings.siteName}.</span>
                        </h1>
                        <div style={pincodeBox}>
                            {pincode ? (
                                <span style={pinText}>📍 Active Node: <b>{pincode}</b></span>
                            ) : (
                                <span style={pinAlert}>⚠️ Select area to explore {settings.siteName}</span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- [B] ULTRA PRO BANNER CAROUSEL --- */}
            <HomeBannerCarousel position="Home Page Top" onBannersLoaded={(count) => setHasTopBanner(count > 0)} />

            {/* --- [C] BANNER GRID (Middle) --- */}
            <HomeBannerGrid position="Home Page Middle" />

            {/* --- [C] NEARBY SHOPS --- */}
            <div style={sectionWrapper}>
                <div style={sectionHead}>
                    <h3 style={sectionTitle}>🏪 Shops Near You</h3>
                    <span style={viewAll} onClick={() => navigate('/nearby-shops')}>Explore All →</span>
                </div>
                
                <div style={shopScroll}>
                    {shops.length === 0 ? (
                        <div style={emptyInfo}>No active merchants found in {pincode || 'this area'}.</div>
                    ) : (
                        shops.map(s => (
                            <div key={s._id} style={shopCard} onClick={() => navigate(`/shop/${s._id}`)}>
                                <img src={s.photo || s.logoUrl || 'https://via.placeholder.com/60'} style={shopLogo} alt="shop" />
                                <div style={shopMeta}>
                                    <div style={shopNameS}>{s.shopDetails?.shopName}</div>
                                    <small style={shopTypeS}>{s.shopDetails?.shopType}</small>
                                    <div style={ratingBadge}>⭐ Verified Merchant</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- [D] PRODUCT MARKETPLACE GRID --- */}
            <div style={sectionWrapper}>
                <div style={sectionHead}>
                    <h3 style={sectionTitle}>✨ Featured in {selectedCategory}</h3>
                    <div style={itemCount}>{products.length} Units Found</div>
                </div>

                {loading ? (
                    <div style={loaderBox}>
                        <div style={{...spinner, borderTopColor: settings.themeColor || '#0f172a'}}></div>
                        <p style={{fontSize:'12px', fontWeight:'700', color:'#64748b'}}>Scanning Local Inventory...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div style={noDataBox}>
                        <div style={{fontSize:'60px', marginBottom:'15px'}}>🛍️</div>
                        <h3 style={{color:'#1e293b'}}>Inventory Exhausted</h3>
                        <p>No products available in this category for area {pincode}.</p>
                    </div>
                ) : (
                    <div style={productGrid}>
                        {products.map(p => (
                            <div key={p._id} style={pCard} onClick={() => navigate(`/product/${p._id}`)}>
                                <div style={pImgBox}>
                                    <img src={p.imageUrl} style={pImg} alt={p.name} />
                                    <div style={storeTag}>🏪 {p.shopId?.shopDetails?.shopName || 'Local Seller'}</div>
                                    {p.stock < 5 && <span style={stockLabel}>Only {p.stock} left!</span>}
                                </div>
                                <div style={pBody}>
                                    <div style={pName}>{p.name}</div>
                                    <div style={pPriceRow}>
                                        <div style={pPrice}>₹{p.price} <small style={pUnit}>/{p.unit}</small></div>
                                        <button 
                                            onClick={(e) => handleAddClick(e, p)} 
                                            style={{...addBtn, background: settings.themeColor || '#0f172a'}}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Professional & Responsive UI Styles ---

const pageBg = { backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '120px', fontFamily: "'Plus Jakarta Sans', sans-serif" };

const heroSection = (color) => ({ 
    height: '240px', 
    background: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url("https://images.unsplash.com/photo-1604719312563-8912e9223c6a?q=80&w=1470") center/cover no-repeat`, 
    display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
    borderBottom: `4px solid ${color || '#2563eb'}`
});

const heroOverlay = { width: '92%', color: '#fff' };
const heroTitle = { fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: '900', margin: '0 0 15px 0', lineHeight: '1.2' };
const pincodeBox = { display:'inline-block', background:'rgba(255,255,255,0.1)', padding:'10px 25px', borderRadius:'30px', border:'1px solid rgba(255,255,255,0.2)', backdropFilter:'blur(5px)' };
const pinText = { fontSize: '13px', fontWeight:'800', color: '#f1c40f', textTransform:'uppercase' };
const pinAlert = { fontSize: '12px', fontWeight:'900', color: '#ff4d4d' };

const bannerContainer = { padding: '25px 0' };
const bannerScroll = { display: 'flex', gap: '15px', padding: '0 4%', overflowX: 'auto', scrollbarWidth: 'none' };
const bannerCard = { minWidth: '300px', height: '150px', borderRadius: '24px', overflow: 'hidden', boxShadow:'0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' };
const bannerImg = { width: '100%', height: '100%', objectFit: 'cover' };

const sectionWrapper = { padding: '25px 4%' };
const sectionHead = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' };
const sectionTitle = { fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' };
const viewAll = { color: '#2563eb', fontWeight: '800', cursor: 'pointer', fontSize: '13px' };
const itemCount = { color: '#94a3b8', fontSize: '11px', fontWeight: '900', textTransform:'uppercase' };

const shopScroll = { display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '15px', scrollbarWidth: 'none' };
const shopCard = { minWidth: '260px', background: '#fff', padding: '15px', borderRadius: '22px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #f1f5f9', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };
const shopLogo = { width: '50px', height: '50px', borderRadius: '15px', objectFit: 'cover', background: '#f8fafc' };
const shopMeta = { display: 'flex', flexDirection: 'column', flex: 1 };
const shopNameS = { fontWeight: '800', color: '#1e293b', fontSize: '15px' };
const shopTypeS = { color: '#64748b', fontWeight: '700', fontSize: '11px' };
const ratingBadge = { fontSize: '10px', color: '#10b981', fontWeight: '900', marginTop:'3px' };
const emptyInfo = { padding:'40px', color:'#94a3b8', background:'#fff', borderRadius:'25px', width:'100%', textAlign:'center', border:'1px dashed #e2e8f0', fontSize:'14px', fontWeight: '700' };

const productGrid = { 
    display: 'grid', 
    gridTemplateColumns: window.innerWidth < 600 ? '1fr 1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', 
    gap: window.innerWidth < 600 ? '10px' : '25px' 
};

const pCard = { background: '#fff', borderRadius: '28px', border: '1px solid #f1f5f9', overflow: 'hidden', cursor:'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', transition: '0.3s' };
const pImgBox = { height: window.innerWidth < 600 ? '130px' : '180px', background: '#f8fafc', position: 'relative', padding: '15px' };
const pImg = { width: '100%', height: '100%', objectFit: 'contain' };
const storeTag = { position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.95)', padding: '4px 10px', fontSize: '9px', fontWeight: '900', color: '#1e293b', borderRadius: '8px', boxShadow:'0 2px 4px rgba(0,0,0,0.05)' };
const stockLabel = { position: 'absolute', bottom: '10px', right: '10px', background: '#fef2f2', color: '#ef4444', padding: '3px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: '900' };

const pBody = { padding: '15px' };
const pName = { fontWeight: '800', color: '#1e293b', fontSize: '15px', marginBottom: '10px', height: '38px', overflow: 'hidden', lineHeight:'1.3' };
const pPriceRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const pPrice = { fontSize: '20px', fontWeight: '900', color: '#0f172a' };
const pUnit = { fontSize: '11px', color: '#94a3b8', fontWeight: '700' };
const addBtn = { color: '#fff', border: 'none', width: '38px', height: '38px', borderRadius: '12px', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };

const loaderBox = { textAlign: 'center', padding: '80px', color: '#0f172a' };
const spinner = { width: '35px', height: '35px', border: '4px solid #f1f5f9', borderRadius: '50%', margin: '0 auto 15px', animation: 'spin 1s linear infinite' };
const noDataBox = { textAlign: 'center', padding: '100px 20px', background: '#fff', borderRadius: '35px', color: '#94a3b8', border: '1px solid #f1f5f9', gridColumn:'1/-1' };

export default CustomerHome;