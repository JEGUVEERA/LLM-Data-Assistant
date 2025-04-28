"use client";

import type { FormEvent } from "react";
import React, { useState, useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { debugError, type DebuggingOutput } from "@/ai/flows/debugging-assistance";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"; // Import FormDescription
import { Input } from "@/components/ui/input";
import { Loader2, Bug, Lightbulb, AlertCircle, ExternalLink, Wrench } from "lucide-react"; // Added Wrench icon
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  errorLog: z.string().min(10, { message: "Please enter the error log or message (at least 10 characters)." }),
  context: z.string().optional(),
  language: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function DebuggingForm() {
  const [isPending, startTransition] = useTransition();
  const [debuggingResult, setDebuggingResult] = useState<DebuggingOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      errorLog: "",
      context: "",
      language: "",
    },
  });

  const onSubmit = (data: FormData) => {
    setDebuggingResult(null); // Clear previous result

    startTransition(async () => {
      try {
        const result = await debugError(data);
        setDebuggingResult(result);
      } catch (error) {
        console.error("Debugging Error:", error);
        toast({
          variant: "destructive",
          title: "Debugging Failed",
          description: `Could not analyze the error. Error: ${error instanceof Error ? error.message : String(error)}`,
        });
        setDebuggingResult(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-primary text-xl">
            <Bug className="h-5 w-5" /> Debugging Assistance
          </CardTitle>
          <CardDescription className="text-sm">
            Paste an error log or message below to get potential causes, debugging suggestions, and potential fixes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="errorLog"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Error Log / Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`Traceback (most recent call last):\n  File "main.py", line 10, in <module>\n    result = 10 / 0\nZeroDivisionError: division by zero`}
                        className="resize-y min-h-[150px] font-mono text-xs"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Context (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Running user authentication test in staging environment after deploying v1.2."
                        className="resize-y min-h-[60px]"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Provide details about the code, environment, or action being performed.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Language (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., python, javascript, java"
                        className="h-9"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} size="sm">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Error...
                  </>
                ) : (
                  <>
                    <Bug className="mr-2 h-4 w-4" /> Get Debugging Help
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isPending && (
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-center">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing error log...</p>
          </CardContent>
        </Card>
      )}

      {debuggingResult && (
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-primary text-xl">
              <Lightbulb className="h-5 w-5 text-accent" /> Debugging Assistance Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-1">
                <h3 className="font-semibold text-sm flex items-center gap-1"><AlertCircle className="h-4 w-4 text-destructive"/> Potential Causes:</h3>
                <div className="text-sm bg-secondary p-3 rounded-md whitespace-pre-wrap">{debuggingResult.potentialCauses}</div>
             </div>
             <div className="space-y-1">
                <h3 className="font-semibold text-sm flex items-center gap-1"><Bug className="h-4 w-4 text-primary"/> Debugging Suggestions:</h3>
                <div className="text-sm bg-secondary p-3 rounded-md whitespace-pre-wrap">{debuggingResult.suggestions}</div>
             </div>
             {debuggingResult.suggestedFixes && ( // Display suggested fixes
                 <div className="space-y-1">
                    <h3 className="font-semibold text-sm flex items-center gap-1"><Wrench className="h-4 w-4 text-accent"/> Suggested Fixes:</h3>
                    <div className="text-sm bg-secondary p-3 rounded-md whitespace-pre-wrap">{debuggingResult.suggestedFixes}</div>
                 </div>
             )}
             {debuggingResult.relevantResources && (
                 <div className="space-y-1">
                    <h3 className="font-semibold text-sm flex items-center gap-1"><ExternalLink className="h-4 w-4 text-muted-foreground"/> Relevant Resources:</h3>
                    <div className="text-sm bg-secondary p-3 rounded-md whitespace-pre-wrap">{debuggingResult.relevantResources}</div>
                 </div>
             )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
