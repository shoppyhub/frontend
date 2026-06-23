export const ValidationRules = {
    required: (value, fieldName) => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            return `${fieldName} is required`;
        }
        return null;
    },

    email: (value) => {
        if (!value) return null;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? null : 'Invalid email format';
    },

    phone: (value) => {
        if (!value) return null;
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(value.replace(/\D/g, '')) ? null : 'Phone number must be 10 digits';
    },

    minLength: (value, length, fieldName) => {
        if (!value) return null;
        return value.length >= length ? null : `${fieldName} must be at least ${length} characters`;
    },

    maxLength: (value, length, fieldName) => {
        if (!value) return null;
        return value.length <= length ? null : `${fieldName} must not exceed ${length} characters`;
    },

    numeric: (value, fieldName) => {
        if (!value) return null;
        return !isNaN(value) && value !== '' ? null : `${fieldName} must be a number`;
    },

    positiveNumber: (value, fieldName) => {
        if (!value && value !== 0) return null;
        return parseFloat(value) > 0 ? null : `${fieldName} must be a positive number`;
    },

    url: (value) => {
        if (!value) return null;
        try {
            new URL(value);
            return null;
        } catch {
            return 'Invalid URL format';
        }
    },

    gst: (value) => {
        if (!value) return null;
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[0-9A-Z]{1}$/;
        return gstRegex.test(value) ? null : 'Invalid GST format';
    },

    pincode: (value) => {
        if (!value) return null;
        const pincodeRegex = /^[0-9]{6}$/;
        return pincodeRegex.test(value) ? null : 'Pincode must be 6 digits';
    },

    aadhar: (value) => {
        if (!value) return null;
        const aadharRegex = /^[0-9]{12}$/;
        return aadharRegex.test(value) ? null : 'Aadhar must be 12 digits';
    },

    pancard: (value) => {
        if (!value) return null;
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return panRegex.test(value) ? null : 'Invalid PAN format';
    }
};

export const validateForm = (formData, rules) => {
    const errors = {};
    Object.keys(rules).forEach(field => {
        const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]];
        for (const rule of fieldRules) {
            if (typeof rule === 'function') {
                const error = rule(formData[field]);
                if (error) {
                    errors[field] = error;
                    break;
                }
            }
        }
    });
    return errors;
};

export const isFormValid = (errors) => {
    return Object.keys(errors).length === 0;
};
