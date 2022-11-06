import * as React from "react";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { FixedSizeList } from "react-window";
import swapAbi from "../constants/Swap.json";
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

export default function OrderBookSell(props) {
  const { swapAddress, buySymbol, sellSymbol } = props;
  const { isWeb3Enabled, account } = useMoralis();
  const [priceList, setPriceList] = useState([]);
  const [qtyList, setQtyList] = useState([]);
  const [buyTokenIndex, setBuyTokenIndex] = useState(convertToIndex(buySymbol));
  const [sellTokenIndex, setSellTokenIndex] = useState(
    convertToIndex(sellSymbol)
  );

  function convertToIndex(symbol) {
    if (symbol == "ARK") {
      return 1;
    }
    if (symbol == "KAR") {
      return 2;
    }
    if (symbol == "RAK") {
      return 3;
    }
  }

  useEffect(() => {
    console.log("Symbols are ", buySymbol, sellSymbol);
    updateUI();
  }, [buySymbol, sellSymbol]);

  const { runContractFunction: getOrderBook } = useWeb3Contract({
    abi: swapAbi,
    contractAddress: swapAddress,
    functionName: "getOrderBook",
    params: {
      buyTokenIndex: convertToIndex(buySymbol),
      sellTokenIndex: convertToIndex(sellSymbol),
      type_of_order: 1,
    },
  });

  async function updateUI() {
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
      <Box sx={{ bgcolor: "#2a2a2a", borderRadius: "10px", color: "#e1e0e0" }}>
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
