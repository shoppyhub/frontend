import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BannerManagement.css';

const BannerManagement = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [filteredBanners, setFilteredBanners] = useState([]);
    const [filters, setFilters] = useState({
        position: 'all',
        status: 'all',
        audience: 'all',
        search: ''
    });
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [banners, filters]);

    const fetchBanners = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get('/api/system-admin/banners', {
                params: {
                    page,
                    limit: 20,
                    position: filters.position !== 'all' ? filters.position : undefined,
                    status: filters.status !== 'all' ? filters.status : undefined,
                    audience: filters.audience !== 'all' ? filters.audience : undefined,
                    search: filters.search || undefined,
                    sortBy: '-createdAt'
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setBanners(response.data.data || []);
        } catch (error) {
            console.error('Error fetching banners:', error);
            alert('Failed to fetch banners: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = banners;

        if (filters.position !== 'all') {
            filtered = filtered.filter(b => b.position === filters.position);
        }

        if (filters.status !== 'all') {
            filtered = filtered.filter(b => b.status === filters.status);
        }

        if (filters.audience !== 'all') {
            filtered = filtered.filter(b => b.targetAudience === filters.audience);
        }

        if (filters.search) {
            filtered = filtered.filter(b =>
                b.title.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        setFilteredBanners(filtered);
    };

    const handleToggleStatus = async (bannerId, currentStatus) => {
        try {
            await axios.patch(`/api/system-admin/banners/${bannerId}/status`, {
                isActive: !currentStatus
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchBanners();
            alert('Banner status updated successfully');
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (bannerId) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                await axios.delete(`/api/system-admin/banners/${bannerId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                fetchBanners();
                alert('Banner deleted successfully');
            } catch (error) {
                console.error('Error deleting banner:', error);
                alert('Failed to delete banner: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleApprove = async (bannerId) => {
        try {
            await axios.post(`/api/system-admin/banners/${bannerId}/approve`, {
                isApprove: true
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchBanners();
            alert('Banner approved successfully');
        } catch (error) {
            console.error('Error approving banner:', error);
            alert('Failed to approve banner: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleBulkAction = async (action) => {
        const selectedIds = banners
            .filter(b => b.selected)
            .map(b => b._id);

        if (selectedIds.length === 0) {
            alert('Please select at least one banner');
            return;
        }

        try {
            await axios.post('/api/system-admin/banners-bulk-update', {
                bannerIds: selectedIds,
                action: action
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchBanners();
            alert(`${action} completed successfully`);
        } catch (error) {
            console.error('Error in bulk action:', error);
            alert('Bulk action failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const fetchAnalytics = async (bannerId) => {
        try {
            const response = await axios.get('/api/system-admin/banners-analytics', {
                params: { bannerId },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setAnalytics(response.data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            alert('Failed to fetch analytics');
        }
    };

    const handleSelectBanner = (id) => {
        setBanners(banners.map(b =>
            b._id === id ? { ...b, selected: !b.selected } : b
        ));
    };

    const positions = ['Home Page Top', 'Home Page Middle', 'Home Page Bottom', 'Product Page', 'Checkout Page'];
    const audiences = ['All', 'Customer', 'ShopOwner', 'NewCustomers', 'PremiumCustomers'];
    const statuses = ['Draft', 'Scheduled', 'Active', 'Inactive'];

    return (
        <div className="banner-management">
            <div className="banner-header">
                <h2>🖼️ Banner Management</h2>
                <button
                    className="btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    ➕ Add New Banner
                </button>
            </div>

            {/* Filters */}
            <div className="banner-filters">
                <select
                    value={filters.position}
                    onChange={(e) => setFilters({ ...filters, position: e.target.value })}
                >
                    <option value="all">All Positions</option>
                    {positions.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                    ))}
                </select>

                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                    <option value="all">All Status</option>
                    {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>

                <select
                    value={filters.audience}
                    onChange={(e) => setFilters({ ...filters, audience: e.target.value })}
                >
                    <option value="all">All Audiences</option>
                    {audiences.map(aud => (
                        <option key={aud} value={aud}>{aud}</option>
                    ))}
                </select>

                <input
                    type="text"
                    placeholder="Search banners..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
            </div>

            {/* Bulk Actions */}
            {banners.some(b => b.selected) && (
                <div className="bulk-actions">
                    <button onClick={() => handleBulkAction('activate')}>✓ Activate</button>
                    <button onClick={() => handleBulkAction('deactivate')}>✗ Deactivate</button>
                    <button onClick={() => handleBulkAction('reorder')}>↕️ Reorder</button>
                    <button onClick={() => handleBulkAction('delete')} className="btn-danger">🗑️ Delete</button>
                </div>
            )}

            {/* Banners List */}
            {loading ? (
                <div className="loading">Loading...</div>
            ) : filteredBanners.length === 0 ? (
                <div className="no-data">No banners found</div>
            ) : (
                <div className="banners-grid">
                    {filteredBanners.map(banner => (
                        <div key={banner._id} className={`banner-card ${banner.status.toLowerCase()}`}>
                            <div className="banner-select">
                                <input
                                    type="checkbox"
                                    checked={banner.selected || false}
                                    onChange={() => handleSelectBanner(banner._id)}
                                />
                            </div>

                            <div className="banner-image">
                                <img src={banner.imageUrl} alt={banner.title} />
                                <span className={`status-badge ${banner.status.toLowerCase()}`}>
                                    {banner.status}
                                </span>
                            </div>

                            <div className="banner-info">
                                <h3>{banner.title}</h3>
                                <p className="position">📍 Position: {banner.position}</p>
                                <p className="audience">👥 Audience: {banner.targetAudience}</p>
                                <div className="analytics-info">
                                    <span>👁️ {banner.impressions}</span>
                                    <span>🖱️ {banner.clicks}</span>
                                    <span>📊 {banner.ctr || '0.00'}%</span>
                                </div>
                            </div>

                            <div className="banner-actions">
                                {banner.status === 'Draft' && (
                                    <button
                                        className="btn-success"
                                        onClick={() => handleApprove(banner._id)}
                                        title="Approve Banner"
                                    >
                                        ✓ Approve
                                    </button>
                                )}

                                <button
                                    className={banner.isActive ? 'btn-warning' : 'btn-info'}
                                    onClick={() => handleToggleStatus(banner._id, banner.isActive)}
                                >
                                    {banner.isActive ? '🔴 Deactivate' : '🟢 Activate'}
                                </button>

                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        setSelectedBanner(banner);
                                        setShowCreateModal(true);
                                    }}
                                    title="Edit Banner"
                                >
                                    ✎️ Edit
                                </button>

                                <button
                                    className="btn-info"
                                    onClick={() => fetchAnalytics(banner._id)}
                                    title="View Analytics"
                                >
                                    📊 Analytics
                                </button>

                                <button
                                    className="btn-danger"
                                    onClick={() => handleDelete(banner._id)}
                                    title="Delete"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Analytics Modal */}
            {analytics && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>📊 Banner Analytics</h3>
                        <div className="analytics-details">
                            <p><strong>Title:</strong> {analytics.title}</p>
                            <p><strong>Position:</strong> {analytics.position}</p>
                            <p><strong>Impressions:</strong> {analytics.impressions}</p>
                            <p><strong>Clicks:</strong> {analytics.clicks}</p>
                            <p><strong>CTR:</strong> {analytics.ctr}</p>
                        </div>
                        <button onClick={() => setAnalytics(null)}>Close</button>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <BannerForm
                    banner={selectedBanner}
                    onClose={() => {
                        setShowCreateModal(false);
                        setSelectedBanner(null);
                    }}
                    onSave={() => {
                        fetchBanners();
                        setShowCreateModal(false);
                        setSelectedBanner(null);
                    }}
                />
            )}
        </div>
    );
};

// Banner Form Component
const BannerForm = ({ banner, onClose, onSave }) => {
    const [formData, setFormData] = useState(banner || {
        title: '',
        description: '',
        imageUrl: '',
        redirectUrl: '',
        position: 'Home Page Top',
        targetAudience: 'All',
        priority: 'Normal',
        category: 'Promotion',
        tags: [],
        altText: '',
        isScheduled: false,
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData({ ...formData, imageUrl: event.target.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.title || formData.title.trim() === '') {
            alert('Please enter a banner title');
            return;
        }
        
        if (!formData.imageUrl) {
            alert('Please upload a banner image');
            return;
        }

        if (formData.isScheduled) {
            if (!formData.startDate || !formData.endDate) {
                alert('Please set both start and end dates for scheduled banners');
                return;
            }
            if (new Date(formData.endDate) <= new Date(formData.startDate)) {
                alert('End date must be after start date');
                return;
            }
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            };
            
            const dataToSend = {
                title: formData.title.trim(),
                description: formData.description?.trim() || '',
                imageUrl: formData.imageUrl,
                redirectUrl: formData.redirectUrl || '',
                position: formData.position,
                targetAudience: formData.targetAudience,
                priority: formData.priority,
                category: formData.category,
                altText: formData.title,
                tags: formData.tags || [],
                isScheduled: formData.isScheduled,
                startDate: formData.startDate,
                endDate: formData.endDate || null
            };

            if (banner?._id) {
                // Update
                await axios.put(`/api/system-admin/banners/${banner._id}`, dataToSend, config);
                alert('Banner updated successfully. Please wait for approval.');
            } else {
                // Create
                await axios.post('/api/system-admin/banners/create', dataToSend, config);
                alert('Banner created successfully. Please wait for system admin approval.');
            }
            onSave();
        } catch (error) {
            console.error('Error saving banner:', error);
            console.log('Error response:', error.response);
            const errorMsg = error.response?.data?.message || error.message || 'Unknown error occurred';
            alert('Failed to save banner: ' + errorMsg);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-large">
                <div className="modal-header">
                    <h2>{banner ? '🔍 Edit Banner' : '➕ Create New Banner'}</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="banner-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Banner Image *</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {formData.imageUrl && (
                                <div className="image-preview">
                                    <img src={formData.imageUrl} alt="Preview" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Position</label>
                            <select
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            >
                                <option>Home Page Top</option>
                                <option>Home Page Middle</option>
                                <option>Home Page Bottom</option>
                                <option>Product Page</option>
                                <option>Checkout Page</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Target Audience</label>
                            <select
                                value={formData.targetAudience}
                                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                            >
                                <option>All</option>
                                <option>Customer</option>
                                <option>ShopOwner</option>
                                <option>NewCustomers</option>
                                <option>PremiumCustomers</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option>Low</option>
                                <option>Normal</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option>Promotion</option>
                                <option>Announcement</option>
                                <option>Event</option>
                                <option>Educational</option>
                                <option>Urgent</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Alt Text (for SEO)</label>
                            <input
                                type="text"
                                value={formData.altText}
                                onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                                placeholder="Describe the banner image"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Redirect URL</label>
                            <input
                                type="url"
                                value={formData.redirectUrl}
                                onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group checkbox">
                            <input
                                type="checkbox"
                                checked={formData.isScheduled}
                                onChange={(e) => setFormData({ ...formData, isScheduled: e.target.checked })}
                                id="scheduled"
                            />
                            <label htmlFor="scheduled">Schedule Banner</label>
                        </div>
                    </div>

                    {formData.isScheduled && (
                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            💾 Save Banner
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BannerManagement;
