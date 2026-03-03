import React from 'react';
import '../styles/layout.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer__container">
                <p className="footer__text">
                    &copy; {new Date().getFullYear()} Pilot SSH. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
