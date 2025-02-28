import React from 'react';
import ShowGroup from '../components/ShowGroup';
import AddGroup from '../components/AddGroup';

const GroupPage = ({ onGroupSelect }) => {
    return (
        <div>
            <h1>Group Page</h1>
            <ShowGroup onGroupSelect={onGroupSelect} />
            <AddGroup />
        </div>
    );
};

export default GroupPage;