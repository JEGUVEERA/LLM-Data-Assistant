'use server';
/**
 * @fileOverview A natural language query interface for test data, code metrics, and application logs.
 *
 * - naturalLanguageQuery - A function that processes natural language queries and translates them into actionable insights or database queries.
 * - NaturalLanguageQueryInput - The input type for the naturalLanguageQuery function.
 * - NaturalLanguageQueryOutput - The return type for the naturalLanguageQuery function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {executeQuery, type Query, type QueryResult} from '@/services/database'; // Use type imports

const NaturalLanguageQueryInputSchema = z.object({
  query: z.string().describe('The natural language query from the user.'),
});
export type NaturalLanguageQueryInput = z.infer<typeof NaturalLanguageQueryInputSchema>;

// Define schema for database query results explicitly
const QueryResultSchema = z.object({
    columns: z.array(z.string()),
    rows: z.array(z.array(z.string())),
});

const NaturalLanguageQueryOutputSchema = z.object({
  insight: z.string().describe('Actionable insight derived from the query.'),
  databaseQuery: z.string().describe('The SQL query translated from the natural language query.'),
  queryResult: QueryResultSchema.optional().describe('The query result from the database, if any'), // Make optional
});
export type NaturalLanguageQueryOutput = z.infer<typeof NaturalLanguageQueryOutputSchema>;

export async function naturalLanguageQuery(input: NaturalLanguageQueryInput): Promise<NaturalLanguageQueryOutput> {
  return naturalLanguageQueryFlow(input);
}

const translateQueryPrompt = ai.definePrompt({
  name: 'translateQueryPrompt',
  input: {
    schema: z.object({
      query: z.string().describe('The natural language query from the user.'),
    }),
  },
  output: {
    // Output schema should only contain what the prompt is expected to generate
    schema: z.object({
      insight: z.string().describe('Actionable insight derived from the query.'),
      databaseQuery: z.string().describe('The SQL query translated from the natural language query.'),
    }),
  },
  prompt: `You are an AI assistant expert in translating natural language queries into SQL and deriving actionable insights.
  User Query: {{{query}}}

  1. Translate the query into a standard SQL query for a database containing test data, code metrics, and logs.
  2. Provide a concise actionable insight based on the user's request.

  SQL Query:
  Insight:`,
});

const naturalLanguageQueryFlow = ai.defineFlow<
  typeof NaturalLanguageQueryInputSchema,
  typeof NaturalLanguageQueryOutputSchema // Use the correct output schema here
>(
  {
    name: 'naturalLanguageQueryFlow',
    inputSchema: NaturalLanguageQueryInputSchema,
    outputSchema: NaturalLanguageQueryOutputSchema, // Ensure this matches the defined output schema
  },
  async (input): Promise<NaturalLanguageQueryOutput> => { // Explicit return type
    const { output } = await translateQueryPrompt(input);

    if (!output) {
        throw new Error("Failed to get response from translateQueryPrompt");
    }

    let queryResult: QueryResult | undefined = undefined;
    try {
      // Ensure databaseQuery is not empty before executing
      if (output.databaseQuery.trim()) {
        queryResult = await executeQuery({ queryString: output.databaseQuery });
      } else {
         console.warn("Generated database query is empty, skipping execution.");
      }
    } catch (e) {
      console.error("Error executing query:", e);
      // Optionally, re-throw or handle the error specifically
      // For now, we'll return without queryResult
    }

    return {
      insight: output.insight,
      databaseQuery: output.databaseQuery,
      queryResult: queryResult, // This will be undefined if execution failed or query was empty
    };
  }
);
