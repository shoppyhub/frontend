// Currency Formatter (Indian Rupees)
export const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount || 0);
};

// Date Formatter (DD/MM/YYYY - HH:MM AM/PM)
export const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

// Text Truncate (ID या लंबे नाम के लिए)
export const truncate = (text, length = 10) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
};

// रोल को सुंदर टेक्स्ट में बदलना (e.g. 'ShopOwner' -> 'Shop Owner')
export const formatRole = (role) => {
    if (!role) return "";
    return role.replace(/([A-Z])/g, ' $1').trim();
};