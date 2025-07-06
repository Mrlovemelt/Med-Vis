"use client";

import { AppProvider } from '@/lib/context/AppContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
} 