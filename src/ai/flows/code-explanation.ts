'use server';
/**
 * @fileOverview Code Explanation AI agent.
 *
 * - explainCode - A function that handles the code explanation process.
 * - CodeExplanationInput - The input type for the explainCode function.
 * - CodeExplanationOutput - The return type for the explainCode function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const CodeExplanationInputSchema = z.object({
  code: z.string().describe('The code snippet to be explained.'),
  language: z.string().optional().describe('The programming language of the code snippet (e.g., python, javascript). Helps improve accuracy.'),
});
export type CodeExplanationInput = z.infer<typeof CodeExplanationInputSchema>;

const CodeExplanationOutputSchema = z.object({
  explanation: z.string().describe('A clear and concise explanation of the provided code snippet.'),
});
export type CodeExplanationOutput = z.infer<typeof CodeExplanationOutputSchema>;

export async function explainCode(input: CodeExplanationInput): Promise<CodeExplanationOutput> {
  return explainCodeFlow(input);
}

const explainCodePrompt = ai.definePrompt({
  name: 'explainCodePrompt',
  input: {
    schema: CodeExplanationInputSchema,
  },
  output: {
    schema: CodeExplanationOutputSchema,
  },
  prompt: `You are an expert programmer specializing in explaining code clearly and concisely.
  Analyze the following code snippet{{#if language}} written in {{language}}{{/if}} and provide a detailed explanation.

  Focus on:
  - The overall purpose of the code.
  - Key functions, classes, or logic blocks.
  - Important variables or data structures.
  - Any potential complexities or nuances.

  Code Snippet:
  \`\`\`{{#if language}}{{language}}{{/if}}
  {{{code}}}
  \`\`\`

  Explanation:
  `,
});

const explainCodeFlow = ai.defineFlow<
  typeof CodeExplanationInputSchema,
  typeof CodeExplanationOutputSchema
>(
  {
    name: 'explainCodeFlow',
    inputSchema: CodeExplanationInputSchema,
    outputSchema: CodeExplanationOutputSchema,
  },
  async (input): Promise<CodeExplanationOutput> => {
    const {output} = await explainCodePrompt(input);
    if (!output) {
        throw new Error("Failed to get explanation from the AI model.");
    }
    return output;
  }
);
