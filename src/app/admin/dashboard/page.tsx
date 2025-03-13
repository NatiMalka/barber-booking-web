'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Tabs, 
  Tab, 
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  Avatar,
  IconButton,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Check, 
  Close, 
  CalendarMonth, 
  AccessTime, 
  Person, 
  Phone, 
  Email,
  Notifications,
  ChildCare
} from '@mui/icons-material';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

// Mock data for appointments
const mockAppointments = [
  {
    id: '1',
    date: new Date(2025, 2, 15, 10, 0),
    service: 'haircut',
    people: 1,
    withChildren: true,
    childrenCount: 2,
    notificationMethod: 'whatsapp',
    name: 'ישראל ישראלי',
    phone: '0501234567',
    email: 'israel@example.com',
    notes: '',
    status: 'pending',
    createdAt: new Date()
  },
  {
    id: '2',
    date: new Date(2025, 2, 15, 11, 0),
    service: 'combo',
    people: 1,
    withChildren: false,
    childrenCount: 0,
    notificationMethod: 'sms',
    name: 'משה כהן',
    phone: '0521234567',
    email: '',
    notes: 'מבקש תספורת קצרה',
    status: 'pending',
    createdAt: new Date()
  },
  {
    id: '3',
    date: new Date(2025, 2, 16, 14, 30),
    service: 'kids',
    people: 2,
    withChildren: true,
    childrenCount: 3,
    notificationMethod: 'whatsapp',
    name: 'דוד לוי',
    phone: '0531234567',
    email: 'david@example.com',
    notes: 'שני ילדים',
    status: 'approved',
    createdAt: new Date()
  },
  {
    id: '4',
    date: new Date(2025, 2, 17, 16, 0),
    service: 'beard',
    people: 1,
    withChildren: false,
    childrenCount: 0,
    notificationMethod: 'email',
    name: 'יעקב אברהם',
    phone: '0541234567',
    email: 'yaakov@example.com',
    notes: '',
    status: 'approved',
    createdAt: new Date()
  }
];

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

// Define status colors
const statusColors: Record<string, string> = {
  'pending': 'warning',
  'approved': 'success',
  'rejected': 'error'
};

// Define appointment interface
interface Appointment {
  id: string;
  date: Date;
  service: string;
  people: number;
  withChildren: boolean;
  childrenCount: number;
  notificationMethod: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  status: string;
  createdAt: Date;
}

export default function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and not admin, redirect to home
    if (!authLoading && !isAdmin) {
      router.push('/auth/login');
    }
  }, [isAdmin, authLoading, router]);

  // Load appointments from localStorage
  useEffect(() => {
    const loadAppointments = () => {
      try {
        // Get appointments from localStorage
        const storedAppointments = localStorage.getItem('appointments');
        
        if (storedAppointments) {
          // Parse the JSON string
          const parsedAppointments = JSON.parse(storedAppointments);
          
          // Convert date strings back to Date objects
          const formattedAppointments = parsedAppointments.map((appointment: any) => ({
            ...appointment,
            date: new Date(appointment.date),
            createdAt: new Date(appointment.createdAt)
          }));
          
          setAppointments(formattedAppointments);
        } else {
          // If no appointments in localStorage, use mock data for demonstration
          setAppointments(mockAppointments);
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
        // Fallback to mock data if there's an error
        setAppointments(mockAppointments);
      } finally {
        setLoading(false);
      }
    };
    
    loadAppointments();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleApprove = (id: string) => {
    const updatedAppointments = appointments.map((appointment: any) => 
      appointment.id === id ? { ...appointment, status: 'approved' } : appointment
    );
    
    setAppointments(updatedAppointments);
    
    // Update localStorage
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
  };

  const handleReject = (id: string) => {
    const updatedAppointments = appointments.map((appointment: any) => 
      appointment.id === id ? { ...appointment, status: 'rejected' } : appointment
    );
    
    setAppointments(updatedAppointments);
    
    // Update localStorage
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
  };

  const filteredAppointments = appointments.filter((appointment: any) => {
    if (tabValue === 0) return appointment.status === 'pending';
    if (tabValue === 1) return appointment.status === 'approved';
    return true;
  });

  // Show loading state
  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If not admin, don't render anything (redirect happens in useEffect)
  if (!isAdmin) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">
          אין לך הרשאות לצפות בדף זה. מועבר לדף ההתחברות...
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom textAlign="center" color="primary" fontWeight="bold">
        לוח בקרה
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          centered
          sx={{ mb: 3 }}
        >
          <Tab label="תורים חדשים" />
          <Tab label="תורים מאושרים" />
          <Tab label="כל התורים" />
        </Tabs>
        
        <Grid container spacing={3}>
          {filteredAppointments.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" textAlign="center" color="text.secondary">
                אין תורים להצגה
              </Typography>
            </Grid>
          ) : (
            filteredAppointments.map((appointment: any) => (
              <Grid item xs={12} md={6} key={appointment.id}>
                <Card 
                  elevation={2} 
                  sx={{ 
                    borderRight: 4, 
                    borderColor: `${statusColors[appointment.status]}.main`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {appointment.name}
                      </Typography>
                      <Chip 
                        label={appointment.status === 'pending' ? 'ממתין לאישור' : appointment.status === 'approved' ? 'מאושר' : 'נדחה'} 
                        color={statusColors[appointment.status] as any}
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarMonth fontSize="small" color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {format(appointment.date, 'EEEE, d בMMMM yyyy', { locale: he })}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTime fontSize="small" color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {format(appointment.date, 'HH:mm')}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                        שירות:
                      </Typography>
                      <Typography variant="body2">
                        {servicesMap[appointment.service]}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                        מספר אנשים:
                      </Typography>
                      <Typography variant="body2">
                        {appointment.people}
                      </Typography>
                    </Box>
                    
                    {appointment.withChildren && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                          <ChildCare fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          מספר ילדים:
                        </Typography>
                        <Typography variant="body2">
                          {appointment.childrenCount}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                        טלפון:
                      </Typography>
                      <Typography variant="body2">
                        {appointment.phone}
                      </Typography>
                    </Box>
                    
                    {appointment.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                          אימייל:
                        </Typography>
                        <Typography variant="body2">
                          {appointment.email}
                        </Typography>
                      </Box>
                    )}
                    
                    {appointment.notes && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                          הערות:
                        </Typography>
                        <Typography variant="body2">
                          {appointment.notes}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  
                  {appointment.status === 'pending' && (
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Close />}
                        onClick={() => handleReject(appointment.id)}
                      >
                        דחה
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<Check />}
                        onClick={() => handleApprove(appointment.id)}
                        sx={{ mr: 1 }}
                      >
                        אשר
                      </Button>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Paper>
    </Container>
  );
} 