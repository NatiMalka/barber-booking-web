'use client';

import { Box, Container, Typography, Grid, Card, CardContent, useTheme } from '@mui/material';
import { ContentCut, Brush, Straighten, Style } from '@mui/icons-material';

interface ServiceProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
}

const servicesList: ServiceProps[] = [
  {
    title: 'תספורת גברים',
    description: 'תספורת מקצועית לגברים, כולל שטיפה וסידור.',
    icon: <ContentCut fontSize="large" />,
    duration: '45 דקות',
  },
  {
    title: 'תספורת ילדים',
    description: 'תספורת מותאמת לילדים עד גיל 12.',
    icon: <ContentCut fontSize="large" />,
    duration: '30 דקות',
  },
  {
    title: 'עיצוב זקן',
    description: 'עיצוב וטיפוח זקן מקצועי.',
    icon: <Straighten fontSize="large" />,
    duration: '20 דקות',
  },
  {
    title: 'תספורת + עיצוב זקן',
    description: 'שירות משולב הכולל תספורת ועיצוב זקן.',
    icon: <Style fontSize="large" />,
    duration: '60 דקות',
  },
];

function ServiceCard({ title, description, icon, duration }: ServiceProps) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ color: 'primary.main', mr: 2 }}>{icon}</Box>
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Services() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        py: 6,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 4 }}
        >
          השירותים שלנו
        </Typography>

        <Grid container spacing={3}>
          {servicesList.map((service) => (
            <Grid item key={service.title} xs={12} sm={6} md={3}>
              <ServiceCard {...service} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
} 