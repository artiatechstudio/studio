
"use client"

import React, { useState, useEffect } from 'react';
import { Lock, Lightbulb, CheckCircle2, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playSound } from '@/lib/sounds';
import Link from 'next/link';

interface StageNodeProps {
  id: number;
  status: 'locked' | 'open' | 'completed' | 'cooldown';
  trackType: string;
  offset: number;
}

export function StageNode({ id, status, trackType, offset }: StageNodeProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (status !== 'cooldown') return;

    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        clearInterval(timer);
        window.location.reload(); // إعادة التحميل لفتح المرحلة تلقائياً عند انتهاء الوقت
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
        setTimeLeft(`${hours}:${minutes}:${seconds}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  const Icon = status === 'completed' ? CheckCircle2 : status === 'open' ? Lightbulb : status === 'cooldown' ? Timer : Lock;
  
  const handleOnClick = (e: React.MouseEvent) => {
    if (status === 'locked' || status === 'cooldown') {
      e.preventDefault();
      playSound('click');
      return;
    }
    playSound('click');
  };

  return (
    <div 
      className="flex flex-col items-center gap-2 relative z-10"
      style={{ transform: `translateX(${offset}px)` }}
    >
      <Link 
        href={(status === 'locked' || status === 'cooldown') ? '#' : `/track/${trackType}/stage/${id}`}
        onClick={handleOnClick}
        className={cn(
          "w-20 h-20 rounded-[2.5rem] flex items-center justify-center transition-all duration-300 shadow-xl relative",
          status === 'completed' && "bg-green-500 text-white hover:scale-110 shadow-green-500/20",
          status === 'open' && "bg-primary text-white hover:scale-110 animate-pulse ring-8 ring-primary/20 shadow-primary/20",
          status === 'cooldown' && "bg-orange-100 text-orange-600 border-4 border-orange-500/30 cursor-wait",
          status === 'locked' && "bg-secondary text-muted-foreground cursor-not-allowed grayscale"
        )}
      >
        <Icon size={32} className={cn(status === 'cooldown' && "animate-spin-slow")} />
        {status === 'completed' && (
          <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md border-2 border-green-500">
            <CheckCircle2 size={16} className="text-green-500" />
          </div>
        )}
      </Link>
      
      <div className="flex flex-col items-center">
        <div className={cn(
          "font-black text-lg",
          status === 'locked' ? "text-muted-foreground" : 
          status === 'cooldown' ? "text-orange-600" : "text-primary"
        )}>
          اليوم {id}
        </div>
        
        {status === 'cooldown' && (
          <div className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full mt-1 shadow-sm flex items-center gap-1">
            <Timer size={10} />
            يفتح بعد {timeLeft}
          </div>
        )}
      </div>
    </div>
  );
}
