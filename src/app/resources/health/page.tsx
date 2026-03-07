
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Dumbbell, Apple, Activity, Star, Info, CheckCircle2, Zap, Flame, Heart } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export default function FitnessResourcePage() {
  const fitnessGuide = [
    { 
      name: "السكوات (Squats)", 
      desc: "التمرين الأساسي لبناء قوة الجزء السفلي. قف بقدمين بعرض الكتفين، اهبط بخصرك للخلف كأنك تجلس على كرسي غير مرئي. حافظ على استقامة ظهرك وتأكد أن ركبتيك لا تتجاوزان أصابع قدميك.", 
      target: "عضلات الأرجل (Front & Back) والظهر السفلي." 
    },
    { 
      name: "البلانك (Plank)", 
      desc: "أفضل تمرين لثبات الجذع. ارتكِز على ساعديك وأطراف أصابع قدميك. اجعل جسمك خطاً مستقيماً من الرأس إلى الكعبين. شد عضلات بطنك بقوة لمنع تقوس الظهر.", 
      target: "عضلات البطن، الجذع، والأكتاف." 
    },
    { 
      name: "تمارين الضغط (Pushups)", 
      desc: "تمرين كلاسيكي لقوة الجزء العلوي. ارتكِز على يديك بعرض أكبر قليلاً من الكتفين، اهبط بصدرك نحو الأرض حتى يقترب منها، ثم ادفع للأعلى بقوة.", 
      target: "الصدر، الأكتاف، والترايسبس." 
    },
    { 
      name: "البربي (Burpees)", 
      desc: "تمرين حارق للدهون وعالي الكثافة. يبدأ بوضع الوقوف، ثم القفز لوضع الضغط، ثم العودة بسرعة للوقوف مع قفزة عمودية نحو الأعلى.", 
      target: "تمرين شامل للجسم (Full Body) والكارديو." 
    },
    { 
      name: "تسلق الجبال (Mountain Climbers)", 
      desc: "في وضع الضغط، قم بتبديل ركبتيك نحو صدرك بسرعة كبيرة كأنك تجري في مكانك. حافظ على استواء ظهرك.", 
      target: "عضلات البطن السفلية ورفع معدل ضربات القلب." 
    },
    { 
      name: "ضغط الأكتاف (Shoulder Press)", 
      desc: "يمكن تنفيذه بوزن الجسم عبر وضعية (Pike) أو باستخدام أوزان. ادفع اليدين للأعلى فوق الرأس ببطء وتحكم كامل لضمان استهداف الألياف العضلية.", 
      target: "الأكتاف (Deltoids) وعضلات الرقبة الخلفية." 
    },
    { 
      name: "جسر الجلوتس (Glute Bridge)", 
      desc: "استلقِ على ظهرك مع ثني الركبتين، ارفع خصرك للأعلى حتى يصبح جسمك مستقيماً من الكتف للركبة. اقبض عضلات المؤخرة بقوة عند القمة.", 
      target: "تقوية الظهر السفلي والمؤخرة والأرجل الخلفية." 
    },
    { 
      name: "تمرين سوبرمان (Superman)", 
      desc: "استلقِ على بطنك مع مد ذراعيك للأمام. ارفع صدرك وفخذيك عن الأرض في وقت واحد وثبت لثانيتين قبل الهبوط ببطء.", 
      target: "عضلات الظهر الطولية وحماية العمود الفقري." 
    },
    { 
      name: "ضغط الألماس (Diamond Pushups)", 
      desc: "تمرين متقدم؛ ضع يديك تحت صدرك بحيث يلمس الإبهامان والسبابتان بعضهما ليشكلا شكل ماسة. اهبط وادفع بتركيز.", 
      target: "تركيز مكثف على الترايسبس وعضلة الصدر الداخلية." 
    },
    { 
      name: "التاباتا والـ HIIT", 
      desc: "نظام تدريب عالي الكثافة (20 ثانية عمل مكثف متبوعاً بـ 10 ثوانٍ راحة). فعال جداً في رفع معدل الحرق لساعات بعد التمرين.", 
      target: "حرق الدهون وتحسين اللياقة التنفسية." 
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
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center shadow-xl border border-red-200">
              <Dumbbell size={48} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight">دليل اللياقة والتمارين</h1>
              <p className="text-muted-foreground text-lg font-bold">الموسوعة الكاملة لتحديات الـ 120 يوماً.</p>
            </div>
          </div>
        </header>

        <div className="relative w-full h-[350px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-card">
          <Image 
            src="https://picsum.photos/seed/fitness-ultra/1200/800" 
            alt="لياقة بدنية" 
            fill 
            className="object-cover"
            data-ai-hint="gym fitness"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-10">
            <p className="text-white text-2xl font-black">أداؤك الصحيح للتمرين هو ما يبني جسدك، وليس عدد التكرارات الخاطئة.</p>
          </div>
        </div>

        <section className="space-y-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-primary flex items-center gap-3">
              <Activity size={32} /> قاموس التمارين المفسر
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fitnessGuide.map((item, i) => (
                <Card key={i} className="rounded-3xl border-none shadow-lg bg-card overflow-hidden hover:scale-[1.02] transition-transform">
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
              <Apple size={32} /> دليل التغذية والهندسة الحيوية
            </h2>
            <div className="bg-green-50/50 p-8 rounded-[3rem] border border-green-100 space-y-8">
              <div className="grid grid-cols-1 gap-6">
                {[
                  { 
                    t: "البروتين: حجر البناء", 
                    d: "العضلات لا تنمو بدونه. ركز على المصادر الطبيعية مثل البيض، صدور الدجاج، البقوليات، والتونة. يحتاج جسمك للبروتين لإصلاح الأنسجة التي تمزقت أثناء التمرين." 
                  },
                  { 
                    t: "الكربوهيدرات المعقدة: وقود الطاقة", 
                    d: "هي الوقود الذي يحركك. الشوفان، البطاطس، والأرز الأسمر توفر طاقة بطيئة الامتصاص تدوم طويلاً، مما يمنع الشعور بالإرهاق المفاجئ." 
                  },
                  { 
                    t: "الدهون الصحية: مفتاح الهرمونات", 
                    d: "ضرورية لامتصاص الفيتامينات وتنظيم الهرمونات. زيت الزيتون، المكسرات الخام، والآفوكادو هي وقود عقلك وجهازك العصبي." 
                  },
                  { 
                    t: "الألياف والماء: نظام التنظيف", 
                    d: "بدون ألياف (من الخضار) وبدون ماء كافٍ (3 لتر يومياً)، لن يستطيع جسمك التخلص من السموم أو هضم الطعام بكفاءة." 
                  }
                ].map((nut, i) => (
                  <div key={i} className="flex items-start gap-4 p-6 bg-white rounded-3xl shadow-sm border border-green-100">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="text-green-600" />
                    </div>
                    <div>
                      <h5 className="font-black text-primary text-base">{nut.t}</h5>
                      <p className="text-xs font-bold text-muted-foreground leading-relaxed mt-1">{nut.d}</p>
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
