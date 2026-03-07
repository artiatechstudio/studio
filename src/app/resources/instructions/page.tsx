
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Star, Timer as TimerIcon, Zap, AlertTriangle, ListChecks, Crown, Sparkles, Globe, Brain, AlertCircle, Trophy, Skull, Medal, Flame, Heart, Swords } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import { Card } from '@/components/ui/card';

export default function InstructionsPage() {
  const badgeCategories = [
    {
      title: "أوسمة الالتزام (Streaks)",
      items: [
        { name: "البداية الواثقة", criteria: "إكمال 3 أيام متتالية", icon: "🌱" },
        { name: "المحارب الأسبوعي", criteria: "إكمال 7 أيام متتالية", icon: "⚔️" },
        { name: "باني العادات", criteria: "إكمال 21 يوماً متتالياً", icon: "🏗️" },
        { name: "أسطورة الشهر", criteria: "إكمال 30 يوماً متتالياً", icon: "🏆" },
        { name: "الخالد", criteria: "إكمال 60 يوماً متتالياً", icon: "♾️" }
      ]
    },
    {
      title: "أوسمة النقاط (Wealth)",
      items: [
        { name: "جامع النقاط", criteria: "الوصول لـ 1,000 نقطة", icon: "💎" },
        { name: "النخبة", criteria: "الوصول لـ 5,000 نقطة", icon: "🥇" },
        { name: "المليونير الصحي", criteria: "الوصول لـ 10,000 نقطة", icon: "💰" },
        { name: "سلطان كارينجو", criteria: "الوصول لـ 50,000 نقطة", icon: "👑" }
      ]
    },
    {
      title: "أوسمة التبكير (Early Bird)",
      items: [
        { name: "نجم الفجر", criteria: "إنجاز مهمة في الساعة 5 صباحاً", icon: "🌅" },
        { name: "صياد الشمس", criteria: "إنجاز 10 مهام قبل الساعة 7 صباحاً", icon: "☀️" },
        { name: "قاهر النوم", criteria: "إنجاز 30 مهمة قبل الساعة 6 صباحاً", icon: "🦅" }
      ]
    }
  ];

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
              <Info size={40} />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-primary leading-tight">الدستور الكامل لكارينجو</h1>
              <p className="text-muted-foreground text-base md:text-lg font-bold">كل القوانين والآليات التقنية التي تحكم مجتمع النمو الخاص بنا.</p>
            </div>
          </div>
        </header>

        <section className="space-y-12">
          {/* 1. نظام النقاط */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-primary">
              <Star className="text-yellow-500" fill="currentColor" /> <h2>1. نظام النقاط المتقدم</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-8">
              <p className="font-bold text-slate-700 leading-relaxed text-sm">يتم حساب تقدمك في "كارينجو" بناءً على نظام نقاط دقيق يكافئ الالتزام والتبكير:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-6 rounded-3xl border border-green-100 text-center">
                  <p className="text-2xl font-black text-green-600">50</p>
                  <p className="text-[10px] font-black uppercase text-green-800">مهمة سهلة</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-center">
                  <p className="text-2xl font-black text-blue-600">70</p>
                  <p className="text-[10px] font-black uppercase text-blue-800">مهمة متوسطة</p>
                </div>
                <div className="bg-red-50 p-6 rounded-3xl border border-red-100 text-center">
                  <p className="text-2xl font-black text-red-600">100</p>
                  <p className="text-[10px] font-black uppercase text-red-800">مهمة صعبة</p>
                </div>
              </div>
              
              <div className="space-y-4 bg-primary/5 p-6 rounded-3xl border border-primary/10">
                <h4 className="font-black text-primary text-lg flex items-center gap-2"><TimerIcon className="text-accent" /> بونص التبكير (Early Bird)</h4>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                  نحن نقدس ساعات الفجر. بونص التبكير هو قوة دفع إضافية تبدأ من الساعة **5:00 صباحاً** وتمنحك **75 نقطة** كاملة، ثم تتناقص بمعدل **5 نقاط كل ساعة**. 
                  <br /><span className="text-accent font-black">مثال:</span> إذا أنجزت مهمتك في السادسة صباحاً ستحصل على 70 نقطة بونص، وإذا أنجزتها في الثامنة مساءً ستحصل على 0 بونص.
                </p>
              </div>
            </Card>
          </div>

          {/* 2. نظام الأوسمة المكتشف */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-accent">
              <Medal className="text-accent" /> <h2>2. دليل الأوسمة والتشريفات</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-10">
              <p className="font-bold text-slate-700 leading-relaxed text-sm">الأوسمة ليست مجرد زينة، بل هي سجل تاريخي لعظمتك في كارينجو. إليك كيف تحصل عليها:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {badgeCategories.map((cat, i) => (
                  <div key={i} className="space-y-4">
                    <h4 className="font-black text-primary text-base flex items-center gap-2 border-b pb-2">
                      {cat.title}
                    </h4>
                    <div className="space-y-3">
                      {cat.items.map((item, j) => (
                        <div key={j} className="flex items-center gap-3 bg-secondary/30 p-3 rounded-2xl">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <p className="font-black text-primary text-[11px] leading-none">{item.name}</p>
                            <p className="text-[9px] font-bold text-muted-foreground mt-1">{item.criteria}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 3. عضوية بريميوم */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-yellow-600">
              <Crown className="text-yellow-500" fill="currentColor" /> <h2>3. عضوية كارينجو الملكية (Premium)</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border-yellow-100 bg-yellow-50/20 space-y-6">
              <p className="font-bold text-slate-900 text-sm">عضوية البريميوم هي لأولئك الذين يريدون الانطلاق بلا قيود:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white rounded-2xl shadow-sm border border-yellow-200">
                  <h5 className="font-black text-yellow-800 text-sm flex items-center gap-2"><Sparkles size={16}/> تجربة بدون إعلانات</h5>
                  <p className="text-[10px] font-bold opacity-70 mt-1">وداعاً للإعلانات المزعجة في شاشة الرئيسية والمسارات.</p>
                </div>
                <div className="p-5 bg-white rounded-2xl shadow-sm border border-yellow-200">
                  <h5 className="font-black text-yellow-800 text-sm flex items-center gap-2"><Globe size={16}/> نشر غير محدود</h5>
                  <p className="text-[10px] font-bold opacity-70 mt-1">المستخدم العادي له 3 منشورات يومياً، أنت لك الحرية المطلقة.</p>
                </div>
                <div className="p-5 bg-white rounded-2xl shadow-sm border border-yellow-200">
                  <h5 className="font-black text-yellow-800 text-sm flex items-center gap-2"><ListChecks size={16}/> مهام بلا حدود</h5>
                  <p className="text-[10px] font-bold opacity-70 mt-1">أضف عدداً لا نهائياً من المهام الشخصية والتحديات المخصصة يومياً.</p>
                </div>
                <div className="p-5 bg-white rounded-2xl shadow-sm border border-yellow-200">
                  <h5 className="font-black text-yellow-800 text-sm flex items-center gap-2"><Crown size={16}/> توثيق الهوية</h5>
                  <p className="text-[10px] font-bold opacity-70 mt-1">ظهور التاج الذهبي بجانب اسمك في كافة أنحاء التطبيق.</p>
                </div>
              </div>
            </Card>
          </div>

          {/* 4. جدار العار */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-red-800">
              <Skull className="text-red-800" /> <h2>4. جدار العار (Wall of Shame)</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-4">
              <p className="font-bold text-slate-900 leading-relaxed text-sm">
                هذا القسم مخصص لفضح التخاذل. يُدرج في جدار العار كل من:
              </p>
              <ul className="space-y-4 text-xs font-bold text-slate-700 pr-4 list-disc">
                <li>المستخدمون الذين وصلت نقاطهم إلى **صفر** نتيجة العقوبات المتكررة.</li>
                <li>يجب أن يكون المستخدم قد سجل دخوله خلال **آخر 7 أيام** (القدامى لا يظهرون هنا).</li>
                <li><span className="text-red-600">كيف تخرج؟</span> فور حصولك على أول نقطة إنجاز جديدة، سيمحو كاري اسمك من هذا الجدار فوراً!</li>
              </ul>
            </Card>
          </div>

          {/* 5. المسار العام */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-primary">
              <Swords className="text-primary" /> <h2>5. قانون المسار العام (The Master Track)</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border-dashed border-2 border-primary/30 bg-primary/5 space-y-6">
              <div className="space-y-4">
                <h4 className="font-black text-primary text-xl flex items-center gap-2"><Sparkles size={20}/> ما هو المسار العام؟</h4>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                  بمجرد إتمامك للمراحل الـ 30 الأساسية في أي مسار، فأنت لم تنتهِ بعد. هناك **90 مرحلة أسطورية إضافية** تفتح للأبطال الحقيقيين في المسار العام.
                </p>
              </div>
              <div className="space-y-4 bg-white/50 p-5 rounded-2xl border border-primary/10">
                <h4 className="font-black text-primary text-sm flex items-center gap-2"><Trophy size={16}/> النقاط الأسطورية:</h4>
                <p className="text-[10px] font-bold text-slate-600 leading-relaxed">
                  لا يتم احتساب نقاط في المسار العام إلا لمن استطاع **ختم المسارات الأربعة الأساسية** (اللياقة، التغذية، السلوك، الدراسة) بالكامل. بمجرد ختم الـ 120 مرحلة الأساسية، ستتحول كل مهمة في المسار العام إلى "منجم نقاط" يرفع ترتيبك العالمي بسرعة جنونية.
                </p>
              </div>
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <AlertCircle className="text-amber-600 shrink-0" size={18} />
                <p className="text-[9px] font-bold text-amber-800">
                  المسار العام متاح للجميع للتدريب، ولكن "النقاط الأسطورية" هي جائزة مخصصة فقط لمن أثبت جدارته بختم كافة المسارات الأساسية أولاً.
                </p>
              </div>
            </Card>
          </div>
        </section>

        <footer className="pt-20 opacity-40 font-black text-primary text-[10px] md:text-xs text-center">
          كارينجو - نظام نمو متكامل - جميع الحقوق محفوظة © Artiatech Studio 2026
        </footer>
      </div>
    </div>
  );
}
