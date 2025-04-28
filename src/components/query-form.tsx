"use client";

import type { FormEvent } from "react";
import React, { useState, useTransition, useMemo } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { naturalLanguageQuery, type NaturalLanguageQueryOutput } from "@/ai/flows/natural-language-query";
import { intelligentDataAnalysis, type IntelligentDataAnalysisOutput } from "@/ai/flows/intelligent-data-analysis";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Search, BarChart, Lightbulb, AlertTriangle, Activity, TableIcon } from "lucide-react"; // Added TableIcon
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart"; // Import chart components
import { Bar, XAxis, YAxis, CartesianGrid, BarChart as RechartsBarChart } from "recharts"; // Import recharts components

const formSchema = z.object({
  query: z.string().min(1, { message: "Please enter a query." }),
});

type FormData = z.infer<typeof formSchema>;

// Helper function to check if a string can be parsed as a number
const isNumeric = (str: string): boolean => {
  if (typeof str !== 'string') return false;
  return !isNaN(parseFloat(str)) && isFinite(Number(str));
};

export function QueryForm() {
  const [isQueryPending, startQueryTransition] = useTransition();
  const [isAnalysisPending, startAnalysisTransition] = useTransition();
  const [queryResult, setQueryResult] = useState<NaturalLanguageQueryOutput | null>(null);
  const [analysisResult, setAnalysisResult] = useState<IntelligentDataAnalysisOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  const onSubmit = (data: FormData) => {
    setQueryResult(null); // Clear previous results
    setAnalysisResult(null); // Clear previous analysis

    startQueryTransition(async () => {
      try {
        const result = await naturalLanguageQuery(data);
        setQueryResult(result);

        // Trigger analysis after getting query results
        if (result.databaseQuery && result.queryResult) { // Only analyze if query was successful
          startAnalysisTransition(async () => {
            try {
              // Pass the actual query string used, not just the generated one if needed
              // Assuming intelligentDataAnalysis needs the query string that *produced* the data
              const analysis = await intelligentDataAnalysis({ queryString: result.databaseQuery });
              setAnalysisResult(analysis);
            } catch (error) {
              console.error("Analysis Error:", error);
              toast({
                variant: "destructive",
                title: "Analysis Failed",
                description: "Could not perform intelligent data analysis.",
              });
              setAnalysisResult(null);
            }
          });
        } else {
          setAnalysisResult(null); // No analysis if query failed or returned no results
        }

      } catch (error) {
        console.error("Query Error:", error);
        toast({
          variant: "destructive",
          title: "Query Failed",
          description: `Could not process your query. Error: ${error instanceof Error ? error.message : String(error)}`,
        });
        setQueryResult(null);
        setAnalysisResult(null);
      }
    });
  };

  const isPending = isQueryPending || isAnalysisPending;

  // Prepare data and config for BarChart
  const { chartData, chartConfig, canDisplayChart } = useMemo(() => {
    if (!queryResult?.queryResult || queryResult.queryResult.rows.length === 0 || queryResult.queryResult.columns.length < 2) {
      return { chartData: [], chartConfig: {}, canDisplayChart: false };
    }

    const { columns, rows } = queryResult.queryResult;
    const labelColumnIndex = 0; // Assume first column is labels
    const numericColumnIndex = columns.findIndex((col, index) => index > 0 && rows.every(row => isNumeric(row[index])));

    if (numericColumnIndex === -1) {
      return { chartData: [], chartConfig: {}, canDisplayChart: false };
    }

    const labelKey = columns[labelColumnIndex];
    const valueKey = columns[numericColumnIndex];

    const data = rows.map(row => ({
      [labelKey]: row[labelColumnIndex],
      [valueKey]: parseFloat(row[numericColumnIndex]),
    }));

    const config: ChartConfig = {
      [valueKey]: {
        label: valueKey,
        color: "hsl(var(--primary))", // Use primary color from theme
      },
      [labelKey]: {
        label: labelKey,
      }
    };

    return { chartData: data, chartConfig: config, canDisplayChart: true };
  }, [queryResult]);

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border border-zinc-800 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-400 text-xl">
            <Search className="h-5 w-5 text-blue-300 animate-pulse" /> Natural Language Query
          </CardTitle>
          <CardDescription className="text-sm text-zinc-400">
            Ask questions about your test data, code performance, or logs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-zinc-200">Your Query</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Show me the test cases that failed most frequently in the last week"
                        className="resize-none min-h-[80px] bg-zinc-800 text-zinc-100 border-zinc-700 focus-visible:ring-blue-500 font-mono text-xs"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} size="sm" className="bg-blue-500 text-zinc-900 hover:bg-blue-400">
                {isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Search className="h-4 w-4" /> Query Data
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isQueryPending && (
        <Card className="bg-zinc-900 border border-zinc-800 shadow-sm animate-pulse">
          <CardContent className="p-4 flex items-center justify-center">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-400" />
            <p className="text-sm text-zinc-400">Fetching query results...</p>
          </CardContent>
        </Card>
      )}

      {queryResult && (
        <Card className="bg-zinc-900 border border-zinc-800 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-400 text-xl">
              <TableIcon className="h-5 w-5 text-blue-300" /> Query Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-yellow-400 flex items-center gap-1">
                <Lightbulb className="h-4 w-4 text-yellow-300" /> Insight:
              </h3>
              <p className="text-sm bg-zinc-800 p-3 rounded-md font-mono text-zinc-200 border border-zinc-700">
                {queryResult.insight}
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="sql-query">
                <AccordionTrigger className="text-xs font-medium py-2 text-zinc-300 hover:underline">View Generated SQL Query</AccordionTrigger>
                <AccordionContent>
                  <pre className="text-xs bg-zinc-800 p-3 rounded-md overflow-x-auto font-mono text-zinc-200 border border-zinc-700">
                    <code>{queryResult.databaseQuery || "No SQL query generated."}</code>
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {queryResult.queryResult && queryResult.queryResult.rows.length > 0 ? (
              <div className="space-y-4">
                {/* Table View */}
                <div className="overflow-x-auto">
                  <Table className="text-zinc-200">
                    <TableHeader>
                      <TableRow className="bg-zinc-800">
                        {queryResult.queryResult.columns.map((col) => (
                          <TableHead key={col} className="text-xs font-semibold uppercase">{col}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queryResult.queryResult.rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex} className={rowIndex % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/50"}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex} className="text-xs py-2 px-3 font-mono">{cell}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Chart View */}
                {canDisplayChart && chartData.length > 0 && (
                  <Card className="bg-zinc-900 border border-zinc-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-blue-400 text-lg">
                        <BarChart className="h-5 w-5 text-blue-300" /> Chart Visualization
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <RechartsBarChart accessibilityLayer data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid vertical={false} stroke="#444" />
                          <XAxis
                            dataKey={queryResult.queryResult.columns[0]} // Use first column name
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 15) + (value.length > 15 ? '...' : '')} // Truncate long labels
                            className="text-xs text-zinc-300"
                          />
                          <YAxis className="text-xs text-zinc-300" axisLine={false} tickLine={false} />
                          <ChartTooltip
                            cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                            content={<ChartTooltipContent className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-md p-2" />}
                          />
                          <Bar dataKey={queryResult.queryResult.columns[Object.keys(chartConfig).findIndex(key => key !== queryResult?.queryResult?.columns[0])]} // Get the value key dynamically
                            fill="var(--color-blue-500)"
                            radius={[4, 4, 0, 0]}
                          />
                        </RechartsBarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : queryResult.queryResult ? (
              <p className="text-sm text-zinc-400">No data returned for this query.</p>
            ) : (
              <p className="text-sm text-red-500">Could not execute the generated SQL query or no query was generated.</p>
            )}
          </CardContent>
        </Card>
      )}

      {isAnalysisPending && (
        <Card className="bg-zinc-900 border border-zinc-800 shadow-sm animate-pulse">
          <CardContent className="p-4 flex items-center justify-center">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-accent-foreground" />
            <p className="text-sm text-zinc-400">Analyzing data...</p>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <Card className="bg-zinc-900 border border-zinc-800 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-green-400 text-xl">
              <Activity className="h-5 w-5 text-green-300" /> Intelligent Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-yellow-400 flex items-center gap-1">
                <Lightbulb className="h-4 w-4 text-yellow-300" /> Summary:
              </h3>
              <p className="text-sm bg-zinc-800 p-3 rounded-md font-mono text-zinc-200 border border-zinc-700">
                {analysisResult.summary}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-red-400 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-red-300" /> Anomalies/Bottlenecks:
              </h3>
              <p className="text-sm bg-zinc-800 p-3 rounded-md font-mono text-zinc-200 border border-zinc-700">
                {analysisResult.anomalies}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-blue-400 flex items-center gap-1">
                <BarChart className="h-4 w-4 text-blue-300" /> Patterns:
              </h3>
              <p className="text-sm bg-zinc-800 p-3 rounded-md font-mono text-zinc-200 border border-zinc-700">
                {analysisResult.patterns}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}