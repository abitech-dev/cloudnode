import React from 'react';
import { Link } from 'react-router-dom';
import { Server, Terminal as TerminalIcon } from 'lucide-react';
import '../styles/layout.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar__container">
                {/* // Logo */}
                <Link to="/" className="navbar__logo">
                    <TerminalIcon className="navbar__icon" />
                    <span>Pilot SSH</span>
                </Link>
                <ul className="navbar__menu">
                    <li className="navbar__item">
                        {/* // Enlace a servidores */}
                        <Link to="/servers" className="navbar__link">
                            <Server className="navbar__icon--small" />
                            Servidores
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
