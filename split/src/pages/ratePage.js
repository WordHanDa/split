import React from 'react';
import ShowRate from '../components/ShowRate';
import ShowYourRate from '../components/ShowYourRate';
import AddRate from '../components/AddRate';
import EditRate from '../components/EditRate';
const RatePage = () => {
    return (
        <div>
            <h1>Rate Management</h1>
            <ShowRate />
            <ShowYourRate />
            <AddRate />
            <EditRate />
        </div>
    );
};

export default RatePage;