'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '@/lib/api';
import AdminLoading from '@components/AdminLoading';

export default function ProfesionalLayout({ children }) {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const MIN_DELAY = 800;
    const start = Date.now();

    getMe().then(user => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_DELAY - elapsed);

      setTimeout(() => {
        if (!user || user.rol !== 'profesional') {
          router.replace('/login');
        } else {
          setCheckingAuth(false);
        }
      }, remaining);
    });
  }, [router]);

  if (checkingAuth) return <AdminLoading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="h-14 bg-[#1D4A74] text-white flex items-center px-6 shadow">
        <span className="font-semibold">CuidarTE · Profesional</span>
      </header>

      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
