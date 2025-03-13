'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { format, addDays, isAfter, isBefore, isEqual, parseISO, set } from 'date-fns';
import { he } from 'date-fns/locale';

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

interface DateSelectionProps {
  bookingData: any;
  onDataChange: (data: any) => void;
}

export default function DateSelection({ bookingData, onDataChange }: DateSelectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(bookingData.date || null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(bookingData.time || null);

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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    onDataChange({ date, time: null });
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onDataChange({ time });
  };

  const isDateSelected = (date: Date) => {
    return selectedDate && isEqual(date, selectedDate);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        בחר תאריך
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {availableDates.map((date) => (
          <Grid item key={date.toISOString()}>
            <Button
              variant={isDateSelected(date) ? "contained" : "outlined"}
              onClick={() => handleDateSelect(date)}
              sx={{ 
                minWidth: '100px',
                display: 'flex',
                flexDirection: 'column',
                p: 1
              }}
            >
              <Typography variant="body2">
                {format(date, 'EEEE', { locale: he })}
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {format(date, 'd/MM', { locale: he })}
              </Typography>
            </Button>
          </Grid>
        ))}
      </Grid>

      {selectedDate && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            בחר שעה
          </Typography>
          
          <Grid container spacing={2}>
            {availableTimeSlots.map((time) => (
              <Grid item key={time}>
                <Button
                  variant={selectedTime === time ? "contained" : "outlined"}
                  onClick={() => handleTimeSelect(time)}
                  color="primary"
                  sx={{ minWidth: '80px' }}
                >
                  {time}
                </Button>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
} 