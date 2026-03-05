
export type TrackKey = 'Fitness' | 'Nutrition' | 'Behavior' | 'Study';

export interface Challenge {
  title: string;
  description: string;
  time: number;
  difficulty: 'سهل' | 'متوسط' | 'صعب';
}

const fitnessChallenges: Challenge[] = [
  { title: "اليوم 1: البداية الصغيرة", description: "قم بـ 10 تمارين سكوات و 5 تمارين ضغط. التركيز على الأداء الصحيح أهم من السرعة!", time: 5, difficulty: 'سهل' },
  { title: "اليوم 2: تمدد الصباح", description: "ثبات بلانك لمدة 30 ثانية و دقيقتين من تمارين التمدد.", time: 5, difficulty: 'سهل' },
  { title: "اليوم 3: مشي القوة", description: "امشِ مشياً سريعاً لمدة 15 دقيقة في الهواء الطلق.", time: 15, difficulty: 'سهل' },
  { title: "اليوم 4: استقرار الجذع", description: "3 مجموعات من ثبات البلانك الجانبي لمدة 15 ثانية لكل جانب.", time: 10, difficulty: 'سهل' },
  { title: "اليوم 5: تدفق الجسم بالكامل", description: "10 تمارين بربي و 20 تمرين تسلق الجبال. خذ وقتك.", time: 10, difficulty: 'سهل' },
  { title: "اليوم 6: حرق الجزء السفلي", description: "20 تمرين لنجز (10 لكل رجل) و 15 تمرين جسر الجلوتس.", time: 12, difficulty: 'سهل' },
  { title: "اليوم 7: الاستشفاء النشط", description: "اخرج للمشي الخفيف لمدة 20 دقيقة أو قم بتمارين تمدد خفيفة.", time: 20, difficulty: 'سهل' },
  { title: "اليوم 8: إتقان الضغط", description: "حاول القيام بـ 3 مجموعات من 8 تمارين ضغط (يمكنك استخدام الركبتين).", time: 10, difficulty: 'سهل' },
  { title: "اليوم 9: تحدي القرفصاء على الحائط", description: "اثبت بوضعية القرفصاء على الحائط لمدة 60 ثانية إجمالاً.", time: 5, difficulty: 'متوسط' },
  { title: "اليوم 10: انفجار الكارديو", description: "30 ثانية جامبينج جاكس متبوعة بـ 30 ثانية راحة. كرر 5 مرات.", time: 10, difficulty: 'متوسط' },
  ...Array.from({ length: 20 }, (_, i) => ({
    title: `اليوم ${i + 11}: مرحلة التقدم`,
    description: `أكمل 4 مجموعات من 15 تمرين سكوات و 10 تمارين ضغط ماسية.`,
    time: 15 + i,
    difficulty: (i + 11) > 20 ? 'صعب' : 'متوسط' as any
  }))
];

const nutritionChallenges: Challenge[] = [
  { title: "اليوم 1: الماء أولاً", description: "اشرب كوباً من الماء فور استيقاظك من النوم.", time: 2, difficulty: 'سهل' },
  { title: "اليوم 2: لا مشروبات سكرية", description: "استبدل جميع المشروبات الغازية أو العصائر بالماء أو الشاي اليوم.", time: 0, difficulty: 'سهل' },
  { title: "اليوم 3: الطبق الأخضر", description: "أضف خضاراً ورقياً واحداً على الأقل إلى وجبة غدائك.", time: 10, difficulty: 'سهل' },
  { title: "اليوم 4: الأكل بوعي", description: "تناول وجبة واحدة دون النظر إلى هاتفك أو التلفاز.", time: 20, difficulty: 'سهل' },
  { title: "اليوم 5: سناك الفاكهة", description: "استبدل وجبتك الخفيفة المعتادة بقطعة فاكهة طازجة.", time: 5, difficulty: 'سهل' },
  { title: "اليوم 6: التركيز على البروتين", description: "تأكد أن كل وجبة اليوم تحتوي على مصدر بروتين صحي.", time: 10, difficulty: 'سهل' },
  { title: "اليوم 7: الحبوب الكاملة", description: "استخدم الخبز الأسمر أو الأرز البني بدلاً من الأبيض اليوم.", time: 5, difficulty: 'سهل' },
  { title: "اليوم 8: تقليل الملح", description: "تجنب إضافة الملح الزائد إلى وجباتك طوال اليوم.", time: 0, difficulty: 'سهل' },
  { title: "اليوم 9: فطور مغذٍ", description: "حضر فطوراً يحتوي على الشوفان أو البيض بدلاً من حبوب الإفطار المحلاة.", time: 15, difficulty: 'متوسط' },
  { title: "اليوم 10: وجبة منزلية", description: "حضر عشاءك بالكامل في المنزل باستخدام مكونات طازجة.", time: 40, difficulty: 'متوسط' },
  ...Array.from({ length: 20 }, (_, i) => ({
    title: `اليوم ${i + 11}: عادة صحية`,
    description: `سجل وجباتك اليوم وتأكد من شرب 2.5 لتر من الماء.`,
    time: 10,
    difficulty: 'متوسط' as any
  }))
];

const behaviorChallenges: Challenge[] = [
  { title: "اليوم 1: وعي التنفس", description: "اجلس بهدوء لمدة دقيقتين وركز فقط على تنفسك.", time: 5, difficulty: 'سهل' },
  { title: "اليوم 2: قائمة الامتنان", description: "اكتب 3 أشياء أنت ممتن لها اليوم.", time: 5, difficulty: 'سهل' },
  { title: "اليوم 3: ديتوكس رقمي", description: "لا تستخدم وسائل التواصل الاجتماعي قبل النوم بساعة.", time: 60, difficulty: 'سهل' },
  { title: "اليوم 4: جامل شخصاً ما", description: "قدم مجاملة صادقة لصديق أو غريب.", time: 2, difficulty: 'سهل' },
  { title: "اليوم 5: ترتيب المكان", description: "اقضِ 10 دقائق في ترتيب ركن صغير من غرفتك.", time: 10, difficulty: 'سهل' },
  { title: "اليوم 6: استيقاظ مبكر", description: "استيقظ 15 دقيقة أبكر من المعتاد واستمتع بالهدوء.", time: 15, difficulty: 'سهل' },
  { title: "اليوم 7: مراجعة الأسبوع", description: "اكتب لمدة 5 دقائق عن أفضل ما حدث لك هذا الأسبوع.", time: 10, difficulty: 'سهل' },
  { title: "اليوم 8: قل لا", description: "حدد مهمة واحدة تفعلها بدافع العادة ولا تحتاجها، وتوقف عنها.", time: 5, difficulty: 'سهل' },
  { title: "اليوم 9: لحظة تعلم", description: "اقرأ بضع صفحات من كتاب مفيد أو مقال ملهم.", time: 15, difficulty: 'متوسط' },
  { title: "اليوم 10: تحديد الأهداف", description: "اكتب 3 أهداف للشهر القادم والخطوة الأولى لكل منها.", time: 15, difficulty: 'متوسط' },
  ...Array.from({ length: 20 }, (_, i) => ({
    title: `اليوم ${i + 11}: تغيير العقلية`,
    description: `مارس التحدث الإيجابي مع النفس لمدة 5 دقائق وتخيل نجاحك.`,
    time: 5,
    difficulty: 'متوسط' as any
  }))
];

const studyChallenges: Challenge[] = [
  { title: "اليوم 1: تحديد الهدف", description: "حدد بالضبط ما تريد تعلمه هذا الشهر.", time: 10, difficulty: 'سهل' },
  { title: "اليوم 2: تقنية بومودورو", description: "ادرس موضوعاً لمدة 25 دقيقة، ثم خذ استراحة لمدة 5 دقائق.", time: 30, difficulty: 'سهل' },
  { title: "اليوم 3: الاستذكار النشط", description: "حاول كتابة كل ما تتذكره مما درسته بالأمس دون النظر للملاحظات.", time: 15, difficulty: 'سهل' },
  { title: "اليوم 4: مساحة دراسة نظيفة", description: "نظم مكتبك لزيادة التركيز وتقليل التشتت.", time: 10, difficulty: 'سهل' },
  { title: "اليوم 5: ملخص النقاط", description: "لخص موضوعاً معقداً في 3 نقاط رئيسية فقط.", time: 15, difficulty: 'سهل' },
  { title: "اليوم 6: طرح الأسئلة", description: "اكتب 5 أسئلة حول ما تدرسه حالياً.", time: 10, difficulty: 'سهل' },
  { title: "اليوم 7: يوم المراجعة", description: "اقضِ 20 دقيقة في مراجعة جميع ملاحظات الأسبوع.", time: 20, difficulty: 'سهل' },
  { title: "اليوم 8: التركيز العميق", description: "ادرس لمدة 40 دقيقة مع إغلاق كافة التنبيهات.", time: 40, difficulty: 'سهل' },
  { title: "اليوم 9: طريقة الشرح", description: "اشرح ما تعلمته لطالب خيالي لتعميق فهمك.", time: 15, difficulty: 'متوسط' },
  { title: "اليوم 10: البحث عن مصادر", description: "ابحث عن مصدر تعليمي جديد وعالي الجودة لموضوعك الحالي.", time: 20, difficulty: 'متوسط' },
  ...Array.from({ length: 20 }, (_, i) => ({
    title: `اليوم ${i + 11}: جلسة الإتقان`,
    description: `انخرط في ساعتين من العمل العميق مقسمة إلى 4 دورات بومودورو.`,
    time: 120,
    difficulty: 'صعب' as any
  }))
];

export const STATIC_CHALLENGES: Record<TrackKey, Challenge[]> = {
  Fitness: fitnessChallenges,
  Nutrition: nutritionChallenges,
  Behavior: behaviorChallenges,
  Study: studyChallenges,
};
