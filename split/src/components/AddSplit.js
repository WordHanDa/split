import React, { useState, useEffect } from "react";
import Axios from "axios";
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

let hostname = "http://macbook-pro.local:3002";

const AddSplit = ({ groupId, users, onSplitComplete }) => {
    const [percentages, setPercentages] = useState({});
    const [originalPercentages, setOriginalPercentages] = useState({});
    const [currentGroupId, setCurrentGroupId] = useState(groupId);
    const [groupUsers, setGroupUsers] = useState(users);

    useEffect(() => {
        // 初始化百分比為均分
        const initialPercentages = {};
        const userCount = users.length;
        const basePercentage = (100 / userCount).toFixed(2);
        
        users.forEach((user, index) => {
            if (index === userCount - 1) {
                // 最後一位使用者取得剩餘百分比
                const currentSum = Object.values(initialPercentages).reduce(
                    (sum, val) => sum + parseFloat(val), 
                    0
                );
                initialPercentages[user.user_id] = (100 - currentSum).toFixed(2);
            } else {
                initialPercentages[user.user_id] = basePercentage;
            }
        });
        
        setPercentages(initialPercentages);
        setOriginalPercentages(initialPercentages); // 保存原始比例
    }, [users]);

    const handlePercentageChange = (userId, value) => {
        const inputValue = Number(parseFloat(value || 0).toFixed(2));
        const lastUserId = users[users.length - 1].user_id;
        const newPercentages = { ...percentages };

        // 檢查輸入值
        if (inputValue > 100) {
            toast.error("單一使用者百分比不能超過 100%");
            return;
        }

        // 設定當前使用者的新百分比
        newPercentages[userId] = inputValue;

        if (userId !== lastUserId) {
            // 如果修改的不是最後一位使用者
            const sortedUsers = [...users].sort((a, b) => 
                users.indexOf(b) - users.indexOf(a)
            );

            // 計算除了最後一位以外的總和
            let totalExceptLast = 0;
            for (const user of users) {
                if (user.user_id !== lastUserId) {
                    totalExceptLast += Number(newPercentages[user.user_id] || 0);
                }
            }

            // 如果總和超過 100%，開始調整其他使用者的比例
            if (totalExceptLast > 100) {
                // 從倒數第二位開始調整
                let excessAmount = totalExceptLast - 100;
                for (const user of sortedUsers) {
                    // 跳過最後一位和當前修改的使用者
                    if (user.user_id !== lastUserId && user.user_id !== userId) {
                        const currentPercentage = Number(newPercentages[user.user_id] || 0);
                        if (currentPercentage > 0) {
                            // 計算可以減少的最大量
                            const canReduce = Math.min(currentPercentage, excessAmount);
                            newPercentages[user.user_id] = Number((currentPercentage - canReduce).toFixed(2));
                            excessAmount -= canReduce;
                            
                            if (excessAmount <= 0) break;
                        }
                    }
                }

                // 如果還是超過 100%
                if (excessAmount > 0) {
                    toast.error("無法調整其他使用者的比例以維持總和為 100%");
                    return;
                }
            }

            // 設定最後一位使用者的比例
            const finalTotal = users.reduce((acc, user) => {
                if (user.user_id !== lastUserId) {
                    return acc + Number(newPercentages[user.user_id] || 0);
                }
                return acc;
            }, 0);

            const lastUserPercentage = Number((100 - finalTotal).toFixed(2));
            if (lastUserPercentage < 0) {
                toast.error("總百分比不能超過 100%");
                return;
            }
            newPercentages[lastUserId] = lastUserPercentage;
        }

        // 計算並顯示總和
        const total = Object.values(newPercentages).reduce(
            (sum, value) => sum + Number(value || 0),
            0
        );
        
        if (total < 100) {
            toast.warn(`目前總和為 ${total.toFixed(2)}%，需要等於 100%`);
        }

        setPercentages(newPercentages);
    };

    const handleReset = () => {
        // 計算當前總和
        const currentTotal = Object.values(percentages).reduce(
            (sum, value) => sum + Number(value || 0),
            0
        );

        // 如果總和為 100%，直接返回原始比例
        if (Math.abs(currentTotal - 100) < 0.01) {
            setPercentages(originalPercentages);
            return;
        }

        // 根據原始比例重新計算
        const newPercentages = {};
        const totalOriginal = Object.values(originalPercentages).reduce(
            (sum, value) => sum + Number(value || 0),
            0
        );

        // 按原始比例分配 100%
        Object.keys(originalPercentages).forEach(userId => {
            const originalPercentage = Number(originalPercentages[userId]);
            const newPercentage = (originalPercentage / totalOriginal) * 100;
            newPercentages[userId] = Number(newPercentage.toFixed(2));
        });

        // 處理小數點誤差，將差值加到最後一位
        const lastUserId = users[users.length - 1].user_id;
        const currentSum = Object.values(newPercentages).reduce(
            (sum, value) => sum + Number(value || 0),
            0
        );
        const difference = Number((100 - currentSum).toFixed(2));
        newPercentages[lastUserId] = Number((newPercentages[lastUserId] + difference).toFixed(2));

        setPercentages(newPercentages);
        toast.success("已重置為原始比例");
    };

    const handleSubmit = () => {
        // 驗證總和是否為 100%
        const totalPercentage = Object.values(percentages).reduce(
            (sum, value) => sum + parseFloat(value), 
            0
        );
        
        if (Math.abs(totalPercentage - 100) > 0.01) {
            toast.error("總百分比必須等於 100%");
            return;
        }

        // 回傳分帳資料給父組件
        onSplitComplete(percentages);
    };

    return (
        <div>
            <h3>設定分帳比例</h3>
            {users.map(user => (
                <div key={user.user_id}>
                    <span>{user.user_name}</span>
                    <input 
                        type="number" 
                        value={String(percentages[user.user_id] || 0)} 
                        onChange={(event) => handlePercentageChange(user.user_id, event.target.value)} 
                        min="0" 
                        max="100" 
                        step="0.01"
                    />
                    <span>%</span>
                </div>
            ))}
            <div>
                <button onClick={handleSubmit}>新增</button>
                <button onClick={handleReset}>重置</button>
            </div>
            <ToastContainer />
        </div>
    );
};

export default AddSplit;