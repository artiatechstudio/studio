
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, Shield, HeartPulse, Info, HelpCircle, Activity, Zap, Flame } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import Image from 'next/image';

export default function SafetyResourcePage() {
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
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center shadow-xl">
              <AlertTriangle size={48} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight">السلامة والطوارئ</h1>
              <p className="text-muted-foreground text-lg font-bold">حماية جسدك هي الخطوة الأولى نحو الاستمرارية.</p>
            </div>
          </div>
        </header>

        <div className="relative w-full h-[350px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-card">
          <Image 
            src="https://picsum.photos/seed/safety-ultra/1200/800" 
            alt="السلامة أولا" 
            fill 
            className="object-cover"
            data-ai-hint="safety training"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-10">
            <p className="text-white text-2xl font-black">الألم الحاد هو رسالة استغاثة من جسدك؛ لا تتجاهلها.</p>
          </div>
        </div>

        <section className="space-y-16">
          {/* قسم علامات الخطر المعمق */}
          <div className="bg-red-50 border-r-8 border-red-600 p-10 rounded-[3rem] space-y-6 shadow-xl">
            <h2 className="text-2xl font-black text-red-700 flex items-center gap-3">
              <HeartPulse size={32} /> متى تتوقف فوراً؟ (الأعراض الحرجة)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-red-900 font-bold leading-relaxed">
              <div className="bg-white/50 p-6 rounded-2xl border border-red-100">
                <h5 className="text-red-700 font-black mb-2">1. آلام الصدر والقلب:</h5>
                <p className="text-sm">أي شعور بضغط، ضيق، أو ألم في منطقة الصدر يمتد للفك أو الذراعين يتطلب توقفاً فورياً واتصالاً بالطوارئ.</p>
              </div>
              <div className="bg-white/50 p-6 rounded-2xl border border-red-100">
                <h5 className="text-red-700 font-black mb-2">2. الدوار الحاد والزغللة:</h5>
                <p className="text-sm">فقدان التوازن أو الشعور بالدوار قد يشير إلى انخفاض حاد في السكر أو ضغط الدم، أو بداية ضربة شمس.</p>
              </div>
              <div className="bg-white/50 p-6 rounded-2xl border border-red-100">
                <h5 className="text-red-700 font-black mb-2">3. إصابات المفاصل المفاجئة:</h5>
                <p className="text-sm">سماع صوت "طقطقة" أو "فرقعة" مصحوبة بألم حاد في الركبة، الكاحل، أو الظهر يعني توقف الحركة فوراً.</p>
              </div>
              <div className="bg-white/50 p-6 rounded-2xl border border-red-100">
                <h5 className="text-red-700 font-black mb-2">4. ضيق التنفس الحاد:</h5>
                <p className="text-sm">عدم القدرة على التقاط الأنفاس حتى بعد التوقف عن الحركة بمدة دقيقتين.</p>
              </div>
            </div>
          </div>

          {/* بروتوكول RICE المعمق */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-3xl font-black text-primary">
              <Shield size={36} /> <h2>بروتوكول التعامل مع الإصابات (R.I.C.E)</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { l: "Rest", t: "الراحة (Rest)", d: "توقف عن أي نشاط يحمل العضو المصاب وزناً. الحركة الزائدة تحول الإصابة البسيطة لمزمنة." },
                { l: "Ice", t: "الثلج (Ice)", d: "استخدم الثلج لمدة 15-20 دقيقة كل ساعتين لتقليل الالتهاب والتورم خلال أول 48 ساعة." },
                { l: "Compression", t: "الضغط (Compression)", d: "لف المنطقة برباط ضاغط بشكل معتدل (ليس ضيقاً جداً) لتقليل تجمع السوائل والتورم." },
                { l: "Elevation", t: "الرفع (Elevation)", d: "ارفع العضو المصاب ليكون أعلى من مستوى القلب؛ هذا يساعد في تصريف السوائل وتسكين الألم." }
              ].map((step, i) => (
                <Card key={i} className="p-8 rounded-[2.5rem] border-none shadow-xl bg-card hover:bg-primary/5 transition-colors border border-border">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 font-black text-xl">
                    {step.l[0]}
                  </div>
                  <h5 className="font-black text-primary mb-3 text-lg">{step.t}</h5>
                  <p className="text-xs text-muted-foreground font-bold leading-relaxed">{step.d}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* قسم هندسة التمرين الآمن */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-3xl font-black text-green-600">
              <Zap size={36} /> <h2>هندسة التمرين الآمن</h2>
            </div>
            <div className="bg-card p-10 rounded-[3rem] shadow-xl border border-border space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                     <h4 className="font-black text-xl flex items-center gap-2 text-orange-600"><Flame size={24}/> الإحماء الحركي</h4>
                     <p className="text-sm font-bold text-muted-foreground leading-relaxed">لا تبدأ التمرين بوزن ثقيل مباشرة. الإحماء يرفع درجة حرارة العضلات ويزيد مرونة الأربطة، مما يقلل فرص التمزق بنسبة 70%.</p>
                  </div>
                  <div className="space-y-4">
                     <h4 className="font-black text-xl flex items-center gap-2 text-blue-600"><Activity size={24}/> التدرج (Progression)</h4>
                     <p className="text-sm font-bold text-muted-foreground leading-relaxed">قاعدة الـ 10%: لا تزد شدة تمرينك أو الأوزان التي ترفعها بأكثر من 10% في الأسبوع الواحد لتجنب الإجهاد الزائد.</p>
                  </div>
               </div>
               <div className="bg-secondary/20 p-8 rounded-[2rem] border-r-8 border-primary">
                  <h4 className="font-black text-primary mb-4 flex items-center gap-2"><HelpCircle size={20}/> حقيبة الطوارئ الشخصية</h4>
                  <p className="text-sm font-bold text-muted-foreground leading-relaxed">تأكد دائماً من وجود هاتف مشحون، زجاجة ماء كافية، سناك سريع (مثل التمر أو الموز) لرفع السكر في حالات الهبوط، ومعرفة أقرب مركز صحي لمكان تمرينك.</p>
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
