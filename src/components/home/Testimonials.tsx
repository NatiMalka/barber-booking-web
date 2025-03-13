'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Avatar, Rating, useTheme, IconButton } from '@mui/material';
import { ArrowBack, ArrowForward, Person } from '@mui/icons-material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface TestimonialProps {
  name: string;
  rating: number;
  comment: string;
  avatar: string;
  date: string;
}

const testimonialsList: TestimonialProps[] = [
  {
    name: 'מיכל כהן',
    rating: 5,
    comment: 'בר הוא ספר מדהים! הוא הבין בדיוק מה רציתי והתוצאה הייתה מושלמת. האווירה במספרה נעימה והשירות מעולה. ממליצה בחום!',
    avatar: '/images/testimonials/avatar1.jpg',
    date: '15.06.2023',
  },
  {
    name: 'דניאל לוי',
    rating: 5,
    comment: 'אני הולך לבר כבר שנתיים ותמיד יוצא מרוצה. הוא מקצועי, אדיב ותמיד נותן המלצות טובות. המספרה נקייה ומסודרת והמחירים הוגנים.',
    avatar: '/images/testimonials/avatar2.jpg',
    date: '03.04.2023',
  },
  {
    name: 'שירה אברהם',
    rating: 4,
    comment: 'קיבלתי שירות מעולה במספרה של בר. הצבע שעשיתי יצא בדיוק כמו שרציתי והתספורת מחזיקה מעמד זמן רב. ממליצה!',
    avatar: '/images/testimonials/avatar3.jpg',
    date: '22.02.2023',
  },
  {
    name: 'יוסי מזרחי',
    rating: 5,
    comment: 'בר הוא ספר מקצועי ברמה הגבוהה ביותר. הוא מקשיב ללקוחות שלו ונותן תוצאות מעולות. אני ממליץ עליו לכל מי שמחפש ספר טוב.',
    avatar: '/images/testimonials/avatar4.jpg',
    date: '10.01.2023',
  },
  {
    name: 'רונית שמעוני',
    rating: 5,
    comment: 'עשיתי החלקה אצל בר והתוצאה הייתה מדהימה! השיער שלי נראה בריא וחלק. השירות היה מעולה והאווירה במספרה נעימה מאוד.',
    avatar: '/images/testimonials/avatar5.jpg',
    date: '05.12.2022',
  },
];

function TestimonialCard({ name, rating, comment, avatar, date }: TestimonialProps) {
  const [imageError, setImageError] = useState(false);
  const theme = useTheme();
  
  return (
    <Paper
      elevation={2}
      sx={{
        p: 4,
        m: 2,
        borderRadius: 4,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {imageError ? (
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mb: 2,
            border: '3px solid',
            borderColor: 'primary.main',
            bgcolor: 'primary.light',
          }}
        >
          <Person fontSize="large" />
        </Avatar>
      ) : (
        <Avatar
          src={avatar}
          alt={name}
          sx={{
            width: 80,
            height: 80,
            mb: 2,
            border: '3px solid',
            borderColor: 'primary.main',
          }}
          onError={() => setImageError(true)}
        />
      )}
      <Typography variant="h6" component="h3" gutterBottom>
        {name}
      </Typography>
      <Rating value={rating} readOnly precision={0.5} sx={{ mb: 2 }} />
      <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
        "{comment}"
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {date}
      </Typography>
    </Paper>
  );
}

export default function Testimonials() {
  const theme = useTheme();
  const [slidesToShow, setSlidesToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 960) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const SlickArrow = ({ direction, onClick }: { direction: 'next' | 'prev'; onClick?: () => void }) => (
    <IconButton
      onClick={onClick}
      sx={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
        ...(direction === 'next'
          ? { right: { xs: -5, md: -20 } }
          : { left: { xs: -5, md: -20 } }),
      }}
    >
      {direction === 'next' ? <ArrowForward /> : <ArrowBack />}
    </IconButton>
  );

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    nextArrow: <SlickArrow direction="next" />,
    prevArrow: <SlickArrow direction="prev" />,
    rtl: true,
  };

  return (
    <Box
      component="section"
      sx={{
        py: 8,
        backgroundColor: theme.palette.mode === 'light' ? 'grey.100' : 'grey.900',
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 2 }}
        >
          לקוחות ממליצים
        </Typography>
        <Typography
          variant="h6"
          component="p"
          align="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}
        >
          מה הלקוחות שלנו אומרים על החוויה במספרת בר ארזי
        </Typography>

        <Box sx={{ mx: { xs: 1, md: 4 } }}>
          <Slider {...settings}>
            {testimonialsList.map((testimonial, index) => (
              <div key={index}>
                <TestimonialCard {...testimonial} />
              </div>
            ))}
          </Slider>
        </Box>
      </Container>
    </Box>
  );
} 