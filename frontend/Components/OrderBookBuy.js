import * as React from "react";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { FixedSizeList } from "react-window";
import swapAbi from "../constants/Swap.json";
// import networkMapping from "../constants/networkMapping.json";
import { ethers } from "ethers";
import { useWeb3Contract, useMoralis } from "react-moralis";

function renderRow(props) {
  const { data, index, style } = props;
  useEffect(() => {}, [props.itemData]);
  const [priceList, setPriceList] = useState(data.listPrice.priceList);
  const [qtyList, setQtyList] = useState(data.listQty.qtyList);
  console.log("in render row", priceList, qtyList);
  return (
    <div>
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton>
          <ListItemText
            className="centertext"
            primary={`${priceList[index]}`}
          />
          <ListItemText className="centertext" primary={`${qtyList[index]}`} />
          <ListItemText
            className="centertext"
            primary={`${priceList[index] * qtyList[index]}`}
          />
        </ListItemButton>
      </ListItem>
    </div>
  );
}

export default function OrderBookBuy(props) {
  const { swapAddress, buySymbol, sellSymbol } = props;
  const { isWeb3Enabled, account } = useMoralis();
  const [priceList, setPriceList] = useState([]);
  const [qtyList, setQtyList] = useState([]);
  // const [buyToken, setBuyToken] = useState(buySymbol);
  // const [sellToken, setSellToken] = useState(sellSymbol);
  const [buyTokenIndex, setBuyTokenIndex] = useState(0);
  const [sellTokenIndex, setSellTokenIndex] = useState(0);

  useEffect(() => {
    console.log("Symbols are ", buySymbol, sellSymbol);
    // setBuyToken(buySymbol);
    // setSellToken(sellSymbol);
    updateUI();
  }, [buySymbol, sellSymbol]);

  const { runContractFunction: getOrderBook } = useWeb3Contract({
    abi: swapAbi,
    contractAddress: swapAddress,
    functionName: "getOrderBook",
    params: {
      buyTokenIndex: 2,
      sellTokenIndex: 1,
      type_of_order: 0,
    },
  });
  const { runContractFunction: getBuyTokenIndex } = useWeb3Contract({
    abi: swapAbi,
    contractAddress: swapAddress,
    functionName: "getTokenIndex",
    params: {
      symbolName: buySymbol,
    },
  });
  const { runContractFunction: getSellTokenIndex } = useWeb3Contract({
    abi: swapAbi,
    contractAddress: swapAddress,
    functionName: "getTokenIndex",
    params: {
      symbolName: sellSymbol,
    },
  });

  async function updateUI() {
    // var ti = await getBuyTokenIndex();
    // setBuyTokenIndex(ti);
    // console.log("setBuyTokenIndex", ti);
    // ti = await getSellTokenIndex();
    // setSellTokenIndex(ti);
    // console.log("setSellTokenIndex", ti);

    var ob = await getOrderBook();
    console.log("ob", ob);
    var pl = [];
    var ql = [];
    if (ob) {
      console.log("Got order book ", ob[0], ob[1], ob[2]);
      var queue = ob[0];
      var prices = ob[1];
      var qty = ob[2];
      queue.forEach((item, index) => {
        pl.push(prices[parseInt(item, 10) - 1].toNumber());
        ql.push(qty[parseInt(item, 10) - 1].toNumber());
      });
      console.log(" converted to ", pl, ql);
      setPriceList(pl);
      setQtyList(ql);
    }
  }

  return (
    <div>
      <div className="row1">
        <h4 className="customh4">Price</h4>
        <h4 className="customh4">Qty</h4>
        <h4 className="customh4">Total</h4>
      </div>
      <div className="heightgapnew"></div>
      <Box sx={{ bgcolor: "background.paper", borderRadius: "10px" }}>
        <FixedSizeList
          height={240}
          width={280}
          itemSize={46}
          itemCount={priceList.length}
          itemData={{ listPrice: { priceList }, listQty: { qtyList } }}
          overscanCount={5}
        >
          {renderRow}
        </FixedSizeList>
      </Box>
    </div>
  );
}
