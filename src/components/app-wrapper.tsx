"use client"

import React, { useState, useEffect } from 'react';
import { SplashScreen } from './splash-screen';

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // تسجيل الـ Service Worker لضمان عمل الـ PWA بشكل صحيح
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('SW registered successfully:', registration.scope);
          },
          (err) => {
            console.error('SW registration failed:', err);
          }
        );
      });
    }
  }, []);

  if (!mounted) return <div className="bg-white min-h-screen" />;

  if (!isReady) {
    return <SplashScreen onComplete={() => setIsReady(true)} />;
  }

  return <>{children}</>;
}
