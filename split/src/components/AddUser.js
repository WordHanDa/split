import React, { useState } from 'react';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

let hostname = "http://120.126.16.21:3002";

const AddUser = () => {
    const [userName, setUserName] = useState("");

    const add = () => {
        if (!userName.trim()) {
            toast.error("User name cannot be empty");
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
          setUserName("");  // Clear input after submission
          toast.success("User added successfully!");  // Show success notification
        })
        .catch((error) => {
          console.error("Error adding user:", error);
          toast.error("Error adding user");  // Show error notification
        });
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
            <ToastContainer />
        </div>
    );
};

export default AddUser;