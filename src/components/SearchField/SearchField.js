import React, { useEffect, useState } from 'react';
// import DummyData from '../../assets/dummyData/suggestion-list.json';
import axios from "axios";
//import SearchIcon from '../../assets/svg/search-line.svg';
import './SearchField.scss';

const SearchField = () => {
    const [keyword, setKeyword] = useState("");
    const [show, setShow] = useState(false)
    const [completions, setCompletions] = useState([]);

    let query= {
        "suggest":{
            "completer":{
                "prefix":keyword,
                "completion":{
                    "field": "completion.title",
                    "size":10,
                    "skip_duplicates":true
                }
            }
        }
    };

    useEffect(() => {
        axios.get(`/completions/_search?`, {
            params: {
                source: JSON.stringify(query),
                source_content_type: 'application/json'
            }
        }).then(function(response){
            console.log("res", response.data);
            setCompletions(response.data.suggest.completer[0].options);
        });
    },[keyword])
    
    const handleChange = (value) => 
    {
        setShow(true);
        setKeyword(value)
    }
    
    const autoComplete = (value) =>
    {
        setKeyword(value);
        setShow(false);
    }

    console.log(completions)

    return (
        <div className="search-wrapper">
            <form id="search-form" method="get">
                <div className="search">
                    <input
                        id="searchfield"
                        type="text"
                        placeholder="Suche"
                        name="search"
                        autoComplete="off"
                        onChange={(e) => (handleChange(e.target.value))}
                        value={keyword}
                        onBlur={()=>setShow(false)}
                        onFocus={()=>setShow(true)}
                    />
                    {/*<input className="search-submit" type="image" src={SearchIcon}/>*/}
                </div>
            </form>
            {
                show&&keyword&&completions.length!=0 ? (
                    <div className="suggestion-list">
                        {
                            completions.map((completion) =>
                                <div key={completion.id} className="list" onMouseDown={()=>autoComplete(completion._source.title)}>
                                    {completion._source.title}
                                </div>
                            )
                        }
                    </div>
                ) : null
            }
           
        </div>
    );
};

export default SearchField;