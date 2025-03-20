import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'js-cookie';
import 'react-toastify/dist/ReactToastify.css';

const hostname = "http://macbook-pro.local:3002";

const EditRate = () => {
    const [selectedRate, setSelectedRate] = useState(null);
    const [JPY, setJPY] = useState("");
    const [NTD, setNTD] = useState("");
    const [userId, setUserId] = useState("");
    const [users, setUsers] = useState([]);
    const [groupId, setGroupId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userRates, setUserRates] = useState([]);

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

    const fetchUsers = async (gid) => {
        try {
            const response = await Axios.get(`${hostname}/getUsersByGroupId`, {
                params: { group_id: gid }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("無法取得使用者列表");
        }
    };

    const fetchUserRates = async (uid) => {
        try {
            const response = await Axios.get(`${hostname}/YOUR_RATE/user`, {
                params: { user_id: uid }
            });
            setUserRates(response.data.data || []);
            setSelectedRate(null);
            setJPY("");
            setNTD("");
        } catch (error) {
            console.error("Error fetching user rates:", error);
            toast.error("無法取得使用者匯率資料");
        }
    };

    const handleUserSelect = (uid) => {
        setUserId(uid);
        if (uid) {
            fetchUserRates(uid);
        } else {
            setUserRates([]);
            setSelectedRate(null);
        }
    };

    const handleRateSelect = (rateId) => {
        const rate = userRates.find(r => r.your_rate_id === parseInt(rateId));
        if (rate) {
            setSelectedRate(rate);
            setJPY(rate.JPY.toString());
            setNTD(rate.NTD.toString());
        }
    };

    const handleUpdateRate = async () => {
        if (!selectedRate || !userId) {
            toast.error("請選擇要更新的匯率");
            return;
        }

        if (!JPY || !NTD) {
            toast.error("請填寫所有欄位");
            return;
        }

        setLoading(true);
        try {
            const response = await Axios.put(`${hostname}/updateRate`, {
                id: selectedRate.your_rate_id,
                JPY,
                NTD,
                user_id: parseInt(userId)
            });

            if (response.data.success) {
                toast.success("匯率更新成功");
                fetchUserRates(userId);
                setSelectedRate(null);
                setJPY("");
                setNTD("");
            }
        } catch (error) {
            console.error("Error updating rate:", error);
            toast.error(error.response?.data?.error || "更新失敗，請重試");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-rate-container">
            <h3>Update Your Rate</h3>
            {!groupId ? (
                <div className="no-group-message">請先選擇群組</div>
            ) : (
                <>
                    <select
                        value={userId}
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

                    {userId && (
                        <select
                            value={selectedRate?.your_rate_id || ""}
                            onChange={(e) => handleRateSelect(e.target.value)}
                            disabled={loading || !userId}
                        >
                            <option value="">選擇匯率記錄</option>
                            {userRates.map(rate => (
                                <option key={rate.your_rate_id} value={rate.your_rate_id}>
                                    JPY: {rate.JPY} NTD: {rate.NTD} - {new Date(rate.create_time).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                    )}

                    {selectedRate && (
                        <>
                            <input
                                type="number"
                                value={JPY}
                                onChange={(e) => setJPY(e.target.value)}
                                placeholder="JPY 匯率"
                                disabled={loading}
                            />
                            <input
                                type="number"
                                value={NTD}
                                onChange={(e) => setNTD(e.target.value)}
                                placeholder="NTD 匯率"
                                disabled={loading}
                            />

                            <button
                                onClick={handleUpdateRate}
                                disabled={loading || !JPY || !NTD}
                            >
                                {loading ? "更新中..." : "更新匯率"}
                            </button>
                        </>
                    )}
                </>
            )}
            <ToastContainer />
        </div>
    );
};

export default EditRate;