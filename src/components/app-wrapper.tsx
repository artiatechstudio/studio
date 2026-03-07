
"use client"

import React, { useState, useEffect } from 'react';
import { SplashScreen } from './splash-screen';

/**
 * مكون غلاف التطبيق (App Wrapper)
 * يضمن تشغيل شاشة الترحيب أولاً قبل السماح لأي جزء من التطبيق بالتحميل.
 * هذا يفصل عملية العرض الترحيبي عن تشغيل منطق البرنامج و Firebase.
 */
export function AppWrapper({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  if (!isReady) {
    return <SplashScreen onComplete={() => setIsReady(true)} />;
  }

  return <>{children}</>;
}
