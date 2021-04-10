import React, { useEffect, useState } from 'react';
// import DummyData from '../../assets/dummyData/suggestion-list.json';
import axios from "axios";
//import SearchIcon from '../../assets/svg/search-line.svg';
import './SearchField.scss';

const SearchField = () => {
    const [keyword, setKeyword] = useState("");
    const [show, setShow] = useState(false)
    const [completions, setCompletions] = useState([]);
    const [completionSelected, setCompletionsSelected] = useState(false);
    const [currentFocus, setCurrentFocus] = useState(-1);

    useEffect(() => {
        // send a body request to elasticsearch
        let query = {
            "suggest": {
                "completer": {
                    "prefix": keyword,
                    "completion": {
                        "field": "completion.title",
                        "size": 10,
                        "skip_duplicates": true
                    }
                }
            }
        };
        // REST API request
        axios.get(`/completions/_search?`, {
            params: {
                source: JSON.stringify(query),
                source_content_type: 'application/json'
            }
        }).then(function (response) {
            // console.log("res", response.data);
            setCompletions(response.data.suggest.completer[0].options);
        });
        //submit form if competion was selected
        if (completionSelected) document.getElementsByTagName('form')[0].submit();
    }, [keyword, completionSelected]);

    useEffect(() => {
        let x = document.getElementsByClassName('suggestion-list');
        // console.log(currentFocus);
        if (x[0]) {
            x = x[0].children;
            if (x.length!==0 && currentFocus>-1) {
                document.getElementById("searchfield").value = x[currentFocus].textContent;
                // console.log(x[currentFocus]);
            }
        } 
    },[currentFocus])
    
    const handleKeydown = (e) => {
        let x = document.getElementsByClassName('suggestion-list');
        if (x[0]) x = x[0].children;
        if (e.keyCode === 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            if (currentFocus + 1 >= x.length) {
                setCurrentFocus(0);
            } else if (currentFocus + 1 < 0) {
                setCurrentFocus(x.length - 1);
            } else {
                setCurrentFocus(currentFocus + 1);
            }
            /*and and make the current item more visible:*/
        } else if (e.keyCode === 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
           if (currentFocus - 1 >= x.length) {
                setCurrentFocus(0);
            } else if (currentFocus - 1 < 0) {
                setCurrentFocus(x.length - 1);
            } else {
                setCurrentFocus(currentFocus - 1);
            }
            /*and and make the current item more visible:*/
        } else if (e.keyCode ===13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
            }
        }
    }

    const handleChange = (value) => 
    {
        setCurrentFocus(-1);
        setShow(true);
        setKeyword(value);
    }
    
    const autoComplete = (value) =>
    {
        setCompletionsSelected(true);
        setKeyword(value);
        setShow(false);
    }

    const completionElements = () => (
        completions.map((completion, i) => {
            const value = keyword.replace(/[^a-zA-Z0-9 ]/g, "").trim();
            const keywordLength = value.length;
            let unhighlightedString;
            let highlightedString;
            let result;
            if (completion._source.type === "attributes" || completion._source.type === "product type") {
                if (completion._source.title.substr(0, keywordLength).trim() === value) {
                    unhighlightedString = completion._source.title.substr(0, keywordLength);
                    highlightedString = completion._source.title.substr(keywordLength);
                    result = <span className="suggestion">{unhighlightedString}<b>{highlightedString}</b></span>;
                } else {
                    result = <span className="suggestion"><b>{completion._source.title}</b></span>;
                }
            } else if (completion._source.type === "category") {
                //TODO implement completion for type category
                result = <span className="suggestion"><b>{completion._source.title}</b></span>;
            }
            return(
                <li key={completion._source.id} className={`completion ${currentFocus === i ? "active" : ""}`} onClick={() => autoComplete(completion._source.title)}>
                    {result}
                </li>
            )
        }
    ));

    // console.log(completions);

    return (
        <div className="search-wrapper">
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

export default SearchField;