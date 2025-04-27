import React, { useState, useEffect, useCallback, useMemo } from "react";
import Axios from "axios";
import { toast } from 'react-toastify';
import './css/rate.css';

const ShowRate = ({hostname}) => {
    const [rateList, setRateList] = useState([]);
    const [loading, setLoading] = useState(true);

    // 記憶化 API URL
    const apiUrl = useMemo(() => ({
        rates: `${hostname}/RATE`
    }), [hostname]);

    // 使用 useCallback 記憶化 getRate 函數
    const getRate = useCallback(async () => {
        try {
            setLoading(true);
            const response = await Axios.get(apiUrl.rates, { 
                timeout: 5000,
                headers: {
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'skip-browser-warning'
                }
            });

            if (Array.isArray(response.data)) {
                setRateList(response.data);
            } else {
                throw new Error('回應格式錯誤');
            }
        } catch (error) {
            console.error("取得匯率資料失敗:", error);
            toast.error(error.message || "無法取得匯率資料");
        } finally {
            setLoading(false);
        }
    }, [apiUrl]);

    // 更新 useEffect 的依賴
    useEffect(() => {
        getRate();
    }, [getRate]);

    return (
        <div className="rate-container">
            {loading ? (
                <div className="loading-message">載入中...</div>
            ) : (
                <ul className="rate-list">
                    {rateList.map((rate) => (
                        <li key={rate.rate_id} className="rate-item">
                            <div className="rate-info">
                                <div>
                                    <span className="rate-label">現金匯率：</span>
                                    <span className="rate-value">{rate.cash_rate/10000}</span>
                                </div>
                                <div>
                                    <span className="rate-label">即期匯率：</span>
                                    <span className="rate-value">{rate.spot_rate/10000}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {rateList.length === 0 && !loading && (
                <div className="no-rates-message">尚無匯率資料</div>
            )}
        </div>
    );
};

export default ShowRate;