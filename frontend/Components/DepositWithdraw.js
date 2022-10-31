import React from "react";
import { useEffect, useState } from "react";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

const DepositWithdraw = () => {
  const getInitialState = () => {
    const value = "Token A";
    return value;
  };
  const [value, setOption] = useState(getInitialState);
  const handleChange = (e) => {
    setOption(e.target.value);
  };
  const [tfValue1, setTFValue1] = useState("");
  const [tfValue2, setTFValue2] = useState("");

  const [alignment, setAlignment] = React.useState('Deposit');
  
  const handleChangeButton = (event, newAlignment) => {
    setAlignment(newAlignment);
  };
  const onClickSubmit = () => {
    return console.log(value, alignment, tfValue2*1);
  };

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
        <ToggleButton value="Deposit"><h6>Deposit</h6></ToggleButton>
        <ToggleButton value="Withdraw"><h6>Withdraw</h6></ToggleButton>
        </ToggleButtonGroup>
        {/* <p>{`You selected ${alignment}`}</p> */}
      </div>
      
      <div>
        <Box
            component="form"
            sx={{
                '& > :not(style)': { m: 1, width: '26ch'},
            }}
            noValidate
            autoComplete="off"
            >
            <div className='row11'>
            <div className="dropdown">
                <div>
                    <select value={value} onChange={handleChange} className="button-81">
                        <option value="Token A">Token A</option>
                        <option value="Token B">Token B</option>
                        <option value="Token C">Token C</option>
                    </select>
                    {/* <p>{`You selected ${value}`}</p> */}
                </div>
                </div>
              <div className="widthgap"></div>
              <TextField sx={{ backgroundColor: "#d3b7ff", borderRadius: '5px' }} onChange={(newValue) => setTFValue2(newValue.target.value)} value={tfValue2} type="number" id="outlined-basic" label="Quantity" variant="outlined" />
            </div>
        </Box>
      </div>
      <div className="centertext">
      <button className="button-33" onClick={onClickSubmit}>Submit!</button>
      </div>
    </div>
  )
};

export default DepositWithdraw;
