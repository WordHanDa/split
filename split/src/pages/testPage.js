import React from 'react';
import AddBill from '../components/AddBill';


const TestPage = ({hostname}) => {
    return (
        <div className="page-container">
            <h1>User Management</h1>
            <div className="component-section">
                <h3>User Directory</h3>
                <div className="user-page-section">
                    <AddBill hostname={hostname}/>
                </div>
            </div>
        </div>
    );
};

export default TestPage;