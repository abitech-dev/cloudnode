import React from 'react';

const LoadingSpinner = ({ message = 'Cargando...' }) => {
    return (
        <div className="loading">
            <div className="loading__ring" aria-hidden="true"></div>
            <span className="loading__brand">Pilot SSH</span>
            <span className="loading__text">{message}</span>
        </div>
    );
};

export default LoadingSpinner;
