import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import HomeHeader from '../../components/Customer/HomeHeader';
import CategoryBar from '../../components/Customer/CategoryBar';
import MobileBottomNav from '../../components/Customer/MobileBottomNav';
import { toast } from 'react-toastify';
import { useCustomer } from '../../context/CustomerContext';
import { useBranding } from '../../context/BrandingContext'; // Added for White-labeling

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addToCart, pincode: contextPincode } = useCustomer();
    const { settings } = useBranding(); // Access admin settings
    
    // Extract query and pincode from URL
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('q') || "";
    const urlPincode = queryParams.get('pin');
    const pincode = urlPincode || contextPincode || localStorage.getItem('userPincode') || "";

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. 📡 Marketplace Discovery Engine (Automatic Sync)
    const fetchSearchResults = useCallback(async () => {
        if (!searchQuery) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const res = await api.get(`/customer/marketplace/products?search=${searchQuery}&pinCode=${pincode}`);
            if (res.data.success) {
                setProducts(res.data.data || []);
            }
            // Update Metadata Dynamically
            document.title = `Search: ${searchQuery} | ${settings.siteName}`;
        } catch (err) {
            console.error("Discovery Error");
            toast.error("Failed to synchronize with Marketplace Registry.");
        } finally {
            setLoading(false);
        }
    }, [searchQuery, pincode, settings.siteName]);

    useEffect(() => {
        fetchSearchResults();
        
        // Auto-refresh when returning to focus or storage change
        window.addEventListener('focus', fetchSearchResults);
        return () => window.removeEventListener('focus', fetchSearchResults);
    }, [fetchSearchResults]);

    // 2. 🛒 Basket Action Logic
    const handleAddClick = (e, product) => {
        e.stopPropagation();
        addToCart({
            ...product,
            shopId: product.shopId?._id || product.shopId 
        });
        // Success notification handled in context
    };

    if (loading) return (
        <div style={loaderWrapper}>
            <div style={{...spinnerS, borderTopColor: settings.themeColor || '#2563eb'}}></div>
            <p style={loaderText}>Scanning {settings.siteName} Catalog...</p>
        </div>
    );

    return (
        <div style={pageBg}>
            <HomeHeader />
            <CategoryBar />

            <div style={contentArea}>
                {/* --- Search Intel Header --- */}
                <div style={headerRow}>
                    <div style={titleBox}>
                        <h2 style={titleS}>Results for "{searchQuery}"</h2>
                        <span style={countTag(settings.themeColor)}>{products.length} Units Discovered</span>
                    </div>
                    <div style={locBadge(settings.themeColor)}>
                        📍 <span>Jurisdiction:</span> <b>{pincode || 'GLOBAL'}</b>
                    </div>
                </div>

                {/* --- Results Display Logic --- */}
                {products.length === 0 ? (
                    <div style={noDataCard}>
                        <div style={{fontSize:'80px', marginBottom:'20px'}}>🔍</div>
                        <h3 style={{fontWeight:'900', color:'#0f172a'}}>Registry Empty</h3>
                        <p style={{color:'#64748b', maxWidth:'350px', margin:'0 auto', lineHeight:'1.6'}}>
                            No assets matching "{searchQuery}" were found in your delivery area. 
                            Try broadening your search or updating your node location.
                        </p>
                        <button 
                            onClick={() => navigate('/')} 
                            style={{...backHomeBtn, background: settings.themeColor || '#0f172a'}}
                        >
                            Return to Hub
                        </button>
                    </div>
                ) : (
                    <div style={productGrid}>
                        {products.map(p => {
                            const savingsPercent = p.mrp ? Math.round(((p.mrp - p.price)/p.mrp)*100) : 0;
                            const isOutOfStock = p.stock <= 0;

                            return (
                                <div key={p._id} style={pCard} onClick={() => navigate(`/product/${p._id}`)}>
                                    <div style={imgContainer}>
                                        <img src={p.imageUrl} style={pImg} alt={p.name} />
                                        {savingsPercent > 0 && (
                                            <div style={promoTag}>-{savingsPercent}% OFF</div>
                                        )}
                                        {isOutOfStock && <div style={stockOverlay}>DEPLETED</div>}
                                    </div>
                                    
                                    <div style={pBody}>
                                        <div style={{...shopLabel, color: settings.themeColor || '#2563eb'}}>
                                            🏪 {p.shopId?.shopDetails?.shopName || 'Partner Hub'}
                                        </div>
                                        <h4 style={pName}>{p.name}</h4>
                                        
                                        <div style={priceContainer}>
                                            <div style={priceRow}>
                                                <span style={curPrice}>₹{p.price.toLocaleString()}</span>
                                                {p.mrp > p.price && <span style={oldPrice}>₹{p.mrp.toLocaleString()}</span>}
                                            </div>
                                            <small style={unitText}>/ {p.unit}</small>
                                        </div>

                                        <button 
                                            onClick={(e) => handleAddClick(e, p)} 
                                            style={isOutOfStock ? disabledAddBtn : addBtnS(settings.themeColor)}
                                            disabled={isOutOfStock}
                                        >
                                            {isOutOfStock ? 'OUT OF STOCK' : '+ ADD TO BASKET'}
                                        </button>
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

// --- Enterprise SaaS Visual Definitions ---

const pageBg = { backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '120px', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const contentArea = { padding: '40px 5%', maxWidth: '1450px', margin: '0 auto', animation: 'fadeIn 0.5s ease' };

const headerRow = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'40px', flexWrap:'wrap', gap:'20px', borderBottom:'1.5px solid #f1f5f9', paddingBottom:'25px' };
const titleBox = { display:'flex', flexDirection:'column', gap:'5px' };
const titleS = { margin: 0, fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '900', color: '#0f172a', letterSpacing: '-1.5px' };
const countTag = (color) => ({ fontSize: '11px', color: color || '#2563eb', fontWeight: '900', textTransform:'uppercase', background:`${color}10`, padding:'4px 10px', borderRadius:'6px', alignSelf:'flex-start' });
const locBadge = (color) => ({ background: '#fff', padding: '12px 20px', borderRadius: '15px', border: `1.5px solid ${color}20`, fontSize: '13px', color: '#0f172a', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)', display:'flex', gap:'8px' });

const productGrid = { 
    display: 'grid', 
    gridTemplateColumns: window.innerWidth < 600 ? '1fr 1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', 
    gap: window.innerWidth < 600 ? '12px' : '25px' 
};

const pCard = { background: '#fff', borderRadius: '32px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', transition: '0.3s', cursor: 'pointer' };

const imgContainer = { height: window.innerWidth < 600 ? '140px' : '180px', background: '#f8fafc', position: 'relative', padding: '15px' };
const pImg = { width: '100%', height: '100%', objectFit: 'contain' };
const promoTag = { position:'absolute', top:'15px', left:'15px', background:'#ef4444', color:'#fff', padding:'5px 12px', borderRadius:'10px', fontSize:'10px', fontWeight:'900', boxShadow:'0 4px 8px rgba(0,0,0,0.1)' };
const stockOverlay = { position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', justifyContent:'center', color:'#f43f5e', fontWeight:'900', fontSize:'11px', letterSpacing:'1px', backdropFilter:'blur(2px)' };

const pBody = { padding: '20px' };
const shopLabel = { fontSize:'10px', fontWeight:'900', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.5px' };
const pName = { fontSize: '15px', fontWeight: '800', color: '#1e293b', margin: '0 0 12px 0', height: '40px', overflow: 'hidden', lineHeight:'1.3' };

const priceContainer = { marginBottom: '22px' };
const priceRow = { display:'flex', alignItems:'baseline', gap:'10px' };
const curPrice = { fontSize: '22px', fontWeight: '900', color: '#0f172a', letterSpacing:'-1px' };
const oldPrice = { fontSize: '14px', color: '#cbd5e1', textDecoration: 'line-through', fontWeight: '700' };
const unitText = { fontSize: '11px', color: '#94a3b8', fontWeight: '800' };

const addBtnS = (color) => ({ width:'100%', background: color || '#0f172a', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: '900', fontSize: '11px', cursor: 'pointer', transition:'0.3s', boxShadow: `0 8px 15px -4px ${color}66` });
const disabledAddBtn = { ...addBtnS('#e2e8f0'), background: '#f1f5f9', color: '#cbd5e1', boxShadow: 'none', cursor: 'not-allowed' };

const noDataCard = { textAlign: 'center', padding: '100px 30px', background: '#fff', borderRadius: '40px', border: '1px solid #f1f5f9' };
const backHomeBtn = { marginTop: '30px', padding: '18px 50px', color: '#fff', border: 'none', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', fontSize: '15px', boxShadow:'0 10px 20px rgba(0,0,0,0.1)', transition:'0.3s' };

const loaderWrapper = { height: '100vh', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', background:'#f8fafc', gap:'20px' };
const spinnerS = { width: '45px', height: '45px', border: '5px solid #f1f5f9', borderRadius: '50%', animation: 'spin 1s linear infinite' };
const loaderText = { fontSize: '14px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' };

export default SearchResults;