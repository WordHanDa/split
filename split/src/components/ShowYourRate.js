import React, { useState } from 'react';
import Axios from 'axios';
import { toast } from 'react-toastify';

let hostname = "http://120.126.16.20:3002";

const ShowYourRate = () => {
    const [rateList, setRateList] = useState([]);
    const [loading, setLoading] = useState(false);

    const getRate = () => {
        setLoading(true);
        Axios.get(hostname + "/YOUR_RATE/latest", { timeout: 5000 })
            .then((response) => {
                setRateList(response.data);
                if (response.data.length === 0) {
                    toast.info("No rates found");
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
        <div>
            <button 
                onClick={getRate}
                disabled={loading}
            >
                {loading ? 'Loading...' : 'Show Latest Rates'}
            </button>
            <ul>
                {rateList.map((rate, index) => (
                    <li key={index}>
                        {rate.user_name} - JPY: {rate.JPY} NTD: {rate.NTD}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ShowYourRate;