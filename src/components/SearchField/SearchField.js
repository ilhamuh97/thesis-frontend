import React, { useEffect, useState, useRef } from 'react';
// import DummyData from '../../assets/dummyData/suggestion-list.json';
import axios from "axios";
import CancelIcon from '../../assets/svg/close-line.svg';
import CompleteArrow from '../../assets/svg/left-arrow.svg';
import './SearchField.scss';

const SearchField = () => {
    const [keyword, setKeyword] = useState("");
    const [show, setShow] = useState(false);
    const [completions, setCompletions] = useState([]);
    const [completionSelected, setCompletionsSelected] = useState(false);
    const [currentFocus, setCurrentFocus] = useState(-1);
    const [isMobile, setIsMobile] = useState(false);
    const size = useWindowSize();
    const searchFieldEl = useRef(null);
    const suggestionList = useRef(null);
    const formEl = useRef(null);

    useEffect(() => {
        if (size.width < 768) {
            setIsMobile(true);
        } else {
            setIsMobile(false)
        }
    }, [size]);

    useEffect(() => {
        // send a body request to elasticsearch
        let query = {
            "suggest": {
                "completer": {
                    "prefix": keyword,
                    "completion": {
                        "field": "completion.title",
                        "size": isMobile ? 6 : 10,
                        "skip_duplicates": true,
                         "fuzzy":{
                            "fuzziness":"auto"
                        }
                    }
                }
            }
        };
        // REST API request
        axios.get(`/completions/_search`, {
            params: {
                source: JSON.stringify(query),
                source_content_type: 'application/json'
            }
        }).then(function (response) {
            setCompletions(response.data.suggest.completer[0].options);
        });
        //submit form if competion was selected
        if (completionSelected) formEl.current.submit();
        if (!keyword) setShow(false);
    }, [keyword, completionSelected, isMobile]);

    useEffect(() => {
        if (completions.length === 0) {
            setShow(false);
        } else {
            setShow(true);
        }
    }, [completions]);

    // after select completion suggestion
    useEffect(() => {
        let x = suggestionList.current;
        if (x) {
            x = x.children;
            if (x.length !== 0 && currentFocus > -1) {
                searchFieldEl.current.value = x[currentFocus].textContent;
            }
        }
    }, [currentFocus]);
    
    // using keyboard to select the completion suggestion
    const handleKeydown = (e) => {
        if (!isMobile && show) {
        let x = suggestionList.current;
            if (x) x = x.children;
            if (e.keyCode === 40) {
                // DOWN key is pressed
                if (currentFocus + 1 >= x.length) {
                    setCurrentFocus(0);
                } else if (currentFocus + 1 < 0) {
                    setCurrentFocus(x.length - 1);
                } else {
                    setCurrentFocus(currentFocus + 1);
                }
            } else if (e.keyCode === 38) { 
                // UP key is pressed
                if (currentFocus - 1 >= x.length) {
                    setCurrentFocus(0);
                } else if (currentFocus - 1 < 0) {
                    setCurrentFocus(x.length - 1);
                } else {
                    setCurrentFocus(currentFocus - 1);
                }
            } 
        }
    };

    // change keyowrd while typing
    const handleChange = (value) => {
        setKeyword(value);
    };

    // autocompleting input value
    const autoComplete = (value) => {
        setCompletionsSelected(true);
        setKeyword(value);
        setShow(false);
    };

     // autocompleting input value
    const autoCompleteWithoutRedirect = (e,value) => {
        e.stopPropagation();
        setKeyword(value + " ");
        searchFieldEl.current.focus();
    };

    const emptyInputField = () => {
        setKeyword("");
        searchFieldEl.current.focus();
    };

    const removeKeywordElement = (
        keyword ? (
            <div className="remove-keyword" onClick={()=>emptyInputField()}>
                <img alt="cancel icon" src={CancelIcon}/>
            </div>
        ) : null
    )

    const completionElements = () => (
        completions.map((completion, i) => {
            const value = keyword.replace(/[^a-zA-Z0-9äÄöÖüÜß' ]/g, "").trim();
            const keywordLength = value.length;
            let unhighlightedString;
            let highlightedString;
            let result;
            // create design of completion based on its type of completions
            if (completion.text.substr(0, keywordLength).trim() === value) {
                unhighlightedString = completion.text.substr(0, keywordLength);
                highlightedString = completion.text.substr(keywordLength);
                result = <span className="suggestion">{unhighlightedString}<b>{highlightedString}</b></span>;
            } else {
                result = <span className="suggestion"><b>{completion.text}</b></span>;
            }
            return(
                <li
                    key={completion._source.id}
                    className={`completion ${currentFocus === i ? "active" : ""} ${isMobile ? 'mobile' : ''}`}
                    onClick={()=>autoComplete(completion.text)}
                >
                    {result}
                    {
                        isMobile ? (
                            <div className="complete-icon" onClick={(e)=>autoCompleteWithoutRedirect(e,completion.text)}>
                                <img alt="complete icon" src={CompleteArrow}/>
                            </div>
                        ) : null
                    }
                </li>
            )
        }
    ));

    const showSuggestionELement = () => {
        if (keyword) {
            setShow(true);
        }
    };

    return (
        <div className={`search-wrapper ${isMobile ? 'mobile' : ''}`}>
            {
                show ? (
                    <div id="visual-depth-container" onClick={() => setShow(false)}/>
                ) : null
            }
            <form id="search-form"  ref={formEl} method="get">
                <div
                    className="search"
                >
                    <input
                        id="searchfield"
                        ref={searchFieldEl}
                        className={`${isMobile ? 'mobile' : ''}`}
                        type="text"
                        placeholder="Suche"
                        name="search"
                        autoComplete="off"
                        onChange={(e) => (handleChange(e.target.value))}
                        value={keyword}
                        onKeyDown={(e) => handleKeydown(e)}
                        onFocus={()=> showSuggestionELement()}
                    />
                    {
                        show ? (
                            <div className="suggestion-list-wrapper">
                                <ul className="suggestion-list" ref={suggestionList}>
                                    {completionElements()}
                                </ul>
                            </div>
                        ) : null
                    }
                    {removeKeywordElement}
                </div>
            </form>
        </div>
    );
};

// source: https://usehooks.com/useWindowSize/
// function to handle window size
function useWindowSize() {
    // Initialize state with undefined width/height so server and client renders match
    // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
    });
    useEffect(() => {
        // Handler to call on window resize
        function handleResize() {
        // Set window width/height to state
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
        });
        }
        // Add event listener
        window.addEventListener("resize", handleResize);
        // Call handler right away so state gets updated with initial window size
        handleResize();
        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty array ensures that effect is only run on mount
    return windowSize;
}

export default SearchField;
