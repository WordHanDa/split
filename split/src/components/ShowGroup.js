import { useState } from "react";
import Axios from "axios";
import AddGroupUser from './AddGroupUser';

let hostname = "http://macbook-pro.local:3002";

const ShowGroup = () => {  // ✅ Ensure the function starts with an uppercase letter
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
                    <li key={group.group_id} onClick={() => setSelectedGroup(group)}>
                        {group.group_name}
                    </li>
                ))}
            </ul>
            {selectedGroup && (
                <div>
                    <h3>Add User to {selectedGroup.group_name}</h3>
                    {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
                    <AddGroupUser addUser={addUserToGroup} />
                </div>
            )}
        </div>
    );
};

export default ShowGroup; // ✅ Ensure correct export