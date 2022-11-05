import React from "react";
import { useEffect, useState } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import swapAbi from "../constants/Swap.json";
// import networkMapping from "../constants/networkMapping.json";
import { ethers } from "ethers";
import { useWeb3Contract, useMoralis } from "react-moralis";

const CreateOrder = (props) => {
  const { swapAddress, buySymbol, sellSymbol } = props;

  const [buyToken, setBuySymbol] = useState(buySymbol);
  const [sellToken, setSellSymbol] = useState(sellSymbol);

  const { isWeb3Enabled, account } = useMoralis();
  const getInitialState = () => {
    const value = "Create Market Order";
    return value;
  };
  const [value, setOption] = useState(getInitialState);
  const handleChange = (e) => {
    setOption(e.target.value);
  };
  const [tfValue1, setTFValue1] = useState("");
  const [tfValue2, setTFValue2] = useState("");

  const [alignment, setAlignment] = React.useState("Buy");

  const handleChangeButton = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  useEffect(() => {
    if (sellToken !== sellSymbol && buyToken !== buySymbol) {
      setBuySymbol(buySymbol);
      setSellSymbol(sellSymbol);
    }
  }, [buySymbol, sellSymbol]);

  async function updateBalances(align) {
    if (align == "Deposit") {
      const res = await depositToken();
      if (res) {
        //trigger balances update
        setTFValue2(0);
      }
    } else {
      const res = await withdrawToken();
      if (res) {
        //trigger balances update
        setTFValue2(0);
      }
    }
  }
  const onClickPlaceOrder = () => {
    if (isWeb3Enabled) {
      if (alignment == "Buy") {
        if (value.split(" ")[1] == "Limit") {
          console.log("Creating buy limit order", tfValue1, tfValue2);
          createBuyOrder();
        } else {
          setTFValue1(1000);
          console.log("Creating buy market order", tfValue1, tfValue2);
          createBuyMarketOrder();
        }
      } else {
        if (value.split(" ")[1] == "Limit") {
          console.log("Creating sell limit order", tfValue1, tfValue2);
          createSellOrder();
        } else {
          setTFValue1(0);
          console.log("Creating sell market order", tfValue1, tfValue2);
          createSellMarketOrder();
        }
      }
    }

    return console.log(value, alignment, tfValue2 * 1);
  };

  const { runContractFunction: createBuyOrder } = useWeb3Contract({
    abi: swapAbi,
    contractAddress: swapAddress,
    functionName: "createOrder",
    params: {
      typeOfOrder: "0",
      buySymbolName: buyToken,
      sellSymbolName: sellToken,
      price: parseInt(tfValue1),
      quantity: parseInt(tfValue2),
      isMarketOrder: false,
    },
  });
  const { runContractFunction: createSellOrder } = useWeb3Contract({
    abi: swapAbi,
    contractAddress: swapAddress,
    functionName: "createOrder",
    params: {
      typeOfOrder: "1",
      buySymbolName: sellToken,
      sellSymbolName: buyToken,
      price: parseInt(tfValue1),
      quantity: parseInt(tfValue2),
      isMarketOrder: false,
    },
  });
  const { runContractFunction: createSellMarketOrder } = useWeb3Contract({
    abi: swapAbi,
    contractAddress: swapAddress,
    functionName: "createOrder",
    params: {
      typeOfOrder: "1",
      buySymbolName: sellToken,
      sellSymbolName: buyToken,
      price: parseInt(0),
      quantity: parseInt(tfValue2),
      isMarketOrder: true,
    },
  });

  const { runContractFunction: createBuyMarketOrder } = useWeb3Contract({
    abi: swapAbi,
    contractAddress: swapAddress,
    functionName: "createOrder",
    params: {
      typeOfOrder: "0",
      buySymbolName: buyToken,
      sellSymbolName: sellToken,
      price: parseInt(100000000),
      quantity: parseInt(tfValue2),
      isMarketOrder: true,
    },
  });

  // const { runContractFunction: createSellOrder } = useWeb3Contract({
  //   abi: swapAbi,
  //   contractAddress: swapAddress,
  //   functionName: "createSellOrder",
  //   params: {
  //     buySymbolName: buyToken,
  //     sellSymbolName: sellToken,
  //     price: tfValue1,
  //     quantity: tfValue2,
  //   },
  // });

  // const { runContractFunction: buyMarketOrder } = useWeb3Contract({
  //   abi: swapAbi,
  //   contractAddress: swapAddress,
  //   functionName: "buyMarketOrder",
  //   params: {
  //     buySymbolName: buyToken,
  //     sellSymbolName: sellToken,
  //     quantity: tfValue2,
  //   },
  // });

  // const { runContractFunction: sellMarketOrder } = useWeb3Contract({
  //   abi: swapAbi,
  //   contractAddress: swapAddress,
  //   functionName: "sellMarketOrder",
  //   params: {
  //     buySymbolName: sellToken,
  //     sellSymbolName: buyToken,
  //     quantity: tfValue2,
  //   },
  // });

  return (
    <div>
      {/* <div className="heightgapnew"></div> */}
      <div className="dropdown">
        <div>
          <select value={value} onChange={handleChange} className="button-85">
            <option value="Create Market Order">Create Market Order</option>
            <option value="Create Limit Order">Create Limit Order</option>
          </select>
          {/* <p>{`You selected ${value}`}</p> */}
        </div>
      </div>
      <div className="centertext">
        <ToggleButtonGroup
          color="standard"
          value={alignment}
          exclusive
          onChange={handleChangeButton}
          aria-label="Platform"
        >
          <ToggleButton value="Buy">
            <h4>Buy</h4>
          </ToggleButton>
          <ToggleButton value="Sell">
            <h4>Sell</h4>
          </ToggleButton>
        </ToggleButtonGroup>
        {/* <p>{`You selected ${alignment}`}</p> */}
      </div>
      <div>
        <Box
          component="form"
          sx={{
            "& > :not(style)": { m: 1, width: "26ch" },
          }}
          noValidate
          autoComplete="off"
        >
          <div className="row11">
            <TextField
              disabled={value.split(" ")[1] == "Market" ? true : false}
              sx={{ backgroundColor: "#d3b7ff", borderRadius: "5px" }}
              onChange={(newValue) => setTFValue1(newValue.target.value)}
              value={tfValue1}
              type="number"
              id="outlined-basic"
              label="Price"
              variant="outlined"
            />
            <div className="widthgap"></div>
            <TextField
              sx={{ backgroundColor: "#d3b7ff", borderRadius: "5px" }}
              onChange={(newValue) => setTFValue2(newValue.target.value)}
              value={tfValue2}
              type="number"
              id="outlined-basic"
              label="Quantity"
              variant="outlined"
            />
          </div>
        </Box>
      </div>
      <h5>{`Total: ${tfValue1 * tfValue2}`}</h5>
      <div className="centertext">
        <button className="button-33" onClick={onClickPlaceOrder}>
          Place Order!
        </button>
      </div>
    </div>
  );
};

export default CreateOrder;
