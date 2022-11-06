import * as React from "react";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { FixedSizeList } from "react-window";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import swapAbi from "../constants/Swap.json";
// import networkMapping from "../constants/networkMapping.json";
import { ethers } from "ethers";
import { useWeb3Contract, useMoralis } from "react-moralis";

function TabPanel(props) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 1 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

const renderRowOpenOrder = (props) => {
  const { data, index, style } = props;
  // marketList, typeList, priceList, qtyList, indexes, swapAddress
  const [marketList, setMarketList] = useState(data.marketList);
  const [typeList, setTypeList] = useState(data.typeList);
  const [priceList, setPriceList] = useState(data.priceList);
  const [qtyList, setQtyList] = useState(data.qtyList);
  const [indexes, setIndexesList] = useState(data.indexesList);
  const [swapAddress, setSwapAddress] = useState(data.swapAddress);

  const [buyToken, setBuyToken] = useState("KAR");
  const [sellToken, setSellToken] = useState("ARK");
  const [oI, setoI] = useState(0);

  const { runContractFunction: cancelOrder } = useWeb3Contract({
    abi: swapAbi,
    contractAddress: swapAddress,
    functionName: "cancelOrder",
    params: {
      typeOfOrder: 1,
      buyTokenSymbol: 2,
      sellTokenSymbol: 1,
      orderIndex: oI,
    },
  });

  async function cancelOrders(i_remove) {
    const res = await cancelOrder();
    console.log(res);
    data.deleteRow(i_remove);
    if (res) {
      // console.log(res);
      //update ui -- orderbook, balances
      // var ind = [];
      // var mar = [];
      // var ty = [];
      // var pr = [];
      // var qty = [];
      // for (var i = 0; i < indexes.length; i++) {
      //   if (i == i_remove) {
      //     continue;
      //   } else {
      //     ind.push(indexes[i]);
      //     mar.push(marketList[i]);
      //     ty.push(typeList[i]);
      //     pr.push(priceList[i]);
      //     qty.push(qtyList[i]);
      //   }
      // }
      // setIndexesList(ind);
      // setMarketList(mar);
      // setTypeList(ty);
      // setPriceList(pr);
      // setQtyList(qty);
      console.log(i_remove);
    }
  }

  const onClickSubmit = (i) => {
    setBuyToken(marketList[i].split("/")[0]);
    setSellToken(marketList[i].split("/")[1]);
    setoI(indexes[i]);
    console.log(i);
    cancelOrders(i);
  };
  //key={index}
  return (
    <div>
      <ListItem style={style} component="div" disablePadding>
        <ListItemButton>
          <ListItemText
            className="centertext"
            primary={`${marketList[index]}`}
          />
          <ListItemText className="centertext" primary={`${typeList[index]}`} />
          <ListItemText
            className="centertext"
            primary={`${priceList[index]}`}
          />
          <ListItemText className="centertext" primary={`${qtyList[index]}`} />
          <IconButton
            onClick={() => onClickSubmit(index)}
            sx={{ backgroundColor: "#fab4b4" }}
            edge="end"
            aria-label="delete"
          >
            <DeleteIcon />
          </IconButton>
        </ListItemButton>
      </ListItem>
    </div>
  );
};

function renderRowCancelledOrder(props) {
  const { index, style } = props;
  const [marketList, setMarketList] = useState([
    "A/B",
    "C/A",
    "A/B",
    "A/B",
    "B/C",
    "A/B",
  ]);
  const [typeList, setTypeList] = useState([
    "Buy",
    "Sell",
    "Buy",
    "Sell",
    "Buy",
    "Sell",
  ]);
  const [priceList, setPriceList] = useState([2, 0, 0, 0, 0, 0]);
  const [qtyList, setQtyList] = useState([3, 0, 0, 0, 0, 0]);

  return (
    <div>
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton>
          <ListItemText
            className="centertext"
            primary={`${marketList[index]}`}
          />
          <ListItemText className="centertext" primary={`${typeList[index]}`} />
          <ListItemText
            className="centertext"
            primary={`${priceList[index]}`}
          />
          <ListItemText className="centertext" primary={`${qtyList[index]}`} />
        </ListItemButton>
      </ListItem>
    </div>
  );
}

function renderRowTradeHistory(props) {
  const { index, style } = props;
  const [marketList, setMarketList] = useState([
    "A/B",
    "C/A",
    "A/B",
    "A/B",
    "B/C",
    "A/B",
  ]);
  const [typeList, setTypeList] = useState([
    "Buy",
    "Sell",
    "Buy",
    "Sell",
    "Buy",
    "Sell",
  ]);
  const [priceList, setPriceList] = useState([2, 0, 0, 0, 0, 0]);
  const [qtyList, setQtyList] = useState([3, 0, 0, 0, 0, 0]);

  return (
    <div>
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton>
          <ListItemText
            className="centertext"
            primary={`${marketList[index]}`}
          />
          <ListItemText className="centertext" primary={`${typeList[index]}`} />
          <ListItemText
            className="centertext"
            primary={`${priceList[index]}`}
          />
          <ListItemText className="centertext" primary={`${qtyList[index]}`} />
        </ListItemButton>
      </ListItem>
    </div>
  );
}

export default function HistoryTable(props) {
  const { isWeb3Enabled, account } = useMoralis();
  const [marketList, setMarketList] = useState([
    "A/B",
    "C/A",
    "A/B",
    "A/B",
    "B/C",
    "A/B",
  ]);
  const [typeList, setTypeList] = useState([
    "Buy",
    "Sell",
    "Buy",
    "Sell",
    "Buy",
    "Sell",
  ]);
  const [priceList, setPriceList] = useState([3, 2]);
  const [qtyList, setQtyList] = useState([2, 1]);
  const [indexesList, setIndexesList] = useState([1, 2]);
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const { swapAddress } = props;

  const deleteRow = (inde) => {
    var ind = [];
    var mar = [];
    var ty = [];
    var pr = [];
    var qty = [];
    for (var i = 0; i < indexesList.length; i++) {
      if (i == inde) {
        console.log("in ", i);
      } else {
        console.log("pushed", indexesList[i], marketList[i]);
        ind.push(indexesList[i]);
        mar.push(marketList[i]);
        ty.push(typeList[i]);
        pr.push(priceList[i]);
        qty.push(qtyList[i]);
      }
    }
    setIndexesList(ind);
    setMarketList(mar);
    setTypeList(ty);
    setPriceList(pr);
    setQtyList(qty);
  };

  async function updateUI() {
    var oo = await getOpenOrdersForUser();
    var oolist = [];
    console.log("getOpenOrdersForUser are ", oo);
    if (oo) {
      var indexes = oo[0];
      var buys = oo[1];
      var sells = oo[2];
      var types = oo[3];
      var prices = oo[4];
      var qtys = oo[5];
      var count = oo[6];
      var markets = [];

      indexes.forEach((item, index) => {
        markets.push(buys[index] + "/" + sells[index]);
      });

      setMarketList(markets);
      setPriceList(prices);
      setQtyList(qtys);
      setIndexes(indexes);
      setTypeList(types);
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      //updateUI();
    }
  }, [isWeb3Enabled]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  return (
    <div>
      <div className="row11">
        <div>
          <h3>All Markets</h3>
        </div>
      </div>
      <Box sx={{ bgcolor: "#2a2a2a", width: 800, borderRadius: "10px" }}>
        <AppBar
          position="static"
          sx={{ bgcolor: "#7700ff", width: 800, borderRadius: "10px" }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="secondary"
            textColor="inherit"
            variant="fullWidth"
            aria-label="full width tabs example"
          >
            <Tab
              sx={{ fontSize: "16px" }}
              label="Open Orders"
              {...a11yProps(0)}
            />
            <Tab
              sx={{ fontSize: "16px" }}
              label="Cancelled Orders"
              {...a11yProps(1)}
            />
            <Tab
              sx={{ fontSize: "16px" }}
              label="Trade History"
              {...a11yProps(2)}
            />
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={theme.direction === "rtl" ? "x-reverse" : "x"}
          index={value}
          onChangeIndex={handleChangeIndex}
        >
          <TabPanel value={value} index={0} dir={theme.direction}>
            <div className="row1">
              <h4 className="customh4newnew">Market</h4>
              <h4 className="customh4newnew">Type</h4>
              <h4 className="customh4newnew">Price</h4>
              <h4 className="customh4newnew">Qty</h4>
              <h4 className="customh4newnewnew2">Cancel</h4>
            </div>
            <Box
              sx={{
                bgcolor: "#2a2a2a",
                borderRadius: "10px",
                color: "#e1e0e0",
              }}
            >
              <FixedSizeList
                height={140}
                width={780}
                itemSize={46}
                itemCount={priceList.length}
                itemData={{
                  marketList,
                  typeList,
                  priceList,
                  qtyList,
                  indexesList,
                  swapAddress,
                  deleteRow,
                }}
                overscanCount={5}
              >
                {renderRowOpenOrder}
              </FixedSizeList>
            </Box>
          </TabPanel>

          <TabPanel value={value} index={1} dir={theme.direction}>
            <div className="row1">
              <h4 className="customh4new">Market</h4>
              <h4 className="customh4new">Type</h4>
              <h4 className="customh4new">Price</h4>
              <h4 className="customh4new">Qty</h4>
            </div>
            <Box
              sx={{
                bgcolor: "#2a2a2a",
                borderRadius: "10px",
                color: "#e1e0e0",
              }}
            >
              <FixedSizeList
                height={140}
                width={780}
                itemSize={46}
                itemCount={priceList.length}
                overscanCount={5}
              >
                {renderRowCancelledOrder}
              </FixedSizeList>
            </Box>
          </TabPanel>

          <TabPanel value={value} index={2} dir={theme.direction}>
            <div className="row1">
              <h4 className="customh4new">Market</h4>
              <h4 className="customh4new">Type</h4>
              <h4 className="customh4new">Price</h4>
              <h4 className="customh4new">Qty</h4>
            </div>
            <Box
              sx={{
                bgcolor: "#2a2a2a",
                borderRadius: "10px",
                color: "#e1e0e0",
              }}
            >
              <FixedSizeList
                height={140}
                width={780}
                itemSize={46}
                itemCount={priceList.length}
                overscanCount={5}
              >
                {renderRowTradeHistory}
              </FixedSizeList>
            </Box>
          </TabPanel>
        </SwipeableViews>
      </Box>
    </div>
  );
}
