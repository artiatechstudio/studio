
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Trophy, Flame, Star, Timer as TimerIcon, MessageSquare, UserCircle, Heart, Zap, Map, Search, Sparkles, Activity, ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import { Card } from '@/components/ui/card';

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-background md:pr-64" dir="rtl">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-8 pb-32 overflow-x-hidden text-right">
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
                في كارينجو, نكافئ الانضباط والتبكير. إليك كيف تُحسب نقاطك في كل تحدي:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                  <h4 className="font-black text-primary text-lg mb-2 flex items-center gap-2">100 نقطة أساسية <Zap size={16}/></h4>
                  <p className="text-xs font-bold text-muted-foreground">تحصل عليها بمجرد إكمال أي مهمة في أي مسار بنجاح.</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-200">
                  <h4 className="font-black text-yellow-700 text-lg mb-2 flex items-center gap-2">بونص التبكير (+75) <TimerIcon size={16}/></h4>
                  <p className="text-xs font-bold text-muted-foreground">يبدأ من 5 صباحاً بـ 75 نقطة، ويتناقص 5 نقاط كل ساعة حتى يختفي تماماً الساعة 8 مساءً.</p>
                </div>
              </div>
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
                <li className="bg-white/50 p-4 rounded-2xl text-xs font-bold border border-accent/10 text-slate-900 shadow-sm">● <span className="font-black text-primary">نصائح فورية:</span> اطلب منه نصيحة في التغذية أو اللياقة في أي وقت.</li>
                <li className="bg-white/50 p-4 rounded-2xl text-xs font-bold border border-accent/10 text-slate-900 shadow-sm">● <span className="font-black text-primary">تحفيز دائم:</span> سيقوم كاري بتشجيعك بناءً على مستوى تقدمك الفعلي وسلسلة إنجازك.</li>
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
