'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Tabs, 
  Tab, 
  List,
  ListItem,
  ListItemText,
  Button,
  IconButton,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip
} from '@mui/material';
import { 
  Search,
  Dashboard as DashboardIcon,
  Refresh,
  ClearAll
} from '@mui/icons-material';
import { isToday } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  deleteAppointment,
  Appointment as AppointmentType,
  getAllAppointmentsFromAllCollections
} from '@/firebase/services/appointmentService';
import VacationManager from '@/components/admin/VacationManager';

// Define services map for display
const servicesMap: Record<string, string> = {
  'haircut': 'תספורת גברים',
  'kids': 'תספורת ילדים',
  'beard': 'עיצוב זקן',
  'combo': 'תספורת + עיצוב זקן'
};

export default function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [mainTabValue, setMainTabValue] = useState(0); // New state for main tabs
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Check localStorage directly as a fallback
    const isBarberAdminInStorage = typeof window !== 'undefined' && localStorage.getItem('isBarberAdmin') === 'true';
    
    console.log('Admin dashboard auth check:', { 
      isAdmin, 
      authLoading, 
      isBarberAdminInStorage 
    });
    
    // Only redirect if not admin and not loading and not barber admin in storage
    if (!isAdmin && !authLoading && !isBarberAdminInStorage) {
      console.log('Redirecting to login page - not authorized');
      router.push('/auth/login');
      return;
    }
  }, [isAdmin, authLoading, router]);

  // Load appointments function - optimized to reduce unnecessary work
  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const allAppointments = await getAllAppointmentsFromAllCollections();
      setAppointments(allAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data based on the active tab - with proper dependencies
  useEffect(() => {
    if (!isAdmin) return;
    
    if (mainTabValue === 0) {
      // Appointments tab
      loadAppointments();
    }
  }, [mainTabValue, isAdmin, loadAppointments]);

  // Handle main tab change - memoized
  const handleMainTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setMainTabValue(newValue);
  }, []);

  // Handle refresh - memoized
  const handleRefresh = useCallback(() => {
    if (mainTabValue === 0) {
      loadAppointments();
    }
  }, [mainTabValue, loadAppointments]);

  // Handle clear cache - memoized
  const handleClearCache = useCallback(() => {
    localStorage.clear();
    handleRefresh();
  }, [handleRefresh]);

  // הוספת רענון אוטומטי כל דקה
  useEffect(() => {
    // רענון ראשוני בטעינה
    handleRefresh();
    
    // הגדרת רענון אוטומטי כל דקה
    const intervalId = setInterval(() => {
      console.log('מרענן נתונים אוטומטית...');
      handleRefresh();
    }, 60000); // כל דקה
    
    // ניקוי ה-interval בעת עזיבת הדף
    return () => clearInterval(intervalId);
  }, [handleRefresh]);

  // Handle tab change - memoized
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  const handleDeleteConfirm = async () => {
    if (appointmentToDelete) {
      try {
        await deleteAppointment(appointmentToDelete);
        
        // Update local state
        const updatedAppointments = appointments.filter(
          appointment => appointment.id !== appointmentToDelete
        );
        
        setAppointments(updatedAppointments);
        setDeleteDialogOpen(false);
        setAppointmentToDelete(null);
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAppointmentToDelete(null);
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
          לוח בקרה
        </Typography>
        <Box>
          <Tooltip title="נקה קאש ורענן">
            <IconButton onClick={handleClearCache} color="secondary" sx={{ mr: 1 }}>
              <ClearAll />
            </IconButton>
          </Tooltip>
          <Tooltip title="רענן נתונים">
            <IconButton onClick={handleRefresh} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Main Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={mainTabValue} onChange={handleMainTabChange} aria-label="main dashboard tabs">
          <Tab label="ניהול תורים" />
          <Tab label="ניהול ימי חופשה" />
        </Tabs>
      </Box>
      
      {/* Dashboard Overview - Show in both tabs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <DashboardIcon sx={{ mr: 1 }} /> סקירה כללית
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold">{appointments.length}</Typography>
                    <Typography variant="body2">סה&quot;כ תורים</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold">
                      {appointments.filter(a => a.status === 'pending').length}
                    </Typography>
                    <Typography variant="body2">ממתינים לאישור</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold">
                      {appointments.filter(a => a.status === 'approved').length}
                    </Typography>
                    <Typography variant="body2">תורים מאושרים</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold">
                      {appointments.filter(a => {
                        if (!a.date) return false;
                        return isToday(new Date(a.date));
                      }).length}
                    </Typography>
                    <Typography variant="body2">תורים היום</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      {mainTabValue === 0 && (
        <>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                ניהול תורים
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  placeholder="חיפוש לפי שם או טלפון"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mr: 2 }}
                />
              </Box>
            </Box>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="appointment tabs">
                <Tab label="הכל" />
                <Tab label="ממתינים לאישור" />
                <Tab label="מאושרים" />
                <Tab label="נדחו" />
              </Tabs>
            </Box>
            
            {/* Appointment List */}
            {appointments.length === 0 ? (
              <Alert severity="info">אין תורים להצגה</Alert>
            ) : (
              <List>
                {appointments
                  .filter(appointment => {
                    // Filter by tab
                    if (tabValue === 1 && appointment.status !== 'pending') return false;
                    if (tabValue === 2 && appointment.status !== 'approved') return false;
                    if (tabValue === 3 && appointment.status !== 'rejected') return false;
                    
                    // Filter by search term
                    if (searchTerm) {
                      const term = searchTerm.toLowerCase();
                      return (
                        appointment.name?.toLowerCase().includes(term) ||
                        appointment.phone?.toLowerCase().includes(term)
                      );
                    }
                    
                    return true;
                  })
                  .map((appointment) => (
                    <ListItem
                      key={appointment.id}
                      divider
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1" fontWeight="bold">
                              {appointment.name}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              טלפון: {appointment.phone}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              שירות: {servicesMap[appointment.service] || appointment.service}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              תאריך: {appointment.date instanceof Date ? 
                                appointment.date.toLocaleDateString() : 
                                new Date(appointment.date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              שעה: {appointment.time}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
            )}
          </Paper>
          
          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={handleDeleteCancel}
          >
            <DialogTitle>מחיקת תור</DialogTitle>
            <DialogContent>
              <DialogContentText>
                האם אתה בטוח שברצונך למחוק את התור? פעולה זו אינה ניתנת לביטול.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel} color="primary">
                ביטול
              </Button>
              <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                מחק
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      
      {mainTabValue === 1 && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <VacationManager onRefresh={handleRefresh} />
        </Paper>
      )}
    </Container>
  );
} 