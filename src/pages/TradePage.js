import React, { useState, useEffect, useContext} from 'react';
import axios from 'axios';
import { Box, Grid, Stack } from '@mui/material';
import OpenOrder from '../components/OpenOrder'; 
import CloseOrder from '../components/CloseOrder'
import {AppContext} from '../components/AppProvider';
import { Connected, Whitelisted } from '../components/Alert';
import TradingViewWidget from "../components/TradingViewWidget";

const TradePage = () => {
  const [sector, setSector] = useState('');
  const [symbol, setSymbol] = useState('');
  const [balance, setBalance] = useState(0); 
  const [size, setSize] = useState(0); 
  const [leverage, setLeverage] = useState(1);
  const [symbolList, setSymbolList] = useState([]);
  const [symbolLeverages, setSymbolLeverages] = useState({});
  const [position, setPosition] = useState([]); 
  const [price, setPrice] = useState(0); 
  const [tradingSymbol, setTradingSymbol] = useState('');

  const host = "https://9aef-2001-1970-51a3-8f00-00-8e0.ngrok-free.app";
  const info = useContext(AppContext);


  const handleSymbols = async (selectedSector) => {
    try {
      console.log(`Fetching symbols for sector: ${selectedSector}...`);
      const response = await axios.get(`${host}/symbols/${selectedSector}`, {
        headers: { "ngrok-skip-browser-warning": "true" }
        });

      const symbols = Object.keys(response.data); 
      const symbolLeverages = response.data; 

      setSymbolList(symbols);
      setSymbolLeverages(symbolLeverages);

      if (symbols.length > 0) {
        setSymbol(symbols[0]); 
      }
    } catch (error) {
      console.error('Error fetching symbols:', error);
      setSymbolList([]);
      setSymbolLeverages({});
    }
  };
  
  const handleBalance = async (address) => {
    try {
      console.log("Fetching balance...");
      const response = await axios.get(`${host}/wallets/${address}/balances`, {
        headers: { "ngrok-skip-browser-warning": "true" }
        });

      const balances = response.data; 
      if (balances && balances.length > 0) {
        const accountValue = parseFloat(balances[0].amount || 0);
        setBalance(accountValue);
      } else {
          setBalance(0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };
  
  const handlePositions = async (address) => {
    try {
      console.log("Fetching portfolio...");
      const response = await axios.get(`${host}/wallets/${address}/portfolio`, {
        headers: { "ngrok-skip-browser-warning": "true" }
        });
      console.log(response.data);
      const current_positions = response.data && response.data.length > 0 
      ? response.data.map(item => ({
          portfolio_id: item.portfolio_id,
          address: item.address,
          symbol: item.symbol,
          quantity: parseFloat(item.quantity),
          average_price: parseFloat(item.average_price),
          sector: item.sector
      })) 
      : [];
  
      setPosition(current_positions);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };
  
  const updateUserInfo = (address) => {
    try {
      handleBalance(address);
      handlePositions(address);
    } catch (error) {
      console.error("Error updating user info:", error);
    }
  };

  const handlePrice = async (symbol) => {
    try {
      console.log(`Fetching ${symbol}`);
      const response = await axios.get(`${host}/price/${symbol}`, {
        headers: { "ngrok-skip-browser-warning": "true" }
        });

      const current_price = parseFloat(response.data.price);
      setPrice(current_price);
      if (isNaN(current_price)) {
        alert("Failed to fetch the current price. Please try again.");
      }
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  const symbolChange = (e) => {
    setSymbol(e);
    console.log(sector);
    if(sector === "crypto"){
      setTradingSymbol(e+"USDC");
    }else if(sector === "tsx"){
      setTradingSymbol("TSX:"+e);
    }else{
      setTradingSymbol(e);
    }
    handlePrice(e+"-"+sector);
  };


  const handleSectorChange = (e) => {
    const selectedSector = e.target.value;
    setSector(selectedSector);
    handleSymbols(selectedSector); 
    updateUserInfo(info.walletAddress)
  };

  const handleOpenOrder = async (action) => {
    if (!sector || !symbol) {
      alert('Please fill in all fields before proceeding.');
      return;
    }
  
    try {
      let is_buy = action === "Buy";
  
      const data = {
        wallet: info.walletAddress,
        is_buy,
        symbol,
        size,
        sector,
        leverage
      };

      console.log(data);
    
      const res = await axios.post(`${host}/open`, data, {
        headers: { "ngrok-skip-browser-warning": "true" }
        });
    
      const result = res.data.status;
    
      if (result === "Success") {
        alert(`${action} order placed successfully at $${price.toFixed(2)}!`);
      } else {
        alert("An error occurred while placing the order.");
      }
  
      updateUserInfo(info.walletAddress);
      return res.data;
    } catch (e) {
      console.error("Error during trade:", e);
      alert("An error occurred while processing the trade.");
    }
  };

  const handleCloseOrder = async (position) => {
    try {
      console.log(position);
      alert(`Closing position for ${position.symbol}`);
  
      const res = await axios.post(`${host}/close`, {
        portfolio_id: position.portfolio_id,
        wallet: position.address,
        symbol: position.symbol,
        size: position.quantity,
        sector: position.sector
      }, {
        headers: { "ngrok-skip-browser-warning": "true" }
        });
  
      if (res.data.status === "Success") {
        handleBalance(sector);
        alert("Order closed successfully!");
      } else {
        alert("Order closure failed. Please try again.");
      }
      await handlePositions(info.walletAddress);
    } catch (error) {
      console.error("Error closing position:", error);
      alert("An error occurred while closing the order.");
    }
  };

  const refreshData = async () => {
    handlePrice(symbol+"-"+sector);
    updateUserInfo(info.walletAddress);
  };

  useEffect(() => {
      if (info.walletAddress) {
          refreshData();
      }
  }, [info.walletAddress]);

  if(info.walletAddress != null){
      if(info.Whitelisted !== false){
        return (
          <Box sx={{ fontFamily: "Arial, sans-serif", backgroundColor: "#D1C4E9", padding: "10px"}}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Stack spacing={2} sx={{ height: "100%" }}>
                  <TradingViewWidget symbol={tradingSymbol} />
                  <CloseOrder positions={position} handleCloseOrder={handleCloseOrder} />
                </Stack>
              </Grid>
              <Grid item xs={4}>
                <OpenOrder
                  sector={sector}
                  handleSectorChange={handleSectorChange}
                  symbol={symbol}
                  handleSymbol={symbolChange}
                  symbolList={symbolList}
                  symbolLeverages={symbolLeverages}
                  leverage={leverage}
                  setLeverage={setLeverage}
                  size={size}
                  setSize={setSize}
                  available={balance}
                  handleTrade={handleOpenOrder}
                  price={price}
                  refreshData={refreshData}
                />
              </Grid>
            </Grid>
          </Box>
        );
      }else{
          return <Whitelisted/>
      }
  }else{
      return <Connected/>
  }
};

export default TradePage;
