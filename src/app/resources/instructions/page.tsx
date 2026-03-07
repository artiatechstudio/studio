
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Trophy, Flame, Star, Timer as TimerIcon, MessageSquare, UserCircle, Heart, Zap, Map, Search, Sparkles, Activity, ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import { Card } from '@/components/ui/card';

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-background md:pr-64" dir="rtl">
      <NavSidebar />
      <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-8 pb-32 overflow-x-hidden text-right">
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
              <Info size={40} />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-primary leading-tight">دليل كارينجو الشامل</h1>
              <p className="text-muted-foreground text-base md:text-lg font-bold">كل ما تحتاجه لتكون أسطورة في مجتمع النمو الخاص بنا.</p>
            </div>
          </div>
        </header>

        <section className="space-y-12">
          {/* نظام النقاط والبونص */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-orange-600">
              <Star className="text-yellow-500" fill="currentColor" /> <h2>نظام النقاط وبونص التبكير</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-6">
              <p className="font-bold text-base md:text-lg leading-relaxed text-slate-900">
                في كارينجو, نكافئ الانضباط والتبكير. إليك كيف تُحسب نقاطك في كل تحدي:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                  <h4 className="font-black text-primary text-lg mb-2 flex items-center gap-2">100 نقطة أساسية <Zap size={16}/></h4>
                  <p className="text-xs font-bold text-muted-foreground">تحصل عليها بمجرد إكمال أي مهمة في أي مسار بنجاح.</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-200">
                  <h4 className="font-black text-yellow-700 text-lg mb-2 flex items-center gap-2">بونص التبكير (+75) <TimerIcon size={16}/></h4>
                  <p className="text-xs font-bold text-muted-foreground">يبدأ من 5 صباحاً بـ 75 نقطة، ويتناقص 5 نقاط كل ساعة حتى يختفي تماماً الساعة 8 مساءً.</p>
                </div>
              </div>
            </Card>
          </div>

          {/* نظام المسارات والقفل */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-primary">
              <Lock className="text-primary" /> <h2>قانون الـ 24 ساعة</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-4">
              <p className="font-bold text-base md:text-lg leading-relaxed text-slate-900">
                النمو الحقيقي يأتي بالتدريج لا بالسرعة. لذلك نطبق "نظام القفل الذكي":
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-black text-primary shadow-sm shrink-0">1</div>
                  <p className="text-sm font-bold text-muted-foreground">لا يمكنك فتح أكثر من <span className="text-primary font-black">مرحلة واحدة</span> في المسار الواحد خلال اليوم.</p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-black text-primary shadow-sm shrink-0">2</div>
                  <p className="text-sm font-bold text-muted-foreground">المرحلة القادمة تفتح دائماً عند <span className="text-primary font-black">منتصف الليل (00:00)</span>.</p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-black text-primary shadow-sm shrink-0">3</div>
                  <p className="text-sm font-bold text-muted-foreground">الاستثناء الوحيد هو <span className="text-primary font-black">المرحلة الأولى</span> من كل مسار، فهي مفتوحة دائماً للمبتدئين.</p>
                </div>
              </div>
            </Card>
          </div>

          {/* الذكاء الاصطناعي كاري */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-accent">
              <Sparkles className="text-accent" /> <h2>المساعد الذكي "كاري" 🐱</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-accent/20 bg-accent/5 space-y-4">
              <div className="bg-destructive text-destructive-foreground p-4 rounded-2xl text-center font-black animate-pulse shadow-lg border border-white/20">
                تنبيه هام: السيرفر متوقف حالياً إلى أجل غير مسمى 🛑
              </div>
              <p className="font-black text-base md:text-lg leading-relaxed text-primary">
                كاري ليس مجرد أيقونة، إنه رفيقك المدعوم بأحدث تقنيات الذكاء الاصطناعي (Gemini 1.5):
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li className="bg-white/50 p-4 rounded-2xl text-xs font-bold border border-accent/10 text-slate-900 shadow-sm">● <span className="font-black text-primary">نصائح فورية:</span> اطلب منه نصيحة في التغذية أو اللياقة في أي وقت.</li>
                <li className="bg-white/50 p-4 rounded-2xl text-xs font-bold border border-accent/10 text-slate-900 shadow-sm">● <span className="font-black text-primary">تحفيز دائم:</span> سيقوم كاري بتشجيعك بناءً على مستوى تقدمك الفعلي وسلسلة إنجازك.</li>
              </ul>
            </Card>
          </div>

          {/* الترتيب والـ BMI */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-green-600">
              <Activity className="text-green-600" /> <h2>الصحة والترتيب العالمي</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 rounded-3xl border border-border bg-card shadow-lg">
                <h4 className="font-black text-green-700 flex items-center gap-2 mb-3">مؤشر كتلة الجسم (BMI)</h4>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                  نحسبه تلقائياً بناءً على طولك ووزنك. هذا المؤشر خاص بك ولا يظهر للآخرين في البروفايل العام لضمان خصوصيتك الكاملة.
                </p>
              </Card>
              <Card className="p-6 rounded-3xl border border-border bg-card shadow-lg">
                <h4 className="font-black text-blue-700 flex items-center gap-2 mb-3">لوحة المتصدرين العادلة</h4>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                  لا نعتمد فقط على النقاط الإجمالية، بل على <span className="font-black text-primary">متوسط إنجاز آخر 3 أيام</span>. هذا يعطي فرصة للمشتركين الجدد للمنافسة!
                </p>
              </Card>
            </div>
          </div>

          {/* التفاعل الاجتماعي */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-pink-600">
              <Heart className="text-pink-600" fill="currentColor" /> <h2>التواصل مع المجتمع</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border bg-card">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2 p-4 bg-secondary/20 rounded-3xl">
                  <Search className="mx-auto text-primary" />
                  <h5 className="font-black text-sm text-primary">البحث عن أصدقاء</h5>
                  <p className="text-[10px] font-bold text-muted-foreground">ابحث عن مستخدمين آخرين بالاسم وشاهد إنجازاتهم العامة.</p>
                </div>
                <div className="text-center space-y-2 p-4 bg-secondary/20 rounded-3xl">
                  <MessageSquare className="mx-auto text-primary" />
                  <h5 className="font-black text-sm text-primary">دردشة فورية</h5>
                  <p className="text-[10px] font-bold text-muted-foreground">تواصل مع أي عضو في مجتمع كارينجو لتبادل الخبرات.</p>
                </div>
                <div className="text-center space-y-2 p-4 bg-secondary/20 rounded-3xl">
                  <Heart className="mx-auto text-red-500" />
                  <h5 className="font-black text-sm text-red-600">الإعجاب بالملف</h5>
                  <p className="text-[10px] font-bold text-muted-foreground">عبر عن تقديرك لإنجازات الآخرين بضغطة زر واحدة.</p>
                </div>
              </div>
            </Card>
          </div>

          {/* رقم العضوية والأوسمة */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-blue-600">
              <ShieldCheck className="text-blue-600" /> <h2>الهوية والأوسمة</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-4">
              <p className="font-bold text-sm md:text-base leading-relaxed text-slate-900">
                كل مستخدم في كارينجو يحصل على <span className="font-black text-primary">رقم عضوية فخري</span> يعكس ترتيب انضمامه الفعلي للمجتمع. كما يمكنك اكتساب أوسمة آلية عند تحقيق السلاسل (Streaks) أو إكمال عدد معين من التحديات.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="bg-secondary/50 px-4 py-1.5 rounded-full text-[10px] font-black border border-border">أول إنجاز 🏅</span>
                <span className="bg-secondary/50 px-4 py-1.5 rounded-full text-[10px] font-black border border-border">ثلاثية الحماسة 🔥</span>
                <span className="bg-secondary/50 px-4 py-1.5 rounded-full text-[10px] font-black border border-border">بطل الأسبوع 👑</span>
              </div>
            </Card>
          </div>
        </section>

        <footer className="pt-20 opacity-40 font-black text-primary text-[10px] md:text-xs text-center">
          جميع الحقوق محفوظة © Artiatech Studio 2026
        </footer>
      </div>
    </div>
  );
}
