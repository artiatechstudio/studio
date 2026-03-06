
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lightbulb, Target, UserCheck, BookOpen, Brain, Star } from 'lucide-react';
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
              <p className="text-muted-foreground text-lg font-bold">غير عقليتك، تتغير حياتك. أسرار الاستمرارية والنجاح.</p>
            </div>
          </div>
        </header>

        <div className="relative w-full h-[300px] rounded-[3rem] overflow-hidden shadow-2xl">
          <Image 
            src="https://picsum.photos/seed/self-growth/1200/600" 
            alt="التحسين الذاتي" 
            fill 
            className="object-cover"
            data-ai-hint="personal growth"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
            <p className="text-white text-xl font-black">الانضباط هو الجسر بين الأهداف والإنجاز.</p>
          </div>
        </div>

        <section className="space-y-12">
          {/* قاعدة الـ 1% */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-3xl font-black text-primary">
              <Target size={36} /> <h2>قوة الـ 1%: التأثير التراكمي</h2>
            </div>
            <div className="bg-card p-10 rounded-[3rem] shadow-xl border border-border space-y-4 font-bold leading-relaxed">
              <p>يعتقد الكثيرون أن النجاح يتطلب تغييراً هائلاً ومفاجئاً، لكن الحقيقة تكمن في "التحسينات البسيطة المستمرة".</p>
              <div className="bg-secondary/20 p-6 rounded-2xl border-r-4 border-primary">
                <p className="text-primary italic">"إذا تحسنت بنسبة 1% فقط كل يوم لمدة عام، فستكون في نهاية العام أفضل بـ 37 ضعفاً مما كنت عليه في البداية."</p>
              </div>
              <p className="text-sm text-muted-foreground mt-4">ابدأ بـ 5 دقائق تمرين، صفحة واحدة من كتاب، أو كوب ماء إضافي. لا تستهن بالبدايات الصغيرة.</p>
            </div>
          </div>

          {/* بناء الانضباط */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-3xl font-black text-orange-600">
              <UserCheck size={36} /> <h2>الانضباط مقابل الدافع</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-8 rounded-[2.5rem] shadow-lg border border-border space-y-4">
                <h4 className="text-xl font-black text-primary">ما هو الدافع؟</h4>
                <p className="text-sm text-muted-foreground font-bold">هو "الشعور" المؤقت بالرغبة في فعل شيء ما. هو كشرارة البدء، لكنه يختفي عند أول شعور بالتعب أو الملل.</p>
              </div>
              <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-lg space-y-4">
                <h4 className="text-xl font-black">ما هو الانضباط؟</h4>
                <p className="text-sm opacity-90 font-bold">هو القيام بما يجب عليك فعله، حتى عندما لا ترغب في ذلك. هو المحرك الحقيقي الذي يوصلك لخط النهاية.</p>
              </div>
            </div>
          </div>

          {/* العادات والبيئة */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-3xl font-black text-green-600">
              <Brain size={36} /> <h2>هندسة البيئة</h2>
            </div>
            <div className="bg-card p-8 rounded-[3rem] shadow-xl border border-border space-y-6">
              <p className="font-bold leading-relaxed">اجعل العادات الجيدة سهلة، والعادات السيئة صعبة. صمم بيئتك لتخدم أهدافك:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { t: "الرؤية", d: "ضع ملابس التمرين أمام عينيك قبل النوم.", i: Star },
                  { t: "التبسيط", d: "املأ زجاجة الماء وضعها على مكتبك.", i: BookOpen },
                  { t: "التأخير", d: "ضع هاتفك في غرفة أخرى عند الدراسة.", i: Target }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-secondary/10 rounded-2xl text-center space-y-2">
                    <item.i className="mx-auto text-primary" size={24} />
                    <h5 className="font-black text-primary">{item.t}</h5>
                    <p className="text-xs text-muted-foreground font-bold">{item.d}</p>
                  </div>
                ))}
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
