import { useState, useEffect } from "react";
import Axios from "axios";
import './css/rate.css';

let hostname = "http://macbook-pro.local:3002";

const ShowRate = () => {
    const [rateList, setRateList] = useState([]);
    const [loading, setLoading] = useState(true);

    const getRate = async () => {
        try {
            setLoading(true);
            const response = await Axios.get(`${hostname}/RATE`, { timeout: 5000 });
            setRateList(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch rates on component mount
    useEffect(() => {
        getRate();
    }, []);

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