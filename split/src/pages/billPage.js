import React from 'react';
import AddBill from '../components/AddBill';
import AddSplit from '../components/AddSplit';

const BillPage = ({ groupId }) => {
    return (
        <div>
            <h1>Bill Management</h1>
            <AddBill />
            <AddSplit groupId={groupId} />
        </div>
    );
};

export default BillPage;