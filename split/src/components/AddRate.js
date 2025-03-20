import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

let hostname = "http://120.126.16.21:3002";

const AddRate = () => {
    const [JPY, setJPY] = useState("");
    const [NTD, setNTD] = useState("");
    const [rate, setRate] = useState(null);
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState("");

    useEffect(() => {
        // 獲取所有用戶列表
        Axios.get(`${hostname}/USER`)
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error("Error fetching users:", error);
            });
    }, []);

    const add = () => {
        if (!JPY.trim() || !NTD.trim() || !userId) {
            toast.error("JPY, NTD rates and user selection cannot be empty");
            return;
        }

        const convertedRate = parseFloat(JPY) / parseFloat(NTD);
        setRate(convertedRate);

        Axios.post(hostname + "/createRate", {  
          JPY,
          NTD,
          user_id: parseInt(userId, 10) // 確保 user_id 是一個整數
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(() => {
          console.log("Rate added successfully");
          setJPY("");  // Clear input after submission
          setNTD("");  // Clear input after submission
          setUserId("");  // Clear input after submission
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
            <select value={userId} onChange={(event) => setUserId(event.target.value)}>
                <option value="">Select User</option>
                {users.map(user => (
                    <option key={user.user_id} value={user.user_id}>
                        {user.user_name}
                    </option>
                ))}
            </select>
            <button onClick={add}>ADD</button>
            {rate !== null && <p>Converted Rate: {rate}</p>}
            <ToastContainer />
        </div>
    );
};

export default AddRate;