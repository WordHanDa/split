import React from 'react';
import ShowUser from '../components/ShowUser';
import ShowRate from '../components/ShowRate';
import ShowYourRate from '../components/ShowYourRate';
import AddRate from '../components/AddRate';
import AddBill from '../components/AddBill';
import Cookies from 'js-cookie';
import EditRate from '../components/EditRate';

const TestPage = ({hostname}) => {
    return (
        <div className="page-container">
            <h1>User Management</h1>
            <div className="component-section">
                <h3>User Directory</h3>
                <div className="user-page-section">
                    <AddBill hostname={hostname}/>
                </div>
            </div>
        </div>
    );
};

export default TestPage;