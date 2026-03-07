
export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: (userData: any) => boolean;
}

export const ALL_ACHIEVEMENTS: AchievementDefinition[] = [
  // --- أوسمة الإدارة ---
  { id: 'founder', name: 'المؤسس 🛡️', description: 'مدير النظام والمطور الأول.', icon: '🛡️', criteria: (u) => u.name === 'admin' },
  { id: 'premium', name: 'الملكي 👑', description: 'مشترك في عضوية بريميوم.', icon: '👑', criteria: (u) => u.isPremium === 1 },

  // --- أوسمة الحماسة (Streaks) ---
  { id: 's1', name: 'البداية 🐾', description: 'التزام ليوم واحد.', icon: '🐾', criteria: (u) => (u.streak || 0) >= 1 },
  { id: 's3', name: 'الحرارة 🔥', description: 'التزام لـ 3 أيام.', icon: '🔥', criteria: (u) => (u.streak || 0) >= 3 },
  { id: 's7', name: 'الأسبوعي ⚔️', description: 'التزام لأسبوع كامل.', icon: '⚔️', criteria: (u) => (u.streak || 0) >= 7 },
  { id: 's14', name: 'المثابر 🌋', description: 'التزام لـ 14 يوماً.', icon: '🌋', criteria: (u) => (u.streak || 0) >= 14 },
  { id: 's21', name: 'باني العادات 🏗️', description: 'التزام لـ 21 يوماً.', icon: '🏗️', criteria: (u) => (u.streak || 0) >= 21 },
  { id: 's30', name: 'الأسطورة 🏆', description: 'التزام لشهر كامل.', icon: '🏆', criteria: (u) => (u.streak || 0) >= 30 },
  { id: 's60', name: 'المنضبط 🗿', description: 'التزام لـ 60 يوماً.', icon: '🗿', criteria: (u) => (u.streak || 0) >= 60 },
  { id: 's90', name: 'الخالد ♾️', description: 'التزام لـ 90 يوماً.', icon: '♾️', criteria: (u) => (u.streak || 0) >= 90 },

  // --- أوسمة النقاط (Points) ---
  { id: 'p100', name: 'هاوٍ 🥉', description: 'جمع 100 نقطة.', icon: '🥉', criteria: (u) => (u.points || 0) >= 100 },
  { id: 'p500', name: 'ناشئ 🥈', description: 'جمع 500 نقطة.', icon: '🥈', criteria: (u) => (u.points || 0) >= 500 },
  { id: 'p1000', name: 'نادي الألف 🌟', description: 'جمع 1,000 نقطة.', icon: '🌟', criteria: (u) => (u.points || 0) >= 1000 },
  { id: 'p2500', name: 'محترف 🥇', description: 'جمع 2,500 نقطة.', icon: '🥇', criteria: (u) => (u.points || 0) >= 2500 },
  { id: 'p5000', name: 'خبير 💎', description: 'جمع 5,000 نقطة.', icon: '💎', criteria: (u) => (u.points || 0) >= 5000 },
  { id: 'p10000', name: 'مليونير 💰', description: 'جمع 10,000 نقطة.', icon: '💰', criteria: (u) => (u.points || 0) >= 10000 },
  { id: 'p25000', name: 'زعيم 🏛️', description: 'جمع 25,000 نقطة.', icon: '🏛️', criteria: (u) => (u.points || 0) >= 25000 },
  { id: 'p50000', name: 'سلطان 🕋', description: 'جمع 50,000 نقطة.', icon: '🕋', criteria: (u) => (u.points || 0) >= 50000 },

  // --- أوسمة اللياقة (Fitness) ---
  { id: 'f1', name: 'بداية القوة 🏋️', description: 'أول تمرين لياقة.', icon: '🏋️', criteria: (u) => (u.trackProgress?.Fitness?.completedStages?.length || 0) >= 1 },
  { id: 'f5', name: 'نشيط 🏃', description: '5 تمارين لياقة.', icon: '🏃', criteria: (u) => (u.trackProgress?.Fitness?.completedStages?.length || 0) >= 5 },
  { id: 'f10', name: 'رياضي 🥊', description: '10 تمارين لياقة.', icon: '🥊', criteria: (u) => (u.trackProgress?.Fitness?.completedStages?.length || 0) >= 10 },
  { id: 'f20', name: 'وحش 🦁', description: '20 تمرين لياقة.', icon: '🦁', criteria: (u) => (u.trackProgress?.Fitness?.completedStages?.length || 0) >= 20 },
  { id: 'f30', name: 'سيد اللياقة 🥇', description: 'ختم مسار اللياقة.', icon: '🥇', criteria: (u) => (u.trackProgress?.Fitness?.completedStages?.length || 0) >= 30 },

  // --- أوسمة التغذية (Nutrition) ---
  { id: 'n1', name: 'بداية صحية 🥦', description: 'أول وجبة صحية.', icon: '🥦', criteria: (u) => (u.trackProgress?.Nutrition?.completedStages?.length || 0) >= 1 },
  { id: 'n10', name: 'مهتم 🥗', description: '10 مهام تغذية.', icon: '🥗', criteria: (u) => (u.trackProgress?.Nutrition?.completedStages?.length || 0) >= 10 },
  { id: 'n30', name: 'خبير التغذية 🍎', description: 'ختم مسار التغذية.', icon: '🍎', criteria: (u) => (u.trackProgress?.Nutrition?.completedStages?.length || 0) >= 30 },

  // --- أوسمة السلوك (Behavior) ---
  { id: 'b1', name: 'تغيير هادئ 🧘', description: 'أول مهمة سلوكية.', icon: '🧘', criteria: (u) => (u.trackProgress?.Behavior?.completedStages?.length || 0) >= 1 },
  { id: 'b10', name: 'منضبط ⚖️', description: '10 مهام سلوكية.', icon: '⚖️', criteria: (u) => (u.trackProgress?.Behavior?.completedStages?.length || 0) >= 10 },
  { id: 'b30', name: 'سيد النفس 🧠', description: 'ختم مسار السلوك.', icon: '🧠', criteria: (u) => (u.trackProgress?.Behavior?.completedStages?.length || 0) >= 30 },

  // --- أوسمة الدراسة (Study) ---
  { id: 'st1', name: 'طالب علم 📖', description: 'أول مهمة دراسية.', icon: '📖', criteria: (u) => (u.trackProgress?.Study?.completedStages?.length || 0) >= 1 },
  { id: 'st10', name: 'باحث 🔭', description: '10 مهام دراسية.', icon: '🔭', criteria: (u) => (u.trackProgress?.Study?.completedStages?.length || 0) >= 10 },
  { id: 'st30', name: 'العالم 🎓', description: 'ختم مسار الدراسة.', icon: '🎓', criteria: (u) => (u.trackProgress?.Study?.completedStages?.length || 0) >= 30 },

  // --- أوسمة اجتماعية (Social) ---
  { id: 'l1', name: 'ملفت 💘', description: 'أول إعجاب لملفك.', icon: '💘', criteria: (u) => (u.likesCount || 0) >= 1 },
  { id: 'l10', name: 'محبوب ❤️', description: '10 إعجابات.', icon: '❤️', criteria: (u) => (u.likesCount || 0) >= 10 },
  { id: 'l50', name: 'نجم المجتمع ⭐', description: '50 إعجاباً.', icon: '⭐', criteria: (u) => (u.likesCount || 0) >= 50 },
  { id: 'l100', name: 'الأسطورة الحية 🌍', description: '100 إعجاب.', icon: '🌍', criteria: (u) => (u.likesCount || 0) >= 100 },

  // --- أوسمة التميز ---
  { id: 'grandmaster', name: 'العضو الماسي 💠', description: 'إكمال الـ 120 مرحلة بالكامل.', icon: '💠', criteria: (u) => {
    const tracks = ['Fitness', 'Nutrition', 'Behavior', 'Study'];
    return tracks.every(t => (u.trackProgress?.[t]?.completedStages?.length || 0) >= 30);
  }},
];

export function getEarnedBadges(userData: any): AchievementDefinition[] {
  if (!userData) return [];
  return ALL_ACHIEVEMENTS.filter(ach => ach.criteria(userData));
}
