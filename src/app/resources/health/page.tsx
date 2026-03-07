
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Dumbbell, Apple, Activity, Star, Info, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export default function FitnessResourcePage() {
  const fitnessGuide = [
    { name: "السكوات (Squats)", desc: "قف بقدمين بعرض الكتفين، اهبط بخصرك كأنك تجلس على كرسي مع الحفاظ على استقامة الظهر.", target: "عضلات الأرجل والظهر السفلي." },
    { name: "البلانك (Plank)", desc: "ارتكز على ساعديك وأطراف أصابع قدميك مع جعل جسمك خطاً مستقيماً واحداً.", target: "عضلات الجذع والبطن." },
    { name: "تمارين الضغط (Pushups)", desc: "ارتكز على يديك واهبط بصدرك نحو الأرض ثم ادفع للأعلى.", target: "الصدر، الأكتاف، والترايسبس." },
    { name: "البربي (Burpees)", desc: "تمرين مركب يبدأ بسكوات ثم قفزة للخلف لوضع الضغط ثم العودة للوقوف والقفز.", target: "كامل الجسم وحرق الدهون." },
    { name: "تسلق الجبال (Mountain Climbers)", desc: "في وضع الضغط، قم بتبديل ركبتيك نحو صدرك بسرعة كأنك تجري.", target: "الكارديو والبطن." },
    { name: "ضغط الأكتاف (Shoulder Press)", desc: "دفع الوزن (أو اليدين) للأعلى فوق الرأس ببطء وتحكم.", target: "الأكتاف والرقبة." },
    { name: "جسر الجلوتس (Glute Bridge)", desc: "استلقِ على ظهرك وارفع خصرك للأعلى مع قبض عضلات المؤخرة.", target: "تقوية الظهر السفلي والأرجل." },
    { name: "تمرين سوبرمان (Superman)", desc: "استلقِ على بطنك وارفع يديك وقدميك عن الأرض في وقت واحد.", target: "عضلات الظهر الطولية." }
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
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center shadow-xl">
              <Dumbbell size={48} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight">دليل اللياقة والتمارين</h1>
              <p className="text-muted-foreground text-lg font-bold">كل ما تحتاجه لتنفيذ تحديات الـ 120 يوماً باحترافية.</p>
            </div>
          </div>
        </header>

        <div className="relative w-full h-[350px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-card">
          <Image 
            src="https://picsum.photos/seed/fitness-guide/1200/800" 
            alt="لياقة بدنية" 
            fill 
            className="object-cover"
            data-ai-hint="gym workout"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-10">
            <p className="text-white text-2xl font-black">أداؤك الصحيح للتمرين أهم بكثير من سرعة تنفيذه.</p>
          </div>
        </div>

        <section className="space-y-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-primary flex items-center gap-3">
              <Activity size={32} /> قاموس التمارين المصور
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fitnessGuide.map((item, i) => (
                <Card key={i} className="rounded-3xl border-none shadow-lg bg-card overflow-hidden">
                  <div className="bg-primary/5 p-4 border-b border-primary/10">
                    <h3 className="font-black text-primary text-lg">{item.name}</h3>
                  </div>
                  <CardContent className="p-6 space-y-3">
                    <p className="text-sm font-bold text-muted-foreground leading-relaxed">{item.desc}</p>
                    <div className="bg-secondary/50 p-2 rounded-xl text-[10px] font-black text-accent uppercase flex items-center gap-2">
                      <Star size={12} fill="currentColor" /> يستهدف: {item.target}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-green-600 flex items-center gap-3">
              <Apple size={32} /> دليل التغذية السريع
            </h2>
            <div className="bg-green-50/50 p-8 rounded-[3rem] border border-green-100 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { t: "البروتين", d: "حجر الأساس لبناء العضلات. ركز على البيض، صدور الدجاج، البقوليات، والتونة." },
                  { t: "الكربوهيدرات المعقدة", d: "وقود الطاقة طويل الأمد. الشوفان، البطاطس، والأرز الأسمر هي خياراتك المثالية." },
                  { t: "الدهون الصحية", d: "ضرورية للهرمونات. زيت الزيتون، المكسرات الخام، والآفوكادو." }
                ].map((nut, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm">
                    <CheckCircle2 className="text-green-600 shrink-0" />
                    <div>
                      <h5 className="font-black text-primary text-sm">{nut.t}</h5>
                      <p className="text-xs font-bold text-muted-foreground">{nut.d}</p>
                    </div>
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
