import React from 'react';
import AddBill from '../components/AddBill';
import EditBill from '../components/EditBill';

const BillPage = () => {
    return (
        <div>
            <h1>Bill Management</h1>
            <AddBill />
            <EditBill />
        </div>
    );
};

export default BillPage;