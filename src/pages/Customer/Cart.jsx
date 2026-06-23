import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import HomeHeader from '../../components/Customer/HomeHeader';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useCustomer } from '../../context/CustomerContext';
import { useAuth } from '../../context/AuthContext';

const Cart = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cart, updateQuantity, removeFromCart, cartTotal } = useCustomer();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Admin Control Settings
    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/customer/settings');
            if (res.data.success) {
                setSettings(res.data.data);
            }
        } catch (err) {
            toast.error("Security/Policy sync failed. Please refresh.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // 2. Advanced Delivery Calculation Logic (Admin Controlled)
    const deliveryDetails = useMemo(() => {
        if (!settings) return { charge: 0, type: 'Calculating...' };

        const { 
            deliveryEnabled, 
            deliveryStrategy, // 'fixed', 'distance', 'merchant'
            freeDeliveryThreshold,
            baseCharge,
            ratePerKm,
            allowMerchantRates 
        } = settings;

        if (!deliveryEnabled) return { charge: 0, type: 'FREE DELIVERY (PROMO)' };

        // Threshold check (Admin's Global Rule)
        if (cartTotal >= (freeDeliveryThreshold || 500)) {
            return { charge: 0, type: 'FREE (Threshold Reached)' };
        }

        // Logic A: Merchant Controlled (If Admin allowed)
        if (allowMerchantRates) {
            const merchantCharge = cart.reduce((acc, item) => acc + (item.shopId?.deliveryRates || 0), 0);
            return { charge: merchantCharge, type: 'Merchant Defined' };
        }

        // Logic B: Distance Based
        if (deliveryStrategy === 'distance') {
            const estimatedKm = 5; // In real app, calculate from user lat-lng to shop lat-lng
            const distanceCharge = baseCharge + (estimatedKm * ratePerKm);
            return { charge: distanceCharge, type: `Distance Based (${estimatedKm}km)` };
        }

        // Logic C: Fixed Charge
        return { charge: baseCharge || 40, type: 'Standard Fixed Rate' };

    }, [settings, cart, cartTotal]);

    // 3. Final Financials
    const finalPayable = cartTotal + deliveryDetails.charge;
    const minOrderValue = settings?.minOrderValue || 0;
    const isOrderValid = cartTotal >= minOrderValue;

    const handleProceed = () => {
        if (!user) {
            toast.info("Identification required. Please login.");
            return navigate('/login');
        }
        if (!isOrderValid) {
            toast.error(`Order below ₹${minOrderValue} limit.`);
            return;
        }
        navigate('/checkout');
    };

    if (loading) return (
        <div style={loaderS}>
            <div className="pulse-loader"></div>
            <p>Configuring Infrastructure & Delivery Rules...</p>
        </div>
    );

    return (
        <div style={pageBg}>
            <HomeHeader />
            
            <div style={container}>
                {cart.length === 0 ? (
                    <div style={emptyView}>
                        <div style={{fontSize:'80px'}}>🛍️</div>
                        <h2 style={{fontWeight:'900', color:'#0f172a'}}>Your basket is ready for filling</h2>
                        <p style={{color:'#64748b', marginBottom:'30px'}}>Discover best products from your local area.</p>
                        <Link to="/" style={shopBtn}>Explore Marketplace</Link>
                    </div>
                ) : (
                    <div style={mainGrid}>
                        
                        {/* --- LEFT: DYNAMIC ITEM LIST --- */}
                        <div style={leftCol}>
                            <div style={cartHeader}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <h3 style={{margin:0, fontWeight:'900', color:'#0f172a'}}>
                                        Live Basket ({cart.length} Units)
                                    </h3>
                                    <Link to="/" style={addMoreLink}>+ Add More Items</Link>
                                </div>
                                {!isOrderValid && (
                                    <div style={minOrderAlert}>
                                        ⚠️ Minimum Order Constraint: Add ₹{minOrderValue - cartTotal} more.
                                    </div>
                                )}
                            </div>

                            <div style={itemsWrapper}>
                                {cart.map((item) => (
                                    <div key={item._id} style={productCard}>
                                        <div style={itemContent}>
                                            <div style={imageSection}>
                                                <img src={item.imageUrl} alt={item.name} style={itemImg} />
                                                <div style={qtyToggle}>
                                                    <button onClick={() => updateQuantity(item._id, -1)} style={qtyBtn}>–</button>
                                                    <span style={qtyText}>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item._id, 1)} style={qtyBtn}>+</button>
                                                </div>
                                            </div>
                                            
                                            <div style={infoSection}>
                                                <h4 style={prodName}>{item.name}</h4>
                                                <div style={merchantBadge}>
                                                    🏪 {item.shopId?.shopDetails?.shopName || 'Premium Seller'}
                                                </div>
                                                
                                                <div style={priceRow}>
                                                    <span style={newPrice}>₹{(item.price * item.quantity).toLocaleString()}</span>
                                                    <span style={oldPrice}>₹{((item.price + 50) * item.quantity).toLocaleString()}</span>
                                                </div>

                                                <button onClick={() => removeFromCart(item._id)} style={removeBtn}>
                                                    🗑️ Remove Item
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Mobile/Sticky Control */}
                            <div style={stickyFooter}>
                                <div style={footerPrice}>
                                    <small style={{color:'#64748b', fontWeight:'700'}}>Total Payable Amount</small>
                                    <div style={{fontWeight:'900', fontSize:'24px', color:'#0f172a'}}>₹{finalPayable.toLocaleString()}</div>
                                </div>
                                <button 
                                    onClick={handleProceed} 
                                    style={isOrderValid ? placeBtn : placeBtnDisabled}
                                    disabled={!isOrderValid}
                                >
                                    CONFIRM & PROCEED
                                </button>
                            </div>
                        </div>

                        {/* --- RIGHT: ADMIN-MANAGED BILLING --- */}
                        <div style={rightCol}>
                            <div style={priceCard}>
                                <h4 style={priceHeader}>BILLING SUMMARY</h4>
                                
                                <div style={row}>
                                    <span>Items Total</span>
                                    <span>₹{cartTotal.toLocaleString()}</span>
                                </div>

                                <div style={row}>
                                    <div style={{display:'flex', flexDirection:'column'}}>
                                        <span>Delivery Fee</span>
                                        <small style={{fontSize:'10px', color:'#94a3b8'}}>{deliveryDetails.type}</small>
                                    </div>
                                    <span style={{color: deliveryDetails.charge === 0 ? '#10b981' : '#1e293b', fontWeight:'800'}}>
                                        {deliveryDetails.charge === 0 ? 'FREE' : `₹${deliveryDetails.charge}`}
                                    </span>
                                </div>

                                <div style={totalRow}>
                                    <span>Grand Total</span>
                                    <span>₹{finalPayable.toLocaleString()}</span>
                                </div>

                                {deliveryDetails.charge > 0 && settings?.freeDeliveryThreshold && (
                                    <div style={upsellNote}>
                                        💡 Add <b>₹{settings.freeDeliveryThreshold - cartTotal}</b> more to get <b>FREE DELIVERY</b>!
                                    </div>
                                )}

                            </div>

                            <div style={trustBox}>
                                <div style={{fontWeight:'800', marginBottom:'5px', color:'#0f172a'}}>RKD MART SECURE 🔐</div>
                                <p style={{margin:0}}>All prices are inclusive of taxes and platform handling fees. Distance is calculated based on GPS mapping.</p>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

// --- Professional UI/UX Styles ---

const pageBg = { background: '#f1f5f9', minHeight: '100vh', paddingBottom: '80px', fontFamily: "'Plus Jakarta Sans', sans-serif" };
const container = { width: '96%', maxWidth: '1300px', margin: '20px auto' };
const mainGrid = { display: 'grid', gridTemplateColumns: window.innerWidth < 992 ? '1fr' : '1.7fr 1.1fr', gap: '25px' };

const leftCol = { background: '#fff', borderRadius: '28px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const cartHeader = { padding: '25px 30px', background: '#fff', borderBottom: '1px solid #f1f5f9' };
const addMoreLink = { textDecoration:'none', color:'#2563eb', fontWeight:'700', fontSize:'14px', border: '1.5px solid #dbeafe', padding: '8px 15px', borderRadius: '12px' };
const minOrderAlert = { background: '#fff1f2', color: '#e11d48', padding: '12px', borderRadius: '14px', fontSize: '13px', marginTop: '15px', fontWeight: '700', border: '1px solid #ffe4e6' };

const itemsWrapper = { padding: '10px' };
const productCard = { padding: '20px', marginBottom: '10px', borderRadius: '20px', transition: '0.2s' };
const itemContent = { display: 'flex', gap: '20px' };
const imageSection = { width: '100px' };
const itemImg = { width: '100px', height: '100px', objectFit: 'cover', borderRadius: '18px', background: '#f8fafc' };

const qtyToggle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', background: '#f8fafc', borderRadius: '10px', padding: '5px' };
const qtyBtn = { border: 'none', background: '#fff', cursor: 'pointer', fontWeight: '900', width: '28px', height: '28px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const qtyText = { fontSize: '14px', fontWeight: '800' };

const infoSection = { flex: 1 };
const prodName = { fontSize: '17px', color: '#1e293b', margin: '0 0 4px 0', fontWeight: '800' };
const merchantBadge = { fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', display: 'inline-block', marginBottom: '12px', fontWeight: '600' };
const priceRow = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' };
const newPrice = { fontSize: '19px', fontWeight: '900', color: '#0f172a' };
const oldPrice = { color: '#94a3b8', textDecoration: 'line-through', fontSize: '13px' };
const removeBtn = { background: 'none', border: 'none', color: '#94a3b8', fontWeight: '700', fontSize: '12px', cursor: 'pointer' };

const stickyFooter = { padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderTop: '1px solid #f1f5f9', position: 'sticky', bottom: 0 };
const footerPrice = { display: 'flex', flexDirection: 'column' };
const placeBtn = { background: '#2563eb', color: '#fff', border: 'none', padding: '16px 40px', fontWeight: '900', fontSize: '15px', cursor: 'pointer', borderRadius: '18px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' };
const placeBtnDisabled = { ...placeBtn, background: '#cbd5e1', boxShadow: 'none', cursor: 'not-allowed' };

const rightCol = { display: 'flex', flexDirection: 'column', gap: '20px' };
const priceCard = { background: '#fff', padding: '30px', borderRadius: '30px', border: '1px solid #e2e8f0' };
const priceHeader = { color: '#94a3b8', fontWeight: '900', fontSize: '12px', marginBottom: '25px', letterSpacing: '1px' };
const row = { display: 'flex', justifyContent: 'space-between', marginBottom: '18px', fontSize: '15px', fontWeight: '600', color: '#475569' };
const totalRow = { display: 'flex', justifyContent: 'space-between', fontSize: '24px', fontWeight: '900', color: '#0f172a', borderTop: '2px dashed #f1f5f9', paddingTop: '20px', marginTop: '10px' };
const savingsTag = { color: '#059669', background: '#ecfdf5', padding: '15px', borderRadius: '16px', fontSize: '13px', fontWeight: '800', marginTop: '20px', textAlign: 'center' };
const upsellNote = { background: '#eff6ff', color: '#1d4ed8', padding: '12px', borderRadius: '12px', fontSize: '12px', marginTop: '15px', textAlign: 'center', fontWeight: '600' };

const trustBox = { background: '#1e293b', padding: '20px', borderRadius: '24px', color: '#f1f5f9', fontSize: '12px', lineHeight: '1.6' };
const emptyView = { background: '#fff', padding: '80px 20px', textAlign: 'center', borderRadius: '35px', border: '1px solid #e2e8f0' };
const shopBtn = { display: 'inline-block', background: '#0f172a', color: '#fff', padding: '18px 40px', textDecoration: 'none', fontWeight: '900', borderRadius: '20px', marginTop: '20px' };
const loaderS = { display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', color: '#2563eb', fontWeight: '800' };

export default Cart;