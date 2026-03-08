
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lightbulb, Brain, BookOpen, Target, Star, TrendingUp, Zap, Sparkles, BookCheck, ShieldAlert, Users, PencilLine } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export default function GrowthResourcePage() {
  const theories = [
    { 
      name: "تقنية فاينمان (Feynman Technique)", 
      desc: "أفضل طريقة للتعلم هي التعليم. اختر موضوعاً، تظاهر بأنك تشرحه لطفل في العاشرة. إذا تعثرت، فهذا يعني أن هناك فجوة في فهمك. ارجع للمصادر، بسّط المعلومات، واستخدم الأمثلة الحية حتى يصبح الشرح سلساً." 
    },
    { 
      name: "قصر الذاكرة (Memory Palace)", 
      desc: "تقنية تعتمد على الذاكرة المكانية. تخيل مكاناً تألفه (مثل منزلك)، واربط كل معلومة بقطعة أثاث أو زاوية معينة. عندما تريد استرجاع المعلومة، قم برحلة ذهنية داخل المكان وستجد الأفكار مرتبة في زواياها." 
    },
    { 
      name: "مصفوفة إيزنهاور (Eisenhower Matrix)", 
      desc: "أداة لإدارة الأولويات. قسم مهامك لـ 4 مربعات: (هام ومستعجل: افعله الآن)، (هام وغير مستعجل: خطط له)، (غير هام ومستعجل: فوضه)، (غير هام وغير مستعجل: اتركه فوراً)." 
    },
    { 
      name: "الاستذكار النشط (Active Recall)", 
      desc: "توقف عن القراءة السلبية. بعد قراءة فقرة، أغلق الكتاب وحاول كتابة ما تذكرته أو قوله بصوت عالٍ. هذا الجهد الذهني هو ما يبني الروابط العصبية الحقيقية في دماغك." 
    },
    { 
      name: "قاعدة الـ 5 ثوانٍ (Mel Robbins)", 
      desc: "إذا خطرت لك فكرة للعمل، عد تنازلياً 5-4-3-2-1 وتحرك فوراً. هذا العد التنازلي يقطع دائرة التردد في الدماغ ويمنع 'نظام الحماية' من اختلاق الأعذار للتأجيل." 
    },
    { 
      name: "نظام بومودورو (Pomodoro Technique)", 
      desc: "اعمل بتركيز مطلق لمدة 25 دقيقة، ثم استرح لـ 5 دقائق. هذا النظام يحارب الإجهاد الذهني ويجعل المهمة الكبيرة تبدو كسلسلة من المهام الصغيرة السهلة." 
    },
    { 
      name: "التكرار المتباعد (Spaced Repetition)", 
      desc: "المعلومة تُنسى إذا لم تراجع. راجع ما تعلمته بعد ساعة، ثم يوم، ثم 3 أيام، ثم أسبوع. هذا التوقيت يخبر دماغك أن المعلومة 'حيوية' ويجب نقلها للذاكرة طويلة المدى." 
    },
    { 
      name: "قانون باركنسون (Parkinson's Law)", 
      desc: "العمل يتمدد ليشغل الوقت المتاح له. إذا أعطيت نفسك يوماً لإنهاء بحث، سيستغرق يوماً. إذا أعطيت نفسك ساعتين، ستنهيه في ساعتين. حدد مواعد نهائية ضيقة جداً." 
    },
    {
      name: "التركيز العميق (Deep Work)",
      desc: "القدرة على التركيز دون تشتت في مهمة صعبة معرفياً. تتطلب عزل الهاتف، إغلاق التنبيهات، والعمل في بيئة هادئة لمدة لا تقل عن 90 دقيقة متواصلة للوصول لحالة التدفق (Flow)."
    },
    {
      name: "قوة 'لا' (The Power of No)",
      desc: "كلما قلت 'نعم' لشيء غير مهم، فأنت تقول 'لا' لأهدافك الكبرى. تعلم رفض الطلبات والاجتماعات والمشتتات التي لا تخدم رؤيتك المستقبلية."
    }
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
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center shadow-xl border border-blue-200">
              <Lightbulb size={48} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight">أسرار النمو والدراسة</h1>
              <p className="text-muted-foreground text-lg font-bold">دليلك العقلي لبناء الانضباط وتطوير العقلية الحديدية.</p>
            </div>
          </div>
        </header>

        <div className="relative w-full h-[350px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-card">
          <Image 
            src="https://picsum.photos/seed/careingo-growth-path/1200/800" 
            alt="التحسين الذاتي" 
            fill 
            className="object-cover"
            data-ai-hint="learning desk"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-10">
            <p className="text-white text-2xl font-black">النمو الحقيقي يحدث خارج منطقة الراحة، حيث تبدأ التحديات.</p>
          </div>
        </div>

        <section className="space-y-16">
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-3xl font-black text-primary">
              <Brain size={36} /> <h2>ترسانة الأدوات العقلية</h2>
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
            <div className="bg-card p-10 rounded-[3rem] shadow-xl border border-border space-y-8 leading-relaxed">
              <p className="font-bold text-lg text-primary text-center">النجاح ليس قفزة عملاقة، بل هو سلسلة من الانتصارات الصغيرة اليومية.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 space-y-4">
                  <h4 className="font-black text-primary text-xl flex items-center gap-2"><TrendingUp size={20}/> التأثير التراكمي:</h4>
                  <p className="text-sm font-bold text-muted-foreground leading-relaxed">إذا تحسنت بنسبة 1% فقط يومياً لمدة عام، ستكون أفضل بـ 37 ضعفاً في نهاية السنة. العادات الصغيرة التي تظن أنها غير مؤثرة هي من تصنع مستقبلك.</p>
                </div>
                <div className="bg-accent/5 p-8 rounded-3xl border border-accent/10 space-y-4">
                  <h4 className="font-black text-accent text-xl flex items-center gap-2"><BookCheck size={20}/> هندسة العادات:</h4>
                  <p className="text-sm font-bold text-muted-foreground leading-relaxed">اجعل البدء سهلاً جداً لدرجة أنك لا تستطيع قول "لا". ابدأ بـ 5 دقائق تمرين أو قراءة صفحة واحدة فقط. السر هو في 'البدء' وليس في حجم الإنجاز الأولي.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="pt-20 opacity-40 font-black text-primary text-xs text-center">
          Careingo | تواصل، تحدى، تطور 2026
        </footer>
      </div>
    </div>
  );
}
