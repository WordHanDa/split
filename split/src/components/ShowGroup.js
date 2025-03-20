import React, { useState } from 'react';
import Axios from 'axios';
import AddGroupUser from './AddGroupUser';
import EditGroupUser from './EditGroupUser';

let hostname = "http://macbook-pro.local:3002";

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
          .catch((error) => console.error("Error fetching data:", error));
    };

    const addUserToGroup = (userId, callback) => {
        if (selectedGroup) {
            Axios.post(hostname + "/addGroupUser", {
                group_id: selectedGroup.group_id,
                user_id: userId
            })
            .then(() => {
                console.log("User added to group successfully");
                setError(""); // Clear any previous error
                if (callback) callback(null); // Call the callback to refresh the user list
            })
            .catch((error) => {
                console.error("Error adding user to group:", error);
                if (callback) callback(error); // Pass the error to the callback
            });
        }
    };

    return (
        <div>
            <button onClick={getGroup}>Show GROUP</button>
            <ul>
                {groupList.map((group) => (
                    <li key={group.group_id} onClick={() => {
                        setSelectedGroup(group);
                        onGroupSelect(group); // 傳遞整個群組物件
                    }}>
                        {group.group_name}
                    </li>
                ))}
            </ul>
            {selectedGroup && (
                <div>
                    <h3>Add User to {selectedGroup.group_name}</h3>
                    <AddGroupUser addUser={addUserToGroup} />
                    <h3>Delete User to {selectedGroup.group_name}</h3>
                    <EditGroupUser group={selectedGroup} />
                </div>
            )}
        </div>
    );
};

export default ShowGroup;