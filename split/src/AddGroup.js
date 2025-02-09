import { useState } from "react";
import Axios from "axios";

let hostname = "http://mac-mini.local:3002";

const AddGroup = () => {  // ✅ Capitalized component name
    const [groupName, setGroupName] = useState(""); // ✅ Moved inside function

    const add = () => {
        if (!groupName.trim()) {
            alert("Group name cannot be empty");
            return;
        }
        Axios.post(hostname + "/createGroup", {  
          name: groupName,
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(() => {
          console.log("Group added successfully");
          setGroupName("");  // ✅ Clear input after submission
        })
        .catch((error) => console.error("Error adding group:", error));
    };

    return (
        <div>
            <input 
                type="text" 
                value={groupName} 
                onChange={(event) => setGroupName(event.target.value)} 
                placeholder="Enter group name"
            />
            <button onClick={add}>ADD</button>
        </div>
    );
};

export default AddGroup;