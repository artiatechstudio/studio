export type TrackType = 'Fitness' | 'Nutrition' | 'Behavior' | 'Study';

export interface UserProgress {
  id: string;
  name: string;
  avatar: string;
  streak: number;
  rank: number;
  badges: string[];
  trackProgress: Record<TrackType, {
    currentStage: number;
    completedStages: number[];
    lastCompletedDate: string | null;
  }>;
}

export const MOCK_USER: UserProgress = {
  id: 'user-123',
  name: 'Alex Rivera',
  avatar: 'https://picsum.photos/seed/user123/150/150',
  streak: 5,
  rank: 1240,
  badges: ['Early Bird', 'Consistency King', 'Fitness Starter'],
  trackProgress: {
    Fitness: {
      currentStage: 4,
      completedStages: [1, 2, 3],
      lastCompletedDate: '2023-10-26',
    },
    Nutrition: {
      currentStage: 2,
      completedStages: [1],
      lastCompletedDate: '2023-10-25',
    },
    Behavior: {
      currentStage: 1,
      completedStages: [],
      lastCompletedDate: null,
    },
    Study: {
      currentStage: 8,
      completedStages: [1, 2, 3, 4, 5, 6, 7],
      lastCompletedDate: '2023-10-27',
    },
  }
};

export const TRACK_DETAILS = {
  Fitness: {
    color: '#3D4A99',
    icon: 'Dumbbell',
    description: 'Build strength and endurance through daily personalized routines.'
  },
  Nutrition: {
    color: '#A833DB',
    icon: 'Apple',
    description: 'Fuel your body with better choices and balanced meals.'
  },
  Behavior: {
    color: '#3D4A99',
    icon: 'Brain',
    description: 'Mindset shifts and habits that lead to a better version of you.'
  },
  Study: {
    color: '#A833DB',
    icon: 'BookOpen',
    description: 'Sharpen your focus and master new skills daily.'
  }
};