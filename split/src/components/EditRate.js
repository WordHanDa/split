import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'js-cookie';
import 'react-toastify/dist/ReactToastify.css';
import './css/rate.css';

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
            setLoading(true);
            const response = await Axios.get(`${hostname}/YOUR_RATE/user`, {
                params: { user_id: uid }
            });
            
            if (response.data.success) {
                if (response.data.rates && response.data.rates.length > 0) {
                    setUserRates(response.data.rates);
                } else {
                    setUserRates([]);
                    toast.info("此使用者尚未設定匯率");
                }
            } else {
                setUserRates([]);
                toast.error("取得匯率資料失敗");
            }
            
            setSelectedRate(null);
            setJPY("");
            setNTD("");
        } catch (error) {
            console.error("Error fetching user rates:", error);
            toast.error("無法取得使用者匯率資料");
            setUserRates([]);
        } finally {
            setLoading(false);
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

    const calculateExchangeRate = (jpy, ntd) => {
        if (!jpy || !ntd) return "0.00";
        return (parseFloat(ntd) / parseFloat(jpy)).toFixed(4);
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

        if (parseFloat(JPY) <= 0 || parseFloat(NTD) <= 0) {
            toast.error("金額必須大於0");
            return;
        }

        setLoading(true);
        try {
            const response = await Axios.put(`${hostname}/updateRate`, {
                id: selectedRate.your_rate_id,
                JPY: parseFloat(JPY),
                NTD: parseFloat(NTD),
                user_id: parseInt(userId)
            });

            if (response.data.success) {
                toast.success("匯率更新成功");
                await fetchUserRates(userId);
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
            <div className="rate-header">
                {selectedRate && (
                    <div className="current-rate">
                        當前匯率: 1 JPY = {calculateExchangeRate(JPY, NTD)} NTD
                    </div>
                )}
            </div>

            {!groupId ? (
                <div className="no-group-message">請先選擇群組</div>
            ) : (
                <>
                    <select
                        value={userId}
                        onChange={(e) => handleUserSelect(e.target.value)}
                        disabled={loading}
                        className="user-select"
                    >
                        <option value="">選擇使用者</option>
                        {users.map(user => (
                            <option key={user.user_id} value={user.user_id}>
                                {user.user_name}
                            </option>
                        ))}
                    </select>

                    {loading ? (
                        <div className="loading-message">載入中...</div>
                    ) : userRates.length > 0 ? (
                        <>
                            <select
                                value={selectedRate?.your_rate_id || ""}
                                onChange={(e) => handleRateSelect(e.target.value)}
                                disabled={loading}
                                className="rate-select"
                            >
                                <option value="">選擇匯率記錄</option>
                                {userRates.map(rate => (
                                    <option key={rate.your_rate_id} value={rate.your_rate_id}>
                                        1 JPY = {(rate.NTD/rate.JPY).toFixed(4)} NTD ({new Date(rate.create_time).toLocaleString()})
                                    </option>
                                ))}
                            </select>

                            {selectedRate && (
                                <div className="rate-form">
                                    <div className="input-group">
                                        <label>JPY 金額</label>
                                        <input
                                            type="number"
                                            value={JPY}
                                            onChange={(e) => setJPY(e.target.value)}
                                            placeholder="輸入 JPY 金額"
                                            disabled={loading}
                                            min="0"
                                            step="0.01"
                                            className="rate-input"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>NTD 金額</label>
                                        <input
                                            type="number"
                                            value={NTD}
                                            onChange={(e) => setNTD(e.target.value)}
                                            placeholder="輸入 NTD 金額"
                                            disabled={loading}
                                            min="0"
                                            step="0.01"
                                            className="rate-input"
                                        />
                                    </div>
                                    <button
                                        onClick={handleUpdateRate}
                                        disabled={loading || !JPY || !NTD}
                                        className="update-button"
                                    >
                                        {loading ? "更新中..." : "更新匯率"}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : userId && (
                        <div className="no-rates-message">
                            此使用者尚未設定匯率
                        </div>
                    )}
                </>
            )}
            <ToastContainer />
        </div>
    );
};

export default EditRate;