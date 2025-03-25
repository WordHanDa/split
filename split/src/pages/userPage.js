import React from 'react';
import ShowUser from '../components/ShowUser';
import AddUser from '../components/AddUser';
import EditUser from '../components/EditUser';
import '../page.css';

const UserPage = () => {
    return (
        <div className="page-container">
            <h1>User Management</h1>
            
            <div className="component-section">
                <h3>User Directory</h3>
                <div className="user-page-section">
                    <ShowUser />
                </div>
            </div>
            
            <div className="two-column-layout">
                <div className="component-section">
                    <h3>Add User</h3>
                    <div className="user-page-section">
                        <AddUser />
                    </div>
                </div>
                
                <div className="component-section">
                    <h3>Edit User</h3>
                    <div className="user-page-section">
                        <EditUser />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPage;