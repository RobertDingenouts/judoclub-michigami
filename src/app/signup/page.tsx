'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] px-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#2a2a2a]">Registratie is tijdelijk uitgeschakeld</h1>
        <p className="text-sm text-gray-600">Ga terug naar de homepage.</p>
      </div>
    </div>
  );
}
