'use client';

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  CardActionArea,
  TextField,
  InputAdornment
} from '@mui/material';
import { ContentCut, Timer, Person } from '@mui/icons-material';

// Define available services
const services = [
  { 
    id: 'haircut', 
    name: 'תספורת גברים', 
    duration: 45,
    icon: <ContentCut />
  },
  { 
    id: 'kids', 
    name: 'תספורת ילדים', 
    duration: 30,
    icon: <ContentCut />
  },
  { 
    id: 'beard', 
    name: 'עיצוב זקן', 
    duration: 20,
    icon: <ContentCut />
  },
  { 
    id: 'combo', 
    name: 'תספורת + עיצוב זקן', 
    duration: 60,
    icon: <ContentCut />
  }
];

interface ServiceSelectionProps {
  bookingData: any;
  onDataChange: (data: any) => void;
}

export default function ServiceSelection({ bookingData, onDataChange }: ServiceSelectionProps) {
  const [selectedService, setSelectedService] = useState<string>(bookingData.service || '');
  const [people, setPeople] = useState<number>(bookingData.people || 1);
  const [notificationMethod, setNotificationMethod] = useState<string>(bookingData.notificationMethod || 'whatsapp');

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    onDataChange({ service: serviceId });
  };

  const handlePeopleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value > 0 && value <= 5) {
      setPeople(value);
      onDataChange({ people: value });
    }
  };

  const handleNotificationMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationMethod(event.target.value);
    onDataChange({ notificationMethod: event.target.value });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        בחר שירות
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {services.map((service) => (
          <Grid item xs={12} sm={6} key={service.id}>
            <Card 
              elevation={selectedService === service.id ? 3 : 1}
              sx={{ 
                borderColor: selectedService === service.id ? 'primary.main' : 'transparent',
                borderWidth: 2,
                borderStyle: 'solid',
                transition: 'all 0.3s ease'
              }}
            >
              <CardActionArea onClick={() => handleServiceSelect(service.id)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ mr: 2, color: 'primary.main' }}>
                      {service.icon}
                    </Box>
                    <Typography variant="h6" component="div">
                      {service.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Timer fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {service.duration} דקות
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          מספר אנשים
        </Typography>
        <TextField
          type="number"
          value={people}
          onChange={handlePeopleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person />
              </InputAdornment>
            ),
            inputProps: { min: 1, max: 5 }
          }}
          sx={{ width: '120px' }}
        />
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          אופן קבלת עדכונים
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            value={notificationMethod}
            onChange={handleNotificationMethodChange}
          >
            <FormControlLabel value="whatsapp" control={<Radio />} label="וואטסאפ" />
            <FormControlLabel value="sms" control={<Radio />} label="SMS" />
            <FormControlLabel value="email" control={<Radio />} label="אימייל" />
          </RadioGroup>
        </FormControl>
      </Box>
    </Box>
  );
} 