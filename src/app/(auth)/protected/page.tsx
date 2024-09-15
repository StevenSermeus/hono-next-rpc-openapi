'use client';

import React from 'react';

import { useAuth } from '@/providers/auth';

export default function Page() {
  const user = useAuth();
  return (
    <div>
      <h1>Protected Page</h1>
      <p>Welcome, {user?.name}!</p>
    </div>
  );
}
