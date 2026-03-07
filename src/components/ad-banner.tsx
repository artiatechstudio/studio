
"use client"

import React, { useEffect } from 'react';
import { Card } from './ui/card';
import { Megaphone } from 'lucide-react';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';

interface AdBannerProps {
  label?: string;
  className?: string;
  adSlot?: string;
}

/**
 * مكون مساحة إعلانية مفعل لـ Google AdSense.
 * يختفي تلقائياً للمستخدمين البريميوم.
 * تمت إضافة معالجة أخطاء لمنع "Failed to fetch" في حالة حظر الإعلانات.
 */
export function AdBanner({ label = "إعلان ممول", className, adSlot = "8823456789" }: AdBannerProps) {
  const { user } = useUser();
  const { database } = useFirebase();
  
  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && userData?.isPremium !== 1) {
        if ((window as any).adsbygoogle) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        }
      }
    } catch (e) {
      // تجاهل أخطاء جلب الإعلانات الصامتة
      console.warn("AdSense push error (usually ad-blocker related):", e);
    }
  }, [userData]);

  if (userData?.isPremium === 1) return null;

  return (
    <Card className={`bg-secondary/30 border-2 border-dashed border-muted-foreground/10 flex flex-col items-center justify-center p-2 rounded-2xl min-h-[100px] overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 text-muted-foreground/40 font-black text-[8px] mb-2">
        <Megaphone size={10} />
        <span>{label}</span>
      </div>
      
      <div className="w-full overflow-hidden flex justify-center">
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-2754396305908181"
             data-ad-slot={adSlot}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      </div>
    </Card>
  );
}
