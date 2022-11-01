import React from "react";
import { useEffect, useState } from "react";
import swapAbi from "../constants/Swap.json";
// import networkMapping from "../constants/networkMapping.json";
import { ethers } from "ethers";
import { useWeb3Contract, useMoralis } from "react-moralis";

const FloatingNav = (swapAddress) => {
  const { isWeb3Enabled, account } = useMoralis();
  const [marketPrice, setMarketPrice] = useState(0);
  const [listofMarkets, setMarketList] = useState(["A/B", "B/C", "C/A"]); //to update

  // const getInitialState = () => {
  //   const value = "A/B";
  //   return value;
  // };
  const [value, setOption] = useState("");

  const handleChange = (e) => {
    setOption(e.target.value);
  };

  const handleChangeMP = (e) => {
    setMarketPrice(marketPrice); // from backend
    // console.log(marketPrice)
  };

  const { runContractFunction: getAllMarkets } = useWeb3Contract({
    abi: swapAbi,
    contractAddress: swapAddress,
    functionName: "getAllMarkets",
    params: {},
  });

  async function updateUI() {
    var markets = await getAllMarkets();
    var marketList = [];
    console.log("getAllMarkets are ", markets);
    if (markets) {
      //markets[0] - buy token
      //markets[1] - sell token
      markets[0].forEach((x, i) => {
        console.log("market ", x, "-", i);
        marketList.push(x + "/" + markets[1][i]);
      });
      setMarketList(marketList);
      setOption(marketList[0]);
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  return (
    <div>
      <div className="gap"></div>
      <div className="floatingnav">
        <div className="widthgap"></div>
        <div className="widthgap"></div>
        <h3>Market:</h3>
        <div className="widthgap"></div>
        <div className="dropdown">
          <div>
            <select value={value} onChange={handleChange} className="button-81">
              {/* {listofMarkets.map((item, index) => {
                console.log(listofMarkets, item, index);
                <option key={index} value={item}>
                  {item}
                </option>;
              })} */}
              <option value={listofMarkets[0]}>{listofMarkets[0]}</option>
              <option value={listofMarkets[1]}>{listofMarkets[1]}</option>
              <option value={listofMarkets[2]}>{listofMarkets[2]}</option>
            </select>
            {/* <p>{`You selected ${value}`}</p> */}
          </div>
        </div>
        <div className="widthgapnew"></div>
        <h3>Market Price: </h3>
        <h4>{marketPrice}</h4>
        {/* <button onClick={handleChangeMP}>blabla</button> */}
      </div>
    </div>
  );
};

export default FloatingNav;
