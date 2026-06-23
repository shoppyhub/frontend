import React from 'react';
import CustomerHeader from '../components/Customer/HomeHeader';
import CustomerFooter from '../components/Customer/CustomerFooter';

const TermsAndConditions = () => {
    return (
        <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
            <CustomerHeader />
            <div style={{ paddingTop: '100px', paddingBottom: '60px', maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
                <div style={legalCard}>
                    <h1 style={titleStyle}>नियम और शर्तें (Terms & Conditions)</h1>
                    <p style={{ color: '#7f8c8d' }}>Last Updated: February 2026</p>
                    
                    <div style={contentArea}>
                        <h3>1. व्यवसाय पंजीकरण (Business Registration)</h3>
                        <p>RKD_MART पर पंजीकरण करके, आप पुष्टि करते हैं कि आपकी दुकान और प्रदान किए गए सभी दस्तावेज (आधार, पैन, बैंक विवरण) वैध और कानूनी हैं।</p>
                        
                        <h3>2. सेवाओं की गुणवत्ता (Service Quality)</h3>
                        <p>दुकानदारों को गुणवत्तापूर्ण सामान और समय पर डिलीवरी सुनिश्चित करनी होगी। किसी भी शिकायत की स्थिति में RKD_MART एडमिन को अंतिम निर्णय लेने का अधिकार है।</p>

                        <h3>3. भुगतान और सेटलमेंट (Payments)</h3>
                        <p>ऑर्डर की राशि आपके द्वारा दिए गए बैंक खाते में 24-48 घंटों के भीतर (सफल डिलीवरी के बाद) ट्रांसफर कर दी जाएगी।</p>

                        <h3>4. गोपनीयता नीति (Privacy Policy)</h3>
                        <p>आपका डेटा हमारे पास सुरक्षित है और इसका उपयोग केवल RKD_MART के व्यापारिक कार्यों के लिए ही किया जाएगा।</p>
                    </div>

                    <button onClick={() => window.history.back()} style={backBtn}>Go Back to Registration</button>
                </div>
            </div>
            <CustomerFooter />
        </div>
    );
};

const legalCard = { backgroundColor: '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' };
const titleStyle = { color: '#1a1a2e', borderBottom: '3px solid #27ae60', paddingBottom: '15px' };
const contentArea = { marginTop: '30px', lineHeight: '1.8', color: '#34495e', textAlign: 'justify' };
const backBtn = { marginTop: '40px', padding: '12px 30px', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

export default TermsAndConditions;