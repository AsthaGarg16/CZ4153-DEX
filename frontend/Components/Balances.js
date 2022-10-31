import React from "react";
import { useEffect, useState } from "react";
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList } from 'react-window';
import Box from '@mui/material/Box';

function renderRow(props) {
  const { index, style } = props;
  const [tokenList, setTokenList] = useState(['A', 'B', 'C']);
  const [qtyList, setQtyList] = useState([3,0,0]);

  return (
    <div>
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton>
          <ListItemText className='centertext' primary={`${tokenList[index]}`} />
          <ListItemText className='centertext' primary={`${qtyList[index]}`} />
        </ListItemButton>
      </ListItem>
    </div>
    
  );
}

const Balances = () => {
  const [tokenList, setTokenList] = useState(['A', 'B', 'C']);

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
      <div className='row1'>
      <h4 className='customh4balance'>Token</h4>
      <h4 className='customh4balance'>Qty</h4>
    </div>
    <Box>
      <FixedSizeList
        height={139}
        width={250}
        itemSize={46}
        itemCount={tokenList.length}
        overscanCount={5}
      >
        {renderRow}
      </FixedSizeList>
    </Box>
    </div>
  )
};

export default Balances;
