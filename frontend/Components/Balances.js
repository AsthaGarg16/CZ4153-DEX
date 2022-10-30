import React from "react";
import { useEffect, useState } from "react";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

const Balances = () => {
  const [tfValue1, setTFValue1] = useState("");
  const [tfValue2, setTFValue2] = useState("");

  const [alignment, setAlignment] = React.useState('Deposit');
  
  const handleChangeButton = (event, newAlignment) => {
    setAlignment(newAlignment);
  };
  const onClickPlaceOrder = () => {
    return console.log(value.slice(7,-6), alignment, tfValue1*tfValue2);
  };

  return (
    <div>
      <div className="widthgap"></div>
      <div className="centertext">
      <ToggleButtonGroup
        color="standard"
        value={alignment}
        exclusive
        onChange={handleChangeButton}
        aria-label="Platform"
        >
        <ToggleButton value="Deposit"><h6>Deposit</h6></ToggleButton>
        <ToggleButton value="Withdraw"><h6>Withdraw</h6></ToggleButton>
        </ToggleButtonGroup>
      </div>
    </div>
  )
};

export default Balances;
