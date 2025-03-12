import React, { useState, useEffect , useContext} from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import {AppContext} from '../components/AppProvider';
import { Connected, Whitelisted } from '../components/Alert';
import { Contract, Provider, cairo, CallData} from "starknet";
import DepositPopup from "../components/Deposit";
import WithdrawPopup from "../components/Withdraw";

const SettingsPage = () => {

    const info = useContext(AppContext);
    const [portfolio, setPortfolio] = useState([]); 
    const [transaction, setTransaction] = useState([]); 
    const [balance, setBalance] = useState(0);
    const host = "https://2660-2001-1970-51a3-8f00-00-c11.ngrok-free.app";
    const hash_provider = new Provider({ network: "sepolia" });
    const classHash = "0x008e2b7d5289f1ca14683bc643f42687dd1ef949e8a35be4c429aa825a097604"; 
    const contractAddress = "0x005262cd7aee4715e4a00c41384a5f5ad151ff16da7523f41b93836bed922ced"; 
    const usdcTokenAddress = '0x53b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080';

    const [isDepositPopupOpen, setDepositPopupOpen] = useState(false);
    const [isWithdrawPopupOpen, setWithdrawPopupOpen] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);

    const getABI = async (classHash) => {
        const contractClass = await hash_provider.getClassByHash(classHash);
        return contractClass.abi;
    };  

    const fetchBalance = async (address) => {
        try {
            const response = await axios.get(`${host}/wallets/${address}/balances`, {
                headers: { "ngrok-skip-browser-warning": "true" }
                })
            const current_balances = response.data; 
            if (current_balances && current_balances.length > 0) {
                const accountValue = parseFloat(current_balances[0].amount || 0);
                setBalance(accountValue);
            } else {
                setBalance(0);
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };
    
    const fetchPortfolio = async (address) => {
        try {
            const response = await axios.get(`${host}/wallets/${address}/portfolio`, {
                headers: { "ngrok-skip-browser-warning": "true" }
                })
            const portfolioData = response.data && response.data.length > 0 
            ? response.data.map(item => ({
                portfolio_id: item.portfolio_id,
                address: item.address,
                symbol: item.symbol,
                quantity: parseFloat(item.quantity),
                average_price: parseFloat(item.average_price),
                sector: item.sector
            })) 
            : [];
            setPortfolio(portfolioData);
        } catch (error) {
            console.error('Error fetching portfolio:', error);
        }
    };
    
    const fetchTransactions = async (address) => {
        try {
            const response = await axios.get(`${host}/wallets/${address}/transactions`, {
                headers: { "ngrok-skip-browser-warning": "true" }
                })
            const transactionData = response.data && response.data.length > 0 
                ? response.data.map(item => ({
                    transaction_id: parseInt(item.transaction_id),
                    action: item.action,
                    symbol: item.symbol,
                    quantity: parseFloat(item.quantity),
                    average_price: parseFloat(item.average_price),
                    last_updated: item.last_updated,
                })) 
                : [];
            setTransaction(transactionData);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };
    

    const getBalance = async () => {
        try {
            const abi = await getABI(classHash);
            const contract = new Contract(abi, contractAddress, hash_provider);
            const balance = await contract.call("get_balance", [usdcTokenAddress, info.walletAddress]);
            const convertedBalance = (Number(balance)/1000000).toFixed(2);
            return convertedBalance;
        } catch (error) {
            console.error("Error fetching balance:", error);
            throw error;
        }
    };

    const refreshData =  async () => {
        fetchBalance(info.walletAddress);
        fetchPortfolio(info.walletAddress);
        fetchTransactions(info.walletAddress);
    };

    const handleDepositPopUp = async () => {
        const value = await getBalance();
        
        if (value) {
            setWalletBalance(value);
            setDepositPopupOpen(true);
        }
    };

    const handleDepositClose = async () => {
        setDepositPopupOpen(false);
    };
    

    const handleWithdrawPopUp = () => {
        setWithdrawPopupOpen(true);
    };


    const updateBalance = async (hash) => {
        try {
            const response = await axios.post(`${host}/action`, {
                hash
            }, {
                headers: { "ngrok-skip-browser-warning": "true" }
                });
    
            console.log("Balance updated:", response.data);
        } catch (error) {
            console.error("Failed to update balance:", error.response?.data?.detail || error.message);
            alert("Failed to update balance.");
        }
    };

    /* global BigInt */

    const handleDeposit = async (amount) => {
        try {
            const provider = info.wallet.account;

            const contractClass = await hash_provider.getClassByHash(classHash);
            const abi = contractClass.abi;
            const contract = new Contract(abi, contractAddress, provider);

            const weiAmount = amount * 1000000;
        
            const deposit = contract.populate("deposit", [BigInt(weiAmount), usdcTokenAddress]);

            const result = await provider.execute([
                {
                    contractAddress: usdcTokenAddress,
                    entrypoint: "approve",
                    calldata: CallData.compile({
                    spender: contractAddress,
                    amount: cairo.uint256(weiAmount),
                    }),
                },
                {
                    contractAddress: contractAddress,
                    entrypoint: "deposit",
                    calldata: deposit.calldata,
                }
                ]);
        
            console.log("Deposit Result:", result);

            updateBalance(result["transaction_hash"]);

            alert("Deposit completed successfully!");
        } catch (error) {
            console.error("An error occurred during the deposit process:", error);

            if (error.message.includes("User abort")) {
                alert("Transaction aborted by user.");
            } else {
                alert("An unexpected error occurred. Please try again.");
            }
        }
    };

    const handleWithdrawal = async (amount) => {
        try {
            const provider = info.wallet.account;
        
            const contractClass = await hash_provider.getClassByHash(classHash);
            const abi = contractClass.abi;
            const contract = new Contract(abi, contractAddress, provider);
        
            const weiAmount = amount * 1000000;
        
            const withdrawal = contract.populate("withdraw", [BigInt(weiAmount), usdcTokenAddress]);
        
            const result = await provider.execute([{
                contractAddress: contractAddress,
                entrypoint: "withdraw",
                calldata: withdrawal.calldata,
            }]);
        
            console.log("Withdrawal Result:", result);
        
            updateBalance(result["transaction_hash"]);

            alert("Withdrawal completed successfully!");
        } catch (error) {
            console.error("An error occurred during the withdrawal process:", error);
        
            if (error.message.includes("User abort")) {
                alert("Transaction aborted by user.");
            } else {
                alert("An unexpected error occurred. Please try again.");
            }
        }
    };
      

    useEffect(() => {
        if (info.walletAddress) {
            refreshData();
        }
    }, [info.walletAddress]);

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
                            margin: '0 auto',
                            background: '#fff',
                            padding: '30px',
                            borderRadius: '8px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            maxWidth: '50%'
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <Typography variant="h6" fontWeight="bold">
                                Balance
                            </Typography>
                            <IconButton sx={{color: '#7E57C2'}} onClick={refreshData}>
                                <RefreshIcon />
                            </IconButton>
                        </Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ marginTop: '10px', marginBottom: '20px',  color: '#7E57C2'}}>
                            {balance.toFixed(2)} USD
                        </Typography>
        
                        <Typography variant="h6" fontWeight="bold" sx={{ marginBottom: '10px' }}>
                            Deposit and Withdrawal
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
                            <Button 
                                variant="contained" 
                                sx={{ flex: 1, backgroundColor: '#7E57C2'}}
                                onClick={handleDepositPopUp}
                                >
                                Deposit
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                fullWidth
                                sx={{ flex: 1}}
                                onClick={handleWithdrawPopUp}
                            >
                                Withdraw
                            </Button>
                        </Box>
        
                        <Typography variant="h6" fontWeight="bold" sx={{ marginBottom: '20px' }}>
                            Portfolio
                        </Typography>
                        <TableContainer component={Paper} sx={{marginBottom: '20px', maxHeight: 300, overflowY: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Portfolio ID</strong></TableCell>
                                        <TableCell><strong>Sector</strong></TableCell>
                                        <TableCell><strong>Symbol</strong></TableCell>
                                        <TableCell align="right"><strong>Quantity</strong></TableCell>
                                        <TableCell align="right"><strong>Average Price</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {portfolio.map((position, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{position.portfolio_id}</TableCell>
                                            <TableCell>{position.sector}</TableCell>
                                            <TableCell>{position.symbol}</TableCell>
                                            <TableCell align="right">{position.quantity}</TableCell>
                                            <TableCell align="right">{position.average_price}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
        
                        <Typography variant="h6" fontWeight="bold" sx={{ marginBottom: '20px' }}>
                            Transactions
                        </Typography>
                        <TableContainer component={Paper} sx={{ maxHeight: 300, overflowY: 'auto' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Transaction ID</strong></TableCell>
                                        <TableCell align="right"><strong>Action</strong></TableCell>
                                        <TableCell align="right"><strong>Symbol</strong></TableCell>
                                        <TableCell align="right"><strong>Quantity</strong></TableCell>
                                        <TableCell align="right"><strong>Average Price</strong></TableCell>
                                        <TableCell align="right"><strong>Timestamp</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transaction.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.transaction_id}</TableCell>
                                            <TableCell align="right">{item.action}</TableCell>
                                            <TableCell align="right">{item.symbol}</TableCell>
                                            <TableCell align="right">${item.quantity}</TableCell>
                                            <TableCell align="right">${item.average_price}</TableCell>
                                            <TableCell align="right">{new Date(item.last_updated).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <DepositPopup
                            open={isDepositPopupOpen}
                            onClose={() => handleDepositClose()}
                            balance={walletBalance}
                            handleDeposit={handleDeposit}
                        />
                        <WithdrawPopup
                            open={isWithdrawPopupOpen}
                            onClose={() => setWithdrawPopupOpen(false)}
                            balance={balance}
                            handleWithdraw={handleWithdrawal}
                        />
                    </Box>
                </Box>
            );
        }else{
            return <Whitelisted/>
        }
    }else{
        return <Connected/>
    }
};

export default SettingsPage;
