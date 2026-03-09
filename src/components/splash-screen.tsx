
"use client"

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sparkles, Maximize } from 'lucide-react';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [showEntry, setShowEntry] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const requestFull = useCallback(async () => {
    try {
      const doc = document.documentElement as any;
      const request = doc.requestFullscreen || 
                      doc.mozRequestFullScreen || 
                      doc.webkitRequestFullscreen || 
                      doc.msRequestFullscreen;
      if (request) {
        await request.call(doc);
      }
    } catch (e) {
      console.warn("Fullscreen request failed", e);
    }
  }, []);

  const handleStartApp = async () => {
    await requestFull();
    setShowEntry(false);
    setTimeout(() => {
      onComplete();
    }, 2500);
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center overflow-hidden" dir="rtl">
      {showEntry ? (
        <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-700 px-6 w-full max-w-sm text-center">
          <div className="text-8xl animate-float mb-4">🐱</div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-primary">مرحباً بك في كارينجو</h1>
            <p className="text-muted-foreground font-bold">رفيقك الذكي لرحلة التغيير</p>
          </div>
          <Button 
            onClick={handleStartApp}
            className="h-16 w-full rounded-2xl bg-primary hover:bg-primary/90 text-xl font-black shadow-2xl shadow-primary/20 gap-3 group"
          >
            <Sparkles className="group-hover:rotate-12 transition-transform" />
            ابدأ تطوير ذاتك
          </Button>
          <p className="text-[10px] text-muted-foreground/60 font-bold">سيتم فتح التطبيق في وضع ملء الشاشة لأفضل تجربة</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-0 w-full relative animate-in fade-in duration-500">
            <div className="relative w-64 h-64 md:w-80 md:h-80 animate-float">
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
        </>
      )}

      {/* زر إعادة ملء الشاشة في حال الخروج المفاجئ (يظهر فقط بعد بدء التطبيق) */}
      {!showEntry && !isFullscreen && (
        <Button 
          onClick={requestFull}
          size="icon"
          className="fixed top-4 right-4 z-[10000] rounded-full bg-primary/20 text-primary backdrop-blur-md border border-primary/20"
        >
          <Maximize size={18} />
        </Button>
      )}
    </div>
  );
}
