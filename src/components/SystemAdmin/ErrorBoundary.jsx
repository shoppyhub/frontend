import React from 'react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={errorContainerS}>
                    <div style={errorCardS}>
                        <div style={errorIconS}>⚠️</div>
                        <h2 style={errorTitleS}>System Error Detected</h2>
                        <p style={errorMsgS}>An unexpected issue occurred in the admin panel.</p>

                        <details style={errorDetailsS}>
                            <summary style={detailsSummaryS}>Technical Details</summary>
                            <pre style={errorTraceS}>
                                {this.state.error?.toString()}
                                {'\n'}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>

                        <div style={actionButtonsS}>
                            <button onClick={() => window.location.reload()} style={primaryBtnS}>
                                🔄 Reload System
                            </button>
                            <button onClick={() => window.history.back()} style={secondaryBtnS}>
                                ← Go Back
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const errorContainerS = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '20px'
};

const errorCardS = {
    background: '#fff',
    borderRadius: '24px',
    padding: '60px 40px',
    maxWidth: '500px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 20px 50px rgba(0,0,0,0.08)'
};

const errorIconS = {
    fontSize: '60px',
    textAlign: 'center',
    marginBottom: '20px'
};

const errorTitleS = {
    fontSize: '20px',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 10px 0'
};

const errorMsgS = {
    color: '#64748b',
    fontSize: '14px',
    margin: '0 0 20px 0'
};

const errorDetailsS = {
    backgroundColor: '#f1f5f9',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '20px',
    cursor: 'pointer'
};

const detailsSummaryS = {
    fontWeight: '600',
    color: '#475569',
    fontSize: '12px',
    cursor: 'pointer'
};

const errorTraceS = {
    backgroundColor: '#0f172a',
    color: '#10b981',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '11px',
    overflow: 'auto',
    maxHeight: '200px',
    fontFamily: 'monospace',
    marginTop: '10px'
};

const actionButtonsS = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
};

const primaryBtnS = {
    padding: '12px 24px',
    backgroundColor: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
    transition: '0.3s'
};

const secondaryBtnS = {
    padding: '12px 24px',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
    transition: '0.3s'
};

export default ErrorBoundary;
