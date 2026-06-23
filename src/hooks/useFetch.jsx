import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const useFetch = (url, autoFetch = true) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(autoFetch);
    const [error, setError] = useState(null);
    
    // बार-बार रिक्वेस्ट भेजने से रोकने के लिए रेफरेंस
    const abortControllerRef = useRef(null);

    const fetchData = useCallback(async () => {
        // अगर कोई पुरानी रिक्वेस्ट चल रही है, तो उसे कैंसिल करें
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            const response = await api.get(url, { signal: controller.signal });
            setData(response.data.data || response.data);
            setError(null);
        } catch (err) {
            if (err.name === 'CanceledError' || err.name === 'AbortError') {
                // रिक्वेस्ट जानबूझकर कैंसिल की गई है, इसे एरर न मानें
                return;
            }
            setError(err.response?.data?.message || "Data Sync Error");
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        if (autoFetch) fetchData();

        // क्लीनअप फंक्शन: कंपोनेंट बंद होने पर रिक्वेस्ट कैंसिल करें
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchData, autoFetch]);

    return { data, loading, error, refetch: fetchData };
};

export default useFetch;