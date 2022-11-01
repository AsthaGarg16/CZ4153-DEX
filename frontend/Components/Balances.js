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
  console.log("Balances: ", tokenList, qtyList);

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

const Balances = (swapAddress) => {
  const { isWeb3Enabled, account } = useMoralis();
  const [tokenList, setTokenList] = useState(["A", "B", "C"]);
  const [qtyList, setQtyList] = useState([1, 2, 3]);

  const { runContractFunction: getAllTokenBalancesForUser } = useWeb3Contract({
    abi: swapAbi,
    contractAddress: swapAddress,
    functionName: "getAllTokenBalancesForUser",
    params: {},
  });

  async function updateUI() {
    var nb = await getAllTokenBalancesForUser();
    console.log("getAllTokenBalancesForUser are ", nb);
    if (nb) {
      setTokenList(nb[0]);
      setQtyList(nb[1]);
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) {
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
