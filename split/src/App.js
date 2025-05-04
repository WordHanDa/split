import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import GroupPage from './pages/groupPage';
import RatePage from './pages/ratePage';
import UserPage from './pages/userPage';
import BillPage from './pages/billPage';
import ResultPage from './pages/resultPage';
import GroupUserPage from './pages/groupUserPage';
import TestPage from './pages/testPage';
import Cookies from 'js-cookie';
import './mobile-menu.css';
import './components/css/common.css';

const hostname = "http://localhost:3002";

const App = () => {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

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

    // Add scroll lock effect
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    const handleGroupSelect = (group) => {
        setSelectedGroup(group);
        // Store selected group in cookies
        Cookies.set('selectedGroup', JSON.stringify(group), { expires: 7 }); // 7 days expiration
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // Close menu when a link is clicked
    const handleLinkClick = () => {
        if (menuOpen) {
            setMenuOpen(false);
        }
    };

    return (
        <Router>
            <div className={`app-container ${menuOpen ? 'menu-open' : ''}`}>
                <nav className={`apple-nav ${menuOpen ? 'menu-open' : ''}`}>
                    <button 
                        className="menu-toggle" 
                        onClick={toggleMenu} 
                        aria-label="Toggle navigation menu"
                        aria-expanded={menuOpen}
                    >
                        <div className="menu-icon">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>
                    
                    {/* Add backdrop div */}
                    <div 
                        className={`menu-backdrop ${menuOpen ? 'open' : ''}`} 
                        onClick={toggleMenu}
                        aria-hidden="true"
                    />
                    
                    <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                        <Link to="/group" onClick={handleLinkClick}>Group</Link>
                        <Link to="/groupUser" onClick={handleLinkClick}>Group User</Link>
                        <Link to="/user" onClick={handleLinkClick}>User</Link>
                        <Link to="/rate" onClick={handleLinkClick}>Rate</Link>
                        <Link to="/bill" onClick={handleLinkClick}>Bill</Link>
                        <Link to="/result" onClick={handleLinkClick}>Result</Link>
                        <Link to="/test" onClick={handleLinkClick}>Test</Link>
                    </div>
                    
                    {selectedGroup && (
                        <div className="current-group-text">
                            Current group: {selectedGroup.group_name}
                        </div>
                    )}
                </nav>
                
                <div className="main-content">
                    <Routes>
                        <Route path="/group" element={<GroupPage hostname={hostname} onGroupSelect={handleGroupSelect} />} />
                        <Route path="/groupUser" element={<GroupUserPage hostname={hostname}/>} />
                        <Route path="/user" element={<UserPage hostname={hostname}/>} />
                        <Route path="/rate" element={<RatePage hostname={hostname}/>} />
                        <Route path="/bill" element={<BillPage hostname={hostname}/>} />
                        <Route path="/result" element={<ResultPage hostname={hostname}/>} />
                        <Route path="/test" element={<TestPage hostname={hostname}/>} />
                        {/* Default route */}
                        <Route path="/" element={<GroupPage hostname={hostname} onGroupSelect={handleGroupSelect}/>} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;
