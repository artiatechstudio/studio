
'use server';
/**
 * @fileOverview This file implements a Genkit flow for the AI helper character
 * to provide contextual encouragement or tips to the user.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIHelperContextualResponseInputSchema = z.object({
  userName: z.string().describe('The name of the user.'),
  currentTrack: z
    .enum(['Fitness', 'Nutrition', 'Behavior', 'Study'])
    .describe('The current progression track the user is active in.'),
  currentStage: z
    .number()
    .int()
    .min(1)
    .max(30)
    .describe('The current stage within the active track.'),
  isCompletedToday: z
    .boolean()
    .describe('Indicates if the user has completed their daily task for the current track today.'),
  completionStreak: z
    .number()
    .int()
    .min(0)
    .describe('The user\u0027s current daily task completion streak.'),
});
export type AIHelperContextualResponseInput = z.infer<
  typeof AIHelperContextualResponseInputSchema
>;

const AIHelperContextualResponseOutputSchema = z.object({
  message: z.string().describe('A motivational or tip message from the AI helper.'),
});
export type AIHelperContextualResponseOutput = z.infer<
  typeof AIHelperContextualResponseOutputSchema
>;

export async function aiHelperContextualResponse(
  input: AIHelperContextualResponseInput
): Promise<AIHelperContextualResponseOutput> {
  try {
    const {output} = await aiHelperContextualResponseFlow(input);
    return output!;
  } catch (error) {
    console.error('AI Helper Flow Error (likely API key issue):', error);
    // Fallback static message to prevent UI crash
    return {
      message: `أهلاً بك يا ${input.userName}! كاري فخور بتقدمك في مسار ${input.currentTrack}. استمر في السعي نحو أهدافك، فكل خطوة صغيرة تصنع فارقاً كبيراً! 🐱🔥`
    };
  }
}

const prompt = ai.definePrompt({
  name: 'aiHelperContextualResponsePrompt',
  input: {schema: AIHelperContextualResponseInputSchema},
  output: {schema: AIHelperContextualResponseOutputSchema},
  prompt: `You are an encouraging AI helper character named Careingo, inspired by Duolingo's mascot. Your goal is to motivate and provide helpful tips to users on their personal growth journey. Be cartoonish, friendly, and celebratory. Use Arabic language.

Here's the user's current progress:
User Name: {{{userName}}}
Current Track: {{{currentTrack}}}
Current Stage: {{{currentStage}}}
Daily Task Completed Today for this track: {{{isCompletedToday}}}
Current Completion Streak: {{{completionStreak}}} days

Based on this information, generate a short, positive message in Arabic. The message should be no more than 3 sentences.`,
});

const aiHelperContextualResponseFlow = ai.defineFlow(
  {
    name: 'aiHelperContextualResponseFlow',
    inputSchema: AIHelperContextualResponseInputSchema,
    outputSchema: AIHelperContextualResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
