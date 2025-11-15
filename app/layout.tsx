import type { Metadata } from 'next';
import './globals.css';
import './style.css';
import { ThemeProvider } from 'next-themes';
import AuthProvider from '@/components/AuthProvider';
import Header from '@/components/Header';

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
      <body className={`outfit-thin antialiased min-h-screen`}>
        <ThemeProvider attribute="class" enableSystem={true} defaultTheme="system">
          <AuthProvider>
            <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
            <Header />
            <div className="">{children}</div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
