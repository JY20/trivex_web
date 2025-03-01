import React, { useState, useContext} from 'react';
import { Box, Typography, TextField, MenuItem, Button, Switch, List, ListItem, ListItemText} from '@mui/material';
import axios from 'axios';
import {AppContext} from '../components/AppProvider';
import { Connected, Whitelisted } from '../components/Alert';
import { Contract, Provider, cairo, CallData} from "starknet";

const AlgoPage = () => {
  const [strategy, setStrategy] = useState('');
  const [sector, setSector] = useState('');
  const [symbol, setSymbol] = useState('');

  const [openSd, setopenSd] = useState(1);
  const [closeSd, setcloseSd] = useState(0.8);
  const [isBuy, setIsBuy] = useState(true);
  const [results, setResults] = useState(null);

  const [list, setList] = useState('');
  const [email, setEmail] = useState('');

  const [symbol1, setSymbol1] = useState('');
  const [symbol2, setSymbol2] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const host = "https://1e1e-2001-1970-51a3-8f00-00-8b27.ngrok-free.app";

  const hash_provider = new Provider({ network: "sepolia" });
  const classHash = "0x008e2b7d5289f1ca14683bc643f42687dd1ef949e8a35be4c429aa825a097604"; 
  const contractAddress = "0x005262cd7aee4715e4a00c41384a5f5ad151ff16da7523f41b93836bed922ced"; 
  const strkTokenAddress = '0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';

  const strategies = [
    { label: 'AverageRebalance', value: 'averageRebalance' },
    { label: 'Momentum', value: 'momentum' },
    { label: 'StandardDeviation', value: 'standardDeviation' },
    { label: 'CoVariance', value: 'coVariance' },
  ];
  const info = useContext(AppContext);


  const getABI = async (classHash) => {
    const contractClass = await hash_provider.getClassByHash(classHash);
    return contractClass.abi;
  };  

  
  /* global BigInt */

  const handleRun = async (amount) => {
      try {
          const provider = info.wallet.account;

          const contractClass = await hash_provider.getClassByHash(classHash);
          const abi = contractClass.abi;
          const contract = new Contract(abi, contractAddress, provider);

          const weiAmount = amount * 1e18;
      
          const run_strategy = contract.populate("run_strategy", [BigInt(weiAmount), strkTokenAddress]);

          const result = await provider.execute([
              {
                  contractAddress: strkTokenAddress,
                  entrypoint: "approve",
                  calldata: CallData.compile({
                  spender: contractAddress,
                  amount: cairo.uint256(weiAmount),
                  }),
              },
              {
                  contractAddress: contractAddress,
                  entrypoint: "run_strategy",
                  calldata: run_strategy.calldata,
              }
              ]);
      
          console.log("Run Strategy Result:", result);

          alert("Run strategy completed successfully!");
      } catch (error) {
          console.error("An error occurred during the run strategy process:", error);

          if (error.message.includes("User abort")) {
              alert("Transaction aborted by user.");
          } else {
              alert("An unexpected error occurred. Please try again.");
          }
      }
  };

  const handleStartAlgo = async () => {
    if (!strategy) {
      alert('Please select both a strategy.');
      return;
    }
    
    handleRun(1);

    switch (strategy) {
      case 'averageRebalance':
        averageRebalance(list, email);
        console.log(`Running Average Rebalance strategy in sector: ${sector}`);
        break;
  
      case 'momentum':
        momentum(list, email);
        console.log(`Running Momentum strategy in sector: ${sector}`);
        break;
  
      case 'standardDeviation':
        standardDeviation(symbol, openSd, closeSd, isBuy);
        console.log(`Running Standard Deviation strategy in sector: ${sector}`);
        break;
  
      case 'coVariance':
        coVariance(symbol1, symbol2, startDate, endDate);
        console.log(`Running Co-Variance strategy in sector: ${sector}`);
        break;
  
      default:
        console.error('Unknown strategy selected.');
    }
  
    alert(`Algorithm started with strategy: ${strategy} in sector: ${sector}`);
  };

  const standardDeviation = async (symbol, openSd, closeSd, isBuy) => {

    try {
      const res = await axios.post(`${host}/standardDeviation`, {
        symbol,
        openSd,
        closeSd,
        is_buy: isBuy,
      }, {
        headers: { "ngrok-skip-browser-warning": "true" }
        });
      
      const data = res.data;
      setResults(data);    
      return data;
    } catch (e) {
      console.error('Error running standard deviation:', e);
    }
  };

  const coVariance= async (symbol1, symbol2, startDate, endDate) => {

    try {
      const res = await axios.post(`${host}/coVariance`, {
        symbol1,
        symbol2,
        start_date: new Date(startDate),
        end_date: new Date(endDate),
      }, {
        headers: { "ngrok-skip-browser-warning": "true" }
        });
      
      const data = res.data;
      setResults(data);    
      return data;
    } catch (e) {
      console.error('Error running standard deviation:', e);
    }
  };

  const averageRebalance = async (list, email) => {

    try {
      const res = await axios.post(`${host}/averageRebalance`, {
        list, 
        email
      }, {
        headers: { "ngrok-skip-browser-warning": "true" }
        });
      
      const data = res.data; 
      return data;
    } catch (e) {
      console.error('Error running average rebalance:', e);
    }
  };

  const momentum = async (list, email) => {

    try {
      const res = await axios.post(`${host}/momentum`, {
        list, 
        email
      }, {
        headers: { "ngrok-skip-browser-warning": "true" }
        });
      
      const data = res.data; 
      return data;
    } catch (e) {
      console.error('Error running momentum:', e);
    }
  };


  if(info.walletAddress != null){
    if(info.Whitelisted !== false){
      return (
        <Box
          sx={{
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#D1C4E9',
            minHeight: '100vh',
            padding: '20px',
          }}
        >
          <Box
            sx={{
              maxWidth: '600px',
              margin: '0 auto',
              background: '#fff',
              padding: '30px',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              maxWidth: '50%'
            }}
          >
            <TextField
              select
              label="Strategy"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              fullWidth
              required
              sx={{ marginBottom: '20px' }}
            >
              {strategies.map((strat) => (
                <MenuItem key={strat.value} value={strat.value}>
                  {strat.label}
                </MenuItem>
              ))}
            </TextField>
    
            {(strategy === 'averageRebalance' || strategy === 'momentum')&& (
              <>
              <TextField
                select
                label="List"
                value={list}
                onChange={(e) => setList(e.target.value)}
                fullWidth
                required
                sx={{ marginBottom: '20px' }}
              >
                <MenuItem value="crypto">Crypto</MenuItem>
                <MenuItem value="tsx">TSX</MenuItem>
                <MenuItem value="sp500">SP500</MenuItem>
              </TextField>
    
              <TextField
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                  sx={{ marginBottom: '20px' }}
                  placeholder="Enter Email"
              />
              </>
            )}
    
            {strategy === 'standardDeviation' && (
              <>
              <TextField
                select
                label="Sector"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                fullWidth
                required
                sx={{ marginBottom: '20px' }}
              >
                <MenuItem value="crypto">Crypto</MenuItem>
                <MenuItem value="tsx">TSX Stocks</MenuItem>
                <MenuItem value="sp500">SP500 Stocks</MenuItem>
              </TextField>
    
              <TextField
                  label="Symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  fullWidth
                  required
                  sx={{ marginBottom: '20px' }}
                  disabled={!sector || sector !== 'crypto'}
                  placeholder="Enter symbol"
              />
              </>
            )}
            {strategy === 'standardDeviation' && sector === 'crypto' && (
              <>
                <Typography variant="body1" sx={{marginTop: '10px', marginBottom: '10px', color: 'black' }}>
                  Parameters:
                </Typography>
                <TextField
                    label="Open Order SD"
                    value={openSd}
                    onChange={(e) => setopenSd(e.target.value)}
                    fullWidth
                    required
                    sx={{ marginBottom: '20px' }}
                />
                <TextField
                    label="Close Order SD"
                    value={closeSd}
                    onChange={(e) => setcloseSd(e.target.value)}
                    fullWidth
                    required
                    sx={{ marginBottom: '20px' }}
                />
                <Box sx={{ marginBottom: '20px' }}>
                  Is Buy
                  <Switch
                    checked={isBuy}
                    onChange={(e) => setIsBuy(!isBuy)}
                    color="primary"
                  />
                </Box>         
              </>
            )}
            
            {strategy === 'coVariance' && (
              <>
              <TextField
                select
                label="Sector"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                fullWidth
                required
                sx={{ marginBottom: '20px' }}
              >
                <MenuItem value="crypto">Crypto</MenuItem>
                <MenuItem value="tsx">TSX Stocks</MenuItem>
                <MenuItem value="sp500">SP500 Stocks</MenuItem>
              </TextField>
    
              <TextField
                  label="Symbol1"
                  value={symbol1}
                  onChange={(e) => setSymbol1(e.target.value.toUpperCase())}
                  fullWidth
                  required
                  sx={{ marginBottom: '20px' }}
                  disabled={!sector || sector !== 'crypto'}
                  placeholder="Enter symbol"
              />
              <TextField
                  label="Symbol2"
                  value={symbol2}
                  onChange={(e) => setSymbol2(e.target.value.toUpperCase())}
                  fullWidth
                  required
                  sx={{ marginBottom: '20px' }}
                  disabled={!sector || sector !== 'crypto'}
                  placeholder="Enter symbol"
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '20px' }}>
                <TextField
                  type="date"
                  label="Start Date"
                  InputLabelProps={{ shrink: true }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  type="date"
                  label="End Date"
                  InputLabelProps={{ shrink: true }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  required
                />
              </Box>
              </>
            )}
    
            <Button
                variant="contained"
                sx={{ backgroundColor: '#7E57C2' }}
                fullWidth
                onClick={handleStartAlgo}
              >
                Run
            </Button>
          </Box>
    
          {results && (
              <Box sx={{ maxWidth: '600px', marginTop: '30px',  padding: '20px', backgroundColor: '#f1f1f1', borderRadius: '8px', margin: '20px auto'}}>
                <Typography variant="h5" sx={{ marginBottom: '10px' }}>
                  Results
                </Typography>
                {typeof results === "object" ? (
                <List>
                  {Object.entries(results).map(([key, value], index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={key.toString()}
                        secondary={value.toString()}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>{results}</Typography>
              )}
              </Box>
          )}  
        </Box>
      );
    }else{
        return <Whitelisted/>
    }
  }else{
      return <Connected/>
  }
};

export default AlgoPage;