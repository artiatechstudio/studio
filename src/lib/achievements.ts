
export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: (userData: any) => boolean;
}

export const ALL_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'founder',
    name: 'المطور المؤسس 🛡️',
    description: 'وسام خاص بمدير النظام والمطور الأول.',
    icon: '🛡️',
    criteria: (u) => u.name === 'admin'
  },
  {
    id: 'newbie',
    name: 'عضو جديد 🐱',
    description: 'مرحباً بك في مجتمع كاري للنمو.',
    icon: '🐱',
    criteria: (u) => !!u.registrationDate
  },
  {
    id: 'streak_3',
    name: 'بداية الحماسة 🔥',
    description: 'الحفاظ على الحماسة لمدة 3 أيام متتالية.',
    icon: '🔥',
    criteria: (u) => (u.streak || 0) >= 3
  },
  {
    id: 'streak_7',
    name: 'شعلة لا تنطفئ 🌋',
    description: 'الالتزام التام لمدة أسبوع كامل.',
    icon: '🌋',
    criteria: (u) => (u.streak || 0) >= 7
  },
  {
    id: 'streak_30',
    name: 'ملك الالتزام 👑',
    description: 'إنجاز أسطوري بالالتزام لمدة 30 يوماً.',
    icon: '👑',
    criteria: (u) => (u.streak || 0) >= 30
  },
  {
    id: 'points_500',
    name: 'جامع النقاط 💰',
    description: 'جمع أول 500 نقطة في مسيرتك.',
    icon: '💰',
    criteria: (u) => (u.points || 0) >= 500
  },
  {
    id: 'points_2000',
    name: 'ثروة المعرفة 💎',
    description: 'تخطي حاجز الـ 2000 نقطة.',
    icon: '💎',
    criteria: (u) => (u.points || 0) >= 2000
  },
  {
    id: 'points_10000',
    name: 'ملياردير كاري 🪙',
    description: 'أحد أغنى الأعضاء بالنقاط (10,000+).',
    icon: '🪙',
    criteria: (u) => (u.points || 0) >= 10000
  },
  {
    id: 'fitness_10',
    name: 'رياضي ناشئ 🏋️',
    description: 'إكمال 10 مراحل في مسار اللياقة.',
    icon: '🏋️',
    criteria: (u) => (u.trackProgress?.Fitness?.completedStages?.length || 0) >= 10
  },
  {
    id: 'fitness_30',
    name: 'وحش الصالة 👹',
    description: 'إكمال مسار اللياقة بالكامل (30 يوماً).',
    icon: '👹',
    criteria: (u) => (u.trackProgress?.Fitness?.completedStages?.length || 0) >= 30
  },
  {
    id: 'study_10',
    name: 'مثقف واعد 📖',
    description: 'إكمال 10 مراحل في مسار الدراسة.',
    icon: '📖',
    criteria: (u) => (u.trackProgress?.Study?.completedStages?.length || 0) >= 10
  },
  {
    id: 'study_30',
    name: 'عالم موسوعي 🎓',
    description: 'إكمال مسار الدراسة بالكامل.',
    icon: '🎓',
    criteria: (u) => (u.trackProgress?.Study?.completedStages?.length || 0) >= 30
  },
  {
    id: 'nutrition_10',
    name: 'مهتم بالصحة 🥦',
    description: 'إكمال 10 مراحل في مسار التغذية.',
    icon: '🥦',
    criteria: (u) => (u.trackProgress?.Nutrition?.completedStages?.length || 0) >= 10
  },
  {
    id: 'nutrition_30',
    name: 'خبير التغذية 🍎',
    description: 'إكمال مسار التغذية بالكامل.',
    icon: '🍎',
    criteria: (u) => (u.trackProgress?.Nutrition?.completedStages?.length || 0) >= 30
  },
  {
    id: 'behavior_10',
    name: 'بداية التغيير 🌱',
    description: 'إكمال 10 مراحل في مسار السلوك.',
    icon: '🌱',
    criteria: (u) => (u.trackProgress?.Behavior?.completedStages?.length || 0) >= 10
  },
  {
    id: 'behavior_30',
    name: 'سيد الأخلاق 🧘',
    description: 'إكمال مسار السلوك بالكامل.',
    icon: '🧘',
    criteria: (u) => (u.trackProgress?.Behavior?.completedStages?.length || 0) >= 30
  },
  {
    id: 'social_10',
    name: 'محبوب المجتمع ❤️',
    description: 'الحصول على 10 إعجابات لملفك الشخصي.',
    icon: '❤️',
    criteria: (u) => (u.likesCount || 0) >= 10
  },
  {
    id: 'social_50',
    name: 'نجم ساطع ⭐',
    description: 'أحد أكثر الشخصيات إلهاماً (50 إعجاب).',
    icon: '⭐',
    criteria: (u) => (u.likesCount || 0) >= 50
  },
  {
    id: 'premium_club',
    name: 'مشترك ملكي 👑',
    description: 'عضو في نادي البريميوم الحصري.',
    icon: '👑',
    criteria: (u) => u.isPremium === 1
  },
  {
    id: 'grand_master',
    name: 'العضو الماسي 💠',
    description: 'إكمال كافة المسارات الـ 120 (إنجاز أسطوري).',
    icon: '💠',
    criteria: (u) => {
      const tracks = ['Fitness', 'Nutrition', 'Behavior', 'Study'];
      return tracks.every(t => (u.trackProgress?.[t]?.completedStages?.length || 0) >= 30);
    }
  }
];

/**
 * دالة تفحص الإنجازات وتعيد قائمة بأسماء الأوسمة التي يستحقها المستخدم
 */
export function getEarnedBadges(userData: any): string[] {
  if (!userData) return [];
  return ALL_ACHIEVEMENTS
    .filter(ach => ach.criteria(userData))
    .map(ach => ach.name);
}
