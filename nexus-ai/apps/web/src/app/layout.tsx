import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'NexusAI — Enterprise AI Business Operations & CRM Platform',
  description: 'AI-powered CRM, sales assistance, document intelligence, and workflow automation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased selection:bg-primary selection:text-white">
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
