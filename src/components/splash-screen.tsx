
"use client"

import React, { useEffect } from 'react';

/**
 * مكون شاشة الترحيب (Splash Screen)
 * يعرض الفيديو splash.mp4 في منتصف الشاشة بخلفية متدرجة (أبيض وبنفسجي) لتغطية الحواف.
 */
export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 8000); // 8 ثواني كما طلبت
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-white via-purple-50 to-primary/10 flex items-center justify-center overflow-hidden p-4">
      <div className="relative w-full h-full max-w-sm max-h-[85vh] flex items-center justify-center">
        {/* الحاوية الخلفية لإكمال انكسار الفيديو */}
        <div className="absolute inset-0 bg-white/40 blur-3xl rounded-full scale-110 -z-10" />
        
        <video 
          autoPlay 
          muted 
          playsInline 
          className="w-full h-full object-contain rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-8 border-white/50"
        >
          <source src="/splash.mp4" type="video/mp4" />
        </video>
      </div>
      
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
          <p className="text-primary/30 font-black text-[10px] tracking-[0.2em] uppercase">
            Artiatech Studio 2026
          </p>
        </div>
      </div>
    </div>
  );
}
