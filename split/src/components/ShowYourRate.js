import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import './css/rate.css';

let hostname = "http://macbook-pro.local:3002";

const ShowYourRate = () => {
    const [rateList, setRateList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupId, setGroupId] = useState(null);

    // Load group ID from cookies on mount
    useEffect(() => {
        const savedGroup = Cookies.get('selectedGroup');
        if (savedGroup) {
            try {
                const parsedGroup = JSON.parse(savedGroup);
                setGroupId(parsedGroup.group_id);
            } catch (error) {
                console.error("Error parsing saved group:", error);
                toast.error("Error loading group data");
            }
        }
    }, []);

    // Fetch rates when groupId is available
    useEffect(() => {
        if (!groupId) {
            setLoading(false);
            return;
        }

        const fetchRates = async () => {
            try {
                setLoading(true);
                const response = await Axios.get(`${hostname}/YOUR_RATE/latest`, {
                    params: { group_id: groupId },
                    timeout: 5000
                });
                setRateList(response.data);
                if (response.data.length === 0) {
                    toast.info("No rates found for this group");
                }
            } catch (error) {
                console.error("Error fetching rates:", error);
                toast.error("Failed to fetch rates");
            } finally {
                setLoading(false);
            }
        };

        fetchRates();
    }, [groupId]);

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