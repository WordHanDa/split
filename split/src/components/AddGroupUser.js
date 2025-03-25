import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';

const hostname = "http://macbook-pro.local:3002";

const AddGroupUser = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedGroup = Cookies.get('selectedGroup');
        if (savedGroup) {
            try {
                const parsedGroup = JSON.parse(savedGroup);
                setSelectedGroup(parsedGroup);
                fetchUsers();
            } catch (error) {
                console.error('Error parsing saved group:', error);
                toast.error('群組資料載入失敗');
                navigate('/groups');
            }
        } else {
            toast.error('請先選擇群組');
            navigate('/groups');
        }
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const response = await Axios.get(`${hostname}/USER`);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('無法取得使用者列表');
        }
    };

    const handleAddUserToGroup = async (userId) => {
        if (!selectedGroup || !userId) return;

        setIsLoading(true);
        try {
            await Axios.post(`${hostname}/addGroupUser`, {
                group_id: selectedGroup.group_id,
                user_id: userId
            });
            toast.success('成功加入群組！');
            fetchUsers();
            setSelectedUser('');
        } catch (error) {
            console.error('Error adding user to group:', error);
            const errorMessage = error.response?.data?.error === "User already in group" 
                ? "使用者已在群組中"
                : "新增成員失敗";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser) {
            toast.error('請選擇使用者');
            return;
        }
        await handleAddUserToGroup(selectedUser);
    };

    if (!selectedGroup) {
        return <div className="loading-container">Loading...</div>;
    }

    return (
        <div className="add-group-user-container">
            <form onSubmit={handleSubmit} className="add-user-form">
                <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    disabled={isLoading}
                    className="user-select"
                >
                    <option value="">選擇使用者</option>
                    {users.map((user) => (
                        <option key={user.user_id} value={user.user_id}>
                            {user.user_name}
                        </option>
                    ))}
                </select>
                <button 
                    type="submit" 
                    disabled={isLoading || !selectedUser}
                    className="add-button"
                >
                    {isLoading ? "新增中..." : "新增成員"}
                </button>
            </form>
        </div>
    );
};

export default AddGroupUser;