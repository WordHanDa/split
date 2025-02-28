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
    const [creditCard, setCreditCard] = useState(false); // 新增狀態來追蹤是否勾選信用卡

    useEffect(() => {
        // 從 cookies 中讀取選擇的群組 ID
        const savedGroup = Cookies.get('selectedGroup');
        if (savedGroup) {
            try {
                const parsedGroup = JSON.parse(savedGroup);
                setGroupId(parsedGroup.group_id);

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
        console.log("Credit Card:", creditCard);

        if (!billName.trim() || !amount.trim() || !method.trim() || !groupId || !userId) {
            toast.error("All fields are required");
            return;
        }

        // 生成符合 MySQL 格式的日期時間值
        const createTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const createBillRequest = (rateId, yourRateId) => {
            Axios.post(hostname + "/createBill", {  
              bill_name: billName,
              amount: parseFloat(amount),
              user_id: parseInt(userId, 10), // 確保 user_id 是一個整數
              group_id: parseInt(groupId, 10), // 確保 group_id 是一個整數
              method: method,
              note: note,
              create_time: createTime, // 使用符合 MySQL 格式的日期時間值
              rate_id: rateId, // 使用獲取的 rate_id
              credit_card: creditCard ? 1 : 0, // 根據是否勾選信用卡來設定值
              your_rate_id: yourRateId // 使用獲取的 your_rate_id
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
              setCreditCard(false);  // Clear checkbox after submission
              toast.success("Bill added successfully!");  // Show success notification
            })
            .catch((error) => {
              console.error("Error adding bill:", error);
              toast.error("Error adding bill");  // Show error notification
            });
        };

        if (creditCard) {
            // 如果勾選了信用卡，先去撈取最後一筆 rate_id
            Axios.get(`${hostname}/RATE`)
                .then(response => {
                    const rateId = response.data[0].rate_id;
                    createBillRequest(rateId, 0); // 假設 your_rate_id 為 0
                    console.log("Rate ID:", rateId);
                })
                .catch(error => {
                    console.error("Error fetching rate:", error);
                    toast.error("Error fetching rate");  // Show error notification
                });
        } else {
            // 如果沒有勾選信用卡，先去撈取該用戶的最後一筆 your_rate_id
            Axios.get(`${hostname}/YOUR_RATE`, {
                params: { user_id: userId }
            })
                .then(response => {
                    const yourRateId = response.data[0].your_rate_id;
                    createBillRequest(1, yourRateId); // 假設 rate_id 為 1
                    console.log("Your Rate ID:", yourRateId);
                })
                .catch(error => {
                    console.error("Error fetching your rate:", error);
                    toast.error("Error fetching your rate");  // Show error notification
                });
        }
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
            <div>
                <input 
                    type="checkbox" 
                    checked={creditCard} 
                    onChange={(event) => setCreditCard(event.target.checked)} 
                />
                <label>Use Credit Card</label>
            </div>
            <button onClick={addBill}>ADD BILL</button>
            <ToastContainer />
        </div>
    );
};

export default AddBill;