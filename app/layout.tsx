import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import AuthProvider from '@/components/AuthProvider';
import Header from '@/components/Header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Weather App',
  description:
    'Real-time weather application with geolocation and beautiful UI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <ThemeProvider attribute="class" enableSystem={true} defaultTheme="system">
          <AuthProvider>
            <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
            <Header />
            <div className="pt-16">{children}</div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
