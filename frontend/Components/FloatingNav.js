import React from "react";
import { useEffect, useState } from "react";
import swapAbi from "../constants/Swap.json";
// import networkMapping from "../constants/networkMapping.json";
import { ethers } from "ethers";
import { useWeb3Contract, useMoralis } from "react-moralis";
import OrderBookBuy from "../Components/OrderBookBuy";
import OrderBookSell from "../Components/OrderBookSell";
import CreateOrder from "../Components/CreateOrder";
import Balances from "../Components/Balances";
import HistoryTable from "../Components/HistoryTable";
import DepositWithdraw from "../Components/DepositWithdraw";

const FloatingNav = (swapAddress) => {
  const { isWeb3Enabled, account } = useMoralis();
  const [marketPrice, setMarketPrice] = useState(0);
  const [listofMarkets, setMarketList] = useState(["A/B", "B/C", "C/A"]); //to update

  // const getInitialState = () => {
  //   const value = "A/B";
  //   return value;
  // };
  const [value, setOption] = useState("A/B");

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

  console.log(value.split("/"));

  return (
    <div className="wrapper">
      <div className="one">
        <div>
          <div className="gap"></div>
          <div className="floatingnav">
            <div className="widthgap"></div>
            <div className="widthgap"></div>
            <h3>Market:</h3>
            <div className="widthgap"></div>
            <div className="dropdown">
              <div>
                <select
                  value={value}
                  onChange={handleChange}
                  className="button-81"
                >
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
        <div className="onerow1">hi</div>
        <div className="onerow2">
          <HistoryTable />
        </div>
      </div>
      <div className="two">
        <h3>Order Book</h3>
        <div className="heightgap"></div>
        <h4 className="customh4buy">BUY</h4>
        <OrderBookBuy
          swapAddress="0x00" //to Update
          buySymbol={value.split("/")[0]}
          sellSymbol={value.split("/")[1]}
        />
        <div className="heightgap"></div>
        <div className="heightgap"></div>
        <h4 className="customh4sell">SELL</h4>
        <OrderBookSell
          swapAddress="0x00" //to Update
          buySymbol={value.split("/")[0]}
          sellSymbol={value.split("/")[1]}
        />
      </div>
      <div className="three">
        <div className="threerow1">
          <CreateOrder />
        </div>
        <div className="threerow2">
          <h3>Balances</h3>
          <Balances />
        </div>
        <div className="threerow3">
          <DepositWithdraw
            swapAddress="0x00" //to Update
            tokensList={["ARK", "KAR", "RAK"]}
          />
        </div>
      </div>
    </div>
  );
};

export default FloatingNav;
