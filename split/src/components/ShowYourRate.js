import React, { useState } from "react";
import Axios from "axios";

let hostname = "http://120.126.16.20:3002";

const ShowYourRate = () => {
    const [rateList, setRateList] = useState([]);

    const getRate = () => {
        Axios.get(hostname + "/YOUR_RATE", { timeout: 5000 })
          .then((response) => {
            console.log(response.data);
            setRateList(response.data);
          })
          .catch((error) => console.error("Error fetching data:", error));
    };

    return (
        <div>
            <button onClick={getRate}>Show Your Rate</button>
            <ul>
                {rateList.map((rate, index) => (
                    <li key={index}>
                        ID: {rate.your_rate_id} | JPY: {rate.JPY} | NTD: {rate.NTD}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ShowYourRate;