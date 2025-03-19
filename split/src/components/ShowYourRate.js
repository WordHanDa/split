import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

let hostname = "http://120.126.16.20:3002";

const ShowYourRate = () => {
    const [rateList, setRateList] = useState([]);
    const [loading, setLoading] = useState(false);
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

    const getRate = () => {
        if (!groupId) {
            toast.error("Please select a group first");
            return;
        }

        setLoading(true);
        Axios.get(`${hostname}/YOUR_RATE/latest`, {
            params: { group_id: groupId },
            timeout: 5000
        })
            .then((response) => {
                setRateList(response.data);
                if (response.data.length === 0) {
                    toast.info("No rates found for this group");
                }
            })
            .catch((error) => {
                console.error("Error fetching rates:", error);
                toast.error("Failed to fetch rates");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="show-rate-container">
            <button 
                onClick={getRate}
                disabled={loading || !groupId}
            >
                {loading ? 'Loading...' : 'Show Latest Rates'}
            </button>
            {rateList.length > 0 && (
                <ul className="rate-list">
                    {rateList.map((rate, index) => (
                        <li key={index} className="rate-item">
                            <span className="user-name">{rate.user_name}</span>
                            <span className="rate-values">
                                JPY: {rate.JPY} | NTD: {rate.NTD}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ShowYourRate;