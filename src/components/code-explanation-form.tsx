"use client";

import type { FormEvent } from "react";
import React, { useState, useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { explainCode, type CodeExplanationOutput } from "@/ai/flows/code-explanation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"; // Import FormDescription
import { Input } from "@/components/ui/input"; // Import Input
import { Loader2, FileCode, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  code: z.string().min(10, { message: "Please enter a code snippet (at least 10 characters)." }),
  language: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function CodeExplanationForm() {
  const [isPending, startTransition] = useTransition();
  const [explanationResult, setExplanationResult] = useState<CodeExplanationOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      language: "",
    },
  });

  const onSubmit = (data: FormData) => {
    setExplanationResult(null); // Clear previous result

    startTransition(async () => {
      try {
        const result = await explainCode(data);
        setExplanationResult(result);
      } catch (error) {
        console.error("Explanation Error:", error);
        toast({
          variant: "destructive",
          title: "Explanation Failed",
          description: `Could not explain the code. Error: ${error instanceof Error ? error.message : String(error)}`,
        });
        setExplanationResult(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-primary text-xl">
            <FileCode className="h-5 w-5" /> Code Explanation
          </CardTitle>
          <CardDescription className="text-sm">
            Paste a code snippet below and get a clear explanation of what it does.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Code Snippet</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`function greet(name) {\n  console.log("Hello, " + name + "!");\n}`}
                        className="resize-y min-h-[150px] font-mono text-xs" // Monospace font for code
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
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Language (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., python, javascript, java"
                        className="h-9" // Slightly smaller input
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                     <FormDescription className="text-xs">Providing the language helps improve accuracy.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} size="sm">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileCode className="mr-2 h-4 w-4" /> Explain Code
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
            <p className="text-sm text-muted-foreground">Generating explanation...</p>
          </CardContent>
        </Card>
      )}

      {explanationResult && (
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-primary text-xl">
              <Lightbulb className="h-5 w-5 text-accent" /> Explanation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
             <div className="text-sm bg-secondary p-3 rounded-md whitespace-pre-wrap"> {/* Preserve whitespace */}
               {explanationResult.explanation}
             </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
