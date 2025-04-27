import React from 'react';
import AddBill from '../components/AddBill';
import EditBill from '../components/EditBill';
import '../page.css';

const BillPage = ({hostname}) => {
    return (
        <div className="page-container">
        <h1>Bill Management</h1>
        <div className="component-section">
            <h3>Add New Bill</h3>
            <div className="bill-page-section">
                <AddBill hostname={hostname}/>
            </div>
        </div>
        
        <div className="component-section">
            <h3>Edit Existing Bill</h3>
            <div className="bill-page-section">
                <EditBill hostname={hostname}/>
            </div>
        </div>
    </div>
    );
};

export default BillPage;