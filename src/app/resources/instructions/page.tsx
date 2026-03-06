"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Trophy, Flame, Activity, Zap, Clock, Star, HeartPulse, UserCheck, Timer } from 'lucide-react';
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
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2.5rem] flex items-center justify-center shadow-xl border border-primary/20">
              <Info size={48} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight">دليل التعليمات الشامل</h1>
              <p className="text-muted-foreground text-lg font-bold">كل ما تحتاجه لتكون بطلاً في عالم كارينجو.</p>
            </div>
          </div>
        </header>

        <section className="space-y-12">
          {/* نظام بونص التبكير - توسيع الشرح */}
          <div className="space-y-6 text-right">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-accent">
              <Timer className="animate-pulse" /> <h2>بونص التبكير (Early Bird Bonus)</h2>
            </div>
            <Card className="p-8 rounded-[3rem] shadow-2xl border border-accent/20 bg-card space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 bg-accent/5 rounded-full -translate-x-12 -translate-y-12" />
              <div className="space-y-4">
                <p className="font-bold text-lg leading-relaxed">بونص التبكير هو نظام مكافآت ذكي مصمم لبرمجة عقلك على الإنجاز في ساعات الصباح الأولى، وهي الساعات الأكثر إنتاجية:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-2">
                    <h4 className="font-black text-primary text-lg">البداية الذهبية</h4>
                    <p className="text-sm font-bold text-muted-foreground">يبدأ التوقيت من الساعة <span className="text-primary font-black">5:00 صباحاً</span>، حيث تحصل على أعلى بونص ممكن: <span className="text-primary font-black">+75 نقطة</span> إضافية.</p>
                  </div>
                  <div className="bg-accent/5 p-6 rounded-3xl border border-accent/10 space-y-2">
                    <h4 className="font-black text-accent text-lg">التناقص التدريجي</h4>
                    <p className="text-sm font-bold text-muted-foreground">كل ساعة تتأخر فيها بعد الخامسة صباحاً، ينقص البونص بمقدار <span className="text-accent font-black">5 نقاط</span>. كلما بكرت، زادت فرصك في صدارة القائمة.</p>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 space-y-2">
                    <h4 className="font-black text-orange-600 text-lg">نقطة النهاية</h4>
                    <p className="text-sm font-bold text-muted-foreground">ينتهي البونص تماماً عند الساعة <span className="text-orange-600 font-black">8:00 مساءً (20:00)</span>. أي إنجاز بعد هذا الوقت سيمنحك النقاط الأساسية فقط.</p>
                  </div>
                </div>
                <div className="p-6 bg-secondary/30 rounded-2xl border-r-4 border-accent">
                   <p className="text-sm font-bold italic text-primary leading-loose">
                      لماذا الساعة 5 صباحاً؟ الدراسات تؤكد أن الإنجاز الصباحي يفرز هرمون الدوبامين الذي يحسن مزاجك لبقية اليوم. كارينجو يكافئك مادياً (بالنقاط) ليعزز هذا السلوك الإيجابي لديك حتى يتحول إلى عادة تلقائية.
                   </p>
                </div>
              </div>
            </Card>
          </div>

          {/* نظام النقاط الأساسي */}
          <div className="space-y-6 text-right">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-primary">
              <Trophy className="text-yellow-500" /> <h2>نظام النقاط الأساسي</h2>
            </div>
            <Card className="p-8 rounded-[3rem] shadow-xl border border-border bg-card space-y-6">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <p className="font-bold leading-relaxed text-muted-foreground">بجانب البونص، هناك نقاط ثابتة تحصل عليها مقابل كل جهد تبذله:</p>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-4 bg-secondary/20 p-4 rounded-2xl">
                       <Star className="text-yellow-500 fill-yellow-500" size={24} />
                       <p className="font-black">100 نقطة ثابتة لكل مهمة مكتملة.</p>
                    </li>
                    <li className="flex items-center gap-4 bg-secondary/20 p-4 rounded-2xl">
                       <Flame className="text-orange-500 fill-orange-500" size={24} />
                       <p className="font-black">بونص السلسلة: يزداد التقدير لك في لوحة المتصدرين كلما زاد عداد الحماسة.</p>
                    </li>
                  </ul>
                </div>
                <div className="w-full md:w-48 h-48 bg-primary/5 rounded-full flex flex-col items-center justify-center border-4 border-dashed border-primary/20 p-6 text-center">
                   <p className="text-xs font-black text-muted-foreground uppercase">متوسط نقاط اليوم</p>
                   <p className="text-4xl font-black text-primary">175</p>
                   <p className="text-[10px] font-bold text-primary/60">كحد أقصى</p>
                </div>
              </div>
            </Card>
          </div>

          {/* سلسلة الحماسة (Streak) */}
          <div className="space-y-6 text-right">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-orange-600">
              <Flame fill="currentColor" /> <h2>قوانين سلسلة الحماسة (Streak)</h2>
            </div>
            <Card className="p-8 rounded-[3rem] shadow-xl border border-border bg-card space-y-6">
              <div className="bg-orange-500 p-8 rounded-[2rem] text-white space-y-4 shadow-lg">
                <p className="font-black text-xl">الحماسة هي عهدك مع نفسك!</p>
                <p className="font-bold opacity-90 leading-relaxed">لكي لا تفقد عداد الحماسة وتعود للصفر، يجب عليك إكمال مهمة واحدة على الأقل في أي من المسارات الأربعة قبل منتصف الليل. العداد سيتوهج باللون البرتقالي في ملفك الشخصي كدليل على التزامك.</p>
              </div>
            </Card>
          </div>

          {/* نظام الـ BMI ولوحة المتصدرين */}
          <div className="space-y-6 text-right">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-green-600">
              <HeartPulse /> <h2>مؤشر كتلة الجسم (BMI) والترتيب العالمي</h2>
            </div>
            <Card className="p-8 rounded-[3rem] shadow-xl border border-border bg-card space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-black text-primary text-xl">كيف نحدد "بطل الـ BMI"؟</h4>
                  <p className="text-sm font-bold text-muted-foreground leading-relaxed">الوزن المثالي هو استثمار صحي. في لوحة المتصدرين، سيظهر مؤشرك الرقمي وتصنيفه. أصحاب اللون الأخضر (18.5 - 25) هم من نجحوا في موازنة التغذية واللياقة بشكل مثالي.</p>
                </div>
                <div className="space-y-4">
                  <h4 className="font-black text-primary text-xl">عدالة الترتيب (آخر 3 أيام)</h4>
                  <p className="text-sm font-bold text-muted-foreground leading-relaxed">لكي لا يحتكر القدامى الصدارة، نعتمد في الترتيب على متوسط نقاطك في آخر 3 أيام فقط. هذا يعني أن أي مشترك جديد يمكنه الوصول للمركز الأول خلال 72 ساعة من الالتزام الجاد!</p>
                </div>
              </div>
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