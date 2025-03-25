import React from 'react';
import ShowRate from '../components/ShowRate';
import ShowYourRate from '../components/ShowYourRate';
import AddRate from '../components/AddRate';
import EditRate from '../components/EditRate';
import '../page.css';

const RatePage = () => {
    return (
        <div className="page-container">
        <h1>Rate Management</h1>
        
        <div className="two-column-layout">
            <div className="component-section">
                <h3>Rate Status</h3>
                <div className="rate-page-section">
                    <ShowRate />
                </div>
            </div>
            
            <div className="component-section">
                <h3>Your Rates</h3>
                <div className="rate-page-section">
                    <ShowYourRate />
                </div>
            </div>
        </div>
        
        <div className="two-column-layout">
            <div className="component-section">
                <h3>Add Rate</h3>
                <div className="rate-page-section">
                    <AddRate />
                </div>
            </div>
            
            <div className="component-section">
                <h3>Edit Rate</h3>
                <div className="rate-page-section">
                    <EditRate />
                </div>
            </div>
        </div>
    </div>
    );
};

export default RatePage;