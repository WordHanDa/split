import { useState } from "react";
import Axios from "axios";

let hostname = "http://macbook-pro.local:3002";

const AddUser = () => {  // ✅ Capitalized component name
    const [userName, setUserName] = useState(""); // ✅ Moved inside function

    const add = () => {
        if (!userName.trim()) {
            alert("User name cannot be empty");
            return;
        }
        Axios.post(hostname + "/createUser", {  
          name: userName,
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(() => {
          console.log("User added successfully");
          setUserName("");  // ✅ Clear input after submission
        })
        .catch((error) => console.error("Error adding user:", error));
    };

    return (
        <div>
            <input 
                type="text" 
                value={userName} 
                onChange={(event) => setUserName(event.target.value)} 
                placeholder="Enter user name"
            />
            <button onClick={add}>ADD</button>
        </div>
    );
};

export default AddUser;