
"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { aiHelperContextualResponse } from '@/ai/flows/ai-helper-contextual-response';
import { TrackType } from '@/lib/mock-data';
import { Card } from './ui/card';
import { useUser, useFirebase, useDatabase } from '@/firebase';
import { ref } from 'firebase/database';

interface MascotProps {
  currentTrack?: TrackType;
  messageOnly?: boolean;
}

export function Mascot({ currentTrack = 'Fitness', messageOnly = false }: MascotProps) {
  const { user } = useUser();
  const { database } = useFirebase();
  const [message, setMessage] = useState<string>("Hi! I'm Careingo. Let's grow together!");
  const [loading, setLoading] = useState(false);

  const progressRef = user ? ref(database, `users/${user.uid}`) : null;
  const { data: userData } = useDatabase(progressRef);

  useEffect(() => {
    async function fetchResponse() {
      if (!userData || !user) return;
      
      setLoading(true);
      try {
        const trackData = userData.trackProgress?.[currentTrack] || { currentStage: 1 };
        const res = await aiHelperContextualResponse({
          userName: userData.name || user.displayName || 'Friend',
          currentTrack: currentTrack as any,
          currentStage: trackData.currentStage || 1,
          isCompletedToday: trackData.lastCompletedDate === new Date().toISOString().split('T')[0],
          completionStreak: userData.streak || 0
        });
        setMessage(res.message);
      } catch (e) {
        console.error(e);
        setMessage("Keep going! You are doing great today!");
      } finally {
        setLoading(false);
      }
    }
    if (userData) {
      fetchResponse();
    }
  }, [currentTrack, userData, user]);

  const mascotImage = PlaceHolderImages.find(img => img.id === 'mascot-friendly');

  if (messageOnly) {
    return (
      <Card className="p-4 bg-primary text-primary-foreground border-none shadow-lg rounded-2xl relative">
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rotate-45" />
        {loading ? <span className="animate-pulse">Thinking...</span> : <p className="text-sm font-medium">{message}</p>}
      </Card>
    );
  }

  return (
    <div className="flex items-center gap-4 max-w-lg">
      <div className="relative shrink-0 animate-float">
        <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full scale-110" />
        <Image
          src={mascotImage?.imageUrl || 'https://picsum.photos/seed/careingo/200/200'}
          alt="Careingo Mascot"
          width={100}
          height={100}
          className="rounded-full border-4 border-white shadow-xl relative z-10"
          data-ai-hint="cartoon bird"
        />
      </div>
      <Card className="p-4 bg-white text-primary border-none shadow-xl rounded-3xl relative overflow-visible">
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rotate-45" />
        {loading ? <span className="animate-pulse text-muted-foreground italic">Careingo is typing...</span> : <p className="text-sm font-bold leading-relaxed">{message}</p>}
      </Card>
    </div>
  );
}
