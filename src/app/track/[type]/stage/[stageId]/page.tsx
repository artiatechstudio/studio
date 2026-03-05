"use client"

import React, { use, useState, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Clock, BarChart3, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import { Mascot } from '@/components/mascot';
import { toast } from '@/hooks/use-toast';
import { STATIC_CHALLENGES, TrackKey } from '@/lib/challenges';
import { useFirebase, useUser, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, get } from 'firebase/database';

export default function StageDetailPage({ params }: { params: Promise<{ type: string, stageId: string }> }) {
  const resolvedParams = use(params);
  const trackKey = resolvedParams.type.charAt(0).toUpperCase() + resolvedParams.type.slice(1) as TrackKey;
  const stageId = parseInt(resolvedParams.stageId);
  
  const { database } = useFirebase();
  const { user } = useUser();
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const challenge = STATIC_CHALLENGES[trackKey][stageId - 1];

  // تثبيت المرجع لتجنب الـ Infinite Loop
  const progressRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}/trackProgress/${trackKey}`) : null, [user, database, trackKey]);
  const { data: progressData } = useDatabase(progressRef);

  useEffect(() => {
    if (progressData) {
      const isDone = progressData.completedStages?.includes(stageId);
      setCompleted(!!isDone);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [progressData, stageId]);

  const handleComplete = async () => {
    if (!user || !database) return;

    try {
      const currentProgress = progressData || { currentStage: 1, completedStages: [] };
      const completedStages = currentProgress.completedStages || [];
      
      if (!completedStages.includes(stageId)) {
        completedStages.push(stageId);
      }

      const nextStage = Math.max(currentProgress.currentStage, stageId + 1);

      await update(ref(database, `users/${user.uid}/trackProgress/${trackKey}`), {
        completedStages,
        currentStage: nextStage,
        lastCompletedDate: new Date().toISOString().split('T')[0]
      });

      const userRef = ref(database, `users/${user.uid}`);
      const userSnap = await get(userRef);
      const userData = userSnap.val();
      await update(userRef, {
        streak: (userData.streak || 0) + 1
      });

      setCompleted(true);
      toast({
        title: "تم الإنجاز!",
        description: `عمل رائع! انتهيت من اليوم ${stageId} في مسار ${trackKey}.`,
      });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حفظ التقدم." });
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-8 pb-24 md:pb-12">
        <Link href={`/track/${resolvedParams.type}`}>
          <Button variant="ghost" className="rounded-full gap-2 text-primary font-bold hover:bg-secondary">
            <ArrowLeft size={18} className="rotate-180" />
            العودة للمسار
          </Button>
        </Link>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-12 w-2/3 bg-secondary rounded-xl" />
            <div className="h-64 bg-secondary rounded-3xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <header>
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-black uppercase tracking-tighter">اليوم {stageId}</div>
                  <div className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-black uppercase tracking-tighter">{trackKey}</div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight">{challenge.title}</h1>
              </header>

              <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden">
                <CardHeader className="bg-primary text-white p-8">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">مهمتك</CardTitle>
                    <div className="flex gap-4 text-sm font-medium opacity-90">
                      <div className="flex items-center gap-1"><Clock size={16} /> {challenge.time}د</div>
                      <div className="flex items-center gap-1"><Zap size={16} /> {challenge.difficulty}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap text-right">
                    {challenge.description}
                  </div>
                  
                  {!completed ? (
                    <Button 
                      onClick={handleComplete}
                      className="w-full h-16 rounded-2xl bg-accent hover:bg-accent/90 text-xl font-black shadow-xl shadow-accent/20"
                    >
                      لقد أنجزت المهمة!
                    </Button>
                  ) : (
                    <div className="bg-green-50 border-2 border-green-200 p-8 rounded-3xl flex flex-col items-center gap-4 text-center">
                      <CheckCircle className="text-green-500" size={64} />
                      <div>
                        <h3 className="text-2xl font-black text-green-700">عمل رائع!</h3>
                        <p className="text-green-600 font-medium">لقد أكملت مهمتك اليومية بنجاح.</p>
                      </div>
                      <Link href="/" className="w-full">
                        <Button className="w-full rounded-2xl bg-green-600 hover:bg-green-700">العودة للرئيسية</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="sticky top-12">
                <Mascot messageOnly currentTrack={trackKey as any} />
                
                <Card className="mt-8 border-none shadow-xl rounded-3xl overflow-hidden">
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                      <BarChart3 size={20} />
                      إحصائيات {trackKey}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">إجمالي المراحل</span>
                        <span className="text-sm font-bold text-primary">30</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">اليوم الحالي</span>
                        <span className="text-sm font-bold text-primary">{stageId}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
