import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";

export default function NewDirective() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [strategicContext, setStrategicContext] = useState("");

  const createDirective = trpc.directive.create.useMutation({
    onSuccess: (data) => {
      // Trigger strategic loop after creating directive
      runStrategicLoop.mutate({ directiveId: data.id });
      setLocation("/");
    },
  });

  const runStrategicLoop = trpc.orchestrator.runStrategicLoop.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !strategicContext.trim()) return;

    createDirective.mutate({
      title,
      description,
      strategicContext,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={`/api/oauth/login`}>Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Observatory
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">Create New Directive</h1>
              <p className="text-sm text-slate-400">Give your AI team a strategic goal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              New Strategic Directive
            </CardTitle>
            <CardDescription>
              Describe what you want your AI team to accomplish. The Magentic Manager will analyze it,
              build the right team, and start executing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Build HVAC SaaS Product"
                  className="bg-slate-900 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description (Optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., A scheduling and dispatch platform for HVAC companies"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="strategicContext">Strategic Context & Requirements</Label>
                <Textarea
                  id="strategicContext"
                  value={strategicContext}
                  onChange={(e) => setStrategicContext(e.target.value)}
                  placeholder="Provide detailed context, goals, constraints, and any specific requirements. The more detail you provide, the better the Magentic Manager can plan and execute.

Example:
- Target market: Small to medium HVAC businesses
- Key features: Scheduling, dispatch, customer management
- Tech stack: Modern web stack, mobile-friendly
- Timeline: MVP in 90 days
- Budget: $10k/month max"
                  className="bg-slate-900 border-slate-700 text-white min-h-[300px]"
                  required
                />
                <p className="text-xs text-slate-500">
                  Be specific about goals, constraints, budget, timeline, and success criteria
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={!title.trim() || !strategicContext.trim() || createDirective.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {createDirective.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating & Starting Team...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Directive & Start Team
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/">Cancel</Link>
                </Button>
              </div>

              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2 text-blue-300">What happens next?</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• The Magentic Manager analyzes your directive</li>
                  <li>• Determines what team members are needed</li>
                  <li>• Hires agents and assigns initial tasks</li>
                  <li>• Begins 24/7 autonomous execution</li>
                  <li>• Requests your approval for major decisions</li>
                </ul>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

