
"use client"

import React, { useEffect } from 'react';

/**
 * مكون شاشة الترحيب (Splash Screen)
 * يعرض الفيديو splash.mp4 في منتصف الشاشة بحجم محتوى (object-contain) لضمان ظهوره كاملاً.
 */
export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 8000); // 8 ثواني كما طلبت
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden p-6">
      <div className="relative w-full h-full max-w-sm max-h-[80vh] flex items-center justify-center">
        <video 
          autoPlay 
          muted 
          playsInline 
          className="w-full h-full object-contain rounded-3xl shadow-2xl"
        >
          <source src="/splash.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="absolute bottom-10 left-0 right-0 text-center text-white/20 font-black text-[10px] tracking-widest uppercase pointer-events-none">
        Artiatech Studio 2026
      </div>
    </div>
  );
}
