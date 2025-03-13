'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Chip, 
  IconButton, 
  Alert, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  CircularProgress
} from '@mui/material';
import { BeachAccess, Add, Edit, Delete } from '@mui/icons-material';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import {
  getFutureVacationDays,
  addVacationDay,
  updateVacationDay,
  deleteVacationDay,
  VacationDay
} from '@/firebase/services/availabilityService';

interface VacationManagerProps {
  onRefresh?: () => void;
}

export default function VacationManager({ onRefresh }: VacationManagerProps) {
  const [vacationDays, setVacationDays] = useState<VacationDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Vacation day dialog states
  const [vacationDialogOpen, setVacationDialogOpen] = useState(false);
  const [vacationToEdit, setVacationToEdit] = useState<VacationDay | null>(null);
  const [newVacationDate, setNewVacationDate] = useState<Date | null>(null);
  const [newVacationReason, setNewVacationReason] = useState('');
  const [newVacationIsFullDay, setNewVacationIsFullDay] = useState(true);
  const [newVacationUnavailableHours, setNewVacationUnavailableHours] = useState<string[]>([]);
  const [vacationDeleteDialogOpen, setVacationDeleteDialogOpen] = useState(false);
  const [vacationToDelete, setVacationToDelete] = useState<string | null>(null);

  // Load vacation days - memoized to prevent unnecessary recreations
  const loadVacationDays = useCallback(async () => {
    try {
      setLoading(true);
      const vacations = await getFutureVacationDays();
      setVacationDays(vacations);
    } catch (error) {
      console.error('Error loading vacation days:', error);
      setError('אירעה שגיאה בטעינת ימי החופשה. אנא נסה שנית.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load vacation days on component mount
  useEffect(() => {
    loadVacationDays();
  }, [loadVacationDays]);

  // Open vacation day dialog - memoized
  const handleOpenVacationDialog = useCallback((vacation?: VacationDay) => {
    if (vacation) {
      setVacationToEdit(vacation);
      setNewVacationDate(vacation.date);
      setNewVacationReason(vacation.reason || '');
      setNewVacationIsFullDay(vacation.isFullDay);
      setNewVacationUnavailableHours(vacation.unavailableHours || []);
    } else {
      setVacationToEdit(null);
      setNewVacationDate(new Date());
      setNewVacationReason('');
      setNewVacationIsFullDay(true);
      setNewVacationUnavailableHours([]);
    }
    setVacationDialogOpen(true);
  }, []);

  // Close vacation day dialog - memoized
  const handleCloseVacationDialog = useCallback(() => {
    setVacationDialogOpen(false);
  }, []);

  // Handle vacation day form submission - memoized
  const handleVacationSubmit = useCallback(async () => {
    if (!newVacationDate) {
      setError('יש לבחור תאריך');
      return;
    }
    
    try {
      setLoading(true);
      
      const vacationData = {
        date: newVacationDate,
        reason: newVacationReason,
        isFullDay: newVacationIsFullDay,
        unavailableHours: newVacationUnavailableHours
      };
      
      if (vacationToEdit) {
        // Update existing vacation day
        await updateVacationDay(vacationToEdit.id!, vacationData);
      } else {
        // Add new vacation day
        await addVacationDay(vacationData);
      }
      
      // Reload vacation days
      await loadVacationDays();
      
      // Call onRefresh if provided
      if (onRefresh) {
        onRefresh();
      }
      
      // Close dialog
      handleCloseVacationDialog();
    } catch (error) {
      console.error('Error saving vacation day:', error);
      setError('אירעה שגיאה בשמירת יום החופשה. אנא נסה שנית.');
    } finally {
      setLoading(false);
    }
  }, [newVacationDate, newVacationReason, newVacationIsFullDay, newVacationUnavailableHours, vacationToEdit, loadVacationDays, onRefresh, handleCloseVacationDialog]);

  // Open vacation delete dialog - memoized
  const handleOpenVacationDeleteDialog = useCallback((id: string) => {
    setVacationToDelete(id);
    setVacationDeleteDialogOpen(true);
  }, []);

  // Close vacation delete dialog - memoized
  const handleVacationDeleteCancel = useCallback(() => {
    setVacationDeleteDialogOpen(false);
    setVacationToDelete(null);
  }, []);

  // Confirm vacation delete - memoized
  const handleVacationDeleteConfirm = useCallback(async () => {
    if (!vacationToDelete) return;
    
    try {
      setLoading(true);
      await deleteVacationDay(vacationToDelete);
      
      // Reload vacation days
      await loadVacationDays();
      
      // Call onRefresh if provided
      if (onRefresh) {
        onRefresh();
      }
      
      // Close dialog
      handleVacationDeleteCancel();
    } catch (error) {
      console.error('Error deleting vacation day:', error);
      setError('אירעה שגיאה במחיקת יום החופשה. אנא נסה שנית.');
    } finally {
      setLoading(false);
    }
  }, [vacationToDelete, loadVacationDays, onRefresh, handleVacationDeleteCancel]);

  // Toggle time slot selection for partial day vacation - memoized
  const handleTimeSlotToggle = useCallback((timeSlot: string) => {
    setNewVacationUnavailableHours(prev => {
      if (prev.includes(timeSlot)) {
        return prev.filter(slot => slot !== timeSlot);
      } else {
        return [...prev, timeSlot];
      }
    });
  }, []);

  // Define available time slots for vacation selection - memoized
  const timeSlots = useMemo(() => [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30'
  ], []);

  // Format date for display - memoized
  const formatDate = useCallback((date: Date) => {
    return format(date, 'yyyy-MM-dd');
  }, []);

  // Handle date change - memoized
  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      setNewVacationDate(new Date(dateValue));
    } else {
      setNewVacationDate(null);
    }
  }, []);

  // Handle reason change - memoized
  const handleReasonChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewVacationReason(e.target.value);
  }, []);

  // Handle full day switch change - memoized
  const handleFullDayChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewVacationIsFullDay(e.target.checked);
  }, []);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0, display: 'flex', alignItems: 'center' }}>
          <BeachAccess sx={{ mr: 1 }} /> ניהול ימי חופשה
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenVacationDialog()}
        >
          הוסף יום חופשה
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : vacationDays.length === 0 ? (
        <Alert severity="info">
          לא נמצאו ימי חופשה עתידיים.
        </Alert>
      ) : (
        <List>
          {vacationDays.map((vacation) => (
            <ListItem
              key={vacation.id}
              divider
              secondaryAction={
                <Box>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => handleOpenVacationDialog(vacation)}
                    sx={{ mr: 1 }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleOpenVacationDeleteDialog(vacation.id!)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              }
            >
              <ListItemIcon>
                <BeachAccess color="error" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" fontWeight="bold">
                      {format(vacation.date, 'EEEE, d בMMMM yyyy', { locale: he })}
                    </Typography>
                    <Chip
                      label={vacation.isFullDay ? 'יום שלם' : 'שעות מסוימות'}
                      color={vacation.isFullDay ? 'error' : 'warning'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    {vacation.reason && (
                      <Typography variant="body2" color="text.secondary">
                        סיבה: {vacation.reason}
                      </Typography>
                    )}
                    {!vacation.isFullDay && vacation.unavailableHours && vacation.unavailableHours.length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        שעות לא זמינות: {vacation.unavailableHours.join(', ')}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
      
      {/* Vacation Day Dialog */}
      <Dialog
        open={vacationDialogOpen}
        onClose={handleCloseVacationDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {vacationToEdit ? 'עריכת יום חופשה' : 'הוספת יום חופשה'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="תאריך"
              type="date"
              value={newVacationDate ? formatDate(newVacationDate) : ''}
              onChange={handleDateChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <TextField
              label="סיבה (אופציונלי)"
              value={newVacationReason}
              onChange={handleReasonChange}
              fullWidth
              margin="normal"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={newVacationIsFullDay}
                  onChange={handleFullDayChange}
                  color="primary"
                />
              }
              label="יום חופשה מלא"
              sx={{ mt: 2, mb: 1 }}
            />
            
            {!newVacationIsFullDay && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  בחר שעות לא זמינות:
                </Typography>
                <Grid container spacing={1}>
                  {timeSlots.map((timeSlot) => (
                    <Grid item key={timeSlot}>
                      <Chip
                        label={timeSlot}
                        color={newVacationUnavailableHours.includes(timeSlot) ? 'primary' : 'default'}
                        onClick={() => handleTimeSlotToggle(timeSlot)}
                        sx={{ m: 0.5 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVacationDialog} color="primary">
            ביטול
          </Button>
          <Button onClick={handleVacationSubmit} color="primary" variant="contained">
            שמור
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Vacation Delete Dialog */}
      <Dialog
        open={vacationDeleteDialogOpen}
        onClose={handleVacationDeleteCancel}
      >
        <DialogTitle>מחיקת יום חופשה</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את יום החופשה? פעולה זו אינה ניתנת לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVacationDeleteCancel} color="primary">
            ביטול
          </Button>
          <Button onClick={handleVacationDeleteConfirm} color="error" variant="contained">
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 