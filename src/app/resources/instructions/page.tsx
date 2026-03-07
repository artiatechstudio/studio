
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Star, Timer as TimerIcon, Zap, AlertTriangle, ListChecks, Crown, Sparkles, Globe, Brain, AlertCircle, Trophy, Skull } from 'lucide-react';
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
              <Info size={40} />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-primary leading-tight">الدستور الكامل لكارينجو</h1>
              <p className="text-muted-foreground text-base md:text-lg font-bold">كل القوانين والآليات التي تحكم مجتمعنا.</p>
            </div>
          </div>
        </header>

        <section className="space-y-12">
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-primary">
              <Star className="text-yellow-500" fill="currentColor" /> <h2>1. نظام النقاط والمكافآت</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-6 rounded-3xl border border-green-100 text-center">
                  <p className="text-2xl font-black text-green-600">50</p>
                  <p className="text-[10px] font-black uppercase text-green-800">مهمة سهلة</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-center">
                  <p className="text-2xl font-black text-blue-600">70</p>
                  <p className="text-[10px] font-black uppercase text-blue-800">مهمة متوسطة</p>
                </div>
                <div className="bg-red-50 p-6 rounded-3xl border border-red-100 text-center">
                  <p className="text-2xl font-black text-red-600">100</p>
                  <p className="text-[10px] font-black uppercase text-red-800">مهمة صعبة</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-black text-primary text-lg flex items-center gap-2"><TimerIcon className="text-accent" /> بونص التبكير (Early Bird)</h4>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                  نحن نقدس الاستيقاظ مبكراً. بونص التبكير يبدأ بقوة **75 نقطة** عند الساعة 5:00 صباحاً، ثم يتناقص بمقدار **5 نقاط كل ساعة** حتى يختفي تماماً عند الساعة 8:00 مساءً. 
                  <br /><span className="text-accent">القاعدة:</span> كلما أنجزت أبكر، ارتفع رصيدك أسرع!
                </p>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-destructive">
              <AlertTriangle className="text-red-600" /> <h2>2. قانون الانضباط (العقوبات)</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border-red-100 bg-red-50/20 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border-r-4 border-red-600">
                  <Zap className="text-red-600 shrink-0" />
                  <div>
                    <h5 className="font-black text-red-900 text-sm">عقوبة كسر الحماسة (-150 نقطة)</h5>
                    <p className="text-[10px] font-bold text-slate-600 mt-1">تغيبك عن التطبيق ليوم كامل دون إنجاز أي مهمة في أي مسار يؤدي لتصفير عداد أيامك وخصم 150 نقطة فورية من رصيدك العام.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-yellow-600">
              <Crown className="text-yellow-500" fill="currentColor" /> <h2>3. عضوية كارينجو المميزة (Premium)</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border-yellow-100 bg-yellow-50/20 space-y-4">
              <p className="font-bold text-slate-900 text-sm">تمنحك العضوية المميزة صلاحيات مطلقة وتجربة خالية من العوائق:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-yellow-200">
                  <h5 className="font-black text-yellow-800 text-xs flex items-center gap-2"><Sparkles size={12}/> تجربة بدون إعلانات</h5>
                  <p className="text-[10px] font-bold opacity-70">إزالة كاملة للإعلانات المزعجة في كافة أنحاء التطبيق.</p>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-yellow-200">
                  <h5 className="font-black text-yellow-800 text-xs flex items-center gap-2"><Globe size={12}/> نشر غير محدود</h5>
                  <p className="text-[10px] font-bold opacity-70">إمكانية إرسال عدد لا نهائي من المنشورات في المجتمع العام.</p>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-yellow-200">
                  <h5 className="font-black text-yellow-800 text-xs flex items-center gap-2"><ListChecks size={12}/> مهام لا نهائية</h5>
                  <p className="text-[10px] font-bold opacity-70">إضافة عدد غير محدود من المهام الشخصية والتحديات يومياً.</p>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-yellow-200">
                  <h5 className="font-black text-yellow-800 text-xs flex items-center gap-2"><Crown size={12}/> شارة التوثيق الملكية</h5>
                  <p className="text-[10px] font-bold opacity-70">ظهور تاج ذهبي بجانب اسمك في المتصدرين والدردشات.</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-red-800">
              <Skull className="text-red-800" /> <h2>4. جدار العار (Wall of Shame)</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-4">
              <p className="font-bold text-slate-900 leading-relaxed text-sm">
                هذا القسم في لوحة المتصدرين مخصص لفضح المقصرين. يُدرج في جدار العار كل من:
              </p>
              <ul className="space-y-3 text-xs font-bold text-slate-700 pr-4 list-disc">
                <li>وصلت نقاطه إلى **صفر** بسبب العقوبات المتتالية.</li>
                <li>كان نشطاً خلال **آخر 7 أيام** فقط (لا يظهر فيه القدامى المختفون).</li>
                <li>يتم رفع اسمك من جدار العار فور حصولك على أول نقطة إنجاز جديدة.</li>
              </ul>
            </Card>
          </div>
        </section>

        <footer className="pt-20 opacity-40 font-black text-primary text-[10px] md:text-xs text-center">
          كارينجو - نظام نمو متكامل - جميع الحقوق محفوظة © Artiatech Studio 2026
        </footer>
      </div>
    </div>
  );
}
