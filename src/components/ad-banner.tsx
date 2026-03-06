
"use client"

import React from 'react';
import { Card } from './ui/card';
import { Megaphone } from 'lucide-react';

interface AdBannerProps {
  label?: string;
  className?: string;
}

/**
 * مكون تجريبي لمساحة إعلانية.
 * في تطبيق الويب الحقيقي، سيتم وضع كود Google AdSense هنا.
 */
export function AdBanner({ label = "مساحة إعلانية", className }: AdBannerProps) {
  return (
    <Card className={`bg-secondary/30 border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center p-4 rounded-2xl min-h-[100px] overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 text-muted-foreground/40 font-black text-xs">
        <Megaphone size={14} />
        <span>{label}</span>
      </div>
      <p className="text-[10px] text-muted-foreground/20 mt-1">Google AdSense / AdMob Area</p>
    </Card>
  );
}
