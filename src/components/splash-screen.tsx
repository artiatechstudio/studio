
"use client"

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

/**
 * مكون شاشة الترحيب المحدثة (Splash Screen)
 * تتضمن الآن "شاشة دخول" تطلب من المستخدم الضغط لبدء الرحلة وتفعيل ملء الشاشة.
 */
export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [showEntry, setShowEntry] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartApp = () => {
    // محاولة تفعيل وضع ملء الشاشة عند الضغط (لأغراض أمنية يجب أن يكون بطلب مستخدم)
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
          console.log("Full screen denied or not supported");
        });
      }
    } catch (e) {
      console.warn("Fullscreen error", e);
    }

    setShowEntry(false);
    setIsAnimating(true);

    // مؤقت للانتقال للصفحة الرئيسية بعد 2.5 ثانية من ظهور الشعار
    setTimeout(() => {
      onComplete();
    }, 2500);
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center overflow-hidden" dir="rtl">
      {showEntry ? (
        <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-700">
          <div className="text-8xl animate-float mb-4">🐱</div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-primary">مرحباً بك في كارينجو</h1>
            <p className="text-muted-foreground font-bold">رفيقك الذكي لرحلة التغيير</p>
          </div>
          <Button 
            onClick={handleStartApp}
            className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-xl font-black shadow-2xl shadow-primary/20 gap-3 group"
          >
            <Sparkles className="group-hover:rotate-12 transition-transform" />
            ابدأ تطوير ذاتك
          </Button>
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
    </div>
  );
}
