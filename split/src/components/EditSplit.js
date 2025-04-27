import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Axios from 'axios';
import { toast } from 'react-toastify';
import './css/bill.css';

// 更新 useSplitApi hook
const useSplitApi = (hostname) => {
    const apiUrls = useMemo(() => ({
      users: `${hostname}/getUsersByGroupId`,
      splitRecords: `${hostname}/getSplitRecords`,
      updateSplit: `${hostname}/updateSplitRecord`
    }), [hostname]);
  
    const fetchUsers = useCallback(async (groupId) => {
      try {
        const response = await Axios.get(apiUrls.users, {
          params: { group_id: groupId },
          headers: {
            'ngrok-skip-browser-warning': 'skip-browser-warning',
          },
          timeout: 5000
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
    }, [apiUrls]);
  
    const fetchSplitRecords = useCallback(async (billId) => {
      try {
        const response = await Axios.get(apiUrls.splitRecords, {
          params: { bill_id: billId },
          headers: {
            'ngrok-skip-browser-warning': 'skip-browser-warning',
          },
          timeout: 5000
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching split records:", error);
        throw error;
      }
    }, [apiUrls]);
  
    const updateSplitRecord = useCallback(async (billId, percentages) => {
      try {
        const response = await Axios.put(apiUrls.updateSplit, {
          bill_id: billId,
          percentages
        }, {
          headers: {
            'ngrok-skip-browser-warning': 'skip-browser-warning',
          },
          timeout: 5000
        });
        return response.data;
      } catch (error) {
        console.error("Error updating split records:", error);
        throw error;
      }
    }, [apiUrls]);
  
    return {
      fetchUsers,
      fetchSplitRecords,
      updateSplitRecord
    };
  };

// 更新 EditSplit 組件
const EditSplit = ({ hostname, billId, groupId, onUpdate }) => {
    const [users, setUsers] = useState([]);
    const [percentages, setPercentages] = useState({});
    const [loading, setLoading] = useState(false);

    const { fetchUsers, fetchSplitRecords, updateSplitRecord } = useSplitApi(hostname);

    // 更新 fetch 相關的函數
    const loadUsers = useCallback(async () => {
        try {
            const data = await fetchUsers(groupId);
            setUsers(data);
        } catch (error) {
            toast.error("無法取得使用者列表");
        }
    }, [fetchUsers, groupId]);

    const loadSplitRecords = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchSplitRecords(billId);
            const percentageData = {};
            data.forEach(record => {
                percentageData[record.user_id] = record.percentage;
            });
            setPercentages(percentageData);
        } catch (error) {
            toast.error("無法取得分帳記錄");
        } finally {
            setLoading(false);
        }
    }, [fetchSplitRecords, billId]);

    // 更新 useEffect
    useEffect(() => {
        if (groupId) {
            loadUsers();
        }
        if (billId) {
            loadSplitRecords();
        }
    }, [groupId, billId, loadUsers, loadSplitRecords]);

    const handlePercentageChange = (userId, value) => {
        const inputValue = Number(parseFloat(value || 0).toFixed(2));
        const lastUserId = users[users.length - 1].user_id;
        const newPercentages = { ...percentages };

        // Check input value
        if (inputValue > 10000) {
            toast.error("單一使用者百分比不能超過 100%");
            return;
        }

        // Set new percentage for current user
        newPercentages[userId] = inputValue * 100; // Convert to basis points

        if (userId !== lastUserId) {
            // If not modifying the last user
            const sortedUsers = [...users].sort((a, b) => 
                users.indexOf(b) - users.indexOf(a)
            );

            // Calculate total except last user
            let totalExceptLast = 0;
            for (const user of users) {
                if (user.user_id !== lastUserId) {
                    totalExceptLast += Number(newPercentages[user.user_id] || 0);
                }
            }

            // If total exceeds 100%, adjust other users
            if (totalExceptLast > 10000) {
                let excessAmount = totalExceptLast - 10000;
                for (const user of sortedUsers) {
                    if (user.user_id !== lastUserId && user.user_id !== userId) {
                        const currentPercentage = Number(newPercentages[user.user_id] || 0);
                        if (currentPercentage > 0) {
                            const canReduce = Math.min(currentPercentage, excessAmount);
                            newPercentages[user.user_id] = Number(currentPercentage - canReduce);
                            excessAmount -= canReduce;
                            
                            if (excessAmount <= 0) break;
                        }
                    }
                }

                if (excessAmount > 0) {
                    toast.error("無法調整其他使用者的比例以維持總和為 100%");
                    return;
                }
            }

            // Set percentage for last user
            const finalTotal = users.reduce((acc, user) => {
                if (user.user_id !== lastUserId) {
                    return acc + Number(newPercentages[user.user_id] || 0);
                }
                return acc;
            }, 0);

            const lastUserPercentage = 10000 - finalTotal;
            if (lastUserPercentage < 0) {
                toast.error("總百分比不能超過 100%");
                return;
            }
            newPercentages[lastUserId] = lastUserPercentage;
        }

        // Calculate and show total
        const total = Object.values(newPercentages).reduce(
            (sum, value) => sum + Number(value || 0),
            0
        );
        
        if (total < 10000) {
            toast.warn(`目前總和為 ${(total/100).toFixed(2)}%，需要等於 100%`);
        }

        setPercentages(newPercentages);
    };

    const handleUpdateSplit = async () => {
        const total = Object.values(percentages).reduce((sum, val) => sum + val, 0);
        
        if (total !== 10000) {
            toast.error("所有百分比總和必須等於 100%");
            return;
        }

        try {
            setLoading(true);
            const response = await updateSplitRecord(billId, percentages);

            if (response.success) {
                toast.success("分帳比例更新成功");
                if (onUpdate) {
                    onUpdate();
                }
            }
        } catch (error) {
            toast.error(error.message || "更新失敗");
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = useCallback(() => {
        return Object.values(percentages).reduce((sum, val) => sum + (Number(val) || 0), 0);
    }, [percentages]);

    return (
        <div className="edit-split-container">
            <h3>編輯分帳比例</h3>
            
            <div className="percentage-display">
                總計: {(calculateTotal() / 100).toFixed(2)}%
            </div>

            <div className="users-list">
                {users.map(user => (
                    <div key={user.user_id} className="user-percentage">
                        <label>{user.user_name}</label>
                        <div className="percentage-input">
                            <input
                                type="number"
                                value={(percentages[user.user_id] / 100).toFixed(2) || ''}
                                onChange={(e) => handlePercentageChange(user.user_id, e.target.value)}
                                disabled={loading}
                                min="0"
                                max="100"
                                step="0.01"
                            />
                            <span>%</span>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleUpdateSplit}
                disabled={loading || calculateTotal() !== 10000}
                className="update-button"
            >
                {loading ? "更新中..." : "更新分帳比例"}
            </button>
        </div>
    );
};

export default EditSplit;