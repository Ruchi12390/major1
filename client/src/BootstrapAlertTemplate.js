import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const BootstrapAlertTemplate = ({ style, options, message, close }) => {
    return (
        <div
            className={`alert alert-${options.type}`}
            style={{ margin: '20px', ...style }}
            role="alert"
        >
            {message}
            <button type="button" className="close" onClick={close}>
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    );
};

export default BootstrapAlertTemplate;
