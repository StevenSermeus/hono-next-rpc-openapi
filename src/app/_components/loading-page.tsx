'use client';

import React from 'react';

import Ripple from '@/components/magicui/ripple';

export default function LoadingPage({ text = 'Loading ...' }: { text?: string }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center md:shadow-xl">
      <p className="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-white">
        {text}
      </p>
      <Ripple />
    </div>
  );
}
