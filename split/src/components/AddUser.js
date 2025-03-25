import React, { useState } from 'react';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';

const hostname = "http://macbook-pro.local:3002";

const AddUser = ({ onUserAdded }) => {
    const [userName, setUserName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const addUser = async () => {
        if (!userName.trim()) {
            toast.error("請輸入使用者名稱");
            return;
        }

        setIsLoading(true);
        try {
            const response = await Axios.post(`${hostname}/createUser`, {
                name: userName,
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("User added successfully:", response.data);
            setUserName(""); // Clear input
            toast.success("新增使用者成功！");
            
            // Notify parent component if callback exists
            if (onUserAdded) {
                onUserAdded(response.data);
            }
        } catch (error) {
            console.error("Error adding user:", error);
            const errorMessage = error.response?.data?.error || "新增使用者失敗";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            addUser();
        }
    };

    return (
        <div className="add-user-container">
            <div className="input-group">
                <input 
                    type="text" 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="請輸入使用者名稱"
                    disabled={isLoading}
                    className="user-input"
                />
                <button 
                    onClick={addUser} 
                    disabled={isLoading}
                    className="add-button"
                >
                    {isLoading ? "新增中..." : "新增"}
                </button>
            </div>
            <ToastContainer/>
        </div>
    );
};

export default AddUser;