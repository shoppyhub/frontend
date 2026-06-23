import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../services/api'; 
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import HomeHeader from '../../../components/Customer/HomeHeader';
import { useCustomer } from '../../../context/CustomerContext';
import { useAuth } from '../../../context/AuthContext';
import { useBranding } from '../../../context/BrandingContext'; // White-labeling Hook
import { useJsApiLoader } from '@react-google-maps/api';

// --- Sub-Components ---
import AddressSection from './AddressSection';
import PaymentSection from './PaymentSection';
import OrderSummary from './OrderSummary';

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { settings } = useBranding(); // Access global admin settings
    const { cart, cartTotal, clearCart } = useCustomer();
    const { isLoaded } = useJsApiLoader({ 
        id: 'google-map-script', 
        googleMapsApiKey: import.meta.env.VITE_MAPPLS_API_KEY 
    });

    // --- Core Checkout States ---
    const [addresses, setAddresses] = useState([]);
    const [selectedAddrId, setSelectedAddrId] = useState(null);
    const [isNewAddress, setIsNewAddress] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [customer, setCustomer] = useState({ name: '', mobile: '', pincode: '', locality: '', address: '', state: '', district: '', block: '' });
    const [coords, setCoords] = useState({ lat: 20.5937, lng: 78.9629 }); 
    const [paymentMethod, setPaymentMethod] = useState('Online'); 

    // --- 1. Identity Mapping Protocol ---
    const fillAddress = useCallback((addr) => {
        setCustomer({ 
            name: user?.fullName || '', 
            mobile: user?.mobile || '', 
            pincode: addr.pincode, 
            address: addr.fullAddress, 
            locality: addr.landmark || '',
            state: addr.state || '',
            district: addr.district || '',
            block: addr.block || ''
        });
        if(addr.coordinates) setCoords(addr.coordinates);
    }, [user]);

    // --- 2. Data Synchronization Protocol (Admin Controlled) ---
    const syncData = useCallback(async () => {
        try {
            setFetching(true);
            const addrRes = await api.get('/customer/addresses');
            
            if (addrRes.data.success) {
                const list = addrRes.data.data;
                setAddresses(list);
                const def = list.find(a => a.isDefault) || list[0];
                if (def) { 
                    setSelectedAddrId(def._id); 
                    fillAddress(def); 
                } else {
                    setIsNewAddress(true);
                }
            }
            // Update Browser Metadata
            document.title = `Checkout | ${settings.siteName}`;
        } catch (err) { 
            toast.error("Failed to load addresses. Please try again.");
        } finally { 
            setFetching(false); 
        }
    }, [fillAddress, settings.siteName]);

    useEffect(() => { 
        if (cart.length === 0) navigate('/cart'); 
        else syncData(); 
    }, [cart.length, navigate, syncData]);

    useEffect(() => {
        if (!user) return;
        setCustomer(prev => ({
            ...prev,
            name: prev.name?.trim() ? prev.name : user.fullName || '',
            mobile: prev.mobile?.trim() ? prev.mobile : user.mobile || ''
        }));
    }, [user]);

    // --- 3. Dynamic Billing Engine ---
    const billing = useMemo(() => {
        const discount = 0; // No automatic discount
        
        // Admin Dynamic Logic
        let delCharge = settings?.baseCharge || 0; 
        if (settings) {
            if (!settings.deliveryEnabled) delCharge = 0;
            else if (cartTotal >= (settings.freeDeliveryThreshold || 500)) delCharge = 0;
        }

        const finalAmt = cartTotal - discount + delCharge;
        const isMOVMet = cartTotal >= (settings?.minOrderValue || 0);

        return { discount, delCharge, finalAmt, isMOVMet };
    }, [cartTotal, settings]);

    // --- 4. Secure Dispatch Logic (Razorpay & Payouts) ---
    const handleOrder = async () => {
        const customerName = customer.name?.trim() || user?.fullName?.trim();
        const customerMobile = customer.mobile?.trim() || user?.mobile?.trim();

        // Multi-level Validation
        if (!customerName) return toast.error("Receiver's name is required.");
        if (!customerMobile || customerMobile.length < 10) return toast.error("Valid 10-digit mobile number required.");
        if (!customer.pincode?.trim() || customer.pincode.length !== 6) return toast.error("Area pincode must be exactly 6 digits.");
        if (!customer.address?.trim() || customer.address.trim().length < 5) return toast.error("Please provide complete street address (minimum 5 characters).");
        if (!customer.locality?.trim()) return toast.error("Nearby landmark/locality is required.");
        if (!customer.state) return toast.error("Please select a state.");
        if (!customer.district) return toast.error("Please select a district.");
        if (!customer.block) return toast.error("Please select a block.");
        
        setLoading(true);
        const payload = { 
            items: cart.map(i => ({ 
                productId: i._id, 
                name: i.name, 
                quantity: i.quantity, 
                price: i.price, 
                unit: i.unit 
            })),
            totalAmount: billing.finalAmt, 
            shopId: cart[0].shopId, 
            customerDetails: { 
                name: customerName,
                mobile: customerMobile,
                address: customer.address,
                pinCode: customer.pincode,
                locality: customer.locality,
                state: customer.state,
                district: customer.district,
                block: customer.block,
                coordinates: coords 
            }, 
            paymentMethod 
        };

        try {
            if (paymentMethod === 'Online') {
                const rzpKey = settings?.apiConfig?.razorpay?.KEY_ID || import.meta.env.VITE_RAZORPAY_KEY_ID;
                if (!rzpKey) return toast.error("Payment gateway not configured. Please try again later.");

                const { data: ord } = await api.post('/payments/razorpay/create-order', { amount: billing.finalAmt });
                
                const options = {
                    key: rzpKey,
                    amount: ord.amount, 
                    currency: ord.currency, 
                    name: settings?.siteName || "Secure Checkout",
                    description: `Order Deployment via ${settings.siteName}`,
                    image: settings?.logoUrl || "", 
                    order_id: ord.order_id,
                    handler: async (res) => {
                        const verify = await api.post('/payments/razorpay/verify', { ...res, orderDetails: payload });
                        if (verify.data.success) finalize();
                    },
                    prefill: { name: customer.name, contact: customer.mobile },
                    theme: { color: settings?.themeColor || "#0f172a" } 
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                const res = await api.post('/orders/create', payload);
                if (res.data.success) finalize();
            }
        } catch (err) { 
            toast.error(err.response?.data?.message || "Transaction protocol error."); 
        } finally { 
            setLoading(false); 
        }
    };

    const finalize = () => {
        clearCart();
        toast.success(`Success! Order verified by ${settings.siteName}.`);
        navigate('/my-orders');
    };

    if (fetching) return (
        <div style={loaderS}>
            <div className="spinner" style={{borderTopColor: settings.themeColor || '#2563eb'}}></div>
            <p style={{marginTop:'20px', fontWeight:'800', color:'#94a3b8'}}>Syncing Security Protocols with {settings.siteName}...</p>
        </div>
    );

    return (
        <div style={pageBg}>
            <HomeHeader />
            
            <div style={container}>
                <div style={leftCol}>
                    {/* Address Module */}
                    <AddressSection
                        addresses={addresses} selectedAddrId={selectedAddrId}
                        onSelect={(a) => { setSelectedAddrId(a._id); fillAddress(a); }}
                        isNew={isNewAddress} setIsNew={setIsNewAddress}
                        customer={customer} setCustomer={setCustomer}
                        isLoaded={isLoaded} coords={coords} setCoords={setCoords}
                        onAutoGPS={() => navigator.geolocation.getCurrentPosition(p => setCoords({lat:p.coords.latitude, lng:p.coords.longitude}))}
                        themeColor={settings.themeColor}
                        user={user}
                    />

                    {/* Payment Module */}
                    <PaymentSection 
                        method={paymentMethod} setMethod={setPaymentMethod} 
                        walletBalance={user?.wallet?.balance || 0}
                        onProcess={handleOrder} loading={loading}
                        isMOVMet={billing.isMOVMet} amount={billing.finalAmt}
                        isWalletEnabled={settings?.walletSettings?.enabled}
                        themeColor={settings.themeColor}
                    />
                </div>
                
                {/* Billing Summary Module */}
                <OrderSummary 
                    cart={cart} 
                    cartTotal={cartTotal} 
                    discount={billing.discount} 
                    delivery={billing.delCharge} 
                    final={billing.finalAmt} 
                    isMOVMet={billing.isMOVMet} 
                    minVal={settings?.minOrderValue || 0}
                    brandName={settings?.siteName}
                    themeColor={settings.themeColor}
                />
            </div>

            <style>{`
                .spinner { width: 45px; height: 45px; border: 5px solid #f1f5f9; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @media (max-width: 992px) {
                    .checkout-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

// --- Enterprise Style Definitions ---

const pageBg = { background: '#f8fafc', minHeight: '100vh', paddingBottom: '100px', fontFamily: "'Plus Jakarta Sans', sans-serif" };

const container = {
    width: '95%',
    maxWidth: '1400px',
    margin: '20px auto',
    display: 'grid',
    gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 380px',
    gap: '35px'
};

const leftCol = { display: 'flex', flexDirection: 'column', gap: '28px' };

const loaderS = { 
    height: '100vh', display: 'flex', flexDirection:'column', 
    justifyContent: 'center', alignItems: 'center', background:'#fff' 
};

export default Checkout;