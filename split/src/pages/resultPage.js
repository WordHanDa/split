import React from 'react';
import AddUser from '../components/AddUser';
import ShowUser from '../components/ShowUser';

const ResultPage = () => {
    return (
        <div>
            <h1>User Management</h1>
            <AddUser />
            <ShowUser />
        </div>
    );
};

export default ResultPage;