import { Suspense } from 'react';

import Login from '@/components/login';
import { LoginSkeleton } from '@/components/login-loading';

export default function LoginPage() {
  return (
    <div className="flexx@ items-center justify-center">
      <Suspense fallback={<LoginSkeleton />}>
        <Login />
      </Suspense>
    </div>
  );
}
