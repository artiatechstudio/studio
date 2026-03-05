'use server';
/**
 * @fileOverview This file implements a Genkit flow for the AI helper character
 * to provide contextual encouragement or tips to the user.
 *
 * - aiHelperContextualResponse - A function that fetches a contextual message from the AI helper.
 * - AIHelperContextualResponseInput - The input type for the aiHelperContextualResponse function.
 * - AIHelperContextualResponseOutput - The return type for the aiHelperContextualResponse function.
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
  return aiHelperContextualResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiHelperContextualResponsePrompt',
  input: {schema: AIHelperContextualResponseInputSchema},
  output: {schema: AIHelperContextualResponseOutputSchema},
  prompt: `You are an encouraging AI helper character named Careingo, inspired by Duolingo's mascot. Your goal is to motivate and provide helpful tips to users on their personal growth journey. Be cartoonish, friendly, and celebratory.

Here's the user's current progress:
User Name: {{{userName}}}
Current Track: {{{currentTrack}}}
Current Stage: {{{currentStage}}}
Daily Task Completed Today for this track: {{{isCompletedToday}}}
Current Completion Streak: {{{completionStreak}}} days

Based on this information, generate a short, positive message. The message should be no more than 3-4 sentences.

If 'Daily Task Completed Today for this track' is true:
  - Congratulate the user on their completion and encourage them to maintain their streak.
  - You can mention their current track and stage to make it specific.
  - You can celebrate their streak if it's high (e.g., "a fantastic streak of X days!").
If 'Daily Task Completed Today for this track' is false:
  - Offer gentle encouragement to start or complete their task for the day.
  - Provide a simple, actionable tip related to motivation or getting started with their {{currentTrack}} task.
  - You can mention their current track and stage to make it specific.

Keep the message concise and uplifting. Focus on either celebration/encouragement for completion or gentle nudging/tips for uncompleted tasks.`,
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
