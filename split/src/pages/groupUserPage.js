import React from 'react';
import AddGroupUser from '../components/AddGroupUser';
import EditGroupUser from '../components/EditGroupUser';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GroupUserPage = () => {
    return (
        <div className="page-container">
            <h1>Group User Management</h1>
            
            <div className="two-column-layout">
                <div className="component-section">
                    <h3>Add User to Group</h3>
                    <div className="group-user-container">
                        <AddGroupUser />
                    </div>
                </div>
                
                <div className="component-section">
                    <h3>Edit Group Members</h3>
                    <div className="group-user-container">
                        <EditGroupUser />
                    </div>
                </div>
            </div>
            
            <ToastContainer/>
        </div>
    );
};

export default GroupUserPage;