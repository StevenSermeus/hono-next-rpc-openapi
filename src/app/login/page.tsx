import { Suspense } from 'react';

import { LoginSkeleton } from '@/components/loading/login-loading';
import Login from '@/components/login';

export default function LoginPage() {
  return (
    <div className="flexx@ items-center justify-center">
      <Suspense fallback={<LoginSkeleton />}>
        <Login />
      </Suspense>
    </div>
  );
}
