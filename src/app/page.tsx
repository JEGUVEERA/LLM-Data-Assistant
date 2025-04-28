import { QueryForm } from "@/components/query-form";
import { CodeExplanationForm } from "@/components/code-explanation-form";
import { DebuggingForm } from "@/components/debugging-form";
import { RefactoringForm } from "@/components/refactoring-form"; // Import new component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Search, Bug, FileCode, Wand2 } from "lucide-react"; // Import icons

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24 bg-zinc-900 text-zinc-100">
      <div className="container mx-auto max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-teal-400 flex items-center justify-center gap-2">
            <Code className="h-8 w-8 text-teal-300 animate-pulse" /> {/* Animated icon */}
            TAP DataSage
          </h1>
          <p className="text-zinc-400">Your Intelligent Assistant for Data Query, Code Analysis & Debugging</p>
        </div>

        <Tabs defaultValue="query" className="w-full rounded-md border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm">
          <TabsList className="grid w-full grid-cols-4 rounded-t-md bg-zinc-900/80 backdrop-blur-sm"> {/* Glassmorphism */}
            <TabsTrigger value="query" className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-teal-500 data-[state=active]:text-zinc-900 transition-colors duration-200">
              <Search className="mr-2 h-4 w-4 text-teal-300" /> Query Data
            </TabsTrigger>
            <TabsTrigger value="explain" className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-teal-500 data-[state=active]:text-zinc-900 transition-colors duration-200">
              <FileCode className="mr-2 h-4 w-4 text-teal-300" /> Explain Code
            </TabsTrigger>
            <TabsTrigger value="refactor" className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-teal-500 data-[state=active]:text-zinc-900 transition-colors duration-200"> {/* New Trigger */}
              <Wand2 className="mr-2 h-4 w-4 text-teal-300" /> Refactor Code
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex items-center justify-center gap-2 py-3 data-[state=active]:bg-teal-500 data-[state=active]:text-zinc-900 transition-colors duration-200">
              <Bug className="mr-2 h-4 w-4 text-teal-300" /> Debug Error
            </TabsTrigger>
          </TabsList>
          <TabsContent value="query" className="mt-6 p-4">
            <div className="rounded-md border border-zinc-700 bg-zinc-800 p-6 shadow-md"> {/* Card-like container */}
              <QueryForm />
            </div>
          </TabsContent>
          <TabsContent value="explain" className="mt-6 p-4">
            <div className="rounded-md border border-zinc-700 bg-zinc-800 p-6 shadow-md">
              <CodeExplanationForm />
            </div>
          </TabsContent>
          <TabsContent value="refactor" className="mt-6 p-4"> {/* New Content */}
            <div className="rounded-md border border-zinc-700 bg-zinc-800 p-6 shadow-md">
              <RefactoringForm />
            </div>
          </TabsContent>
          <TabsContent value="debug" className="mt-6 p-4">
            <div className="rounded-md border border-zinc-700 bg-zinc-800 p-6 shadow-md">
              <DebuggingForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}