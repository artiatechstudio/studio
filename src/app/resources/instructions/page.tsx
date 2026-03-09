
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, Timer as TimerIcon, Flame, Milestone, Crown, Sparkles, Globe, Snowflake, Swords, Scale, Camera, Eye, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import { Card } from '@/components/ui/card';

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-background md:pr-64 pb-40" dir="rtl">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-10 overflow-x-hidden text-right">
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
              <div className="text-4xl">ℹ️</div>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-primary leading-tight">دستور Careingo الكامل</h1>
              <p className="text-muted-foreground text-base md:text-lg font-bold">كل القوانين والآليات التقنية التي تحكم مجتمع النمو الخاص بنا.</p>
            </div>
          </div>
        </header>

        <section className="space-y-12">
          {/* نظام التحديات المطور */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-primary">
              <Swords className="text-red-500" /> <h2>1. نظام التحديات الثنائية المطور (PvP)</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border-2 border-primary/10 bg-primary/5 space-y-6">
              <div className="space-y-4">
                <h4 className="font-black text-primary text-lg flex items-center gap-2">كيف تعمل المبارزة؟ ⚔️</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-border space-y-2">
                    <p className="font-black text-primary text-sm flex items-center gap-2"> <CheckCircle2 size={16} className="text-green-500" /> الخطوة 1: الطلب والقبول</p>
                    <p className="text-[11px] font-bold text-muted-foreground">عندما يوافق الخصم، ينتقل الطرفان فوراً إلى صفحة "الماستر" لبدء المواجهة.</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-border space-y-2">
                    <p className="font-black text-primary text-sm flex items-center gap-2"> <TimerIcon size={16} className="text-orange-500" /> الخطوة 2: صراع الزمن (Beat-the-Clock)</p>
                    <p className="text-[11px] font-bold text-muted-foreground">أول من ينهي المهمة يرفع إثباته فوراً. يصبح زمنه هو "الرقم القياسي" والحد الأقصى للوقت للطرف الآخر. يجب على الثاني إنهاء المهمة في وقت أقل للفوز.</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-border space-y-2">
                    <p className="font-black text-primary text-sm flex items-center gap-2"> <Camera size={16} className="text-blue-500" /> الخطوة 3: إثبات الإنجاز</p>
                    <p className="text-[11px] font-bold text-muted-foreground">يجب رفع صورة دليل فورية. يتوقف المؤقت فور الضغط على زر الرفع لضمان الدقة.</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-border space-y-2">
                    <p className="font-black text-primary text-sm flex items-center gap-2"> <Eye size={16} className="text-purple-500" /> الخطوة 4: العقوبات والنتائج</p>
                    <p className="text-[11px] font-bold text-muted-foreground">الانسحاب يؤدي لخصم النقاط فوراً. إذا انتهى الوقت ولم يرفع أي طرف دليلاً، يُخصم من كلاهما. تظهر النتائج النهائية في إشعار احترافي لكلا الطرفين.</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-3xl border border-green-100 space-y-4">
                <h4 className="font-black text-green-800 text-sm flex items-center gap-2"><Scale size={16} /> التوضيح الشرعي والتقني:</h4>
                <p className="text-[10px] font-bold text-green-900/70 leading-relaxed">
                  نظام التحديات هو آلية تحفيزية؛ النقاط المكتسبة هي "مكافأة نظام" والمنقوصة هي "عقوبة تقنية". لا يتم انتقال نقاط بين الحسابات مباشرة لضمان التوافق مع الشريعة.
                </p>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-primary">
              <Sparkles className="text-accent" /> <h2>2. الماستر</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-4">
              <p className="text-sm font-bold text-slate-700 leading-relaxed">
                هذا الوضع مخصص لتجاوز الحدود. يضم 120 تحدياً إضافياً عشوائياً. كما يضم "مهامي الموقوتة" بحد 5 مهام يومياً للأعضاء العاديين، وغير محدود للبريميوم. كل مهمة ناجحة تمنح 5 نقاط.
              </p>
            </Card>
          </div>
        </section>

        <footer className="pt-20 opacity-40 font-black text-primary text-[10px] md:text-xs text-center">
          Careingo | تواصل، تحدى، تطور - جميع الحقوق محفوظة 2026
        </footer>
      </div>
    </div>
  );
}
