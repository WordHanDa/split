import React, { useState, useEffect, useRef } from 'react';
import Axios from 'axios';
import './css/group.css';

const hostname = "http://macbook-pro.local:3002";

const ShowGroup = ({ onGroupSelect }) => {
    const [groupList, setGroupList] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [maxScroll, setMaxScroll] = useState(0);
    const listRef = useRef(null);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await Axios.get(`${hostname}/GROUP`, { timeout: 5000 });
                setGroupList(response.data);
                setError("");
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to fetch groups");
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);

    // Calculate item sizes and positions
    useEffect(() => {
        if (listRef.current && groupList.length > 0) {
            const updateSizes = () => {
                setMaxScroll(listRef.current.scrollWidth - listRef.current.clientWidth);
                
                // If an item is selected, ensure it's centered after a short delay
                if (selectedGroup) {
                    setTimeout(() => {
                        const selectedItem = listRef.current.querySelector('.group-item.selected');
                        if (selectedItem) {
                            centerItem(selectedItem);
                        }
                    }, 100);
                }
            };
            
            updateSizes();
            window.addEventListener('resize', updateSizes);
            
            return () => {
                window.removeEventListener('resize', updateSizes);
            };
        }
    }, [groupList, selectedGroup]);

    const scrollLeft = () => {
        if (listRef.current) {
            // Calculate scroll amount based on item width + gap
            const scrollAmount = 150; // Approximate width of item + gap
            const newPosition = Math.max(0, scrollPosition - scrollAmount);
            
            // Apply scrolling
            listRef.current.scrollTo({
                left: newPosition,
                behavior: 'smooth'
            });
            
            // Update position state after scroll
            setTimeout(() => {
                if (listRef.current) {
                    setScrollPosition(listRef.current.scrollLeft);
                }
            }, 300);
        }
    };

    const scrollRight = () => {
        if (listRef.current) {
            // Calculate scroll amount based on item width + gap
            const scrollAmount = 150; // Approximate width of item + gap
            const newPosition = Math.min(maxScroll, scrollPosition + scrollAmount);
            
            // Apply scrolling
            listRef.current.scrollTo({
                left: newPosition,
                behavior: 'smooth'
            });
            
            // Update position state after scroll
            setTimeout(() => {
                if (listRef.current) {
                    setScrollPosition(listRef.current.scrollLeft);
                }
            }, 300);
        }
    };

    const handleScroll = (e) => {
        setScrollPosition(e.target.scrollLeft);
    };

    // Function to center an item in the view and adjust margins
    const centerItem = (item) => {
        const list = listRef.current;
        if (item && list) {
            const itemWidth = item.offsetWidth;
            const listWidth = list.offsetWidth;
            const itemLeft = item.offsetLeft;
            
            // Calculate center position
            const centerPosition = itemLeft - (listWidth / 2) + (itemWidth / 2);
            
            // Scroll to center position
            list.scrollTo({
                left: Math.max(0, centerPosition),
                behavior: 'smooth'
            });
            
            // Update position state after scroll
            setTimeout(() => {
                if (list) {
                    setScrollPosition(list.scrollLeft);
                }
            }, 300);
        }
    };

    // Auto-center selected item when it changes
    useEffect(() => {
        if (selectedGroup && listRef.current) {
            const selectedItem = listRef.current.querySelector('.group-item.selected');
            if (selectedItem) {
                centerItem(selectedItem);
            }
        }
    }, [selectedGroup]);

    return (
        <div className="show-group-container">
            {loading ? (
                <div className="loading-message">載入中...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : groupList.length === 0 ? (
                <div className="no-groups-message">尚無群組資料</div>
            ) : (
                <div className="group-content">
                    <div className="group-navigation">  
                        <ul 
                            className="group-list" 
                            ref={listRef}
                            onScroll={handleScroll}
                            style={{ 
                                scrollBehavior: 'smooth',
                                padding: '50px 10px', // Added vertical padding to make room for buttons
                                margin: '0 10px'
                            }}
                        >
                            {groupList.map((group) => (
                                <li
                                    key={group.group_id}
                                    onClick={(e) => {
                                        setSelectedGroup(group);
                                        onGroupSelect(group);
                                    }}
                                    className={`group-item ${selectedGroup?.group_id === group.group_id ? 'selected' : ''}`}
                                >
                                    {group.group_name}
                                </li>
                            ))}
                        </ul>
                        <div className="navigation-buttons" style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginTop: '-35px' }}>
                        <button
                            className="arrow-button left"
                            onClick={scrollLeft}
                            style={{ 
                                position: 'static', 
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: '10px',
                            }}
                        >
                            <svg viewBox="0 0 24 24">
                                <path d="M14 18l-6-6 6-6" stroke="var(--apple-gray)" strokeWidth="2.5" stroke-linecap='round' fill="none" />
                            </svg>
                        </button>
                            <button
                            className="arrow-button right"
                            onClick={scrollRight}
                            style={{ 
                                position: 'static', 
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginLeft: '10px'
                            }}
                            >
                            <svg viewBox="0 0 24 24">
                                <path d="M10 6l6 6-6 6" stroke="var(--apple-gray)" strokeWidth="2.5" stroke-linecap='round' fill="none" />
                            </svg>
                        </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShowGroup;