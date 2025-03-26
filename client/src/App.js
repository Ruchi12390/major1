import 'bootstrap/dist/css/bootstrap.css';  // Bootstrap CSS import
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import MainRouter from './MainRouter';  // Your main router component

const App = () => {
    return (
        <BrowserRouter>
            <div>  {/* Bootstrap container class */}
                <MainRouter />
            </div>
        </BrowserRouter>
    );
};

export default App;
