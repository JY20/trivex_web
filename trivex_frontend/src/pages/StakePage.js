import React, { useState, useEffect, useContext } from 'react';
import { Grid, Box, Typography, Button, Paper } from '@mui/material';
import { Connected } from '../components/Alert';
import { AppContext } from '../components/AppProvider';
import StakePopup from '../components/Stake'; // Used as StakePopup
import UnstakePopup from '../components/Unstake'; // Used as UnstakePopup
import { AppContract } from '../components/AppContract';

const StakePage = () => {
    const info = useContext(AppContext);

    const stakeData = {
        title: 'Trading Pool',
    };

    // State for pop-ups and balance
    const [isStakePopupOpen, setStakePopupOpen] = useState(false);
    const [isUnstakePopupOpen, setUnstakePopupOpen] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [poolBalance, setPoolBalance] = useState(0);
    const [totalPoolBalance, setTotalPoolBalance] = useState(0);
    const [apy, setApy] = useState(0);

    const contract =  new AppContract();

    const getBalance = async () => {
        try {
            return await contract.getWalletBalance(info.walletAddress);
        } catch (error) {
            console.error('Error fetching balance:', error);
            throw error;
        }
    };
    
    const fetchPoolBalance = async () => {
        try {
            const result = await contract.getStakedBalance(info.walletAddress);
            setPoolBalance(result);
        } catch (err) {
            console.error('Error fetching staked balance:', err);
            setPoolBalance(0);
        }
    };

    const fetchTotalPool = async () => {
        try {
            const result = await contract.getTotalStaked();
            setTotalPoolBalance(result);
        } catch (err) {
            console.error('Error fetching staked balance:', err);
            setTotalPoolBalance(0);
        }
    };

    const fetchApy = async () => {
        try {
            const result = await contract.getApy();
            setApy(result);
        } catch (err) {
            console.error('Error fetching staked balance:', err);
            setApy(0);
        }
    };

    const handleStakePopUp = async () => {
        try {
            const value = await getBalance();
            if (value) {
                setWalletBalance(value);
                setStakePopupOpen(true);
            }
        } catch (error) {
            alert('Failed to fetch wallet balance.');
        }
    };

    const handleUnstakePopUp = async () => {
        if (info.walletAddress) {
            await fetchPoolBalance(info.walletAddress);
        }
        setUnstakePopupOpen(true);
    };

    const handleStake = async (amount) => {
        try {
            const result = await contract.stake(info.wallet.account, amount);
            console.log("Stake Result:", result);
            alert("Stake completed successfully!");
        } catch (error) {
            console.error("An error occurred during the stake process:", error);
            if (error.message.includes("User abort")) {
                alert("Transaction aborted by user.");
            } else {
                alert("An unexpected error occurred. Please try again.");
            }
            throw error;
        }
    };

    const handleUnstake = async (amount) => {
        try {
            const result = await contract.unstake(info.wallet.account, amount);
            console.log('Unstake Result:', result);
            alert('Unstake completed successfully!');
            setUnstakePopupOpen(false);
            
            await fetchPoolBalance();
        } catch (err) {
            console.error('An error occurred during unstaking:', err);
            alert(err.message.includes('User abort') ? 'Transaction aborted.' : 'Unexpected error.');
        }
    };

    const refreshData = async () => {
        fetchPoolBalance();
        fetchApy();
        fetchTotalPool();
    };

    useEffect(() => {
        if (info.walletAddress && !info.routeTrigger) {
            refreshData();
        }
    }, [info, refreshData]);

    if (info.walletAddress != null) {
        return (
            <Box
                sx={{
                    fontFamily: 'Arial, sans-serif',
                    backgroundColor: '#D1C4E9',
                    minHeight: '100vh',
                    width: '100%',
                }}
            >
                <Grid container justifyContent="center" sx={{ mt: 4 }}>
                    <Grid item xs={12} sm={10} md={8}>
                        <Paper elevation={3} sx={{ p: 3, backgroundColor: 'white', borderRadius: 2 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 2,
                                    border: '1px solid #EDE7F6',
                                    borderRadius: 1,
                                }}
                            >
                                <Box>
                                    <Typography variant="h6" sx={{ color: '#311B92' }}>
                                        {stakeData.title}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#7E57C2' }}>
                                        APY: <span style={{ color: '#7E57C2', fontWeight: 'bold' }}>
                                            {apy}%
                                        </span>
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#7E57C2', mt: 1 }}>
                                        Total Staked Balance: <span style={{ fontWeight: 'bold' }}>
                                            {totalPoolBalance} USD
                                        </span>
                                    </Typography>
                                </Box>
                                <Box>
                                    <Box sx={{ display: 'flex', gap: 2 ,  marginBottom: '20px'}}>
                                        <Button
                                            variant="contained"
                                            onClick={handleStakePopUp}
                                            sx={{
                                                backgroundColor: '#7E57C2',
                                            }}
                                        >
                                            Stake
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            sx={{ flex: 1 }}
                                            onClick={handleUnstakePopUp}
                                        >
                                            Unstake
                                        </Button>
                                    </Box>
                                    <Typography variant="body1" sx={{ color: '#7E57C2', mt: 1 }}>
                                        Staked Balance: <span style={{ fontWeight: 'bold' }}>
                                            {poolBalance} USD
                                        </span>
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
                <StakePopup
                    open={isStakePopupOpen}
                    onClose={() => setStakePopupOpen(false)}
                    balance={walletBalance}
                    handleDeposit={handleStake}
                />
                <UnstakePopup
                    open={isUnstakePopupOpen}
                    onClose={() => setUnstakePopupOpen(false)}
                    balance={poolBalance}
                    handleWithdraw={handleUnstake}
                />
            </Box>
        );
    } else {
        return <Connected />;
    }
};

export default StakePage;