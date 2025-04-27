import React, { useState, useEffect } from "react";
import Axios from "axios";
import Cookies from 'js-cookie';
import './css/result.css';

const ShowResult = ({hostname}) => {
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
              headers: {
                'ngrok-skip-browser-warning': 'skip-browser-warning',
              },
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
      }, [hostname]); // hostname is included in the dependency array

    if (loading) {
        return <div className="loading">Loading balance data...</div>;
    }

    return (
        <div className="balance-summary-container">
        <div className="balance-summary-header">
            <h3 className="balance-summary-title">Group Balance Summary</h3>
        </div>
        
        {error ? (
            <div className="error-message">
                {error}
            </div>
        ) : (
            <div className="balance-summary-content">
                <div className="totals-container">
                    <div className="total-item">Total Advanced: {balanceData.groupTotals.total_advanced} NTD</div>
                    <div className="total-item">Total Cost: {balanceData.groupTotals.total_cost} NTD</div>
                </div>
                
                {balanceData.userBalances.length > 0 ? (
                    <table className="balance-table">
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
                                    <td>{user.total_advanced} NTD</td>
                                    <td>{user.total_cost} NTD</td>
                                    <td className={user.balance >= 0 ? 'positive-balance' : 'negative-balance'}>
                                        {user.balance} NTD
                                    </td>
                                    <td>{user.bills_paid}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-data-message">No balance data available</div>
                )}
            </div>
        )}
    </div>
    );
};

export default ShowResult;