import React, { useState, useEffect } from 'react';
import MobileBottomNav from './MobileBottomNav';
import './App.css';

const CustomerApp = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);

    useEffect(() => {
        // यहाँ API कॉल आएगी: fetchProducts();
        const demoData = [
            { id: 101, name: "Z10 Wireless Earbuds", price: 1499, oldPrice: 2999, img: "🎧", cat: "Electronics" },
            { id: 102, name: "Smart Fitness Band", price: 2499, oldPrice: 4999, img: "⌚", cat: "Electronics" },
            { id: 103, name: "Pure Cotton T-Shirt", price: 499, oldPrice: 999, img: "👕", cat: "Fashion" },
            { id: 104, name: "Leather Formal Shoes", price: 1999, oldPrice: 3500, img: "👞", cat: "Fashion" },
            { id: 105, name: "Organic Green Tea", price: 299, oldPrice: 450, img: "🍵", cat: "Grocery" },
        ];
        setProducts(demoData);
        const savedCart = JSON.parse(localStorage.getItem('rkd_cart')) || [];
        setCart(savedCart);
    }, []);

    const addToCart = (product) => {
        const newCart = [...cart, product];
        setCart(newCart);
        localStorage.setItem('rkd_cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('storage')); // Nav को अपडेट करने के लिए
        alert(`${product.name} जोड़ा गया!`);
    };

    return (
        <div className="RKD_MART_App_Container">
            {/* 💻 Top Navigation */}
            <header className="desktop-header">
                <div style={{fontWeight: 900, fontSize: '22px'}}>RKD MART</div>
                <div className="search-box">
                    <input type="text" className="search-input" placeholder="Search products..." />
                    <button className="search-btn">🔍</button>
                </div>
                <div className="desktop-links" style={{display:'flex', gap:'25px'}}>
                    <span style={{cursor:'pointer'}}>Login</span>
                    <span style={{cursor:'pointer'}}>Cart ({cart.length})</span>
                </div>
            </header>

            {/* 📢 Monetization Ad Section */}
            <div style={{padding: '0 5%'}}>
                <div className="featured-banner">
                    <h1 style={{fontSize:'28px'}}>FESTIVAL DHAMAKA SALE</h1>
                    <p>Get extra 10% off on RKD Wallet payments</p>
                    <button style={{marginTop:'15px', padding:'10px 20px', borderRadius:'5px', border:'none', fontWeight:'bold', cursor:'pointer'}}>Shop Now</button>
                </div>
            </div>

            {/* 📦 Global Product Grid */}
            <h2 style={{padding: '10px 10%', fontSize:'18px'}}>Trending Deals</h2>
            <main className="product-grid">
                {products.map(p => (
                    <div key={p.id} style={cardStyle}>
                        <div style={imgContainer}>{p.img}</div>
                        <div style={{padding:'10px'}}>
                            <div style={pName}>{p.name}</div>
                            <div style={{display:'flex', alignItems:'baseline', gap:'8px'}}>
                                <span style={pPrice}>₹{p.price}</span>
                                <span style={pOldPrice}>₹{p.oldPrice}</span>
                            </div>
                            <button onClick={() => addToCart(p)} style={addBtn}>Add to Cart</button>
                        </div>
                    </div>
                ))}
            </main>

            {/* 📱 Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
};

// --- आधुनिक इनलाइन स्टाइलिंग (कार्ड्स के लिए) ---
const cardStyle = { background:'#fff', borderRadius:'8px', overflow:'hidden', border:'1px solid #e2e8f0', display:'flex', flexDirection:'column' };
const imgContainer = { height:'150px', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'60px' };
const pName = { fontSize:'14px', fontWeight:'500', height:'35px', overflow:'hidden' };
const pPrice = { fontSize:'16px', fontWeight:'900', color:'#212121' };
const pOldPrice = { fontSize:'12px', color:'#878787', textDecoration:'line-through' };
const addBtn = { width:'100%', marginTop:'10px', padding:'8px', background:'#fb641b', color:'#fff', border:'none', borderRadius:'4px', fontWeight:'bold', cursor:'pointer' };

export default CustomerApp;