import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useBranding } from '../../context/BrandingContext';
import { toast } from 'react-toastify';

const PincodeModal = ({ isOpen, onClose }) => {
    const { setPincode } = useCustomer();
    const { settings } = useBranding();
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePincodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setInputValue(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (inputValue.length !== 6) {
            toast.warning('Pincode must be 6 digits');
            return;
        }

        setLoading(true);
        try {
            // Validate pincode by making a quick API call to check shops
            const response = await fetch(`/api/customer/discovery/shops?pinCode=${inputValue}`);
            const data = await response.json();

            if (data.success) {
                // Save to localStorage and context
                localStorage.setItem('userPincode', inputValue);
                setPincode(inputValue);
                toast.success(`✅ Delivery area set to ${inputValue}`);
                onClose();
            } else {
                toast.error('No services available in this area');
            }
        } catch (err) {
            toast.error('Failed to validate area');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={overlay}>
            <div style={modalCard(settings.themeColor)}>
                <div style={headerS}>
                    <h2 style={titleS}>📍 Set Your Delivery Area</h2>
                    <p style={subtitleS}>Enter your 6-digit pincode to see available products and shops</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={inputGroupS}>
                        <label style={labelS}>Pincode</label>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handlePincodeChange}
                            placeholder="123456"
                            maxLength="6"
                            style={inputS}
                            autoFocus
                        />
                        <small style={helperS}>Enter your 6-digit postal code</small>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || inputValue.length !== 6}
                        style={{...submitBtnS(settings.themeColor), opacity: (loading || inputValue.length !== 6) ? 0.6 : 1}}
                    >
                        {loading ? 'Checking Area...' : 'Continue'}
                    </button>
                </form>

                <div style={benefitsS}>
                    <div style={benefitItem}>✅ View local products</div>
                    <div style={benefitItem}>✅ Find nearby shops</div>
                    <div style={benefitItem}>✅ Get accurate delivery info</div>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                input:focus {
                    border-color: #0f172a !important;
                    box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1) !important;
                }
            `}</style>
        </div>
    );
};

const overlay = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(4px)'
};

const modalCard = (color) => ({
    background: '#fff',
    borderRadius: '28px',
    padding: '40px 30px',
    maxWidth: '420px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    border: `2px solid ${color || '#0f172a'}`,
    animation: 'slideUp 0.3s ease'
});

const headerS = {
    marginBottom: '30px',
    textAlign: 'center'
};

const titleS = {
    fontSize: '24px',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 10px 0'
};

const subtitleS = {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
    fontWeight: '500'
};

const inputGroupS = {
    marginBottom: '25px'
};

const labelS = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px'
};

const inputS = {
    width: '100%',
    padding: '16px 18px',
    fontSize: '18px',
    border: '2px solid #e2e8f0',
    borderRadius: '14px',
    fontWeight: '700',
    letterSpacing: '2px',
    boxSizing: 'border-box',
    textAlign: 'center',
    transition: '0.2s',
    outline: 'none',
    ':focus': {
        borderColor: '#0f172a'
    }
};

const helperS = {
    display: 'block',
    fontSize: '11px',
    color: '#cbd5e1',
    marginTop: '6px',
    fontWeight: '600'
};

const submitBtnS = (color) => ({
    width: '100%',
    padding: '16px',
    background: color || '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    fontWeight: '900',
    fontSize: '15px',
    cursor: 'pointer',
    transition: '0.2s',
    boxShadow: `0 8px 20px ${color}44`,
    textTransform: 'uppercase',
    letterSpacing: '1px'
});

const benefitsS = {
    marginTop: '25px',
    paddingTop: '25px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
};

const benefitItem = {
    fontSize: '13px',
    color: '#1e293b',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center'
};

export default PincodeModal;
