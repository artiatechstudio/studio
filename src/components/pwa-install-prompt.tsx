
"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone } from 'lucide-react';
import { playSound } from '@/lib/sounds';

/**
 * مكون يظهر للمستخدم لحثه على تثبيت التطبيق على جهازه (PWA).
 */
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // منع المتصفح من إظهار التنبيه التلقائي الافتراضي
      e.preventDefault();
      setDeferredPrompt(e);
      // إظهار المكون المخصص لدينا بعد 5 ثوانٍ من دخول الموقع
      setTimeout(() => setIsVisible(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // إخفاء التنبيه إذا تم تثبيت التطبيق بالفعل
    window.addEventListener('appinstalled', () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    playSound('click');
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] animate-in fade-in slide-in-from-bottom-10 duration-500" dir="rtl">
      <div className="bg-primary text-white p-4 rounded-3xl shadow-2xl border-2 border-white/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Smartphone size={20} />
          </div>
          <div className="text-right">
            <p className="font-black text-xs">ثبّت تطبيق كارينجو</p>
            <p className="text-[9px] font-bold opacity-80 leading-tight">استمتع بتجربة أسرع وإشعارات فورية على هاتفك 🐱✨</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleInstall} 
            className="h-9 px-4 bg-white text-primary hover:bg-white/90 font-black text-[10px] rounded-xl shadow-lg shrink-0"
          >
            <Download size={14} className="ml-1" /> تثبيت الآن
          </Button>
          <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-white/10 rounded-full">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
