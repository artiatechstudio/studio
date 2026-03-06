
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Trophy, Flame, Star, Timer as TimerIcon, MessageSquare, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import { Card } from '@/components/ui/card';

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-background md:pr-64" dir="rtl">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-8 pb-32 overflow-x-hidden">
        <div className="flex justify-start">
          <Link href="/resources" onClick={() => playSound('click')}>
            <Button variant="ghost" className="rounded-full gap-2 text-primary font-bold hover:bg-secondary">
              <ArrowLeft size={18} className="rotate-180" />
              العودة للموارد
            </Button>
          </Link>
        </div>

        <header className="space-y-4 text-right">
          <div className="flex items-center justify-start gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center shadow-xl border border-primary/20">
              <Info size={40} />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-primary leading-tight">دليل التعليمات</h1>
              <p className="text-muted-foreground text-base md:text-lg font-bold">كل ما تحتاجه لتكون بطلاً في عالم كارينجو.</p>
            </div>
          </div>
        </header>

        <section className="space-y-12">
          {/* بونص التبكير */}
          <div className="space-y-6 text-right">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-accent">
              <TimerIcon className="animate-pulse" /> <h2>بونص التبكير (Early Bird)</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-accent/20 bg-card space-y-6 relative overflow-hidden">
              <div className="space-y-4">
                <p className="font-bold text-base md:text-lg leading-relaxed">
                  نحن نؤمن بأن الصباح هو مفتاح الإنتاجية. لذلك، قمنا بتصميم نظام مكافآت يحفزك على البدء مبكراً:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                    <h4 className="font-black text-primary text-lg mb-2">5:00 - 8:00 صباحاً</h4>
                    <p className="text-xs font-bold text-muted-foreground">الفترة الذهبية! تحصل على البونص الكامل (+75 نقطة). هذه الفترة هي الأفضل لتمارين اللياقة والتركيز الذهني.</p>
                  </div>
                  <div className="bg-accent/5 p-6 rounded-3xl border border-accent/10">
                    <h4 className="font-black text-accent text-lg mb-2">التناقص التدريجي</h4>
                    <p className="text-xs font-bold text-muted-foreground">بعد الثامنة، يبدأ البونص بالتناقص بمعدل 5 نقاط لكل ساعة تأخير. الهدف هو تشجيعك على عدم التسويف.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* تحديثات الدردشة والحماسة */}
          <div className="space-y-6 text-right">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-primary">
              <MessageSquare className="text-primary" /> <h2>الميزات الجديدة والتفاعل</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 rounded-3xl border border-border bg-card">
                <h4 className="font-black text-primary flex items-center gap-2 mb-3">سجل الحماسة (Streak)</h4>
                <p className="text-sm font-bold text-muted-foreground">
                  يمكنك الوصول لشاشة الحماسة بسرعة عبر النقر على <Flame className="inline text-orange-500" size={16}/> "أيقونة النار" الموجودة في الشاشة الرئيسية. التقويم يوثق أيام إنجازك الحقيقية بعلامات ملونة.
                </p>
              </Card>
              <Card className="p-6 rounded-3xl border border-border bg-card">
                <h4 className="font-black text-primary flex items-center gap-2 mb-3">الدردشة والملف الشخصي</h4>
                <p className="text-sm font-bold text-muted-foreground">
                  يمكنك الآن إضافة "بايو" (نبذة قصيرة) من 30 حرفاً لملفك الشخصي. كما يحفظ النظام الدردشات التي قمت بها مسبقاً ليسهل عليك العودة إليها من قائمة الدردشة.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <footer className="pt-20 opacity-40 font-black text-primary text-[10px] md:text-xs text-center">
          جميع الحقوق محفوظة © Artiatech Studio 2026
        </footer>
      </div>
    </div>
  );
}
