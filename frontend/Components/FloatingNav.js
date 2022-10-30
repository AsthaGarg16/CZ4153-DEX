import React from "react";
import { useEffect, useState } from "react";

const FloatingNav = () => {
  const [marketPrice, setMarketPrice] = useState(0);

  const getInitialState = () => {
    const value = "A/B";
    return value;
  };
  const [value, setOption] = useState(getInitialState);

  const handleChange = (e) => {
    setOption(e.target.value);
  };

  const handleChangeMP = (e) => {
    setMarketPrice(marketPrice); // from backend
    // console.log(marketPrice)
  };

  return (
    <div>
      <div className="gap"></div>
      <div className="floatingnav">
      <div className="widthgap"></div>
      <h3>Market:</h3>
      <div className="widthgap"></div>
      <div className="dropdown">
      <div>
          <select value={value} onChange={handleChange} className="button-81">
            <option value="A/B">A/B</option>
            <option value="B/C">B/C</option>
            <option value="C/A">C/A</option>
          </select>
          {/* <p>{`You selected ${value}`}</p> */}
      </div>
      </div>
      <div className="widthgapnew"></div>
      <h3>Last Market Price: </h3>
      <h4>{marketPrice} ETH</h4>
      {/* <button onClick={handleChangeMP}>blabla</button> */}
      </div>
    </div>
  )
};

export default FloatingNav;