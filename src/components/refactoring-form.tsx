"use client";

import type { FormEvent } from "react";
import React, { useState, useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { suggestRefactoring, type RefactoringOutput } from "@/ai/flows/refactoring-suggestions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"; // Import FormDescription
import { Input } from "@/components/ui/input";
import { Loader2, Wand2, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  code: z.string().min(20, { message: "Please enter a code snippet (at least 20 characters) for refactoring analysis." }),
  language: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function RefactoringForm() {
  const [isPending, startTransition] = useTransition();
  const [refactoringResult, setRefactoringResult] = useState<RefactoringOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      language: "",
    },
  });

  const onSubmit = (data: FormData) => {
    setRefactoringResult(null); // Clear previous result

    startTransition(async () => {
      try {
        const result = await suggestRefactoring(data);
        setRefactoringResult(result);
      } catch (error) {
        console.error("Refactoring Error:", error);
        toast({
          variant: "destructive",
          title: "Refactoring Failed",
          description: `Could not suggest refactoring for the code. Error: ${error instanceof Error ? error.message : String(error)}`,
        });
        setRefactoringResult(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border border-zinc-800 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-purple-400 text-xl">
            <Wand2 className="h-5 w-5 text-purple-300 animate-pulse" /> Code Refactoring Suggestions
          </CardTitle>
          <CardDescription className="text-sm text-zinc-400">
            Paste a code snippet below to get suggestions for improving its readability, efficiency, and maintainability.
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
                        placeholder={`// Example: Check if a user has admin privileges\nfunction checkAdmin(user) {\n  if (user.role === 'admin') {\n    return true;\n  } else {\n    return false;\n  }\n}`}
                        className="resize-y min-h-[150px] font-mono text-xs bg-zinc-800 text-zinc-100 border-zinc-700 focus-visible:ring-purple-500" // Modern input style
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
                        className="h-9 bg-zinc-800 text-zinc-100 border-zinc-700 focus-visible:ring-purple-500 text-sm" // Modern input style
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-zinc-500">Providing the language helps improve accuracy.</FormDescription>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} size="sm" className="bg-purple-500 text-zinc-900 hover:bg-purple-400">
                {isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Wand2 className="h-4 w-4" /> Suggest Refactoring
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
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-purple-400" />
            <p className="text-sm text-zinc-400">Generating refactoring suggestions...</p>
          </CardContent>
        </Card>
      )}

      {refactoringResult && (
        <Card className="bg-zinc-900 border border-zinc-800 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-purple-400 text-xl">
              <Lightbulb className="h-5 w-5 text-yellow-400" /> Refactoring Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm bg-zinc-800 p-4 rounded-md whitespace-pre-wrap font-mono text-zinc-200 border border-zinc-700">
              {refactoringResult.suggestions}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}