import React from 'react';

const EmptyState = ({ icon = "📭", title = "No Data Available", description = "Nothing to display at this time.", action = null }) => {
    return (
        <div style={emptyContainerS}>
            <div style={emptyContentS}>
                <div style={emptyIconS}>{icon}</div>
                <h3 style={emptyTitleS}>{title}</h3>
                <p style={emptyDescS}>{description}</p>
                {action && (
                    <button onClick={action.onClick} style={emptyBtnS}>
                        {action.label}
                    </button>
                )}
            </div>
        </div>
    );
};

const emptyContainerS = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    background: '#f8fafc',
    borderRadius: '24px',
    border: '2px dashed #e2e8f0',
    padding: '40px 20px'
};

const emptyContentS = {
    textAlign: 'center',
    maxWidth: '300px'
};

const emptyIconS = {
    fontSize: '60px',
    marginBottom: '15px'
};

const emptyTitleS = {
    fontSize: '16px',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 8px 0'
};

const emptyDescS = {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 20px 0'
};

const emptyBtnS = {
    padding: '10px 20px',
    backgroundColor: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '12px',
    transition: '0.3s'
};

export default EmptyState;
