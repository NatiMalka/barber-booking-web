'use client';

import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import { CalendarMonth } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const theme = useTheme();
  const router = useRouter();

  const handleBookingClick = () => {
    router.push('/client/booking');
  };

  return (
    <Box
      sx={{
        py: 8,
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        textAlign: 'center',
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 3 }}
        >
          מספרת בר ארזי
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ mb: 4 }}
        >
          הזמנת תורים מהירה וקלה
        </Typography>
        <Button
          component={Link}
          href="/client/booking"
          variant="contained"
          size="large"
          color="secondary"
          startIcon={<CalendarMonth />}
          sx={{
            py: 1.5,
            px: 4,
            fontSize: '1.1rem',
            borderRadius: 2,
          }}
        >
          הזמן תור עכשיו
        </Button>
      </Container>
    </Box>
  );
} 