
export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: (userData: any) => boolean;
}

export const ALL_ACHIEVEMENTS: AchievementDefinition[] = [
  // --- أوسمة الإدارة ---
  { id: 'founder', name: 'المؤسس 🛡️', description: 'مدير النظام والمطور الأول لـ Careingo.', icon: '🛡️', criteria: (u) => u.name === 'admin' },
  { id: 'premium', name: 'الملكي 👑', description: 'مشترك في عضوية بريميوم الفاخرة.', icon: '👑', criteria: (u) => u.isPremium === 1 },

  // --- أوسمة الحماسة (Streaks) ---
  { id: 's1', name: 'البداية 🐾', description: 'التزام ليوم واحد في رحلة النمو.', icon: '🐾', criteria: (u) => (u.streak || 0) >= 1 },
  { id: 's3', name: 'الحرارة 🔥', description: 'التزام لـ 3 أيام متتالية.', icon: '🔥', criteria: (u) => (u.streak || 0) >= 3 },
  { id: 's7', name: 'المحارب الأسبوعي ⚔️', description: 'التزام لأسبوع كامل بتركيز عالٍ.', icon: '⚔️', criteria: (u) => (u.streak || 0) >= 7 },
  { id: 's14', name: 'بركان الانضباط 🌋', description: 'التزام لـ 14 يوماً دون انقطاع.', icon: '🌋', criteria: (u) => (u.streak || 0) >= 14 },
  { id: 's21', name: 'باني العادات 🏗️', description: 'تجاوزت الـ 21 يوماً؛ لقد بنيت عادة حقيقية.', icon: '🏗️', criteria: (u) => (u.streak || 0) >= 21 },
  { id: 's30', name: 'الأسطورة الشهرية 🏆', description: 'التزام لشهر كامل؛ أنت فخر لـ Careingo.', icon: '🏆', criteria: (u) => (u.streak || 0) >= 30 },
  { id: 's60', name: 'أسطورة الانضباط 🗿', description: 'التزام لـ 60 يوماً؛ إرادتك من حديد.', icon: '🗿', criteria: (u) => (u.streak || 0) >= 60 },
  { id: 's90', name: 'الروح الأبدية ♾️', description: 'التزام لـ 90 يوماً؛ لقد أصبحت رمزاً للنمو.', icon: '♾️', criteria: (u) => (u.streak || 0) >= 90 },

  // --- أوسمة النقاط (Points) ---
  { id: 'p100', name: 'هاوٍ ناشئ 🥉', description: 'جمعت أول 100 نقطة في رصيدك.', icon: '🥉', criteria: (u) => (u.points || 0) >= 100 },
  { id: 'p500', name: 'المكافح المتميز 🥈', description: 'تجاوزت حاجز الـ 500 نقطة.', icon: '🥈', criteria: (u) => (u.points || 0) >= 500 },
  { id: 'p1000', name: 'نادي الألف 🌟', description: 'دخلت نادي الألفية الأول للنمو.', icon: '🌟', criteria: (u) => (u.points || 0) >= 1000 },
  { id: 'p2500', name: 'البطل الذهبي 🥇', description: 'جمعت 2,500 نقطة؛ أنت في القمة.', icon: '🥇', criteria: (u) => (u.points || 0) >= 2500 },
  { id: 'p5000', name: 'النخبة الماسية 💎', description: 'وصلت لـ 5,000 نقطة بجهد جبار.', icon: '💎', criteria: (u) => (u.points || 0) >= 5000 },
  { id: 'p10000', name: 'المليونير الصحي 💰', description: 'رصيد نقاطك تجاوز الـ 10,000.', icon: '💰', criteria: (u) => (u.points || 0) >= 10000 },
  { id: 'p25000', name: 'زعيم المجتمع 🏛️', description: 'جمعت 25,000 نقطة؛ هيبتك تملأ المكان.', icon: '🏛️', criteria: (u) => (u.points || 0) >= 25000 },
  { id: 'p50000', name: 'سلطان كاري 🕋', description: '50,000 نقطة؛ لقد تربعت على العرش.', icon: '🕋', criteria: (u) => (u.points || 0) >= 50000 },
  { id: 'p100000', name: 'أسطورة الـ 100 ألف 👑', description: 'إنجاز تاريخي لا يتكرر كثيراً.', icon: '👑', criteria: (u) => (u.points || 0) >= 100000 },

  // --- أوسمة اللياقة (Fitness) ---
  { id: 'f1', name: 'بداية القوة 🏋️', description: 'أتممت أول تمرين رياضي.', icon: '🏋️', criteria: (u) => (u.trackProgress?.Fitness?.completedStages?.length || 0) >= 1 },
  { id: 'f10', name: 'عاشق الحديد 🥊', description: 'أنهيت 10 مستويات في مسار اللياقة.', icon: '🥊', criteria: (u) => (u.trackProgress?.Fitness?.completedStages?.length || 0) >= 10 },
  { id: 'f20', name: 'وحش الصالة 🦁', description: '20 يوماً من التمارين الشاقة.', icon: '🦁', criteria: (u) => (u.trackProgress?.Fitness?.completedStages?.length || 0) >= 20 },
  { id: 'f30', name: 'سيد اللياقة 🏆', description: 'ختمت مسار اللياقة بالكامل (30 يوماً).', icon: '🏆', criteria: (u) => (u.trackProgress?.Fitness?.completedStages?.length || 0) >= 30 },

  // --- أوسمة التغذية (Nutrition) ---
  { id: 'n1', name: 'خطوة خضراء 🥦', description: 'أول مهمة تغذية صحية بنجاح.', icon: '🥦', criteria: (u) => (u.trackProgress?.Nutrition?.completedStages?.length || 0) >= 1 },
  { id: 'n15', name: 'مهندس الطاقة 🥗', description: '15 يوماً من الغذاء الصحي المتوازن.', icon: '🥗', criteria: (u) => (u.trackProgress?.Nutrition?.completedStages?.length || 0) >= 15 },
  { id: 'n30', name: 'بروفيسور التغذية 🍎', description: 'ختمت مسار التغذية؛ جسدك يشكرك.', icon: '🍎', criteria: (u) => (u.trackProgress?.Nutrition?.completedStages?.length || 0) >= 30 },

  // --- أوسمة السلوك (Behavior) ---
  { id: 'b1', name: 'هدوء النفس 🧘', description: 'أول مهمة سلوكية لتطوير عقلك.', icon: '🧘', criteria: (u) => (u.trackProgress?.Behavior?.completedStages?.length || 0) >= 1 },
  { id: 'b15', name: 'سيد التركيز ⚖️', description: 'أنهيت نصف مسار السلوك بنجاح.', icon: '⚖️', criteria: (u) => (u.trackProgress?.Behavior?.completedStages?.length || 0) >= 15 },
  { id: 'b30', name: 'العقلية الحديدية 🧠', description: 'ختمت مسار السلوك؛ لقد غيرت حياتك.', icon: '🧠', criteria: (u) => (u.trackProgress?.Behavior?.completedStages?.length || 0) >= 30 },

  // --- أوسمة الدراسة (Study) ---
  { id: 'st1', name: 'طالب العلم 📖', description: 'أول مهمة دراسية في سجل إنجازاتك.', icon: '📖', criteria: (u) => (u.trackProgress?.Study?.completedStages?.length || 0) >= 1 },
  { id: 'st15', name: 'باحث مجتهد 🔭', description: 'أتممت 15 يوماً من التعلم المستمر.', icon: '🔭', criteria: (u) => (u.trackProgress?.Study?.completedStages?.length || 0) >= 15 },
  { id: 'st30', name: 'العالم الكبير 🎓', description: 'ختمت مسار الدراسة؛ المعرفة سلاحك.', icon: '🎓', criteria: (u) => (u.trackProgress?.Study?.completedStages?.length || 0) >= 30 },

  // --- أوسمة اجتماعية (Social) ---
  { id: 'l1', name: 'صديق المجتمع 💘', description: 'حصلت على أول إعجاب لملفك.', icon: '💘', criteria: (u) => (u.likesCount || 0) >= 1 },
  { id: 'l10', name: 'الشخصية المحبوبة ❤️', description: '10 أشخاص أعجبوا بملفك الشخصي.', icon: '❤️', criteria: (u) => (u.likesCount || 0) >= 10 },
  { id: 'l50', name: 'نجم المتصدرين ⭐', description: 'وصلت لـ 50 إعجاباً؛ أنت ملهم.', icon: '⭐', criteria: (u) => (u.likesCount || 0) >= 50 },
  { id: 'l100', name: 'الأسطورة الحية 🌍', description: '100 إعجاب؛ الجميع يعرف اسمك.', icon: '🌍', criteria: (u) => (u.likesCount || 0) >= 100 },

  // --- أوسمة التميز الكبرى ---
  { id: 'grandmaster', name: 'العضو الماسي 💠', description: 'إكمال الـ 120 مرحلة بالكامل؛ إنجاز تاريخي.', icon: '💠', criteria: (u) => {
    const tracks = ['Fitness', 'Nutrition', 'Behavior', 'Study'];
    return tracks.every(t => (u.trackProgress?.[t]?.completedStages?.length || 0) >= 30);
  }},
  { id: 'earlybird', name: 'فارس الفجر 🌅', description: 'إنجاز مهمة قبل الساعة 6 صباحاً.', icon: '🌅', criteria: (u) => u.hasEarlyBirdAchievement === true },
];

export function getEarnedBadges(userData: any): AchievementDefinition[] {
  if (!userData) return [];
  return ALL_ACHIEVEMENTS.filter(ach => ach.criteria(userData));
}
