'use client';

import React, { useEffect } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { $api } from '@/api';
import LoadingPage from '@/components/loading-page';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  async function refreshRedirect() {
    try {
      const pending = $api.v1.auth.token.renew.$get();
      const redirect = searchParams.get('redirect') ?? '/';
      const res = await pending;
      if (res.status === 200) {
        router.push(redirect);
        return;
      }
      router.push('/login');
    } catch (e) {
      router.push('/login');
    }
  }

  useEffect(() => {
    refreshRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LoadingPage text="Redirecting ..." />;
}
