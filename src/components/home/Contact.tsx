'use client';

import { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  TextField, 
  Button, 
  Paper, 
  useTheme,
  Snackbar,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { Send, Phone, AccessTime, CalendarMonth } from '@mui/icons-material';
import Link from 'next/link';

export default function Contact() {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
    setSnackbar({
      open: true,
      message: 'ההודעה נשלחה בהצלחה! נחזור אליך בהקדם.',
      severity: 'success'
    });
    
    setFormData({
      name: '',
      phone: '',
      message: ''
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleBookingClick = () => {
    // Force a hard navigation to clear cache
    window.location.href = '/client/booking';
  };

  return (
    <Box
      component="section"
      sx={{
        py: 6,
        backgroundColor: theme.palette.mode === 'light' ? 'grey.100' : 'grey.900',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{ mb: 3 }}
            >
              צור קשר
            </Typography>
            
            <Paper 
              component="form" 
              onSubmit={handleSubmit}
              elevation={2} 
              sx={{ p: 3, borderRadius: 2 }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="שם מלא"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="טלפון"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="הודעה"
                    name="message"
                    multiline
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<Send />}
                    sx={{ py: 1.2 }}
                  >
                    שלח הודעה
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{ mb: 3 }}
            >
              מידע מהיר
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Phone color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          טלפון
                        </Typography>
                        <Typography variant="body1">
                          050-123-4567
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          שעות פעילות
                        </Typography>
                        <Typography variant="body2">ראשון - חמישי: 9:00 - 20:00</Typography>
                        <Typography variant="body2">שישי: 9:00 - 14:00</Typography>
                        <Typography variant="body2">שבת: סגור</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  onClick={handleBookingClick}
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                  startIcon={<CalendarMonth />}
                  sx={{ py: 1.5 }}
                >
                  הזמן תור עכשיו
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 