import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'js-cookie';
import 'react-toastify/dist/ReactToastify.css';

const hostname = "http://macbook-pro.local:3002";

const UpdateUser = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [newName, setNewName] = useState('');
    const [groupId, setGroupId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Load group ID and users on mount
    useEffect(() => {
        const savedGroup = Cookies.get('selectedGroup');
        if (savedGroup) {
            try {
                const parsedGroup = JSON.parse(savedGroup);
                setGroupId(parsedGroup.group_id);
                fetchUsers(parsedGroup.group_id);
            } catch (error) {
                console.error("Error parsing saved group:", error);
                toast.error("群組資料載入失敗");
            }
        } else {
            toast.error("請先選擇群組");
        }
    }, []);

    const fetchUsers = async (groupId) => {
        try {
            const response = await Axios.get(`${hostname}/getUsersByGroupId`, {
                params: { group_id: groupId }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("無法取得使用者列表");
        }
    };

    const handleUserSelect = (userId) => {
        setSelectedUser(userId);
        const user = users.find(u => u.user_id === parseInt(userId));
        if (user) {
            setNewName(user.user_name);
        }
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) {
            toast.error("請選擇使用者");
            return;
        }

        if (!newName.trim()) {
            toast.error("請輸入新名稱");
            return;
        }

        setLoading(true);
        try {
            const response = await Axios.put(`${hostname}/updateUser`, {
                user_id: selectedUser,
                name: newName
            });

            if (response.data.success) {
                toast.success("使用者更新成功");
                fetchUsers(groupId); // Refresh user list
                setSelectedUser('');
                setNewName('');
            } else {
                throw new Error(response.data.message || "更新失敗");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error(error.message || "更新失敗，請重試");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) {
            toast.error("請選擇使用者");
            return;
        }

        if (!window.confirm("確定要刪除此使用者嗎？此操作無法復原。")) {
            return;
        }

        setLoading(true);
        try {
            const response = await Axios.delete(`${hostname}/deleteUser`, {
                data: { user_id: selectedUser }
            });

            if (response.data.success) {
                toast.success("使用者刪除成功");
                fetchUsers(groupId); // Refresh user list
                setSelectedUser('');
                setNewName('');
            } else {
                throw new Error(response.data.message || "刪除失敗");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error(error.message || "刪除失敗，請重試");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="update-user-container">
            {!groupId ? (
                <div className="no-group-message">請先選擇群組</div>
            ) : (
                <>
                    <select
                        value={selectedUser}
                        onChange={(e) => handleUserSelect(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">選擇使用者</option>
                        {users.map(user => (
                            <option key={user.user_id} value={user.user_id}>
                                {user.user_name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="輸入新名稱"
                        disabled={!selectedUser || loading}
                    />

                    <div className="button-group">
                        <button
                            className="update-button"
                            onClick={handleUpdateUser}
                            disabled={!selectedUser || !newName.trim() || loading}
                        >
                            {loading ? "更新中..." : "更新使用者"}
                        </button>

                        <button
                            className="delete-button"
                            onClick={handleDeleteUser}
                            disabled={!selectedUser || loading}
                        >
                            {loading ? "刪除中..." : "刪除使用者"}
                        </button>
                    </div>
                </>
            )}
            <ToastContainer />
        </div>
    );
};

export default UpdateUser;