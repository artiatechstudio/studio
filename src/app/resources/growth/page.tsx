
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lightbulb, Target, UserCheck, BookOpen, Brain, Star, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import Image from 'next/image';

export default function GrowthResourcePage() {
  return (
    <div className="min-h-screen bg-background md:pr-64" dir="rtl">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-10 pb-32">
        <div className="flex justify-start">
          <Link href="/resources" onClick={() => playSound('click')}>
            <Button variant="ghost" className="rounded-full gap-2 text-primary font-bold hover:bg-secondary">
              <ArrowLeft size={18} className="rotate-180" />
              العودة للموارد
            </Button>
          </Link>
        </div>

        <header className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
              <Lightbulb size={48} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight">التحسين الذاتي</h1>
              <p className="text-muted-foreground text-lg font-bold">عقلية النمو هي المحرك الحقيقي لكل إنجاز.</p>
            </div>
          </div>
        </header>

        <div className="relative w-full h-[350px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-card">
          <Image 
            src="https://picsum.photos/seed/growth-ultra/1200/800" 
            alt="التحسين الذاتي" 
            fill 
            className="object-cover"
            data-ai-hint="personal development"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-10">
            <p className="text-white text-2xl font-black">الانضباط هو الجسر الذي يربط بين أهدافك وإنجازاتك.</p>
          </div>
        </div>

        <section className="space-y-16">
          {/* قاعدة الـ 1% وفلسفة الكايزن */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-3xl font-black text-primary">
              <TrendingUp size={36} /> <h2>فلسفة الكايزن: قوة الـ 1%</h2>
            </div>
            <div className="bg-card p-10 rounded-[3rem] shadow-xl border border-border space-y-6 leading-relaxed">
              <p className="font-bold text-lg">النجاح ليس قفزة عملاقة، بل هو سلسلة من الخطوات الصغيرة المستمرة.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 space-y-4">
                  <h4 className="font-black text-primary text-xl">التأثير التراكمي:</h4>
                  <p className="text-sm font-bold text-muted-foreground">إذا تحسنت بنسبة 1% يومياً لمدة عام، ستكون أفضل بـ 37 ضعفاً في نهاية السنة. العادات الصغيرة تبني مستقبلاً كبيراً.</p>
                </div>
                <div className="bg-accent/5 p-8 rounded-3xl border border-accent/10 space-y-4">
                  <h4 className="font-black text-accent text-xl">هندسة العادات:</h4>
                  <p className="text-sm font-bold text-muted-foreground">اجعل البدء سهلاً جداً لدرجة أنك لا تستطيع قول "لا". ابدأ بـ 5 دقائق تمرين أو قراءة صفحة واحدة فقط.</p>
                </div>
              </div>
            </div>
          </div>

          {/* تقنيات التركيز العميق */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-3xl font-black text-orange-600">
              <Brain size={36} /> <h2>تقنيات التركيز العميق</h2>
            </div>
            <div className="bg-card p-10 rounded-[3rem] shadow-xl border border-border space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-secondary/20 rounded-3xl text-center space-y-3">
                     <Zap className="mx-auto text-orange-600" />
                     <h5 className="font-black text-primary">تقنية بومودورو</h5>
                     <p className="text-xs font-bold text-muted-foreground">25 دقيقة من العمل المركز، تليها 5 دقائق راحة. تكرر 4 مرات ثم تأخذ راحة طويلة.</p>
                  </div>
                  <div className="p-6 bg-secondary/20 rounded-3xl text-center space-y-3">
                     <Target className="mx-auto text-orange-600" />
                     <h5 className="font-black text-primary">العمل العميق</h5>
                     <p className="text-xs font-bold text-muted-foreground">تخصيص وقت محدد (60-90 دقيقة) لمهمة واحدة دون أي مشتتات أو تنبيهات.</p>
                  </div>
                  <div className="p-6 bg-secondary/20 rounded-3xl text-center space-y-3">
                     <BookOpen className="mx-auto text-orange-600" />
                     <h5 className="font-black text-primary">التلقين الذاتي</h5>
                     <p className="text-xs font-bold text-muted-foreground">مراجعة أهدافك اليومية كل صباح لبرمجة عقلك الباطن على الإنجاز.</p>
                  </div>
               </div>
            </div>
          </div>

          {/* عادات النجاح السبعة */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-3xl font-black text-green-600">
              <Star size={36} /> <h2>قواعد بناء العقلية الحديدية</h2>
            </div>
            <div className="bg-green-50/50 p-10 rounded-[3rem] shadow-xl border border-green-100 space-y-6">
               <div className="space-y-4 font-bold text-muted-foreground leading-relaxed">
                  <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-green-200">
                     <UserCheck className="text-green-600 shrink-0" />
                     <p>1. <span className="text-green-800 font-black">المبادرة:</span> توقف عن انتظار الوقت المثالي، الوقت المثالي هو الآن.</p>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-green-200">
                     <UserCheck className="text-green-600 shrink-0" />
                     <p>2. <span className="text-green-800 font-black">البداية والغاية في ذهنك:</span> اعرف لماذا تفعل ما تفعل، الغاية تعطيك القوة عند التعب.</p>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-green-200">
                     <UserCheck className="text-green-600 shrink-0" />
                     <p>3. <span className="text-green-800 font-black">ترتيب الأولويات:</span> افعل الأشياء المهمة أولاً، لا تجعل الأشياء المستعجلة تسرق وقتك.</p>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-green-200">
                     <UserCheck className="text-green-600 shrink-0" />
                     <p>4. <span className="text-green-800 font-black">البيئة هي المصير:</span> صمم بيئتك لخدمة أهدافك، أحط نفسك بملهمين ومحفزين.</p>
                  </div>
               </div>
            </div>
          </div>
        </section>

        <footer className="pt-20 opacity-40 font-black text-primary text-xs text-center">
          جميع الحقوق محفوظة © Artiatech Studio 2026
        </footer>
      </div>
    </div>
  );
}
