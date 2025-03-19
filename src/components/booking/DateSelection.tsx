'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Button,
  CircularProgress,
  Tooltip,
  Badge
} from '@mui/material';
import { format, addDays, isBefore, isEqual, isSameDay } from 'date-fns';
import { he } from 'date-fns/locale';
import { getAppointmentsByDate } from '@/firebase/services/appointmentService';
import { getFutureVacationDays } from '@/firebase/services/availabilityService';
import { EventBusy, BeachAccess } from '@mui/icons-material';

// Define available time slots
const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30'
];

// Extended time slots for Thursday
const thursdayTimeSlots = [
  '08:00', '08:30', ...timeSlots, '20:00', '20:30'
];

// Reduced time slots for Friday
const fridayTimeSlots = [
  '08:00', '08:30', ...timeSlots.slice(0, 12)
];

// Define the booking data interface
interface BookingDateData {
  date: Date | null;
  time: string | null;
}

interface DateSelectionProps {
  bookingData: {
    date?: Date | null;
    time?: string | null;
  };
  onDataChange: (data: Partial<BookingDateData>) => void;
}

export default function DateSelection({ bookingData, onDataChange }: DateSelectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(bookingData.date || null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(bookingData.time || null);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [vacationDays, setVacationDays] = useState<Record<string, { isFullDay: boolean, unavailableHours: string[] }>>({});

  const handleDateSelect = useCallback((date: Date) => {
    // Check if the date is a full vacation day using the cached data
    const dateStr = format(date, 'yyyy-MM-dd');
    const vacationInfo = vacationDays[dateStr];
    
    if (vacationInfo && vacationInfo.isFullDay) {
      // Don't select full vacation days
      return;
    }
    
    setSelectedDate(date);
    setSelectedTime(null);
    onDataChange({ date, time: null });
  }, [vacationDays, onDataChange]);

  // Generate available dates (next 14 days, excluding Saturdays)
  useEffect(() => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 14; i++) {
      const date = addDays(today, i);
      // Skip Saturdays (day 6)
      if (date.getDay() !== 6) {
        dates.push(date);
      }
    }
    
    setAvailableDates(dates);
    
    // Set default selected date if not already set
    if (!selectedDate && dates.length > 0) {
      handleDateSelect(dates[0]);
    }
  }, [selectedDate, handleDateSelect]);

  // Load vacation days when component mounts
  useEffect(() => {
    const loadVacationDays = async () => {
      try {
        const vacations = await getFutureVacationDays();
        const vacationMap: Record<string, { isFullDay: boolean, unavailableHours: string[] }> = {};
        
        vacations.forEach(vacation => {
          const dateStr = format(vacation.date, 'yyyy-MM-dd');
          vacationMap[dateStr] = {
            isFullDay: vacation.isFullDay,
            unavailableHours: vacation.unavailableHours || []
          };
        });
        
        setVacationDays(vacationMap);
      } catch (error) {
        console.error('Error loading vacation days:', error);
      }
    };
    
    loadVacationDays();
  }, []);

  // Update available time slots based on selected date
  useEffect(() => {
    if (!selectedDate) return;
    
    const dayOfWeek = selectedDate.getDay();
    
    // Thursday (day 4)
    if (dayOfWeek === 4) {
      setAvailableTimeSlots(thursdayTimeSlots);
    } 
    // Friday (day 5)
    else if (dayOfWeek === 5) {
      setAvailableTimeSlots(fridayTimeSlots);
    } 
    // Regular days
    else {
      setAvailableTimeSlots(timeSlots);
    }
  }, [selectedDate]);

  // Fetch booked appointments for the selected date
  useEffect(() => {
    if (!selectedDate) return;
    
    const fetchBookedAppointments = async () => {
      try {
        setLoading(true);
        const appointments = await getAppointmentsByDate(selectedDate);
        
        // Extract the time slots that are already booked
        const booked = appointments.map(appointment => appointment.time);
        setBookedTimeSlots(booked);
      } catch (error) {
        console.error('Error fetching booked appointments:', error);
        // If there's an error, assume no slots are booked to allow the user to continue
        setBookedTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookedAppointments();
  }, [selectedDate]);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onDataChange({ time });
  };

  const isDateSelected = (date: Date) => {
    return selectedDate && isEqual(date, selectedDate);
  };

  // Check if a date is a vacation day using the cached data
  const isDateVacation = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return dateStr in vacationDays && vacationDays[dateStr].isFullDay;
  };

  // Check if a time slot is in the past for the current day
  const isTimeSlotPast = (timeSlot: string): boolean => {
    if (!selectedDate) return false;
    
    const now = new Date();
    
    // Only apply this check for the current day
    if (!isSameDay(selectedDate, now)) return false;
    
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const timeSlotDate = new Date(selectedDate);
    timeSlotDate.setHours(hours, minutes, 0, 0);
    
    return isBefore(timeSlotDate, now);
  };

  // Check if a time slot is already booked
  const isTimeSlotBooked = (timeSlot: string): boolean => {
    return bookedTimeSlots.includes(timeSlot);
  };

  // Check if a time slot is unavailable due to vacation using the cached data
  const isTimeSlotVacation = (timeSlot: string): boolean => {
    if (!selectedDate) return false;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const vacationInfo = vacationDays[dateStr];
    
    if (!vacationInfo) return false;
    
    // If it's a full day vacation, all time slots are unavailable
    if (vacationInfo.isFullDay) return true;
    
    // Check if this specific time slot is unavailable
    return vacationInfo.unavailableHours.includes(timeSlot);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        בחר תאריך
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {availableDates.map((date) => {
          const isVacation = isDateVacation(date);
          
          return (
            <Grid item key={date.toISOString()}>
              <Tooltip 
                title={isVacation ? "הספר אינו זמין ביום זה" : ""} 
                arrow
              >
                <span>
                  <Badge
                    color="error"
                    badgeContent={isVacation ? <BeachAccess fontSize="small" /> : 0}
                    overlap="circular"
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <Button
                      variant={isDateSelected(date) ? "contained" : "outlined"}
                      onClick={() => handleDateSelect(date)}
                      disabled={isVacation}
                      sx={{ 
                        minWidth: '100px',
                        display: 'flex',
                        flexDirection: 'column',
                        p: 1,
                        opacity: isVacation ? 0.5 : 1,
                        bgcolor: isVacation ? 'rgba(211, 47, 47, 0.1)' : undefined,
                        '&:hover': {
                          bgcolor: isVacation ? 'rgba(211, 47, 47, 0.2)' : undefined
                        }
                      }}
                    >
                      <Typography variant="body2">
                        {format(date, 'EEEE', { locale: he })}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {format(date, 'd/MM', { locale: he })}
                      </Typography>
                    </Button>
                  </Badge>
                </span>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>

      {selectedDate && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            בחר שעה
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {availableTimeSlots.map((time) => {
                const isPast = isTimeSlotPast(time);
                const isBooked = isTimeSlotBooked(time);
                const isVacation = isTimeSlotVacation(time);
                const isDisabled = isPast || isBooked || isVacation;
                
                let tooltipTitle = "";
                if (isBooked) tooltipTitle = "תור זה כבר תפוס";
                else if (isPast) tooltipTitle = "זמן זה כבר עבר";
                else if (isVacation) tooltipTitle = "הספר אינו זמין בשעה זו";
                
                return (
                  <Grid item key={time}>
                    <Tooltip title={tooltipTitle} arrow>
                      <span>
                        <Button
                          variant={selectedTime === time ? "contained" : "outlined"}
                          onClick={() => !isDisabled && handleTimeSelect(time)}
                          color="primary"
                          disabled={isDisabled}
                          startIcon={isBooked ? <EventBusy /> : isVacation ? <BeachAccess /> : undefined}
                          sx={{ 
                            minWidth: '80px',
                            opacity: isDisabled ? 0.5 : 1,
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            bgcolor: isBooked ? 'rgba(211, 47, 47, 0.1)' : 
                                    isVacation ? 'rgba(255, 152, 0, 0.1)' : undefined,
                            '&:hover': {
                              bgcolor: isBooked ? 'rgba(211, 47, 47, 0.2)' : 
                                      isVacation ? 'rgba(255, 152, 0, 0.2)' : undefined
                            }
                          }}
                        >
                          {time}
                        </Button>
                      </span>
                    </Tooltip>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
} 