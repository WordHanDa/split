import { useState, useCallback } from "react";
import { toast } from 'react-toastify';
import { apiRequest } from './Api';
import './css/user.css';

const ShowUser = ({hostname}) => {
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(false);

    const getUser = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiRequest({
                url: `${hostname}/USER`,
                method: 'GET',
                defaultValue: []
            });

            if (Array.isArray(data)) {
                setUserList(data);
            } else {
                toast.error('無效的回應格式');
            }
        } catch (error) {
            toast.error('無法取得使用者列表');
        } finally {
            setLoading(false);
        }
    }, [hostname]);

    return (
        <div>
            <button 
                onClick={getUser}
                disabled={loading}
            >
                {loading ? '載入中...' : '顯示使用者'}
            </button>
            {userList.length > 0 ? (
                <ul>
                    {userList.map((user) => (
                        <li key={user.user_id || user.id}>{user.user_name}</li>
                    ))}
                </ul>
            ) : (
                <p>尚無使用者資料</p>
            )}
        </div>
    );
};

export default ShowUser;