import { useState } from "react";
import Axios from "axios";
import './style.css';

let hostname = "http://macbook-pro.local:3002";

const ShowUser = () => {  // ✅ Ensure the function starts with an uppercase letter
    const [userList, setUserList] = useState([]);

    const getUser = () => {
        Axios.get(hostname + "/USER", { timeout: 5000 })
          .then((response) => {
            console.log(response.data);
            setUserList(response.data);
          })
          .catch((error) => console.error("Error fetching data:", error));
    };

    return (
        <div>
            <button onClick={getUser}>Show USER</button>
            <ul>
                {userList.map((user) => (
                    <li key={user.user_id || user.id}>{user.user_name}</li>
                ))}
            </ul>
        </div>
    );
};

export default ShowUser; // ✅ Ensure correct export