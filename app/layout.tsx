import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import type React from 'react';
import BackgroundMusic from '@/lib/client/components/background-music';
import { AuthProvider } from '@/lib/client/contexts/auth-context';
import '@/styles/globals.css';
import TanstackProvider from '@/lib/client/providers/tanstack-provider';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  description:
    'Aprenda a magia do desenvolvimento web na escola mais prestigiada da feitiçaria digital.',
  icons: [{ rel: 'icon', url: '/image/favicon.ico' }],
  title: 'Escola de Magia de Web ⚡',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={`${GeistSans.className} dark`} lang='pt-BR'>
      <body className='antialiased min-h-screen bg-gradient-to-br from-background via-card to-background scrollbar-hide'>
        <Toaster position='top-right' richColors />

        <TanstackProvider>
          <AuthProvider>{children}</AuthProvider>
        </TanstackProvider>

        <BackgroundMusic />
      </body>
    </html>
  );
}
