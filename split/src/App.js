import './App.css';
import { useState } from "react";
import Axios from "axios";
let hostname = "http://mac-mini.local:3002";
function App() {
  const [employeeList, setEmployeeList] = useState([]);
  const [rateList, setRateList] = useState([]);

  const getEmployee = () => {
    Axios.get(hostname + "/USER", { timeout: 5000 })
    .then((response) => {
      console.log(response.data);
      setEmployeeList(response.data);
    })
    .catch((error) => console.error("Error fetching data:", error));
  };

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
      <button onClick={getEmployee}>Show USER</button>
      <ul>
        {employeeList.map((employee, index) => (
          <li key={index}>{employee.user_name}</li> // ✅ Display user_name correctly
        ))}
      </ul>

      <button onClick={getRate}>Show RATE</button>
      <ul>
        {rateList.map((rate) => (
          <li index={rate.rate_id}>spot_rate:{rate.spot_rate} cash_rate:{rate.cash_rate}</li> // ✅ Display user_name correctly
        ))}
      </ul>
    </div>
  );
}

export default App;