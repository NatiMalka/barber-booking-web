'use client';

import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Drawer, 
  List, 
  ListItemButton,
  ListItemIcon, 
  ListItemText,
  Divider,
  Container,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Home, 
  CalendarMonth, 
  Dashboard, 
  Login, 
  Logout 
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser } from '@/firebase/services/authService';

interface NavItem {
  text: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => Promise<void> | void;
}

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const handleLogout = async () => {
    try {
      // Clear barber admin from localStorage
      localStorage.removeItem('isBarberAdmin');
      
      // If user is logged in with Firebase, log them out
      if (user) {
        await logoutUser();
      }
      
      setDrawerOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems: NavItem[] = [
    { text: 'דף הבית', icon: <Home />, href: '/' },
    { text: 'הזמן תור', icon: <CalendarMonth />, href: '/client/booking' },
  ];

  const adminItems: NavItem[] = [
    { text: 'לוח בקרה', icon: <Dashboard />, href: '/admin/dashboard' },
  ];

  const authItems: NavItem[] = user || isAdmin
    ? [{ text: 'התנתק', icon: <Logout />, onClick: handleLogout }]
    : [{ text: 'התחבר', icon: <Login />, href: '/auth/login' }];

  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" component="div" color="primary">
          מספרת בר ארזי
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={Link}
            href={item.href || ''}
            selected={pathname === item.href}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
      {isAdmin && (
        <>
          <Divider />
          <List>
            {adminItems.map((item) => (
              <ListItemButton
                key={item.text}
                component={Link}
                href={item.href || ''}
                selected={pathname === item.href}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </>
      )}
      <Divider />
      <List>
        {authItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={item.href ? Link : 'button'}
            href={item.href}
            onClick={item.onClick}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
              flexGrow: { xs: 0, md: 1 }
            }}
          >
            מספרת בר ארזי
          </Typography>

          {isMobile ? (
            <>
              <Typography
                variant="h6"
                component={Link}
                href="/"
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  flexGrow: 1,
                  fontWeight: 700,
                  color: 'white',
                  textDecoration: 'none',
                }}
              >
                מספרת בר ארזי
              </Typography>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
            </>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexGrow: 0 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.text}
                    component={Link}
                    href={item.href || ''}
                    color="inherit"
                    sx={{ mx: 1 }}
                    startIcon={item.icon}
                  >
                    {item.text}
                  </Button>
                ))}
                
                {isAdmin && adminItems.map((item) => (
                  <Button
                    key={item.text}
                    component={Link}
                    href={item.href || ''}
                    color="inherit"
                    sx={{ mx: 1 }}
                    startIcon={item.icon}
                  >
                    {item.text}
                  </Button>
                ))}
                
                {authItems.map((item) => (
                  <Button
                    key={item.text}
                    component={item.href ? Link : 'button'}
                    href={item.href}
                    onClick={item.onClick}
                    color="inherit"
                    sx={{ mx: 1 }}
                    startIcon={item.icon}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            </>
          )}
        </Toolbar>
      </Container>
      
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerContent}
      </Drawer>
    </AppBar>
  );
} 