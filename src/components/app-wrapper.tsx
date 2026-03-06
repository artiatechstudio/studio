
"use client"

import React, { useState, useEffect } from 'react';
import { SplashScreen } from './splash-screen';

/**
 * مكون غلاف التطبيق (App Wrapper)
 * يضمن تشغيل الفيديو أولاً لمدة 8 ثوانٍ قبل السماح لأي جزء من التطبيق بالتحميل.
 */
export function AppWrapper({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  if (!isReady) {
    return <SplashScreen onComplete={() => setIsReady(true)} />;
  }

  return <>{children}</>;
}
