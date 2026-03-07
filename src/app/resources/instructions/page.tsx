
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Trophy, Flame, Star, Timer as TimerIcon, MessageSquare, UserCircle, Heart, Zap, Map, Search, Sparkles, Activity, ShieldCheck, Lock, Ruler, Weight } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-background md:pr-64" dir="rtl">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-10 pb-32 overflow-x-hidden text-right">
        <div className="flex justify-start">
          <Link href="/resources" onClick={() => playSound('click')}>
            <Button variant="ghost" className="rounded-full gap-2 text-primary font-bold hover:bg-secondary">
              <ArrowLeft size={18} className="rotate-180" />
              العودة للموارد
            </Button>
          </Link>
        </div>

        <header className="space-y-4">
          <div className="flex items-center justify-start gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center shadow-xl border border-primary/20">
              <Info size={40} />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-primary leading-tight">دليل كارينجو الشامل</h1>
              <p className="text-muted-foreground text-base md:text-lg font-bold">كل ما تحتاجه لتكون أسطورة في مجتمع النمو الخاص بنا.</p>
            </div>
          </div>
        </header>

        <section className="space-y-12">
          {/* نظام النقاط والبونص */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-orange-600">
              <Star className="text-yellow-500" fill="currentColor" /> <h2>نظام النقاط وبونص التبكير</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-6">
              <p className="font-bold text-base md:text-lg leading-relaxed text-slate-900">
                في كارينجو، نكافئ الانضباط والتبكير. إليك كيف تُحسب نقاطك في كل تحدي:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                  <h4 className="font-black text-primary text-lg mb-2 flex items-center gap-2">100 نقطة أساسية <Zap size={16}/></h4>
                  <p className="text-xs font-bold text-muted-foreground">تحصل عليها بمجرد إكمال أي مهمة في أي مسار بنجاح.</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-200">
                  <h4 className="font-black text-yellow-700 text-lg mb-2 flex items-center gap-2">بونص التبكير (+75) <TimerIcon size={16}/></h4>
                  <p className="text-xs font-bold text-muted-foreground">يبدأ من الساعة 5 صباحاً بـ 75 نقطة، ويتناقص 5 نقاط كل ساعة حتى يختفي تماماً الساعة 8 مساءً.</p>
                </div>
              </div>
            </Card>
          </div>

          {/* نظام المسارات */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-primary">
              <Map className="text-primary" /> <h2>المسارات الأربعة (الـ 120 مرحلة)</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-6">
              <p className="font-bold text-slate-900">يتكون التطبيق من 4 مسارات تخصصية، كل مسار يحتوي على 30 مرحلة متدرجة الصعوبة:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { t: 'اللياقة', d: 'تمارين بدنية بوزن الجسم.', c: 'bg-blue-50 text-blue-600' },
                  { t: 'التغذية', d: 'عادات أكل صحية يومية.', c: 'bg-green-50 text-green-600' },
                  { t: 'السلوك', d: 'تطوير العقلية والانضباط.', c: 'bg-purple-50 text-purple-600' },
                  { t: 'الدراسة', d: 'تقنيات التعلم والتركيز.', c: 'bg-orange-50 text-orange-600' }
                ].map((track, i) => (
                  <div key={i} className={`${track.c} p-4 rounded-2xl text-center border border-current/10`}>
                    <h5 className="font-black text-sm mb-1">{track.t}</h5>
                    <p className="text-[10px] font-bold opacity-80">{track.d}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-3 bg-red-50 p-4 rounded-2xl border-r-4 border-red-500">
                <Lock className="text-red-500 shrink-0" size={20} />
                <p className="text-xs font-bold text-red-900 leading-relaxed">
                  <span className="font-black">قانون الـ 24 ساعة:</span> لا يمكنك فتح أكثر من مرحلة واحدة في نفس المسار خلال يوم واحد. تفتح المرحلة التالية دائماً عند منتصف الليل.
                </p>
              </div>
            </Card>
          </div>

          {/* مؤشر الـ BMI */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-green-600">
              <Activity className="text-green-600" /> <h2>مؤشر الأداء الصحي (BMI)</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-6">
              <p className="font-bold text-slate-900">نستخدم معادلة كتلة الجسم لمساعدتك في تتبع حالتك البدنية العامة:</p>
              <div className="bg-secondary/30 p-6 rounded-2xl text-center border border-border">
                <code className="text-primary font-black text-lg">الوزن (كجم) / (الطول بالامتار)²</code>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { l: 'نحافة', v: '< 18.5', c: 'text-blue-500' },
                  { l: 'مثالي', v: '18.5 - 25', c: 'text-green-500' },
                  { l: 'زيادة', v: '25 - 30', c: 'text-orange-500' },
                  { l: 'سمنة', v: '> 30', c: 'text-red-500' }
                ].map((s, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-border text-center">
                    <p className={`font-black text-xs ${s.c}`}>{s.l}</p>
                    <p className="text-[10px] font-bold text-muted-foreground">{s.v}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* قائمة المتصدرين */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-yellow-600">
              <Trophy className="text-yellow-500" /> <h2>قائمة العظماء (Leaderboard)</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-4">
              <p className="font-bold text-slate-900 leading-relaxed">
                المنافسة في كارينجو عادلة جداً. الترتيب لا يعتمد على إجمالي النقاط منذ البداية فقط، بل يعتمد على <span className="text-primary font-black">متوسط نقاط آخر 3 أيام</span>.
              </p>
              <ul className="space-y-2 text-xs font-bold text-muted-foreground">
                <li className="flex items-center gap-2">● يسمح هذا النظام للمشتركين الجدد بمنافسة القدامى.</li>
                <li className="flex items-center gap-2">● يتم تحديث الترتيب لحظياً بمجرد إكمال أي مهمة.</li>
                <li className="flex items-center gap-2">● يظهر شعار "الأسطورة" لأول 3 مراكز في القائمة.</li>
              </ul>
            </Card>
          </div>

          {/* الذكاء الاصطناعي كاري */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-accent">
              <Sparkles className="text-accent" /> <h2>المساعد الذكي "كاري" 🐱</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-accent/20 bg-accent/5 space-y-4">
              <div className="bg-destructive text-destructive-foreground p-4 rounded-2xl text-center font-black animate-pulse shadow-lg border border-white/20">
                تنبيه هام: السيرفر متوقف حالياً إلى أجل غير مسمى 🛑
              </div>
              <p className="font-black text-base md:text-lg leading-relaxed text-slate-900">
                كاري ليس مجرد أيقونة، إنه رفيقك المدعوم بأحدث تقنيات الذكاء الاصطناعي (Gemini 1.5):
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li className="bg-white/50 p-4 rounded-2xl text-xs font-bold border border-accent/10 text-slate-900 shadow-sm leading-relaxed">
                  ● <span className="font-black text-primary">نصائح فورية:</span> اطلب منه نصيحة في التغذية أو اللياقة في أي وقت عبر صفحة الدردشة الذكية.
                </li>
                <li className="bg-white/50 p-4 rounded-2xl text-xs font-bold border border-accent/10 text-slate-900 shadow-sm leading-relaxed">
                  ● <span className="font-black text-primary">تحفيز مخصص:</span> يقوم كاري بقراءة إحصائياتك وتحفيزك بكلمات تشبه تقدمك الفعلي في كل مسار.
                </li>
              </ul>
            </Card>
          </div>
        </section>

        <footer className="pt-20 opacity-40 font-black text-primary text-[10px] md:text-xs text-center">
          جميع الحقوق محفوظة © Artiatech Studio 2026
        </footer>
      </div>
    </div>
  );
}
