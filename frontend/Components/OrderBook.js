import * as React from 'react';
import { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList } from 'react-window';

function renderRow(props) {
  const { index, style } = props;
  const [priceList, setPriceList] = useState([2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
  const [qtyList, setQtyList] = useState([3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);

  return (
    <div>
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton>
          <ListItemText className='centertext' primary={`${priceList[index]}`} />
          <ListItemText className='centertext' primary={`${qtyList[index]}`} />
          <ListItemText className='centertext' primary={`${priceList[index]*qtyList[index]}`} />
        </ListItemButton>
      </ListItem>
    </div>
    
  );
}

export default function OrderBook() {
  const [priceList, setPriceList] = useState([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
  return (
    <div>
    <div className='row1'>
      <h4 className='customh4'>Price</h4>
      <h4 className='customh4'>Qty</h4>
      <h4 className='customh4'>Total</h4>
    </div>
    <Box
      sx={{ bgcolor: 'background.paper', borderRadius: '10px'}}
    >
      <FixedSizeList
        height={260}
        width={280}
        itemSize={46}
        itemCount={priceList.length}
        overscanCount={5}
      >
        {renderRow}
      </FixedSizeList>
    </Box>
    </div>
  );
}
