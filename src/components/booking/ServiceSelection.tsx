'use client';

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  CardActionArea,
  TextField,
  InputAdornment,
  Checkbox,
  FormGroup,
  Collapse,
  Divider
} from '@mui/material';
import { ContentCut, Person, ChildCare } from '@mui/icons-material';

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

// Define the service selection data interface
interface ServiceData {
  service: string;
  people: number;
  withChildren: boolean;
  childrenCount: number;
  notificationMethod: string;
}

interface ServiceSelectionProps {
  bookingData: {
    service?: string;
    people?: number;
    withChildren?: boolean;
    childrenCount?: number;
    notificationMethod?: string;
  };
  onDataChange: (data: Partial<ServiceData>) => void;
}

export default function ServiceSelection({ bookingData, onDataChange }: ServiceSelectionProps) {
  const [selectedService, setSelectedService] = useState<string>(bookingData.service || '');
  const [people, setPeople] = useState<number>(bookingData.people || 1);
  const [notificationMethod, setNotificationMethod] = useState<string>(bookingData.notificationMethod || 'whatsapp');
  const [withChildren, setWithChildren] = useState<boolean>(bookingData.withChildren || false);
  const [childrenCount, setChildrenCount] = useState<number>(bookingData.childrenCount || 0);

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

  const handleWithChildrenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setWithChildren(checked);
    onDataChange({ withChildren: checked });
    
    // Reset children count if unchecked
    if (!checked) {
      setChildrenCount(0);
      onDataChange({ childrenCount: 0 });
    }
  };

  const handleChildrenCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value >= 0 && value <= 5) {
      setChildrenCount(value);
      onDataChange({ childrenCount: value });
    }
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
        <FormGroup>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={withChildren} 
                onChange={handleWithChildrenChange} 
                color="primary"
              />
            } 
            label="מגיע עם ילדים?" 
          />
        </FormGroup>
        
        <Collapse in={withChildren}>
          <Box sx={{ pl: 4, pt: 1, pb: 2 }}>
            <Typography variant="body1" gutterBottom>
              כמה ילדים?
            </Typography>
            <TextField
              type="number"
              value={childrenCount}
              onChange={handleChildrenCountChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ChildCare />
                  </InputAdornment>
                ),
                inputProps: { min: 1, max: 5 }
              }}
              sx={{ width: '120px' }}
            />
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ my: 3 }} />

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