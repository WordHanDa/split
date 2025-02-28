import React, { useState, useEffect } from "react";
import Axios from "axios";
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddSplit from './AddSplit';  // 導入 AddSplit 組件

let hostname = "http://macbook-pro.local:3002";

const AddBill = () => {
    const [billName, setBillName] = useState("");
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState(""); // 修改為空字串
    const [note, setNote] = useState("");
    const [groupId, setGroupId] = useState(null);
    const [userId, setUserId] = useState("");
    const [users, setUsers] = useState([]);
    const [creditCard, setCreditCard] = useState(false); // 新增狀態來追蹤是否勾選信用卡
    const [showSplit, setShowSplit] = useState(false);  // 新增狀態控制 AddSplit 的顯示
    const [splitDataToSave, setSplitDataToSave] = useState(null);

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
        // 驗證輸入
        if (!billName || !amount || !method || !userId) {
            toast.error("請填寫所有必要欄位");
            return;
        }

        const createBillRequest = (rateId, yourRateId) => {
            // 先建立帳單
            Axios.post(`${hostname}/createBill`, {
                bill_name: billName,
                amount: parseFloat(amount),
                user_id: parseInt(userId),
                group_id: parseInt(groupId),
                method: parseInt(method),
                note: note,
                credit_card: creditCard ? 1 : 0,
            })
            .then((response) => {
                const billId = response.data.insertId;
                
                // 根據不同的分帳方式處理 SPLIT_RECORD
                if (method === "2" && splitDataToSave) {
                    // 按比例分帳
                    const splits = Object.entries(splitDataToSave).map(([userId, percentage]) => ({
                        bill_id: billId,
                        user_id: parseInt(userId),
                        percentage: Math.round(parseFloat(percentage) * 1000)
                    }));
                    return Axios.post(`${hostname}/createSplit`, { splits });
                } else if (method === "3") {
                    // 均分處理
                    const equalPercentage = Math.round((100 / users.length) * 1000);
                    const splits = users.map(user => ({
                        bill_id: billId,
                        user_id: user.user_id,
                        percentage: equalPercentage
                    }));
                    return Axios.post(`${hostname}/createSplit`, { splits });
                } else if (method === "1") {
                    // 確切金額，暫時設定付款者 100%
                    const splits = [{
                        bill_id: billId,
                        user_id: parseInt(userId),
                        percentage: 100000 // 100% * 1000
                    }];
                    return Axios.post(`${hostname}/createSplit`, { splits });
                }
            })
            .then(() => {
                toast.success("帳單新增成功！");
                // 重置所有欄位
                setBillName("");
                setAmount("");
                setMethod("");
                setNote("");
                setUserId("");
                setCreditCard(false);
                setShowSplit(false);
                setSplitDataToSave(null);
            })
            .catch((error) => {
                console.error("Error:", error);
                toast.error(error.response?.data?.error || "新增失敗");
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

    // 修改 method 的 onChange 處理函數
    const handleMethodChange = (event) => {
        const selectedMethod = parseInt(event.target.value, 10);
        setMethod(selectedMethod);
        // 當選擇方法 2（按比例）時顯示 AddSplit
        setShowSplit(selectedMethod === 2);
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
            <select 
                value={method} 
                onChange={handleMethodChange}
            >
                <option value="">Select Method</option>
                <option value="1">確切金額</option>
                <option value="2">以百分比</option>
                <option value="3">均分</option>
            </select>
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

            {/* 當 showSplit 為 true 時顯示 AddSplit 組件 */}
            {showSplit && (
                <AddSplit 
                    groupId={groupId}
                    users={users}
                    onSplitComplete={(splitData) => {
                        setSplitDataToSave(splitData);
                        toast.info("請點擊 ADD BILL 完成新增");
                    }}
                />
            )}

            <button onClick={addBill}>ADD BILL</button>
            <ToastContainer />
        </div>
    );
};

export default AddBill;