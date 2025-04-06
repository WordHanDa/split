import React from 'react';
import ShowGroup from '../components/ShowGroup';
import AddGroup from '../components/AddGroup';
import EditGroup from '../components/EditGroup';

const GroupPage = ({hostname, onGroupSelect }) => {
    return (
        <div className="page-container">
            <h1>Group Page</h1>
            <div className="component-section">
                <h3>Select Groups</h3>
                <ShowGroup hostname={hostname} onGroupSelect={onGroupSelect} />
            </div>
            
            <div className="two-column-layout">
                <div className="component-section">
                    <h3>Add Group</h3>
                    <div className="group-page-section">
                        <AddGroup hostname={hostname}/>
                    </div>
                </div>
                
                <div className="component-section">
                    <h3>Edit Group</h3>
                    <div className="group-page-section">
                        <EditGroup hostname={hostname}/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupPage;