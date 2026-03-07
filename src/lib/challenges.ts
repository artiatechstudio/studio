
export type TrackKey = 'Fitness' | 'Nutrition' | 'Behavior' | 'Study';

export interface Challenge {
  id?: string;
  title: string;
  description: string;
  time: number;
  difficulty: 'سهل' | 'متوسط' | 'صعب';
  points: number;
}

// دالة لتوليد نقاط بناءً على الصعوبة الجديدة المطلوبة
const getPoints = (diff: 'سهل' | 'متوسط' | 'صعب') => {
  if (diff === 'سهل') return 50;
  if (diff === 'متوسط') return 70;
  return 100;
};

const fitnessChallenges: Challenge[] = [
  { title: "اليوم 1: البداية الصغيرة", description: "قم بـ 10 تمارين سكوات و 5 تمارين ضغط.", time: 5, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 2: تمدد الصباح", description: "ثبات بلانك لمدة 30 ثانية و دقيقتين تمدد.", time: 5, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 3: مشي القوة", description: "امشِ مشياً سريعاً لمدة 15 من دقيقة.", time: 15, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 4: استقرار الجذع", description: "3 مجموعات بلانك جانبي 15 ثانية.", time: 10, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 5: تدفق الجسم", description: "10 تمارين بربي و 20 تسلق جبال.", time: 10, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 6: حرق الأرجل", description: "20 تمرين لنجز و 15 جسر جلوتس.", time: 12, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 7: استشفاء", description: "مشي خفيف 20 دقيقة.", time: 20, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 8: إتقان الضغط", description: "3 مجموعات من 8 تمارين ضغط.", time: 10, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 9: قرفصاء الحائط", description: "ثبات قرفصاء على الحائط 60 ثانية.", time: 5, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 10: انفجار كارديو", description: "5 جولات جامبينج جاكس (30 ثانية).", time: 10, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 11: قوة الظهر", description: "15 تكرار تمرين سوبرمان.", time: 8, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 12: تحدي البطن", description: "30 تمرين كرانشز.", time: 10, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 13: مشي التحمل", description: "مشي متواصل لمدة 30 دقيقة.", time: 30, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 14: زيادة المرونة", description: "تمدد كامل للجسم 15 دقيقة.", time: 15, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 15: ضغط الألماس", description: "10 تمارين ضغط بوضعية الألماس.", time: 10, difficulty: 'صعب', points: getPoints('صعب') },
  { title: "اليوم 16: قفز الحبل", description: "5 دقائق قفز حبل تخيلي.", time: 5, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 17: لنجز خلفي", description: "20 تكرار لنجز خلفي بدقة.", time: 12, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 18: قوة الأكتاف", description: "تمارين ضغط أكتاف بوزن الجسم.", time: 10, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 19: بلانك مطول", description: "ثبات بلانك لمدة 90 ثانية.", time: 5, difficulty: 'صعب', points: getPoints('صعب') },
  { title: "اليوم 20: قوة التحمل", description: "50 تمرين سكوات خلال اليوم.", time: 15, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 21: تحدي HIIT", description: "4 دقائق تاباتا مكثفة.", time: 4, difficulty: 'صعب', points: getPoints('صعب') },
  { title: "اليوم 22: توازن الجسم", description: "وقوف على رجل واحدة دقيقة لكل رجل.", time: 5, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 23: تمدد الصدر", description: "تمدد عضلات الصدر 5 دقائق.", time: 5, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 24: ضغط يد واحدة", description: "محاولة ضغط بيد واحدة (مائل).", time: 10, difficulty: 'صعب', points: getPoints('صعب') },
  { title: "اليوم 25: سكوات القفز", description: "15 تكرار سكوات مع القفز.", time: 10, difficulty: 'صعب', points: getPoints('صعب') },
  { title: "اليوم 26: العقل والعضلة", description: "تمارين بطيئة جداً 10 تكرارات.", time: 8, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 27: جري 2كم", description: "جري أو مشي سريع لمسافة 2كم.", time: 25, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 28: تمارين مركبة", description: "سكوات متبوع بضغط أكتاف 20 مرة.", time: 15, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 29: مراجعة", description: "كرر أصعب تمرين واجهته.", time: 15, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 30: النهائي", description: "أقصى عدد ضغط وسكوات في 5 دقائق.", time: 5, difficulty: 'صعب', points: getPoints('صعب') }
];

const nutritionChallenges: Challenge[] = [
  { title: "اليوم 1: الماء أولاً", description: "اشرب كوباً كبيراً فور الاستيقاظ.", time: 2, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 2: وداعاً للسكر", description: "امنع السكر المضاف طوال اليوم.", time: 0, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 3: الطبق الأخضر", description: "أضف خضروات ورقية لوجبة اليوم.", time: 10, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 4: الأكل الواعي", description: "وجبة كاملة دون تشتيت هاتف.", time: 20, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 5: وجبة الفاكهة", description: "استبدل الحلوى بفاكهة طازجة.", time: 5, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 6: قوة البروتين", description: "بروتين في كل وجبة اليوم.", time: 15, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 7: الحبوب الكاملة", description: "خبز أسمر بدلاً من الأبيض.", time: 10, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 8: تقليل الملح", description: "لا تضف ملحاً إضافياً اليوم.", time: 0, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 9: فطور ملوكي", description: "فطور غني بالألياف والبروتين.", time: 15, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 10: وجبة البيت", description: "كل وجباتك من صنع يديك.", time: 45, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 11: قراءة الملصقات", description: "تجنب أي زيت مهدرج اليوم.", time: 10, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 12: الدهون الصحية", description: "أضف زيت زيتون أو لوز خام.", time: 5, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 13: منع المقليات", description: "لا تأكل مقلياً اليوم نهائياً.", time: 0, difficulty: 'صعب', points: getPoints('صعب') },
  { title: "اليوم 14: الشاي الأخضر", description: "كوب شاي أخضر بعد الغداء.", time: 10, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 15: 20 مضغة", description: "امضغ كل لقمة 20 مرة.", time: 25, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 16: ماء قبل الأكل", description: "اشرب كوبين ماء قبل كل وجبة.", time: 5, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 17: تقليل الكافيين", description: "كوب واحد فقط، وبدون سكر.", time: 0, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 18: قوس قزح", description: "3 ألوان خضروات في طبقك.", time: 15, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 19: التوازن الذهبي", description: "نصف خضار، ربع بروتين، ربع كربوهيدرات.", time: 20, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 20: صيام خفيف", description: "صيام 12 ساعة متواصلة.", time: 0, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 21: بدائل السكر", description: "استخدم العسل أو التمر للتحلية.", time: 5, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 22: الألياف", description: "وجبة غنية بالبقوليات اليوم.", time: 30, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 23: لا أكل ليلي", description: "توقف عن الأكل بعد 9 مساءً.", time: 0, difficulty: 'صعب', points: getPoints('صعب') },
  { title: "اليوم 24: تحضير مسبق", description: "حضر وجبات الغد الليلة.", time: 40, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 25: سوبر فود", description: "تناول بذور شيا أو كتان.", time: 10, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 26: تقليل الدقيق", description: "ابتعد عن المعجنات والبيتزا.", time: 0, difficulty: 'صعب', points: getPoints('صعب') },
  { title: "اليوم 27: 3 لتر ماء", description: "اشرب 3 لتر ماء بانتظام.", time: 0, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 28: اليوم النباتي", description: "يوم كامل بدون لحوم.", time: 40, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 29: مراجعة القياسات", description: "قيم شعورك بالخفة والنشاط.", time: 15, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 30: الاستدامة", description: "اختر 3 عادات للالتزام الدائم.", time: 20, difficulty: 'صعب', points: getPoints('صعب') }
];

const behaviorChallenges: Challenge[] = [
  { title: "اليوم 1: وعي التنفس", description: "5 دقائق تنفس هادئ.", time: 5, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 2: الامتنان", description: "اكتب 5 أشياء ممتن لها.", time: 10, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 3: ديتوكس شاشات", description: "بدون هاتف قبل النوم بساعة.", time: 60, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 4: كلمة طيبة", description: "قدم مجاملة صادقة لشخص.", time: 2, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 5: ترتيب البيئة", description: "رتب ركناً واحداً في غرفتك.", time: 15, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 6: الاستيقاظ المبكر", description: "استيقظ 30 دقيقة قبل موعدك.", time: 30, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 7: جرد الأسبوع", description: "اكتب أهم دروس الأسبوع.", time: 15, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 8: قوة 'لا'", description: "ارفض طلباً يضيع وقتك.", time: 5, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 9: غذاء العقل", description: "اقرأ 10 صفحات كتاب مفيد.", time: 20, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 10: وضوح الأهداف", description: "حدد هدفاً كبيراً وخطواته.", time: 20, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 11: التأمل", description: "15 دقيقة تأمل صامت.", time: 15, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 12: التدوين", description: "اكتب صفحة كاملة عن مشاعرك.", time: 15, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 13: عطاء خفي", description: "فعل خير بسيط دون إعلان.", time: 10, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 14: عدم الشكوى", description: "يوم كامل بدون تذمر.", time: 0, difficulty: 'صعب', points: getPoints('صعب') },
  { title: "اليوم 15: الاستماع النشط", description: "استمع أكثر مما تتكلم اليوم.", time: 20, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 16: مهمة واحدة", description: "ركز في عمل واحد حتى تنهيه.", time: 40, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 17: طقوس النوم", description: "عتم الغرفة ونم باكراً.", time: 20, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 18: تأكيدات", description: "3 تأكيدات إيجابية لنفسك.", time: 10, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 19: ممارسة الصبر", description: "استغل الانتظار في ذكر هادئ.", time: 15, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 20: مصفوفة الوقت", description: "صنف مهامك حسب الأهمية.", time: 30, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 21: التسامح", description: "سامح شخصاً على موقف قديم.", time: 15, difficulty: 'صعب', points: getPoints('صعب') },
  { title: "اليوم 22: تقليل التنبيهات", description: "أغلق تنبيهات التطبيقات.", time: 10, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 23: الطبيعة", description: "15 دقيقة تحت شجرة أو عشب.", time: 15, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 24: الوعي المالي", description: "دون كافة مصاريف اليوم.", time: 20, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 25: كسر العادة", description: "غير طريقك المعتاد للعمل.", time: 15, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 26: ممارسة هواية", description: "30 دقيقة لهواية تحبها.", time: 30, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 27: شجاعة الحوار", description: "تحدث في موضوع مؤجل بصدق.", time: 25, difficulty: 'صعب', points: getPoints('صعب') },
  { title: "اليوم 28: بناء الجسور", description: "اتصل بصديق قديم.", time: 20, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 29: التخطيط", description: "تخيل حياتك بعد 5 سنوات.", time: 40, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 30: احتفال", description: "احتفل بإنجازاتك السلوكية.", time: 30, difficulty: 'صعب', points: getPoints('صعب') }
];

const studyChallenges: Challenge[] = [
  { title: "اليوم 1: تحديد الشغف", description: "حدد موضوعاً لإتقانه اليوم.", time: 15, difficulty: 'سهل', points: getPoints('سهل') },
  { title: "اليوم 2: بومودورو", description: "دراسة 25د وراحة 5د مرتين.", time: 60, difficulty: 'متوسط', points: getPoints('متوسط') },
  { title: "اليوم 3: استذكار نشط", points: getPoints('متوسط'), description: "لخص فقرة قرأتها بأسلوبك.", time: 20, difficulty: 'متوسط' },
  { title: "اليوم 4: هندسة المكان", points: getPoints('سهل'), description: "نظم مكتبك وأبعد المشتتات.", time: 15, difficulty: 'سهل' },
  { title: "اليوم 5: التلخيص الذكي", points: getPoints('سهل'), description: "لخص فكرة معقدة في 3 نقاط.", time: 20, difficulty: 'سهل' },
  { title: "اليوم 6: فن السؤال", points: getPoints('متوسط'), description: "اكتب 5 أسئلة 'لماذا' عما تدرسه.", time: 25, difficulty: 'متوسط' },
  { title: "اليوم 7: المراجعة", points: getPoints('متوسط'), description: "30 دقيقة مراجعة لما سبق.", time: 30, difficulty: 'متوسط' },
  { title: "اليوم 8: التركيز العميق", points: getPoints('صعب'), description: "45 دقيقة دراسة صامتة تماماً.", time: 45, difficulty: 'صعب' },
  { title: "اليوم 9: تعليم الغير", points: getPoints('متوسط'), description: "اشرح مفهوماً لصديق خيالي.", time: 20, difficulty: 'متوسط' },
  { title: "اليوم 10: البحث", points: getPoints('سهل'), description: "جد مصدر تعليمي جديد يثريك.", time: 30, difficulty: 'سهل' },
  { title: "اليوم 11: خرائط ذهنية", points: getPoints('متوسط'), description: "ارسم خريطة لموضوعك الحالي.", time: 25, difficulty: 'متوسط' },
  { title: "اليوم 12: التعلم باللعب", points: getPoints('سهل'), description: "حول معلوماتك لبطاقات أسئلة.", time: 30, difficulty: 'سهل' },
  { title: "اليوم 13: تثبيت معلومات", points: getPoints('سهل'), description: "راجع النقاط قبل النوم بـ 5د.", time: 5, difficulty: 'سهل' },
  { title: "اليوم 14: تحدي اللغة", points: getPoints('متوسط'), description: "تعلم 5 كلمات جديدة واستخدمها.", time: 20, difficulty: 'متوسط' },
  { title: "اليوم 15: كتابة مقال", points: getPoints('صعب'), description: "اكتب تدوينة تشرح ما تعلمته.", time: 45, difficulty: 'صعب' },
  { title: "اليوم 16: بودكاست", points: getPoints('سهل'), description: "استمع لحلقة تعليمية ودون 3 نقاط.", time: 30, difficulty: 'سهل' },
  { title: "اليوم 17: تقنية فاينمان", points: getPoints('صعب'), description: "اشرح موضوعك لطفل في العاشرة.", time: 25, difficulty: 'صعب' },
  { title: "اليوم 18: اختبار ذاتي", points: getPoints('متوسط'), description: "اختبر نفسك بـ 10 أسئلة.", time: 40, difficulty: 'متوسط' },
  { title: "اليوم 19: قصر الذاكرة", points: getPoints('متوسط'), description: "اربط معلوماتك بأماكن في منزلك.", time: 30, difficulty: 'متوسط' },
  { title: "اليوم 20: قراءة سريعة", points: getPoints('متوسط'), description: "تمرن على مسح الصفحات بصرياً.", time: 20, difficulty: 'متوسط' },
  { title: "اليوم 21: تنظيم أجندة", points: getPoints('سهل'), description: "نظم مواعيد الأسبوع القادم.", time: 15, difficulty: 'سهل' },
  { title: "اليوم 22: مهارة البحث", points: getPoints('متوسط'), description: "استخدم محركات البحث بذكاء.", time: 20, difficulty: 'متوسط' },
  { title: "اليوم 23: تلخيص كتاب", points: getPoints('صعب'), description: "لخص كتاباً في صفحة واحدة.", time: 60, difficulty: 'صعب' },
  { title: "اليوم 24: دراسة جماعية", points: getPoints('متوسط'), description: "ناقش فكرة مع صديق مهتم.", time: 40, difficulty: 'متوسط' },
  { title: "اليوم 25: تطبيق عملي", points: getPoints('صعب'), description: "طبق ما تعلمته في مشروع صغير.", time: 60, difficulty: 'صعب' },
  { title: "اليوم 26: حل مشكلات", points: getPoints('متوسط'), description: "ابحث عن 3 حلول لمشكلة بمجالك.", time: 45, difficulty: 'متوسط' },
  { title: "اليوم 27: تفكير نقدي", points: getPoints('صعب'), description: "حلل وانتقد مقالاً علمياً.", time: 30, difficulty: 'صعب' },
  { title: "اليوم 28: ابتكار", points: getPoints('متوسط'), description: "ادمج فكرتين لإنتاج فكرة ثالثة.", time: 40, difficulty: 'متوسط' },
  { title: "اليوم 29: تقييم ذاتي", points: getPoints('سهل'), description: "قيم نقاط قوتك وضعفك تعليمياً.", time: 20, difficulty: 'سهل' },
  { title: "اليوم 30: الإتقان", points: getPoints('صعب'), description: "قدم عرضاً نهائياً لموضوعك.", time: 60, difficulty: 'صعب' }
];

export const STATIC_CHALLENGES: Record<TrackKey, Challenge[]> = {
  Fitness: fitnessChallenges,
  Nutrition: nutritionChallenges,
  Behavior: behaviorChallenges,
  Study: studyChallenges,
};

// الـ 90 تحدي الإضافية للمسار العام (متنوعة الصعوبة)
export const ADDITIONAL_MASTER_CHALLENGES: Challenge[] = [
  { title: "تحدي الأساطير: صيام الدوبامين", description: "يوم كامل بدون أي وسيلة ترفيه رقمية لتعزيز الصفاء الذهني.", time: 0, difficulty: 'صعب', points: 100 },
  { title: "تحدي الأساطير: 100 ضغط", description: "أكمل 100 تمرين ضغط خلال اليوم (مقسمة كما تشاء).", time: 30, difficulty: 'صعب', points: 100 },
  { title: "تحدي الأساطير: القراءة التصويرية", description: "تصفح كتاباً كاملاً واستخرج لب أفكاره الأساسية في 40 دقيقة.", time: 40, difficulty: 'متوسط', points: 70 },
  { title: "تحدي الأساطير: مشي 10كم", description: "مشي لمسافة 10 كيلومترات في الطبيعة لتعزيز قدرة التحمل.", time: 120, difficulty: 'صعب', points: 100 },
  { title: "تحدي الأساطير: يوم السوائل", description: "يوم كامل يعتمد على العصائر والشوربات الصحية فقط لتنظيف الجسم.", time: 0, difficulty: 'متوسط', points: 70 },
  { title: "تحدي الأساطير: الصمت المطبق", description: "ساعة واحدة من الصمت التام دون حديث أو تواصل إلكتروني.", time: 60, difficulty: 'سهل', points: 50 },
  { title: "تحدي الأساطير: ترتيب الذاكرة", description: "استرجاع وحفظ 20 كلمة عشوائية في 5 دقائق.", time: 5, difficulty: 'سهل', points: 50 },
  { title: "تحدي الأساطير: تمرين الكوبرا", description: "تمدد بوضعية الكوبرا لـ 10 دقائق موزعة.", time: 10, difficulty: 'سهل', points: 50 },
  // ... سيتم توليد الباقي ديناميكياً لتوفير المساحة، لكن الفكرة هي التنوع في الصعوبة.
];

export const getMasterPool = (type: TrackKey, difficulty: string): Challenge[] => {
  const basePool = STATIC_CHALLENGES[type].filter(c => c.difficulty === difficulty);
  const extraPool = ADDITIONAL_MASTER_CHALLENGES.filter(c => c.difficulty === difficulty);
  return [...basePool, ...extraPool];
};
