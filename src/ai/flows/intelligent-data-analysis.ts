'use server';
/**
 * @fileOverview Intelligent Data Analysis AI agent.
 *
 * - intelligentDataAnalysis - A function that handles the data analysis process.
 * - IntelligentDataAnalysisInput - The input type for the intelligentDataAnalysis function.
 * - IntelligentDataAnalysisOutput - The return type for the intelligentDataAnalysis function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {executeQuery, type QueryResult} from '@/services/database'; // Use type import

const IntelligentDataAnalysisInputSchema = z.object({
  queryString: z
    .string()
    .describe('The query string used to fetch the data for analysis.'), // Clarify description
});
export type IntelligentDataAnalysisInput = z.infer<typeof IntelligentDataAnalysisInputSchema>;

// Define schema for the output expected from the analysis prompt
const AnalysisOutputSchema = z.object({
    summary: z.string().describe('A summary of the analysis results.'),
    anomalies: z.string().describe('Identified anomalies and potential bottlenecks.'),
    patterns: z.string().describe('Identified patterns in the test results.'),
});

// This is the final output schema for the flow/function
const IntelligentDataAnalysisOutputSchema = AnalysisOutputSchema; // Can be the same if no further processing
export type IntelligentDataAnalysisOutput = z.infer<typeof IntelligentDataAnalysisOutputSchema>;

export async function intelligentDataAnalysis(input: IntelligentDataAnalysisInput): Promise<IntelligentDataAnalysisOutput> {
  return intelligentDataAnalysisFlow(input);
}

const analysisPrompt = ai.definePrompt({
  name: 'intelligentDataAnalysisPrompt',
  input: {
    schema: z.object({
      queryResult: z.object({
        columns: z.array(z.string()),
        rows: z.array(z.array(z.string()))
      }).describe('The query result to analyze, with columns and rows.'),
    }),
  },
  output: {
    schema: AnalysisOutputSchema, // Use the defined analysis output schema
  },
  prompt: `You are an AI expert specializing in analyzing software test result data.
  Analyze the following test result data. Focus on identifying significant patterns, anomalies (like sudden failure spikes or performance dips), and potential bottlenecks revealed by the data.
  Provide a concise summary of your findings, clearly listing the identified anomalies/bottlenecks and patterns.

  Test Result Data:
  Columns: {{queryResult.columns}}
  Rows:
  {{#each queryResult.rows}}
    {{this}}
  {{/each}}

  Analysis:
  Summary: [Provide a brief overall summary]
  Anomalies/Bottlenecks: [List identified anomalies/bottlenecks]
  Patterns: [List identified patterns or trends]`,
});


const intelligentDataAnalysisFlow = ai.defineFlow<
  typeof IntelligentDataAnalysisInputSchema,
  typeof IntelligentDataAnalysisOutputSchema
>({
  name: 'intelligentDataAnalysisFlow',
  inputSchema: IntelligentDataAnalysisInputSchema,
  outputSchema: IntelligentDataAnalysisOutputSchema,
}, async (input): Promise<IntelligentDataAnalysisOutput> => { // Explicit return type

  // Execute the query provided in the input to get the data for analysis
  const queryResult: QueryResult = await executeQuery({queryString: input.queryString});

  // Pass the fetched data to the analysis prompt
  const { output } = await analysisPrompt({ queryResult });

  if (!output) {
    throw new Error("Failed to get analysis from the AI model.");
  }

  // Return the direct output from the analysis prompt
  return output;
});
