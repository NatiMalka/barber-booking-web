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
import { 
  ContentCut, 
  Person, 
  ChildCare, 
  PaidOutlined,
  ShoppingCart
} from '@mui/icons-material';

// Define available services
const services = [
  { 
    id: 'haircut', 
    name: 'תספורת גבר/ ילד', 
    duration: 45,
    price: 50,
    icon: <ContentCut />
  },
  { 
    id: 'beard', 
    name: 'סידור זקן', 
    duration: 20,
    price: 25,
    icon: <ContentCut />
  },
  { 
    id: 'sideBurn', 
    name: 'סידור קו', 
    duration: 20,
    price: 20,
    icon: <ContentCut />
  },
  { 
    id: 'styling', 
    name: 'איזורי שעווה אף/אוזניים/לחיים/גבות', 
    duration: 30,
    price: 15,
    icon: <ContentCut />
  },
  { 
    id: 'coloring', 
    name: 'גוונים', 
    duration: 60,
    price: 180,
    icon: <ContentCut />
  },
  { 
    id: 'fullPackage', 
    name: 'צבע מלא', 
    duration: 90,
    price: 220,
    icon: <ContentCut />
  }
];

// Define the service selection data interface
interface ServiceData {
  services: string[];
  people: number;
  withChildren: boolean;
  childrenCount: number;
  notificationMethod: string;
}

interface ServiceSelectionProps {
  bookingData: {
    services?: string[];
    people?: number;
    withChildren?: boolean;
    childrenCount?: number;
    notificationMethod?: string;
  };
  onDataChange: (data: Partial<ServiceData>) => void;
}

export default function ServiceSelection({ bookingData, onDataChange }: ServiceSelectionProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>(bookingData.services || []);
  const [people, setPeople] = useState<number>(bookingData.people || 1);
  const [notificationMethod, setNotificationMethod] = useState<string>(bookingData.notificationMethod || 'sms');
  const [withChildren, setWithChildren] = useState<boolean>(bookingData.withChildren || false);
  const [childrenCount, setChildrenCount] = useState<number>(bookingData.childrenCount || 0);

  // Calculate total price based on selected services
  const totalPrice = selectedServices.reduce((total, serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return total + (service?.price || 0);
  }, 0);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServices(prev => {
      // If service is already selected, remove it
      if (prev.includes(serviceId)) {
        const newServices = prev.filter(id => id !== serviceId);
        onDataChange({ services: newServices });
        return newServices;
      } 
      // Otherwise add it
      else {
        const newServices = [...prev, serviceId];
        onDataChange({ services: newServices });
        return newServices;
      }
    });
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
        בחר שירות/ים
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        ניתן לבחור מספר שירותים
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {services.map((service) => (
          <Grid item xs={12} sm={6} key={service.id}>
            <Card 
              elevation={selectedServices.includes(service.id) ? 3 : 1}
              sx={{ 
                borderColor: selectedServices.includes(service.id) ? 'primary.main' : 'transparent',
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {service.duration} דקות
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      ₪{service.price}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedServices.length > 0 && (
        <Box 
          sx={{ 
            mt: 3,
            mb: 4,
            p: 3,
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2
          }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}
            >
              <PaidOutlined />
              סה"כ לתשלום
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              ₪{totalPrice}
            </Typography>
          </Box>
          
          <Divider sx={{ 
            my: 2, 
            borderColor: 'rgba(255, 255, 255, 0.2)'
          }} />
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1
          }}>
            <ShoppingCart fontSize="small" />
            <Typography variant="body1">
              {selectedServices.length} שירותים נבחרו
            </Typography>
          </Box>
        </Box>
      )}

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
            <FormControlLabel value="sms" control={<Radio />} label="SMS" />
            <FormControlLabel value="email" control={<Radio />} label="אימייל" />
          </RadioGroup>
        </FormControl>
      </Box>
    </Box>
  );
} 