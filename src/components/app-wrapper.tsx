
"use client"

import React, { useState, useEffect } from 'react';
import { SplashScreen } from './splash-screen';

/**
 * مكون غلاف التطبيق (App Wrapper)
 * يقوم بتسجيل Service Worker لضمان استقرار تطبيق PWA ومنع إغلاقه المفاجئ.
 */
export function AppWrapper({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // تسجيل الـ Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          },
          (err) => {
            console.log('ServiceWorker registration failed: ', err);
          }
        );
      });
    }
  }, []);

  if (!mounted) return null;

  if (!isReady) {
    return <SplashScreen onComplete={() => setIsReady(true)} />;
  }

  return <>{children}</>;
}
