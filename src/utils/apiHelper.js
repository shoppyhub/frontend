import api from '../../services/api';

export const ApiErrorHandler = {
    handle: (error, defaultMessage = 'An error occurred') => {
        if (error.response) {
            // Server responded with error status
            return {
                message: error.response.data?.message || error.response.statusText || defaultMessage,
                status: error.response.status,
                data: error.response.data
            };
        } else if (error.request) {
            // Request made but no response
            return {
                message: 'No response from server. Check your connection.',
                status: 0,
                data: null
            };
        } else {
            // Error in setup
            return {
                message: error.message || defaultMessage,
                status: -1,
                data: null
            };
        }
    },

    isUnauthorized: (error) => error.response?.status === 401,
    isForbidden: (error) => error.response?.status === 403,
    isNotFound: (error) => error.response?.status === 404,
    isValidationError: (error) => error.response?.status === 422,
    isServerError: (error) => error.response?.status >= 500
};

export const apiCall = async (method, url, data = null, config = {}) => {
    try {
        let response;
        switch (method.toUpperCase()) {
            case 'GET':
                response = await api.get(url, config);
                break;
            case 'POST':
                response = await api.post(url, data, config);
                break;
            case 'PUT':
                response = await api.put(url, data, config);
                break;
            case 'PATCH':
                response = await api.patch(url, data, config);
                break;
            case 'DELETE':
                response = await api.delete(url, config);
                break;
            default:
                throw new Error(`Unknown HTTP method: ${method}`);
        }

        if (response.data?.success) {
            return { success: true, data: response.data.data, message: response.data.message };
        } else {
            return { success: false, data: null, message: response.data?.message || 'Operation failed' };
        }
    } catch (error) {
        const errorInfo = ApiErrorHandler.handle(error);
        return { success: false, data: null, message: errorInfo.message, error: errorInfo };
    }
};

export const fetchList = async (endpoint, config = {}) => {
    return apiCall('GET', endpoint, null, config);
};

export const fetchDetails = async (endpoint, id) => {
    return apiCall('GET', `${endpoint}/${id}`);
};

export const createItem = async (endpoint, data) => {
    return apiCall('POST', endpoint, data);
};

export const updateItem = async (endpoint, id, data) => {
    return apiCall('PUT', `${endpoint}/${id}`, data);
};

export const deleteItem = async (endpoint, id) => {
    return apiCall('DELETE', `${endpoint}/${id}`);
};

export const toggleStatus = async (endpoint, id, payload = {}) => {
    return apiCall('PATCH', `${endpoint}/${id}`, payload);
};

export const bulkOperation = async (endpoint, action, ids) => {
    return apiCall('POST', `${endpoint}/bulk/${action}`, { ids });
};
