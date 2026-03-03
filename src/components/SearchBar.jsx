import React from 'react';
import { Search } from 'lucide-react';
import '../styles/components.css';

const SearchBar = ({ value, onChange, placeholder = "Buscar servidores o usuarios..." }) => {
    return (
        <div className="search-bar">
            <Search className="search-bar__icon" />
            <input
                type="text"
                className="search-bar__input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

export default SearchBar;
