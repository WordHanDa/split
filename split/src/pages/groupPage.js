import React from 'react';
import ShowGroup from '../components/ShowGroup';
import AddGroup from '../components/AddGroup';
import EditGroup from '../components/EditGroup';

const GroupPage = ({ onGroupSelect }) => {
    return (
        <div className="page-container">
            <h1>Group Page</h1>
            <div className="component-section">
                <h3>Select Groups</h3>
                <ShowGroup onGroupSelect={onGroupSelect} />
            </div>
            
            <div className="two-column-layout">
                <div className="component-section">
                    <h3>Add Group</h3>
                    <div className="group-page-section">
                        <AddGroup />
                    </div>
                </div>
                
                <div className="component-section">
                    <h3>Edit Group</h3>
                    <div className="group-page-section">
                        <EditGroup />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupPage;