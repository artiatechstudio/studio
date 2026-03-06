
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Droplets, Moon, Apple, Activity, Zap } from 'lucide-react';
import Link from 'next/link';
import { playSound } from '@/lib/sounds';
import Image from 'next/image';

export default function HealthResourcePage() {
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
              <Heart size={48} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight">الموسوعة الصحية</h1>
              <p className="text-muted-foreground text-lg font-bold">كل ما تحتاجه لبناء جسد قوي وعقل متقد.</p>
            </div>
          </div>
        </header>

        <div className="relative w-full h-[300px] rounded-[3rem] overflow-hidden shadow-2xl">
          <Image 
            src="https://picsum.photos/seed/health-encyclopedia/1200/600" 
            alt="صحة وتغذية" 
            fill 
            className="object-cover"
            data-ai-hint="healthy lifestyle"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
            <p className="text-white text-xl font-black">جسمك هو استثمارك الأول والوحيد.</p>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-12">
          {/* قسم الماء */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-3xl font-black text-blue-600">
              <Droplets size={36} /> <h2>سر الحياة: الماء (Hydration)</h2>
            </div>
            <div className="bg-card p-8 rounded-[2.5rem] shadow-xl border border-border space-y-4 font-medium leading-relaxed">
              <p>الماء ليس مجرد سائل؛ هو المكون الأساسي لـ 60% من كتلة جسمك والمحرك لـ 90% من عمليات الأيض. نقص الماء بنسبة 2% فقط يؤدي إلى تراجع القدرات الذهنية والبدنية بنسبة 20%.</p>
              <ul className="space-y-3 list-disc pr-6 text-muted-foreground">
                <li><span className="text-primary font-black">المعادلة الصحيحة:</span> اشرب 35 مل لكل كيلوجرام من وزنك. (مثلاً: إذا كان وزنك 70 كجم، تحتاج 2.5 لتر تقريباً).</li>
                <li><span className="text-primary font-black">بونص التبكير:</span> ابدأ يومك بكوبين من الماء الدافئ لتنشيط الأمعاء وتحسين الهضم.</li>
                <li><span className="text-primary font-black">أثناء التمرين:</span> لا تنتظر الشعور بالعطش؛ اشرب جرعات صغيرة كل 15 دقيقة.</li>
              </ul>
            </div>
          </div>

          {/* قسم التغذية */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-3xl font-black text-green-600">
              <Apple size={36} /> <h2>التغذية الذكية (Nutrition)</h2>
            </div>
            <div className="bg-card p-8 rounded-[2.5rem] shadow-xl border border-border space-y-4 font-medium leading-relaxed">
              <p>الطعام هو وقودك، ونوعه يحدد جودة حركتك وتفكيرك. اعتمد قاعدة الـ 80/20 لضمان الاستمرارية دون حرمان.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
                  <h4 className="font-black text-green-800 mb-2">المغذيات الكبرى</h4>
                  <p className="text-sm text-green-700">البروتين لبناء العضلات، الكربوهيدرات المعقدة للطاقة، والدهون الصحية لوظائف الدماغ.</p>
                </div>
                <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
                  <h4 className="font-black text-orange-800 mb-2">تجنب السموم البيضاء</h4>
                  <p className="text-sm text-orange-700">قلل من السكر المضاف والدقيق الأبيض؛ فهما المسببان الرئيسيان للالتهابات والخمول.</p>
                </div>
              </div>
            </div>
          </div>

          {/* قسم النوم */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-3xl font-black text-purple-600">
              <Moon size={36} /> <h2>النوم: محطة الترميم (Sleep)</h2>
            </div>
            <div className="bg-card p-8 rounded-[2.5rem] shadow-xl border border-border space-y-4 font-medium leading-relaxed">
              <p>النوم هو الوقت الذي يقوم فيه جسمك بإفراز هرمون النمو (HGH) وإصلاح الأنسجة التالفة. بدون نوم كافٍ، التمرين يصبح مجهداً وغير فعال.</p>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-2xl">
                  <Zap className="text-purple-600 shrink-0" />
                  <p className="text-sm font-bold">القاعدة الذهبية: احصل على 7-9 ساعات من النوم العميق. حاول تثبيت مواعيد النوم والاستيقاظ حتى في عطلة نهاية الأسبوع.</p>
                </div>
                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-2xl">
                  <Activity className="text-purple-600 shrink-0" />
                  <p className="text-sm font-bold">ديتوكس النوم: أبعد الشاشات الزرقاء قبل النوم بـ 60 دقيقة لتحفيز هرمون الميلاتونين الطبيعي.</p>
                </div>
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
