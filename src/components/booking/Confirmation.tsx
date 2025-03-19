'use client';

import { useState, useEffect } from 'react';
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
  CircularProgress,
  Fade
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
  Error as ErrorIcon,
  PaidOutlined
} from '@mui/icons-material';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createAppointment } from '@/firebase/services/appointmentService';

// Dynamically import Lottie with no SSR
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

// Define services map for display
const servicesMap: Record<string, { name: string, price: number }> = {
  'haircut': { name: 'תספורת גבר/ ילד', price: 50 },
  'beard': { name: 'סידור זקן', price: 25 },
  'sideBurn': { name: 'סידור קו', price: 20 },
  'styling': { name: 'איזורי שעווה אף/אוזניים/לחיים/גבות', price: 15 },
  'coloring': { name: 'גוונים', price: 180 },
  'fullPackage': { name: 'צבע מלא', price: 220 }
};

// Define notification methods map for display
const notificationMethodsMap: Record<string, string> = {
  'whatsapp': 'וואטסאפ',
  'sms': 'SMS',
  'email': 'אימייל'
};

// Define the booking data interface
interface BookingData {
  date: Date | null;
  time: string | null;
  services: string[];
  people: number;
  withChildren: boolean;
  childrenCount: number;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

interface ConfirmationProps {
  bookingData: BookingData;
}

export default function Confirmation({ bookingData }: ConfirmationProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [animationData, setAnimationData] = useState<any>(null);
  const [animationError, setAnimationError] = useState<string | null>(null);
  const [animationLoading, setAnimationLoading] = useState<boolean>(true);

  // Load the animation data when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Attempting to load animation from /animations/animation.json');
      setAnimationLoading(true);
      
      fetch('/animations/animation.json')
        .then(response => {
          console.log('Animation fetch response:', response.status, response.statusText);
          if (!response.ok) {
            throw new Error(`Failed to load animation: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Animation loaded successfully, data size:', JSON.stringify(data).length);
          setAnimationData(data);
          setAnimationError(null);
          setAnimationLoading(false);
        })
        .catch(error => {
          console.error('Error loading animation:', error);
          setAnimationError(error.message);
          setAnimationLoading(false);
        });
        
      // Show animation after a short delay
      const timer = setTimeout(() => {
        setShowAnimation(true);
      }, 500);
      
      // Show summary after animation has had time to display
      const summaryTimer = setTimeout(() => {
        setShowSummary(true);
      }, 2000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(summaryTimer);
      };
    }
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create a booking object with all necessary data
      const bookingDate = new Date(bookingData.date as Date);
      
      // הוספת השעה לאובייקט התאריך
      if (bookingData.time) {
        const [hours, minutes] = bookingData.time.split(':').map(Number);
        bookingDate.setHours(hours, minutes, 0, 0);
      }
      
      // Prepare appointment data for Firebase
      const appointmentData = {
        date: bookingDate,
        time: bookingData.time || '',
        service: bookingData.services[0] || '', // For backward compatibility
        services: bookingData.services,
        people: bookingData.people,
        withChildren: bookingData.withChildren || false,
        childrenCount: bookingData.childrenCount || 0,
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
      setShowAnimation(true);
      
      // After animation plays for a bit, show the summary with fade-in effect
      setTimeout(() => {
        setShowSummary(true);
      }, 2000);
    } catch (error) {
      console.error('Error submitting appointment:', error);
      setError('אירעה שגיאה בשמירת התור. אנא נסה שנית.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    return bookingData.services.reduce((total, serviceId) => {
      return total + (servicesMap[serviceId]?.price || 0);
    }, 0);
  };

  if (isSubmitted) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        {showAnimation && (
          <Box className="animation-container" sx={{ 
            maxWidth: '250px', 
            mx: 'auto', 
            mb: 4,
            position: 'relative',
            zIndex: 1
          }}>
            {animationLoading && (
              <CircularProgress size={60} />
            )}
            
            {animationError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <AlertTitle>Animation Error</AlertTitle>
                {animationError}
              </Alert>
            )}
            
            {animationData && (
              <Lottie 
                animationData={animationData}
                loop={true}
                style={{ 
                  width: '100%', 
                  height: '100%',
                  position: 'relative',
                  zIndex: 1
                }}
                rendererSettings={{
                  preserveAspectRatio: 'xMidYMid slice',
                  progressiveLoad: false
                }}
              />
            )}
            
            {/* Fallback animation if Lottie fails to load */}
            {animationError && (
              <Box 
                sx={{ 
                  width: '200px', 
                  height: '200px', 
                  mx: 'auto',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '10px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  bgcolor: '#f8f8f8'
                }}
              >
                {/* Barber Pole Animation */}
                <Box 
                  sx={{
                    width: '60px',
                    height: '180px',
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderRadius: '10px',
                    bgcolor: '#f0f0f0',
                    overflow: 'hidden'
                  }}
                >
                  {/* Red Stripe */}
                  <Box 
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '40px',
                      bgcolor: '#e74c3c',
                      animation: 'moveStripe 2s linear infinite',
                      '@keyframes moveStripe': {
                        '0%': { top: '-40px' },
                        '100%': { top: '180px' }
                      }
                    }}
                  />
                  
                  {/* Blue Stripe */}
                  <Box 
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '40px',
                      bgcolor: '#3498db',
                      animation: 'moveStripe 2s linear infinite',
                      animationDelay: '0.66s',
                      '@keyframes moveStripe': {
                        '0%': { top: '-40px' },
                        '100%': { top: '180px' }
                      }
                    }}
                  />
                  
                  {/* White Stripe */}
                  <Box 
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '40px',
                      bgcolor: 'white',
                      animation: 'moveStripe 2s linear infinite',
                      animationDelay: '1.33s',
                      '@keyframes moveStripe': {
                        '0%': { top: '-40px' },
                        '100%': { top: '180px' }
                      }
                    }}
                  />
                  
                  {/* Pole Cap Top */}
                  <Box 
                    sx={{
                      position: 'absolute',
                      width: '70px',
                      height: '15px',
                      bgcolor: '#d0d0d0',
                      borderRadius: '5px',
                      top: '-5px',
                      left: '-5px',
                      zIndex: 2
                    }}
                  />
                  
                  {/* Pole Cap Bottom */}
                  <Box 
                    sx={{
                      position: 'absolute',
                      width: '70px',
                      height: '15px',
                      bgcolor: '#d0d0d0',
                      borderRadius: '5px',
                      bottom: '-5px',
                      left: '-5px',
                      zIndex: 2
                    }}
                  />
                </Box>
                
                {/* Checkmark Icon */}
                <CheckCircle 
                  color="success" 
                  sx={{ 
                    position: 'absolute', 
                    bottom: '10px', 
                    right: '10px', 
                    fontSize: 40,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(0.95)', opacity: 0.7 },
                      '50%': { transform: 'scale(1.05)', opacity: 1 },
                      '100%': { transform: 'scale(0.95)', opacity: 0.7 },
                    }
                  }} 
                />
              </Box>
            )}
          </Box>
        )}
        
        <Fade in={showSummary} timeout={1000}>
          <Box>
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
                <Typography variant="body1" paragraph component="div" sx={{ fontWeight: 'bold' }}>
                  בקשת התור נשלחה לאישור הספר
                </Typography>
                <Typography variant="body1" component="div">
                  לאחר אישור הבקשה, תקבל הודעת אישור באימייל
                </Typography>
              </Box>
            </Alert>
            
            <Box sx={{ maxWidth: '500px', mx: 'auto', mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="h6" gutterBottom color="primary">
                סיכום הבקשה
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    שירותים:
                  </Typography>
                  <List dense>
                    {bookingData.services.map((serviceId) => (
                      <ListItem key={serviceId} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: '30px' }}>
                          <ContentCut fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={servicesMap[serviceId]?.name || 'שירות לא ידוע'} 
                          secondary={`₪${servicesMap[serviceId]?.price || 0}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Box 
                    sx={{ 
                      mt: 2,
                      p: 2,
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                      <PaidOutlined sx={{ mr: 1 }} />
                      סה"כ לתשלום:
                    </Typography>
                    <Typography variant="h5" component="div" fontWeight="bold">
                      ₪{calculateTotalPrice()}
                    </Typography>
                  </Box>
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
        </Fade>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center" color="primary.main">
        אישור הזמנה
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom color="primary">
          פרטי ההזמנה
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarMonth color="primary" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  תאריך:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {bookingData.date ? format(bookingData.date, 'EEEE, d בMMMM yyyy', { locale: he }) : ''}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccessTime color="primary" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  שעה:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {bookingData.time}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              שירותים שנבחרו:
            </Typography>
            <List dense>
              {bookingData.services.map((serviceId) => (
                <ListItem key={serviceId} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: '30px' }}>
                    <ContentCut fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={servicesMap[serviceId]?.name || 'שירות לא ידוע'} 
                    secondary={`₪${servicesMap[serviceId]?.price || 0}`}
                  />
                </ListItem>
              ))}
            </List>
            
            <Box 
              sx={{ 
                mt: 2,
                p: 2,
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                <PaidOutlined sx={{ mr: 1 }} />
                סה"כ לתשלום:
              </Typography>
              <Typography variant="h5" component="div" fontWeight="bold">
                ₪{calculateTotalPrice()}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              פרטי לקוח:
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Person color="primary" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      שם:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {bookingData.name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Phone color="primary" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      טלפון:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {bookingData.phone}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              {bookingData.email && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Email color="primary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        אימייל:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {bookingData.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
              
              {bookingData.withChildren && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ChildCare color="primary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        ילדים:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {bookingData.childrenCount} ילדים
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
              
              {bookingData.notes && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Note color="primary" sx={{ mr: 1, mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        הערות:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {bookingData.notes}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>שגיאה</AlertTitle>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
          sx={{ minWidth: '200px' }}
        >
          {isSubmitting ? 'שולח...' : 'אישור והזמנת תור'}
        </Button>
      </Box>
    </Box>
  );
} 