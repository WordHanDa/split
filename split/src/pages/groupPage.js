import React from 'react';
import AddGroup from '../components/AddGroup';
import ShowGroup from '../components/ShowGroup';

const GroupPage = () => {
    return (
        <div>
            <h1>Group Management</h1>
            <AddGroup />
            <ShowGroup />
        </div>
    );
};

export default GroupPage;