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
        clearInterval(timer);
        window.location.reload();
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
  
  return (
    <div 
      className="flex flex-col items-center gap-1 relative z-10"
      style={{ transform: `translateX(${offset}px)` }}
    >
      <Link 
        href={(status === 'locked' || status === 'cooldown') ? '#' : `/track/${trackType}/stage/${id}`}
        onClick={() => playSound('click')}
        className={cn(
          "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg relative",
          status === 'completed' && "bg-green-500 text-white hover:scale-105 shadow-green-500/20",
          status === 'open' && "bg-primary text-white hover:scale-105 animate-pulse ring-4 ring-primary/20",
          status === 'cooldown' && "bg-orange-100 text-orange-600 border-2 border-orange-500/20 cursor-wait",
          status === 'locked' && "bg-secondary text-muted-foreground cursor-not-allowed grayscale"
        )}
      >
        <Icon size={24} className={cn(status === 'cooldown' && "animate-spin-slow")} />
        {status === 'completed' && (
          <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-green-500">
            <CheckCircle2 size={10} className="text-green-500" />
          </div>
        )}
      </Link>
      
      <div className="flex flex-col items-center">
        <div className={cn(
          "font-black text-[10px]",
          status === 'locked' ? "text-muted-foreground" : 
          status === 'cooldown' ? "text-orange-600" : "text-primary"
        )}>
          اليوم {id}
        </div>
        
        {status === 'cooldown' && (
          <div className="bg-orange-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full mt-0.5 shadow-sm flex items-center gap-0.5">
            <Timer size={8} />
            {timeLeft}
          </div>
        )}
      </div>
    </div>
  );
}
