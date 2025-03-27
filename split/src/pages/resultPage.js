import React from 'react';
import ShowResult from '../components/ShowResult';
import '../page.css';
import '../components/css/common.css';

const ResultPage = () => {
    return (
        <div className="page-container">
            <h1>Result</h1>
            <ShowResult />
        </div>
    );
};

export default ResultPage;