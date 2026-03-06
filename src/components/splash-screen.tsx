
"use client"

import React, { useEffect } from 'react';

/**
 * مكون شاشة الترحيب (Splash Screen)
 * يعرض فيديو splash.mp4 بملء الشاشة كأول شيء يراه المستخدم لمدة 8 ثوانٍ.
 */
export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 8000); // 8 ثواني كما طلبت
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
      <video 
        autoPlay 
        muted 
        playsInline 
        className="absolute w-full h-full object-cover"
      >
        <source src="/splash.mp4" type="video/mp4" />
      </video>
      <div className="absolute bottom-10 left-0 right-0 text-center text-white/20 font-black text-[10px] tracking-widest uppercase pointer-events-none">
        Artiatech Studio 2026
      </div>
    </div>
  );
}
