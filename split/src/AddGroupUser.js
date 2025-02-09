import React, { useState, useEffect } from 'react';
import Axios from 'axios';

let hostname = "http://mac-mini.local:3002";

const AddGroupUser = ({ addUser }) => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        Axios.get(hostname + '/USER')
            .then((response) => setUsers(response.data))
            .catch((error) => console.error('Error fetching users:', error));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedUser) {
            addUser(selectedUser, fetchUsers); // Pass fetchUsers as a callback
            setSelectedUser('');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
            >
                <option value="">Select a user</option>
                {users.map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                        {user.user_name}
                    </option>
                ))}
            </select>
            <button type="submit">Add User</button>
        </form>
    );
};

export default AddGroupUser;