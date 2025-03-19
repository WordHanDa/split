import React from 'react';
import ShowRate from '../components/ShowRate';
import ShowYourRate from '../components/ShowYourRate';
import AddRate from '../components/AddRate';

const RatePage = () => {
    return (
        <div>
            <h1>Rate Management</h1>
            <ShowRate />
            <ShowYourRate />
            <AddRate />
        </div>
    );
};

export default RatePage;