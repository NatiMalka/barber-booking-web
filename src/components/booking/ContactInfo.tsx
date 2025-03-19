'use client';

import { 
  Box, 
  Typography, 
  TextField,
  Grid,
  InputAdornment
} from '@mui/material';
import { Person, Phone, Email, Note } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';

// Define the contact info data interface
interface ContactInfoData {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface ContactInfoProps {
  bookingData: {
    name?: string;
    phone?: string;
    email?: string;
    notes?: string;
    notificationMethod?: string;
  };
  onDataChange: (data: Partial<ContactInfoData>) => void;
}

export default function ContactInfo({ bookingData, onDataChange }: ContactInfoProps) {
  const { control, handleSubmit, formState: { errors } } = useForm<ContactInfoData>({
    defaultValues: {
      name: bookingData.name || '',
      phone: bookingData.phone || '',
      email: bookingData.email || '',
      notes: bookingData.notes || ''
    }
  });

  const onSubmit = (data: ContactInfoData) => {
    onDataChange(data);
  };

  // Validate form on change
  const handleChange = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        פרטי התקשרות
      </Typography>
      
      <form onChange={handleChange}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'שדה חובה' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="שם מלא"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message?.toString()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Controller
              name="phone"
              control={control}
              rules={{ 
                required: 'שדה חובה',
                pattern: {
                  value: /^0\d{8,9}$/,
                  message: 'מספר טלפון לא תקין'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="טלפון"
                  fullWidth
                  type="tel"
                  inputMode="numeric"
                  error={!!errors.phone}
                  helperText={errors.phone?.message?.toString()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          
          {bookingData.notificationMethod === 'email' && (
            <Grid item xs={12}>
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
                    helperText={errors.email?.message?.toString()}
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
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="הערות"
                  fullWidth
                  multiline
                  rows={4}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Note />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
      </form>
    </Box>
  );
} 