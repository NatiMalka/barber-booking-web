import { Box, Button, Container, Typography } from '@mui/material';
import { Home } from '@mui/icons-material';
import Link from 'next/link';

export default function Custom404() {
  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        הדף לא נמצא
      </Typography>
      <Typography variant="body1" paragraph>
        מצטערים, הדף שחיפשת אינו קיים.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button 
          component={Link} 
          href="/" 
          variant="contained" 
          color="primary"
          startIcon={<Home />}
        >
          חזרה לדף הבית
        </Button>
      </Box>
    </Container>
  );
} 