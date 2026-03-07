
"use client"

import React, { useState, useEffect } from 'react';
import { SplashScreen } from './splash-screen';

/**
 * مكون غلاف التطبيق (App Wrapper)
 * يضمن تشغيل شاشة الترحيب أولاً ويمنع خطأ Hydration عبر التأكد من Mount.
 */
export function AppWrapper({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!isReady) {
    return <SplashScreen onComplete={() => setIsReady(true)} />;
  }

  return <>{children}</>;
}
