import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { APP_TITLE } from "@/const";
import { Activity, Users, CheckCircle2, AlertCircle, TrendingUp, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export default function Observatory() {
  const { user, isAuthenticated } = useAuth();
  const { data: directives, isLoading: directivesLoading } = trpc.directive.list.useQuery();
  const { data: agents, isLoading: agentsLoading } = trpc.agent.list.useQuery();
  const { data: hitlRequests, isLoading: hitlLoading } = trpc.hitl.list.useQuery();
  const { data: principles } = trpc.observatory.principles.useQuery();
  const { data: goals } = trpc.observatory.goals.useQuery();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to {APP_TITLE}</CardTitle>
            <CardDescription>Please sign in to access the Observatory</CardDescription>
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

  const activeAgents = agents?.filter(a => a.status === "active") || [];
  const idleAgents = agents?.filter(a => a.status === "idle") || [];
  const busyAgents = agents?.filter(a => a.status === "busy") || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                🏢 The Observatory
              </h1>
              <p className="text-sm text-slate-400 mt-1">AI-Native Business Operating System</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-slate-400">Visionary</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/chat">💬 Chat with Manager</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Active Directives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{directives?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{agents?.length || 0}</div>
              <p className="text-xs text-slate-400 mt-1">
                {busyAgents.length} busy, {idleAgents.length} idle
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Needs Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">{hitlRequests?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Goals Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{goals?.length || 0}</div>
              <p className="text-xs text-slate-400 mt-1">active goals</p>
            </CardContent>
          </Card>
        </div>

        {/* HITL Requests */}
        {hitlRequests && hitlRequests.length > 0 && (
          <Card className="mb-8 bg-orange-900/20 border-orange-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                Needs Your Approval ({hitlRequests.length})
              </CardTitle>
              <CardDescription>Review and approve these requests from the Magentic Manager</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hitlRequests.map((request) => (
                <div key={request.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{request.title}</h4>
                      <p className="text-sm text-slate-400 mt-1">{request.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{request.requestType}</Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(request.createdAt!).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="default" asChild>
                        <Link href={`/hitl/${request.id}`}>Review</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Active Directives */}
        <Card className="mb-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Directives</CardTitle>
                <CardDescription>Strategic initiatives being executed by your AI team</CardDescription>
              </div>
              <Button asChild>
                <Link href="/directive/new">+ New Directive</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {directivesLoading ? (
              <p className="text-slate-400">Loading...</p>
            ) : directives && directives.length > 0 ? (
              <div className="space-y-4">
                {directives.map((directive) => (
                  <div key={directive.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{directive.title}</h4>
                        <p className="text-sm text-slate-400 mt-1">{directive.description}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant={directive.status === "active" ? "default" : "secondary"}>
                            {directive.status}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            Priority {directive.priority}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/directive/${directive.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No active directives yet</p>
                <Button asChild>
                  <Link href="/directive/new">Create Your First Directive</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Overview */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI Team ({agents?.length || 0} agents)</CardTitle>
                <CardDescription>Your autonomous workforce</CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href="/team">View Full Team</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {agentsLoading ? (
              <p className="text-slate-400">Loading...</p>
            ) : agents && agents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.slice(0, 6).map((agent) => (
                  <div key={agent.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{agent.instanceName}</h4>
                      <Badge
                        variant={
                          agent.status === "busy"
                            ? "default"
                            : agent.status === "active"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">
                      {agent.totalTasksCompleted} tasks completed
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Score: {agent.performanceScore}/100
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No agents hired yet</p>
                <p className="text-sm text-slate-500">
                  The Magentic Manager will hire agents as needed when you create directives
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

