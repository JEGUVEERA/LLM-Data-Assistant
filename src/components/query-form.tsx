"use client";

import type { FormEvent } from "react";
import React, { useState, useTransition } from "react";
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
import { Loader2, Search, BarChart, Lightbulb, AlertTriangle, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  query: z.string().min(1, { message: "Please enter a query." }),
});

type FormData = z.infer<typeof formSchema>;

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
        if (result.databaseQuery) {
           startAnalysisTransition(async () => {
            try {
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
        }

      } catch (error) {
        console.error("Query Error:", error);
        toast({
          variant: "destructive",
          title: "Query Failed",
          description: "Could not process your query.",
        });
        setQueryResult(null);
        setAnalysisResult(null);
      }
    });
  };

  const isPending = isQueryPending || isAnalysisPending;

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Search className="h-6 w-6" /> Natural Language Query
          </CardTitle>
          <CardDescription>
            Ask questions about your test data, code performance metrics, or application logs in plain English.
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
                    <FormLabel>Your Query</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Show me the test cases that failed most frequently in the last week"
                        className="resize-none"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" /> Query Data
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isQueryPending && (
        <Card className="shadow-md">
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Fetching query results...</p>
          </CardContent>
        </Card>
      )}

      {queryResult && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <BarChart className="h-6 w-6" /> Query Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><Lightbulb className="h-5 w-5 text-accent" /> Actionable Insight:</h3>
                <p className="text-sm bg-secondary p-3 rounded-md">{queryResult.insight}</p>
             </div>
             <Accordion type="single" collapsible className="w-full">
               <AccordionItem value="sql-query">
                 <AccordionTrigger className="text-sm font-medium">View Generated SQL Query</AccordionTrigger>
                 <AccordionContent>
                   <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto"><code>{queryResult.databaseQuery}</code></pre>
                 </AccordionContent>
               </AccordionItem>
             </Accordion>

            {queryResult.queryResult && queryResult.queryResult.rows.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {queryResult.queryResult.columns.map((col) => (
                        <TableHead key={col}>{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queryResult.queryResult.rows.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : queryResult.queryResult ? (
              <p className="text-muted-foreground">No data returned for this query.</p>
            ): (
              <p className="text-destructive">Could not execute the generated SQL query.</p>
            )}
          </CardContent>
        </Card>
      )}

        {isAnalysisPending && (
            <Card className="shadow-md">
                <CardContent className="p-6 flex items-center justify-center">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin text-accent" />
                    <p className="text-muted-foreground">Analyzing data...</p>
                </CardContent>
            </Card>
        )}

      {analysisResult && (
        <Card className="shadow-lg bg-accent/10 border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Activity className="h-6 w-6" /> Intelligent Data Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2"><Lightbulb className="h-5 w-5 text-accent"/> Summary:</h3>
              <p className="text-sm bg-secondary p-3 rounded-md">{analysisResult.summary}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive"/> Anomalies & Bottlenecks:</h3>
              <p className="text-sm bg-secondary p-3 rounded-md">{analysisResult.anomalies}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2"><BarChart className="h-5 w-5 text-primary"/> Patterns:</h3>
              <p className="text-sm bg-secondary p-3 rounded-md">{analysisResult.patterns}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
