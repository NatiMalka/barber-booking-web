import './globals.css';
import { Metadata } from 'next';
import { Rubik, Heebo } from 'next/font/google';
import ThemeRegistry from '@/utils/ThemeRegistry';
import I18nProvider from '@/locales/i18nProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/utils/ScrollToTop';
import { Box } from '@mui/material';

const rubik = Rubik({ subsets: ['hebrew', 'latin'] });
const heebo = Heebo({ subsets: ['hebrew', 'latin'] });

export const metadata: Metadata = {
  title: 'מספרת בר ארזי - הזמנת תורים',
  description: 'מערכת הזמנת תורים למספרת בר ארזי',
  other: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={`${rubik.className} ${heebo.className}`}>
        <ThemeRegistry>
          <I18nProvider>
            <ScrollToTop />
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <Box component="main" sx={{ flexGrow: 1 }}>
                {children}
              </Box>
              <Footer />
            </Box>
          </I18nProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
