import React from 'react';

import dynamic from 'next/dynamic';

import LoadingPage from '@/components/loading-page';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const AuthProvider = dynamic(() => import('@/providers/auth'), {
    ssr: false,
    loading: () => <LoadingPage />,
  });
  return <AuthProvider>{children}</AuthProvider>;
}
