import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Axios from 'axios';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import './css/rate.css';

const ShowYourRate = ({hostname}) => {
    const [rateList, setRateList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupId, setGroupId] = useState(null);

    // 記憶化 API URL
    const apiUrls = useMemo(() => ({
        latestRates: `${hostname}/YOUR_RATE/latest`
    }), [hostname]);

    // 使用 useCallback 記憶化 fetchRates 函數
    const fetchRates = useCallback(async (gid) => {
        if (!gid) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await Axios.get(apiUrls.latestRates, {
                params: { group_id: gid },
                timeout: 5000,
                headers: {
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'skip-browser-warning'
                }
            });

            setRateList(response.data);
            if (response.data.length === 0) {
                toast.info("此群組尚無匯率資料");
            }
        } catch (error) {
            console.error("取得匯率資料失敗:", error);
            toast.error("無法取得匯率資料");
        } finally {
            setLoading(false);
        }
    }, [apiUrls]);

    // 分開處理群組 ID 的載入
    useEffect(() => {
        const savedGroup = Cookies.get('selectedGroup');
        if (savedGroup) {
            try {
                const parsedGroup = JSON.parse(savedGroup);
                setGroupId(parsedGroup.group_id);
            } catch (error) {
                console.error("群組資料解析失敗:", error);
                toast.error("群組資料載入失敗");
            }
        }
    }, []);

    // 當 groupId 或 fetchRates 更新時重新取得資料
    useEffect(() => {
        if (groupId) {
            fetchRates(groupId);
        }
    }, [groupId, fetchRates]);

    return (
        <div className="show-rate-container">
            {loading ? (
                <div className="loading-message">載入中...</div>
            ) : !groupId ? (
                <div className="no-group-message">請先選擇群組</div>
            ) : (
                <>
                    {rateList.length > 0 ? (
                        <ul className="rate-list">
                            {rateList.map((rate, index) => (
                                <li key={index} className="rate-item">
                                    <span className="user-name">{rate.user_name}</span>
                                    <span className="rate-values">
                                        JPY: {rate.JPY} | NTD: {rate.NTD} Rate: {rate.JPY / rate.NTD/100}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="no-rates-message">尚無匯率資料</div>
                    )}
                </>
            )}
        </div>
    );
};

export default ShowYourRate;