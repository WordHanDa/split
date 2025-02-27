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

    useEffect(() => {
        // 從 cookies 中讀取選擇的群組 ID
        const savedGroupId = Cookies.get('selectedGroupId');
        if (savedGroupId) {
            setGroupId(savedGroupId);
        }
    }, []);

    const addBill = () => {
        if (!billName.trim() || !amount.trim() || !method.trim() || !groupId) {
            toast.error("All fields are required");
            return;
        }
        Axios.post(hostname + "/createBill", {  
          bill_name: billName,
          amount: parseFloat(amount),
          user_id: 1, // 假設用戶 ID 為 1，你可以根據實際情況修改
          group_id: groupId,
          method: method,
          note: note,
          create_time: new Date().toISOString(),
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
                type="text" 
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
            <button onClick={addBill}>ADD BILL</button>
            <ToastContainer />
        </div>
    );
};

export default AddBill;