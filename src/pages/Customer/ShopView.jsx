import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api'; 
import HomeHeader from '../../components/Customer/HomeHeader';
import CategoryBar from '../../components/Customer/CategoryBar';
import MobileBottomNav from '../../components/Customer/MobileBottomNav';
import { toast } from 'react-toastify';
import { useCustomer } from '../../context/CustomerContext';
import { useBranding } from '../../context/BrandingContext';

const ShopView = () => {
    const { shopId } = useParams();
    const navigate = useNavigate();
    const { settings } = useBranding();
    const { cart, addToCart, updateQuantity, removeFromCart, cartTotal } = useCustomer();
    
    // --- States ---
    const [shopData, setShopData] = useState(null);
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    // 1. 📡 Automatic Inventory Synchronization
    const fetchShopIntel = useCallback(async () => {
        try {
            const res = await api.get(`/customer/storefront/${shopId}`);
            if (res.data.success) {
                setShopData(res.data.data.shop);
                setProducts(res.data.data.products || []);
                
                // Set Dynamic Title
                document.title = `${res.data.data.shop?.shopDetails?.shopName} | ${settings.siteName}`;
            }
        } catch (err) { 
            console.error("Infrastructure Sync Error");
            toast.error("Cluster connection unstable. Retrying...");
        } finally { 
            setLoading(false); 
        }
    }, [shopId, settings.siteName]);

    useEffect(() => { 
        fetchShopIntel(); 
        // Auto-refresh when user returns to focus or tab changes
        window.addEventListener('focus', fetchShopIntel);
        return () => window.removeEventListener('focus', fetchShopIntel);
    }, [fetchShopIntel]);

    // 2. 🔍 Real-time Filtering Engine
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });
    }, [products, selectedCategory, searchQuery]);

    // --- Loading State View ---
    if (loading) return (
        <div style={loaderS}>
            <div style={{...spinnerS, borderTopColor: settings.themeColor || '#2563eb'}}></div>
            <p style={{fontSize:'14px', fontWeight:'800', color:'#94a3b8'}}>Syncing Storefront Data...</p>
        </div>
    );

    const isClosed = shopData?.shopDetails?.holidayMode;

    return (
        <div style={pageContainer}>
            <HomeHeader />
            
            {/* --- Branded Store Identity Banner --- */}
            <div style={shopBanner(settings.themeColor)}>
                <div style={bannerOverlay}>
                    <div style={logoWrapper}>
                        <img src={shopData?.photo || shopData?.logoUrl || 'https://via.placeholder.com/150'} style={shopLogoS} alt="Logo" />
                    </div>
                    <div style={shopTextS}>
                        <div style={badgeRow}>
                            <span style={typeBadge(settings.themeColor)}>{shopData?.shopDetails?.shopType}</span>
                            <span style={ratingBadge}>⭐ 4.8 Hub Score</span>
                        </div>
                        <h1 style={shopTitle}>{shopData?.shopDetails?.shopName}</h1>
                        <p style={addrText}>📍 {shopData?.shopDetails?.address?.fullAddress}</p>
                        <div style={timeRow}>
                            🕒 09:00 AM - 10:00 PM • 
                            <span style={{color: isClosed ? '#ef4444' : '#10b981', marginLeft:'5px', fontWeight:'900'}}>
                                {isClosed ? 'OFFLINE' : 'OPEN & DELIVERING'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <CategoryBar 
                onCategorySelect={(cat) => setSelectedCategory(cat)} 
                activeCategory={selectedCategory} 
            />

            <div style={mainLayout}>
                {/* --- [LEFT]: DYNAMIC PRODUCT EXPLORER --- */}
                <div style={productSection}>
                    <div style={searchHub}>
                        <span style={searchIconS}>🔍</span>
                        <input 
                            type="text" 
                            placeholder={`Search in ${shopData?.shopDetails?.shopName}...`} 
                            style={searchIn} 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                        />
                    </div>

                    <div style={listHeader}>
                        <h3 style={listTitle}>{selectedCategory} Catalog</h3>
                        <span style={itemCount}>{filteredProducts.length} Items Indexed</span>
                    </div>
                    
                    <div style={prodGrid}>
                        {filteredProducts.map(p => (
                            <div key={p._id} style={{...pCard, opacity: isClosed ? 0.8 : 1}} onClick={() => navigate(`/product/${p._id}`)}>
                                <div style={imgBox}>
                                    <img src={p.imageUrl || 'https://via.placeholder.com/150'} alt={p.name} style={pImg} />
                                    {p.stock < 10 && <span style={stockTag}>Limited Stock</span>}
                                </div>
                                <div style={pInfo}>
                                    <h4 style={pName}>{p.name}</h4>
                                    <div style={pPriceRow}>
                                        <div>
                                            <div style={pPrice}>₹{p.price}</div>
                                            <small style={pUnit}>/{p.unit}</small>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); addToCart(p); }} 
                                            style={addBtn(settings.themeColor)}
                                            disabled={isClosed}
                                        >
                                            {isClosed ? 'N/A' : '+ ADD'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div style={emptyS}>No products found in this sector.</div>
                    )}
                </div>

                {/* --- [RIGHT]: STICKY SMART BASKET (Desktop) --- */}
                <div style={cartSidebar}>
                    <div style={basketCard}>
                        <h3 style={basketTitle}>🛒 Secure Basket</h3>
                        <div style={basketList}>
                            {cart.length === 0 ? (
                                <div style={emptyBasket}>
                                    <div style={{fontSize:'40px', marginBottom:'15px'}}>🧺</div>
                                    <p>Your basket is empty.</p>
                                    <small>Add local goodies to continue.</small>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item._id} style={basketItem}>
                                        <div style={{flex:1}}>
                                            <div style={bItemName}>{item.name}</div>
                                            <div style={qtyControls}>
                                                <button onClick={() => updateQuantity(item._id, -1)} style={miniQtyBtn}>-</button>
                                                <span style={qtyText}>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item._id, 1)} style={miniQtyBtn}>+</button>
                                            </div>
                                        </div>
                                        <div style={bItemRight}>
                                            <b>₹{item.price * item.quantity}</b>
                                            <button onClick={() => removeFromCart(item._id)} style={remBtn}>✕</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {cart.length > 0 && (
                            <>
                                <div style={billSummary}>
                                    <div style={billRow}><span>Subtotal</span><span>₹{cartTotal}</span></div>
                                    <div style={billRow}><span>Infrastructure Fee</span><span style={{color:'#10b981'}}>FREE</span></div>
                                    <div style={grandTotal}><span>Total Payable</span><span>₹{cartTotal}</span></div>
                                </div>

                                <button 
                                    style={checkoutBtn(settings.themeColor)} 
                                    onClick={() => navigate('/checkout')}
                                >
                                    PROCEED TO CHECKOUT
                                </button>
                            </>
                        )}
                        <p style={securityNote}>🛡️ Secured by {settings.siteName} Encryption</p>
                    </div>
                </div>
            </div>

            <MobileBottomNav />
        </div>
    );
};

// --- Enterprise SaaS Visual Architecture ---

const pageContainer = { backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '120px', fontFamily: "'Plus Jakarta Sans', sans-serif" };

const shopBanner = (color) => ({ 
    background: `linear-gradient(135deg, ${color || '#0f172a'} 0%, #1e293b 100%)`, 
    padding: window.innerWidth < 768 ? '30px 5%' : '60px 5%', color:'#fff', position: 'relative'
});

const bannerOverlay = { display: 'flex', alignItems: 'center', gap: '35px', maxWidth: '1400px', margin: '0 auto', flexWrap: 'wrap' };
const logoWrapper = { width: '120px', height: '120px', background: '#fff', borderRadius: '32px', padding: '10px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', flexShrink: 0 };
const shopLogoS = { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '22px' };

const shopTextS = { flex: 1, minWidth: '300px' };
const badgeRow = { display: 'flex', gap: '12px', marginBottom: '15px' };
const typeBadge = (color) => ({ background: color || '#2563eb', color: '#fff', padding: '6px 16px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing:'1px' });
const ratingBadge = { color: '#fbbf24', fontSize: '12px', fontWeight: '800', background:'rgba(255,255,255,0.1)', padding:'6px 12px', borderRadius:'10px' };

const shopTitle = { fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: '900', margin: 0, letterSpacing: '-1.5px' };
const addrText = { fontSize: '15px', color: '#94a3b8', margin: '10px 0', fontWeight: '600' };
const timeRow = { fontSize: '12px', color: '#cbd5e1', fontWeight: '700' };

const mainLayout = { display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 380px', gap: '40px', maxWidth: '1400px', margin: '0 auto', padding: '40px 5%' };

const productSection = { width: '100%' };
const searchHub = { marginBottom: '35px', position: 'relative' };
const searchIconS = { position: 'absolute', left: '20px', top: '18px', color: '#94a3b8', fontSize: '18px' };
const searchIn = { width: '100%', padding: '16px 20px 16px 55px', borderRadius: '20px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '15px', fontWeight: '700', color: '#1e293b', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', boxSizing:'border-box' };

const listHeader = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px' };
const listTitle = { margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a' };
const itemCount = { fontSize:'11px', color:'#94a3b8', fontWeight:'900', textTransform:'uppercase' };

const prodGrid = { display: 'grid', gridTemplateColumns: window.innerWidth < 600 ? '1fr 1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: window.innerWidth < 600 ? '12px' : '25px' };
const pCard = { background: '#fff', borderRadius: '28px', overflow: 'hidden', border: '1.5px solid #f1f5f9', transition: '0.3s', cursor:'pointer' };
const imgBox = { height: window.innerWidth < 600 ? '140px' : '180px', position: 'relative', background: '#f8fafc', padding: '15px' };
const pImg = { width: '100%', height: '100%', objectFit: 'contain' };
const stockTag = { position: 'absolute', top: '12px', right: '12px', background: '#fef2f2', color: '#ef4444', padding: '4px 10px', borderRadius: '8px', fontSize: '9px', fontWeight: '900' };

const pInfo = { padding: '20px' };
const pName = { fontSize: '15px', fontWeight: '800', color: '#1e293b', marginBottom: '12px', height: '40px', overflow: 'hidden', lineHeight:'1.3' };
const pPriceRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const pPrice = { fontSize: '19px', fontWeight: '900', color: '#0f172a' };
const pUnit = { fontSize: '10px', color: '#94a3b8', fontWeight: '800' };
const addBtn = (color) => ({ background: color || '#0f172a', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' });

const cartSidebar = { display: window.innerWidth < 1024 ? 'none' : 'block' };
const basketCard = { background: '#fff', padding: '30px', borderRadius: '40px', border: '1px solid #f1f5f9', position: 'sticky', top: '110px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.04)' };
const basketTitle = { margin: '0 0 25px 0', fontSize: '16px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1px' };

const basketList = { maxHeight: '350px', overflowY: 'auto', marginBottom: '25px' };
const basketItem = { display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #f8fafc', alignItems: 'center' };
const bItemName = { fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom:'8px' };
const qtyControls = { display:'flex', alignItems:'center', gap:'12px' };
const miniQtyBtn = { width:'26px', height:'26px', borderRadius:'8px', border:'1.5px solid #e2e8f0', background:'#fff', cursor:'pointer', fontWeight:'900' };
const qtyText = { fontWeight:'900', fontSize:'14px', color:'#0f172a' };

const bItemRight = { display: 'flex', alignItems: 'center', gap: '15px' };
const remBtn = { background: '#fff1f2', color: '#f43f5e', border: 'none', width:'24px', height:'24px', borderRadius:'50%', cursor: 'pointer', fontSize: '10px', fontWeight:'bold' };

const billSummary = { borderTop: '2px dashed #f1f5f9', paddingTop: '20px', marginBottom: '25px' };
const billRow = { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#64748b', fontWeight: '700' };
const grandTotal = { display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '900', color: '#0f172a', marginTop: '15px' };

const checkoutBtn = (color) => ({ width: '100%', padding: '20px', background: color || '#2563eb', color: '#fff', border: 'none', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', fontSize: '14px', boxShadow: `0 10px 20px -5px ${color}66` });
const securityNote = { textAlign: 'center', color: '#cbd5e1', fontSize: '9px', marginTop: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing:'1px' };

const loaderS = { display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', gap:'20px', background:'#f8fafc' };
const spinnerS = { width: '45px', height: '45px', border: '5px solid #f1f5f9', borderRadius: '50%', animation: 'spin 1s linear infinite' };
const emptyS = { textAlign: 'center', padding: '100px 0', color: '#94a3b8', fontWeight: '800', gridColumn: '1/-1' };
const emptyBasket = { textAlign: 'center', padding: '40px 0', color: '#cbd5e1' };

export default ShopView;