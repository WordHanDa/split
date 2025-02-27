import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import GroupPage from './pages/groupPage';
import RatePage from './pages/ratePage';
import UserPage from './pages/userPage';

const App = () => {
    return (
        <Router>
            <div>
                <nav>
                    <button onClick={() => window.location.href = '/group'}>Group</button>
                    <button onClick={() => window.location.href = '/rate'}>Rate</button>
                    <button onClick={() => window.location.href = '/user'}>User</button>
                </nav>
                <Routes>
                    <Route path="/group" element={<GroupPage />} />
                    <Route path="/rate" element={<RatePage />} />
                    <Route path="/user" element={<UserPage />} />
                    {/* Add other routes here */}
                </Routes>
            </div>
        </Router>
    );
};

export default App;