import React, { useState, useEffect, useCallback } from "react";
import Axios from "axios";
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddSplit from './AddSplit';
import AddItem from './AddItem';

// Define the hostname for API calls
const hostname = "http://macbook-pro.local:3002";

// Create a global toast container ID to ensure uniqueness
const TOAST_CONTAINER_ID = "add-bill-toast-container";

const AddBill = () => {
    // State definitions
    const [billName, setBillName] = useState("");
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState(""); 
    const [note, setNote] = useState("");
    const [groupId, setGroupId] = useState(null);
    const [userId, setUserId] = useState("");
    const [users, setUsers] = useState([]);
    const [creditCard, setCreditCard] = useState(false);
    const [showSplit, setShowSplit] = useState(false);
    const [getSplitData, setGetSplitData] = useState(null);
    const [getItemData, setGetItemData] = useState(null);
    const [processing, setProcessing] = useState(false);
    
    // Load group and users on component mount
    useEffect(() => {
    // Load selected group from cookies
    const savedGroup = Cookies.get('selectedGroup');
    if (savedGroup) {
        try {
            const parsedGroup = JSON.parse(savedGroup);
            setGroupId(parsedGroup.group_id);

            // Get users list for the group
            Axios.get(`${hostname}/getUsersByGroupId`, {
                params: { group_id: parsedGroup.group_id }
            })
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error("Error fetching users:", error);
                showMessage("Error fetching users", "error");
            });
        } catch (error) {
            console.error("Error parsing saved group from cookies:", error);
            showMessage("Error loading group data", "error");
        }
    }
}, [showMessage]);

    // Memoized toast function to prevent recreating on every render
    const showMessage = useCallback((message, type = "info") => {
        try {
            const toastOptions = {
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                toastId: `toast-${Date.now()}`, 
                containerId: TOAST_CONTAINER_ID
            };
            
            // Delay the toast slightly to ensure DOM is ready
            setTimeout(() => {
                switch(type) {
                    case "success":
                        toast.success(message, toastOptions);
                        break;
                    case "error":
                        toast.error(message, toastOptions);
                        break;
                    default:
                        toast.info(message, toastOptions);
                        break;
                }
                console.log(`[${type.toUpperCase()}]`, message);
            }, 100);
        } catch (error) {
            console.error("Toast notification failed:", error);
            window.alert(message); // Use window.alert as a reliable fallback
        }
    }, []);

    // Handle method selection change
    const handleMethodChange = (e) => {
        const selectedMethod = parseInt(e.target.value, 10);
        setMethod(selectedMethod);
        setShowSplit(selectedMethod === 2);
    };

    // Validate that item amounts match total bill amount
    const validateItemsTotal = (items) => {
        if (!items) return false;
        const itemsTotal = items.reduce((sum, item) => sum + item.item_amount, 0);
        return itemsTotal === parseInt(amount);
    };

    // Reset form fields
    const resetForm = () => {
        setBillName("");
        setAmount("");
        setMethod("");
        setNote("");
        setUserId("");
        setCreditCard(false);
        setShowSplit(false);
        setGetSplitData(null);
        setGetItemData(null);
    };

    // Create bill record
    const createBillRecord = (rateId, yourRateId) => {
        // Generate SQL-compatible datetime
        const createTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const parsedAmount = parseInt(amount);
        const parsedMethod = parseInt(method, 10);
        
        // Prevent double submission
        if (processing) return;
        setProcessing(true);
        
        // Create the API request payload
        Axios.post(`${hostname}/createBill`, {  
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
        .then((response) => {
            const newBillId = response.data.result.insertId;
            
            if (parsedMethod === 2 && getSplitData) {
                // Handle percentage-based split
                const splitData = getSplitData();
                
                Axios.post(`${hostname}/createSplitRecord`, {
                    bill_id: newBillId,
                    percentages: splitData
                })
                .then(() => {
                    console.log("Split record added successfully");
                    
                    // Reset form first, then show notification
                    resetForm();
                    setProcessing(false);
                    
                    // Ensure DOM is updated before showing toast
                    setTimeout(() => {
                        showMessage("帳單和分帳記錄新增成功！", "success");
                    }, 200);
                })
                .catch((error) => {
                    console.error("Error adding split record:", error);
                    setProcessing(false);
                    showMessage("分帳記錄新增失敗，請重試", "error");
                });
            } else if (parsedMethod === 1 && getItemData) {
                // Handle item-based split - FIXED: Use createItem endpoint!
                const itemData = getItemData();
                
                // Validate itemData
                if (!itemData || !Array.isArray(itemData)) {
                    console.error("Invalid item data:", itemData);
                    setProcessing(false);
                    showMessage("項目資料格式錯誤", "error");
                    return;
                }

                // Changed from createItemRecord to createItem
                Axios.post(`${hostname}/createItem`, {
                    bill_id: newBillId,
                    items: itemData
                })
                .then((response) => {
                    if (response.data.success) {
                        console.log("Item records added successfully");
                        resetForm();
                        setProcessing(false);
                        setTimeout(() => {
                            showMessage("帳單和項目記錄新增成功！", "success");
                        }, 200);
                    } else {
                        throw new Error(response.data.message || "Failed to add items");
                    }
                })
                .catch((error) => {
                    console.error("Error adding item records:", error);
                    setProcessing(false);
                    const errorMessage = error.response?.data?.message || "項目記錄新增失敗，請重試";
                    showMessage(errorMessage, "error");
                });
            } else {
                // Just a regular bill (not percentage or item-based)
                resetForm();
                setProcessing(false);
                
                // Ensure DOM is updated before showing toast
                setTimeout(() => {
                    showMessage("帳單新增成功！", "success");
                }, 200);
            }
        })
        .catch((error) => {
            console.error("Error adding bill:", error);
            setProcessing(false);
            showMessage("新增帳單失敗", "error");
        });
    };

    // Handle the ADD BILL button click
    const handleAddBill = (e) => {
        // Stop any default form submission behavior
        if (e) e.preventDefault();
        
        console.log("Add Bill button clicked");
        
        // Validate form fields
        if (!billName.trim() || !amount.trim() || method === "" || !groupId || !userId) {
            showMessage("All fields are required", "error");
            return;
        }

        // Validate amount
        const parsedAmount = parseInt(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            showMessage("Amount must be a positive number", "error");
            return;
        }

        // Validate method
        const parsedMethod = parseInt(method, 10);
        if (isNaN(parsedMethod) || parsedMethod < 0 || parsedMethod > 3) {
            showMessage("Method must be a valid option", "error");
            return;
        }

        // Handle split data if percentage method
        if (parsedMethod === 2) {
            if (!getSplitData) {
                showMessage("請先設定分帳比例", "error");
                return;
            }
            
            const splitData = getSplitData();
            if (!splitData) {
                showMessage("分帳比例驗證失敗", "error");
                return;
            }
            
            console.log("Split data validated:", splitData);
        }

        // Handle item data if exact amount method
        if (parsedMethod === 1) {
            if (!getItemData) {
                showMessage("請先新增項目", "error");
                return;
            }
            
            const itemData = getItemData();
            if (!itemData) {
                showMessage("項目驗證失敗", "error");
                return;
            }
            
            if (!validateItemsTotal(itemData)) {
                showMessage("項目金額總和必須等於帳單總額", "error");
                return;
            }
            
            console.log("Item data validated:", itemData);
        }

        // Process the bill based on credit card selection
        if (creditCard) {
            // Get latest rate_id for credit card
            Axios.get(`${hostname}/RATE`)
                .then(response => {
                    if (response.data && response.data.length > 0) {
                        const rateId = response.data[0].rate_id;
                        createBillRecord(rateId, 0);
                        console.log("Rate ID:", rateId);
                    } else {
                        showMessage("No rate data found", "error");
                    }
                })
                .catch(error => {
                    console.error("Error fetching rate:", error);
                    showMessage("Error fetching rate", "error");
                });
        } else {
            // Get user's last your_rate_id
            Axios.get(`${hostname}/YOUR_RATE`, {
                params: { user_id: userId }
            })
                .then(response => {
                    if (response.data && response.data.length > 0) {
                        const yourRateId = response.data[0].your_rate_id;
                        createBillRecord(1, yourRateId);
                        console.log("Your Rate ID:", yourRateId);
                    } else {
                        showMessage("No user rate data found", "error");
                    }
                })
                .catch(error => {
                    console.error("Error fetching your rate:", error);
                    showMessage("Error fetching your rate", "error");
                });
        }
    };

    return (
        <div className="add-bill-container" style={{ position: 'relative' }}>
            {/* Toast container positioned with a higher z-index */}
            <ToastContainer 
                enableMultiContainer
                containerId={TOAST_CONTAINER_ID}
                autoClose={5000} 
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            
            <h2>Add Bill</h2>
            
            {/* Inputs are NOT wrapped in a form to avoid auto submission */}
            <div className="bill-inputs">
                <input 
                    type="text" 
                    value={billName} 
                    onChange={(e) => setBillName(e.target.value)} 
                    placeholder="Enter bill name"
                />
                
                <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="Enter amount"
                />
                
                <select value={method} onChange={handleMethodChange}>
                    <option value="">Select Method</option>
                    <option value="1">確切金額</option>
                    <option value="2">以百分比</option>
                </select>
                
                <input 
                    type="text" 
                    value={note} 
                    onChange={(e) => setNote(e.target.value)} 
                    placeholder="Enter note"
                />
                
                <select value={userId} onChange={(e) => setUserId(e.target.value)}>
                    <option value="">Select User</option>
                    {users.map(user => (
                        <option key={user.user_id} value={user.user_id}>
                            {user.user_name}
                        </option>
                    ))}
                </select>
                
                <div className="checkbox-container">
                    <input 
                        type="checkbox" 
                        id="creditCardCheckbox"
                        checked={creditCard} 
                        onChange={(e) => setCreditCard(e.target.checked)} 
                    />
                    <label htmlFor="creditCardCheckbox">Use Credit Card</label>
                </div>
            </div>

            {/* Conditional rendering of AddSplit component */}
            {showSplit && (
                <AddSplit 
                    groupId={groupId}
                    users={users}
                    onSplitComplete={(validateFn) => {
                        setGetSplitData(() => validateFn);
                    }}
                />
            )}

            {/* Conditional rendering of AddItem component */}
            {method === 1 && (
                <AddItem 
                    onItemComplete={(validateFn) => {
                        if (getItemData !== validateFn) {
                            setGetItemData(() => validateFn);
                        }
                    }}
                />
            )}

            {/* Button explicitly set to type="button" to prevent form submission */}
            <button 
                type="button"
                onClick={handleAddBill}
                className="add-bill-button"
                disabled={processing}
            >
                {processing ? "Processing..." : "ADD BILL"}
            </button>
        </div>
    );
};

export default AddBill;