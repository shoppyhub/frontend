import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HomeBannerCarousel.css';

const HomeBannerCarousel = ({ position = 'Home Page Top', onBannersLoaded }) => {
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [autoPlay, setAutoPlay] = useState(true);

    useEffect(() => {
        fetchBanners();
    }, [position]);

    useEffect(() => {
        if (!autoPlay || banners.length === 0) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000); // Change banner every 5 seconds

        return () => clearInterval(timer);
    }, [autoPlay, banners.length]);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/system-admin/banners-active', {
                params: { position, audience: 'All' }
            });
            const activeBanners = response.data.data || [];
            setBanners(activeBanners);
            setCurrentIndex(0);
            if (onBannersLoaded) onBannersLoaded(activeBanners.length);
        } catch (error) {
            console.error('Error fetching banners:', error);
            if (onBannersLoaded) onBannersLoaded(0);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
        setAutoPlay(false);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
        setAutoPlay(false);
    };

    const handleDotClick = (index) => {
        setCurrentIndex(index);
        setAutoPlay(false);
    };

    const handleBannerClick = (banner) => {
        if (banner.redirectUrl) {
            window.location.href = banner.redirectUrl;
        }
    };

    const recordImpression = async (bannerId) => {
        try {
            await axios.post('/api/system-admin/banners-track-impression', {
                bannerId
            });
        } catch (error) {
            console.error('Error recording impression:', error);
        }
    };

    const recordClick = async (bannerId) => {
        try {
            await axios.post('/api/system-admin/banners-track-click', {
                bannerId
            });
        } catch (error) {
            console.error('Error recording click:', error);
        }
    };

    if (loading) {
        return <div className="banner-carousel loading">Loading...</div>;
    }

    if (banners.length === 0) {
        return null;
    }

    const currentBanner = banners[currentIndex];

    return (
        <div className="banner-carousel">
            <div className="carousel-container">
                <div
                    className="carousel-slide"
                    onClick={() => {
                        handleBannerClick(currentBanner);
                        recordClick(currentBanner._id);
                    }}
                    onMouseEnter={() => setAutoPlay(false)}
                    onMouseLeave={() => setAutoPlay(true)}
                >
                    <img
                        src={currentBanner.imageUrl}
                        alt={currentBanner.altText || currentBanner.title}
                        onLoad={() => recordImpression(currentBanner._id)}
                        onError={(e) => {
                            const fallback = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400"><rect width="100%" height="100%" fill="%23f8fafc"/></svg>';
                            if (e?.target) e.target.src = fallback;
                        }}
                    />
                    
                    {currentBanner.priority === 'High' || currentBanner.priority === 'Critical' && (
                        <div className={`priority-badge ${currentBanner.priority.toLowerCase()}`}>
                            {currentBanner.priority === 'Critical' && '🔥 जरूरी'}
                            {currentBanner.priority === 'High' && '⚡ महत्वपूर्ण'}
                        </div>
                    )}

                    <div className="banner-overlay">
                        <h2>{currentBanner.title}</h2>
                        {currentBanner.category && (
                            <span className="banner-category">{currentBanner.category}</span>
                        )}
                    </div>
                </div>

                {/* Navigation Arrows */}
                {banners.length > 1 && (
                    <>
                        <button
                            className="carousel-arrow prev"
                            onClick={handlePrevious}
                            aria-label="Previous banner"
                        >
                            ❮
                        </button>
                        <button
                            className="carousel-arrow next"
                            onClick={handleNext}
                            aria-label="Next banner"
                        >
                            ❯
                        </button>
                    </>
                )}
            </div>

            {/* Carousel Indicators */}
            {banners.length > 1 && (
                <div className="carousel-indicators">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            className={`indicator ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => handleDotClick(index)}
                            aria-label={`Banner ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Auto-play Toggle */}
            <div className="carousel-controls">
                <button
                    className={`control-btn ${autoPlay ? 'playing' : 'paused'}`}
                    onClick={() => setAutoPlay(!autoPlay)}
                >
                    {autoPlay ? '⏸️ Pause' : '▶️ Play'}
                </button>
                <span className="counter">{currentIndex + 1} / {banners.length}</span>
            </div>
        </div>
    );
};

// Banner Grid Component - Display multiple banners at once
export const HomeBannerGrid = ({ position = 'Home Page Middle' }) => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBanners();
    }, [position]);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/system-admin/banners-active', {
                params: { position }
            });
            setBanners(response.data.data?.slice(0, 6) || []);
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="banner-grid loading">Loading...</div>;
    }

    if (banners.length === 0) {
        return null;
    }

    return (
        <div className="banner-grid">
            {banners.map((banner) => (
                <div
                    key={banner._id}
                    className="banner-grid-item"
                    onClick={() => {
                        if (banner.redirectUrl) {
                            window.location.href = banner.redirectUrl;
                        }
                    }}
                >
                    <div className="grid-image-wrapper">
                        <img
                            src={banner.imageUrl}
                            alt={banner.altText || banner.title}
                            onError={(e) => {
                                const fallback = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="100%" height="100%" fill="%23f8fafc"/></svg>';
                                if (e?.target) e.target.src = fallback;
                            }}
                        />
                    </div>
                    <div className="grid-info">
                        <h3>{banner.title}</h3>
                        <p className="category">{banner.category}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HomeBannerCarousel;
