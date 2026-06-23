import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';

const InventoryManagement = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { settings } = useBranding();
    const themeColor = settings?.themeColor || '#0f172a';

    // States
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalStock: 0,
        lowStockItems: 0,
        outOfStock: 0,
        totalValue: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('createdAt');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categories, setCategories] = useState([]);
    const [showBulkUpdate, setShowBulkUpdate] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [stockUpdateModal, setStockUpdateModal] = useState({
        isOpen: false,
        product: null,
        operation: 'set',
        stock: 0
    });

    // Fetch inventory data
    const fetchInventory = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/inventory/shop/${user.id}`, {
                params: {
                    page: currentPage,
                    limit: 50,
                    category: selectedCategory,
                    search: searchTerm,
                    sortBy
                }
            });

            if (response.data?.success) {
                setProducts(response.data.data.products);
                setStats(response.data.data.stats);
                setCategories(response.data.data.categories);
                setTotalPages(response.data.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Fetch inventory error:', error);
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    }, [user.id, currentPage, selectedCategory, searchTerm, sortBy]);

    // Initialize socket connection for real-time updates
    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');
        
        // Join shop room for real-time updates
        socket.emit('join_shop', user.id);
        
        // Listen for stock updates
        socket.on('stock_updated', (data) => {
            setProducts(prev => prev.map(product => 
                product._id === data.productId 
                    ? { ...product, stock: data.newStock }
                    : product
            ));
            
            toast.info(`${data.productName} stock updated to ${data.newStock}`);
        });

        // Listen for low stock alerts
        socket.on('low_stock_alert', (data) => {
            toast.warning(`⚠️ Low Stock Alert: ${data.productName} (${data.currentStock} left)`);
        });

        return () => {
            socket.disconnect();
        };
    }, [user.id]);

    // Initial data load
    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    // Handle stock update
    const handleStockUpdate = async (productId, operation, stock) => {
        try {
            const response = await api.put(`/api/inventory/stock/${productId}`, {
                operation,
                stock
            });

            if (response.data?.success) {
                toast.success('Stock updated successfully');
                fetchInventory(); // Refresh data
            }
        } catch (error) {
            console.error('Stock update error:', error);
            toast.error('Failed to update stock');
        }
    };

    // Handle bulk stock update
    const handleBulkUpdate = async () => {
        if (selectedProducts.length === 0) {
            toast.error('Please select products to update');
            return;
        }

        try {
            const response = await api.put('/api/inventory/bulk-update', {
                updates: selectedProducts.map(productId => ({
                    productId,
                    operation: 'set',
                    stock: 100 // Default bulk update value
                }))
            });

            if (response.data?.success) {
                toast.success('Bulk update completed');
                setSelectedProducts([]);
                setShowBulkUpdate(false);
                fetchInventory();
            }
        } catch (error) {
            console.error('Bulk update error:', error);
            toast.error('Failed to update bulk stock');
        }
    };

    // Toggle product selection
    const toggleProductSelection = (productId) => {
        setSelectedProducts(prev => 
            prev.includes(productId) 
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    // Open stock update modal
    const openStockModal = (product, operation = 'set') => {
        setStockUpdateModal({
            isOpen: true,
            product,
            operation,
            stock: product.stock
        });
    };

    // Close stock update modal
    const closeStockModal = () => {
        setStockUpdateModal({
            isOpen: false,
            product: null,
            operation: 'set',
            stock: 0
        });
    };

    // Apply stock update from modal
    const applyStockUpdate = () => {
        if (stockUpdateModal.product) {
            handleStockUpdate(
                stockUpdateModal.product._id,
                stockUpdateModal.operation,
                stockUpdateModal.stock
            );
            closeStockModal();
        }
    };

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <div>
                    <h2 style={titleStyle}>📦 Inventory Management</h2>
                    <p style={subtitleStyle}>Real-time stock tracking and management</p>
                </div>
                <div style={headerActionsStyle}>
                    <button 
                        onClick={() => setShowBulkUpdate(!showBulkUpdate)}
                        style={bulkBtnStyle}
                    >
                        🔄 Bulk Update
                    </button>
                    <button 
                        onClick={() => navigate('/shop-dashboard/add-product')}
                        style={addProductBtnStyle}
                    >
                        ➕ Add Product
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={statsGridStyle}>
                <StatCard 
                    title="Total Products" 
                    value={stats.totalProducts} 
                    icon="📦"
                    color={themeColor}
                />
                <StatCard 
                    title="Total Stock" 
                    value={stats.totalStock} 
                    icon="📊"
                    color="#10b981"
                />
                <StatCard 
                    title="Low Stock Items" 
                    value={stats.lowStockItems} 
                    icon="⚠️"
                    color="#f59e0b"
                />
                <StatCard 
                    title="Out of Stock" 
                    value={stats.outOfStock} 
                    icon="🚫"
                    color="#ef4444"
                />
            </div>

            {/* Filters and Search */}
            <div style={filterContainerStyle}>
                <div style={searchContainerStyle}>
                    <input
                        type="text"
                        placeholder="🔍 Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchInputStyle}
                    />
                </div>
                
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={filterSelectStyle}
                >
                    <option value="All">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={filterSelectStyle}
                >
                    <option value="createdAt">Latest</option>
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="stock">Stock Level</option>
                    <option value="lowStock">Low Stock</option>
                </select>
            </div>

            {/* Bulk Update Controls */}
            {showBulkUpdate && (
                <div style={bulkUpdateContainerStyle}>
                    <div style={bulkUpdateContentStyle}>
                        <span style={bulkUpdateTextStyle}>
                            {selectedProducts.length} products selected
                        </span>
                        <div style={bulkUpdateActionsStyle}>
                            <button 
                                onClick={() => setSelectedProducts([])}
                                style={clearSelectionBtnStyle}
                            >
                                Clear Selection
                            </button>
                            <button 
                                onClick={handleBulkUpdate}
                                style={applyBulkBtnStyle}
                            >
                                Apply +100 to Selected
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Products Table */}
            <div style={tableContainerStyle}>
                {loading ? (
                    <div style={loaderStyle}>
                        <div className="spinner" style={{ borderTopColor: themeColor }}></div>
                        <p>Loading inventory...</p>
                    </div>
                ) : (
                    <div style={tableWrapperStyle}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    {showBulkUpdate && (
                                        <th style={checkboxHeaderStyle}>
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.length === products.length}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedProducts(products.map(p => p._id));
                                                    } else {
                                                        setSelectedProducts([]);
                                                    }
                                                }}
                                                style={checkboxStyle}
                                            />
                                        </th>
                                    )}
                                    <th style={thStyle}>Product</th>
                                    <th style={thStyle}>Category</th>
                                    <th style={thStyle}>Price</th>
                                    <th style={thStyle}>Stock</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product._id} style={trStyle}>
                                        {showBulkUpdate && (
                                            <td style={tdStyle}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(product._id)}
                                                    onChange={() => toggleProductSelection(product._id)}
                                                    style={checkboxStyle}
                                                />
                                            </td>
                                        )}
                                        <td style={tdStyle}>
                                            <div style={productCellStyle}>
                                                <img 
                                                    src={product.imageUrl} 
                                                    alt={product.name}
                                                    style={productImageStyle}
                                                />
                                                <div>
                                                    <div style={productNameStyle}>{product.name}</div>
                                                    <div style={productUnitStyle}>{product.unit}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={categoryBadgeStyle}>{product.category}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={priceStyle}>₹{product.price}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={stockContainerStyle}>
                                                <span style={{
                                                    ...stockTextStyle,
                                                    color: product.stock <= 5 ? '#ef4444' : 
                                                           product.stock <= 10 ? '#f59e0b' : '#10b981'
                                                }}>
                                                    {product.stock}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                ...statusBadgeStyle,
                                                backgroundColor: product.stock === 0 ? '#ef4444' : 
                                                               product.stock <= 5 ? '#f59e0b' : '#10b981'
                                            }}>
                                                {product.stock === 0 ? 'Out of Stock' : 
                                                 product.stock <= 5 ? 'Low Stock' : 'In Stock'}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={actionsContainerStyle}>
                                                <button 
                                                    onClick={() => openStockModal(product, 'add')}
                                                    style={actionBtnStyle}
                                                    title="Add Stock"
                                                >
                                                    ➕
                                                </button>
                                                <button 
                                                    onClick={() => openStockModal(product, 'subtract')}
                                                    style={actionBtnStyle}
                                                    title="Remove Stock"
                                                >
                                                    ➖
                                                </button>
                                                <button 
                                                    onClick={() => openStockModal(product, 'set')}
                                                    style={actionBtnStyle}
                                                    title="Set Stock"
                                                >
                                                    ✏️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={paginationStyle}>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    style={paginationBtnStyle}
                                >
                                    Previous
                                </button>
                                <span style={paginationTextStyle}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    style={paginationBtnStyle}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Stock Update Modal */}
            {stockUpdateModal.isOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalStyle}>
                        <h3 style={modalTitleStyle}>
                            Update Stock: {stockUpdateModal.product?.name}
                        </h3>
                        <div style={modalContentStyle}>
                            <div style={modalFieldStyle}>
                                <label style={labelStyle}>Operation:</label>
                                <select
                                    value={stockUpdateModal.operation}
                                    onChange={(e) => setStockUpdateModal(prev => ({
                                        ...prev,
                                        operation: e.target.value
                                    }))}
                                    style={inputStyle}
                                >
                                    <option value="set">Set Stock</option>
                                    <option value="add">Add Stock</option>
                                    <option value="subtract">Remove Stock</option>
                                </select>
                            </div>
                            <div style={modalFieldStyle}>
                                <label style={labelStyle}>Stock Amount:</label>
                                <input
                                    type="number"
                                    value={stockUpdateModal.stock}
                                    onChange={(e) => setStockUpdateModal(prev => ({
                                        ...prev,
                                        stock: parseInt(e.target.value) || 0
                                    }))}
                                    style={inputStyle}
                                    min="0"
                                />
                            </div>
                        </div>
                        <div style={modalActionsStyle}>
                            <button 
                                onClick={closeStockModal}
                                style={cancelBtnStyle}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={applyStockUpdate}
                                style={confirmBtnStyle}
                            >
                                Update Stock
                            </button>
                        </div>
                    </div>
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

// Helper Components
const StatCard = ({ title, value, icon, color }) => (
    <div style={statCardStyle(color)}>
        <div style={statHeaderStyle}>
            <span style={statTitleStyle}>{title}</span>
            <span style={statIconStyle(color)}>{icon}</span>
        </div>
        <div style={statValueStyle}>{value.toLocaleString()}</div>
    </div>
);

// Styles
const containerStyle = {
    padding: '20px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px'
};

const titleStyle = {
    fontSize: '28px',
    fontWeight: '900',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.5px'
};

const subtitleStyle = {
    color: '#64748b',
    fontSize: '14px',
    margin: '5px 0 0 0',
    fontWeight: '500'
};

const headerActionsStyle = {
    display: 'flex',
    gap: '15px'
};

const bulkBtnStyle = {
    padding: '10px 20px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: '0.2s'
};

const addProductBtnStyle = {
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    background: '#10b981',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: '0.2s'
};

const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
};

const statCardStyle = (color) => ({
    background: '#fff',
    padding: '25px',
    borderRadius: '20px',
    border: '1px solid #f1f5f9',
    borderTop: `4px solid ${color}`,
    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
});

const statHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
};

const statTitleStyle = {
    fontSize: '12px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const statIconStyle = (color) => ({
    width: '35px',
    height: '35px',
    borderRadius: '10px',
    backgroundColor: `${color}15`,
    color: color,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '18px'
});

const statValueStyle = {
    fontSize: '24px',
    fontWeight: '900',
    color: '#0f172a'
};

const filterContainerStyle = {
    display: 'flex',
    gap: '15px',
    marginBottom: '25px',
    flexWrap: 'wrap'
};

const searchContainerStyle = {
    flex: 1,
    minWidth: '250px'
};

const searchInputStyle = {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    fontWeight: '500'
};

const filterSelectStyle = {
    padding: '12px 15px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    minWidth: '150px'
};

const bulkUpdateContainerStyle = {
    background: '#fff',
    padding: '15px 20px',
    borderRadius: '15px',
    border: '1px solid #f1f5f9',
    marginBottom: '25px'
};

const bulkUpdateContentStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const bulkUpdateTextStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b'
};

const bulkUpdateActionsStyle = {
    display: 'flex',
    gap: '10px'
};

const clearSelectionBtnStyle = {
    padding: '8px 15px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
};

const applyBulkBtnStyle = {
    padding: '8px 15px',
    borderRadius: '8px',
    border: 'none',
    background: '#10b981',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
};

const tableContainerStyle = {
    background: '#fff',
    borderRadius: '20px',
    border: '1px solid #f1f5f9',
    overflow: 'hidden'
};

const loaderStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px',
    gap: '20px'
};

const tableWrapperStyle = {
    overflowX: 'auto'
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px'
};

const thStyle = {
    textAlign: 'left',
    padding: '15px',
    borderBottom: '2px solid #f1f5f9',
    fontWeight: '700',
    color: '#64748b',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const checkboxHeaderStyle = {
    ...thStyle,
    width: '50px'
};

const checkboxStyle = {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
};

const trStyle = {
    borderBottom: '1px solid #f8fafc',
    transition: 'background-color 0.2s'
};

const tdStyle = {
    padding: '15px',
    fontWeight: '500',
    color: '#1e293b'
};

const productCellStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
};

const productImageStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    objectFit: 'cover'
};

const productNameStyle = {
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '2px'
};

const productUnitStyle = {
    fontSize: '12px',
    color: '#94a3b8'
};

const categoryBadgeStyle = {
    padding: '4px 8px',
    borderRadius: '6px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    fontSize: '11px',
    fontWeight: '600'
};

const priceStyle = {
    fontWeight: '700',
    color: '#0f172a'
};

const stockContainerStyle = {
    display: 'flex',
    alignItems: 'center'
};

const stockTextStyle = {
    fontWeight: '700',
    fontSize: '16px'
};

const statusBadgeStyle = {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#fff'
};

const actionsContainerStyle = {
    display: 'flex',
    gap: '5px'
};

const actionBtnStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    transition: 'background-color 0.2s'
};

const paginationStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    padding: '20px'
};

const paginationBtnStyle = {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: '0.2s'
};

const paginationTextStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b'
};

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
};

const modalStyle = {
    background: '#fff',
    padding: '30px',
    borderRadius: '20px',
    border: '1px solid #f1f5f9',
    minWidth: '400px',
    maxWidth: '90%'
};

const modalTitleStyle = {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 20px 0'
};

const modalContentStyle = {
    marginBottom: '25px'
};

const modalFieldStyle = {
    marginBottom: '15px'
};

const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '5px'
};

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    fontWeight: '500'
};

const modalActionsStyle = {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end'
};

const cancelBtnStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
};

const confirmBtnStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#10b981',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
};

export default InventoryManagement;
