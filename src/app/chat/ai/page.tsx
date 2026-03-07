
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Sparkles, Brain } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { aiChat } from '@/ai/flows/ai-chat-flow';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function AiChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'أهلاً بك يا صديقي! أنا كاري 🐱، رفيقك في رحلة النمو. كيف يمكنني مساعدتك اليوم؟ 🔥' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText.trim();
    setInputText('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    
    setIsLoading(true);
    playSound('click');

    try {
      // استدعاء تدفق الذكاء الاصطناعي الحقيقي
      const result = await aiChat({
        message: userMsg,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });

      if (result && result.response) {
        setMessages(prev => [...prev, { role: 'model', content: result.response }]);
        playSound('success');
      } else {
        throw new Error("No response from AI");
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: 'يا إلهي! يبدو أن عقلي السحابي مشوش قليلاً الآن. هل يمكنك المحاولة مرة أخرى؟ 🐱⚠️' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col overflow-hidden" dir="rtl">
      <NavSidebar />
      
      {/* Header */}
      <header className="flex items-center justify-between bg-gradient-to-r from-primary to-accent p-4 rounded-3xl shadow-lg border border-white/20 mx-4 mt-4 sticky top-4 z-30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl border border-white/30 shadow-inner">
            🐱
          </div>
          <div className="text-right text-white">
            <h2 className="font-black leading-none text-lg">كاري الذكي</h2>
            <p className="text-[10px] font-bold mt-1 flex items-center gap-1 opacity-80">
              <Sparkles size={10} className="animate-pulse" /> متاح الآن للإلهام
            </p>
          </div>
        </div>
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
            <ArrowLeft className="rotate-180" />
          </Button>
        </Link>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div 
          ref={scrollRef}
          className="flex-1 p-6 space-y-4 overflow-y-auto scroll-smooth pb-40"
        >
          {messages.map((m, idx) => {
            const isMine = m.role === 'user';
            return (
              <div key={idx} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] p-4 rounded-3xl font-bold text-sm shadow-md",
                  isMine ? "bg-primary text-white rounded-br-none" : "bg-white text-primary rounded-bl-none border border-border"
                )}>
                  {m.content}
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary/50 p-4 rounded-3xl rounded-bl-none font-black text-xs animate-pulse text-muted-foreground flex items-center gap-2">
                <Brain size={14} className="animate-bounce" /> كاري يحلل ويفكر... 🐱📡
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="absolute bottom-[90px] md:bottom-6 left-4 right-4 z-40">
          <form onSubmit={handleSendMessage} className="p-2 bg-card/95 backdrop-blur-xl border-2 border-primary/20 rounded-2xl flex gap-2 shadow-2xl">
            <Input 
              placeholder="تحدث مع كاري..." 
              className="h-12 rounded-xl bg-secondary/50 border-none font-bold text-right focus-visible:ring-primary"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !inputText.trim()}
              className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shrink-0"
            >
              <Send className="rotate-180" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
