import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ReactNode } from 'react';
import { APP_NAME } from '@/lib/config';
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register';

export const metadata: Metadata = {
  title: APP_NAME,
  description:
    'Installable collaboration campus for SSE students to study, build, and grow together.',
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME
  },
  icons: {
    icon: ['/icon-192.svg', '/icon-512.svg'],
    apple: ['/icon-192.svg']
  }
};

export const viewport: Viewport = {
  themeColor: '#0b4f6c',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
