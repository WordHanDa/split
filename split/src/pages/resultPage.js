import React from 'react';
import ShowResult from '../components/ShowResult';
import '../components/css/result.css';


const ResultPage = ({hostname}) => {
    return (
        <div className="page-container">
            <h1>Result</h1>
            <ShowResult hostname={hostname}/>
        </div>
    );
};

export default ResultPage;