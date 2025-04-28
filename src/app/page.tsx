import { QueryForm } from "@/components/query-form";
import { CodeExplanationForm } from "@/components/code-explanation-form";
import { DebuggingForm } from "@/components/debugging-form";
import { RefactoringForm } from "@/components/refactoring-form"; // Import new component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Search, Bug, FileCode, Wand2 } from "lucide-react"; // Import icons

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24 bg-secondary">
      <div className="container mx-auto max-w-4xl space-y-8">
         <div className="text-center space-y-2">
           <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-2">
             <Code className="h-8 w-8"/> {/* Example icon */}
             TAP DataSage
           </h1>
           <p className="text-muted-foreground">Your Intelligent Assistant for Data Query, Code Analysis & Debugging</p>
         </div>

         <Tabs defaultValue="query" className="w-full">
           <TabsList className="grid w-full grid-cols-4"> {/* Updated grid columns */}
             <TabsTrigger value="query">
                <Search className="mr-2 h-4 w-4" /> Query Data
             </TabsTrigger>
             <TabsTrigger value="explain">
                <FileCode className="mr-2 h-4 w-4" /> Explain Code
             </TabsTrigger>
              <TabsTrigger value="refactor"> {/* New Trigger */}
                <Wand2 className="mr-2 h-4 w-4" /> Refactor Code
             </TabsTrigger>
             <TabsTrigger value="debug">
               <Bug className="mr-2 h-4 w-4" /> Debug Error
             </TabsTrigger>
           </TabsList>
           <TabsContent value="query" className="mt-6">
             <QueryForm />
           </TabsContent>
           <TabsContent value="explain" className="mt-6">
             <CodeExplanationForm />
           </TabsContent>
           <TabsContent value="refactor" className="mt-6"> {/* New Content */}
             <RefactoringForm />
           </TabsContent>
           <TabsContent value="debug" className="mt-6">
             <DebuggingForm />
           </TabsContent>
         </Tabs>
      </div>
    </main>
  );
}
