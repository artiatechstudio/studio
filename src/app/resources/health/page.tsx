
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Dumbbell, Apple, Activity, Star, Info, CheckCircle2, Zap, Flame, Heart, Ruler, InfoIcon, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export default function FitnessResourcePage() {
  const fitnessGuide = [
    { 
      name: "السكوات الأساسي (Bodyweight Squat)", 
      desc: "التمرين الأم لبناء قوة الجزء السفلي. قف بقدمين بعرض الكتفين، ابدأ بالهبوط بخصرك للخلف كأنك تجلس على كرسي غير مرئي. حافظ على استقامة ظهرك ونظرك للأمام. تأكد أن ركبتيك لا تتجاوزان مستوى أصابع قدميك لتجنب الإصابة.", 
      target: "عضلات الفخذ الأمامية (Quads)، الأرجل الخلفية، والمؤخرة (Glutes)." 
    },
    { 
      name: "البلانك الثابت (Classic Plank)", 
      desc: "أقوى تمرين لثبات الجذع ونحت عضلات البطن. ارتكِز على ساعديك وأطراف أصابع قدميك. حافظ على جسمك خطاً مستقيماً واحداً من الرأس حتى الكعبين. شد عضلات بطنك ومؤخرتك بقوة لمنع تقوس الظهر للأسفل.", 
      target: "عضلات البطن العميقة، الجذع، الأكتاف، وأسفل الظهر." 
    },
    { 
      name: "تمارين الضغط (Push-ups)", 
      desc: "التمرين الكلاسيكي لزيادة قوة الدفع. ارتكِز على يديك بعرض أكبر قليلاً من الكتفين. اهبط بجسمك كاملاً كقطعة واحدة حتى يلمس صدرك الأرض تقريباً، ثم ادفع بقوة للأعلى. حافظ على المرفقين بزاوية 45 درجة مع الجسم.", 
      target: "الصدر (Pectorals)، الأكتاف الأمامية، وعضلة الترايسبس." 
    },
    { 
      name: "تمارين البربي (Burpees)", 
      desc: "التمرين الشامل الحارق للدهون. ابدأ بوضع الوقوف، ثم انزل لوضع القرفصاء وضع يديك على الأرض، اقفز بقدميك للخلف لوضع الضغط، ثم اقفز للأمام للعودة للقرفصاء، وانتهِ بقفزة عمودية قوية نحو السماء.", 
      target: "رفع معدل ضربات القلب، حرق السعرات، وتقوية كامل عضلات الجسم." 
    },
    { 
      name: "تسلق الجبال (Mountain Climbers)", 
      desc: "من وضعية الضغط، قم بتبديل ركبتيك نحو صدرك بسرعة كبيرة كأنك تجري في مكانك وأنت مائل. حافظ على استواء ظهرك وثبات كتفيك فوق معصميك تماماً.", 
      target: "رفع معدل الأيض، تقوية البطن السفلي، وتحسين التنسيق الحركي." 
    },
    { 
      name: "ضغط الأكتاف بوزن الجسم (Pike Push-ups)", 
      desc: "ارفع خصرك للأعلى وأنت في وضع الضغط لتشكل حرف V مقلوب. اهبط برأسك ببطء نحو الأرض بين يديك ثم ادفع للأعلى. هذا التمرين يحاكي ضغط الأوزان الثقيلة للأكتاف.", 
      target: "عضلة الكتف الجانبية والأمامية (Deltoids) والترايسبس." 
    },
    { 
      name: "جسر الجلوتس (Glute Bridge)", 
      desc: "استلقِ على ظهرك مع ثني الركبتين ووضع القدمين على الأرض. ارفع خصرك للأعلى بقوة حتى يصبح جسمك مستقيماً من الكتف للركبة. اعصر عضلات المؤخرة عند القمة لثانيتين قبل الهبوط.", 
      target: "تقوية الظهر السفلي، عضلات المؤخرة، وتحسين استقامة القوام." 
    },
    { 
      name: "تمرين سوبرمان (Superman Hold)", 
      desc: "استلقِ على بطنك ومد ذراعيك أمامك وقدميك خلفك. ارفع صدرك وفخذيك عن الأرض في وقت واحد وثبت لمدة ثانيتين. هذا التمرين هو المفتاح لحماية عمودك الفقري من الجلوس الطويل.", 
      target: "عضلات الظهر الطولية، الأكتاف الخلفية، والمؤخرة." 
    },
    { 
      name: "ضغط الألماس (Diamond Pushups)", 
      desc: "تمرين متقدم؛ ضع يديك تحت منتصف صدرك بحيث يلمس الإبهامان والسبابتان بعضهما ليشكلا شكل ماسة. اهبط وادفع بتركيز كامل على خلفية الذراع.", 
      target: "تركيز مكثف على عضلة الترايسبس وعضلة الصدر الداخلية." 
    },
    { 
      name: "التاباتا والـ HIIT", 
      desc: "نظام تدريب عالي الكثافة يعتمد على بذل أقصى جهد لمدة 20 ثانية، يليه 10 ثوانٍ من الراحة التامة، مكرراً لـ 8 جولات. فعال جداً في حرق الدهون لساعات طويلة بعد التمرين.", 
      target: "تحسين اللياقة التنفسية القلبية وحرق الدهون العنيدة." 
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
                    t: "البروتين: حجر بناء الأبطال", 
                    d: "الألياف العضلية لا تنمو بدون بروتين كافٍ. ركز على المصادر الطبيعية عالية الجودة: البيض المسلوق (6جم بروتين)، صدور الدجاج (31جم لكل 100جم)، التونة، والبقوليات مثل العدس والحمص. يحتاج جسمك للبروتين لإصلاح التمزقات المجهرية التي تحدث أثناء تمرينك المكثف." 
                  },
                  { 
                    t: "الكربوهيدرات المعقدة: وقود الانطلاق", 
                    d: "هي الوقود الذي يحرك ماكينة جسدك. الشوفان، البطاطس المسلوقة، والأرز الأسمر توفر طاقة بطيئة الامتصاص تدوم لساعات، مما يمنع الشعور بالإرهاق المفاجئ أو هبوط السكر أثناء التمرين." 
                  },
                  { 
                    t: "الدهون الصحية: مفتاح الهرمونات والذكاء", 
                    d: "ضرورية لامتصاص الفيتامينات وتنظيم هرمون التستوستيرون والنمو. زيت الزيتون البكر، المكسرات النيئة (لوز/جوز)، والآفوكادو هي وقود عقلك وجهازك العصبي المركزي." 
                  },
                  { 
                    t: "الألياف والماء: نظام التبريد والتنظيف", 
                    d: "بدون ألياف (من الخضروات الورقية) وبدون ماء كافٍ (3 لتر يومياً على الأقل)، لن يستطيع جسمك التخلص من السموم الناتجة عن الحرق أو هضم الطعام بكفاءة عالية. الماء هو سر النشاط الدائم." 
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
