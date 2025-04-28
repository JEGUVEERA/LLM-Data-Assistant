import { QueryForm } from "@/components/query-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code } from "lucide-react"; // Import an appropriate icon

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24 bg-secondary">
      <div className="container mx-auto max-w-4xl space-y-8">
         <div className="text-center space-y-2">
           <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-2">
             <Code className="h-8 w-8"/> {/* Example icon */}
             TAP DataSage
           </h1>
           <p className="text-muted-foreground">Your LLM-Based Data Assistant for AI & Coding</p>
         </div>
         <QueryForm />
      </div>
    </main>
  );
}
