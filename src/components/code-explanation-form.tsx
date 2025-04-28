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
      <Card className="bg-zinc-900 border border-zinc-800 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-teal-400 text-xl">
            <FileCode className="h-5 w-5 text-teal-300 animate-pulse" /> Code Explanation
          </CardTitle>
          <CardDescription className="text-sm text-zinc-400">
            Paste a code snippet below and get a clear explanation of what it does.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-zinc-200">Code Snippet</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`function greet(name) {\n  console.log("Hello, " + name + "!");\n}`}
                        className="resize-y min-h-[150px] font-mono text-xs bg-zinc-800 text-zinc-100 border-zinc-700 focus-visible:ring-teal-500" // Modern input style
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-zinc-200">Language (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., python, javascript, java"
                        className="h-9 bg-zinc-800 text-zinc-100 border-zinc-700 focus-visible:ring-teal-500 text-sm" // Modern input style
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-zinc-500">Providing the language helps improve accuracy.</FormDescription>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} size="sm" className="bg-teal-500 text-zinc-900 hover:bg-teal-400">
                {isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <FileCode className="h-4 w-4" /> Explain Code
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isPending && (
        <Card className="bg-zinc-900 border border-zinc-800 shadow-sm animate-pulse">
          <CardContent className="p-4 flex items-center justify-center">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-teal-400" />
            <p className="text-sm text-zinc-400">Generating explanation...</p>
          </CardContent>
        </Card>
      )}

      {explanationResult && (
        <Card className="bg-zinc-900 border border-zinc-800 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-teal-400 text-xl">
              <Lightbulb className="h-5 w-5 text-yellow-400" /> Explanation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm bg-zinc-800 p-4 rounded-md whitespace-pre-wrap font-mono text-zinc-200 border border-zinc-700"> {/* Modern output style */}
              {explanationResult.explanation}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}