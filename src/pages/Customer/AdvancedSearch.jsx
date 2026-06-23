import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useCustomer } from '../../context/CustomerContext';
import { useBranding } from '../../context/BrandingContext';

const AdvancedSearch = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToCart } = useCustomer();
    const { settings } = useBranding();
    const themeColor = settings?.themeColor || '#0f172a';

    // Search states
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'All');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'relevance');
    const [inStock, setInStock] = useState(searchParams.get('inStock') !== 'false');
    const [rating, setRating] = useState(searchParams.get('rating') || '');

    // Results states
    const [products, setProducts] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalResults, setTotalResults] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });

    // Fetch search results
    const performSearch = useCallback(async (page = 1) => {
        if (!query.trim() && category === 'All') {
            toast.warning('Please enter a search term or select a category');
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                query: query.trim(),
                category,
                sortBy,
                inStock: inStock.toString()
            });

            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            if (rating) params.append('rating', rating);
            if (searchParams.get('pinCode')) {
                params.append('pinCode', searchParams.get('pinCode'));
            }

            const response = await api.get(`/api/search/products?${params}`);

            if (response.data?.success) {
                setProducts(response.data.data.products);
                setCategories(response.data.data.filters.categories);
                setTotalResults(response.data.data.pagination.totalItems);
                setTotalPages(response.data.data.pagination.totalPages);
                setCurrentPage(response.data.data.pagination.currentPage);
                
                // Update price range
                if (response.data.data.filters.priceRange) {
                    setPriceRange({
                        min: response.data.data.filters.priceRange.min?.price || 0,
                        max: response.data.data.filters.priceRange.max?.price || 10000
                    });
                }

                // Update URL
                setSearchParams(params);
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [query, category, minPrice, maxPrice, sortBy, inStock, rating, searchParams, setSearchParams]);

    // Get search suggestions
    const getSuggestions = useCallback(async (searchQuery) => {
        if (searchQuery.length < 2) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await api.get(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
            if (response.data?.success) {
                setSuggestions(response.data.data);
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error('Suggestions error:', error);
        }
    }, []);

    // Handle search input
    const handleSearchInput = (value) => {
        setQuery(value);
        getSuggestions(value);
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        if (suggestion.type === 'product') {
            setQuery(suggestion.suggestion);
        } else {
            setCategory(suggestion.suggestion);
        }
        setShowSuggestions(false);
    };

    // Handle search submit
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        performSearch(1);
    };

    // Handle filter change
    const handleFilterChange = () => {
        setCurrentPage(1);
        performSearch(1);
    };

    // Handle pagination
    const handlePageChange = (page) => {
        setCurrentPage(page);
        performSearch(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Add to cart
    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        addToCart({
            ...product,
            shopId: product.shopId?._id || product.shopId
        });
    };

    // Navigate to product detail
    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    // Initial search
    useEffect(() => {
        if (query || category !== 'All') {
            performSearch(currentPage);
        }
    }, []);

    return (
        <div style={containerStyle}>
            {/* Search Header */}
            <div style={searchHeaderStyle}>
                <h1 style={titleStyle}>🔍 Advanced Search</h1>
                <p style={subtitleStyle}>Find exactly what you're looking for</p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} style={searchFormStyle}>
                <div style={searchInputContainerStyle}>
                    <div style={searchInputWrapperStyle}>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="Search for products, brands, categories..."
                            style={searchInputStyle}
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <div style={suggestionsContainerStyle}>
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        style={suggestionItemStyle}
                                    >
                                        <span style={suggestionIconStyle}>
                                            {suggestion.type === 'product' ? '🛍️' : '🏷️'}
                                        </span>
                                        <div>
                                            <div style={suggestionTextStyle}>{suggestion.suggestion}</div>
                                            {suggestion.category && (
                                                <div style={suggestionCategoryStyle}>{suggestion.category}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button type="submit" style={searchBtnStyle}>
                        🔍 Search
                    </button>
                </div>

                {/* Filters */}
                <div style={filtersContainerStyle}>
                    <div style={filterGroupStyle}>
                        <label style={labelStyle}>Category</label>
                        <select
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                handleFilterChange();
                            }}
                            style={selectStyle}
                        >
                            <option value="All">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div style={filterGroupStyle}>
                        <label style={labelStyle}>Min Price</label>
                        <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => {
                                setMinPrice(e.target.value);
                                handleFilterChange();
                            }}
                            placeholder="0"
                            min="0"
                            max={maxPrice || priceRange.max}
                            style={inputStyle}
                        />
                    </div>

                    <div style={filterGroupStyle}>
                        <label style={labelStyle}>Max Price</label>
                        <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => {
                                setMaxPrice(e.target.value);
                                handleFilterChange();
                            }}
                            placeholder={priceRange.max.toString()}
                            min={minPrice || 0}
                            style={inputStyle}
                        />
                    </div>

                    <div style={filterGroupStyle}>
                        <label style={labelStyle}>Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                handleFilterChange();
                            }}
                            style={selectStyle}
                        >
                            <option value="relevance">Most Relevant</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="newest">Newest First</option>
                            <option value="rating">Highest Rated</option>
                            <option value="popularity">Most Popular</option>
                        </select>
                    </div>

                    <div style={filterGroupStyle}>
                        <label style={checkboxLabelStyle}>
                            <input
                                type="checkbox"
                                checked={inStock}
                                onChange={(e) => {
                                    setInStock(e.target.checked);
                                    handleFilterChange();
                                }}
                                style={checkboxStyle}
                            />
                            In Stock Only
                        </label>
                    </div>
                </div>
            </form>

            {/* Results Header */}
            <div style={resultsHeaderStyle}>
                <div>
                    <h2 style={resultsTitleStyle}>
                        {totalResults} Results found
                        {query && <span style={queryHighlightStyle}> for "{query}"</span>}
                    </h2>
                    {category !== 'All' && (
                        <p style={categoryFilterStyle}>Category: {category}</p>
                    )}
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div style={loaderStyle}>
                    <div className="spinner" style={{ borderTopColor: themeColor }}></div>
                    <p>Searching products...</p>
                </div>
            )}

            {/* Search Results */}
            {!loading && (
                <div style={resultsContainerStyle}>
                    {products.length === 0 ? (
                        <div style={noResultsStyle}>
                            <div style={noResultsIconStyle}>🔍</div>
                            <h3 style={noResultsTitleStyle}>No products found</h3>
                            <p style={noResultsTextStyle}>
                                Try adjusting your filters or search terms
                            </p>
                        </div>
                    ) : (
                        <div style={productsGridStyle}>
                            {products.map(product => (
                                <div
                                    key={product._id}
                                    onClick={() => handleProductClick(product._id)}
                                    style={productCardStyle}
                                >
                                    <div style={productImageContainerStyle}>
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            style={productImageStyle}
                                        />
                                        {product.stock <= 5 && (
                                            <span style={lowStockBadgeStyle}>
                                                Only {product.stock} left!
                                            </span>
                                        )}
                                    </div>
                                    <div style={productContentStyle}>
                                        <h3 style={productNameStyle}>{product.name}</h3>
                                        <p style={productCategoryStyle}>{product.category}</p>
                                        <div style={productPriceContainerStyle}>
                                            <span style={productPriceStyle}>₹{product.price}</span>
                                            <span style={productUnitStyle}>/{product.unit}</span>
                                        </div>
                                        <button
                                            onClick={(e) => handleAddToCart(e, product)}
                                            style={addToCartBtnStyle}
                                        >
                                            🛒 Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div style={paginationContainerStyle}>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={paginationBtnStyle}
                    >
                        ← Previous
                    </button>
                    
                    <div style={pageNumbersStyle}>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    style={{
                                        ...pageBtnStyle,
                                        backgroundColor: currentPage === pageNum ? themeColor : '#fff',
                                        color: currentPage === pageNum ? '#fff' : '#64748b'
                                    }}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={paginationBtnStyle}
                    >
                        Next →
                    </button>
                </div>
            )}

            <style>{`
                .spinner { 
                    width: 40px; height: 40px; border: 4px solid #f1f5f9; 
                    border-radius: 50%; animation: spin 1s linear infinite; 
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

// Styles
const containerStyle = {
    padding: '20px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
};

const searchHeaderStyle = {
    textAlign: 'center',
    marginBottom: '40px'
};

const titleStyle = {
    fontSize: '32px',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 10px 0',
    letterSpacing: '-0.5px'
};

const subtitleStyle = {
    fontSize: '16px',
    color: '#64748b',
    margin: 0,
    fontWeight: '500'
};

const searchFormStyle = {
    background: '#fff',
    padding: '30px',
    borderRadius: '20px',
    border: '1px solid #f1f5f9',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
};

const searchInputContainerStyle = {
    display: 'flex',
    gap: '15px',
    marginBottom: '25px'
};

const searchInputWrapperStyle = {
    flex: 1,
    position: 'relative'
};

const searchInputStyle = {
    width: '100%',
    padding: '15px 20px',
    borderRadius: '15px',
    border: '2px solid #e2e8f0',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'border-color 0.2s'
};

const suggestionsContainerStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    marginTop: '5px',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 1000,
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
};

const suggestionItemStyle = {
    padding: '12px 15px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    borderBottom: '1px solid #f8fafc'
};

const suggestionIconStyle = {
    fontSize: '18px'
};

const suggestionTextStyle = {
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '2px'
};

const suggestionCategoryStyle = {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '500'
};

const searchBtnStyle = {
    padding: '15px 30px',
    borderRadius: '15px',
    border: 'none',
    background: '#10b981',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
};

const filtersContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px'
};

const filterGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
};

const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
};

const selectStyle = {
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
};

const inputStyle = {
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    fontWeight: '500'
};

const checkboxLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer'
};

const checkboxStyle = {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
};

const resultsHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '15px'
};

const resultsTitleStyle = {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
};

const queryHighlightStyle = {
    color: '#10b981',
    fontWeight: '600'
};

const categoryFilterStyle = {
    fontSize: '14px',
    color: '#64748b',
    margin: '5px 0 0 0',
    fontWeight: '500'
};

const loaderStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px',
    gap: '20px'
};

const resultsContainerStyle = {
    marginBottom: '40px'
};

const noResultsStyle = {
    textAlign: 'center',
    padding: '80px 20px',
    background: '#fff',
    borderRadius: '20px',
    border: '1px solid #f1f5f9'
};

const noResultsIconStyle = {
    fontSize: '60px',
    marginBottom: '20px'
};

const noResultsTitleStyle = {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 10px 0'
};

const noResultsTextStyle = {
    fontSize: '16px',
    color: '#64748b',
    margin: 0
};

const productsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '25px'
};

const productCardStyle = {
    background: '#fff',
    borderRadius: '20px',
    border: '1px solid #f1f5f9',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s'
};

const productImageContainerStyle = {
    position: 'relative',
    height: '200px',
    background: '#f8fafc',
    padding: '20px'
};

const productImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
};

const lowStockBadgeStyle = {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    background: '#fef2f2',
    color: '#ef4444',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700'
};

const productContentStyle = {
    padding: '20px'
};

const productNameStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0',
    lineHeight: '1.4'
};

const productCategoryStyle = {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '600',
    margin: '0 0 12px 0'
};

const productPriceContainerStyle = {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    marginBottom: '15px'
};

const productPriceStyle = {
    fontSize: '20px',
    fontWeight: '900',
    color: '#0f172a'
};

const productUnitStyle = {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '600'
};

const addToCartBtnStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    background: '#10b981',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
};

const paginationContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    padding: '30px 0'
};

const paginationBtnStyle = {
    padding: '10px 20px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
};

const pageNumbersStyle = {
    display: 'flex',
    gap: '8px'
};

const pageBtnStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
};

export default AdvancedSearch;
