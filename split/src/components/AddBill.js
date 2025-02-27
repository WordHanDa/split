import React, { useState, useEffect } from "react";
import Axios from "axios";
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

let hostname = "http://macbook-pro.local:3002";

const AddBill = () => {
    const [billName, setBillName] = useState("");
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("");
    const [note, setNote] = useState("");
    const [groupId, setGroupId] = useState(null);
    const [userId, setUserId] = useState("");
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // 從 cookies 中讀取選擇的群組 ID
        const savedGroup = Cookies.get('selectedGroup');
        if (savedGroup) {
            try {
                const parsedGroup = JSON.parse(savedGroup);
                setGroupId(parsedGroup.group_id);
                console.log("Group ID:", parsedGroup.group_id); // 添加這行來檢查 groupId

                // 獲取與該群組 ID 對應的用戶列表
                Axios.get(`${hostname}/getUsersByGroupId`, {
                    params: { group_id: parsedGroup.group_id }
                })
                .then(response => {
                    setUsers(response.data);
                })
                .catch(error => {
                    console.error("Error fetching users:", error);
                });
            } catch (error) {
                console.error("Error parsing saved group from cookies:", error);
            }
        }
    }, []);

    const addBill = () => {
        console.log("Bill Name:", billName);
        console.log("Amount:", amount);
        console.log("Method:", method);
        console.log("Group ID:", groupId);
        console.log("User ID:", userId);

        if (!billName.trim() || !amount.trim() || !method.trim() || !groupId || !userId) {
            toast.error("All fields are required");
            return;
        }

        // 生成符合 MySQL 格式的日期時間值
        const createTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

        Axios.post(hostname + "/createBill", {  
          bill_name: billName,
          amount: parseFloat(amount),
          user_id: parseInt(userId, 10), // 確保 user_id 是一個整數
          group_id: parseInt(groupId, 10), // 確保 group_id 是一個整數
          method: method,
          note: note,
          create_time: createTime, // 使用符合 MySQL 格式的日期時間值
          rate_id: 1, // 假設匯率 ID 為 1，你可以根據實際情況修改
          create_card: 1, // 假設創建卡片 ID 為 1，你可以根據實際情況修改
          your_rate_id: 1 // 假設你的匯率 ID 為 1，你可以根據實際情況修改
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(() => {
          console.log("Bill added successfully");
          setBillName("");  // Clear input after submission
          setAmount("");  // Clear input after submission
          setMethod("");  // Clear input after submission
          setNote("");  // Clear input after submission
          setUserId("");  // Clear input after submission
          toast.success("Bill added successfully!");  // Show success notification
        })
        .catch((error) => {
          console.error("Error adding bill:", error);
          toast.error("Error adding bill");  // Show error notification
        });
    };

    return (
        <div>
            <h2>Add Bill</h2>
            <input 
                type="text" 
                value={billName} 
                onChange={(event) => setBillName(event.target.value)} 
                placeholder="Enter bill name"
            />
            <input 
                type="number" 
                value={amount} 
                onChange={(event) => setAmount(event.target.value)} 
                placeholder="Enter amount"
            />
            <input 
                type="text" 
                value={method} 
                onChange={(event) => setMethod(event.target.value)} 
                placeholder="Enter method"
            />
            <input 
                type="text" 
                value={note} 
                onChange={(event) => setNote(event.target.value)} 
                placeholder="Enter note"
            />
            <select value={userId} onChange={(event) => setUserId(event.target.value)}>
                <option value="">Select User</option>
                {users.map(user => (
                    <option key={user.user_id} value={user.user_id}>
                        {user.user_name}
                    </option>
                ))}
            </select>
            <button onClick={addBill}>ADD BILL</button>
            <ToastContainer />
        </div>
    );
};

export default AddBill;