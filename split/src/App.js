import "./App.css";
import { useState } from "react";
import Axios from "axios"; // ✅ Make sure this is installed

function App() {
  const [name, setName] = useState("");
  const [userList, setUserList] = useState([]);

  const displayInfo = () => {
    console.log(name);
  };

  const getUser = () => {
    Axios.get("http://localhost:3002/USER").then((response) => {
      console.log(response.data); // ✅ Log only the data
      setUserList(response.data); // ✅ Store the fetched data in state
    }).catch((error) => {
      console.error("Error fetching users:", error);
    });
  };

  return (
    <div className="App">
      <input type="text" onChange={(e) => setName(e.target.value)} />
      <button onClick={displayInfo}>ADD</button>
      <button onClick={getUser}>Show USER</button>

      {/* Display employee list */}
      <ul>
        {userList.map((user) => (
          <li key={user.user_id}>{user.user_name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;