import React, { useState } from 'react';
import Axios from 'axios';
import './style.css';

const hostname = "http://macbook-pro.local:3002";

const ShowGroup = ({ onGroupSelect }) => {
    const [groupList, setGroupList] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [error, setError] = useState("");

    const getGroup = () => {
        Axios.get(hostname + "/GROUP", { timeout: 5000 })
            .then((response) => {
                console.log(response.data);
                setGroupList(response.data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setError("Failed to fetch groups");
            });
    };

    return (
        <div className="show-group-container">
            <button onClick={getGroup} className="show-group-button">
                Show Groups list to selected
            </button>
            
            {error && <div className="error-message">{error}</div>}
            
            <ul className="group-list">
                {groupList.map((group) => (
                    <li 
                        key={group.group_id} 
                        onClick={() => {
                            setSelectedGroup(group);
                            onGroupSelect(group);
                        }}
                        className={`group-item ${selectedGroup?.group_id === group.group_id ? 'selected' : ''}`}
                    >
                        {group.group_name}
                    </li>
                ))}
            </ul>
            
            {selectedGroup && (
                <div className="selected-group-info">
                    Selected Group: {selectedGroup.group_name}
                </div>
            )}
        </div>
    );
};

export default ShowGroup;