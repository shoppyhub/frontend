export const NotificationTypes = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

export const showNotification = (toast, type, message, duration = 3000) => {
    if (!toast) {
        console.warn('Toast not available:', message);
        return;
    }

    const options = {
        position: 'top-right',
        autoClose: duration,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    };

    const iconMap = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const formattedMessage = `${iconMap[type]} ${message}`;

    switch (type) {
        case NotificationTypes.SUCCESS:
            toast.success(formattedMessage, options);
            break;
        case NotificationTypes.ERROR:
            toast.error(formattedMessage, options);
            break;
        case NotificationTypes.WARNING:
            toast.warning(formattedMessage, options);
            break;
        case NotificationTypes.INFO:
            toast.info(formattedMessage, options);
            break;
        default:
            toast.info(formattedMessage, options);
    }
};

export const apiCallWithNotification = async (toast, apiCall, successMsg, errorMsg = 'Operation failed') => {
    try {
        const response = await apiCall();
        if (response.data?.success) {
            showNotification(toast, NotificationTypes.SUCCESS, successMsg);
            return response.data;
        } else {
            showNotification(toast, NotificationTypes.ERROR, response.data?.message || errorMsg);
            return null;
        }
    } catch (error) {
        const message = error.response?.data?.message || error.message || errorMsg;
        showNotification(toast, NotificationTypes.ERROR, message);
        console.error('API Error:', error);
        return null;
    }
};
