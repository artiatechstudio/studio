
"use client"

import React, { use } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { StageNode } from '@/components/track/stage-node';
import { TrackKey } from '@/lib/challenges';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Map as MapIcon, Info } from 'lucide-react';
import Link from 'next/link';
import { Mascot } from '@/components/mascot';
import { useFirebase, useUser, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';
import { toast } from '@/hooks/use-toast';

export default function TrackPathPage({ params }: { params: Promise<{ type: string }> }) {
  const resolvedParams = use(params);
  const { user } = useUser();
  const { database } = useFirebase();

  const typeKey = resolvedParams.type.charAt(0).toUpperCase() + resolvedParams.type.slice(1) as TrackKey;
  
  const userTrackRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}/trackProgress/${typeKey}`) : null, [user, database, typeKey]);
  const { data: progressData, isLoading } = useDatabase(userTrackRef);

  const progress = progressData || { currentStage: 1, completedStages: [] };

  const stages = Array.from({ length: 30 }, (_, i) => {
    const id = i + 1;
    let status: 'locked' | 'open' | 'completed' = 'locked';
    const completedStages = progress.completedStages || [];
    
    if (completedStages.includes(id)) {
      status = 'completed';
    } else if (id === (progress.currentStage || 1)) {
      status = 'open';
    }

    const cycle = 8;
    const pos = i % cycle;
    let offset = 0;
    if (pos < 4) offset = pos * 40 - 60;
    else offset = (8 - pos) * 40 - 60;

    return { id, status, offset };
  });

  const showInfo = () => {
    toast({
      title: `مسار ${typeKey}`,
      description: "هذا المسار مصمم ليتم إنجازه خلال 30 يوماً. يمكنك إكمال مرحلة واحدة فقط كل يوم لضمان النمو المستدام.",
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-32" dir="rtl">
      <NavSidebar />
      
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-3xl mx-auto p-6 md:p-12 relative">
        <div className="flex items-center justify-between mb-12">
          <Link href="/">
            <Button variant="ghost" className="rounded-full gap-2 text-primary font-bold hover:bg-secondary">
              <ArrowLeft size={18} className="rotate-180" />
              العودة
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <MapIcon className="text-primary" size={24} />
            <h1 className="text-3xl font-black text-primary tracking-tight">مسار {typeKey === 'Fitness' ? 'اللياقة' : typeKey === 'Nutrition' ? 'التغذية' : typeKey === 'Behavior' ? 'السلوك' : 'الدراسة'}</h1>
          </div>
          <Button onClick={showInfo} variant="outline" size="icon" className="rounded-full border-primary text-primary">
            <Info size={18} />
          </Button>
        </div>

        <div className="mb-20">
          <Mascot />
        </div>

        <div className="relative flex flex-col items-center gap-16 pb-32">
          <div className="absolute top-0 bottom-0 left-1/2 w-4 bg-secondary/50 -translate-x-1/2 rounded-full -z-0" />
          
          {isLoading ? (
            <div className="text-primary font-black animate-pulse">جاري تحميل المسار...</div>
          ) : (
            stages.map((stage) => (
              <StageNode 
                key={stage.id}
                id={stage.id}
                status={stage.status}
                trackType={resolvedParams.type}
                offset={stage.offset}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
