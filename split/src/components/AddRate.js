import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

let hostname = "http://120.126.16.21:3002";

const AddRate = () => {
    const [JPY, setJPY] = useState("");
    const [NTD, setNTD] = useState("");
    const [rate, setRate] = useState(null);
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState("");
    const [groupId, setGroupId] = useState(null);

    useEffect(() => {
        // Get selected group from cookies
        const savedGroup = Cookies.get('selectedGroup');
        if (savedGroup) {
            try {
                const parsedGroup = JSON.parse(savedGroup);
                setGroupId(parsedGroup.group_id);

                // Fetch users for the selected group
                Axios.get(`${hostname}/getUsersByGroupId`, {
                    params: { group_id: parsedGroup.group_id }
                })
                .then(response => {
                    setUsers(response.data);
                })
                .catch(error => {
                    console.error("Error fetching users:", error);
                    toast.error("無法取得群組成員");
                });
            } catch (error) {
                console.error("Error parsing saved group:", error);
                toast.error("群組資料錯誤");
            }
        } else {
            toast.error("請先選擇群組");
        }
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
        <div className="add-rate-container">
            {groupId ? (
                <>
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
                    <select 
                        value={userId} 
                        onChange={(event) => setUserId(event.target.value)}
                    >
                        <option value="">Select User</option>
                        {users.map(user => (
                            <option key={user.user_id} value={user.user_id}>
                                {user.user_name}
                            </option>
                        ))}
                    </select>
                    <button onClick={add}>ADD</button>
                    {rate !== null && <p>Converted Rate: {rate}</p>}
                </>
            ) : (
                <div className="no-group-message">請先選擇群組</div>
            )}
            <ToastContainer />
        </div>
    );
};

export default AddRate;