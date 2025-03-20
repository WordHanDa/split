import React from 'react';
import ShowUser from '../components/ShowUser';
import AddUser from '../components/AddUser';
import EditUser from '../components/EditUser';

const UserPage = () => {
    return (
        <div>
            <h1>User Management</h1>
            <ShowUser />
            <AddUser />
            <EditUser />
        </div>
    );
};

export default UserPage;