
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, Timer as TimerIcon, Flame, Milestone, Crown, Sparkles, Globe, Snowflake, Swords, Scale, Camera, Eye, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import { Card } from '@/components/ui/card';

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-background md:pr-64 pb-40" dir="rtl">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-10 overflow-x-hidden text-right">
        <div className="flex justify-start">
          <Link href="/resources" onClick={() => playSound('click')}>
            <Button variant="ghost" className="rounded-full gap-2 text-primary font-bold hover:bg-secondary">
              <ArrowLeft size={18} className="rotate-180" />
              العودة للموارد
            </Button>
          </Link>
        </div>

        <header className="space-y-4">
          <div className="flex items-center justify-start gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center shadow-xl border border-primary/20">
              <div className="text-4xl">ℹ️</div>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-primary leading-tight">دستور Careingo الكامل</h1>
              <p className="text-muted-foreground text-base md:text-lg font-bold">كل القوانين والآليات التقنية التي تحكم مجتمع النمو الخاص بنا.</p>
            </div>
          </div>
        </header>

        <section className="space-y-12">
          {/* نظام التحديات المطور */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-primary">
              <Swords className="text-red-500" /> <h2>1. نظام التحديات الثنائية المطور (PvP)</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border-2 border-primary/10 bg-primary/5 space-y-6">
              <div className="space-y-4">
                <h4 className="font-black text-primary text-lg flex items-center gap-2">كيف تعمل المبارزة؟ ⚔️</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-border space-y-2">
                    <p className="font-black text-primary text-sm flex items-center gap-2"> <CheckCircle2 size={16} className="text-green-500" /> الخطوة 1: الطلب والقفل</p>
                    <p className="text-[11px] font-bold text-muted-foreground">يختار المستخدم خصماً من بروفايله العام، ويحدد المهمة والوقت والرهان (بحد أقصى 100ن). يتم حجز نقاط الرهان مؤقتاً.</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-border space-y-2">
                    <p className="font-black text-primary text-sm flex items-center gap-2"> <TimerIcon size={16} className="text-orange-500" /> الخطوة 2: المؤقتات المنفصلة</p>
                    <p className="text-[11px] font-bold text-muted-foreground">عندما يوافق الخصم، يبدأ مؤقته فوراً. أما المرسل، فيبدأ مؤقته بمجرد فتحه للتطبيق بعد الموافقة. الفائز هو من ينهي المهمة في "زمن أقل" وبدقة أعلى.</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-border space-y-2">
                    <p className="font-black text-primary text-sm flex items-center gap-2"> <Camera size={16} className="text-blue-500" /> الخطوة 3: إثبات الإنجاز</p>
                    <p className="text-[11px] font-bold text-muted-foreground">يجب على من ينهي المهمة رفع "صورة دليل" فورية. تُعرض هذه الصورة للخصم للمراجعة.</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-border space-y-2">
                    <p className="font-black text-primary text-sm flex items-center gap-2"> <Eye size={16} className="text-purple-500" /> الخطوة 4: الاعتراف أو النزاع</p>
                    <p className="text-[11px] font-bold text-muted-foreground">إذا اعترف الخصم بالهزيمة، تُوزع النقاط. إذا رفض الدليل، يتحول الأمر لـ "نزاع عام" يُنشر في المجتمع (المحاكمة) ليصوت الجمهور على النتيجة خلال 24 ساعة.</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-3xl border border-green-100 space-y-4">
                <h4 className="font-black text-green-800 text-sm flex items-center gap-2"><Scale size={16} /> التوضيح الشرعي والتقني:</h4>
                <p className="text-[10px] font-bold text-green-900/70 leading-relaxed">
                  نظام التحديات في كارينجو هو آلية تحفيزية برمجية بحتة؛ النقاط المكتسبة هي "مكافأة نظام" تمنحها المنصة للفائز، والنقاط المخصومة هي "عقوبة تقنية" لعدم الالتزام. **لا يتم انتقال أي قيمة (نقاط) من حساب مستخدم إلى حساب مستخدم آخر مباشرة**، وذلك تجنباً لشبهة القمار وضماناً لتوافق النظام مع مبادئ الشريعة الإسلامية.
                </p>
              </div>
            </Card>
          </div>

          {/* القسم الثاني: النقاط والحماسة */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-primary">
              <Star className="text-yellow-500" fill="currentColor" /> <h2>2. نظام النقاط والحماسة</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-8">
              <div className="space-y-4">
                <h4 className="font-black text-primary text-lg flex items-center gap-2"><Flame className="text-orange-500" /> عداد الحماسة (Streak)</h4>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">يزداد عداد الحماسة بمقدار يوم واحد فور إنجازك لأول مهمة في اليوم الجديد. إذا غبت يوماً كاملًا دون "تجميد حماسة"، سيعود العداد للصفر وسيتم خصم نقاط غياب.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-6 rounded-3xl border border-green-100 text-center"><p className="text-2xl font-black text-green-600">50</p><p className="text-[10px] font-black uppercase text-green-800">مهمة سهلة</p></div>
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-center"><p className="text-2xl font-black text-blue-600">70</p><p className="text-[10px] font-black uppercase text-blue-800">مهمة متوسطة</p></div>
                <div className="bg-red-50 p-6 rounded-3xl border border-red-100 text-center"><p className="text-2xl font-black text-red-600">100</p><p className="text-[10px] font-black uppercase text-red-800">مهمة صعبة</p></div>
              </div>
            </Card>
          </div>

          {/* الرتب */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-primary">
              <Milestone className="text-blue-500" /> <h2>3. نظام الرتب (Rank System)</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-6">
              <div className="space-y-3">
                {[
                  { r: "الأسطورة 👑", p: "10,000+ نقطة", d: "لقد وصلت لقمة الجبل، اسمك يتردد في كل أرجاء كاري." },
                  { r: "نخبة كاري 🏅", p: "5,000 - 9,999 نقطة", d: "أنت الآن ضمن صفوة المستخدمين وأكثرهم انضباطاً." },
                  { r: "بطل صاعد 🔥", p: "2,000 - 4,999 نقطة", d: "تجاوزت مرحلة الهواة وأصبحت منافساً حقيقياً." },
                  { r: "مكافح مجتهد 🐱", p: "500 - 1,999 نقطة", d: "بدأت عاداتك بالاستقرار، استمر في السعي." },
                  { r: "مكتشف جديد 🌱", p: "0 - 499 نقطة", d: "بدايتك في الرحلة، كل بطل بدأ هكذا." }
                ].map((rank, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-secondary/20 rounded-2xl border border-border/50">
                    <div className="text-right flex-1">
                      <p className="font-black text-primary text-sm">{rank.r} <span className="text-[9px] font-bold text-muted-foreground mr-2">({rank.p})</span></p>
                      <p className="text-[10px] font-bold text-muted-foreground mt-1">{rank.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* البريميوم */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-yellow-600">
              <Crown className="text-yellow-500" fill="currentColor" /> <h2>4. عضوية Careingo الملكية (Premium)</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border-yellow-100 bg-yellow-50/20 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                {[
                  { t: "تحديات غير محدودة ⚔️", d: "أرسل تحديات لأي بطل في المجتمع دون قيود (المجاني: 2 أسبوعياً).", i: Swords },
                  { t: "تجميد الحماسة (Streak Freeze)", d: "تحصل على 2 تجميد شهرياً يحميك من فقدان سجل التزامك.", i: Snowflake },
                  { t: "نشر غير محدود", d: "انشر محتواك في المجتمع العام دون قيود المنشورين اليوميين.", i: Globe },
                  { t: "تجربة نقية", d: "تصفح التطبيق بسرعة فائقة وبدون أي إعلانات.", i: Sparkles }
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white/60 rounded-2xl border border-yellow-100">
                    <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center shrink-0"><feat.i size={16}/></div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-primary">{feat.t}</p>
                      <p className="text-[8px] font-bold text-muted-foreground leading-tight">{feat.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* الماستر */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-primary">
              <Sparkles className="text-accent" /> <h2>5. الماستر</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-4">
              <p className="text-sm font-bold text-slate-700 leading-relaxed">
                هذا الوضع مخصص لتجاوز الحدود. يمكنك اختيار تحديات عشوائية من فئات مختلفة ومستويات صعوبة متنوعة. تذكر: بعض التحديات محمية زمنياً ولا يمكن إنهاؤها قبل اكتمال المؤقت لضمان الانضباط التام.
              </p>
            </Card>
          </div>
        </section>

        <footer className="pt-20 opacity-40 font-black text-primary text-[10px] md:text-xs text-center">
          Careingo | تواصل، تحدى، تطور - جميع الحقوق محفوظة 2026
        </footer>
      </div>
    </div>
  );
}
