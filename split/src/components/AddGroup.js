import React, { useState } from "react";
import Axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

let hostname = "http://macbook-pro.local:3002";

const AddGroup = () => {
    const [groupName, setGroupName] = useState("");

    const add = () => {
        if (!groupName.trim()) {
            toast.error("Group name cannot be empty");
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
          setGroupName("");  // Clear input after submission
          toast.success("Group added successfully!");  // Show success notification
        })
        .catch((error) => {
          console.error("Error adding group:", error);
          toast.error("Error adding group");  // Show error notification
        });
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
            <ToastContainer />
        </div>
    );
};

export default AddGroup;