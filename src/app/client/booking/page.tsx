'use client';

import { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Paper
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import DateSelection from '@/components/booking/DateSelection';
import ServiceSelection from '@/components/booking/ServiceSelection';
import ContactInfo from '@/components/booking/ContactInfo';
import Confirmation from '@/components/booking/Confirmation';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

// Define a type for the booking data
interface BookingData {
  date: Date | null;
  time: string | null;
  services: string[];
  service?: string; // Keep for backward compatibility
  people: number;
  withChildren: boolean;
  childrenCount: number;
  notificationMethod: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export default function BookingPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState<BookingData>({
    date: null,
    time: null,
    services: [],
    people: 1,
    withChildren: false,
    childrenCount: 0,
    notificationMethod: 'whatsapp',
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const { t } = useTranslation();

  // Define the steps for the booking process
  const steps = [
    t('booking.date'), 
    t('booking.service'), 
    t('booking.contactInfo'), 
    t('booking.confirmation')
  ];

  const handleNext = () => {
    // If we're on the last step, don't proceed further
    if (activeStep === steps.length - 1) {
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleDataChange = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <DateSelection bookingData={bookingData} onDataChange={handleDataChange} />;
      case 1:
        return <ServiceSelection bookingData={bookingData} onDataChange={handleDataChange} />;
      case 2:
        return <ContactInfo bookingData={bookingData} onDataChange={handleDataChange} />;
      case 3:
        return <Confirmation bookingData={bookingData} />;
      default:
        return 'Unknown step';
    }
  };

  // Check if we can proceed to the next step
  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return bookingData.date && bookingData.time;
      case 1:
        return bookingData.services && bookingData.services.length > 0;
      case 2:
        return bookingData.name && bookingData.phone;
      default:
        return true;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center" color="primary" fontWeight="bold">
          {t('booking.title')}
        </Typography>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5, mt: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 4, mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowForward />}
          >
            {t('common.back')}
          </Button>
          
          {activeStep < steps.length - 1 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={<ArrowBack />}
              disabled={!canProceed()}
            >
              {t('common.next')}
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
} 