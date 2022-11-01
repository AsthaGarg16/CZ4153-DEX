import * as React from 'react';
import { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList } from 'react-window';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

// import * as React from 'react';
// import { pink } from '@mui/material/colors';
// import Checkbox from '@mui/material/Checkbox';

// const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

// export default function ColorCheckboxes() {
//   return (
//     <div>
//       <Checkbox {...label} defaultChecked />
//       <Checkbox {...label} defaultChecked color="secondary" />
//       <Checkbox {...label} defaultChecked color="success" />
//       <Checkbox {...label} defaultChecked color="default" />
//       <Checkbox
//         {...label}
//         defaultChecked
//         sx={{
//           color: pink[800],
//           '&.Mui-checked': {
//             color: pink[600],
//           },
//         }}
//       />
//     </div>
//   );
// }


function TabPanel(props) {

  const { children, value, index} = props;

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
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

function renderRowOpenOrder(props) {
    const { index, style } = props;
    const [marketList, setMarketList] = useState(['A/B', 'C/A', 'A/B', 'A/B', 'B/C', 'A/B']);
    const [typeList, setTypeList] = useState(['Buy', 'Sell', 'Buy', 'Sell', 'Buy', 'Sell']);
    const [priceList, setPriceList] = useState([2,0,0,0,0,0]);
    const [qtyList, setQtyList] = useState([3,0,0,0,0,0]);

    const onClickSubmit = (market, type, price, qty) => {
      return console.log(market, type, price, qty);
    };
  
    return (
      <div>
        <ListItem style={style} key={index} component="div" disablePadding>
          <ListItemButton >
            <ListItemText className='centertext' primary={`${marketList[index]}`} />
            <ListItemText className='centertext' primary={`${typeList[index]}`} />
            <ListItemText className='centertext' primary={`${priceList[index]}`} />
            <ListItemText className='centertext' primary={`${qtyList[index]}`} />
            <IconButton onClick={onClickSubmit(marketList[index], typeList[index], priceList[index], qtyList[index])} sx={{ backgroundColor: '#fab4b4'}} edge="end" aria-label="delete">
                    <DeleteIcon/>
            </IconButton>
          </ListItemButton>
        </ListItem>
      </div>
      
    );
  }

  function renderRowCancelledOrder(props) {
    const { index, style } = props;
    const [marketList, setMarketList] = useState(['A/B', 'C/A', 'A/B', 'A/B', 'B/C', 'A/B']);
    const [typeList, setTypeList] = useState(['Buy', 'Sell', 'Buy', 'Sell', 'Buy', 'Sell']);
    const [priceList, setPriceList] = useState([2,0,0,0,0,0]);
    const [qtyList, setQtyList] = useState([3,0,0,0,0,0]);
  
    return (
      <div>
        <ListItem style={style} key={index} component="div" disablePadding>
          <ListItemButton>
            <ListItemText className='centertext' primary={`${marketList[index]}`} />
            <ListItemText className='centertext' primary={`${typeList[index]}`} />
            <ListItemText className='centertext' primary={`${priceList[index]}`} />
            <ListItemText className='centertext' primary={`${qtyList[index]}`} />
          </ListItemButton>
        </ListItem>
      </div>
      
    );
  }

  function renderRowTradeHistory(props) {
    const { index, style } = props;
    const [marketList, setMarketList] = useState(['A/B', 'C/A', 'A/B', 'A/B', 'B/C', 'A/B']);
    const [typeList, setTypeList] = useState(['Buy', 'Sell', 'Buy', 'Sell', 'Buy', 'Sell']);
    const [priceList, setPriceList] = useState([2,0,0,0,0,0]);
    const [qtyList, setQtyList] = useState([3,0,0,0,0,0]);
  
    return (
      <div>
        <ListItem style={style} key={index} component="div" disablePadding>
          <ListItemButton>
            <ListItemText className='centertext' primary={`${marketList[index]}`} />
            <ListItemText className='centertext' primary={`${typeList[index]}`} />
            <ListItemText className='centertext' primary={`${priceList[index]}`} />
            <ListItemText className='centertext' primary={`${qtyList[index]}`} />
          </ListItemButton>
        </ListItem>
      </div>
      
    );
  }

export default function HistoryTable() {
  
    const [priceList, setPriceList] = useState([2,0,0,0,0,0]);
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  const getInitialStateOrderType = () => {
    const valueOrderType = "Market Orders";
    return valueOrderType;
  };
  const [valueOrderType, setOptionOrderType] = useState(getInitialStateOrderType);
  const handleChangeOrderType = (e) => {
    setOptionOrderType(e.target.valueOrderType);
  };

  return (
    <div>
        <div className='row11'>
            <div className='widthgapnewnew'></div>
            <div>
                <h3>All Markets</h3>
            </div>
            <div className='widthgapnewnewnew'></div>
            <div className="dropdown">
                <div>
                    <select value={valueOrderType} onChange={handleChangeOrderType} className="button-89">
                        <option value="Market Orders">Market Orders</option>
                        <option value="Limit Orders">Limit Orders</option>
                    </select>
                    {/* <p>{`You selected ${value}`}</p> */}
                </div>
            </div>
        </div>
        <Box sx={{ bgcolor: 'background.paper', width: 800, borderRadius: '10px'}}>
            <AppBar position="static" sx={{ bgcolor: '#7700ff', width: 800, borderRadius: '10px'}}>
                <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="secondary"
                textColor="inherit"
                variant="fullWidth"
                aria-label="full width tabs example"
                >
                    <Tab sx={{ fontSize: '16px'}} label="Open Orders" {...a11yProps(0)} />
                    <Tab sx={{ fontSize: '16px'}} label="Cancelled Orders" {...a11yProps(1)} />
                    <Tab sx={{ fontSize: '16px'}} label="Trade History" {...a11yProps(2)} />
                </Tabs>
            </AppBar>
            <SwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={value}
            onChangeIndex={handleChangeIndex}
            >
                <TabPanel value={value} index={0} dir={theme.direction}>
                    <div className='row1'>
                        <h4 className='customh4newnew'>Market</h4>
                        <h4 className='customh4newnew'>Type</h4>
                        <h4 className='customh4newnew'>Price</h4>
                        <h4 className='customh4newnew'>Qty</h4>
                        <h4 className='customh4newnewnew2'>Cancel</h4>
                    </div>
                    <Box
                    sx={{ bgcolor: 'background.paper', borderRadius: '10px'}}
                    >
                        <FixedSizeList
                        height={130}
                        width={780}
                        itemSize={46}
                        itemCount={priceList.length}
                        overscanCount={5}
                        >
                            {renderRowOpenOrder}
                        </FixedSizeList>
                    </Box>
                </TabPanel>

                <TabPanel value={value} index={1} dir={theme.direction}>
                    <div className='row1'>
                        <h4 className='customh4new'>Market</h4>
                        <h4 className='customh4new'>Type</h4>
                        <h4 className='customh4new'>Price</h4>
                        <h4 className='customh4new'>Qty</h4>
                    </div>
                    <Box
                    sx={{ bgcolor: 'background.paper', borderRadius: '10px'}}
                    >
                        <FixedSizeList
                        height={130}
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
                    <div className='row1'>
                        <h4 className='customh4new'>Market</h4>
                        <h4 className='customh4new'>Type</h4>
                        <h4 className='customh4new'>Price</h4>
                        <h4 className='customh4new'>Qty</h4>
                    </div>
                    <Box
                    sx={{ bgcolor: 'background.paper', borderRadius: '10px'}}
                    >
                        <FixedSizeList
                        height={130}
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
