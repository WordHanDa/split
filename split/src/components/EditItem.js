import React, { useState, useEffect, useCallback } from "react";
import Axios from "axios";
import Cookies from "js-cookie";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './css/bill.css';

const hostname = "http://120.126.16.21:3002";

// Modify the component definition to accept billAmount prop
const EditItem = ({ billId, billAmount, onUpdate, onBillUpdate }) => {
    const [items, setItems] = useState([{
        item_amount: "",
        user_id: "",
        item_name: ""
    }]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedGroup = Cookies.get('selectedGroup');
        if (savedGroup) {
            try {
                const parsedGroup = JSON.parse(savedGroup);
                fetchUsers(parsedGroup.group_id);
                if (billId) {
                    fetchItems(billId);
                }
            } catch (error) {
                console.error("Error parsing saved group:", error);
                toast.error("群組資料載入失敗");
            }
        }
    }, [billId]);

    const fetchUsers = async (gid) => {
        try {
            const response = await Axios.get(`${hostname}/getUsersByGroupId`, {
                params: { group_id: gid }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("無法取得使用者列表");
        }
    };

    const fetchItems = async (bid) => {
        try {
            setLoading(true);
            const response = await Axios.get(`${hostname}/getItems`, {
                params: { bill_id: bid }
            });
            
            if (response.data.length === 0) {
                // If no items, start with one empty item
                setItems([{
                    item_amount: "",
                    user_id: "",
                    item_name: ""
                }]);
            } else {
                setItems(response.data.map(item => ({
                    item_id: item.item_id,
                    item_amount: item.item_amount,
                    user_id: item.user_id,
                    item_name: item.item_name
                })));
            }
        } catch (error) {
            console.error("Error fetching items:", error);
            toast.error("無法取得項目資料");
        } finally {
            setLoading(false);
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            [field]: value
        };
        setItems(newItems);
    };

    const addNewItem = () => {
        setItems([...items, {
            item_amount: "",
            user_id: "",
            item_name: ""
        }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    const validateItems = useCallback(() => {
        const totalAmount = items.reduce((sum, item) => 
            sum + (parseFloat(item.item_amount) || 0), 0
        );
        
        if (Math.abs(totalAmount - parseFloat(billAmount)) > 0.01) {
            toast.error(`項目總金額 (${totalAmount}) 必須等於帳單金額 (${billAmount})`);
            return false;
        }

        return items.every(item => 
            item.item_amount && 
            item.user_id && 
            item.item_name && 
            parseFloat(item.item_amount) > 0
        );
    }, [items, billAmount]);

    const handleUpdateAll = async () => {
        if (!billId) {
            toast.error("需要提供帳單ID");
            return;
        }

        if (!validateItems()) {
            return;
        }

        try {
            setLoading(true);
            // First update the bill details
            await onBillUpdate();
            
            // Then update the items
            const response = await Axios.put(`${hostname}/updateItem`, {
                bill_id: billId,
                items: items.map(item => ({
                    ...item,
                    item_amount: parseFloat(item.item_amount),
                    user_id: parseInt(item.user_id)
                }))
            });

            if (response.data.success) {
                toast.success("帳單與項目更新成功");
                if (onUpdate) {
                    onUpdate();
                }
            }
        } catch (error) {
            console.error("Error updating bill and items:", error);
            toast.error(error.response?.data?.message || "更新失敗");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-item-container">
            <h3>編輯項目</h3>
            
            <div className="amount-summary">
                <span>帳單金額: {parseFloat(billAmount).toFixed(2)}</span>
                <span>項目總額: {
                    items.reduce((sum, item) => sum + (parseFloat(item.item_amount) || 0), 0).toFixed(2)
                }</span>
            </div>

            <div className="items-list">
                {items.map((item, index) => (
                    <div key={index} className="item-row">
                        <input
                            type="number"
                            value={item.item_amount}
                            onChange={(e) => handleItemChange(index, "item_amount", e.target.value)}
                            placeholder="金額"
                            disabled={loading}
                            className="amount-input"
                        />

                        <select
                            value={item.user_id}
                            onChange={(e) => handleItemChange(index, "user_id", e.target.value)}
                            disabled={loading}
                            className="user-select"
                        >
                            <option value="">選擇使用者</option>
                            {users.map(user => (
                                <option key={user.user_id} value={user.user_id}>
                                    {user.user_name}
                                </option>
                            ))}
                        </select>

                        <input
                            type="text"
                            value={item.item_name}
                            onChange={(e) => handleItemChange(index, "item_name", e.target.value)}
                            placeholder="項目名稱"
                            disabled={loading}
                            className="name-input"
                        />

                        {items.length > 1 && (
                            <button
                                onClick={() => removeItem(index)}
                                disabled={loading}
                                className="remove-button"
                            >
                                刪除
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="button-group">
                <button
                    onClick={addNewItem}
                    disabled={loading}
                    className="add-button"
                >
                    新增項目
                </button>

                <button
                    onClick={handleUpdateAll}
                    disabled={loading || items.length === 0}
                    className="update-button"
                >
                    {loading ? "更新中..." : "更新帳單與項目"}
                </button>
            </div>
        </div>
    );
};

export default EditItem;