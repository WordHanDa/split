import React from 'react';
import AddUser from '../components/AddUser';
import ShowUser from '../components/ShowUser';
import EditUser from '../components/EditUser';

const UserPage = () => {
    return (
        <div>
            <h1>User Management</h1>
            <AddUser />
            <ShowUser />
            <EditUser />
        </div>
    );
};

export default UserPage;