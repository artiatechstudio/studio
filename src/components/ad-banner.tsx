
"use client"

import React, { useEffect } from 'react';
import { Card } from './ui/card';
import { Megaphone } from 'lucide-react';

interface AdBannerProps {
  label?: string;
  className?: string;
  adSlot?: string;
}

/**
 * مكون مساحة إعلانية مفعل لـ Google AdSense.
 * لاستخدامه فعلياً، استبدل data-ad-client برقمك الخاص و data-ad-slot برقم الوحدة الإعلانية.
 */
export function AdBanner({ label = "إعلان ممول", className, adSlot = "YYYYYYYYYY" }: AdBannerProps) {
  useEffect(() => {
    try {
      // إطلاق طلب الإعلان بمجرد تحميل المكون
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.warn("AdSense push error:", e);
    }
  }, []);

  return (
    <Card className={`bg-secondary/30 border-2 border-dashed border-muted-foreground/10 flex flex-col items-center justify-center p-2 rounded-2xl min-h-[100px] overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 text-muted-foreground/40 font-black text-[8px] mb-2">
        <Megaphone size={10} />
        <span>{label}</span>
      </div>
      
      {/* AdSense Unit Container */}
      <div className="w-full overflow-hidden flex justify-center">
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
             data-ad-slot={adSlot}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      </div>
    </Card>
  );
}
