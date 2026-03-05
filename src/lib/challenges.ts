
export type TrackKey = 'Fitness' | 'Nutrition' | 'Behavior' | 'Study';

export interface Challenge {
  title: string;
  description: string;
  time: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const fitnessChallenges: Challenge[] = [
  { title: "Day 1: Start Small", description: "Do 10 air squats and 5 pushups. Form over speed!", time: 5, difficulty: 'Easy' },
  { title: "Day 2: Morning Stretch", description: "Hold a plank for 30 seconds and do 2 minutes of stretching.", time: 5, difficulty: 'Easy' },
  { title: "Day 3: Power Walk", description: "Take a 15-minute brisk walk outside.", time: 15, difficulty: 'Easy' },
  { title: "Day 4: Core Stability", description: "3 sets of 15-second side planks on each side.", time: 10, difficulty: 'Easy' },
  { title: "Day 5: Full Body Flow", description: "10 burpees and 20 mountain climbers. Take your time.", time: 10, difficulty: 'Easy' },
  { title: "Day 6: Lower Body Burn", description: "20 lunges (10 each leg) and 15 glute bridges.", time: 12, difficulty: 'Easy' },
  { title: "Day 7: Active Recovery", description: "Go for a light 20-minute walk or light stretching.", time: 20, difficulty: 'Easy' },
  { title: "Day 8: Pushup Mastery", description: "Try to do 3 sets of 8 pushups (knees are okay!).", time: 10, difficulty: 'Easy' },
  { title: "Day 9: Wall Sit Challenge", description: "Hold a wall sit for a total of 60 seconds (can be split).", time: 5, difficulty: 'Medium' },
  { title: "Day 10: Cardio Burst", description: "30 seconds of jumping jacks followed by 30 seconds of rest. Repeat 5 times.", time: 10, difficulty: 'Medium' },
  // ... (Repeating structure to reach 30)
  ...Array.from({ length: 20 }, (_, i) => ({
    title: `Day ${i + 11}: Progression Stage`,
    description: `Complete 4 sets of 15 bodyweight squats and 10 diamond pushups.`,
    time: 15 + i,
    difficulty: (i + 11) > 20 ? 'Hard' : 'Medium' as any
  }))
];

const nutritionChallenges: Challenge[] = [
  { title: "Day 1: Water First", description: "Drink a glass of water immediately after waking up.", time: 2, difficulty: 'Easy' },
  { title: "Day 2: No Sugary Drinks", description: "Replace all sodas or juices with water or tea today.", time: 0, difficulty: 'Easy' },
  { title: "Day 3: Green Plate", description: "Include at least one green vegetable in your lunch.", time: 10, difficulty: 'Easy' },
  { title: "Day 4: Mindful Eating", description: "Eat one meal without looking at your phone or TV.", time: 20, difficulty: 'Easy' },
  { title: "Day 5: Fruit Snack", description: "Swap your afternoon snack for a piece of whole fruit.", time: 5, difficulty: 'Easy' },
  { title: "Day 6: Protein Focus", description: "Ensure every meal today has a healthy source of protein.", time: 10, difficulty: 'Easy' },
  { title: "Day 7: Whole Grains", description: "Switch white bread/rice for whole grain options today.", time: 5, difficulty: 'Easy' },
  { title: "Day 8: Salt Reduction", description: "Avoid adding extra salt to your meals today.", time: 0, difficulty: 'Easy' },
  { title: "Day 9: Nutritious Breakfast", description: "Prepare a breakfast with oats or eggs instead of cereal.", time: 15, difficulty: 'Medium' },
  { title: "Day 10: Homemade Meal", description: "Prepare your dinner entirely from scratch using fresh ingredients.", time: 40, difficulty: 'Medium' },
  ...Array.from({ length: 20 }, (_, i) => ({
    title: `Day ${i + 11}: Healthy Habit`,
    description: `Log your meals today and ensure you reach your hydration goal of 2.5 Liters.`,
    time: 10,
    difficulty: 'Medium' as any
  }))
];

const behaviorChallenges: Challenge[] = [
  { title: "Day 1: Breath Awareness", description: "Sit quietly for 2 minutes and focus only on your breath.", time: 5, difficulty: 'Easy' },
  { title: "Day 2: Gratitude List", description: "Write down 3 things you are grateful for today.", time: 5, difficulty: 'Easy' },
  { title: "Day 3: Digital Detox", description: "No social media for 1 hour before sleep.", time: 60, difficulty: 'Easy' },
  { title: "Day 4: Compliment Someone", description: "Give a genuine compliment to a friend or stranger.", time: 2, difficulty: 'Easy' },
  { title: "Day 5: Tidy Space", description: "Spend 10 minutes decluttering one small area of your room.", time: 10, difficulty: 'Easy' },
  { title: "Day 6: Early Wake Up", description: "Wake up 15 minutes earlier than usual and enjoy the quiet.", time: 15, difficulty: 'Easy' },
  { title: "Day 7: Reflection", description: "Journal for 5 minutes about what went well this week.", time: 10, difficulty: 'Easy' },
  { title: "Day 8: Say No", description: "Identify one task you do out of habit but don't need to, and skip it.", time: 5, difficulty: 'Easy' },
  { title: "Day 9: Learning Moment", description: "Read a few pages of a non-fiction book or a helpful article.", time: 15, difficulty: 'Medium' },
  { title: "Day 10: Goal Setting", description: "Write down 3 goals for the next month and the first step for each.", time: 15, difficulty: 'Medium' },
  ...Array.from({ length: 20 }, (_, i) => ({
    title: `Day ${i + 11}: Mindset Shift`,
    description: `Practice positive self-talk for 5 minutes and visualize your success.`,
    time: 5,
    difficulty: 'Medium' as any
  }))
];

const studyChallenges: Challenge[] = [
  { title: "Day 1: Goal Definition", description: "Define exactly what you want to learn this month.", time: 10, difficulty: 'Easy' },
  { title: "Day 2: Pomodoro Intro", description: "Study one topic for 25 minutes, then take a 5-minute break.", time: 30, difficulty: 'Easy' },
  { title: "Day 3: Active Recall", description: "Try to write down everything you remember from yesterday's study.", time: 15, difficulty: 'Easy' },
  { title: "Day 4: Clean Workspace", description: "Organize your study desk for maximum focus.", time: 10, difficulty: 'Easy' },
  { title: "Day 5: Summary Notes", description: "Summarize a complex topic in only 3 bullet points.", time: 15, difficulty: 'Easy' },
  { title: "Day 6: Questioning", description: "Write 5 questions about what you are currently studying.", time: 10, difficulty: 'Easy' },
  { title: "Day 7: Review Day", description: "Spend 20 minutes reviewing all notes from the week.", time: 20, difficulty: 'Easy' },
  { title: "Day 8: Deep Focus", description: "Study for 40 minutes with zero notifications.", time: 40, difficulty: 'Easy' },
  { title: "Day 9: Teaching Method", description: "Explain what you learned to an imaginary student.", time: 15, difficulty: 'Medium' },
  { title: "Day 10: Resource Hunt", description: "Find one new high-quality source for your current topic.", time: 20, difficulty: 'Medium' },
  ...Array.from({ length: 20 }, (_, i) => ({
    title: `Day ${i + 11}: Master Session`,
    description: `Engage in 2 hours of deep work split into 4 Pomodoro cycles.`,
    time: 120,
    difficulty: 'Hard' as any
  }))
];

export const STATIC_CHALLENGES: Record<TrackKey, Challenge[]> = {
  Fitness: fitnessChallenges,
  Nutrition: nutritionChallenges,
  Behavior: behaviorChallenges,
  Study: studyChallenges,
};
