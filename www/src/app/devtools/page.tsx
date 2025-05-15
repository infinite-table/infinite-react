'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DevTools() {
  const router = useRouter();

  useEffect(() => {
    router.push('/docs/devtools');
  }, []);
  return null;
}
