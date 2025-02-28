import React, { useState, useEffect } from "react";
import Axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

let hostname = "http://macbook-pro.local:3002";

const AddSplit = ({ groupId }) => {
    const [users, setUsers] = useState([]);
    const [percentages, setPercentages] = useState({});

    useEffect(() => {
        // 獲取與該群組 ID 對應的用戶列表
        Axios.get(`${hostname}/getUsersByGroupId`, {
            params: { group_id: groupId }
        })
        .then(response => {
            setUsers(response.data);
            // 初始化百分比為均分
            const initialPercentages = {};
            response.data.forEach(user => {
                initialPercentages[user.user_id] = (100 / response.data.length).toFixed(2);
            });
            setPercentages(initialPercentages);
        })
        .catch(error => {
            console.error("Error fetching users:", error);
        });
    }, [groupId]);

    const handlePercentageChange = (userId, value) => {
        const newPercentages = { ...percentages, [userId]: parseFloat(value) };
        const totalPercentage = Object.values(newPercentages).reduce((acc, curr) => acc + curr, 0);

        if (totalPercentage > 100) {
            toast.error("Total percentage cannot exceed 100%");
            return;
        }

        // 調整最後一位使用者的百分比
        const lastUserId = users[users.length - 1].user_id;
        if (userId !== lastUserId) {
            newPercentages[lastUserId] = (100 - Object.values(newPercentages).reduce((acc, curr, index) => {
                if (index !== users.length - 1) return acc + curr;
                return acc;
            }, 0)).toFixed(2);
        }

        setPercentages(newPercentages);
    };

    return (
        <div>
            <h2>Split Percentage</h2>
            {users.map(user => (
                <div key={user.user_id}>
                    <span>{user.user_name}</span>
                    <input 
                        type="number" 
                        value={percentages[user.user_id]} 
                        onChange={(event) => handlePercentageChange(user.user_id, event.target.value)} 
                        min="0" 
                        max="100" 
                        step="0.01"
                    />
                    <span>%</span>
                </div>
            ))}
            <ToastContainer />
        </div>
    );
};

export default AddSplit;