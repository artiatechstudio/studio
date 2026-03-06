
"use client"

import React, { useState, useEffect } from 'react';

/**
 * مكون شاشة الترحيب (Splash Screen)
 * يعرض فيديو splash.mp4 عند أول تحميل للتطبيق في الجلسة.
 */
export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // نتحقق مما إذا كان قد تم عرض السبلاش في هذه الجلسة
    const hasSeenSplash = sessionStorage.getItem('splash_shown');
    
    if (!hasSeenSplash) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem('splash_shown', 'true');
      }, 4000); // عرض الفيديو لمدة 4 ثوانٍ
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-primary flex items-center justify-center overflow-hidden">
      <video 
        autoPlay 
        muted 
        playsInline 
        className="w-full h-full object-cover"
        onEnded={() => setIsVisible(false)}
      >
        <source src="/splash.mp4" type="video/mp4" />
      </video>
      <div className="absolute bottom-10 left-0 right-0 text-center text-white/50 font-black text-xs">
        Artiatech Studio 2026
      </div>
    </div>
  );
}
