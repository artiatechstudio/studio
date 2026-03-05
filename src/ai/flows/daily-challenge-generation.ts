'use server';
/**
 * @fileOverview Generates a unique daily challenge for a chosen track (Nutrition, Behavior, or Study).
 *
 * - dailyChallengeGeneration - A function that handles the daily challenge generation process.
 * - DailyChallengeGenerationInput - The input type for the dailyChallengeGeneration function.
 * - DailyChallengeGenerationOutput - The return type for the dailyChallengeGeneration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyChallengeGenerationInputSchema = z.object({
  track: z.enum(['Nutrition', 'Behavior', 'Study']).describe('The track for which to generate a daily challenge.'),
  currentDay: z
    .number()
    .min(1)
    .max(30)
    .describe('The current day of the 30-day progression track (1-30).'),
  userPreferences: z
    .string()
    .optional()
    .describe(
      'Optional user preferences or specific goals to tailor the challenge (e.g., "vegetarian," "focus on mindfulness").'
    ),
  completedChallenges: z
    .array(z.string())
    .optional()
    .describe('A list of challenges the user has already completed to avoid repetition.'),
});
export type DailyChallengeGenerationInput = z.infer<typeof DailyChallengeGenerationInputSchema>;

const DailyChallengeGenerationOutputSchema = z.object({
  challengeTitle: z.string().describe('A concise title for the daily challenge.'),
  challengeDescription: z.string().describe('A detailed description of the daily task or activity.'),
  challengeType: z
    .enum(['Nutrition', 'Behavior', 'Study'])
    .describe('The category of the generated challenge, matching the input track.'),
  difficulty: z
    .enum(['Easy', 'Medium', 'Hard'])
    .describe('The estimated difficulty level of the challenge.'),
  estimatedCompletionTimeMinutes: z
    .number()
    .describe('The estimated time in minutes required to complete the challenge.'),
});
export type DailyChallengeGenerationOutput = z.infer<typeof DailyChallengeGenerationOutputSchema>;

export async function dailyChallengeGeneration(
  input: DailyChallengeGenerationInput
): Promise<DailyChallengeGenerationOutput> {
  return dailyChallengeGenerationFlow(input);
}

const dailyChallengePrompt = ai.definePrompt({
  name: 'dailyChallengePrompt',
  input: {schema: DailyChallengeGenerationInputSchema},
  output: {schema: DailyChallengeGenerationOutputSchema},
  prompt: `You are an expert in creating engaging and progressive daily challenges for personal development tracks.

Generate a unique daily challenge for the "{{{track}}}" track, considering it's day {{{currentDay}}} of a 30-day progression.
Ensure the challenge is fresh and distinct from any previously completed challenges provided.

Instructions:
- Create a challenge that is appropriate for day {{{currentDay}}}, potentially building on previous concepts or introducing new ones.
- If user preferences are provided, try to incorporate them into the challenge.
- The challenge must be unique and not repeat any of the challenges in the 'completedChallenges' list.
- Provide a title, a detailed description, the challenge type (must be 'Nutrition', 'Behavior', or 'Study'), a difficulty level, and an estimated completion time in minutes.

Track: {{{track}}}
Current Day: {{{currentDay}}}
{{#if userPreferences}}User Preferences: {{{userPreferences}}}{{/if}}
{{#if completedChallenges}}
Completed Challenges:
{{#each completedChallenges}}- {{{this}}}
{{/each}}
{{/if}}

Generate the challenge in the following JSON format:`,
});

const dailyChallengeGenerationFlow = ai.defineFlow(
  {
    name: 'dailyChallengeGenerationFlow',
    inputSchema: DailyChallengeGenerationInputSchema,
    outputSchema: DailyChallengeGenerationOutputSchema,
  },
  async input => {
    const {output} = await dailyChallengePrompt(input);
    if (!output) {
      throw new Error('Failed to generate daily challenge.');
    }
    return output;
  }
);
