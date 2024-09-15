import React from 'react';

import dynamic from 'next/dynamic';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const AuthProvider = dynamic(() => import('@/providers/auth'), {
    ssr: false,
    loading: () => <>Loading ...</>,
  });
  return <AuthProvider>{children}</AuthProvider>;
}
