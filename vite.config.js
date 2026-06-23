import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-safe __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * RKD MART - VITE CONFIGURATION (UPDATED FOR STABLE PROXY)
 * यह फाइल फ्रंटएंड प्रॉक्सी, एलियास (Aliases) और सर्वर सेटिंग्स को मैनेज करती है।
 */
export default defineConfig({
  plugins: [react()],
  
  envPrefix: 'VITE_',

  server: {
    port: 5173, 
    strictPort: true,
    open: true,
    // API proxy for local backend connectivity
    proxy: {
      // 1. मुख्य API कॉल्स के लिए प्रॉक्सी (Updated Target to 127.0.0.1)
      '/api': {
        target: 'http://127.0.0.1:5000', 
        changeOrigin: true,
        timeout: 120000,          // 2 मिनट का टाइमआउट (Base64 इमेज अपलोड के लिए)
        proxyTimeout: 120000,
        secure: false,
      },
      // 2. Socket.io (रियल-टाइम अपडेट्स) के लिए प्रॉक्सी सपोर्ट
      '/socket.io': {
        target: 'http://127.0.0.1:5000',
        ws: true,                // WebSocket को इनेबल करें
        changeOrigin: true,
      },
    },
  },

  resolve: {
    alias: {
      // क्लीन इम्पोर्ट्स के लिए शॉर्टकट पाथ्स
      '@': path.resolve(__dirname, './src'),
      'src': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './src/components'),
      'context': path.resolve(__dirname, './src/context'),
      'pages': path.resolve(__dirname, './src/pages'),
      'services': path.resolve(__dirname, './src/services'),
      'utils': path.resolve(__dirname, './src/utils'),
    },
  },

  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1600, // बड़े पेजों के लिए वार्निंग लिमिट बढ़ाई गई
    rollupOptions: {
      output: {
        // बेहतर लोडिंग के लिए मैन्युअल चंक्स (Manual Chunks)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  }
});