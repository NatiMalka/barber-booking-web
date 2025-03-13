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
  getAllAppointmentsFromAllCollections,
  subscribeToAppointments
} from '@/firebase/services/appointmentService';
import VacationManager from '@/components/admin/VacationManager';

// Define services map for display
const servicesMap: Record<string, { name: string, price: number }> = {
  'haircut': { name: 'תספורת גבר/ ילד', price: 50 },
  'beard': { name: 'סידור זקן', price: 25 },
  'sideBurn': { name: 'סידור קו', price: 20 },
  'styling': { name: 'איזורי שעווה אף/אוזניים/לחיים/גבות', price: 15 },
  'coloring': { name: 'גוונים', price: 180 },
  'fullPackage': { name: 'צבע מלא', price: 220 }
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

// Calculate total price for an appointment
const calculateTotalPrice = (appointment: AppointmentType) => {
  if (appointment.services && appointment.services.length > 0) {
    return appointment.services.reduce((total, serviceId) => {
      return total + (servicesMap[serviceId]?.price || 0);
    }, 0);
  }
  // Fallback for old appointments with only a single service
  return servicesMap[appointment.service]?.price || 0;
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
  
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Fetch appointments on component mount
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/auth/login');
      return;
    }
    
    if (!authLoading && isAdmin) {
      // Set up real-time listener instead of one-time fetch
      let unsubscribe: (() => void) | null = null;
      
      const setupRealTimeListener = async () => {
        try {
          setLoading(true);
          
          // Subscribe to real-time updates
          unsubscribe = subscribeToAppointments((data) => {
            console.log('Real-time appointment update received:', data.length, 'appointments');
            setAppointments(data);
            setLoading(false);
          });
        } catch (error) {
          console.error('Error setting up real-time listener:', error);
          setLoading(false);
          
          // Fallback to regular fetch if real-time listener fails
          fetchAppointments();
        }
      };
      
      setupRealTimeListener();
      
      // Clean up listener on component unmount
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [authLoading, isAdmin, router]);
  
  // Keep fetchAppointments as a fallback method
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAllAppointmentsFromAllCollections();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle main tab change
  const handleMainTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setMainTabValue(newValue);
  };
  
  // Handle date filter change
  const handleDateFilterChange = (filter: 'all' | 'today' | 'upcoming' | 'past') => {
    setDateFilter(filter);
  };
  
  // Handle refresh button click - now just resets the listener
  const handleRefresh = () => {
    // Fetch appointments manually as a fallback
    fetchAppointments();
  };
  
  // Handle clear cache button click
  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };
  
  // Handle status update
  const handleStatusUpdate = async (appointmentId: string, newStatus: AppointmentType['status']) => {
    try {
      setStatusUpdateLoading(appointmentId);
      await updateAppointmentStatus(appointmentId, newStatus);
      
      // No need to update local state manually as the real-time listener will handle it
      // Just show loading state until the update comes through
      
      // Optional: Add a timeout to reset loading state in case the update takes too long
      setTimeout(() => {
        setStatusUpdateLoading(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setStatusUpdateLoading(null);
      
      // Show error notification or handle error
    }
  };
  
  // Get filtered appointments based on tab and search
  const getFilteredAppointments = useCallback(() => {
    return appointments.filter(appointment => {
      // Filter by status based on tab
      if (tabValue === 1 && appointment.status !== 'pending') return false;
      if (tabValue === 2 && appointment.status !== 'approved') return false;
      if (tabValue === 3 && appointment.status !== 'rejected') return false;
      
      // Filter by date
      if (dateFilter !== 'all') {
        const appointmentDate = appointment.date instanceof Date 
          ? appointment.date 
          : new Date(appointment.date);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dateFilter === 'today' && !isToday(appointmentDate)) {
          return false;
        }
        
        if (dateFilter === 'upcoming' && !isAfter(appointmentDate, today)) {
          return false;
        }
        
        if (dateFilter === 'past' && !isBefore(appointmentDate, today)) {
          return false;
        }
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = appointment.name?.toLowerCase().includes(searchLower);
        const phoneMatch = appointment.phone?.toLowerCase().includes(searchLower);
        const emailMatch = appointment.email?.toLowerCase().includes(searchLower);
        
        return nameMatch || phoneMatch || emailMatch;
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
                  onClose={() => setActionMenuAnchor(null)}
                >
                  <MenuItem 
                    onClick={() => { handleDateFilterChange('all'); setActionMenuAnchor(null); }}
                    selected={dateFilter === 'all'}
                  >
                    כל התורים
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { handleDateFilterChange('today'); setActionMenuAnchor(null); }}
                    selected={dateFilter === 'today'}
                  >
                    תורים להיום
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { handleDateFilterChange('upcoming'); setActionMenuAnchor(null); }}
                    selected={dateFilter === 'upcoming'}
                  >
                    תורים עתידיים
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { handleDateFilterChange('past'); setActionMenuAnchor(null); }}
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
                                onClick={(e) => {
                                  setSelectedAppointment(appointment);
                                  setActionMenuAnchor(e.currentTarget);
                                }}
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
                                {appointment.services && appointment.services.length > 0 ? (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                    {appointment.services.map(serviceId => (
                                      <Chip 
                                        key={serviceId}
                                        label={servicesMap[serviceId]?.name || serviceId} 
                                        size="small" 
                                        variant="outlined"
                                        icon={<ContentCut sx={{ fontSize: '0.8rem' }} />}
                                      />
                                    ))}
                                    <Chip 
                                      label={`סה״כ: ₪${calculateTotalPrice(appointment)}`}
                                      size="small"
                                      color="primary"
                                    />
                                  </Box>
                                ) : (
                                  <Chip 
                                    label={servicesMap[appointment.service]?.name || appointment.service} 
                                    size="small" 
                                    variant="outlined"
                                    icon={<ContentCut sx={{ fontSize: '0.8rem' }} />}
                                  />
                                )}
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
                                      onClick={() => window.open(`tel:${appointment.phone}`)}
                                    >
                                      <PhoneIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="שלח וואטסאפ">
                                    <IconButton 
                                      size="small" 
                                      color="success"
                                      onClick={() => window.open(`https://wa.me/${appointment.phone.replace(/\D/g, '')}`)}
                                    >
                                      <WhatsApp fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  {appointment.email && (
                                    <Tooltip title="שלח אימייל">
                                      <IconButton 
                                        size="small" 
                                        color="info"
                                        onClick={() => window.open(`mailto:${appointment.email}`)}
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
        </>
      )}
      
      {mainTabValue === 1 && (
        <VacationManager />
      )}
      
      {/* Action Menu for Appointment */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor) && Boolean(selectedAppointment)}
        onClose={() => {
          setActionMenuAnchor(null);
          setSelectedAppointment(null);
        }}
      >
        <MenuItem 
          onClick={() => {
            if (selectedAppointment) {
              setAppointmentToDelete(selectedAppointment.id!);
              setDeleteDialogOpen(true);
            }
            setActionMenuAnchor(null);
            setSelectedAppointment(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          מחק תור
        </MenuItem>
      </Menu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>מחיקת תור</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את התור? פעולה זו אינה ניתנת לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            ביטול
          </Button>
          <Button 
            onClick={async () => {
              if (appointmentToDelete) {
                try {
                  await deleteAppointment(appointmentToDelete);
                  // No need to update local state as the real-time listener will handle it
                  setDeleteDialogOpen(false);
                  setAppointmentToDelete(null);
                } catch (error) {
                  console.error('Error deleting appointment:', error);
                }
              }
            }} 
            color="error"
          >
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 