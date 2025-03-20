import React, { useState, useEffect } from "react";
import Axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'js-cookie';
import 'react-toastify/dist/ReactToastify.css';

const hostname = "http://macbook-pro.local:3002";

const EditGroup = () => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(false);

    // Load groups on mount
    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await Axios.get(`${hostname}/GROUP`);
            setGroups(response.data);
        } catch (error) {
            console.error("Error fetching groups:", error);
            toast.error("無法取得群組列表");
        }
    };

    const handleGroupSelect = (groupId) => {
        setSelectedGroup(groupId);
        const group = groups.find(g => g.group_id === parseInt(groupId));
        if (group) {
            setNewName(group.group_name);
        }
    };

    const handleUpdateGroup = async () => {
        if (!selectedGroup) {
            toast.error("請選擇群組");
            return;
        }

        if (!newName.trim()) {
            toast.error("請輸入新名稱");
            return;
        }

        setLoading(true);
        try {
            const response = await Axios.put(`${hostname}/updateGroup`, {
                group_id: selectedGroup,
                name: newName
            });

            if (response.data.success) {
                toast.success("群組更新成功");
                fetchGroups();
                // Update cookie if the updated group is the currently selected one
                const savedGroup = Cookies.get('selectedGroup');
                if (savedGroup) {
                    const parsedGroup = JSON.parse(savedGroup);
                    if (parsedGroup.group_id === parseInt(selectedGroup)) {
                        Cookies.set('selectedGroup', JSON.stringify({
                            ...parsedGroup,
                            group_name: newName
                        }));
                    }
                }
                setSelectedGroup('');
                setNewName('');
            }
        } catch (error) {
            console.error("Error updating group:", error);
            toast.error(error.response?.data?.error || "更新失敗，請重試");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGroup = async () => {
        if (!selectedGroup) {
            toast.error("請選擇群組");
            return;
        }

        if (!window.confirm("確定要刪除此群組嗎？此操作無法復原。")) {
            return;
        }

        setLoading(true);
        try {
            const response = await Axios.delete(`${hostname}/api/groups/${selectedGroup}`);

            if (response.data.success) {
                toast.success("群組刪除成功");
                // Remove from cookies if it's the currently selected group
                const savedGroup = Cookies.get('selectedGroup');
                if (savedGroup) {
                    const parsedGroup = JSON.parse(savedGroup);
                    if (parsedGroup.group_id === parseInt(selectedGroup)) {
                        Cookies.remove('selectedGroup');
                    }
                }
                fetchGroups();
                setSelectedGroup('');
                setNewName('');
            } else {
                throw new Error(response.data.error || "刪除失敗");
            }
        } catch (error) {
            console.error("Error deleting group:", error);
            const errorMessage = error.response?.data?.error || 
                               error.message || 
                               "刪除失敗，請重試";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-group-container">
          <h3>Edit Group</h3>
            <select
                value={selectedGroup}
                onChange={(e) => handleGroupSelect(e.target.value)}
                disabled={loading}
            >
                <option value="">選擇群組</option>
                {groups.map(group => (
                    <option key={group.group_id} value={group.group_id}>
                        {group.group_name}
                    </option>
                ))}
            </select>

            <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="輸入新名稱"
                disabled={!selectedGroup || loading}
            />

            <div className="button-group">
                <button
                    className="update-button"
                    onClick={handleUpdateGroup}
                    disabled={!selectedGroup || !newName.trim() || loading}
                >
                    {loading ? "更新中..." : "更新群組"}
                </button>

                <button
                    className="delete-button"
                    onClick={handleDeleteGroup}
                    disabled={!selectedGroup || loading}
                >
                    {loading ? "刪除中..." : "刪除群組"}
                </button>
            </div>

            <ToastContainer />
        </div>
    );
};

export default EditGroup;