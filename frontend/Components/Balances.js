import React from "react";
import { useEffect, useState } from "react";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { FixedSizeList } from "react-window";
import Box from "@mui/material/Box";
import swapAbi from "../constants/Swap.json";
// import networkMapping from "../constants/networkMapping.json";
import { ethers } from "ethers";
import { useWeb3Contract, useMoralis } from "react-moralis";

function renderRow(props) {
  const { data, index, style } = props;
  const [tokenList, setTokenList] = useState(data.tokenList);
  const [qtyList, setQtyList] = useState(data.qtyList);

  return (
    <div>
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton>
          <ListItemText
            className="centertext"
            primary={`${tokenList[index]}`}
          />
          <ListItemText className="centertext" primary={`${qtyList[index]}`} />
        </ListItemButton>
      </ListItem>
    </div>
  );
}

const Balances = (props) => {
  const { swapAddress } = props;
  const { isWeb3Enabled, account } = useMoralis();
  const [tokenList, setTokenList] = useState([]);
  const [qtyList, setQtyList] = useState([]);

  const tokenAmountInUnitsToBigNumber = (amount, decimals) => {
    const decimalsPerToken = new BigNumber(10).pow(decimals);
    return amount.div(decimalsPerToken);
  };

  const { runContractFunction: getAllTokenBalanceForUser } = useWeb3Contract({
    abi: swapAbi,
    contractAddress: swapAddress,
    functionName: "getAllTokenBalanceForUser",
    params: {},
  });

  async function updateUI() {
    var nb = await getAllTokenBalanceForUser();
    var tList = [];
    console.log("getAllTokenBalancesForUser are ", nb);
    if (nb) {
      nb[1].forEach((item) => {
        tList.push(parseInt(item, 10));
      });
      setTokenList(nb[0]);
      setQtyList(tList);
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      console.log("in use effect web3 ", isWeb3Enabled);
      updateUI();
    }
  }, [isWeb3Enabled]);

  // const [tfValue1, setTFValue1] = useState("");
  // const [tfValue2, setTFValue2] = useState("");

  // const [alignment, setAlignment] = React.useState('Deposit');

  // const handleChangeButton = (event, newAlignment) => {
  //   setAlignment(newAlignment);
  // };
  // const onClickPlaceOrder = () => {
  //   return console.log(value.slice(7,-6), alignment, tfValue1*tfValue2);
  // };

  return (
    <div>
      {/* <div className="heightgapnew"></div> */}
      <div className="row1">
        <h4 className="customh4balance">Token</h4>
        <h4 className="customh4balance">Qty</h4>
      </div>
      <Box>
        <FixedSizeList
          height={139}
          width={250}
          itemSize={46}
          itemCount={tokenList.length}
          itemData={{ tokenList, qtyList }}
          overscanCount={5}
        >
          {renderRow}
        </FixedSizeList>
      </Box>
    </div>
  );
};

export default Balances;
