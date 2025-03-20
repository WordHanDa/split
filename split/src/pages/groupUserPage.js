import React from 'react';
import AddGroupUser from '../components/AddGroupUser';
import EditGroupUser from '../components/EditGroupUser';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GroupUserPage = () => {
    return (
        <div className="group-user-page">
            <h1>Group User Management</h1>
            <div className="user-management-container">
                <section className="add-user-section">
                    <h3>Add User</h3>
                    <AddGroupUser />
                </section>

                <section className="edit-user-section">
                    <h3>Edit User</h3>
                    <EditGroupUser />
                </section>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default GroupUserPage;