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

const DepositWithdraw = (props) => {
  const { swapAddress, tokensList } = props;

  const [value, setOption] = useState(tokensList[0]);
  const handleChange = (e) => {
    setOption(e.target.value);
  };
  const [tfValue2, setTFValue2] = useState("");

  const [alignment, setAlignment] = React.useState("Deposit");

  const handleChangeButton = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  async function updateBalances(align) {
    if (align == "Deposit") {
      console.log("Depositing");
      const res = await depositToken();
      if (res) {
        //trigger balances update
        setTFValue2(0);
      }
    } else {
      console.log("Withdrawing");
      const res = await withdrawToken();
      if (res) {
        //trigger balances update
        setTFValue2(0);
      }
    }
  }
  const onClickSubmit = () => {
    updateBalances(alignment);
    return console.log(value, alignment, tfValue2 * 1);
  };

  const { runContractFunction: depositToken } = useWeb3Contract({
    abi: swapAbi,
    contractAddress: swapAddress,
    functionName: "depositToken",
    params: {
      symbolName: value,
      amount: tfValue2,
    },
  });

  const { runContractFunction: withdrawToken } = useWeb3Contract({
    abi: swapAbi,
    contractAddress: swapAddress,
    functionName: "withdrawToken",
    params: {
      symbolName: value,
      amount: tfValue2,
    },
  });

  return (
    <div>
      <div className="heightgap"></div>
      <div className="centertext">
        <ToggleButtonGroup
          color="standard"
          value={alignment}
          exclusive
          onChange={handleChangeButton}
          aria-label="Platform"
        >
          <ToggleButton value="Deposit">
            <h6>Deposit</h6>
          </ToggleButton>
          <ToggleButton value="Withdraw">
            <h6>Withdraw</h6>
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
            <div className="dropdown">
              <div>
                <select
                  value={value}
                  onChange={handleChange}
                  className="button-81"
                >
                  <option value={tokensList[0]}>{tokensList[0]}</option>
                  <option value={tokensList[1]}>{tokensList[1]}</option>
                  <option value={tokensList[2]}>{tokensList[2]}</option>
                </select>
                {/* <p>{`You selected ${value}`}</p> */}
              </div>
            </div>
            <div className="widthgap"></div>
            <TextField
              sx={{ backgroundColor: "#d7c5fc", borderRadius: "5px" }}
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
      <div className="centertext">
        <button className="button-33" onClick={onClickSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default DepositWithdraw;
