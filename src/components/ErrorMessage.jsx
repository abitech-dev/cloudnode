import React from 'react';
import { AlertCircle } from 'lucide-react';
import '../styles/components.css';

const ErrorMessage = ({ message }) => {
    if (!message) return null;
    
    return (
        <div className="error-message">
            <AlertCircle className="error-message__icon" />
            <span className="error-message__text">{message}</span>
        </div>
    );
};

export default ErrorMessage;
