import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import HomeHeader from '../../components/Customer/HomeHeader';
import MobileBottomNav from '../../components/Customer/MobileBottomNav';
import { toast } from 'react-toastify';
import { useCustomer } from '../../context/CustomerContext';
import { useBranding } from '../../context/BrandingContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, cart } = useCustomer();
    const { settings } = useBranding();

    // --- Core States ---
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeIndex, setActiveIndex] = useState(0);

    // 1. 📡 Automatic Registry Sync (Real-time Intel)
    const fetchProductIntel = useCallback(async () => {
        try {
            const pinCode = localStorage.getItem('userPincode') || '';

            if (!pinCode) {
                toast.warning("📍 Please set your delivery area first to view products.");
                navigate('/');
                return;
            }

            const res = await api.get(`/customer/marketplace/products?pinCode=${pinCode}`);
            if (res.data.success) {
                const node = res.data.data.find(p => p._id === id);
                if (node) {
                    setProduct(node);
                    document.title = `${node.name} | ${settings.siteName}`;
                } else {
                    throw new Error("Asset not in registry");
                }
            }
        } catch (err) {
            toast.error("Resource unavailable in current jurisdiction.");
            navigate('/');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, settings.siteName]);

    useEffect(() => {
        fetchProductIntel();
        // Background Auto-sync when user returns to focus
        window.addEventListener('focus', fetchProductIntel);
        return () => window.removeEventListener('focus', fetchProductIntel);
    }, [fetchProductIntel]);

    // 2. 📸 Cryptographic Image Processing (No Duplicates)
    const gallery = useMemo(() => {
        if (!product) return [];
        const cluster = [product.imageUrl, ...(product.images?.map(img => img.url) || [])];
        return [...new Set(cluster.filter(url => url && url !== ""))];
    }, [product]);

    // 3. 🕹️ Navigation Protocol
    const nextImg = () => setActiveIndex((prev) => (prev + 1) % gallery.length);
    const prevImg = () => setActiveIndex((prev) => (prev - 1 + gallery.length) % gallery.length);

    // 4. 🛒 Financial Transaction Protocol (Add/Buy)
    const handleCartAction = (isBuyNow = false) => {
        if (!product || product.stock <= 0) return toast.error("Resource Exhausted: Product out of stock.");

        // Integrity Check: Prevent Mixing Hubs (Optional Security)
        const firstItem = cart[0];
        const currentShopId = product.shopId?._id || product.shopId;
        if (firstItem && (firstItem.shopId?._id || firstItem.shopId) !== currentShopId) {
            toast.warning("Hub Conflict: Please complete your existing hub order first or clear cart.");
            return;
        }
        
        addToCart({ ...product, quantity, shopId: currentShopId });

        if (isBuyNow) {
            navigate('/cart');
        } else {
            toast.success(`Protocol Success: ${product.name} linked to secure basket.`);
        }
    };

    // 5. 📤 Smart Share Protocol
    const handleShare = async () => {
        const shareData = {
            title: product.name,
            text: `Check out this ${product.name} on ${settings.siteName}!`,
            url: window.location.href,
        };
        if (navigator.share) {
            try { 
                await navigator.share(shareData); 
            } catch (err) { 
                // Share cancelled by user - no action needed
            }
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text + " " + shareData.url)}`, '_blank');
        }
    };

    if (loading) return (
        <div style={loaderWrapper}>
            <div className="spinner" style={{borderTopColor: settings.themeColor || '#2563eb'}}></div>
            <p style={loaderText}>Syncing Secure Node Data...</p>
        </div>
    );
    
    if (!product) return null;

    const savings = (product.mrp || 0) - product.price;
    const savingsPercent = product.mrp ? Math.round((savings / product.mrp) * 100) : 0;
    const isOutOfStock = product.stock <= 0;

    return (
        <div style={pageBg}>
            <HomeHeader />
            
            <div style={mainContainer}>
                
                {/* --- [A] DYNAMIC VISUAL ASSET MODULE --- */}
                <div style={imageColumn}>
                    <div style={mainSliderCard}>
                        {gallery.length > 1 && (
                            <>
                                <button style={leftArrow} onClick={prevImg}>❮</button>
                                <button style={rightArrow} onClick={nextImg}>❯</button>
                            </>
                        )}
                        
                        <img src={gallery[activeIndex]} style={heroImg} alt="Visual Resource" />
                        
                        <button onClick={handleShare} style={shareFloatingBtn}>🔗 SHARE</button>
                        
                        {savingsPercent > 0 && (
                            <div style={promoBadge}>-{savingsPercent}% OFF</div>
                        )}
                        
                        <div style={slideCounter}>{activeIndex + 1} / {gallery.length}</div>
                    </div>
                    
                    <div style={thumbnailRow}>
                        {gallery.map((url, idx) => (
                            <div 
                                key={idx} 
                                style={activeIndex === idx ? activeThumb(settings.themeColor) : thumbCard} 
                                onClick={() => setActiveIndex(idx)}
                            >
                                <img src={url} style={thumbImg} alt="Thumbnail" />
                            </div>
                        ))}
                    </div>

                    <div style={trustGrid}>
                        <div style={trustItem}>🛡️ Verified by {settings.siteName}</div>
                        <div style={trustItem}>💳 Secure Gateway</div>
                        <div style={trustItem}>🔄 Easy Returns</div>
                    </div>
                </div>

                {/* --- [B] PRODUCT INTEL & COMMERCE MODULE --- */}
                <div style={contentColumn}>
                    <div style={badgeRow}>
                        <span style={catPill(settings.themeColor)}>{product.category}</span>
                        <span style={skuBadge}>NODE_ID: {product.generatedId?.toUpperCase() || 'HUB_ASSET'}</span>
                    </div>

                    <h1 style={productTitle}>{product.name}</h1>
                    
                    <div style={priceContainer}>
                        <div style={mainPriceRow}>
                            <span style={priceText}>₹{product.price.toLocaleString()}</span>
                            <span style={unitText}>/ {product.unit}</span>
                        </div>
                        {product.mrp > product.price && (
                            <div style={mrpRow}>
                                <span style={mrpVal}>MRP ₹{product.mrp.toLocaleString()}</span>
                                <span style={saveTag}>Net Savings: ₹{savings}</span>
                            </div>
                        )}
                    </div>

                    {/* Merchant Hub Mapping */}
                    <div style={{...merchantBox, border: '2px solid #10b981'}} onClick={() => navigate(`/shop/${product.shopId?._id}`)}>
                        <div style={{...merchIcon(settings.themeColor), background: '#ecfdf5'}}>🏪</div>
                        <div style={{flex: 1}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px'}}>
                                <small style={merchLabel}>FULFILLED BY HUB</small>
                                <span style={{fontSize: '9px', background: '#ecfdf5', color: '#10b981', padding: '3px 10px', borderRadius: '8px', fontWeight: '900', textTransform: 'uppercase'}}>📍 Available</span>
                            </div>
                            <div style={merchName}>{product.shopId?.shopDetails?.shopName || 'Partner Hub'}</div>
                            <div style={merchLoc}>📍 {product.shopId?.shopDetails?.address?.district || 'Regional'} Sector</div>
                        </div>
                        <span style={{color:'#cbd5e1', fontWeight:'900'}}>❯</span>
                    </div>

                    {/* Inventory & Policy Stats */}
                    <div style={statusRow}>
                        <div style={statusItem}>
                            <small style={statLab}>INVENTORY STATUS</small>
                            <div style={{...statVal, color: isOutOfStock ? '#ef4444' : '#10b981'}}>
                                {isOutOfStock ? 'Depleted' : `${product.stock} Units Online`}
                            </div>
                        </div>
                        <div style={statusItem}>
                            <small style={statLab}>QUALITY CONTROL</small>
                            <div style={statVal}>{product.expDate ? `Exp: ${new Date(product.expDate).toLocaleDateString()}` : 'Certified Fresh'}</div>
                        </div>
                    </div>

                    {/* Action Hub */}
                    <div style={actionRow}>
                        <div style={quantityBox}>
                            <button style={qtyBtn} onClick={() => setQuantity(q => Math.max(1, q-1))}>−</button>
                            <span style={qtyDisplay}>{quantity}</span>
                            <button 
                                style={qtyBtn} 
                                onClick={() => setQuantity(q => q < product.stock ? q + 1 : q)}
                                disabled={quantity >= product.stock}
                            >+</button>
                        </div>
                        
                        <button 
                            style={isOutOfStock ? disabledBtn : cartBtn(settings.themeColor)} 
                            onClick={() => handleCartAction(false)}
                            disabled={isOutOfStock}
                        >
                            ADD TO BASKET
                        </button>
                    </div>

                    <button 
                        style={isOutOfStock ? disabledBtn : buyBtn} 
                        onClick={() => handleCartAction(true)}
                        disabled={isOutOfStock}
                    >
                        ⚡ INSTANT DEPLOYMENT (BUY NOW)
                    </button>

                    {/* Technical Specifications / Description */}
                    <div style={descriptionArea}>
                        <h4 style={descHeading}>Asset Documentation</h4>
                        <p style={descText}>{product.description || "The merchant node has not uploaded extended documentation for this asset."}</p>
                    </div>
                </div>
            </div>

            <MobileBottomNav />

            <style>{`
                .spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

// --- Enterprise SaaS Visual Definitions ---

const pageBg = { background: '#f8fafc', minHeight: '100vh', paddingBottom: '120px', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const mainContainer = { width: '94%', maxWidth: '1300px', margin: '40px auto', display: 'flex', gap: '50px', flexWrap: 'wrap', animation: 'fadeIn 0.5s ease' };

const imageColumn = { flex: '1', minWidth: '320px' };
const mainSliderCard = { background: '#fff', borderRadius: '40px', border: '1px solid #f1f5f9', height: window.innerWidth < 768 ? '350px' : '520px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '20px', boxShadow:'0 20px 40px rgba(0,0,0,0.03)' };
const heroImg = { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' };

const arrowBase = { position:'absolute', top:'50%', transform:'translateY(-50%)', width:'45px', height:'45px', borderRadius:'15px', background:'rgba(255,255,255,0.95)', border:'none', fontSize:'18px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 10px 20px rgba(0,0,0,0.05)', zIndex:10 };
const leftArrow = { ...arrowBase, left:'20px' };
const rightArrow = { ...arrowBase, right:'20px' };

const promoBadge = { position: 'absolute', top: '25px', left: '25px', background: '#ef4444', color: '#fff', padding: '8px 16px', borderRadius: '14px', fontSize: '13px', fontWeight: '900', letterSpacing:'1px', boxShadow:'0 4px 12px rgba(239, 68, 68, 0.3)' };
const shareFloatingBtn = { position:'absolute', top:'25px', right:'25px', background:'#fff', color:'#0f172a', padding:'8px 16px', borderRadius:'14px', fontSize:'10px', fontWeight:'900', border:'1px solid #f1f5f9', cursor:'pointer', boxShadow:'0 4px 12px rgba(0,0,0,0.05)' };
const slideCounter = { position:'absolute', bottom:'20px', background:'rgba(15, 23, 42, 0.75)', color:'#fff', padding:'5px 15px', borderRadius:'20px', fontSize:'11px', fontWeight:'800', backdropFilter:'blur(5px)' };

const thumbnailRow = { display: 'flex', gap: '15px', marginTop: '25px', overflowX: 'auto', padding: '5px', scrollbarWidth:'none' };
const thumbCard = { width: '80px', height: '80px', borderRadius: '20px', border: '2.5px solid transparent', cursor: 'pointer', overflow: 'hidden', background: '#fff', flexShrink: 0, transition:'0.3s' };
const activeThumb = (color) => ({ ...thumbCard, borderColor: color || '#2563eb', transform:'scale(1.05)' });
const thumbImg = { width: '100%', height: '100%', objectFit: 'cover' };

const trustGrid = { display: 'flex', justifyContent: 'space-between', marginTop: '35px', fontSize: '10px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' };
const trustItem = { display:'flex', alignItems:'center', gap:'5px' };

const contentColumn = { flex: '1.2', minWidth: '320px' };
const badgeRow = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px' };
const catPill = (color) => ({ background: `${color}15` || '#eff6ff', color: color || '#2563eb', padding: '6px 18px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing:'0.5px' });
const skuBadge = { color: '#cbd5e1', fontSize: '11px', fontWeight: '800' };

const productTitle = { fontSize: 'clamp(26px, 5vw, 42px)', fontWeight: '900', color: '#0f172a', margin: '0 0 25px 0', letterSpacing: '-1.5px', lineHeight: '1.1' };
const priceContainer = { marginBottom: '40px' };
const mainPriceRow = { display: 'flex', alignItems: 'baseline', gap: '12px' };
const priceText = { fontSize: '48px', fontWeight: '900', color: '#0f172a', letterSpacing: '-2px' };
const unitText = { fontSize: '20px', color: '#94a3b8', fontWeight: '700' };

const mrpRow = { display: 'flex', alignItems: 'center', gap: '15px', marginTop: '8px' };
const mrpVal = { fontSize: '20px', color: '#cbd5e1', textDecoration: 'line-through', fontWeight: '700' };
const saveTag = { color: '#10b981', background:'#ecfdf5', padding:'5px 12px', borderRadius:'10px', fontSize: '14px', fontWeight: '900' };

const merchantBox = { background: '#fff', padding: '20px', borderRadius: '30px', border: '1.5px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', marginBottom: '40px', transition:'0.2s' };
const merchIcon = (color) => ({ width: '50px', height: '50px', background: `${color}10` || '#f8fafc', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' });
const merchLabel = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform:'uppercase', letterSpacing:'1px' };
const merchName = { fontSize: '17px', fontWeight: '800', color: '#1e293b' };
const merchLoc = { fontSize: '13px', color: '#64748b', fontWeight: '600' };

const statusRow = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' };
const statusItem = { padding: '20px', borderRadius: '25px', background: '#fff', border: '1.5px solid #f1f5f9' };
const statLab = { fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px', display: 'block', marginBottom: '8px' };
const statVal = { fontSize: '16px', fontWeight: '800', color: '#334155' };

const actionRow = { display: 'flex', gap: '20px', marginBottom: '20px' };
const quantityBox = { display: 'flex', alignItems: 'center', background: '#fff', border: '2px solid #eef2f6', borderRadius: '22px', overflow: 'hidden' };
const qtyBtn = { width: '60px', height: '60px', border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', fontWeight: '900', color:'#0f172a' };
const qtyDisplay = { width: '50px', textAlign: 'center', fontWeight: '900', fontSize: '22px', color: '#0f172a' };

const cartBtn = (color) => ({ flex: 1, background: color || '#0f172a', color: '#fff', border: 'none', borderRadius: '22px', fontWeight: '900', fontSize: '15px', cursor: 'pointer', boxShadow: `0 10px 20px -5px ${color}44` });
const buyBtn = { width: '100%', background: '#fb641b', color: '#fff', border: 'none', padding: '22px', borderRadius: '25px', fontWeight: '900', fontSize: '17px', cursor: 'pointer', boxShadow: '0 15px 30px rgba(251,100,27,0.25)', transition:'0.3s' };
const disabledBtn = { ...buyBtn, background: '#cbd5e1', cursor: 'not-allowed', boxShadow: 'none' };

const descriptionArea = { marginTop: '50px', borderTop: '2px solid #f8fafc', paddingTop: '40px' };
const descHeading = { fontSize: '15px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', textTransform: 'uppercase', letterSpacing:'1px' };
const descText = { color: '#64748b', fontSize: '16px', lineHeight: '1.8', fontWeight: '500' };

const loaderWrapper = { height: '100vh', display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', gap:'20px', background:'#f8fafc' };
const loaderText = { fontSize: '14px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' };

export default ProductDetail;