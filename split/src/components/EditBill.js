import React, { useState, useEffect} from "react";
import Axios from "axios";
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditItem from './EditItem';
import EditSplit from './EditSplit';   
import './css/bill.css';

const hostname = "http://macbook-pro.local:3002";

const EditBill = () => {
    const [bills, setBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState('');
    const [billDetails, setBillDetails] = useState({
        bill_name: '',
        amount: '',
        method: '1',
        note: '',
        credit_card: false
    });
    const [loading, setLoading] = useState(false);
    const [groupId, setGroupId] = useState(null);

    useEffect(() => {
        const savedGroup = Cookies.get('selectedGroup');
        if (savedGroup) {
            try {
                const parsedGroup = JSON.parse(savedGroup);
                setGroupId(parsedGroup.group_id);
                fetchBills(parsedGroup.group_id);
            } catch (error) {
                console.error("Error parsing saved group:", error);
                toast.error("群組資料載入失敗");
            }
        } else {
            toast.error("請先選擇群組");
        }
    }, []);
    const fetchBills = async (gid) => {
        try {
            setLoading(true);
            const response = await Axios.get(`${hostname}/getBillsByGroupId`, {
                params: { group_id: gid }
            });
            setBills(response.data);
        } catch (error) {
            console.error("Error fetching bills:", error);
            toast.error("無法取得帳單列表");
        } finally {
            setLoading(false);
        }
    };

    const handleBillSelect = async (billId) => {
        if (!billId) {
            setSelectedBill('');
            setBillDetails({
                bill_name: '',
                amount: '',
                method: '1',
                note: '',
                credit_card: false
            });
            return;
        }

        try {
            setLoading(true);
            const response = await Axios.get(`${hostname}/getBillDetails`, {
                params: { bill_id: billId }
            });
            
            setSelectedBill(billId);
            setBillDetails({
                bill_name: response.data.bill_name,
                amount: response.data.amount,
                method: response.data.method.toString(),
                note: response.data.note || '',
                credit_card: response.data.credit_card
            });
        } catch (error) {
            console.error("Error fetching bill details:", error);
            toast.error("無法取得帳單詳細資訊");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBill = async () => {
        if (!selectedBill) {
            toast.error("請選擇要編輯的帳單");
            return;
        }

        try {
            setLoading(true);
            const response = await Axios.put(`${hostname}/updateBill`, {
                bill_id: selectedBill,
                ...billDetails,
                group_id: groupId
            });

            if (response.data.success) {
                toast.success("帳單更新成功");
                fetchBills(groupId);
            }
        } catch (error) {
            console.error("Error updating bill:", error);
            toast.error(error.response?.data?.error || "更新帳單失敗");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBill = async () => {
        if (!selectedBill) {
            toast.error("請選擇要刪除的帳單");
            return;
        }

        // Confirm deletion
        if (!window.confirm(`確定要刪除帳單 "${billDetails.bill_name}" 嗎？此操作無法復原。`)) {
            return;
        }

        try {
            setLoading(true);
            const response = await Axios.delete(`${hostname}/deleteBill`, {
                data: { bill_id: selectedBill }
            });

            if (response.data.success) {
                toast.success("帳單刪除成功");
                setSelectedBill('');
                setBillDetails({
                    bill_name: '',
                    amount: '',
                    method: '1',
                    note: '',
                    credit_card: false
                });
                fetchBills(groupId);
            }
        } catch (error) {
            console.error("Error deleting bill:", error);
            toast.error(error.response?.data?.error || "刪除帳單失敗");
        } finally {
            setLoading(false);
        }
    };

    const fetchBillDetails = async () => {
        if (!selectedBill) return;
        
        try {
            setLoading(true);
            const response = await Axios.get(`${hostname}/getBillDetails`, {
                params: { bill_id: selectedBill }
            });
            
            setBillDetails({
                bill_name: response.data.bill_name,
                amount: response.data.amount,
                method: response.data.method.toString(),
                note: response.data.note || '',
                credit_card: response.data.credit_card
            });
        } catch (error) {
            console.error("Error fetching bill details:", error);
            toast.error("無法取得帳單詳細資訊");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-bill-container">
            {!groupId ? (
                <div className="no-group-message">請先選擇群組</div>
            ) : (
                <>
                    <select
                        value={selectedBill}
                        onChange={(e) => handleBillSelect(e.target.value)}
                        disabled={loading}
                        className="bill-select"
                    >
                        <option value="">選擇要編輯的帳單</option>
                        {bills.map(bill => (
                            <option key={bill.bill_id} value={bill.bill_id}>
                                {bill.bill_name} - {bill.amount} 
                                ({new Date(bill.create_time).toLocaleDateString()})
                            </option>
                        ))}
                    </select>

                    {selectedBill && (
                        <div className="bill-form">
                            <div className="input-group">
                                <label>帳單名稱</label>
                                <input
                                    type="text"
                                    value={billDetails.bill_name}
                                    onChange={(e) => setBillDetails({
                                        ...billDetails,
                                        bill_name: e.target.value
                                    })}
                                    disabled={loading}
                                />
                            </div>

                            <div className="input-group">
                                <label>金額</label>
                                <input
                                    type="number"
                                    value={billDetails.amount}
                                    onChange={(e) => setBillDetails({
                                        ...billDetails,
                                        amount: e.target.value
                                    })}
                                    disabled={loading}
                                />
                            </div>

                            <div className="input-group">
                                <label>分帳方式</label>
                                <select
                                    value={billDetails.method}
                                    onChange={(e) => setBillDetails({
                                        ...billDetails,
                                        method: e.target.value
                                    })}
                                    disabled={loading}
                                >
                                    <option value="1">依項目分帳</option>
                                    <option value="2">依比例分帳</option>
                                </select>
                            </div>

                            <div className="checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={billDetails.credit_card}
                                        onChange={(e) => setBillDetails({
                                            ...billDetails,
                                            credit_card: e.target.checked
                                        })}
                                        disabled={loading}
                                    />
                                    信用卡支付
                                </label>
                            </div>

                            <div className="input-group">
                                <label>備註</label>
                                <textarea
                                    value={billDetails.note}
                                    onChange={(e) => setBillDetails({
                                        ...billDetails,
                                        note: e.target.value
                                    })}
                                    disabled={loading}
                                />
                            </div>
                            {selectedBill && (
                                <>
                                    {billDetails.method === '1' ? (
                                        <EditItem 
                                            billId={selectedBill}
                                            billAmount={billDetails.amount}
                                            onBillUpdate={handleUpdateBill}
                                            onUpdate={() => {
                                                fetchBillDetails();
                                                fetchBills(groupId);
                                            }}
                                        />
                                    ) : billDetails.method === '2' && (
                                        <EditSplit
                                            billId={selectedBill}
                                            groupId={groupId}
                                            onBillUpdate={handleUpdateBill}
                                            onUpdate={() => {
                                                fetchBillDetails();
                                                fetchBills(groupId);
                                            }}
                                        />
                                    )}
                                </>
                            )}

                            <button
                                onClick={handleDeleteBill}
                                disabled={loading || !selectedBill}
                                className="delete-button"
                            >
                                {loading ? "刪除中..." : "刪除帳單"}
                            </button>
                        </div>
                    )}
                </>
            )}
            <ToastContainer/>
        </div>
    );
};

export default EditBill;