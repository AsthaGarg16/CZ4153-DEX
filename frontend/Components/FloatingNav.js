import React from "react";
import { useState } from "react";

const FloatingNav = () => {
  const getInitialState = () => {
    const value = "A/B";
    return value;
  };
  const [value, setOption] = useState(getInitialState);

  const handleChange = (e) => {
    setOption(e.target.value);
  };

  return (
    <div>
      <div className="gap"></div>
      <div className="floatingnav">
      <h3>Market:</h3>
      <div className="widthgap"></div>
      <div class="dropdown">
      <div>
          <select value={value} onChange={handleChange} className="button-81">
            <option value="A/B">A/B</option>
            <option value="B/C">B/C</option>
            <option value="C/A">C/A</option>
          </select>
          {/* <p>{`You selected ${value}`}</p> */}
      </div>
      </div>
      <div className="widthgap"></div>
      <div className="widthgap"></div>
      <h3>Token:</h3>

      <div className="widthgapnew"></div>
      <h3>Last Market Price:</h3>
      </div>
    </div>
  )
};

export default FloatingNav;