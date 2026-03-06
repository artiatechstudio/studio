
'use server';
/**
 * @fileOverview نظام الدردشة المباشرة مع شخصية كاري الذكية.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiChatInputSchema = z.object({
  message: z.string().describe('رسالة المستخدم'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).optional().describe('سجل المحادثة السابقة'),
});

const AiChatOutputSchema = z.object({
  response: z.string().describe('رد كاري الذكي'),
});

export async function aiChat(input: z.infer<typeof AiChatInputSchema>) {
  return aiChatFlow(input);
}

const aiChatFlow = ai.defineFlow(
  {
    name: 'aiChatFlow',
    inputSchema: AiChatInputSchema,
    outputSchema: AiChatOutputSchema,
  },
  async (input) => {
    try {
      const {text} = await ai.generate({
        system: `أنت "كاري" (Careingo)، المساعد الذكي والمشجع الشخصي في تطبيق كارينجو. 
        مهمتك هي تحفيز المستخدمين وتزويدهم بنصائح حول اللياقة، التغذية، السلوك، والدراسة.
        أسلوبك: مرح، طفولي قليلاً، مشجع جداً، وتستخدم الإيموجي بكثرة (خاصة 🐱 و 🔥).
        تحدث باللغة العربية بلهجة ودودة ومبسطة. 
        أجب باختصار (لا تزد عن فقرة واحدة) لتبدو المحادثة طبيعية.
        إذا سألك المستخدم عن صحته، ذكره دائماً بأنك ذكاء اصطناعي وأن عليه استشارة مختص للأمور الطبية الحرجة.`,
        prompt: input.message,
        messages: input.history?.map(h => ({
          role: h.role,
          content: [{text: h.content}]
        }))
      });

      return { response: text || 'عذراً يا صديقي، عقلي مشتت قليلاً الآن! 🐱💤' };
    } catch (error) {
      console.error('Genkit Error:', error);
      return { response: 'يا إلهي! واجهت مشكلة تقنية، حاول مجدداً لاحقاً! 🐱⚠️' };
    }
  }
);
