'use server';
/**
 * @fileOverview Code Refactoring Suggestions AI agent.
 *
 * - suggestRefactoring - A function that analyzes code and suggests refactoring improvements.
 * - RefactoringInput - The input type for the suggestRefactoring function.
 * - RefactoringOutput - The return type for the suggestRefactoring function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const RefactoringInputSchema = z.object({
  code: z.string().describe('The code snippet to be analyzed for refactoring.'),
  language: z.string().optional().describe('The programming language of the code snippet (e.g., python, javascript). Helps improve accuracy.'),
});
export type RefactoringInput = z.infer<typeof RefactoringInputSchema>;

const RefactoringOutputSchema = z.object({
  suggestions: z.string().describe('Suggestions for refactoring the code to improve readability, efficiency, or maintainability, along with explanations.'),
});
export type RefactoringOutput = z.infer<typeof RefactoringOutputSchema>;

export async function suggestRefactoring(input: RefactoringInput): Promise<RefactoringOutput> {
  return refactoringFlow(input);
}

const refactoringPrompt = ai.definePrompt({
  name: 'refactoringPrompt',
  input: {
    schema: RefactoringInputSchema,
  },
  output: {
    schema: RefactoringOutputSchema,
  },
  prompt: `You are an expert programmer specializing in code refactoring and best practices.
  Analyze the following code snippet{{#if language}} written in {{language}}{{/if}} and suggest improvements.

  Focus on enhancing:
  - Readability (e.g., naming conventions, comments, structure)
  - Efficiency (e.g., performance optimizations, algorithm choices)
  - Maintainability (e.g., modularity, reducing complexity, adherence to principles like DRY)
  - Testability

  For each suggestion, provide a brief explanation of the rationale behind it. If possible, show small code examples of the suggested change.

  Code Snippet:
  \`\`\`{{#if language}}{{language}}{{/if}}
  {{{code}}}
  \`\`\`

  Refactoring Suggestions:
  `,
});

const refactoringFlow = ai.defineFlow<
  typeof RefactoringInputSchema,
  typeof RefactoringOutputSchema
>(
  {
    name: 'refactoringFlow',
    inputSchema: RefactoringInputSchema,
    outputSchema: RefactoringOutputSchema,
  },
  async (input): Promise<RefactoringOutput> => {
    const {output} = await refactoringPrompt(input);
    if (!output) {
        throw new Error("Failed to get refactoring suggestions from the AI model.");
    }
    return output;
  }
);
