import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';

const CustomerContext = createContext();

const getSafeCartRegistry = () => {
    try {
        const registry = localStorage.getItem('rkd_cart');
        const parsed = registry ? JSON.parse(registry) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
};

export const CustomerProvider = ({ children }) => {
    // --- 🛒 Cart Initialization Protocol ---
    const [cart, setCart] = useState(getSafeCartRegistry);

    const [pincode, setPincode] = useState(localStorage.getItem('userPincode') || "");

    // 1. 📡 Automatic Cross-Tab Synchronization
    useEffect(() => {
        // Persist current state to storage
        localStorage.setItem('rkd_cart', JSON.stringify(cart));

        const handleCrossTabSync = (e) => {
            if (e.key === 'rkd_cart') {
                setCart(getSafeCartRegistry());
            }
            if (e.key === 'userPincode') {
                setPincode(e.newValue || "");
            }
        };

        window.addEventListener('storage', handleCrossTabSync);
        return () => window.removeEventListener('storage', handleCrossTabSync);
    }, [cart]);

    // 2. ➕ Action: Add to Secure Basket
    const addToCart = useCallback((product) => {
        setCart(prev => {
            const currentHubId = product.shopId?._id || product.shopId;
            
            // Integrity Check: Prevent Hub Conflict
            const firstNode = prev[0];
            if (firstNode) {
                const existingHubId = firstNode.shopId?._id || firstNode.shopId;
                if (existingHubId !== currentHubId) {
                    toast.warning("Logistics Conflict: Please order from one merchant hub at a time. Clear basket to switch hubs.");
                    return prev;
                }
            }

            const exists = prev.find(item => item._id === product._id);
            if (exists) {
                toast.info("Registry Updated: Item quantity increased.");
                return prev.map(item => item._id === product._id 
                    ? { ...item, quantity: item.quantity + (product.quantity || 1) } : item);
            }

            toast.success("Protocol Success: Asset linked to basket! 🛒");
            return [...prev, { ...product, quantity: product.quantity || 1 }];
        });
    }, []);

    // 3. 🔄 Action: Update Node Quantity
    const updateQuantity = useCallback((productId, delta) => {
        setCart(prev => prev.map(item => 
            item._id === productId 
            ? { ...item, quantity: Math.max(1, item.quantity + delta) } 
            : item
        ));
    }, []);

    // 4. 🗑️ Action: Decommission Item (Remove)
    const removeFromCart = useCallback((productId) => {
        setCart(prev => prev.filter(item => item._id !== productId));
        toast.info("Registry Cleaned: Item removed from basket.");
    }, []);

    // 5. 🧹 Action: Clear Entire Registry
    const clearCart = useCallback(() => {
        setCart([]);
        localStorage.removeItem('rkd_cart');
        toast.info("Secure Basket Cleared.");
    }, []);

    // 6. 📍 Action: Set Geographic Node (Pincode)
    const updatePincode = useCallback((pin) => {
        setPincode(pin);
        localStorage.setItem('userPincode', pin);
    }, []);

    // 💰 Dynamic Financial Calculations (Memoized)
    const cartStats = useMemo(() => {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const units = cart.reduce((sum, item) => sum + item.quantity, 0);
        return {
            cartTotal: total,
            totalUnits: units,
            itemCount: cart.length
        };
    }, [cart]);

    return (
        <CustomerContext.Provider value={{ 
            cart, 
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            clearCart, 
            pincode, 
            setPincode: updatePincode,
            ...cartStats 
        }}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomer = () => useContext(CustomerContext);