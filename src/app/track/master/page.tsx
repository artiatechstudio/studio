
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Sparkles, Timer, Play, CheckCircle, Zap, Trophy, ShieldAlert, ListChecks, Plus, Trash2, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import { getMasterPool, TrackKey, Challenge } from '@/lib/challenges';
import { useUser, useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref, update, push, serverTimestamp, remove, get } from 'firebase/database';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function MasterTrackPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  
  const [step, setStep] = useState<'setup' | 'active' | 'done'>('setup');
  const [selectedType, setSelectedType] = useState<TrackKey>('Fitness');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'سهل' | 'متوسط' | 'صعب'>('سهل');
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [todoInput, setTodoInput] = useState('');
  const [completingId, setCompletingId] = useState<string | null>(null);

  const userRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}`) : null, [user, database]);
  const { data: userData } = useDatabase(userRef);

  const todosRef = useMemoFirebase(() => user ? ref(database, `users/${user.uid}/todos`) : null, [user, database]);
  const { data: todosData } = useDatabase(todosRef);

  const isLegend = useMemo(() => {
    if (!userData?.trackProgress) return false;
    const tracks = ['Fitness', 'Nutrition', 'Behavior', 'Study'] as const;
    return tracks.every(t => (userData.trackProgress[t]?.completedStages?.length || 0) >= 30);
  }, [userData]);

  // دالة لتنظيف العنوان من بادئة اليوم حتى لا يتم "الحرق" على المستخدم
  const cleanTitle = (title: string) => title.replace(/^اليوم\s+\d+:\s*/, '');

  const handleStart = () => {
    const pool = getMasterPool(selectedType, selectedDifficulty);
    if (pool.length === 0) {
      toast({ title: "عذراً", description: "لا توجد تحديات كافية لهذا الاختيار." });
      return;
    }
    const random = pool[Math.floor(Math.random() * pool.length)];
    setCurrentChallenge(random);
    setStep('active');
    setTimeLeft((random.time || 5) * 60);
    setTimerActive(true);
    playSound('click');
  };

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, timeLeft]);

  const handleCompleteChallenge = async () => {
    if (!user || !currentChallenge) return;
    playSound('success');
    
    if (isLegend) {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const points = currentChallenge.points || 50;
      await update(ref(database, `users/${user.uid}`), {
        points: (userData.points || 0) + points,
        [`dailyPoints/${todayStr}`]: (userData.dailyPoints?.[todayStr] || 0) + points
      });
      toast({ title: "إنجاز أسطوري! 🎉", description: `حصلت على ${points} نقطة لمستواك المتقدم.` });
    } else {
      toast({ title: "أحسنت التدريب! 🐱", description: "استمر حتى تنهي المسارات الأربعة للحصول على نقاط رسمية." });
    }
    setStep('done');
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoInput.trim() || !user) return;
    playSound('click');
    const newTodoRef = push(ref(database, `users/${user.uid}/todos`));
    update(newTodoRef, {
      id: newTodoRef.key,
      title: todoInput.trim(),
      completed: false,
      timestamp: serverTimestamp()
    });
    setTodoInput('');
  };

  const handleToggleTodo = (todoId: string) => {
    if (!user || completingId) return;
    playSound('click');
    setCompletingId(todoId);
    
    const todayStr = new Date().toLocaleDateString('en-CA');
    const currentPoints = userData?.points || 0;
    const dailyPoints = userData?.dailyPoints?.[todayStr] || 0;

    update(ref(database, `users/${user.uid}`), {
      points: currentPoints + 5,
      [`dailyPoints/${todayStr}`]: dailyPoints + 5
    });

    toast({ title: "أحسنت! +5 نقاط 🌟" });
    playSound('success');

    setTimeout(() => {
      remove(ref(database, `users/${user.uid}/todos/${todoId}`));
      setCompletingId(null);
    }, 1000);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 pb-40 overflow-x-hidden" dir="rtl">
      <NavSidebar />
      <div className="app-container py-6 space-y-6 px-4 md:px-0">
        <header className="flex items-center justify-between bg-card p-5 rounded-[2rem] shadow-lg border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Sparkles size={28} />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-black text-primary leading-tight">المسار العام</h1>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">تحديات الأساطير والتدريب</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="rotate-180" />
            </Button>
          </Link>
        </header>

        {step === 'setup' && (
          <Card className="rounded-[2.5rem] p-6 md:p-8 shadow-xl border-none bg-card space-y-6 overflow-hidden">
            {!isLegend && (
              <div className="bg-orange-50 border-r-4 border-orange-500 p-4 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="text-orange-600 shrink-0" size={18} />
                <p className="text-[10px] font-bold text-orange-900 leading-relaxed">
                  تنبيه: لا يتم منح نقاط رسمية هنا إلا بعد إتمام الـ 120 يوماً في المسارات الأساسية. يمكنك استخدامه للتدريب الحر حالياً!
                </p>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-black text-primary text-sm">1. نوع المهمة</h3>
              <div className="grid grid-cols-2 gap-2">
                {(['Fitness', 'Nutrition', 'Behavior', 'Study'] as TrackKey[]).map(t => (
                  <Button 
                    key={t}
                    variant={selectedType === t ? 'default' : 'outline'}
                    onClick={() => { playSound('click'); setSelectedType(t); }}
                    className={cn("h-12 rounded-xl font-black text-xs", selectedType === t ? "shadow-md scale-[1.02]" : "")}
                  >
                    {t === 'Fitness' ? 'لياقة' : t === 'Nutrition' ? 'تغذية' : t === 'Behavior' ? 'سلوك' : 'دراسة'}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-black text-primary text-sm">2. الصعوبة</h3>
              <div className="flex gap-2">
                {(['سهل', 'متوسط', 'صعب'] as const).map(d => (
                  <Button 
                    key={d}
                    variant={selectedDifficulty === d ? 'default' : 'outline'}
                    onClick={() => { playSound('click'); setSelectedDifficulty(d); }}
                    className={cn("flex-1 h-12 rounded-xl font-black text-xs", selectedDifficulty === d ? "shadow-md scale-[1.02]" : "")}
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={handleStart} className="w-full h-14 rounded-2xl bg-primary text-lg font-black shadow-xl shadow-primary/20">
              ابدأ التحدي 🚀
            </Button>
          </Card>
        )}

        {step === 'active' && currentChallenge && (
          <Card className="rounded-[2.5rem] overflow-hidden bg-card border border-border text-right shadow-2xl">
            <CardHeader className="bg-primary text-white p-5">
              <div className="flex items-center justify-between flex-row-reverse">
                <CardTitle className="text-lg font-black truncate max-w-[70%]">
                  {cleanTitle(currentChallenge.title)}
                </CardTitle>
                <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-black">{currentChallenge.difficulty}</span>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <p className="text-base font-bold text-muted-foreground leading-relaxed">{currentChallenge.description}</p>
              
              <div className="bg-secondary/30 p-6 rounded-[2rem] text-center space-y-1">
                <p className="text-[9px] font-black text-primary uppercase">الوقت المتبقي</p>
                <p className="text-5xl font-black text-primary font-mono tabular-nums">{formatTime(timeLeft)}</p>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={handleCompleteChallenge} className="h-14 rounded-2xl bg-accent text-lg font-black shadow-lg">
                  أنهيت المهمة 🔥
                </Button>
                <Button onClick={() => setStep('setup')} variant="ghost" className="text-destructive font-black text-xs h-10">
                  إلغاء التحدي
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'done' && (
          <Card className="rounded-[2.5rem] p-8 text-center bg-card shadow-2xl space-y-4 mx-2">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-2xl font-black text-primary">عمل رائع!</h2>
            <p className="text-xs font-bold text-muted-foreground leading-relaxed">كل خطوة إضافية هي حجر أساس في بناء أسطورتك الشخصية.</p>
            <Button onClick={() => setStep('setup')} className="w-full h-12 rounded-xl font-black">تحدي جديد 🐱</Button>
          </Card>
        )}

        <section className="space-y-4 pt-6 border-t border-border/50">
          <header className="flex items-center justify-between px-1">
            <h2 className="text-lg font-black text-primary flex items-center gap-2">
              <ListChecks size={20} /> قائمة مهامي
            </h2>
            <span className="text-[8px] font-black text-muted-foreground bg-secondary px-2.5 py-1 rounded-full uppercase">كل مهمة = +5 نقاط</span>
          </header>
          
          <Card className="rounded-[2rem] p-5 shadow-xl border-none bg-card space-y-5">
            <form onSubmit={handleAddTodo} className="flex gap-2">
              <Input 
                placeholder="أضف مهمة شخصية..." 
                className="h-11 rounded-xl bg-secondary/50 border-none font-bold text-right text-xs focus-visible:ring-primary"
                value={todoInput}
                onChange={(e) => setTodoInput(e.target.value)}
              />
              <Button type="submit" size="icon" className="h-11 w-11 rounded-xl bg-primary shadow-lg shrink-0">
                <Plus size={20} />
              </Button>
            </form>

            <div className="space-y-2">
              {todosData ? Object.values(todosData).sort((a:any, b:any) => (b.timestamp || 0) - (a.timestamp || 0)).map((todo: any) => (
                <div 
                  key={todo.id} 
                  className={cn(
                    "flex items-center justify-between p-3.5 bg-secondary/20 rounded-xl group transition-all duration-700",
                    completingId === todo.id ? "opacity-0 scale-95 blur-sm" : "opacity-100"
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <button 
                      onClick={() => handleToggleTodo(todo.id)}
                      disabled={!!completingId}
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0",
                        completingId === todo.id ? "bg-green-500 text-white" : "bg-white border-2 border-primary/20 text-transparent"
                      )}
                    >
                      <CheckSquare size={16} />
                    </button>
                    <span className="font-bold text-[11px] text-primary truncate">
                      {todo.title}
                    </span>
                  </div>
                  <Button 
                    onClick={() => remove(ref(database, `users/${user!.uid}/todos/${todo.id}`))} 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive h-8 w-8 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              )) : (
                <div className="text-center py-8 opacity-20">
                  <ListChecks size={32} className="mx-auto mb-2" />
                  <p className="font-black text-[10px] italic">لا توجد مهام حالياً.</p>
                </div>
              )}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
