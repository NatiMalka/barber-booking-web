'use client';

import { useState, useCallback } from 'react';
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
  ShoppingCart,
  PriceCheck
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
    name: 'איזורי שעווה\u00A0אף/\u00A0אוזניים/\u00A0לחיים/\u00A0גבות', 
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
}

interface ServiceSelectionProps {
  bookingData: {
    services?: string[];
    people?: number;
    withChildren?: boolean;
    childrenCount?: number;
  };
  onDataChange: (data: Partial<ServiceData>) => void;
}

export default function ServiceSelection({ bookingData, onDataChange }: ServiceSelectionProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>(bookingData.services || []);
  const [people, setPeople] = useState<number>(bookingData.people || 1);
  const [withChildren, setWithChildren] = useState<boolean>(bookingData.withChildren || false);
  const [childrenCount, setChildrenCount] = useState<number>(bookingData.childrenCount || 0);

  // Calculate total price based on selected services and number of people
  const calculateTotalPrice = useCallback(() => {
    let total = 0;
    
    selectedServices.forEach(serviceId => {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        // For haircut service, multiply by total number of people (adults + children)
        if (service.id === 'haircut') {
          const totalPeople = people + (withChildren ? childrenCount : 0);
          total += service.price * totalPeople;
        } else {
          // For other services, multiply by number of adults only
          total += service.price * people;
        }
      }
    });
    
    return total;
  }, [selectedServices, people, withChildren, childrenCount]);

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
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom fontWeight="500" color="primary.main">
          בחר שירות/ים
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          ניתן לבחור מספר שירותים
        </Typography>
      </Box>

      {/* Main Content */}
      <Grid container spacing={6}>
        {/* Services Section */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 500 }}>
            שירותים זמינים
          </Typography>
          <Grid container spacing={3}>
            {services.map((service) => (
              <Grid item xs={12} sm={12} md={6} key={service.id}>
                <Card 
                  elevation={selectedServices.includes(service.id) ? 4 : 1}
                  sx={{ 
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    transform: selectedServices.includes(service.id) ? 'scale(1.02)' : 'scale(1)',
                    border: selectedServices.includes(service.id) ? '2px solid' : '1px solid',
                    borderColor: selectedServices.includes(service.id) ? 'primary.main' : 'divider',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: 4
                    },
                    height: '100%',
                    minHeight: '120px'
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleServiceSelect(service.id)}
                    sx={{ 
                      p: 3,
                      height: '100%',
                      display: 'flex'
                    }}
                  >
                    <CardContent sx={{ 
                      p: 0, 
                      width: '100%',
                      '&:last-child': { pb: 0 }
                    }}>
                      <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        gap: 3,
                        width: '100%',
                        alignItems: 'center'
                      }}>
                        {/* Icon Container */}
                        <Box 
                          sx={{ 
                            bgcolor: selectedServices.includes(service.id) ? 'primary.main' : 'grey.100',
                            borderRadius: '50%',
                            width: 48,
                            height: 48,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            flexShrink: 0
                          }}
                        >
                          <Box sx={{ 
                            color: selectedServices.includes(service.id) ? 'white' : 'primary.main',
                            display: 'flex',
                            '& > svg': {
                              fontSize: 24
                            }
                          }}>
                            {service.icon}
                          </Box>
                        </Box>

                        {/* Content Container */}
                        <Box sx={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                          width: '100%'
                        }}>
                          {/* Service Name */}
                          <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                              fontSize: '1rem',
                              fontWeight: 500,
                              lineHeight: 1.4,
                              direction: 'rtl',
                              textAlign: 'right'
                            }}
                          >
                            {service.name}
                          </Typography>

                          {/* Duration and Price */}
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            width: '100%'
                          }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              bgcolor: 'grey.50',
                              px: 2,
                              py: 0.75,
                              borderRadius: 2,
                              height: 32
                            }}>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ fontSize: '0.875rem' }}
                              >
                                {service.duration} דקות
                              </Typography>
                            </Box>
                            <Typography 
                              variant="h6" 
                              color="primary.main" 
                              sx={{ 
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                fontSize: '1rem'
                              }}
                            >
                              ₪{service.price}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* People Selection Section */}
        {selectedServices.length > 0 && (
          <Grid item xs={12}>
            <Box 
              sx={{ 
                mt: 4,
                p: 4,
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 500 }}>
                מספר מסתפרים
              </Typography>
              
              <Grid container spacing={4}>
                {/* Adults */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    p: 3, 
                    bgcolor: 'grey.50', 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="h6" gutterBottom color="primary.main" sx={{ mb: 3 }}>
                      מבוגרים
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <TextField
                        type="number"
                        value={people}
                        onChange={handlePeopleChange}
                        variant="outlined"
                        size="medium"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: 'primary.main' }} />
                            </InputAdornment>
                          ),
                          inputProps: { min: 1, max: 5 }
                        }}
                        sx={{ width: '150px' }}
                      />
                      <Typography variant="body1">
                        {people > 1 ? 'אנשים' : 'איש'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Children */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    p: 3, 
                    bgcolor: 'grey.50', 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="h6" gutterBottom color="primary.main" sx={{ mb: 2 }}>
                      ילדים
                    </Typography>
                    <FormControlLabel 
                      control={
                        <Checkbox 
                          checked={withChildren} 
                          onChange={handleWithChildrenChange} 
                          color="primary"
                        />
                      } 
                      label={
                        <Typography variant="body1">
                          מגיע עם ילדים?
                        </Typography>
                      }
                    />
                    
                    <Collapse in={withChildren}>
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                          type="number"
                          value={childrenCount}
                          onChange={handleChildrenCountChange}
                          variant="outlined"
                          size="medium"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <ChildCare sx={{ color: 'primary.main' }} />
                              </InputAdornment>
                            ),
                            inputProps: { min: 1, max: 5 }
                          }}
                          sx={{ width: '150px' }}
                        />
                        <Typography variant="body1">
                          {childrenCount > 1 ? 'ילדים' : 'ילד'}
                        </Typography>
                      </Box>
                    </Collapse>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        )}

        {/* Price Summary Section */}
        {selectedServices.length > 0 && (
          <Grid item xs={12}>
            <Box 
              sx={{ 
                mt: 4,
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: 3
              }}
            >
              {/* Header */}
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                  סיכום הזמנה
                </Typography>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  ₪{calculateTotalPrice()}
                </Typography>
              </Box>

              {/* Details */}
              <Box sx={{ bgcolor: 'rgba(0,0,0,0.1)', p: 4 }}>
                {/* Services */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
                    פירוט שירותים
                  </Typography>
                  {selectedServices.map(serviceId => {
                    const service = services.find(s => s.id === serviceId);
                    if (service) {
                      let priceText = '';
                      if (service.id === 'haircut') {
                        const totalPeople = people + (withChildren ? childrenCount : 0);
                        priceText = `₪${service.price} × ${totalPeople} = ₪${service.price * totalPeople}`;
                      } else {
                        priceText = `₪${service.price}${people > 1 ? ` × ${people} = ₪${service.price * people}` : ''}`;
                      }
                      
                      return (
                        <Box 
                          key={service.id} 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            py: 1
                          }}
                        >
                          <Typography sx={{ opacity: 0.9 }}>
                            {service.name}
                          </Typography>
                          <Typography fontWeight="500">
                            {priceText}
                          </Typography>
                        </Box>
                      );
                    }
                    return null;
                  })}
                </Box>

                {/* People Summary */}
                {(withChildren || people > 1) && (
                  <Box sx={{ 
                    pt: 3,
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      px: 2,
                      py: 1,
                      borderRadius: 2
                    }}>
                      <Person />
                      <Typography>
                        {people} {people > 1 ? 'אנשים' : 'איש'}
                      </Typography>
                    </Box>
                    {withChildren && childrenCount > 0 && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        px: 2,
                        py: 1,
                        borderRadius: 2
                      }}>
                        <ChildCare />
                        <Typography>
                          {childrenCount} {childrenCount > 1 ? 'ילדים' : 'ילד'}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
} 