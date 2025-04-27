import React, { useState, useEffect, useCallback } from 'react';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import './css/rate.css';

const AddRate = ({hostname}) => {
    const [JPY, setJPY] = useState("");
    const [NTD, setNTD] = useState("");
    const [rate, setRate] = useState(null);
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState("");
    const [groupId, setGroupId] = useState(null);

    // 將獲取用戶的邏輯封裝到 useCallback 中
    const fetchUsers = useCallback(async (groupId) => {
        try {
          const response = await Axios.get(`${hostname}/getUsersByGroupId`, {
            headers: {
              'ngrok-skip-browser-warning': 'skip-browser-warning'
            },
            params: { group_id: groupId }
          });
          setUsers(response.data);
        } catch (error) {
          console.error("Error fetching users:", error);
          toast.error("無法取得群組成員");
        }
      }, [hostname]);

    useEffect(() => {
        // Get selected group from cookies
        const savedGroup = Cookies.get('selectedGroup');
        if (savedGroup) {
            try {
                const parsedGroup = JSON.parse(savedGroup);
                setGroupId(parsedGroup.group_id);
                fetchUsers(parsedGroup.group_id);
            } catch (error) {
                console.error("Error parsing saved group:", error);
                toast.error("群組資料錯誤");
            }
        } else {
            toast.error("請先選擇群組");
        }
    }, [fetchUsers]);

    // 也將 add 函數使用 useCallback 包裝
    const handleAddRate = useCallback(() => {
        if (!JPY.trim() || !NTD.trim() || !userId) {
            toast.error("JPY, NTD rates and user selection cannot be empty");
            return;
        }

        const convertedRate = parseFloat(JPY) / parseFloat(NTD);
        setRate(convertedRate);

        Axios.post(`${hostname}/createRate`, {
            JPY,
            NTD,
            user_id: parseInt(userId, 10)
        }, {
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'skip-browser-warning'
            }
        })
        .then(() => {
            console.log("Rate added successfully");
            setJPY("");
            setNTD("");
            setUserId("");
            toast.success("Rate added successfully!");
        })
        .catch((error) => {
            console.error("Error adding rate:", error);
            toast.error("Error adding rate");
        });
    }, [hostname, JPY, NTD, userId]);

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
                    <button className='add-button' onClick={handleAddRate}>ADD</button>
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