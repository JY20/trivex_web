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
    const host = "localhost:8080";

    const hash_provider = new Provider({ network: "sepolia" });
    const classHash = "0x005ee2404ac20c626a450d2fa39c3ea29715593b8fae8cab8ffb5a8d6aae2577"; 
    const contractAddress = "0x0710cf1f9166dc14d9a58633874b95e584c0eb11efc87b08be6992c27c42d664"; 
    const usdcTokenAddress = '0x02F37c3e00e75Ee4135b32BB60C37E0599aF264076376a618F138D2F9929Ac74';

    const [isDepositPopupOpen, setDepositPopupOpen] = useState(false);
    const [isWithdrawPopupOpen, setWithdrawPopupOpen] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);

    const getABI = async (classHash) => {
        const contractClass = await hash_provider.getClassByHash(classHash);
        return contractClass.abi;
    };
      

    const fetchBalance = async (address) => {
        try {
            const response = await axios.get(`http://${host}/wallets/${address}/balances`);
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
            const response = await axios.get(`http://${host}/wallets/${address}/portfolio`);
            const portfolioData = response.data && response.data.length > 0 
                ? response.data.map(item => ({
                    address: item.address,
                    symbol: item.symbol,
                    quantity: parseFloat(item.quantity),
                    average_price: parseFloat(item.average_price),
                })) 
                : [];
            setPortfolio(portfolioData);
        } catch (error) {
            console.error('Error fetching portfolio:', error);
        }
    };
    
    const fetchTransactions = async (address) => {
        try {
            const response = await axios.get(`http://${host}/wallets/${address}/transactions`);
            const transactionData = response.data && response.data.length > 0 
                ? response.data.map(item => ({
                    transaction_id: parseInt(item.transaction_id),
                    type: item.type,
                    symbol: item.symbol,
                    amount: parseFloat(item.amount),
                    price: parseFloat(item.price),
                    timestamp: item.timestamp,
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
            console.log(balance);
            return Number(balance);
        } catch (error) {
            console.error("Error fetching balance:", error);
            throw error;
        }
    };

    const refreshData =  async () => {
        fetchBalance(info.walletAddress);
        fetchPortfolio(info.walletAddress);
        fetchTransactions(info.walletAddress);
        const value = await getBalance();
        setWalletBalance(value);
    };

    const handleDepositPopUp = () => {
        setDepositPopupOpen(true);
    };

    const handleWithdrawPopUp = () => {
        setWithdrawPopupOpen(true);
    };


    const updateBalance = async (walletAddress, amount, action) => {
        try {
            const response = await axios.post(`http://${host}/action`, {
                wallet_address: walletAddress,
                amount: amount,
                balance: balance,
                action: action,
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

            const approveResult = await provider.execute([{
                contractAddress: usdcTokenAddress,
                entrypoint: "approve",
                calldata: CallData.compile({
                spender: contractAddress,
                amount: cairo.uint256(weiAmount),
                }),
            }]);
            console.log("Approve Result:", approveResult);
        
            const deposit = contract.populate("deposit", [info.walletAddress, BigInt(weiAmount), usdcTokenAddress]);
            const depositResult = await provider.execute([{
                contractAddress: contractAddress,
                entrypoint: "deposit",
                calldata: deposit.calldata,
            }]);
        
            console.log("Deposit Result:", depositResult);

            await updateBalance(info.walletAddress, amount, "deposit");

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
        
            const withdrawal = contract.populate("withdraw", [info.walletAddress, BigInt(weiAmount), usdcTokenAddress]);
        
            const withdrawalResult = await provider.execute([{
                contractAddress: contractAddress,
                entrypoint: "withdraw",
                calldata: withdrawal.calldata,
            }]);
        
            console.log("Withdrawal Result:", withdrawalResult);
        
            await updateBalance(info.walletAddress, amount, "withdraw");

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
        refreshData(); 
    }, []);

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
                        <TableContainer component={Paper} sx={{marginBottom: '20px'}}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Symbol</strong></TableCell>
                                        <TableCell align="right"><strong>Quantity</strong></TableCell>
                                        <TableCell align="right"><strong>Average Price</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {portfolio.map((asset, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{asset.symbol}</TableCell>
                                            <TableCell align="right">{asset.quantity}</TableCell>
                                            <TableCell align="right">{asset.average_price}</TableCell>
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
                                        <TableCell align="right"><strong>Type</strong></TableCell>
                                        <TableCell align="right"><strong>Symbol</strong></TableCell>
                                        <TableCell align="right"><strong>Amount</strong></TableCell>
                                        <TableCell align="right"><strong>Price</strong></TableCell>
                                        <TableCell align="right"><strong>Timestamp</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transaction.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.transaction_id}</TableCell>
                                            <TableCell align="right">{item.type}</TableCell>
                                            <TableCell align="right">{item.symbol}</TableCell>
                                            <TableCell align="right">${item.amount}</TableCell>
                                            <TableCell align="right">${item.price}</TableCell>
                                            <TableCell align="right">{new Date(item.timestamp).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <DepositPopup
                            open={isDepositPopupOpen}
                            onClose={() => setDepositPopupOpen(false)}
                            balance={walletBalance}
                            handleDeposit={handleDeposit}
                        />
                        <WithdrawPopup
                            open={isWithdrawPopupOpen}
                            onClose={() => setWithdrawPopupOpen(false)}
                            balance={balance}
                            handleDeposit={handleWithdrawal}
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
