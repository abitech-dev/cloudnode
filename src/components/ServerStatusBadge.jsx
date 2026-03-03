import React from 'react';

const ServerStatusBadge = ({ status = 'active' }) => {
    const isActive = status.toLowerCase() === 'active';
    
    return (
        <span className={`server-card__status server-card__status--${isActive ? 'active' : 'inactive'}`}>
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );
};

export default ServerStatusBadge;
