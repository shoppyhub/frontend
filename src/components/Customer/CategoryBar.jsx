import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useBranding } from '../../context/BrandingContext';

const CategoryBar = ({ onCategorySelect, activeCategory }) => {
    const { settings } = useBranding();
    const [categories, setCategories] = useState([{ name: 'All', icon: '🛍️' }]);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/admin/directories/shop-types');
                if (res.data.success) {
                    const dynamicCats = res.data.data.map(cat => ({
                        name: cat.name,
                        icon: cat.icon || '📦'
                    }));
                    setCategories([{ name: 'All', icon: '🛍️' }, ...dynamicCats]);
                }
            } catch (err) {
                console.error("Category Bar Error:", err);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryClick = (catName) => {
        if (typeof onCategorySelect === 'function') {
            onCategorySelect(catName);
        }
    };

    const themeColor = settings?.themeColor || '#0f172a';

    return (
        <nav className="rkd-category-nav">
            <div className="category-scroll-container">
                {categories.map((cat, i) => (
                    <div 
                        key={i} 
                        className={`category-pill ${activeCategory === cat.name ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(cat.name)}
                    >
                        <span className="cat-icon">{cat.icon}</span>
                        <span className="cat-text">{cat.name}</span>
                    </div>
                ))}
            </div>

            <style>{`
                .rkd-category-nav {
                    background: #ffffff;
                    border-bottom: 1px solid #f1f5f9;
                    position: fixed;
                    
                    /* डेस्कटॉप अलाइनमेंट - Variables का उपयोग */
                    top: ${scrolled ? '58px' : 'var(--header-height)'}; 
                    
                    left: 0;
                    right: 0;
                    z-index: 8000; 
                    width: 100%;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                    transition: all 0.3s ease;
                    
                    /* हेडर के साथ चिपकने के लिए -1px का उपयोग */
                    margin-top: -1px; 
                }

                .category-scroll-container {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 0 15px;
                    height: 54px;
                    max-width: 1400px;
                    margin: 0 auto;
                    overflow-x: auto;
                    scrollbar-width: none;
                    -webkit-overflow-scrolling: touch;
                }

                .category-scroll-container::-webkit-scrollbar { display: none; }

                .category-pill {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 7px 15px;
                    cursor: pointer;
                    white-space: nowrap;
                    border-radius: 100px;
                    transition: all 0.2s ease;
                    color: #64748b;
                    background: #f8fafc;
                    border: 1px solid transparent;
                    user-select: none;
                }

                .category-pill.active {
                    background: ${themeColor}08;
                    color: ${themeColor};
                    border: 1px solid ${themeColor}20;
                    font-weight: 700;
                }

                .cat-icon { font-size: 16px; }
                .cat-text { font-size: 13px; font-weight: 600; }

                /* --- मोबाइल रिस्पॉन्सिव फिक्स --- */
                @media (max-width: 1024px) {
                    .rkd-category-nav {
                        /* मोबाइल हेडर के अनुसार डायनामिक टॉप */
                        top: ${scrolled ? '102px' : 'var(--header-height-mobile)'};
                    }
                    .category-scroll-container {
                        height: 48px;
                        gap: 8px;
                    }
                    .category-pill {
                        padding: 6px 12px;
                    }
                    .cat-text { font-size: 12px; }
                }

                /* छोटे मोबाइल के लिए सर्च बार की वजह से और टाइट फिटिंग */
                @media (max-width: 480px) {
                    .rkd-category-nav {
                        top: ${scrolled ? '106px' : '114px'};
                    }
                }
            `}</style>
        </nav>
    );
};

export default CategoryBar;