
"use client"

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

/**
 * مكون شاشة الترحيب (Splash Screen)
 * تم إيقاف تشغيل الصوت التلقائي لمنع انهيار التطبيق في وضع PWA Standalone.
 */
export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-start overflow-hidden p-0 pt-16 md:pt-24">
      <div className="flex flex-col items-center gap-0 w-full relative">
        <div className="relative w-full aspect-square max-w-md animate-float">
          <Image 
            src="/splash.png" 
            alt="Careingo Icon" 
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
      
      <div className="absolute bottom-12 left-0 right-0 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-black/10 font-black text-[8px] tracking-[0.2em] uppercase">
            Artiatech Studio 2026
          </p>
        </div>
      </div>
    </div>
  );
}
