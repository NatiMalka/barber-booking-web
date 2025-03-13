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
  Tooltip,
  Chip,
  Divider,
  Badge,
  Stack,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Search,
  Dashboard as DashboardIcon,
  Refresh,
  ClearAll,
  CheckCircle,
  Cancel,
  Delete,
  MoreVert,
  Phone as PhoneIcon,
  WhatsApp,
  Email as EmailIcon,
  ContentCut,
  CalendarMonth,
  AccessTime,
  EventBusy,
  NotificationsActive,
  FilterList
} from '@mui/icons-material';
import { isToday, format, parseISO, isAfter, isBefore } from 'date-fns';
import { he } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  deleteAppointment,
  updateAppointmentStatus,
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

// Define status colors
const statusColors: Record<string, string> = {
  'pending': 'warning',
  'approved': 'success',
  'rejected': 'error',
  'cancelled': 'default'
};

// Define status labels
const statusLabels: Record<string, string> = {
  'pending': 'ממתין לאישור',
  'approved': 'מאושר',
  'rejected': 'נדחה',
  'cancelled': 'בוטל'
};

export default function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [mainTabValue, setMainTabValue] = useState(0); // New state for main tabs
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentType | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');
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

  // Handle date filter change
  const handleDateFilterChange = useCallback((filter: 'all' | 'today' | 'upcoming' | 'past') => {
    setDateFilter(filter);
  }, []);

  // Handle appointment status update
  const handleStatusUpdate = useCallback(async (appointmentId: string, newStatus: AppointmentType['status']) => {
    try {
      setStatusUpdateLoading(appointmentId);
      await updateAppointmentStatus(appointmentId, newStatus);
      
      // Update local state
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: newStatus } 
            : appointment
        )
      );
    } catch (error) {
      console.error(`Error updating appointment status to ${newStatus}:`, error);
    } finally {
      setStatusUpdateLoading(null);
      setActionMenuAnchor(null);
    }
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

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, appointment: AppointmentType) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedAppointment(appointment);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
  };

  const handleDeleteClick = (appointmentId: string) => {
    setAppointmentToDelete(appointmentId);
    setDeleteDialogOpen(true);
    setActionMenuAnchor(null);
  };

  const handleWhatsAppClick = (phone: string) => {
    // Format phone number (remove non-digits and ensure it starts with country code)
    const formattedPhone = phone.replace(/\D/g, '');
    const phoneWithCountryCode = formattedPhone.startsWith('972') 
      ? formattedPhone 
      : `972${formattedPhone.startsWith('0') ? formattedPhone.substring(1) : formattedPhone}`;
    
    // Open WhatsApp with the phone number
    window.open(`https://wa.me/${phoneWithCountryCode}`, '_blank');
  };

  const handleCallClick = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  const handleEmailClick = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  // Filter appointments based on date filter
  const getFilteredAppointments = useCallback(() => {
    return appointments.filter(appointment => {
      // First apply tab filter
      if (tabValue === 1 && appointment.status !== 'pending') return false;
      if (tabValue === 2 && appointment.status !== 'approved') return false;
      if (tabValue === 3 && appointment.status !== 'rejected') return false;
      
      // Then apply date filter
      if (dateFilter !== 'all') {
        const appointmentDate = appointment.date instanceof Date 
          ? appointment.date 
          : new Date(appointment.date);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dateFilter === 'today' && !isToday(appointmentDate)) return false;
        if (dateFilter === 'upcoming' && !isAfter(appointmentDate, today)) return false;
        if (dateFilter === 'past' && !isBefore(appointmentDate, today)) return false;
      }
      
      // Finally apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          appointment.name?.toLowerCase().includes(term) ||
          appointment.phone?.toLowerCase().includes(term)
        );
      }
      
      return true;
    });
  }, [appointments, tabValue, dateFilter, searchTerm]);

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

  // Count appointments by status
  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const approvedCount = appointments.filter(a => a.status === 'approved').length;
  const todayCount = appointments.filter(a => {
    if (!a.date) return false;
    return isToday(new Date(a.date));
  }).length;

  const filteredAppointments = getFilteredAppointments();

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
              <Grid item xs={6} sm={3}>
                <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold">{appointments.length}</Typography>
                    <Typography variant="body2">סה&quot;כ תורים</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold">
                      {pendingCount}
                    </Typography>
                    <Typography variant="body2">ממתינים לאישור</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold">
                      {approvedCount}
                    </Typography>
                    <Typography variant="body2">תורים מאושרים</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold">
                      {todayCount}
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
                <Tooltip title="סינון לפי תאריך">
                  <IconButton 
                    color="primary"
                    onClick={(e) => setActionMenuAnchor(e.currentTarget)}
                    sx={{ mr: 1 }}
                  >
                    <FilterList />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={actionMenuAnchor}
                  open={Boolean(actionMenuAnchor) && !selectedAppointment}
                  onClose={handleActionMenuClose}
                >
                  <MenuItem 
                    onClick={() => { handleDateFilterChange('all'); handleActionMenuClose(); }}
                    selected={dateFilter === 'all'}
                  >
                    כל התורים
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { handleDateFilterChange('today'); handleActionMenuClose(); }}
                    selected={dateFilter === 'today'}
                  >
                    תורים להיום
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { handleDateFilterChange('upcoming'); handleActionMenuClose(); }}
                    selected={dateFilter === 'upcoming'}
                  >
                    תורים עתידיים
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { handleDateFilterChange('past'); handleActionMenuClose(); }}
                    selected={dateFilter === 'past'}
                  >
                    תורים שעברו
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="appointment tabs">
                <Tab label="הכל" />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <span>ממתינים לאישור</span>
                      {pendingCount > 0 && (
                        <Badge 
                          badgeContent={pendingCount} 
                          color="warning" 
                          max={99}
                          sx={{ 
                            ml: 0.5,
                            '& .MuiBadge-badge': {
                              position: 'relative',
                              transform: 'none',
                              fontSize: '0.7rem',
                              padding: '0 4px',
                              height: '16px',
                              minWidth: '16px',
                              borderRadius: '8px'
                            }
                          }}
                        />
                      )}
                    </Box>
                  } 
                />
                <Tab label="מאושרים" />
                <Tab label="נדחו" />
              </Tabs>
            </Box>
            
            {/* Date filter chips */}
            {dateFilter !== 'all' && (
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label={dateFilter === 'today' ? 'תורים להיום' : dateFilter === 'upcoming' ? 'תורים עתידיים' : 'תורים שעברו'} 
                  onDelete={() => handleDateFilterChange('all')}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            )}
            
            {/* Appointment List */}
            {filteredAppointments.length === 0 ? (
              <Alert severity="info">אין תורים להצגה</Alert>
            ) : (
              <List>
                {filteredAppointments.map((appointment) => {
                  const appointmentDate = appointment.date instanceof Date 
                    ? appointment.date 
                    : new Date(appointment.date);
                  
                  return (
                    <Paper 
                      key={appointment.id} 
                      elevation={1} 
                      sx={{ 
                        mb: 2, 
                        borderRadius: 2,
                        borderRight: 4, 
                        borderColor: `${statusColors[appointment.status]}.main`,
                        overflow: 'hidden'
                      }}
                    >
                      <ListItem
                        sx={{ 
                          py: 2,
                          bgcolor: isToday(appointmentDate) ? 'rgba(33, 150, 243, 0.08)' : 'inherit'
                        }}
                        secondaryAction={
                          <Box>
                            {appointment.status === 'pending' && (
                              <>
                                <Tooltip title="אשר תור">
                                  <IconButton 
                                    color="success"
                                    onClick={() => handleStatusUpdate(appointment.id!, 'approved')}
                                    disabled={statusUpdateLoading === appointment.id}
                                  >
                                    {statusUpdateLoading === appointment.id ? 
                                      <CircularProgress size={24} /> : 
                                      <CheckCircle />
                                    }
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="דחה תור">
                                  <IconButton 
                                    color="error"
                                    onClick={() => handleStatusUpdate(appointment.id!, 'rejected')}
                                    disabled={statusUpdateLoading === appointment.id}
                                  >
                                    <Cancel />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            <Tooltip title="אפשרויות נוספות">
                              <IconButton 
                                onClick={(e) => handleActionMenuOpen(e, appointment)}
                              >
                                <MoreVert />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: 'primary.main', 
                                  width: 40, 
                                  height: 40,
                                  mr: 2
                                }}
                              >
                                {appointment.name?.charAt(0) || '?'}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" sx={{ mb: 0 }}>
                                  {appointment.name}
                                </Typography>
                                <Chip 
                                  label={statusLabels[appointment.status]} 
                                  size="small" 
                                  color={statusColors[appointment.status] as any}
                                  sx={{ mr: 1 }}
                                />
                                <Chip 
                                  label={servicesMap[appointment.service] || appointment.service} 
                                  size="small" 
                                  variant="outlined"
                                  icon={<ContentCut sx={{ fontSize: '0.8rem' }} />}
                                />
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                              <Grid item xs={12} sm={6}>
                                <Stack direction="row" spacing={2}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CalendarMonth fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                                    <Typography variant="body2">
                                      {format(appointmentDate, 'EEEE, d בMMMM yyyy', { locale: he })}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Stack direction="row" spacing={2}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccessTime fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                                    <Typography variant="body2">
                                      {appointment.time}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <NotificationsActive fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                                    <Typography variant="body2">
                                      {appointment.notificationMethod === 'whatsapp' ? 'וואטסאפ' : 
                                       appointment.notificationMethod === 'sms' ? 'SMS' : 'אימייל'}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Grid>
                              <Grid item xs={12}>
                                <Stack direction="row" spacing={1}>
                                  <Tooltip title="התקשר">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleCallClick(appointment.phone)}
                                    >
                                      <PhoneIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="שלח וואטסאפ">
                                    <IconButton 
                                      size="small" 
                                      color="success"
                                      onClick={() => handleWhatsAppClick(appointment.phone)}
                                    >
                                      <WhatsApp fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  {appointment.email && (
                                    <Tooltip title="שלח אימייל">
                                      <IconButton 
                                        size="small" 
                                        color="info"
                                        onClick={() => handleEmailClick(appointment.email!)}
                                      >
                                        <EmailIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                    {appointment.phone}
                                  </Typography>
                                </Stack>
                              </Grid>
                              {appointment.notes && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>הערות:</strong> {appointment.notes}
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                          }
                        />
                      </ListItem>
                    </Paper>
                  );
                })}
              </List>
            )}
          </Paper>
          
          {/* Action Menu for Appointment */}
          <Menu
            anchorEl={actionMenuAnchor}
            open={Boolean(actionMenuAnchor) && Boolean(selectedAppointment)}
            onClose={handleActionMenuClose}
          >
            {selectedAppointment?.status === 'pending' && (
              <MenuItem onClick={() => handleStatusUpdate(selectedAppointment.id!, 'approved')}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                אשר תור
              </MenuItem>
            )}
            {selectedAppointment?.status === 'pending' && (
              <MenuItem onClick={() => handleStatusUpdate(selectedAppointment.id!, 'rejected')}>
                <Cancel color="error" sx={{ mr: 1 }} />
                דחה תור
              </MenuItem>
            )}
            {selectedAppointment?.status === 'approved' && (
              <MenuItem onClick={() => handleStatusUpdate(selectedAppointment.id!, 'cancelled')}>
                <EventBusy color="warning" sx={{ mr: 1 }} />
                בטל תור
              </MenuItem>
            )}
            {selectedAppointment?.status === 'rejected' && (
              <MenuItem onClick={() => handleStatusUpdate(selectedAppointment.id!, 'approved')}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                אשר תור בכל זאת
              </MenuItem>
            )}
            <Divider />
            <MenuItem onClick={() => handleWhatsAppClick(selectedAppointment?.phone || '')}>
              <WhatsApp color="success" sx={{ mr: 1 }} />
              שלח וואטסאפ
            </MenuItem>
            <MenuItem onClick={() => handleCallClick(selectedAppointment?.phone || '')}>
              <PhoneIcon color="primary" sx={{ mr: 1 }} />
              התקשר ללקוח
            </MenuItem>
            {selectedAppointment?.email && (
              <MenuItem onClick={() => handleEmailClick(selectedAppointment.email || '')}>
                <EmailIcon color="info" sx={{ mr: 1 }} />
                שלח אימייל
              </MenuItem>
            )}
            <Divider />
            <MenuItem onClick={() => handleDeleteClick(selectedAppointment?.id || '')} sx={{ color: 'error.main' }}>
              <Delete color="error" sx={{ mr: 1 }} />
              מחק תור
            </MenuItem>
          </Menu>
          
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