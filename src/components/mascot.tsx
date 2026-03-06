
"use client"

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { useUser, useDatabase, useMemoFirebase, useFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { aiHelperContextualResponse } from '@/ai/flows/ai-helper-contextual-response';

const STATIC_MESSAGES = [
  "أهلاً! أنا كاري 🐱. دعنا ننمو معاً اليوم!",
  "كل خطوة صغيرة تقربك من هدفك الكبير، استمر!",
  "هل أنجزت مهمتك اليوم؟ الحماسة في انتظارك! 🔥",
  "تذكر، الاستمرارية أهم من السرعة. كاري فخور بك!",
  "يوم جديد، فرصة جديدة لتكون أفضل من الأمس!",
];

interface MascotProps {
  messageOnly?: boolean;
  customMessage?: string;
}

export function Mascot({ messageOnly = false, customMessage }: MascotProps) {
  const { user } = useUser();
  const { database } = useFirebase();
  const [message, setMessage] = useState<string>("جاري التفكير... 🐱");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  useEffect(() => {
    if (customMessage) {
      setMessage(customMessage);
      return;
    }

    async function fetchAiMessage() {
      if (!userData || isAiLoading) return;
      
      setIsAiLoading(true);
      try {
        // تحديد المسار الحالي بشكل ذكي أو افتراضي
        const tracks = ['Fitness', 'Nutrition', 'Behavior', 'Study'] as const;
        const currentTrack = (Object.keys(userData.trackProgress || {}).find(k => userData.trackProgress[k]?.currentStage > 1) || 'Fitness') as any;
        
        const response = await aiHelperContextualResponse({
          userName: userData.name || 'صديقي',
          currentTrack: currentTrack,
          currentStage: userData.trackProgress?.[currentTrack]?.currentStage || 1,
          isCompletedToday: userData.lastActiveDate === new Date().toLocaleDateString('en-CA'),
          completionStreak: userData.streak || 0
        });
        
        setMessage(response.message);
      } catch (e) {
        const randomIdx = Math.floor(Math.random() * STATIC_MESSAGES.length);
        setMessage(STATIC_MESSAGES[randomIdx]);
      } finally {
        setIsAiLoading(false);
      }
    }

    if (userData) {
      fetchAiMessage();
    } else {
      const randomIdx = Math.floor(Math.random() * STATIC_MESSAGES.length);
      setMessage(STATIC_MESSAGES[randomIdx]);
    }
  }, [userData, customMessage]);

  if (messageOnly) {
    return (
      <Card className="p-4 bg-primary text-primary-foreground border-none shadow-lg rounded-2xl relative">
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rotate-45" />
        <p className="text-sm font-bold text-right leading-relaxed">{message}</p>
      </Card>
    );
  }

  return (
    <div className="flex items-center gap-4 max-w-lg" dir="rtl">
      <div className="relative shrink-0 animate-float">
        <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full scale-110" />
        <div className="w-16 h-16 md:w-20 md:h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-4xl md:text-5xl shadow-xl border-4 border-white dark:border-slate-700 relative z-10">
          🐱
        </div>
        <div className="absolute -bottom-1 -left-1 bg-primary text-white px-2 py-0.5 rounded-full text-[9px] font-black z-20 shadow-md">
          كاري
        </div>
      </div>
      <Card className="p-4 bg-white dark:bg-slate-900 text-foreground border-none shadow-xl rounded-[1.5rem] relative overflow-visible flex-1 border border-border">
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-slate-900 rotate-45" />
        <p className="text-sm font-bold leading-relaxed text-right">{message}</p>
      </Card>
    </div>
  );
}
