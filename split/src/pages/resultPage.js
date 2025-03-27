import React from 'react';
import ShowResult from '../components/ShowResult';
import '../components/css/result.css';


const ResultPage = () => {
    return (
        <div className="page-container">
            <h1>Result</h1>
            <ShowResult />
        </div>
    );
};

export default ResultPage;