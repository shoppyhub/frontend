import axios from 'axios';

/**
 * RKD MART - Central API Gateway
 * यह फ़ाइल फ्रंटएंड और बैकएंड के बीच सुरक्षित और तेज़ संचार सुनिश्चित करती है।
 */

// 1. सुरक्षित रूप से Base URL प्राप्त करना
const getBaseURL = () => {
    try {
        // In development, always use Vite proxy for stable local routing.
        if (import.meta.env.DEV) return '/api';
        return import.meta.env.VITE_API_BASE_URL || '/api';
    } catch (e) {
        return '/api';
    }
};

const api = axios.create({
    baseURL: getBaseURL(),
    timeout: 120000, // 120 सेकंड का टाइमआउट (Endless buffering रोकने के लिए)
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// ==========================================
// 2. REQUEST INTERCEPTOR: टोकन और पेलोड मैनेजमेंट
// ==========================================
api.interceptors.request.use(
    (config) => {
        // localStorage से सुरक्षित टोकन प्राप्त करें
        const token = localStorage.getItem('token');
        
        if (token && token !== 'null' && token !== 'undefined') {
            // पक्का करें कि Bearer प्रिफिक्स सही है
            config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        }

        // FormData: let the browser set Content-Type with the correct boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==========================================
// 3. RESPONSE INTERCEPTOR: एरर ऑडिट और सुरक्षा प्रोटोकॉल
// ==========================================
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;

        // केस 1: अगर बैकएंड से कोई जवाब ही नहीं आ रहा (Server Down)
        if (!response) {
            const timeout = error?.code === 'ECONNABORTED';
            console.error("📡 Network Error: Master Cluster is unreachable.");
            return Promise.reject({
                message: timeout
                    ? "Request timed out. Please try again."
                    : "Server is unreachable. Please check your connection or Backend status."
            });
        }

        // केस 2: सुरक्षा प्रोटोकॉल - टोकन एक्सपायरी (401 Unauthorized)
        if (response.status === 401) {
            const currentPath = window.location.pathname;
            
            // --- अपडेट: पब्लिक पेजों को चेक करें ताकि रजिस्ट्रेशन के वक्त रिडायरेक्ट न हो ---
            const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
            const isPublicPage = publicPaths.some(path => currentPath.includes(path));

            // लॉगिन पेज और अन्य पब्लिक पेजों के अलावा कहीं भी हो तो डेटा क्लियर करें और रिडायरेक्ट करें
            if (!isPublicPage) {
                console.warn("🔒 Session Compromised/Expired. Purging registry...");
                localStorage.clear(); // सभी पुराना डेटा साफ़ करें
                
                // हार्ड रिफ्रेश के साथ लॉगिन पर भेजें
                window.location.href = '/login?status=session_expired';
            } else {
                console.warn("401 encountered on a public page. Redirection bypassed.");
            }
        }

        // केस 3: एक्सेस डिनाइड (403 Forbidden)
        if (response.status === 403) {
            console.error("🚫 Access Protocol: Insufficient node privileges.");
        }

        // केस 4: सर्वर एरर (500+)
        if (response.status >= 500) {
            console.error("🔥 Internal Node Failure: Backend error encountered.");
        }

        // एरर मैसेज को मानकीकृत (Standardize) करें ताकि toast.error() में इस्तेमाल हो सके
        const errorMessage = response.data?.message || "Infrastructure Handshake Failed";
        return Promise.reject({ ...error, message: errorMessage });
    }
);

export default api;