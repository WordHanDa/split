import React, { useState, useEffect, useCallback } from "react";
import Axios from "axios";
import Cookies from "js-cookie";
import 'react-toastify/dist/ReactToastify.css';
import './style.css';

let hostname = "http://macbook-pro.local:3002";

const AddItem = ({ onItemComplete }) => {
    const [items, setItems] = useState([{
        item_amount: "",
        userId: "",
        itemName: ""
    }]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const savedGroup = Cookies.get('selectedGroup');
        if (savedGroup) {
            try {
                const parsedGroup = JSON.parse(savedGroup);

                Axios.get(`${hostname}/getUsersByGroupId`, {
                    params: { group_id: parsedGroup.group_id }
                })
                .then(response => {
                    setUsers(response.data);
                })
                .catch(error => {
                    console.error("Error fetching users:", error);
                    // Use the same toast mechanism as the parent component
                    console.log("Failed to fetch users");
                });
            } catch (error) {
                console.error("Error parsing saved group from cookies:", error);
                console.log("Error loading group data");
            }
        }
    }, []);

    // Move validateItems outside of useEffect and memoize it with useCallback
    const validateItems = useCallback(() => {
        // Check if all items have required fields and valid values
        const isValid = items.every(item => 
            item.item_amount && 
            item.userId && 
            item.itemName && 
            item.item_amount.toString().trim() !== "" && 
            item.userId.toString().trim() !== "" && 
            item.itemName.trim() !== "" &&
            parseInt(item.item_amount) > 0  // Ensure amount is positive
        );

        if (!isValid) {
            console.log("Please fill in all fields for each item with valid amounts");
            return null;
        }

        // Transform the data to match the server expectations
        return items.map(item => ({
            item_amount: parseInt(item.item_amount),
            user_id: parseInt(item.userId),
            item_name: item.itemName
        }));
    }, [items]);

    // Use useEffect to call onItemComplete with the memoized validateItems
    useEffect(() => {
        if (onItemComplete) {
            onItemComplete(validateItems);
        }
    }, [validateItems, onItemComplete]);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addNewItem = () => {
        setItems([...items, {
            item_amount: "",
            userId: "",
            itemName: ""
        }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    return (
        <div>
            <h3>Add Items</h3>
            {items.map((item, index) => (
                <div key={index}>
                    <input 
                        type="number" 
                        value={item.item_amount} 
                        onChange={(e) => handleItemChange(index, "item_amount", e.target.value)} 
                        placeholder="Enter amount"
                        required
                    />
                    <select 
                        value={item.userId} 
                        onChange={(e) => handleItemChange(index, "userId", e.target.value)}
                        required
                    >
                        <option value="">Select User</option>
                        {users.map(user => (
                            <option key={user.user_id} value={user.user_id}>
                                {user.user_name}
                            </option>
                        ))}
                    </select>
                    <input 
                        type="text" 
                        value={item.itemName} 
                        onChange={(e) => handleItemChange(index, "itemName", e.target.value)} 
                        placeholder="Enter item name"
                        required
                    />
                    {items.length > 1 && (
                        <button onClick={() => removeItem(index)}>
                            Remove
                        </button>
                    )}
                </div>
            ))}
            <button onClick={addNewItem}>
                Add Another Item
            </button>
        </div>
    );
};

export default AddItem;