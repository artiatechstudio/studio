
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Trophy, Flame, Activity, Zap, Clock, Star, HeartPulse, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import { Card } from '@/components/ui/card';

export default function InstructionsPage() {
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

        <header className="space-y-4 text-right">
          <div className="flex items-center justify-start gap-6">
            <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
              <Info size={48} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight">دليل التعليمات</h1>
              <p className="text-muted-foreground text-lg font-bold">فهم آليات العمل هو أول خطوة في رحلة التميز.</p>
            </div>
          </div>
        </header>

        <section className="space-y-12">
          {/* نظام النقاط والبونص */}
          <div className="space-y-6 text-right">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-primary">
              <Trophy className="text-yellow-500" /> <h2>نظام النقاط والبونص</h2>
            </div>
            <Card className="p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-6">
              <p className="font-bold leading-relaxed text-muted-foreground">تعتمد النقاط في كارينجو على سرعة الإنجاز وجودة الالتزام:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-secondary/20 p-6 rounded-2xl space-y-3">
                  <h4 className="font-black text-primary flex items-center gap-2"><Star size={18} /> النقاط الأساسية:</h4>
                  <p className="text-sm font-bold">تحصل على <span className="text-primary">100 نقطة</span> ثابتة عند إكمال أي مهمة في أي مسار.</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-2xl space-y-3 border border-orange-100">
                  <h4 className="font-black text-orange-600 flex items-center gap-2"><Clock size={18} /> بونص التبكير:</h4>
                  <p className="text-sm font-bold">نظام ذكي يحفزك على البدء باكراً. يبدأ البونص من <span className="text-orange-600">75 نقطة إضافية</span> في الساعة 5 صباحاً، ويتناقص تدريجياً كل ساعة حتى ينتهي تماماً في الساعة 8 مساءً.</p>
                </div>
              </div>
            </Card>
          </div>

          {/* سلسلة الحماسة */}
          <div className="space-y-6 text-right">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-orange-600">
              <Flame fill="currentColor" /> <h2>سلسلة الحماسة (Streak)</h2>
            </div>
            <Card className="p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                  <p className="font-bold text-muted-foreground leading-relaxed">الحماسة هي قلب التطبيق النابض، وهي تمثل استمراريتك اليومية:</p>
                  <ul className="space-y-3 text-sm font-bold">
                    <li className="flex items-center gap-2">● يزداد عداد الحماسة <span className="text-orange-600">+1</span> عند إكمال أول مهمة لك في اليوم.</li>
                    <li className="flex items-center gap-2">● إذا انتهى اليوم (منتصف الليل) ولم تنجز أي مهمة، سيعود العداد إلى <span className="text-red-500 font-black">الصفر</span>.</li>
                    <li className="flex items-center gap-2">● تظهر الحماسة بجانب اسمك في لوحة المتصدرين كدليل على قوتك.</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* نظام الـ BMI ولوحة المتصدرين */}
          <div className="space-y-6 text-right">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-green-600">
              <HeartPulse /> <h2>مؤشر كتلة الجسم (BMI)</h2>
            </div>
            <Card className="p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-6">
              <p className="font-bold text-muted-foreground leading-relaxed">نستخدم الـ BMI لقياس نجاحك الصحي ودمجه في ترتيبك العالمي:</p>
              <div className="bg-green-50 p-6 rounded-3xl border border-green-100 text-center">
                <h4 className="font-black text-green-800 mb-4 text-xl">كيف نحسبه؟</h4>
                <div className="bg-white p-6 rounded-2xl shadow-sm inline-block font-black text-green-600 text-2xl border-2 border-green-200">
                  الوزن (كجم) / (الطول بالامتار)²
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="text-xs font-bold p-2 bg-blue-100 rounded-xl">ناقص: أقل من 18.5</div>
                  <div className="text-xs font-bold p-2 bg-green-100 rounded-xl">مثالي: 18.5 - 24.9</div>
                  <div className="text-xs font-bold p-2 bg-orange-100 rounded-xl">زائد: 25 - 29.9</div>
                  <div className="text-xs font-bold p-2 bg-red-100 rounded-xl">سمنة: 30 فما فوق</div>
                </div>
              </div>
              <p className="text-sm font-bold text-muted-foreground">يظهر هذا المؤشر في لوحة المتصدرين ليبرز أصحاب "النجاح الصحي" الذين حافظوا على أوزان مثالية تزامناً مع تقدمهم في المسارات.</p>
            </Card>
          </div>

          {/* لوحة المتصدرين الذكية */}
          <div className="space-y-6 text-right">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-primary">
              <Activity /> <h2>لوحة المتصدرين (Leaderboard)</h2>
            </div>
            <Card className="p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-4">
              <p className="font-bold text-muted-foreground leading-relaxed">الترتيب في كارينجو لا يعتمد فقط على مجموع النقاط الكلي، بل على <span className="text-primary">الأداء الحديث</span>:</p>
              <div className="space-y-4 text-sm font-bold">
                <div className="p-4 bg-secondary/20 rounded-2xl border-r-4 border-primary">
                  يتم حساب الترتيب بناءً على <span className="text-primary font-black">متوسط نقاطك في آخر 3 أيام</span>. هذا يعطي الفرصة للأعضاء الجدد والنشطين للتفوق على الأقدم إذا كانوا أكثر التزاماً اليوم.
                </div>
              </div>
            </Card>
          </div>

          {/* المسارات والمراحل */}
          <div className="space-y-6 text-right">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-accent">
              <UserCheck /> <h2>المسارات والتقدم</h2>
            </div>
            <Card className="p-8 rounded-[2.5rem] shadow-xl border border-border bg-card">
              <ul className="space-y-4 text-sm font-bold text-muted-foreground leading-relaxed">
                <li className="flex items-start gap-2">● يتكون كل مسار من <span className="font-black text-accent">30 يوماً</span> (مرحلة).</li>
                <li className="flex items-start gap-2">● يمكنك إكمال <span className="font-black text-accent">مرحلة واحدة فقط</span> في كل مسار يومياً. لا يمكنك القفز للمراحل المستقبلية قبل وقتها.</li>
                <li className="flex items-start gap-2">● يتم فتح المرحلة التالية تلقائياً في اليوم التالي عند إكمال المرحلة الحالية.</li>
              </ul>
            </Card>
          </div>
        </section>

        <footer className="pt-20 opacity-40 font-black text-primary text-xs text-center">
          جميع الحقوق محفوظة © Artiatech Studio 2026
        </footer>
      </div>
    </div>
  );
}
