import React, { useState } from 'react';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

let hostname = "http://macbook-pro.local:3002";

const AddRate = () => {
    const [JPY, setJPY] = useState("");
    const [NTD, setNTD] = useState("");
    const [rate, setRate] = useState(null);

    const add = () => {
        if (!JPY.trim() || !NTD.trim()) {
            toast.error("JPY and NTD rates cannot be empty");
            return;
        }

        const convertedRate = parseFloat(JPY) / parseFloat(NTD);
        setRate(convertedRate);

        Axios.post(hostname + "/createRate", {  
          JPY,
          NTD,
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(() => {
          console.log("Rate added successfully");
          setJPY("");  // Clear input after submission
          setNTD("");  // Clear input after submission
          toast.success("Rate added successfully!");  // Show success notification
        })
        .catch((error) => {
          console.error("Error adding rate:", error);
          toast.error("Error adding rate");  // Show error notification
        });
    };

    return (
        <div>
            <input 
                type="text" 
                value={JPY} 
                onChange={(event) => setJPY(event.target.value)} 
                placeholder="Enter JPY rate"
            />
            <input 
                type="text" 
                value={NTD} 
                onChange={(event) => setNTD(event.target.value)} 
                placeholder="Enter NTD rate"
            />
            <button onClick={add}>ADD</button>
            {rate !== null && <p>Converted Rate: {rate}</p>}
            <ToastContainer />
        </div>
    );
};

export default AddRate;