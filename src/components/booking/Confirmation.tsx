'use client';

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  AlertTitle,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress
} from '@mui/material';
import { 
  CalendarMonth, 
  AccessTime, 
  ContentCut, 
  Person, 
  Phone, 
  Email, 
  Note,
  Notifications,
  CheckCircle,
  Home,
  ChildCare,
  HourglassTop,
  Info,
  Error as ErrorIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createAppointment } from '@/firebase/services/appointmentService';

// Define services map for display
const servicesMap: Record<string, string> = {
  'haircut': 'תספורת גברים',
  'kids': 'תספורת ילדים',
  'beard': 'עיצוב זקן',
  'combo': 'תספורת + עיצוב זקן'
};

// Define notification methods map for display
const notificationMethodsMap: Record<string, string> = {
  'whatsapp': 'וואטסאפ',
  'sms': 'SMS',
  'email': 'אימייל'
};

interface ConfirmationProps {
  bookingData: any;
}

export default function Confirmation({ bookingData }: ConfirmationProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create a booking object with all necessary data
      const bookingDate = new Date(bookingData.date);
      
      // הוספת השעה לאובייקט התאריך
      if (bookingData.time) {
        const [hours, minutes] = bookingData.time.split(':').map(Number);
        bookingDate.setHours(hours, minutes, 0, 0);
      }
      
      // Prepare appointment data for Firebase
      const appointmentData = {
        date: bookingDate,
        time: bookingData.time,
        service: bookingData.service,
        people: bookingData.people,
        withChildren: bookingData.withChildren || false,
        childrenCount: bookingData.childrenCount || 0,
        notificationMethod: bookingData.notificationMethod,
        name: bookingData.name,
        phone: bookingData.phone,
        email: bookingData.email || '',
        notes: bookingData.notes || ''
      };
      
      // Send to Firebase using the createAppointment service
      console.log('Sending appointment to Firebase:', appointmentData);
      const createdAppointment = await createAppointment(appointmentData);
      console.log('Appointment created successfully:', createdAppointment);
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting appointment:', error);
      setError('אירעה שגיאה בשמירת התור. אנא נסה שנית.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define the steps for the booking process
  const steps = ['אישור הזמנה', 'פרטי התקשרות', 'שירות', 'תאריך'];

  if (isSubmitted) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <HourglassTop color="primary" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h4" gutterBottom color="primary.main">
          בקשת התור נשלחה!
        </Typography>
        
        <Alert 
          severity="info" 
          icon={<Info fontSize="large" />}
          sx={{ 
            maxWidth: '500px', 
            mx: 'auto', 
            mb: 4, 
            py: 2,
            fontSize: '1.1rem',
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          <AlertTitle sx={{ fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'center' }}>
            חשוב לדעת
          </AlertTitle>
          <Box sx={{ textAlign: 'center', fontWeight: 'medium' }}>
            <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
              בקשת התור נשלחה לאישור הספר
            </Typography>
            <Typography variant="body1">
              לאחר אישור הבקשה, תקבל הודעת אישור ב{notificationMethodsMap[bookingData.notificationMethod] || 'הודעה'}
            </Typography>
          </Box>
        </Alert>
        
        <Box sx={{ maxWidth: '500px', mx: 'auto', mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h6" gutterBottom color="primary">
            סיכום הבקשה
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                שירות:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {servicesMap[bookingData.service] || 'לא נבחר'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                תאריך:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {bookingData.date ? format(bookingData.date, 'EEEE, d בMMMM yyyy', { locale: he }) : ''}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                שעה:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {bookingData.time}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                שם:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {bookingData.name}
              </Typography>
            </Grid>
            {bookingData.withChildren && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  ילדים:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {bookingData.childrenCount} ילדים
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
        <Box sx={{ mt: 4 }}>
          <Button 
            component={Link} 
            href="/" 
            variant="contained" 
            color="primary"
            startIcon={<Home />}
            sx={{ mx: 1 }}
          >
            חזרה לדף הבית
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        אישור הזמנה
      </Typography>
      
      <Alert 
        severity="info" 
        sx={{ mb: 4 }}
        icon={<Info />}
      >
        <AlertTitle>שים לב</AlertTitle>
        <Typography sx={{ fontWeight: 'medium' }}>
          אנא בדוק את פרטי ההזמנה לפני שליחת הבקשה. התור יקבע רק לאחר אישור הספר.
        </Typography>
      </Alert>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          icon={<ErrorIcon />}
        >
          <AlertTitle>שגיאה</AlertTitle>
          <Typography>{error}</Typography>
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom color="primary">
          פרטי ההזמנה
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <CalendarMonth color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="תאריך" 
              secondary={bookingData.date ? format(bookingData.date, 'EEEE, d בMMMM yyyy', { locale: he }) : 'לא נבחר'}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <AccessTime color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="שעה" 
              secondary={bookingData.time || 'לא נבחרה'}
            />
          </ListItem>
          
          <Divider sx={{ my: 1 }} />
          
          <ListItem>
            <ListItemIcon>
              <ContentCut color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="שירות" 
              secondary={servicesMap[bookingData.service] || 'לא נבחר'}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Person color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="מספר אנשים" 
              secondary={bookingData.people}
            />
          </ListItem>
          
          {bookingData.withChildren && (
            <ListItem>
              <ListItemIcon>
                <ChildCare color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="מספר ילדים" 
                secondary={bookingData.childrenCount}
              />
            </ListItem>
          )}
          
          <ListItem>
            <ListItemIcon>
              <Notifications color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="אופן קבלת עדכונים" 
              secondary={notificationMethodsMap[bookingData.notificationMethod] || 'לא נבחר'}
            />
          </ListItem>
          
          <Divider sx={{ my: 1 }} />
          
          <ListItem>
            <ListItemIcon>
              <Person color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="שם מלא" 
              secondary={bookingData.name || 'לא הוזן'}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Phone color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="טלפון" 
              secondary={bookingData.phone || 'לא הוזן'}
            />
          </ListItem>
          
          {bookingData.email && (
            <ListItem>
              <ListItemIcon>
                <Email color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="אימייל" 
                secondary={bookingData.email}
              />
            </ListItem>
          )}
          
          {bookingData.notes && (
            <ListItem>
              <ListItemIcon>
                <Note color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="הערות" 
                secondary={bookingData.notes}
              />
            </ListItem>
          )}
        </List>
      </Paper>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
          sx={{ px: 4, py: 1.5, borderRadius: 2 }}
        >
          {isSubmitting ? 'שולח...' : 'אישור והזמנת תור'}
        </Button>
      </Box>
    </Box>
  );
} 