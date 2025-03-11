import React, { useState, useEffect, useCallback } from "react";
import Axios from "axios";
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddSplit from './AddSplit';
import AddItem from './AddItem';

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
    const [showSplit, setShowSplit] = useState(false);
    const [getSplitData, setGetSplitData] = useState(null);
    const [newBillId, setNewBillId] = useState(null); // 新增狀態來儲存新建帳單的 ID
    const [getItemData, setGetItemData] = useState(null); // 新增狀態來儲存 AddItem 的回調函數

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

    const handleMethodChange = (event) => {
        const selectedMethod = parseInt(event.target.value, 10);
        setMethod(selectedMethod);
        // 當選擇方法為 2 (以百分比) 時顯示 AddSplit
        setShowSplit(selectedMethod === 2);
    };

    const addBill = () => {
        console.log("Bill Name:", billName);
        console.log("Amount:", amount);
        console.log("Method:", method);
        console.log("Group ID:", groupId);
        console.log("User ID:", userId);
        console.log("Credit Card:", creditCard);

        if (!billName.trim() || !amount.trim() || method === "" || !groupId || !userId) {
            toast.error("All fields are required");
            return;
        }

        // 確保 amount 是一個有效的數字
        const parsedAmount = parseInt(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            toast.error("Amount must be a positive number");
            return;
        }

        // 確保 method 是一個有效的數字
        const parsedMethod = parseInt(method, 10);
        if (isNaN(parsedMethod) || parsedMethod < 0 || parsedMethod > 2) {
            toast.error("Method must be a valid option");
            return;
        }

        // 使用局部變數來儲存分帳資料，不需要 state
        let splitData = null;
        if (method === 2) {
            if (!getSplitData) {
                toast.error("請先設定分帳比例");
                return;
            }
            
            splitData = getSplitData();
            if (!splitData) {
                toast.error("分帳比例驗證失敗");
                return;
            }
            
            console.log("Split data validated:", splitData);
        }

        // 生成符合 MySQL 格式的日期時間值
        const createTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const createBillRequest = (rateId, yourRateId) => {
            // Create loading toast
            const loadingToastId = toast.loading("Creating bill...");

            Axios.post(hostname + "/createBill", {  
                bill_name: billName,
                amount: parsedAmount,
                user_id: parseInt(userId, 10),
                group_id: parseInt(groupId, 10),
                method: parsedMethod,
                note: note,
                create_time: createTime,
                rate_id: rateId,
                credit_card: creditCard ? 1 : 0,
                your_rate_id: yourRateId
            })
            .then(async (response) => {
                const newBillId = response.data.result.insertId;
                
                try {
                    if (method === 2 && splitData) {
                        await Axios.post(`${hostname}/createSplitRecord`, {
                            bill_id: newBillId,
                            percentages: splitData
                        });
                    } 
                    else if (method === 1 && getItemData) {
                        const items = getItemData();
                        if (items && Array.isArray(items)) {
                            await Promise.all(items.map(item => 
                                Axios.post(`${hostname}/createItem`, {
                                    item_amount: item.item_amount,
                                    bill_id: newBillId,
                                    user_id: item.user_id,
                                    item_name: item.item_name
                                })
                            ));
                        }
                    }

                    // Clear form fields
                    setBillName("");
                    setAmount("");
                    setMethod("");
                    setNote("");
                    setUserId("");
                    setCreditCard(false);
                    setShowSplit(false);
                    setNewBillId(null);

                    // Prepare success message
                    const methodMessages = {
                        1: "確切金額",
                        2: "百分比",
                        3: "均分"
                    };
                    const creditCardText = creditCard ? "（信用卡）" : "";

                    // Update loading toast to success
                    toast.update(loadingToastId, {
                        render: `帳單新增成功！分帳方式：${methodMessages[method]}${creditCardText}`,
                        type: "success",
                        isLoading: false,
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: "light"
                    });

                } catch (error) {
                    // Update loading toast to error
                    toast.update(loadingToastId, {
                        render: "帳單建立成功但其他操作失敗，請檢查",
                        type: "error",
                        isLoading: false,
                        autoClose: 5000
                    });
                    console.error("Error in follow-up operations:", error);
                    throw error;
                }
            })
            .catch((error) => {
                // Update loading toast to error
                toast.update(loadingToastId, {
                    render: "新增帳單失敗",
                    type: "error",
                    isLoading: false,
                    autoClose: 5000
                });
                console.error("Error adding bill:", error);
                toast.error("新增帳單失敗");
            });
        };

        const processItemsAndCreateBill = (rateId, yourRateId) => {
            if (method === 1 && getItemData) {
                const items = getItemData();
                if (items && Array.isArray(items)) {
                    // Calculate total amount from items
                    const totalItemAmount = items.reduce((sum, item) => sum + parseInt(item.item_amount), 0);
                    
                    // Compare with bill amount
                    if (totalItemAmount !== parsedAmount) {
                        const difference = parsedAmount - totalItemAmount;
                        toast.error(`Total price should match bill price, still missing ${difference} JPY`);
                        return;
                    }

                    // Continue with bill creation if amounts match
                    createBillRequest(rateId, yourRateId);
                } else {
                    toast.error("Please add items for the bill");
                    return;
                }
            } else {
                // Continue with bill creation for other methods
                createBillRequest(rateId, yourRateId);
            }
        };

        if (creditCard) {
            // 如果勾選了信用卡，先去撈取最後一筆 rate_id
            Axios.get(`${hostname}/RATE`)
                .then(response => {
                    const rateId = response.data[0].rate_id;
                    processItemsAndCreateBill(rateId, 0); // 假設 your_rate_id 為 0
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
                    processItemsAndCreateBill(1, yourRateId); // 假設 rate_id 為 1
                    console.log("Your Rate ID:", yourRateId);
                })
                .catch(error => {
                    console.error("Error fetching your rate:", error);
                    toast.error("Error fetching your rate");  // Show error notification
                });
        }
    };

    const handleItemComplete = useCallback((getItemDataFn) => {
        setGetItemData(() => getItemDataFn);
    }, []);

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
            <select value={method} onChange={handleMethodChange}>
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
            {showSplit && (
                <AddSplit 
                    groupId={groupId}
                    users={users}
                    onSplitComplete={(validateFn) => {
                        setGetSplitData(() => validateFn);
                    }}
                />
            )}
            {method === 1 && (
                <AddItem 
                    onItemComplete={handleItemComplete}
                />
            )}
            <button onClick={addBill}>ADD BILL</button>
            <ToastContainer />
        </div>
    );
};

export default AddBill;