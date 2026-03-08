"use client"

import React, { useState, useEffect } from 'react';
import { SplashScreen } from './splash-screen';

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="bg-white min-h-screen" />;

  if (!isReady) {
    return <SplashScreen onComplete={() => setIsReady(true)} />;
  }

  return <>{children}</>;
}
