import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import GroupPage from './pages/groupPage';
import RatePage from './pages/ratePage';
import UserPage from './pages/userPage';
import BillPage from './pages/billPage'; // 確保導入 BillPage
import Cookies from 'js-cookie';

const App = () => {
    const [selectedGroup, setSelectedGroup] = useState(null);

    useEffect(() => {
        // 從 cookies 中讀取選擇的群組
        const savedGroup = Cookies.get('selectedGroup');
        try {
            if (savedGroup) {
                const parsedGroup = JSON.parse(savedGroup);
                setSelectedGroup(parsedGroup);
            }
        } catch (error) {
            console.error("Error parsing saved group from cookies:", error);
        }
    }, []);

    const handleGroupSelect = (group) => {
        setSelectedGroup(group);
        // 將選擇的群組存儲到 cookies 中
        Cookies.set('selectedGroup', JSON.stringify(group), { expires: 7 }); // 7 天過期
    };

    return (
        <Router>
            <div>
                <nav>
                    <button onClick={() => window.location.href = '/group'}>Group</button>
                    <button onClick={() => window.location.href = '/rate'}>Rate</button>
                    <button onClick={() => window.location.href = '/user'}>User</button>
                    <button onClick={() => window.location.href = '/bill'}>Bill</button>
                </nav>
                {selectedGroup && (
                    <div>
                        <div>{selectedGroup.group_name}</div>
                    </div>
                )}
                <Routes>
                    <Route path="/group" element={<GroupPage onGroupSelect={handleGroupSelect} />} />
                    <Route path="/rate" element={<RatePage />} />
                    <Route path="/user" element={<UserPage />} />
                    <Route path="/bill" element={<BillPage />} /> {/* 添加 BillPage 路由 */}
                </Routes>
            </div>
        </Router>
    );
};

export default App;