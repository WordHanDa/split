import React from 'react';
import ShowUser from '../components/ShowUser';
import AddUser from '../components/AddUser';
import EditUser from '../components/EditUser';

const UserPage = ({hostname}) => {
    return (
        <div className="page-container">
            <h1>User Management</h1>
            
            <div className="component-section">
                <h3>User Directory</h3>
                <div className="user-page-section">
                    <ShowUser hostname={hostname}/>
                </div>
            </div>
            
            <div className="two-column-layout">
                <div className="component-section">
                    <h3>Add User</h3>
                    <div className="user-page-section">
                        <AddUser hostname={hostname}/>
                    </div>
                </div>
                
                <div className="component-section">
                    <h3>Edit User</h3>
                    <div className="user-page-section">
                        <EditUser hostname={hostname}/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPage;