
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Star, Timer as TimerIcon, Zap, AlertTriangle, ListChecks, Crown, Sparkles, Globe, Brain, AlertCircle, Trophy, Skull, Medal, Flame, Heart, Swords, CheckCircle2, ShieldCheck, Wallet, Image as ImageIcon, MessageSquare, Snowflake } from 'lucide-react';
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
          {/* القسم الأول: النقاط والحماسة */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-primary">
              <Star className="text-yellow-500" fill="currentColor" /> <h2>1. نظام النقاط والحماسة</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-8">
              <div className="space-y-4">
                <h4 className="font-black text-primary text-lg flex items-center gap-2"><Flame className="text-orange-500" /> عداد الحماسة (Streak)</h4>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">يزداد عداد الحماسة بمقدار يوم واحد فور إنجازك لأول مهمة في اليوم الجديد. الاستمرارية هي مفتاح الحصول على الأوسمة النادرة في ملفك الشخصي. إذا غبت يوماً كاملًا دون "تجميد حماسة"، سيعود العداد للصفر وسيتم خصم نقاط غياب.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-6 rounded-3xl border border-green-100 text-center"><p className="text-2xl font-black text-green-600">50</p><p className="text-[10px] font-black uppercase text-green-800">مهمة سهلة</p></div>
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-center"><p className="text-2xl font-black text-blue-600">70</p><p className="text-[10px] font-black uppercase text-blue-800">مهمة متوسطة</p></div>
                <div className="bg-red-50 p-6 rounded-3xl border border-red-100 text-center"><p className="text-2xl font-black text-red-600">100</p><p className="text-[10px] font-black uppercase text-red-800">مهمة صعبة</p></div>
              </div>
              <div className="space-y-4 bg-primary/5 p-6 rounded-3xl border border-primary/10">
                <h4 className="font-black text-primary text-lg flex items-center gap-2"><TimerIcon className="text-accent" /> بونص التبكير (Early Bird)</h4>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">يبدأ من الساعة 5:00 صباحاً ويمنحك 75 نقطة إضافية، ويتناقص بمعدل 5 نقاط كل ساعة حتى يختفي في 8:00 مساءً.</p>
              </div>
            </Card>
          </div>

          {/* القسم الثاني: ميزات البريميوم الملكية */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-yellow-600">
              <Crown className="text-yellow-500" fill="currentColor" /> <h2>2. عضوية Careingo الملكية (Premium)</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border-yellow-100 bg-yellow-50/20 space-y-6">
              <div className="space-y-4 pt-4">
                <h4 className="font-black text-primary text-sm flex items-center gap-2"><Sparkles size={16}/> الميزات الملكية الحصرية:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { t: "تجميد الحماسة (Streak Freeze)", d: "تحصل على 2 تجميد شهرياً؛ يحميك التجميد من فقدان سجل التزامك في حالة الغياب المفاجئ ويعمل تلقائياً عند فتحك للتطبيق بعد يوم غياب.", i: Snowflake },
                    { t: "بطاقة التميز الأسبوعية", d: "بطاقة رقمية احترافية في سجل الحماسة تلخص إنجازاتك الأسبوعية لتشاركها مع أصدقائك بضغطة زر.", i: Medal },
                    { t: "نشر غير محدود", d: "انشر محتواك الملهم في المجتمع العام دون قيود المنشورين اليوميين.", i: Globe },
                    { t: "رفع صورة شخصية مخصصة", d: "إمكانية رفع صورتك الحقيقية بدلاً من الإيموجي في ملفك الشخصي.", i: ImageIcon },
                    { t: "تجربة نقية بدون إعلانات", d: "تصفح التطبيق بسرعة فائقة ودون أي مقاطعة إعلانية.", i: Zap },
                    { t: "التاج الملكي وتوثيق الحساب", d: "ظهور أيقونة التاج الملكي بجانب اسمك في كافة القوائم والمتصدرين.", i: Crown }
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
              </div>

              <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-4">
                <h4 className="font-black text-primary text-sm flex items-center gap-2"><Wallet size={16} /> كيفية الدفع والتفعيل:</h4>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                  نحن ندعم وسيلة الدفع المباشرة لضمان سهولة الانضمام: تحويل رصيد (ليبيانا فقط) إلى الرقم الرسمي للإدارة. يتم فتح واجهة الاتصال تلقائياً عند طلب الاشتراك من الإعدادات.
                </p>
              </div>
            </Card>
          </div>

          {/* القسم الثالث: المجتمع والخصوصية */}
          <div className="space-y-6">
            <div className="flex items-center justify-start gap-3 text-2xl font-black text-primary">
              <MessageSquare className="text-primary" /> <h2>3. ميثاق المجتمع والخصوصية</h2>
            </div>
            <Card className="p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-border bg-card space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-secondary/20 rounded-2xl">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">1</div>
                  <p className="text-xs font-bold text-slate-700 leading-relaxed">يُسمح للمستخدمين العاديين بنشر **2 منشور يومياً** فقط في المجتمع العام لضمان جودة المحتوى.</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-secondary/20 rounded-2xl">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">2</div>
                  <p className="text-xs font-bold text-slate-700 leading-relaxed">الحذف في الدردشة الخاصة يتم من **الطرفين** نهائياً لضمان أعلى درجات الخصوصية لمستخدمينا.</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-secondary/20 rounded-2xl">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">3</div>
                  <p className="text-xs font-bold text-slate-700 leading-relaxed">الانسحاب من المهمة بعد بدئها يترتب عليه **خصم 75 نقطة** من رصيدك لتعزيز مبدأ الالتزام.</p>
                </div>
              </div>
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
