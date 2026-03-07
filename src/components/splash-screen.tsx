
"use client"

import React, { useEffect } from 'react';
import Image from 'next/image';

/**
 * مكون شاشة الترحيب (Splash Screen)
 * يعرض أيقونة splash.png بعرض الشاشة مرفوعة للأعلى قليلاً، مع إزالة كافة النصوص.
 */
export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); // ثانيتين ونصف
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-start overflow-hidden p-0 pt-20">
      <div className="flex flex-col items-center gap-0 w-full relative">
        <div className="relative w-full aspect-square max-w-md">
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
        <p className="text-black/10 font-black text-[8px] tracking-[0.2em] uppercase">
          Artiatech Studio 2026
        </p>
      </div>
    </div>
  );
}
