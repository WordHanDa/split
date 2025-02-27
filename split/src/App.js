import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import GroupPage from './pages/groupPage';
import RatePage from './pages/ratePage';
import UserPage from './pages/userPage';
import Cookies from 'js-cookie';

const App = () => {
    const [selectedGroup, setSelectedGroup] = useState(null);

    useEffect(() => {
        // 從 cookies 中讀取選擇的群組
        const savedGroup = Cookies.get('selectedGroup');
        if (savedGroup) {
            setSelectedGroup(savedGroup);
        }
    }, []);

    const handleGroupSelect = (group) => {
        setSelectedGroup(group);
        // 將選擇的群組存儲到 cookies 中
        Cookies.set('selectedGroup', group, { expires: 7 }); // 7 天過期
    };

    return (
        <Router>
            <div>
                <nav>
                    <button onClick={() => window.location.href = '/group'}>Group</button>
                    <button onClick={() => window.location.href = '/rate'}>Rate</button>
                    <button onClick={() => window.location.href = '/user'}>User</button>
                </nav>
                {selectedGroup && <div>Current Group: {selectedGroup}</div>}
                <Routes>
                    <Route path="/group" element={<GroupPage onGroupSelect={handleGroupSelect} />} />
                    <Route path="/rate" element={<RatePage />} />
                    <Route path="/user" element={<UserPage />} />
                    {/* Add other routes here */}
                </Routes>
            </div>
        </Router>
    );
};

export default App;