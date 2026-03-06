
"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Droplets, Moon, Apple, Activity, Zap, Star, ShieldCheck } from 'lucide-react';
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
              <p className="text-muted-foreground text-lg font-bold">دليلك الشامل لجسد أقوى وصحة مستدامة.</p>
            </div>
          </div>
        </header>

        <div className="relative w-full h-[350px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-card">
          <Image 
            src="https://picsum.photos/seed/health-ultra/1200/800" 
            alt="صحة وتغذية" 
            fill 
            className="object-cover"
            data-ai-hint="healthy living"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-10">
            <p className="text-white text-2xl font-black">استثمارك في صحتك اليوم هو ثروتك الحقيقية غداً.</p>
          </div>
        </div>

        <section className="space-y-16">
          {/* قسم التغذية المعمق */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-3xl font-black text-green-600">
              <Apple size={36} /> <h2>التغذية: ما وراء السعرات</h2>
            </div>
            <div className="bg-card p-10 rounded-[3rem] shadow-xl border border-border space-y-6">
              <p className="font-bold leading-relaxed text-lg">التغذية ليست مجرد عد للسعرات، بل هي تزويد الخلايا بالوقود اللازم للنمو والترميم.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-black text-primary text-xl flex items-center gap-2"><Star className="text-yellow-500" size={20} /> المغذيات الكبرى</h4>
                  <ul className="space-y-4 text-muted-foreground font-bold">
                    <li className="bg-secondary/20 p-4 rounded-2xl">
                      <span className="text-primary block">البروتين:</span> حجر الأساس لبناء العضلات، ترميم الأنسجة، ودعم المناعة. استهدف 1.2-1.6 جرام لكل كجم من وزنك.
                    </li>
                    <li className="bg-secondary/20 p-4 rounded-2xl">
                      <span className="text-primary block">الكربوهيدرات:</span> مصدر الطاقة الأساسي للدماغ والعضلات. اختر المعقدة (الشوفان، الكينوا) لطاقة تدوم.
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-black text-primary text-xl flex items-center gap-2"><ShieldCheck className="text-green-500" size={20} /> المغذيات الصغرى</h4>
                  <ul className="space-y-4 text-muted-foreground font-bold">
                    <li className="bg-secondary/20 p-4 rounded-2xl">
                      <span className="text-primary block">الفيتامينات:</span> المحركات الكيميائية للتمثيل الغذائي. نوع في ألوان خضارك لضمان الحصول عليها.
                    </li>
                    <li className="bg-secondary/20 p-4 rounded-2xl">
                      <span className="text-primary block">المعادن:</span> مثل المغنيسيوم للاسترخاء، والزنك للمناعة، والكالسيوم لقوة العظام.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* قسم الترطيب المفصل */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-3xl font-black text-blue-600">
              <Droplets size={36} /> <h2>هندسة الترطيب (Hydration)</h2>
            </div>
            <div className="bg-blue-50/50 p-10 rounded-[3rem] shadow-xl border border-blue-100 space-y-6">
              <div className="flex flex-col md:flex-row gap-10">
                <div className="flex-1 space-y-4">
                  <p className="font-bold text-blue-900 leading-relaxed text-lg">الماء هو الوسيط لكل تفاعل كيميائي في جسدك. نقص الماء يعني تعليقاً في الأداء البدني والذهني.</p>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-200">
                      <h5 className="font-black text-blue-600 mb-2">علامات الجفاف الصامتة:</h5>
                      <p className="text-sm font-bold text-muted-foreground">الصداع المفاجئ، التعب غير المبرر، جفاف الشفاه، وضعف التركيز.</p>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-64 h-64 relative rounded-[2rem] overflow-hidden shadow-lg border-4 border-white">
                  <Image src="https://picsum.photos/seed/water-health/400/400" alt="ماء" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>

          {/* قسم النوم والترميم */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-3xl font-black text-purple-600">
              <Moon size={36} /> <h2>النوم: الترميم الذكي</h2>
            </div>
            <div className="bg-card p-10 rounded-[3rem] shadow-xl border border-border space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-purple-50 p-6 rounded-3xl text-center space-y-2">
                  <Activity className="mx-auto text-purple-600" />
                  <h5 className="font-black text-purple-800">إفراز الهرمونات</h5>
                  <p className="text-xs font-bold text-purple-700">أثناء النوم يفرز الجسم هرمون النمو المسؤول عن إصلاح العضلات وحرق الدهون.</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-3xl text-center space-y-2">
                  <Zap className="mx-auto text-purple-600" />
                  <h5 className="font-black text-purple-800">التطهير الدماغي</h5>
                  <p className="text-xs font-bold text-purple-700">يقوم الجهاز الليمفاوي بتنظيف السموم المتراكمة في الدماغ خلال اليوم.</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-3xl text-center space-y-2">
                  <Heart className="mx-auto text-purple-600" />
                  <h5 className="font-black text-purple-800">صحة القلب</h5>
                  <p className="text-xs font-bold text-purple-700">النوم الكافي يقلل ضغط الدم ويمنح القلب فترة راحة ضرورية.</p>
                </div>
              </div>
              <div className="p-8 bg-secondary/20 rounded-[2rem] border border-border">
                <h4 className="font-black text-primary mb-4">روتين النوم المثالي:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold text-muted-foreground">
                  <li>● درجة حرارة الغرفة (18-20 مئوية).</li>
                  <li>● ظلام دامس لتحفيز الميلاتونين.</li>
                  <li>● الابتعاد عن الشاشات قبل 90 دقيقة.</li>
                  <li>● تجنب الكافيين بعد الساعة 2 ظهراً.</li>
                </ul>
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
