'use client';

import React from 'react';

import { ErrorBoundary } from 'next/dist/client/components/error-boundary';

import { InferResponseType } from 'hono/client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { client } from '@/api';

interface AuthProviderProps {
  children: React.ReactNode;
}

// Infer the full response type from the API
type FullResponseType = InferResponseType<typeof client.api.auth.me.$get>;

type AuthContextType = Extract<
  FullResponseType,
  {
    name: string;
    email: string;
    id: string;
  }
>;

// Create a context with the successful response type or `null`
const AuthContext = React.createContext<AuthContextType>({
  name: '',
  email: '',
  id: '',
});

function AuthProviderInner({ children }: AuthProviderProps) {
  const query = useSuspenseQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await client.api.auth.me.$get();
      if (res.status === 401) {
        throw new Error('Not authenticated');
      }
      if (res.ok) {
        return res.json();
      }
      throw new Error('Failed to fetch user');
    },
    retry: 0,
  });
  return <AuthContext.Provider value={query.data}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div>
      <h1>Authentication Error</h1>
      <p>{error.message}</p>
      {error.digest && <p>{error.digest}</p>}
    </div>
  );
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <ErrorBoundary errorComponent={AuthError}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </ErrorBoundary>
  );
}
