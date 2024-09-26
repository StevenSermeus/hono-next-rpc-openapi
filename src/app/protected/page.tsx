'use client';

import React from 'react';

import { useQuery } from '@tanstack/react-query';

import { $api } from '@/api/react';

export default function Page() {
  const query = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await $api.v1.auth.me.$get();
      if (res.ok) {
        return await res.json();
      }
      throw new Error((await res.json()).message);
    },
  });

  return (
    <div>
      {query.isLoading && <div>Loading...</div>}
      {query.isError && <div>{query.error.message}</div>}
      {query.isSuccess && <div>{query.data.name}</div>}
    </div>
  );
}
