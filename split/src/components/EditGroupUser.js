import React, { useState, useEffect, useCallback, useMemo } from "react";
import Axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'js-cookie';
import 'react-toastify/dist/ReactToastify.css';
import './css/groupUser.css';

const EditGroupUser = ({hostname}) => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [loading, setLoading] = useState(false);
    const [groupId, setGroupId] = useState(null);

    const apiUrl = useMemo(() => ({
        getUsers: `${hostname}/getUsersByGroupId`,
        removeUser: `${hostname}/removeGroupUser`
      }), [hostname]);
      
      const fetchGroupUsers = useCallback(async (gid) => {
        try {
          setLoading(true);
          const response = await Axios.get(apiUrl.getUsers, {
            headers: {
              'ngrok-skip-browser-warning': 'skip-browser-warning'
            },
            params: { group_id: gid }
          });
          setUsers(response.data);
        } catch (error) {
          console.error("Error fetching group users:", error);
          toast.error("無法取得群組成員");
        } finally {
          setLoading(false);
        }
      }, [apiUrl]);

    useEffect(() => {
        const savedGroup = Cookies.get('selectedGroup');
        if (savedGroup) {
            try {
                const parsedGroup = JSON.parse(savedGroup);
                setGroupId(parsedGroup.group_id);
                fetchGroupUsers(parsedGroup.group_id);
            } catch (error) {
                console.error("Error parsing saved group:", error);
                toast.error("群組資料載入失敗");
            }
        } else {
            toast.error("請先選擇群組");
        }
    }, [fetchGroupUsers]);

    const handleDeleteUser = async () => {
        if (!selectedUser) {
            toast.error("請選擇要移除的成員");
            return;
        }

        const userToDelete = users.find(user => user.user_id === parseInt(selectedUser));
        if (!userToDelete) return;

        if (!window.confirm(`確定要將 ${userToDelete.user_name} 從群組中移除嗎？此操作無法復原。`)) {
            return;
        }

        setLoading(true);
        try {
            const response = await Axios.delete(apiUrl.removeUser, {
                data: {
                    group_id: groupId,
                    user_id: selectedUser
                }
            });

            if (response.data.message) {
                toast.success(`success remove ${userToDelete.user_name} from group`);
                setSelectedUser('');
                fetchGroupUsers(groupId);
            }
        } catch (error) {
            console.error("Error removing user:", error);
            const errorMessage = error.response?.data?.error || "remove user failed";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-group-user-container">
            {!groupId ? (
                <div className="no-group-message">select group</div>
            ) : (
                <>
                    {loading ? (
                        <div className="loading-message">loading...</div>
                    ) : users.length === 0 ? (
                        <div className="no-users-message">this group have no member</div>
                    ) : (
                        <>
                            <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                disabled={loading}
                                className="user-select"
                            >
                                <option value="">selecte a user</option>
                                {users.map(user => (
                                    <option key={user.user_id} value={user.user_id}>
                                        {user.user_name}
                                    </option>
                                ))}
                            </select>

                            <button
                                className="delete-button"
                                onClick={handleDeleteUser}
                                disabled={!selectedUser || loading}
                            >
                                {loading ? "removing..." : "remove user"}
                            </button>
                        </>
                    )}
                </>
            )}
            <ToastContainer/>
        </div>
    );
};

export default EditGroupUser;