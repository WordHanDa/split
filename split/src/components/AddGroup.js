import React, { useState } from "react";
import Axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './css/group.css';

const AddGroup = ({hostname}) => {
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
      <div className="add-group-container">
      <input 
          type="text" 
          value={groupName} 
          onChange={(event) => setGroupName(event.target.value)} 
          placeholder="Enter group name"
          className="add-group-input"
      />
      <button 
          onClick={add}
          className="add-button"
      >
          ADD
      </button>
      <ToastContainer/>
  </div>
    );
};

export default AddGroup;