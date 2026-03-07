
"use client"

import React, { useEffect, useMemo, useState } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { TrackCard } from '@/components/dashboard/track-card';
import { Mascot } from '@/components/mascot';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, push, serverTimestamp, set, remove } from 'firebase/database';
import { Activity, HeartPulse, Sparkles, CheckSquare, Plus, Trash2, ListChecks } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AdBanner } from '@/components/ad-banner';
import { playSound } from '@/lib/sounds';
import { toast } from '@/hooks/use-toast';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const { database } = useFirebase();
  const router = useRouter();
  
  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData, isLoading: isDataLoading } = useDatabase(userRef);

  const [todoInput, setTodoInput] = useState('');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const profile = userData || {};

  const progressPercent = useMemo(() => {
    const totalStages = 120;
    const completedCount = Object.values(profile.trackProgress || {}).reduce((acc: number, curr: any) => acc + (curr.completedStages?.length || 0), 0);
    return Math.round((completedCount / totalStages) * 100);
  }, [profile]);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoInput.trim() || !user) return;
    playSound('click');
    const newTodoRef = push(ref(database, `users/${user.uid}/todos`));
    set(newTodoRef, {
      id: newTodoRef.key,
      title: todoInput.trim(),
      completed: false,
      timestamp: serverTimestamp()
    });
    setTodoInput('');
  };

  const toggleTodo = (todoId: string, currentStatus: boolean) => {
    if (!user) return;
    playSound('click');
    set(ref(database, `users/${user.uid}/todos/${todoId}/completed`), !currentStatus);
    
    if (!currentStatus) {
      // منح نقاط بسيطة (5 نقاط)
      const todayStr = new Date().toLocaleDateString('en-CA');
      set(ref(database, `users/${user.uid}/points`), (profile.points || 0) + 5);
      set(ref(database, `users/${user.uid}/dailyPoints/${todayStr}`), (profile.dailyPoints?.[todayStr] || 0) + 5);
      toast({ title: "أحسنت! +5 نقاط حماسة 🌟" });
      playSound('success');
    }
  };

  const deleteTodo = (todoId: string) => {
    if (!user) return;
    playSound('click');
    remove(ref(database, `users/${user.uid}/todos/${todoId}`));
  };

  if (isUserLoading || (user && isDataLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="text-8xl animate-bounce">🐱</div>
        <p className="text-primary font-black text-xl animate-pulse">كاري ينتظرك بشوق...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-32 md:pr-72 pt-14 md:pt-0" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6">
        {/* شريط الإحصائيات السريع */}
        <div className="grid grid-cols-2 gap-3 mx-2">
          <Link href="/streak" className="block">
            <Card className="p-4 rounded-[2rem] shadow-lg border border-border flex items-center gap-3 bg-card hover:scale-[1.02] transition-transform">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent shrink-0">
                <Activity size={20} />
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">الإنجاز الكلي</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-primary">{progressPercent}%</span>
                  <div className="flex-1 bg-secondary h-1.5 rounded-full overflow-hidden">
                    <div className="bg-accent h-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/track/master" className="block">
            <Card className="p-4 rounded-[2rem] shadow-lg border-2 border-primary/20 bg-primary/5 flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform h-full">
              <Sparkles className="text-primary" size={24} />
              <div className="text-right">
                <p className="text-xs font-black text-primary leading-tight">المسار العام</p>
                <p className="text-[8px] font-bold text-primary/60">تحديات لا نهائية 🔥</p>
              </div>
            </Card>
          </Link>
        </div>

        <section className="bg-primary/5 rounded-[2.5rem] p-6 border border-primary/10 mx-2 shadow-inner">
          <Mascot />
        </section>

        <section className="space-y-4 mx-2">
          <h2 className="text-xl font-black text-primary px-2">مسارات النمو</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
            <TrackCard type="Fitness" currentStage={profile.trackProgress?.Fitness?.currentStage || 1} totalStages={30} />
            <TrackCard type="Nutrition" currentStage={profile.trackProgress?.Nutrition?.currentStage || 1} totalStages={30} />
            <TrackCard type="Behavior" currentStage={profile.trackProgress?.Behavior?.currentStage || 1} totalStages={30} />
            <TrackCard type="Study" currentStage={profile.trackProgress?.Study?.currentStage || 1} totalStages={30} />
          </div>
        </section>

        {/* قائمة المهام المخصصة */}
        <section className="mx-2 space-y-4">
          <header className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-primary flex items-center gap-2">
              <ListChecks size={24} /> قائمة مهامي
            </h2>
            <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-3 py-1 rounded-full">كل مهمة = +5 نقاط 🌟</span>
          </header>
          
          <Card className="rounded-[2.5rem] p-6 shadow-xl border-none bg-card space-y-6">
            <form onSubmit={handleAddTodo} className="flex gap-2">
              <Input 
                placeholder="أضف مهمة شخصية اليوم..." 
                className="h-12 rounded-2xl bg-secondary/50 border-none font-bold text-right focus-visible:ring-primary"
                value={todoInput}
                onChange={(e) => setTodoInput(e.target.value)}
              />
              <Button type="submit" size="icon" className="h-12 w-12 rounded-2xl bg-primary shadow-lg shadow-primary/20">
                <Plus size={24} />
              </Button>
            </form>

            <div className="space-y-3">
              {profile.todos ? Object.values(profile.todos).sort((a:any, b:any) => b.timestamp - a.timestamp).map((todo: any) => (
                <div key={todo.id} className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl group border border-transparent hover:border-primary/10 transition-all">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleTodo(todo.id, todo.completed)}
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                        todo.completed ? "bg-green-500 text-white" : "bg-white border-2 border-primary/20 text-transparent"
                      )}
                    >
                      <CheckSquare size={18} />
                    </button>
                    <span className={cn("font-bold text-sm", todo.completed ? "line-through text-muted-foreground" : "text-primary")}>
                      {todo.title}
                    </span>
                  </div>
                  <Button onClick={() => deleteTodo(todo.id)} variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={18} />
                  </Button>
                </div>
              )) : (
                <div className="text-center py-10 opacity-30">
                  <ListChecks size={48} className="mx-auto mb-2" />
                  <p className="font-black">لا يوجد مهام خاصة حالياً</p>
                </div>
              )}
            </div>
          </Card>
        </section>

        <div className="mx-2">
          <AdBanner label="إعلان ممول" />
        </div>
      </div>
    </div>
  );
}
