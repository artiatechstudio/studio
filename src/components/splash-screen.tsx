
"use client"

import React, { useEffect } from 'react';
import Image from 'next/image';

/**
 * مكون شاشة الترحيب (Splash Screen)
 * يعرض أيقونة splash.png مع كلمة "تقدم" تحتها بشكل موسط ومزاح للأعلى قليلاً.
 */
export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); // ثانيتين ونصف
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center overflow-hidden p-0">
      <div className="flex flex-col items-center gap-4 animate-pulse -translate-y-16">
        <div className="relative w-44 h-44 md:w-60 md:h-56">
          <Image 
            src="/splash.png" 
            alt="Careingo Icon" 
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-primary tracking-tighter">تقدم</h1>
      </div>
      
      <div className="absolute bottom-12 left-0 right-0 text-center">
        <p className="text-primary/20 font-black text-[10px] tracking-[0.2em] uppercase">
          Artiatech Studio 2026
        </p>
      </div>
    </div>
  );
}
