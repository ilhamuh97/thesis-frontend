import React from 'react';
import './SearchFieldMobile.scss';

const SearchFieldMobile = () => {
    return (
        <div className="search-wrapper-mobile">
            <form id="search-form" method="get">
                <div
                    className="search"
                >
                    <input
                        id="searchfield"
                        type="text"
                        placeholder="Suche"
                        name="search"
                        autoComplete="off"
                        onChange={(e) => (handleChange(e.target.value))}
                        value={keyword}
                        onKeyDown={(e)=>handleKeydown(e)}
                    />
                    {
                        show&&keyword&&completions.length!==0 ? (
                            <div className="suggestion-list-wrapper">
                                <ul className="suggestion-list">
                                    {completionElements()}
                                </ul>
                            </div>
                        ) : null
                    }
                    {/*<input className="search-submit" type="image" src={SearchIcon}/>*/}
                </div>
            </form>
        </div>
    );
};

export default SearchFieldMobile;