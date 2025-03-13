'use client';

import { Box, Container, Typography, Link, Grid, useTheme } from '@mui/material';
import { Phone, AccessTime } from '@mui/icons-material';

export default function Footer() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} justifyContent="space-between">
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              מספרת בר ארזי
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Phone fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                <Link href="tel:+972501234567" color="inherit" underline="hover">
                  050-123-4567
                </Link>
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              שעות פעילות
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTime fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">ראשון - חמישי: 9:00 - 20:00</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTime fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">שישי: 9:00 - 14:00</Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Typography variant="body2" align="center" sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
          © {currentYear} מספרת בר ארזי. כל הזכויות שמורות.
        </Typography>
      </Container>
    </Box>
  );
} 