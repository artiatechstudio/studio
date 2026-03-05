"use client"

import React, { use, useState, useEffect } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Clock, BarChart3, Star, Zap, Trophy } from 'lucide-react';
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
      
      if (completedStages.includes(stageId)) {
        toast({ title: "منجز بالفعل!", description: "لقد أتممت هذه المهمة سابقاً." });
        return;
      }

      completedStages.push(stageId);
      const nextStage = Math.max(currentProgress.currentStage, stageId + 1);

      // منطق النقاط: كلما بكرت حصلت على نقاط أكثر
      const now = new Date();
      const hour = now.getHours();
      const basePoints = 100;
      // بونص إنجاز مبكر (قبل الساعة 12 ظهراً)
      const earlyBonus = Math.max(0, (20 - hour) * 5); 
      const pointsEarned = basePoints + earlyBonus;

      await update(ref(database, `users/${user.uid}/trackProgress/${trackKey}`), {
        completedStages,
        currentStage: nextStage,
        lastCompletedDate: now.toISOString().split('T')[0]
      });

      const userRef = ref(database, `users/${user.uid}`);
      const userSnap = await get(userRef);
      const userData = userSnap.val();
      
      await update(userRef, {
        points: (userData.points || 0) + pointsEarned,
        streak: (userData.streak || 0) + 1
      });

      setCompleted(true);
      toast({
        title: "تم الإنجاز! 🎉",
        description: `أحسنت! حصلت على ${pointsEarned} نقطة لإنجازك مهمة اليوم.`,
      });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حفظ التقدم." });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FE]">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-8 pb-32">
        <Link href={`/track/${resolvedParams.type}`}>
          <Button variant="ghost" className="rounded-full gap-2 text-primary font-bold hover:bg-secondary">
            <ArrowLeft size={18} className="rotate-180" />
            العودة للمسار
          </Button>
        </Link>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-12 w-2/3 bg-secondary rounded-xl" />
            <div className="h-64 bg-secondary rounded-[3rem]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <header>
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-black uppercase">اليوم {stageId}</div>
                  <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase">{trackKey}</div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight">{challenge.title}</h1>
              </header>

              <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden">
                <CardHeader className="bg-primary text-white p-8">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">مهمة اليوم</CardTitle>
                    <div className="flex gap-4 text-sm font-medium opacity-90">
                      <div className="flex items-center gap-1"><Clock size={16} /> {challenge.time}د</div>
                      <div className="flex items-center gap-1"><Zap size={16} /> {challenge.difficulty}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="text-xl leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {challenge.description}
                  </div>
                  
                  {!completed ? (
                    <Button 
                      onClick={handleComplete}
                      className="w-full h-16 rounded-2xl bg-accent hover:bg-accent/90 text-xl font-black shadow-xl shadow-accent/20 transition-all hover:scale-[1.02]"
                    >
                      أنجزت المهمة الآن!
                    </Button>
                  ) : (
                    <div className="bg-green-50 border-4 border-green-100 p-10 rounded-[2.5rem] flex flex-col items-center gap-4 text-center">
                      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
                        <CheckCircle size={48} />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-green-700 italic">مذهل!</h3>
                        <p className="text-green-600 font-medium mt-2">لقد أكملت مهمتك وحصلت على النقاط.</p>
                      </div>
                      <Link href="/" className="w-full mt-4">
                        <Button className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 font-black">العودة للرئيسية</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="sticky top-12">
                <Mascot messageOnly />
                
                <Card className="mt-8 border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                      <Trophy size={20} className="text-yellow-500" />
                      مكافأة الإنجاز
                    </h3>
                    <div className="p-4 bg-secondary/30 rounded-2xl space-y-2">
                      <div className="flex justify-between font-bold text-sm">
                        <span>النقاط الأساسية</span>
                        <span>100</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-accent">
                        <span>بونص التبكير</span>
                        <span>+{(20 - new Date().getHours()) * 5}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">أنجز مهامك في الصباح لتحصل على نقاط أكثر وتتصدر القائمة!</p>
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