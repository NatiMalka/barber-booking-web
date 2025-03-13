'use client';

import { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Link as MuiLink,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Person } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { loginUser } from '@/firebase/services/authService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openBarberDialog, setOpenBarberDialog] = useState(false);
  const [barberPassword, setBarberPassword] = useState('');
  const [barberError, setBarberError] = useState<string | null>(null);
  const router = useRouter();
  
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setLoading(true);
    
    try {
      await loginUser(data.email, data.password);
      router.push('/');
    } catch (error: Error | unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'שגיאה בהתחברות. אנא נסה שנית.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleBarberLogin = () => {
    setOpenBarberDialog(true);
  };

  const handleBarberDialogClose = () => {
    setOpenBarberDialog(false);
    setBarberPassword('');
    setBarberError(null);
  };

  const handleBarberPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarberPassword(e.target.value);
  };

  const handleBarberSubmit = () => {
    if (barberPassword === 'admin123') {
      try {
        // Set admin session in localStorage
        localStorage.setItem('isBarberAdmin', 'true');
        console.log('Barber admin set in localStorage:', localStorage.getItem('isBarberAdmin'));
        
        // Close dialog first
        handleBarberDialogClose();
        
        // Short delay to ensure localStorage is set before redirect
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 100);
      } catch (error) {
        console.error('Error setting barber admin in localStorage:', error);
        setBarberError('אירעה שגיאה בהתחברות. אנא נסה שנית.');
      }
    } else {
      setBarberError('סיסמה שגויה. אנא נסה שנית.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center" color="primary" fontWeight="bold">
          התחברות
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            size="large"
            startIcon={<Person />}
            onClick={handleBarberLogin}
            sx={{ py: 1.5, fontSize: '1.1rem' }}
          >
            כניסה לספר
          </Button>
        </Box>
        
        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            או התחבר כלקוח
          </Typography>
        </Divider>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ mb: 3 }}>
            <Controller
              name="email"
              control={control}
              rules={{ 
                required: 'שדה חובה',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'כתובת אימייל לא תקינה'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="אימייל"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Controller
              name="password"
              control={control}
              rules={{ required: 'שדה חובה' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="סיסמה"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={toggleShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
            >
              {loading ? 'מתחבר...' : 'התחבר'}
            </Button>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <MuiLink component={Link} href="/auth/forgot-password" variant="body2">
              שכחת סיסמה?
            </MuiLink>
          </Box>
        </form>
      </Paper>

      {/* Barber Login Dialog */}
      <Dialog open={openBarberDialog} onClose={handleBarberDialogClose}>
        <DialogTitle>
          <Typography variant="h6" align="center">
            כניסת ספר
          </Typography>
        </DialogTitle>
        <DialogContent>
          {barberError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {barberError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="סיסמה"
            type="password"
            fullWidth
            value={barberPassword}
            onChange={handleBarberPasswordChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBarberDialogClose}>ביטול</Button>
          <Button onClick={handleBarberSubmit} variant="contained" color="primary">
            כניסה
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 