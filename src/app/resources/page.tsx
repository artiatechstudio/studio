"use client"

import React from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Shield, ScrollText, Mail, Heart, HelpCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ResourcesPage() {
  return (
    <div className="min-h-screen">
      <NavSidebar />
      <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-white shadow-xl">
              <BookOpen size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-primary">Resource Hub</h1>
              <p className="text-muted-foreground font-medium">General tips, health information, and legal documentation.</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary text-white overflow-hidden group cursor-pointer">
            <CardContent className="p-10 flex flex-col items-center text-center space-y-4 group-hover:bg-primary/95 transition-colors">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Heart size={32} />
              </div>
              <h3 className="text-2xl font-black">Health & Safety Tips</h3>
              <p className="opacity-80 leading-relaxed font-medium">Learn how to maintain a balanced lifestyle safely and effectively with our curated guides.</p>
              <Button variant="secondary" className="rounded-xl font-bold group-hover:scale-105 transition-transform">Read Guides</Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-accent text-white overflow-hidden group cursor-pointer">
            <CardContent className="p-10 flex flex-col items-center text-center space-y-4 group-hover:bg-accent/95 transition-colors">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Mail size={32} />
              </div>
              <h3 className="text-2xl font-black">Contact Developer</h3>
              <p className="opacity-80 leading-relaxed font-medium">Found a bug or have a suggestion? We'd love to hear from you to make Careingo better.</p>
              <Button variant="secondary" className="rounded-xl font-bold group-hover:scale-105 transition-transform">Get in Touch</Button>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-8">
          <h2 className="text-2xl font-black text-primary flex items-center gap-3">
            <HelpCircle className="text-accent" />
            Frequently Asked Questions
          </h2>
          <Card className="border-none shadow-xl rounded-[2.5rem] p-4 bg-white">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-none px-6">
                <AccordionTrigger className="text-lg font-bold text-primary hover:no-underline py-6">
                  What is the 30-day progression system?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-6 font-medium leading-relaxed">
                  Careingo uses a scientifically inspired 30-day model to help you build lasting habits. Each track (Fitness, Nutrition, Behavior, Study) consists of 30 stages that must be completed sequentially, limited to one new stage per day to ensure consistent growth.
                </AccordionContent>
              </AccordionItem>
              <Separator className="bg-secondary/50 mx-6" />
              <AccordionItem value="item-2" className="border-none px-6">
                <AccordionTrigger className="text-lg font-bold text-primary hover:no-underline py-6">
                  Can I change my tracks later?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-6 font-medium leading-relaxed">
                  All four tracks are available to you from day one. You can progress in all of them simultaneously, but you are only allowed to complete one new stage per track per calendar day.
                </AccordionContent>
              </AccordionItem>
              <Separator className="bg-secondary/50 mx-6" />
              <AccordionItem value="item-3" className="border-none px-6">
                <AccordionTrigger className="text-lg font-bold text-primary hover:no-underline py-6">
                  Is my data secure?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-6 font-medium leading-relaxed">
                  Absolutely. Careingo uses secure Firebase authentication and real-time database encryption to ensure your personal growth data remains private and protected.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-black text-primary flex items-center gap-3">
            <Shield className="text-accent" />
            Legal & Privacy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-none shadow-md rounded-2xl hover:bg-secondary/20 transition-all cursor-pointer">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                    <Shield size={20} />
                  </div>
                  <span className="font-bold text-primary">Privacy Policy</span>
                </div>
                <ExternalLink size={18} className="text-muted-foreground" />
              </CardContent>
            </Card>
            <Card className="border-none shadow-md rounded-2xl hover:bg-secondary/20 transition-all cursor-pointer">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary">
                    <ScrollText size={20} />
                  </div>
                  <span className="font-bold text-primary">Terms & Conditions</span>
                </div>
                <ExternalLink size={18} className="text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}