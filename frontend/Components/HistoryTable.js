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

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
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

function renderRow(props) {
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
    <h3>All Markets</h3>
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
        <div>
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
                width={750}
                itemSize={46}
                itemCount={priceList.length}
                overscanCount={5}
            >
                {renderRow}
            </FixedSizeList>
            </Box>
            </div>
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
        <div>
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
                width={750}
                itemSize={46}
                itemCount={priceList.length}
                overscanCount={5}
            >
                {renderRow}
            </FixedSizeList>
            </Box>
            </div>
        </TabPanel>
        <TabPanel value={value} index={2} dir={theme.direction}>
        <div>
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
                width={750}
                itemSize={46}
                itemCount={priceList.length}
                overscanCount={5}
            >
                {renderRow}
            </FixedSizeList>
            </Box>
            </div>
        </TabPanel>
      </SwipeableViews>
    </Box>
    </div>
  );
}
