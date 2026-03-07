
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lightbulb, Brain, BookOpen, Target, Star, TrendingUp, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export default function GrowthResourcePage() {
  const theories = [
    { name: "تقنية فاينمان (Feynman Technique)", desc: "لتعلم أي شيء بعمق، حاول شرحه بكلمات بسيطة لطفل عمره 10 سنوات. إذا تعثرت، عد للمصدر واقرأ مجدداً." },
    { name: "قصر الذاكرة (Memory Palace)", desc: "اربط المعلومات التي تدرسها بأماكن مادية تعرفها في منزلك. تخيل أن كل معلومة مخزنة في درج أو زاوية معينة." },
    { name: "مصفوفة إيزنهاور", desc: "تقسيم المهام لـ (مهم ومستعجل، مهم وغير مستعجل، غير مهم ومستعجل، غير مهم وغير مستعجل). ركز على المربع الثاني للنمو." },
    { name: "الاستذكار النشط (Active Recall)", desc: "بدلاً من قراءة الكتاب مراراً، أغلقه وحاول استرجاع ما قرأت من ذاكرتك. هذا يقوي الروابط العصبية." },
    { name: "قاعدة الـ 5 ثوانٍ", desc: "إذا خطرت لك فكرة إيجابية للعمل، ابدأ بالعد التنازلي 5-4-3-2-1 وتحرك فوراً قبل أن يقتلك عقلك بالأعذار." },
    { name: "التبكير (Early Bird)", desc: "استغلال ساعات الصباح الأولى (5-8 صباحاً) حيث يكون الدماغ في قمة نشاطه والبيئة خالية من المشتتات." }
  ];

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
              <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight">أسرار النمو والدراسة</h1>
              <p className="text-muted-foreground text-lg font-bold">دليلك العقلي لتجاوز تحديات السلوك والتعلم.</p>
            </div>
          </div>
        </header>

        <div className="relative w-full h-[350px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-card">
          <Image 
            src="https://picsum.photos/seed/growth-theories/1200/800" 
            alt="التحسين الذاتي" 
            fill 
            className="object-cover"
            data-ai-hint="personal development"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-10">
            <p className="text-white text-2xl font-black">العقل الذي يتوسع بفكرة جديدة لن يعود أبداً لأبعاده القديمة.</p>
          </div>
        </div>

        <section className="space-y-16">
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-3xl font-black text-primary">
              <Brain size={36} /> <h2>أدوات التفوق العقلي</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {theories.map((theory, i) => (
                <Card key={i} className="rounded-3xl border-none shadow-lg bg-card hover:bg-primary/5 transition-all">
                  <div className="p-6 space-y-4">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                      <Sparkles size={20} />
                    </div>
                    <h3 className="font-black text-primary text-base">{theory.name}</h3>
                    <p className="text-xs font-bold text-muted-foreground leading-relaxed">{theory.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-4 text-3xl font-black text-orange-600">
              <Target size={36} /> <h2>فلسفة الكايزن: قوة الـ 1%</h2>
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
        </section>

        <footer className="pt-20 opacity-40 font-black text-primary text-xs text-center">
          جميع الحقوق محفوظة © Artiatech Studio 2026
        </footer>
      </div>
    </div>
  );
}
