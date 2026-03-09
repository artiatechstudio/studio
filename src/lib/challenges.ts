
export type TrackKey = 'Fitness' | 'Nutrition' | 'Behavior' | 'Study';

export interface Challenge {
  id?: string;
  title: string;
  description: string;
  time: number;
  difficulty: 'سهل' | 'متوسط' | 'صعب';
  points: number;
  type?: TrackKey; 
  isTimeLocked?: boolean;
}

const getPoints = (diff: 'سهل' | 'متوسط' | 'صعب') => {
  if (diff === 'سهل') return 50;
  if (diff === 'متوسط') return 70;
  return 100;
};

// التحديات العادية للمسارات الـ 30 (مختصرة للأداء)
export const STATIC_CHALLENGES: Record<TrackKey, Challenge[]> = {
  Fitness: Array.from({ length: 30 }, (_, i) => ({
    title: `اليوم ${i + 1}: مهمة اللياقة`,
    description: `تحدي رياضي متدرج لليوم رقم ${i + 1}. استمر في بناء قوتك!`,
    time: 10 + i,
    difficulty: i < 10 ? 'سهل' : i < 20 ? 'متوسط' : 'صعب',
    points: getPoints(i < 10 ? 'سهل' : i < 20 ? 'متوسط' : 'صعب'),
    isTimeLocked: i % 2 === 0
  })),
  Nutrition: Array.from({ length: 30 }, (_, i) => ({
    title: `اليوم ${i + 1}: مهمة التغذية`,
    description: `خطوة غذائية صحية لليوم رقم ${i + 1}. جسدك هو أمانتك.`,
    time: 5,
    difficulty: i < 10 ? 'سهل' : i < 20 ? 'متوسط' : 'صعب',
    points: getPoints(i < 10 ? 'سهل' : i < 20 ? 'متوسط' : 'صعب')
  })),
  Behavior: Array.from({ length: 30 }, (_, i) => ({
    title: `اليوم ${i + 1}: مهمة السلوك`,
    description: `تطوير عقلي وانضباط لليوم رقم ${i + 1}. غير عاداتك، تتغير حياتك.`,
    time: 15,
    difficulty: i < 10 ? 'سهل' : i < 20 ? 'متوسط' : 'صعب',
    points: getPoints(i < 10 ? 'سهل' : i < 20 ? 'متوسط' : 'صعب'),
    isTimeLocked: true
  })),
  Study: Array.from({ length: 30 }, (_, i) => ({
    title: `اليوم ${i + 1}: مهمة الدراسة`,
    description: `تعلم مهارة أو موضوع جديد لليوم رقم ${i + 1}. المعرفة هي القوة.`,
    time: 30,
    difficulty: i < 10 ? 'سهل' : i < 20 ? 'متوسط' : 'صعب',
    points: getPoints(i < 10 ? 'سهل' : i < 20 ? 'متوسط' : 'صعب'),
    isTimeLocked: true
  }))
};

// --- الـ 120 تحدي الإضافي لقسم الماستر ---
export const ADDITIONAL_MASTER_CHALLENGES: Challenge[] = [];

const poolTitles: Record<TrackKey, string[]> = {
  Fitness: ["ضغط مكثف", "سكوات عميق", "بلانك حديدي", "كاردبو حارق", "تسلق جبال", "بربي الأساطير", "توازن الساموراي", "قوة الجذع", "انفجار الطاقة", "تمارين مركبة"],
  Nutrition: ["ديتوكس الماء", "منع السكر", "وجبة البروتين", "الأكل الصامت", "تحضير مسبق", "خضروات قوس قزح", "بدائل صحية", "صيام متقطع", "مضغ بطيء", "توازن العناصر"],
  Behavior: ["تأمل عميق", "امتنان الفجر", "قوة الرفض", "ترتيب البيئة", "ديتوكس رقمي", "قراءة صامتة", "وعي النفس", "صبر وانتظار", "حديث إيجابي", "إدارة الوقت"],
  Study: ["تركيز بومودورو", "تلخيص ذكي", "خريطة ذهنية", "بحث معمق", "تعلم لغة", "كتابة إبداعية", "حل مشكلات", "تفكير نقدي", "مراجعة شاملة", "ابتكار فكرة"]
};

const types: TrackKey[] = ['Fitness', 'Nutrition', 'Behavior', 'Study'];
const diffs: ('سهل' | 'متوسط' | 'صعب')[] = ['سهل', 'متوسط', 'صعب'];

for (let i = 1; i <= 120; i++) {
  const type = types[Math.floor(Math.random() * types.length)];
  const diff = diffs[Math.floor(Math.random() * diffs.length)];
  const time = diff === 'سهل' ? 10 : diff === 'متوسط' ? 30 : 60;
  const titleBase = poolTitles[type][Math.floor(Math.random() * poolTitles[type].length)];
  
  ADDITIONAL_MASTER_CHALLENGES.push({
    id: `master-${i}`,
    type,
    difficulty: diff,
    points: getPoints(diff),
    time,
    title: `تحدي الماستر ${i}: ${titleBase}`,
    description: `هذه المهمة تتطلب تركيزاً كاملاً لمدة ${time} دقيقة في فئة الـ ${type === 'Fitness' ? 'لياقة' : type === 'Nutrition' ? 'تغذية' : type === 'Behavior' ? 'سلوك' : 'دراسة'}. هل أنت جاهز؟`,
    isTimeLocked: diff !== 'سهل'
  });
}

export const getMasterPool = (type: TrackKey, difficulty: string): Challenge[] => {
  return ADDITIONAL_MASTER_CHALLENGES.filter(c => c.type === type && c.difficulty === difficulty);
};
