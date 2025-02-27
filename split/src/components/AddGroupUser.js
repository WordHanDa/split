import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

let hostname = "http://macbook-pro.local:3002";

const AddGroupUser = ({ addUser }) => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        Axios.get(hostname + '/USER')
            .then((response) => setUsers(response.data))
            .catch((error) => {
                console.error('Error fetching users:', error);
                toast.error('Error fetching users');
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedUser) {
            addUser(selectedUser, () => {
                fetchUsers();
                toast.success('User added to group successfully!');
            });
            setSelectedUser('');
        } else {
            toast.error('Please select a user');
        }
    };

    return (
        <div>
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
            <ToastContainer />
        </div>
    );
};

export default AddGroupUser;