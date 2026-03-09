
"use client"

import React, { use, useState, useEffect, useMemo } from 'react';
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
import Image from 'next/image';

export default function TrackPathPage({ params }: { params: Promise<{ type: string }> }) {
  const resolvedParams = use(params);
  const { user } = useUser();
  const { database } = useFirebase();

  const typeKey = resolvedParams.type.charAt(0).toUpperCase() + resolvedParams.type.slice(1) as TrackKey;
  
  const userTrackRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}/trackProgress/${typeKey}`) : null, [user, database, typeKey]);
  const { data: progressData, isLoading } = useDatabase(userTrackRef);

  const [todayStr, setTodayStr] = useState<string>("");

  useEffect(() => {
    setTodayStr(new Date().toLocaleDateString('en-CA'));
  }, []);

  const progress = progressData || { currentStage: 1, completedStages: [], lastCompletedDate: null };
  const isOnCooldown = todayStr ? progress.lastCompletedDate === todayStr : false;

  // منطق مرن لحساب المرحلة الحالية المفتوحة بناءً على المنجز فعلياً
  const calculatedCurrentStage = useMemo(() => {
    const completed = progress.completedStages || [];
    if (completed.length === 0) return 1;
    const maxDone = Math.max(...completed);
    return Math.min(30, maxDone + 1);
  }, [progress.completedStages]);

  const stages = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const id = i + 1;
      let status: 'locked' | 'open' | 'completed' | 'cooldown' = 'locked';
      const completedStages = progress.completedStages || [];
      
      if (completedStages.includes(id)) {
        status = 'completed';
      } else if (id === calculatedCurrentStage) {
        if (isOnCooldown && id > 1) {
          status = 'cooldown';
        } else {
          status = 'open';
        }
      }

      const cycle = 8;
      const pos = i % cycle;
      let offset = 0;
      if (pos < 4) offset = pos * 25 - 40;
      else offset = (8 - pos) * 25 - 40;

      return { id, status, offset };
    });
  }, [progress.completedStages, calculatedCurrentStage, isOnCooldown]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-32 md:pr-72 pt-4 md:pt-0" dir="rtl">
      <NavSidebar />
      <div className="app-container py-4 relative">
        <div className="flex items-center justify-between mb-4 px-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="rounded-full gap-1 text-primary font-black h-8 px-3">
              <ArrowLeft size={14} className="rotate-180" />
              رجوع
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <MapIcon className="text-primary" size={16} />
            <h1 className="text-sm font-black text-primary">مسار {typeKey === 'Fitness' ? 'اللياقة' : typeKey === 'Nutrition' ? 'التغذية' : typeKey === 'Behavior' ? 'السلوك' : 'الدراسة'}</h1>
          </div>
          <Button onClick={() => toast({ title: "قانون الـ 24 ساعة", description: "مرحلة واحدة فقط يومياً لضمان بناء العادة." })} variant="outline" size="icon" className="h-8 w-8 rounded-full border-primary text-primary">
            <Info size={14} />
          </Button>
        </div>

        <div className="relative w-full h-28 rounded-[1.5rem] overflow-hidden mb-6 shadow-md border-2 border-white mx-auto max-w-[95%]">
          <Image 
            src={`/tracks/${resolvedParams.type.toLowerCase()}.jpg`} 
            alt={typeKey}
            fill
            className="object-cover"
            onError={(e) => { (e.target as any).src = 'https://picsum.photos/seed/track/800/400'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
          <div className="absolute bottom-3 right-4 text-white">
             <p className="text-[8px] font-black uppercase opacity-80">المستوى الحالي</p>
             <p className="text-xl font-black">{calculatedCurrentStage} / 30</p>
          </div>
        </div>

        <div className="mb-8 transform scale-90 origin-top px-2">
          <Mascot customMessage={isOnCooldown ? "أبدعت اليوم! كاري ينتظرك غداً بحماس. 🐱🌙" : "هيا بنا! اليوم يوم جديد للإنجاز. 🐱🔥"} />
        </div>

        {isOnCooldown && (
          <div className="mb-8 bg-orange-500/5 border border-orange-500/20 p-2 rounded-2xl flex items-center justify-between mx-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                <Timer size={14} className="animate-pulse" />
              </div>
              <div className="text-right">
                <h4 className="font-black text-orange-700 text-[10px] leading-none">وضع الانتظار</h4>
                <p className="text-[8px] font-bold text-orange-600/70">تفتح المرحلة القادمة عند منتصف الليل</p>
              </div>
            </div>
          </div>
        )}

        <div className="relative flex flex-col items-center gap-8 pb-20">
          <div className="absolute top-0 bottom-0 left-1/2 w-1.5 bg-secondary/30 -translate-x-1/2 rounded-full -z-0" />
          {isLoading ? (
            <div className="py-10 flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            stages.map((stage) => (
              <StageNode key={stage.id} id={stage.id} status={stage.status} trackType={resolvedParams.type} offset={stage.offset} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
