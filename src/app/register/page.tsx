import { Suspense } from 'react';

import Register from '@/components/register';
import { RegisterSkeleton } from '@/components/register-loading';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center">
      <Suspense fallback={<RegisterSkeleton />}>
        <Register />
      </Suspense>
    </div>
  );
}
