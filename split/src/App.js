import './App.css';
import Axios from "axios";
import AddUser from './AddUser';
import ShowUser from './ShowUser';  // ✅ Ensure correct capitalization

import { useState } from "react";

let hostname = "http://mac-mini.local:3002";

function App() {
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
    <div className="App">
      <AddUser />   {/* ✅ Use JSX syntax */}
      <ShowUser />  {/* ✅ Use JSX syntax */}
      <button onClick={getRate}>Show RATE</button>
      <ul>
        {rateList.map((rate) => (
          <li key={rate.rate_id}>spot_rate: {rate.spot_rate} cash_rate: {rate.cash_rate}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;