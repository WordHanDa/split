import React from 'react';
import ShowGroup from '../components/ShowGroup';

const GroupPage = ({ onGroupSelect }) => {
    return (
        <div>
            <h1>Group Page</h1>
            <ShowGroup onGroupSelect={onGroupSelect} />
        </div>
    );
};

export default GroupPage;