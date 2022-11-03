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
  const [priceList, setPriceList] = useState(data.listPrice.priceList);
  const [qtyList, setQtyList] = useState(data.listQty.qtyList);
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
  const [priceList, setPriceList] = useState([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  const [qtyList, setQtyList] = useState([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  const [buyToken, setBuyToken] = useState(buySymbol);
  const [sellToken, setSellToken] = useState(sellSymbol);

  useEffect(() => {
    if (sellToken !== sellSymbol && buyToken !== buySymbol) {
      console.log("Symbols are ", buySymbol, sellSymbol);
      setBuyToken(buySymbol);
      setSellToken(sellSymbol);
      updateUI();
    }
  }, [buySymbol, sellSymbol]);

  const { runContractFunction: getBuyOrderBook } = useWeb3Contract({
    abi: swapAbi,
    contractAddress: swapAddress,
    functionName: "getBuyOrderBook",
    params: {
      buyTokenSymbol: buySymbol,
      sellTokenSymbol: sellSymbol,
    },
  });

  async function updateUI() {
    var ob = await getBuyOrderBook();
    var pl = [];
    var ql = [];
    if (ob) {
      console.log("Got order book ", ob[0], ob[1], ob[2]);
      var queue = ob[0];
      var prices = ob[1];
      var qty = ob[2];
      queue.forEach((item, index) => {
        pl.push(prices[item]);
        ql.push(qty[item]);
      });
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
