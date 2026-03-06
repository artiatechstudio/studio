
"use client"

import React, { use } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { StageNode } from '@/components/track/stage-node';
import { TrackKey } from '@/lib/challenges';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Map as MapIcon, Info, Timer } from 'lucide-react';
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

  const progress = progressData || { currentStage: 1, completedStages: [], lastCompletedDate: null };
  const todayStr = new Date().toLocaleDateString('en-CA');
  
  // التحقق مما إذا كان المسار في فترة انتظار (تم إكمال مرحلة اليوم)
  const isOnCooldown = progress.lastCompletedDate === todayStr;

  const stages = Array.from({ length: 30 }, (_, i) => {
    const id = i + 1;
    let status: 'locked' | 'open' | 'completed' | 'cooldown' = 'locked';
    const completedStages = progress.completedStages || [];
    
    if (completedStages.includes(id)) {
      status = 'completed';
    } else if (id === (progress.currentStage || 1)) {
      // استثناء المرحلة الأولى من نظام الانتظار اليومي
      if (isOnCooldown && id > 1) {
        status = 'cooldown';
      } else {
        status = 'open';
      }
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
      title: `قوانين مسار ${typeKey}`,
      description: "نظام كارينجو صارم: مرحلة واحدة فقط يومياً لضمان بناء العادات. المرحلة القادمة تفتح دائماً عند منتصف الليل.",
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
          <Mascot customMessage={isOnCooldown ? "لقد أبدعت اليوم! كاري ينتظرك غداً بحماس لإكمال المرحلة التالية. 🐱🌙" : "هيا بنا! اليوم يوم جديد للإنجاز والنمو. 🐱🔥"} />
        </div>

        {isOnCooldown && (
          <div className="mb-12 bg-orange-500/10 border-2 border-orange-500/20 p-6 rounded-[2rem] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Timer className="animate-pulse" />
              </div>
              <div>
                <h4 className="font-black text-orange-700">وضع الانتظار النشط</h4>
                <p className="text-xs font-bold text-orange-600/70">أكملت تحدي اليوم، استرح واستعد لتحدي الغد!</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-orange-600/50 uppercase">المرحلة التالية تفتح في</p>
              <p className="text-2xl font-black text-orange-600">منتصف الليل</p>
            </div>
          </div>
        )}

        <div className="relative flex flex-col items-center gap-16 pb-32">
          <div className="absolute top-0 bottom-0 left-1/2 w-4 bg-secondary/50 -translate-x-1/2 rounded-full -z-0" />
          
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <div className="text-primary font-black">جاري رسم مسار نموك...</div>
            </div>
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
