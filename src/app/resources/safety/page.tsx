
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, Shield, Phone, HeartPulse, Info, HelpCircle } from 'lucide-react';
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
              <p className="text-muted-foreground text-lg font-bold">صحتك هي الأولوية؛ تعلم كيف تحمي نفسك أثناء الرحلة.</p>
            </div>
          </div>
        </header>

        <div className="relative w-full h-[300px] rounded-[3rem] overflow-hidden shadow-2xl">
          <Image 
            src="https://picsum.photos/seed/safety-first/1200/600" 
            alt="السلامة أولا" 
            fill 
            className="object-cover"
            data-ai-hint="safety protection"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
            <p className="text-white text-xl font-black">لا تتجاوز حدود جسدك بالألم؛ استمع له.</p>
          </div>
        </div>

        <section className="space-y-12">
          {/* علامات الخطر */}
          <div className="bg-red-50 border-r-8 border-red-600 p-8 rounded-[2.5rem] space-y-4">
            <h2 className="text-2xl font-black text-red-700 flex items-center gap-3">
              <HeartPulse size={32} /> متى تتوقف فوراً؟
            </h2>
            <p className="font-bold text-red-900 leading-relaxed">إذا شعرت بأي من الأعراض التالية، أوقف تمرينك واطلب المساعدة الطبية إذا استمر الألم:</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-red-800 font-bold">
              <li>● ألم حاد ومفاجئ في الصدر.</li>
              <li>● دوار شديد أو زغللة في العينين.</li>
              <li>● ضيق تنفس غير مبرر.</li>
              <li>● سماع صوت "فرقعة" في المفصل يصاحبه ألم.</li>
              <li>● تشنجات عضلية حادة لا تزول بالتمدد.</li>
            </ul>
          </div>

          {/* نظام RICE */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-3xl font-black text-primary">
              <Shield size={36} /> <h2>الإسعاف الأولي للإصابات (R.I.C.E)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { l: "Rest", t: "الراحة", d: "توقف عن الحركة لمنع تفاقم الإصابة." },
                { l: "Ice", t: "الثلج", d: "ضع الثلج 15 دقيقة لتقليل التورم." },
                { l: "Compression", t: "الضغط", d: "استخدم ضمادة مرنة لدعم المفصل." },
                { l: "Elevation", t: "الرفع", d: "ارفع العضو المصاب أعلى من القلب." }
              ].map((step, i) => (
                <Card key={i} className="p-6 rounded-[2rem] border-none shadow-lg bg-card">
                  <h4 className="text-primary font-black text-lg mb-1">{step.l}</h4>
                  <h5 className="font-bold mb-2">{step.t}</h5>
                  <p className="text-xs text-muted-foreground font-bold">{step.d}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* نصائح التدريب الآمن */}
          <div className="bg-card p-10 rounded-[3rem] shadow-xl border border-border space-y-6">
            <h2 className="text-2xl font-black text-primary flex items-center gap-3">
              <Info size={32} /> قواعد التدريب الآمن
            </h2>
            <div className="space-y-4 text-muted-foreground font-bold leading-relaxed">
              <p>1. <span className="text-primary">الإحماء ضرورة:</span> لا تبدأ التمرين المكثف أبداً دون 5-10 دقائق من التحمية الخفيفة.</p>
              <p>2. <span className="text-primary">التدرج:</span> لا تحاول كسر الأرقام القياسية في يومك الأول. النمو رحلة ماراثون وليس سباق سرعة.</p>
              <p>3. <span className="text-primary">بيئة آمنة:</span> تأكد من خلو مكان تمرينك من العوائق، وارتدِ حذاءً مناسباً لنوع النشاط.</p>
              <p>4. <span className="text-primary">أرقام الطوارئ:</span> احفظ رقم الطوارئ المحلي في هاتفك (مثلاً 999 أو 911 حسب بلدك).</p>
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
