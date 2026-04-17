
"use client"

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // انتقال تلقائي بعد ثانيتين لإنهاء الإزعاج
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center overflow-hidden" dir="rtl">
      <div className="flex flex-col items-center gap-0 w-full relative animate-in fade-in zoom-in duration-700">
        <div className="relative w-48 h-48 animate-float">
          <Image src="/logo.png" alt="Careingo Logo" fill className="object-contain" priority />
        </div>
      </div>
      <div className="absolute bottom-12 left-0 right-0 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-black/10 font-black text-[8px] tracking-[0.2em] uppercase">Artiatech Studio 2026</p>
        </div>
      </div>
    </div>
  );
}
