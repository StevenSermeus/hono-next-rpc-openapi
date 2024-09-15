'use client';

import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface ReactQueryProviderProps {
  children: React.ReactNode;
}

export default function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const [queryClient] = React.useState(() => new QueryClient({}));
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}