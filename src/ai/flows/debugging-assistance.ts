'use server';
/**
 * @fileOverview Debugging Assistance AI agent.
 *
 * - debugError - A function that analyzes error logs and provides debugging help.
 * - DebuggingInput - The input type for the debugError function.
 * - DebuggingOutput - The return type for the debugError function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const DebuggingInputSchema = z.object({
  errorLog: z.string().describe('The error log or message to be analyzed.'),
  context: z.string().optional().describe('Optional context about the code, environment, or what was being attempted when the error occurred.'),
  language: z.string().optional().describe('The programming language associated with the error (e.g., python, javascript).'),
});
export type DebuggingInput = z.infer<typeof DebuggingInputSchema>;

const DebuggingOutputSchema = z.object({
  potentialCauses: z.string().describe('A list of potential root causes for the error.'),
  suggestions: z.string().describe('Actionable suggestions and steps for debugging the error.'),
  suggestedFixes: z.string().optional().describe('Potential code fixes or approaches to resolve the error.'), // Added suggested fixes
  relevantResources: z.string().optional().describe('Links to relevant documentation or resources, if applicable.'),
});
export type DebuggingOutput = z.infer<typeof DebuggingOutputSchema>;

export async function debugError(input: DebuggingInput): Promise<DebuggingOutput> {
  return debugErrorFlow(input);
}

const debugErrorPrompt = ai.definePrompt({
  name: 'debugErrorPrompt',
  input: {
    schema: DebuggingInputSchema,
  },
  output: {
    schema: DebuggingOutputSchema,
  },
  prompt: `You are an expert software debugger. Analyze the following error log{{#if language}} from a {{language}} application{{/if}}.
  {{#if context}}Consider this context: {{{context}}}{{/if}}

  Error Log:
  \`\`\`
  {{{errorLog}}}
  \`\`\`

  Based on the error log and context:
  1. Identify the most likely potential root causes.
  2. Provide clear, actionable debugging steps or suggestions.
  3. Suggest potential code fixes or approaches to resolve the error, if applicable.
  4. If possible, suggest relevant documentation or online resources.

  Potential Causes:
  [List potential causes here]

  Debugging Suggestions:
  [Provide debugging steps here]

  Suggested Fixes:
  [Provide potential code fixes or approaches here, if applicable]

  Relevant Resources:
  [Provide links or resource suggestions here, if applicable]
  `,
});


const debugErrorFlow = ai.defineFlow<
  typeof DebuggingInputSchema,
  typeof DebuggingOutputSchema
>(
  {
    name: 'debugErrorFlow',
    inputSchema: DebuggingInputSchema,
    outputSchema: DebuggingOutputSchema,
  },
  async (input): Promise<DebuggingOutput> => {
    const {output} = await debugErrorPrompt(input);
     if (!output) {
        throw new Error("Failed to get debugging assistance from the AI model.");
    }
    return output;
  }
);

