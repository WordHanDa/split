import { useState } from "react";
import Axios from "axios";

let hostname = "http://mac-mini.local:3002";

const ShowRate = () => {  // ✅ Ensure the function starts with an uppercase letter
    const [rateList, setRateList] = useState([]);

    const getRate = () => {
        Axios.get(hostname + "/RATE", { timeout: 5000 })
          .then((response) => {
            console.log(response.data);
            setRateList(response.data);
          })
          .catch((error) => console.error("Error fetching data:", error));
      };

    return (
        <div>
            <button onClick={getRate}>Show Rate</button>
            <ul>
                {rateList.map((rate, index) => (
                    <li key={index}>
                        {rate.rate_id} spot_rate: {rate.spot_rate} cash_rate: {rate.cash_rate}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ShowRate; // ✅ Ensure correct export