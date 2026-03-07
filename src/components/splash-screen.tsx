
"use client"

import React, { useEffect } from 'react';
import Image from 'next/image';

/**
 * مكون شاشة الترحيب (Splash Screen)
 * يعرض أيقونة splash.png في منتصف الشاشة بخلفية بيضاء تماماً لمدة 2.5 ثانية.
 */
export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); // ثانيتين ونصف كما طلب المستخدم
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center overflow-hidden">
      <div className="relative animate-pulse">
        <Image 
          src="/splash.png" 
          alt="Careingo Icon" 
          width={120} 
          height={120} 
          className="object-contain"
          priority
        />
      </div>
      
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-primary/20 font-black text-[10px] tracking-[0.2em] uppercase">
          Artiatech Studio 2026
        </p>
      </div>
    </div>
  );
}
