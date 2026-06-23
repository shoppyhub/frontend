import React, { useState } from 'react';
import StateHeader from '../../../components/StateAdmin/StateHeader';
import StateSidebar from '../../../components/StateAdmin/StateSidebar'; 
import StateOverview from '../../StateAdmin/StateOverview';
import StateBroadcast from '../../StateAdmin/Communications/StateBroadcast';
import MerchantEscalations from '../../StateAdmin/Compliance/MerchantEscalations';

const StateOperatorDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isOpen, setIsOpen] = useState(window.innerWidth > 1024);

    const renderModule = () => {
        switch (activeTab) {
            case 'overview': return <StateOverview stats={{shops:120, revenue:450000}} stateName="Rajasthan" />;
            case 'broadcast': return <StateBroadcast stateName="Rajasthan" />;
            case 'escalations': return <MerchantEscalations />;
            default: return <StateOverview />;
        }
    };

    return (
        <div style={{display:'flex', flexDirection:'column', minHeight:'100vh'}}>
            <StateHeader stateName="Rajasthan" onToggleSidebar={() => setIsOpen(!isOpen)} />
            <div style={{display:'flex', flex:1, marginTop:'85px'}}>
                {/* Operator Restricted Sidebar logic can be added here */}
                <StateSidebar activeTab={activeTab} setTab={setActiveTab} isOpen={isOpen} closeSidebar={() => setIsOpen(false)} />
                <main style={mainS(isOpen)}>
                    <div style={badge}>STATE OPERATOR SESSION</div>
                    {renderModule()}
                </main>
            </div>
        </div>
    );
};

const mainS = (open) => ({
    flex: 1, marginLeft: window.innerWidth > 1024 ? (open ? '280px' : '0') : '0',
    padding: '40px', transition: '0.4s ease', background: '#f8fafc'
});
const badge = { background:'#4f46e5', color:'#fff', padding:'5px 15px', borderRadius:'20px', fontSize:'10px', fontWeight:'900', display:'inline-block', marginBottom:'20px' };

export default StateOperatorDashboard;