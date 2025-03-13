import { createTheme } from '@mui/material/styles';

// Create theme
export const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: '"Rubik", "Heebo", "Arial", sans-serif',
  },
  palette: {
    primary: {
      main: '#3a4750',
      light: '#5c6b76',
      dark: '#1a252d',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d72323',
      light: '#ff5c4d',
      dark: '#9e0000',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
}); 