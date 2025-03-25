import React, { useState, useEffect } from "react";
import Axios from "axios";
import Cookies from 'js-cookie';
import './style.css';

const hostname = "http://macbook-pro.local:3002";

const ShowResult = () => {
    const [balanceData, setBalanceData] = useState({
        userBalances: [],
        groupTotals: { total_advanced: 0, total_cost: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getGroupBalance = async () => {
            try {
                const savedGroup = Cookies.get('selectedGroup');
                if (!savedGroup) {
                    throw new Error("No group selected");
                }

                const parsedGroup = JSON.parse(savedGroup);
                const groupId = parsedGroup.group_id;
                
                const response = await Axios.get(`${hostname}/group_balance`, {
                    params: { group_id: groupId },
                    timeout: 5000
                });

                if (response.data.success) {
                    setBalanceData(response.data);
                } else {
                    throw new Error(response.data.message || "Failed to fetch balance data");
                }
            } catch (error) {
                console.error("Error fetching balance data:", error);
                const errorMessage = error.message === "No group selected" 
                    ? "請先選擇群組" 
                    : "取得資料失敗，請重試";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        getGroupBalance();
    }, []); // Empty dependency array means this effect runs once on mount

    if (loading) {
        return <div className="loading">Loading balance data...</div>;
    }

    return (
        <div className="show-result-container">
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {balanceData.userBalances.length > 0 && (
                <div className="balance-results">
                    <h3>Group Balance Summary</h3>
                    <div className="group-totals">
                        <p>Total Advanced: ¥{balanceData.groupTotals.total_advanced}</p>
                        <p>Total Cost: ¥{balanceData.groupTotals.total_cost}</p>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Advanced</th>
                                <th>Cost</th>
                                <th>Balance</th>
                                <th>Bills Paid</th>
                            </tr>
                        </thead>
                        <tbody>
                            {balanceData.userBalances.map(user => (
                                <tr key={user.user_id}>
                                    <td>{user.user_name}</td>
                                    <td>¥{user.total_advanced}</td>
                                    <td>¥{user.total_cost}</td>
                                    <td className={user.balance >= 0 ? 'positive' : 'negative'}>
                                        ¥{user.balance}
                                    </td>
                                    <td>{user.bills_paid}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ShowResult;