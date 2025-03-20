import React from 'react';
import ShowGroup from '../components/ShowGroup';
import AddGroup from '../components/AddGroup';
import EditGroup from '../components/EditGroup';

const GroupPage = ({ onGroupSelect }) => {
    return (
        <div>
            <h1>Group Page</h1>
            <ShowGroup onGroupSelect={onGroupSelect} />
            <AddGroup />
            <EditGroup />
        </div>
    );
};

export default GroupPage;