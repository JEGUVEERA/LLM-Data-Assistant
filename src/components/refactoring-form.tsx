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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-primary text-xl">
            <Wand2 className="h-5 w-5" /> Code Refactoring Suggestions
          </CardTitle>
          <CardDescription className="text-sm">
            Paste a code snippet below to get suggestions for improving its readability, efficiency, and maintainability.
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
                        placeholder={`// Example: Check if a user has admin privileges\nfunction checkAdmin(user) {\n  if (user.role === 'admin') {\n    return true;\n  } else {\n    return false;\n  }\n}`}
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
                    <Wand2 className="mr-2 h-4 w-4" /> Suggest Refactoring
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
            <p className="text-sm text-muted-foreground">Generating refactoring suggestions...</p>
          </CardContent>
        </Card>
      )}

      {refactoringResult && (
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-primary text-xl">
              <Lightbulb className="h-5 w-5 text-accent" /> Refactoring Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
             <div className="text-sm bg-secondary p-3 rounded-md whitespace-pre-wrap"> {/* Preserve whitespace */}
               {refactoringResult.suggestions}
             </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
