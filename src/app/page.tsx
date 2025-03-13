import { Box } from '@mui/material';
import Hero from '@/components/home/Hero';
import Services from '@/components/home/Services';
import Contact from '@/components/home/Contact';

export default function Home() {
  return (
    <Box>
      <Hero />
      <Services />
      <Contact />
    </Box>
  );
}
