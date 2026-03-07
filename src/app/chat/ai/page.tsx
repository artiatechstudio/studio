
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { NavSidebar } from '@/components/nav-sidebar';
import { useUser } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Sparkles, Brain, AlertCircle } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// قائمة الـ 100 عبارة الملهمة الثابتة لضمان العمل بدون إنترنت وبسرعة فائقة
const STATIC_RESPONSES = [
  "أهلاً! أنا كاري 🐱. دعنا ننمو معاً اليوم!",
  "كل خطوة صغيرة تقربك من هدفك الكبير، استمر!",
  "هل أنجزت مهمتك اليوم؟ الحماسة في انتظارك! 🔥",
  "تذكر، الاستمرارية أهم من السرعة. كاري فخور بك!",
  "يوم جديد، فرصة جديدة لتكون أفضل من الأمس!",
  "العظماء لا يولدون عمالقة، بل يبدؤون بخطوة واحدة. 🌱",
  "حافظ على زخمك، أنت تبلي بلاءً حسناً اليوم! 🚀",
  "لا تقلق بشأن الأخطاء، المهم أنك تحاول دائماً. ✨",
  "الالتزام هو الفارق الوحيد بين الحلم والحقيقة. 🏆",
  "كاري يراقب تقدمك بسعادة، استمر في التألق! 🌟",
  "هل شربت الماء اليوم؟ جسدك يحتاج للترطيب لتنجز. 💧",
  "خمس دقائق من الحركة أفضل من لا شيء، تحرك الآن! 🏃‍♂️",
  "عقلك مثل العضلة، كلما دربته أكثر صار أقوى. 🧠",
  "أنت أقوى مما تعتقد، فقط استمر في المحاولة. 🔥",
  "النوم المبكر هو سر النجاح في الغد، تذكر ذلك! 🌙",
  "لا تقارن بدايتك بموسم حصاد الآخرين. 🌾",
  "الانضباط هو أن تفعل ما يجب فعله حتى لو لم ترغب به.",
  "أنت تصنع عاداتك، ثم عاداتك تصنعك! 🛠️",
  "كل عرق في التمرين هو قوة تضاف لجسدك.",
  "النجاح هو مجموع جهود صغيرة تتكرر يوماً بعد يوم. 📈",
  "ركز على التقدم وليس الكمال. ✅",
  "أنت بطل قصتك الخاصة، اجعلها تستحق القراءة!",
  "التعب مؤقت، لكن الفخر بالإنجاز يدوم للأبد. ✨",
  "اجعل طعامك دواءك، ولا تجعل دواءك طعامك. 🍎",
  "الخوف من الفشل هو العائق الوحيد أمام النجاح.",
  "ابتسم! أنت تقوم بعمل عظيم لتطوير نفسك. 😊",
  "العقل السليم في الجسم السليم، حافظ على توازنك.",
  "لا تتوقف عندما تتعب، توقف عندما تنتهي. 🏁",
  "أنت تملك 24 ساعة اليوم، استغلها بحكمة.",
  "الاستيقاظ مبكراً يمنحك أفضلية على العالم أجمع. 🌅",
  "كن لطيفاً مع نفسك اليوم، أنت تحاول بجد.",
  "القراءة تفتح آفاقاً لم تكن تعلم بوجودها. 📚",
  "التنفس العميق هو أبسط وسيلة للهدوء النفسي.",
  "لا تدع يومك يمر دون أن تتعلم شيئاً جديداً.",
  "أنت تستحق الصحة، النشاط، والسعادة. 🌈",
  "الرياضة ليست للعضلات فقط، بل لصفاء الروح أيضاً.",
  "تحدى نفسك اليوم، اكسر حاجز الخوف. 🔥",
  "كاري يحييك على شجاعتك في البدء من جديد! 🐱",
  "أفضل وقت لزراعة شجرة كان قبل عشرين عاماً، وثاني أفضل وقت هو الآن.",
  "السعادة في الرحلة وليست في الوصول فقط. 🗺️",
  "التزم ببرنامجك، النتائج ستأتي حتماً.",
  "كل تمرين ضغط تفعله يبني شخصيتك القيادية.",
  "كن أنت التغيير الذي تريد أن تراه في العالم.",
  "الإرادة هي المحرك الذي لا ينطفئ أبداً. ⚡",
  "لا تبحث عن الأعذار، ابحث عن الطرق. 🛤️",
  "التغذية الجيدة هي استثمار طويل الأمد.",
  "العزيمة تسبق القدرة، آمن بنفسك أولاً.",
  "أنت لست وحيداً، مجتمع كارينجو يساندك! 🐱🤝",
  "لا بأس بالراحة، المهم أن تعود بقوة أكبر.",
  "التركيز هو سر الإنتاجية العالية. 🎯",
  "الناجحون يبدؤون بينما الآخرون يخططون فقط.",
  "أنت أقرب لهدفك اليوم مما كنت عليه بالأمس.",
  "استبدل كلمة 'لا أستطيع' بكلمة 'سأحاول'. 💪",
  "الصبر هو مفتاح كل الأبواب المغلقة.",
  "اجعل بيئتك محفزة للنجاح، تخلص من المشتتات.",
  "التدوين يساعدك على ترتيب أفكارك المبعثرة. ✍️",
  "أنت معجزة في حد ذاتك، لا تنسَ ذلك.",
  "كن فخوراً بكل يوم تلتزم فيه بالمهام الصغيرة.",
  "الصباح هو ملكك، اجعله بداية قوية. ☕",
  "الصحة ليست غياب المرض، بل حيوية الجسم والروح.",
  "لا تدع رأي الآخرين يطفئ شعلة طموحك. 🕯️",
  "التغيير يبدأ من الداخل، من أفكارك اليومية.",
  "حافظ على نظافة طبقك وعقلك. 🥦",
  "أنت قادر على تحقيق المستحيل بالإرادة.",
  "كن ممتناً لما تملك، ستحصل على المزيد حتماً. 🙏",
  "لا يوجد فشل، هناك تجارب ودروس فقط.",
  "تحدث مع نفسك كما تتحدث مع صديق تحبه.",
  "الأهداف الكبيرة تحتاج لنفس طويل. 🏃‍♂️",
  "أنت تصمم مستقبلك الآن، في هذه اللحظة.",
  "المرونة هي القوة الحقيقية في مواجهة الحياة. 🤸‍♂️",
  "كاري يرسل لك طاقة إيجابية لتنهي يومك بقوة! ✨",
  "التعلم المستمر هو ينبوع الشباب الدائم.",
  "اجعل هدفك هو التميز، وسيلحق بك النجاح.",
  "أنت شجاع لأنك اخترت طريق النمو الصعب. 🦁",
  "تذكر دائماً لماذا بدأت رحلتك في كارينجو. 🐱❓",
  "كل وجبة صحية هي رسالة حب لجسدك.",
  "لا تسمح للكسل أن يسرق أحلامك منك. 👻",
  "الانضباط الذاتي هو الحرية الحقيقية.",
  "أنت القائد، ومشاعرك هي الركاب، لا تدعهم يقودون الطائرة.",
  "ابدأ صغيراً، فكر كبيراً، انطلق الآن. 🚀",
  "التوازن هو سر الحياة السعيدة.",
  "كن صبوراً مع نتائجك، العشب لا ينمو بسرعة.",
  "أنت تملك قوة الإرادة الكافية لتغيير أي عادة.",
  "الحياة قصيرة، لا تضيعها في الانتظار. ⏳",
  "استمتع بصوت الصمت، فيه تجد الأجوبة.",
  "كن صادقاً مع نفسك، فهي أهم علاقة تملكها.",
  "أنت تستطيع تجاوز أي عقبة تواجهك اليوم.",
  "الإبداع يولد من رحم المعاناة والعمل الجاد.",
  "أنت نور في هذا العالم، لا تدع أحد يطفئه. ✨",
  "الالتزام هو الجسر بين الهدف والإنجاز.",
  "كاري يراقبك وأنت تبني عضلات إرادتك! 🐱💪",
  "اجعل يومك مليئاً بالعمل الصالح والتطور.",
  "أنت لا تخسر أبداً، إما أن تربح أو تتعلم.",
  "الثقة بالنفس هي أول أسرار النجاح.",
  "كن شاكراً للصعاب، فهي التي تصقلك. 💎",
  "أنت تملك طاقة تكفي لتغيير العالم حولك.",
  "لا تكتفِ بالأحلام، قم وحققها الآن. 🔥",
  "التميز ليس فعلاً، بل هو عادة تمارسها يومياً.",
  "أنت بطل في أعين كاري، استمر في التقدم! 🐱👑",
  "غداً سيكون أفضل لأنك اخترت أن تعمل اليوم.",
  "لا تجعل أحلامك مجرد أماني، حولها لخطوات.",
  "كاري يحيي روحك القتالية اليوم! 🐱⚔️",
  "اجعل الاستمرارية هي قانونك المقدس.",
  "أنت اليوم بذرة، وغداً ستكون غابة من النجاح. 🌲",
  "تذكر أن كاري فخور بكل محاولة تقوم بها. ✅",
  "كل يوم تنجز فيه هو انتصار لنسختك الأفضل."
];

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'أهلاً بك يا صديقي! أنا كاري 🐱، رفيقك في رحلة النمو. كيف يمكنني إلهامك اليوم؟ 🔥' }
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
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    setIsLoading(true);
    playSound('click');

    // محاكاة استجابة "كاري" الثابتة (بدون ذكاء اصطناعي لضمان العمل أوفلاين)
    setTimeout(() => {
      const randomIdx = Math.floor(Math.random() * STATIC_RESPONSES.length);
      const response = STATIC_RESPONSES[randomIdx];
      setMessages(prev => [...prev, { role: 'model', content: response }]);
      setIsLoading(false);
      playSound('success');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background md:pr-72 flex flex-col overflow-hidden" dir="rtl">
      <NavSidebar />
      
      <header className="flex items-center justify-between bg-gradient-to-r from-primary to-accent p-4 rounded-3xl shadow-lg border border-white/20 mx-4 mt-4 sticky top-4 z-30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl border border-white/30 shadow-inner">
            🐱
          </div>
          <div className="text-right text-white">
            <h2 className="font-black leading-none text-lg">كاري (وضع الإلهام)</h2>
            <p className="text-[10px] font-bold mt-1 flex items-center gap-1 opacity-80">
              <Sparkles size={10} /> متاح دائماً للأبطال
            </p>
          </div>
        </div>
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
            <ArrowLeft className="rotate-180" />
          </Button>
        </Link>
      </header>

      {/* تنبيه نظام التطوير */}
      <div className="mx-4 mt-4 bg-blue-50 border border-blue-100 p-3 rounded-2xl flex items-center gap-2 text-blue-700">
        <AlertCircle size={16} />
        <p className="text-[10px] font-black">هذه الخدمة في وضع "الإلهام الثابت" حالياً لضمان السرعة والعمل بدون إنترنت.</p>
      </div>

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
                <Brain size={14} className="animate-bounce" /> كاري يستحضر الحكمة... 🐱📡
              </div>
            </div>
          )}
        </div>

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
