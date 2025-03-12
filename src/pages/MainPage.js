import React, { useState } from 'react';
import { Grid, Box, Typography, Button, TextField, Paper } from '@mui/material';
import Header from '../components/Header';
import axios from 'axios';

const MainPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        wallet: '',
        message: '',
    });
    const host = "https://2660-2001-1970-51a3-8f00-00-c11.ngrok-free.app";

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${host}/add_request`, formData, {
                headers: { "ngrok-skip-browser-warning": "true" }
                });

            const result = response.data.status;
    
            if (result === "Success") {
                alert("Whitelist request has been submitted successfully");
            }
        } catch (error) {
            console.error(error);
            alert(`Error had occurred in submitting whitelist request: ${error}`);
        }
    };

    return (
        <Box sx={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#D1C4E9', minHeight: '100vh', width: '100%'}}>
            <Header />
            <section style={{
                padding: '50px 30px',
                width: '66%',
                display: 'flex',            // Flexbox to center content
                justifyContent: 'center',  // Center horizontally
                alignItems: 'center',      // Center vertically
                flexDirection: 'column',   // Align content vertically (if needed)
                margin: '0 auto',          // Center the section itself
            }}>
                <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: '30px', color: 'black' }}>
                    Features
                </Typography>
                <Grid container spacing={4} justifyContent="center" alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{
                            padding: '30px',
                            textAlign: 'center',
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.3s',
                            '&:hover': { transform: 'translateY(-10px)' }
                        }}>
                            <i className="fas fa-chart-line" style={{ fontSize: '3em', color: '#2980B9', marginBottom: '20px' }}></i>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>Algo Report/Calculator</Typography>
                            <Typography sx={{ color: '#555' }}>
                                Generate real-time reports for crypto and stocks with advanced algorithms for in-depth analysis.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{
                            padding: '30px',
                            textAlign: 'center',
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.3s',
                            '&:hover': { transform: 'translateY(-10px)' }
                        }}>
                            <i className="fas fa-exchange-alt" style={{ fontSize: '3em', color: '#27AE60', marginBottom: '20px' }}></i>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '10px' }}> 
                                Low-Fee Trading</Typography>
                            <Typography sx={{ color: '#555' }}>
                                Access an affordable and efficient trading experience with minimal fees and maximum benefits.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{
                            padding: '30px',
                            textAlign: 'center',
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.3s',
                            '&:hover': { transform: 'translateY(-10px)' }
                        }}>
                            <i className="fas fa-cogs" style={{ fontSize: '3em', color: '#F39C12', marginBottom: '20px' }}></i>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>All-in-One Platform</Typography>
                            <Typography sx={{ color: '#555' }}>
                                A complete solution for all your crypto and stock trading needs, with powerful tools and seamless integration.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </section>
            
            <section style={{ padding: '50px 30px' }}>
                <Typography variant="h4" sx={{ color: 'black', textAlign: 'center', marginBottom: '30px' }}>
                    Request Access
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Box sx={{
                        maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                    }}>
                        <TextField
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            sx={{ marginBottom: '20px' }}
                        />
                        <TextField
                            label="Wallet"
                            name="wallet"
                            value={formData.wallet}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            sx={{ marginBottom: '20px' }}
                        />
                        <TextField
                            label="Message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            multiline
                            rows={4}
                            sx={{ marginBottom: '20px' }}
                        />
                        <Button type="submit" fullWidth variant="contained" sx={{ backgroundColor: '#7E57C2' }}>
                            Submit
                        </Button>
                    </Box>
                </form>
            </section>
        </Box>
    );
};

export default MainPage;
