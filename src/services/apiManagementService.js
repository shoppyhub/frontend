import api from './api';

// ========================================
// API REGISTRY OPERATIONS
// ========================================
export const getAPIRegistry = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.status) params.append('status', filters.status);
  if (filters.provider) params.append('provider', filters.provider);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  return api.get(`/admin/api-registry/all?${params.toString()}`);
};

export const getAPIById = (apiId) => {
  return api.get(`/admin/api-registry/${apiId}`);
};

export const createAPI = (apiData) => {
  return api.post('/admin/api-registry/create', apiData);
};

export const updateAPI = (apiId, apiData) => {
  return api.put(`/admin/api-registry/${apiId}`, apiData);
};

export const deleteAPI = (apiId) => {
  return api.delete(`/admin/api-registry/${apiId}`);
};

export const toggleAPIStatus = (apiId) => {
  return api.patch(`/admin/api-registry/toggle/${apiId}`);
};

export const testAPIConnection = (apiId) => {
  return api.post(`/admin/api-registry/test/${apiId}`);
};

export const getAPIUsageStats = (apiId, days = 7) => {
  return api.get(`/admin/api-registry/${apiId}/stats?days=${days}`);
};

export const getTopErrors = (apiId) => {
  return api.get(`/admin/api-registry/${apiId}/errors`);
};

export const duplicateAPI = (sourceApiId, newName) => {
  return api.post(`/admin/api-registry/duplicate/${sourceApiId}`, { name: newName });
};

// ========================================
// API USAGE & ANALYTICS
// ========================================
export const getUsageLogs = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.api_id) params.append('api_id', filters.api_id);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  if (filters.status_code) params.append('status_code', filters.status_code);
  if (filters.error_only) params.append('error_only', filters.error_only);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  return api.get(`/admin/api-usage/logs?${params.toString()}`);
};

export const getAnalytics = (apiId = null, days = 7) => {
  const params = new URLSearchParams();
  if (apiId) params.append('api_id', apiId);
  params.append('days', days);

  return api.get(`/admin/api-usage/analytics?${params.toString()}`);
};

export const getAPIComparison = (apiIds, days = 7) => {
  return api.get(`/admin/api-usage/comparison?api_ids=${apiIds}&days=${days}`);
};

export const exportUsageLogs = (filters = {}, format = 'csv') => {
  const params = new URLSearchParams();
  if (filters.api_id) params.append('api_id', filters.api_id);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  params.append('format', format);

  return api.get(`/admin/api-usage/export?${params.toString()}`);
};

export const getErrorAnalysis = (days = 7) => {
  return api.get(`/admin/api-usage/errors?days=${days}`);
};

export const getDailyTrends = (apiId = null, days = 30) => {
  const params = new URLSearchParams();
  if (apiId) params.append('api_id', apiId);
  params.append('days', days);

  return api.get(`/admin/api-usage/trends?${params.toString()}`);
};

// ========================================
// API HEALTH & MONITORING
// ========================================
export const getAllHealthStatus = (status = null) => {
  let query = '';
  if (status) query = `?status=${status}`;
  return api.get(`/admin/api-health/all${query}`);
};

export const getHealthHistory = (apiId, days = 7) => {
  return api.get(`/admin/api-health/history?api_id=${apiId}&days=${days}`);
};

export const triggerHealthCheck = (apiId) => {
  return api.post(`/admin/api-health/check/${apiId}`);
};

export const getIncidents = (apiId = null, limit = 50) => {
  let query = `?limit=${limit}`;
  if (apiId) query += `&api_id=${apiId}`;
  return api.get(`/admin/api-health/incidents${query}`);
};

export const configureHealthCheckInterval = (apiId, intervalMinutes, enabled = true) => {
  return api.put('/admin/api-health/check-interval', {
    api_id: apiId,
    interval_minutes: intervalMinutes,
    enabled
  });
};

export const getHealthSummary = () => {
  return api.get('/admin/api-health/summary');
};

export default {
  // Registry
  getAPIRegistry,
  getAPIById,
  createAPI,
  updateAPI,
  deleteAPI,
  toggleAPIStatus,
  testAPIConnection,
  getAPIUsageStats,
  getTopErrors,
  duplicateAPI,

  // Analytics
  getUsageLogs,
  getAnalytics,
  getAPIComparison,
  exportUsageLogs,
  getErrorAnalysis,
  getDailyTrends,

  // Health
  getAllHealthStatus,
  getHealthHistory,
  triggerHealthCheck,
  getIncidents,
  configureHealthCheckInterval,
  getHealthSummary
};
