import React from "react";
import { useEffect, useState } from "react";

const CreateOrder = () => {
//   const [marketPrice, setMarketPrice] = useState(0);

  const getInitialState = () => {
    const value = "Create Market Order";
    return value;
  };
  const [value, setOption] = useState(getInitialState);

  const handleChange = (e) => {
    setOption(e.target.value);
  };

//   const handleChangeMP = (e) => {
//     setMarketPrice(marketPrice); // from backend
//     // console.log(marketPrice)
//   };

  return (
    <div>
      <div className="widthgap"></div>
      <div className="dropdown">
      <div>
          <select value={value} onChange={handleChange} className="button-85">
            <option value="Create Market Order">Create Market Order</option>
            <option value="Create Limit Order">Create Limit Order</option>
          </select>
          {/* <p>{`You selected ${value}`}</p> */}
      </div>
      </div>
    </div>
  )
};

export default CreateOrder;