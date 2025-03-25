import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import GroupPage from './pages/groupPage';
import RatePage from './pages/ratePage';
import UserPage from './pages/userPage';
import BillPage from './pages/billPage';
import ResultPage from './pages/resultPage';
import GroupUserPage from './pages/groupUserPage';
import Cookies from 'js-cookie';
import './components/style.css';

const App = () => {
    const [selectedGroup, setSelectedGroup] = useState(null);

    useEffect(() => {
        // Read selected group from cookies
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
        // Store selected group in cookies
        Cookies.set('selectedGroup', JSON.stringify(group), { expires: 7 }); // 7 days expiration
    };

    return (
        <Router>
            <div className="app-container">
                <nav className="apple-nav">
                    <div className="nav-links">
                        <Link to="/group">Group</Link>
                        <Link to="/groupUser">Group&nbsp;User</Link>
                        <Link to="/user">User</Link>
                        <Link to="/rate">Rate</Link>
                        <Link to="/bill">Bill</Link>
                        <Link to="/result">Result</Link>
                    </div>
                    {selectedGroup && (
                        <div className="current-group-text">
                            Current group: {selectedGroup.group_name}
                        </div>
                    )}
                </nav>
                
                <div className="main-content">
                    <Routes>
                        <Route path="/group" element={<GroupPage onGroupSelect={handleGroupSelect}/>} />
                        <Route path="/groupUser" element={<GroupUserPage />} />
                        <Route path="/user" element={<UserPage />} />
                        <Route path="/rate" element={<RatePage />} />
                        <Route path="/bill" element={<BillPage />} />
                        <Route path="/result" element={<ResultPage />} />
                        <Route path="/" element={<GroupPage onGroupSelect={handleGroupSelect}/>} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;