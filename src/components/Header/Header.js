import React from 'react';
import SearchField from '../SearchField/SearchField';

import './Header.scss';

const Header = () => {
    return (
        <div className="header">
            <div className="logo"/>
            <SearchField />
            <div/>
        </div>
    );
};

export default Header;