"use client"

import React from 'react';
import { Lock, Lightbulb, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface StageNodeProps {
  id: number;
  status: 'locked' | 'open' | 'completed';
  trackType: string;
  offset: number; // For the snake path effect
}

export function StageNode({ id, status, trackType, offset }: StageNodeProps) {
  const Icon = status === 'completed' ? CheckCircle2 : status === 'open' ? Lightbulb : Lock;
  
  return (
    <div 
      className="flex flex-col items-center gap-2 relative z-10"
      style={{ transform: `translateX(${offset}px)` }}
    >
      <Link 
        href={status === 'locked' ? '#' : `/track/${trackType}/stage/${id}`}
        className={cn(
          "w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-300 shadow-xl relative",
          status === 'completed' && "bg-accent text-white hover:scale-110",
          status === 'open' && "bg-primary text-white hover:scale-110 animate-pulse ring-8 ring-primary/20",
          status === 'locked' && "bg-secondary text-muted-foreground cursor-not-allowed grayscale"
        )}
      >
        <Icon size={32} />
        {status === 'completed' && (
          <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md border-2 border-accent">
            <CheckCircle2 size={16} className="text-accent" />
          </div>
        )}
      </Link>
      <div className={cn(
        "font-black text-lg",
        status === 'locked' ? "text-muted-foreground" : "text-primary"
      )}>
        Day {id}
      </div>
    </div>
  );
}